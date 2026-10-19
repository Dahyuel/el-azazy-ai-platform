'use strict';
const fs = require('node:fs');
const path = require('node:path');

function openEvidence(filename) {
  if (!path.isAbsolute(filename)) throw new Error('absolute_storage_path_required');
  fs.mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(filename);
  try {
    db.exec('PRAGMA busy_timeout=200; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
    db.exec(`CREATE TABLE IF NOT EXISTS media_evidence (
      idempotency_key TEXT PRIMARY KEY, account_id INTEGER NOT NULL,
      message_id TEXT NOT NULL, attachment_index INTEGER NOT NULL,
      analysis_hash TEXT NOT NULL, observed_at TEXT NOT NULL,
      identity_verified INTEGER NOT NULL DEFAULT 0,
      payload_json TEXT NOT NULL
    )`);
    fs.chmodSync(filename, 0o600);
    return db;
  } catch (error) { db.close(); throw error; }
}

function initializeEvidence(filename) { const db = openEvidence(filename); db.close(); }

function writeEvidence(record, filename) {
  const body = JSON.stringify(record);
  if (Buffer.byteLength(body) > 256 * 1024) throw new Error('evidence_record_too_large');
  const db = openEvidence(filename);
  try {
    const result = db.prepare(`INSERT OR IGNORE INTO media_evidence
      (idempotency_key,account_id,message_id,attachment_index,analysis_hash,observed_at,payload_json)
      VALUES (?,?,?,?,?,?,?)`).run(record.idempotency_key, record.account_id, record.message_id,
        record.attachment_index, record.analysis_hash, record.observed_at, body);
    fs.chmodSync(filename, 0o600);
    return { inserted: Number(result.changes) === 1 };
  } finally { db.close(); }
}
module.exports = { writeEvidence, initializeEvidence };
