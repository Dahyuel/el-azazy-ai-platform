# ============================================================
# Consolidated reassignment — inboxes 11, 16, 19, 12
# Runs every minute via cron
# ============================================================

ACCOUNT_ID = 2

# ── Inbox 11: balanced reassign, 5-open cap ──
BALANCED_INBOX_IDS   = [11].freeze
BALANCED_MAX_OPEN    = 10

# ── Inbox 16: VIP, active = online OR busy, no cap ──
VIP_INBOX_ID         = 16

# ── Inboxes 19, 12: force-assign to single owner ──
FORCE_OWNERS = {
  19 => "user@example.com",
  12 => "user@example.com",
}.freeze

account = Account.find(ACCOUNT_ID)

# ============================================================
# SECTION 1 — Balanced reassign for inbox 11
# ============================================================
def run_balanced(account, inbox_ids, max_open)
  offline_states = [:offline, :busy]

  all_agents  = account.account_users.pluck(:user_id, :availability).to_h
  online_ids  = all_agents.select { |_, a| a == "online" }.keys
  offline_ids = all_agents.select { |_, a| offline_states.include?(a.to_sym) }.keys

  inbox_members = Hash.new { |h, k| h[k] = [] }
  inbox_ids.each do |iid|
    Inbox.find(iid).members.pluck(:id).each { |uid| inbox_members[uid] << iid }
  end

  open_load = Hash.new(0)
  account.conversations
         .where(status: :open, assignee_id: online_ids + offline_ids, inbox_id: inbox_ids)
         .group(:assignee_id)
         .count
         .each { |uid, c| open_load[uid] = c }

  eligible = ->(iid) do
    online_ids.select { |uid| inbox_members[uid].include?(iid) && open_load[uid] < max_open }
  end

  reassigned_open = 0
  reassigned_snoozed = 0
  unassigned_open = 0
  skipped = 0

  # Open convos on offline agents → redistribute
  account.conversations
         .where(inbox_id: inbox_ids, status: :open, assignee_id: offline_ids)
         .order(:created_at)
         .each do |conv|
    cands = eligible.call(conv.inbox_id)
    if cands.empty?
      old = conv.assignee_id
      conv.update!(assignee_id: nil)
      open_load[old] = [open_load[old] - 1, 0].max
      unassigned_open += 1
    else
      pick = cands.min_by { |uid| [open_load[uid], rand] }
      old  = conv.assignee_id
      conv.update!(assignee_id: pick)
      conv.conversation_participants.find_or_create_by(user_id: pick)
      open_load[old] = [open_load[old] - 1, 0].max
      open_load[pick] += 1
      reassigned_open += 1
    end
  end

  # Snoozed convos on offline agents → redistribute (keeps snoozed)
  account.conversations
         .where(inbox_id: inbox_ids, status: :snoozed, assignee_id: offline_ids)
         .order(:created_at)
         .each do |conv|
    cands = eligible.call(conv.inbox_id)
    if cands.empty?
      conv.update!(assignee_id: nil)
    else
      pick = cands.min_by { |uid| [open_load[uid], rand] }
      conv.update!(assignee_id: pick)
      conv.conversation_participants.find_or_create_by(user_id: pick)
      reassigned_snoozed += 1
    end
  end

  # Unassigned open convos → assign to available agents
  account.conversations
         .where(inbox_id: inbox_ids, status: :open, assignee_id: nil)
         .order(:created_at)
         .each do |conv|
    cands = eligible.call(conv.inbox_id)
    if cands.empty?
      skipped += 1
      next
    end
    pick = cands.min_by { |uid| [open_load[uid], rand] }
    conv.update!(assignee_id: pick)
    conv.conversation_participants.find_or_create_by(user_id: pick)
    open_load[pick] += 1
  end

  remaining = account.conversations.where(inbox_id: inbox_ids, status: :open, assignee_id: nil).count
  [reassigned_open, reassigned_snoozed, unassigned_open, skipped, remaining, open_load]
end

