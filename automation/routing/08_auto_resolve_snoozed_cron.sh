#!/usr/bin/env bash
# ============================================================
# Auto-resolve snoozed conversations that are stale/expired.
#
# Runs via cron (recommended: hourly, not every minute).
#
# Rule (per your request): resolve snoozed convos where:
#   - snoozed_until IS NULL AND updated_at < 2 days ago  (broken)
#   OR
#   - snoozed_until < 2 days ago                          (expired)
# ============================================================

LOCKFILE=/tmp/auto_resolve_snoozed.lock
LOGFILE=/var/log/chatwoot_auto_resolve.log

if [[ -f "$LOCKFILE" ]]; then exit 0; fi
touch "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

{
  echo "============================================================"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] auto_resolve_snoozed started"

  docker exec chatwoot-rails-1 sh -c 'RAILS_ENV=production bundle exec rails runner "
account = Account.find(2)
cutoff  = 2.days.ago

targets = account.conversations.where(status: :snoozed).where(
  \"(snoozed_until IS NULL AND updated_at < ?) OR (snoozed_until IS NOT NULL AND snoozed_until < ?)\",
  cutoff, cutoff
)

count = targets.count
if count.zero?
  puts \"[#{Time.now}] nothing to resolve\"
else
  resolved = 0
  targets.in_batches(of: 100) do |batch|
    resolved += batch.update_all(status: :resolved, updated_at: Time.current)
  end
  puts \"[#{Time.now}] resolved #{resolved} stale snoozed convos\"
end
"' 2>&1 | grep -vE "WARN|INFO|deprecated|ip_lookup"

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] auto_resolve_snoozed finished"
} >> "$LOGFILE" 2>&1
