#!/usr/bin/env bash
# ============================================================
# Consolidated reassignment — runs every minute
# Handles inboxes 11 (balanced), 16 (VIP), 19 & 12 (force-owner)
# ============================================================
set -u

LOCKFILE=/tmp/reassign_all.lock
LOGFILE=/var/log/chatwoot_reassign.log
RUBY_FILE=/root/chatwoot-customize/reassign_all.rb

if [[ -f "$LOCKFILE" ]]; then
  exit 0
fi
touch "$LOCKFILE"
trap 'rm -f "$LOCKFILE"' EXIT

{
  echo "============================================================"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] reassign_all started"

  docker cp "$RUBY_FILE" chatwoot-rails-1:/tmp/reassign_all.rb
  docker exec chatwoot-rails-1 sh -c 'RAILS_ENV=production bundle exec rails runner /tmp/reassign_all.rb' 2>&1 | grep -vE "WARN|INFO|deprecated|ip_lookup"
  docker exec -u root chatwoot-rails-1 rm -f /tmp/reassign_all.rb

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] reassign_all finished"
} >> "$LOGFILE" 2>&1
