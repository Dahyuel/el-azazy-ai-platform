# Verification and limits

Private-deployment verification included a final 45-check isolated integration suite, 22 management assertions and 7 AI-attribution assertions. Separate browser checks covered Arabic/mobile layout, filtering, CSV, evidence navigation, feedback/history, images, and synthetic audio/video playback. Backup integrity and restoration into a separate directory were verified. An isolated synthetic receipt exercised actual n8n/Gemini evidence capture while preserving legacy output.

These are historical checks on the private deployment, not a claim that this sanitized export was fully tested or portable without configuration. No tests were newly executed for publication. Production-dependent fixtures and customer evidence are not published.

- Real dashboard Groq evaluation remains disabled and untested.
- MFA was tested with synthetic responses matching installed Chatwoot semantics; real administrator password login was exercised separately.
- Snapshot workload observations cannot prove short-lived overload or historical responsibility.
- Current ownership does not establish who resolved a conversation.
- Polling can miss rapid resolve/reopen transitions.
- Latest-500-message transcript limit is explicit.
- Active learning examples guide prompts; they do not fine-tune a model or autoedit the production bot.
- Before/after issue rates are descriptive and do not prove causation.
- Sampled video frames do not establish complete video understanding.
- Automatic off-site backup replication is not configured.
