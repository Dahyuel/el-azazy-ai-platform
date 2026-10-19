'use strict';

const crypto = require('crypto');
const fs = require('fs');

/**
 * Three-tier dedup:
 *   1. by ETag (fastest — no download)
 *   2. by Content-Length + Last-Modified (fast — no download)
 *   3. by SHA-256 of downloaded bytes (fallback)
 */
class DedupTracker {
  constructor() {
    this.byEtag = new Map();          // etag → canonicalId
    this.byWeak = new Map();          // `${len}:${mtime}` → canonicalId
    this.byHash = new Map();          // sha256 → canonicalId
    this.canonical = new Map();       // canonicalId → { name, url, noteParts[] }
    this.nextId = 1;
  }

  /** Returns canonicalId or null if this is the first occurrence. */
  checkHeaders(etag, contentLength, lastModified) {
    if (etag && this.byEtag.has(etag)) return this.byEtag.get(etag);
    if (contentLength && lastModified) {
      const key = `${contentLength}:${lastModified}`;
      if (this.byWeak.has(key)) return this.byWeak.get(key);
    }
    return null;
  }

  /** Register a new canonical file. Returns its id. */
  register({ etag, contentLength, lastModified, name, url, notes }) {
    const id = this.nextId++;
    if (etag) this.byEtag.set(etag, id);
    if (contentLength && lastModified) this.byWeak.set(`${contentLength}:${lastModified}`, id);
    this.canonical.set(id, { id, name, url, noteParts: notes ? [notes] : [] });
    return id;
  }

  /** Merge a duplicate's notes into the canonical entry. */
  mergeNotes(canonicalId, notes) {
    if (!notes) return;
    const c = this.canonical.get(canonicalId);
    if (!c) return;
    if (!c.noteParts.includes(notes)) c.noteParts.push(notes);
  }

  /** Check SHA-256 after downloading. Returns canonicalId or null. */
  checkHash(sha256) {
    return this.byHash.get(sha256) || null;
  }

  /** Register a hash against a canonical id. */
  registerHash(sha256, canonicalId) {
    this.byHash.set(sha256, canonicalId);
  }

  /** Get canonical entry by id. */
  get(id) { return this.canonical.get(id); }

  /** Get final notes string for a canonical (joined with " / "). */
  notesFor(id) {
    const c = this.canonical.get(id);
    if (!c || c.noteParts.length === 0) return '';
    return c.noteParts.join(' / ');
  }
}

/** Compute SHA-256 while streaming a file to disk. */
async function hashStream(stream) {
  const hash = crypto.createHash('sha256');
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end',  () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

module.exports = { DedupTracker, hashStream };