# ============================================================
# SECTION 2 — VIP reassign for inbox 16
# ============================================================
def run_vip(account, inbox_id)
  inbox = Inbox.find_by(id: inbox_id)
  return [0, 0, 0, {}] unless inbox

  member_ids = inbox.members.pluck(:id)

  active_ids = AccountUser
                 .where(account_id: account.id, user_id: member_ids)
                 .where(availability: [:online, :busy])
                 .pluck(:user_id)

  all_avails = AccountUser
                 .where(account_id: account.id, user_id: member_ids)
                 .pluck(:user_id, :availability)
                 .to_h

  inactive_ids = all_avails.reject { |_, a| [:online, :busy].include?(a.to_sym) }.keys

  load = Hash.new(0)
  account.conversations
         .where(status: :open, assignee_id: active_ids)
         .group(:assignee_id)
         .count
         .each { |uid, c| load[uid] = c }

  stolen = 0
  assigned = 0
  left_unassigned = 0

  # Redistribute open VIP convos from inactive agents
  account.conversations
         .where(inbox_id: inbox_id, status: :open, assignee_id: inactive_ids)
         .order(:created_at)
         .each do |conv|
    if active_ids.empty?
      conv.update!(assignee_id: nil)
      left_unassigned += 1
    else
      pick = active_ids.min_by { |uid| [load[uid], rand] }
      conv.update!(assignee_id: pick)
      conv.conversation_participants.find_or_create_by(user_id: pick)
      load[pick] += 1
      stolen += 1
    end
  end

  # Fill unassigned VIP convos
  account.conversations
         .where(inbox_id: inbox_id, status: :open, assignee_id: nil)
         .order(:created_at)
         .each do |conv|
    if active_ids.empty?
      left_unassigned += 1
      next
    end
    pick = active_ids.min_by { |uid| [load[uid], rand] }
    conv.update!(assignee_id: pick)
    conv.conversation_participants.find_or_create_by(user_id: pick)
    load[pick] += 1
    assigned += 1
  end

  [stolen, assigned, left_unassigned, load]
end

# ============================================================
# SECTION 3 — Force-assign inboxes 19, 12 to owners
# ============================================================
def run_force_owner(account, mapping)
  results = {}
  mapping.each do |iid, email|
    inbox = Inbox.find_by(id: iid)
    next unless inbox

    owner = User.find_by(email: email)
    next unless owner

    unless inbox.members.exists?(owner.id)
      inbox.inbox_members.create!(user_id: owner.id)
    end

    convos = account.conversations
                   .where(inbox_id: iid)
                   .where.not(status: :resolved)
                   .where("assignee_id IS NULL OR assignee_id != ?", owner.id)

    count = convos.count
    assigned = 0
    convos.find_each do |conv|
      conv.update!(assignee_id: owner.id)
      conv.conversation_participants.find_or_create_by(user_id: owner.id)
      assigned += 1
    end
    results[iid] = { owner: owner.name, assigned: assigned, total_before: count }
  end
  results
end

# ============================================================
# RUN ALL THREE
# ============================================================
timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")

# 1. Balanced (inbox 11)
b = run_balanced(account, BALANCED_INBOX_IDS, BALANCED_MAX_OPEN)
puts "[#{timestamp}] BALANCED inbox=#{BALANCED_INBOX_IDS.inspect} reassigned_open=#{b[0]} reassigned_snoozed=#{b[1]} unassigned_open=#{b[2]} skipped_no_capacity=#{b[3]} remaining_unassigned=#{b[4]} load=#{b[5].inspect}"

# 2. VIP (inbox 16)
v = run_vip(account, VIP_INBOX_ID)
puts "[#{timestamp}] VIP inbox=#{VIP_INBOX_ID} redistributed=#{v[0]} assigned=#{v[1]} unassigned_now=#{v[2]} load=#{v[3].inspect}"

# 3. Force-owner (19, 12)
f = run_force_owner(account, FORCE_OWNERS)
f.each do |iid, r|
  puts "[#{timestamp}] FORCE inbox=#{iid} owner=#{r[:owner]} assigned=#{r[:assigned]} total_before=#{r[:total_before]}"
end
