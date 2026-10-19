'use strict';

const { createHash } = require('node:crypto');
const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);

// Returns a new object. Never mutate provider output shared by later nodes.
function splitAudit(value, path = '$', observations = []) {
  if (Array.isArray(value)) return value.map((item, i) => splitAudit(item, `${path}[${i}]`, observations));
  if (!value || typeof value !== 'object') return value;
  const clean = {};
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN.has(key)) continue;
    if (key === '_audit') {
      observations.push({ path, value: item });
    } else {
      clean[key] = splitAudit(item, `${path}.${key}`, observations);
    }
  }
  return clean;
}

async function captureAudit({ analysis, accountId, messageId, attachmentIndex = 0, conversationId = null,
  attachmentId = null, model = null, write, now = () => new Date().toISOString() }) {
  const observations = [];
  const clean = splitAudit(analysis, '$', observations);
  // Do not claim storage succeeded, or turn persistence failures into customer errors.
  if (typeof write !== 'function') return { analysis: clean, stored: false, reason: 'storage_unconfigured' };
  if (!Number.isSafeInteger(accountId) || accountId <= 0 || !/^\d+$/.test(String(messageId)) ||
      !Number.isSafeInteger(attachmentIndex) || attachmentIndex < 0) {
    return { analysis: clean, stored: false, reason: 'invalid_source_identity' };
  }
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis) || analysis.error || analysis.ok === false) {
    return { analysis: clean, stored: false, reason: 'analysis_failed' };
  }
  const analysisHash = createHash('sha256').update(JSON.stringify(analysis)).digest('hex');
  const record = {
    schema_version: '1', extraction_version: 'gemini-audit-v1', account_id: accountId,
    message_id: String(messageId), conversation_id: conversationId, attachment_id: attachmentId,
    attachment_index: attachmentIndex, model, analysis_hash: analysisHash,
    source_content_hash: null, observed_at: now(), observations,
    existing_analysis: clean,
    coverage: analysis.from_pdf ? { scope: 'pdf_page', page: analysis.pdf_page_analyzed || 1,
      total_pages: analysis.pages || null } : { scope: analysis.from_image ? 'image' : 'unverified' },
  };
  // Hash describes returned analysis, NOT image bytes. Resolve account/message/attachment
  // mapping against Chatwoot before accepting this staged record as trusted evidence.
  record.idempotency_key = `${accountId}:${messageId}:${attachmentId || `index-${attachmentIndex}`}:gemini-audit-v1:${analysisHash}`;
  try {
    await write(record);
    return { analysis: clean, stored: true, reason: null };
  } catch (_) {
    return { analysis: clean, stored: false, reason: 'storage_failed' };
  }
}

module.exports = { splitAudit, captureAudit };
