'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const { downloadOne } = require('./lib/downloader');
const { buildFinalFilename, uniquify } = require('./lib/filename');
const { DedupTracker, hashStream } = require('./lib/dedup');
const { createZip } = require('./lib/zipper');
const { startCleanupCron } = require('./lib/cleanup');

const PORT = parseInt(process.env.PORT || '3000', 10);
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || '';
const ZIP_DIR = process.env.ZIP_STORAGE_DIR || '/data/zips';
const ZIP_PUBLIC_BASE = process.env.ZIP_PUBLIC_BASE || 'https://example.com/zips';
const MAX_ZIP_BYTES = parseInt(process.env.MAX_ZIP_BYTES || '2147483648', 10);

if (!INTERNAL_TOKEN || INTERNAL_TOKEN === 'REPLACE_WITH_RANDOM_64_HEX') {
  console.error('FATAL: INTERNAL_TOKEN not set in environment');
  process.exit(1);
}

fs.mkdirSync(ZIP_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '5mb' }));

// ── Auth middleware for /bundle ──
function requireToken(req, res, next) {
  const tok = req.headers['x-internal-token'] || '';
  if (tok !== INTERNAL_TOKEN) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// ── Health ──
app.get('/health', async (req, res) => {
  let zipCount = 0;
  let diskUsage = 0;
  try {
    const files = await fs.promises.readdir(ZIP_DIR);
    zipCount = files.filter(f => f.endsWith('.zip')).length;
    for (const f of files) {
      try { diskUsage += (await fs.promises.stat(path.join(ZIP_DIR, f))).size; } catch (e) {}
    }
  } catch (e) {}
  res.json({
    ok: true,
    service: 'media-bundler',
    uptime: process.uptime(),
    zipCount,
    diskUsageBytes: diskUsage
  });
});

// ── Serve ZIPs directly (nginx proxies to this) ──
app.get('/files/:zipId', (req, res) => {
  const zipId = String(req.params.zipId).replace(/[^a-zA-Z0-9._-]/g, '');
  const full = path.join(ZIP_DIR, zipId);
  if (!fs.existsSync(full)) return res.status(404).end();
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipId}"`);
  fs.createReadStream(full).pipe(res);
});

// ── Sanitize a string for safe use in a filename ──
// Replaces anything not `a-zA-Z0-9._-` with `_`.
function safeSlug(s) {
  return String(s || 'unknown')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'unknown';
}

// ── Extract extension from a MIME type ──
function extFromMime(mime) {
  const m = String(mime || '').toLowerCase().split(';')[0].trim();
  if (m === 'application/pdf') return '.pdf';
  if (m === 'image/jpeg' || m === 'image/jpg') return '.jpg';
  if (m === 'image/png') return '.png';
  if (m === 'image/gif') return '.gif';
  if (m === 'image/webp') return '.webp';
  if (m === 'image/svg+xml') return '.svg';
  if (m === 'image/bmp') return '.bmp';
  if (m === 'image/tiff') return '.tiff';
  if (m === 'application/zip') return '.zip';
  if (m === 'application/x-rar-compressed' || m === 'application/vnd.rar') return '.rar';
  if (m === 'application/x-7z-compressed') return '.7z';
  if (m === 'application/msword') return '.doc';
  if (m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx';
  if (m === 'application/vnd.ms-excel') return '.xls';
  if (m === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return '.xlsx';
  if (m === 'application/vnd.ms-powerpoint') return '.ppt';
  if (m === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return '.pptx';
  if (m.startsWith('text/')) return '.txt';
  if (m.startsWith('audio/')) return '.mp3';
  if (m.startsWith('video/')) return '.mp4';
  return '';
}

// ── Main: bundle ──
app.post('/bundle', requireToken, async (req, res) => {
  const start = Date.now();
  const { contactKey, conversationId, accountId, files, options } = req.body || {};
  const preserveDuplicates = options?.preserveDuplicates === true;

  if (!Array.isArray(files) || files.length === 0) {
    return res.json({ ok: false, error: 'no_files' });
  }

  const safeKey = safeSlug(contactKey);
  console.log(`[${contactKey}] bundle request: ${files.length} files (safeKey=${safeKey})`);

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-'));
  const dedup = new DedupTracker();
  const usedNames = new Set();
  const entries = [];
  const skipped = [];
  let totalBytes = 0;

  try {
    for (const f of files) {
      const { url, name: originalName, notes, copies, printType } = f;
      if (!url) {
        skipped.push({ name: originalName || 'unknown', url: '', reason: 'no_url' });
        continue;
      }

      const dl = await downloadOne(url, workDir);

      if (dl.error) {
        console.log(`[${contactKey}] skip ${originalName}: ${dl.error}`);
        skipped.push({
          name: originalName || guessNameFromUrl(url),
          url,
          reason: dl.error,
          detail: dl.detail || ''
        });
        continue;
      }

      // ── Drive folder → multiple files ──
      if (dl.kind === 'drive_bundle') {
        for (const sub of dl.files) {
          const subBuf = sub.buffer;
          const sha = crypto.createHash('sha256').update(subBuf).digest('hex');
          const dupId = preserveDuplicates ? null : dedup.checkHash(sha);
          if (dupId) {
            dedup.mergeNotes(dupId, notes);
            continue;
          }
          // Repair sub file name too
          let subName = String(sub.name || '').trim();
          if (!subName || !/\.[a-z0-9]{2,5}$/i.test(subName)) {
            const ts = Date.now().toString(36);
            const baseName = subName || `file_${ts}`;
            subName = baseName.replace(/\.[^.]*$/, '') + '_' + ts;
          }
          const finalName = uniquify(
            buildFinalFilename(subName, { notes, copies, printType }),
            usedNames
          );
          const p = path.join(workDir, `f_${entries.length}_${safeSlug(subName)}`);
          fs.writeFileSync(p, subBuf);
          entries.push({ name: finalName, sourcePath: p });
          totalBytes += subBuf.length;
          if (totalBytes > MAX_ZIP_BYTES) throw new Error('zip_too_large');
          const newId = dedup.register({
            etag: null,
            contentLength: String(subBuf.length),
            lastModified: null,
            name: finalName,
            url,
            notes
          });
          dedup.registerHash(sha, newId);
        }
        continue;
      }

      // ── Single file → dedup ──
      const canonicalId = preserveDuplicates ? null : dedup.checkHeaders(dl.etag, dl.contentLength, dl.lastModified);
      if (canonicalId) {
        console.log(`[${contactKey}] dedup by headers: ${originalName}`);
        dedup.mergeNotes(canonicalId, notes);
        try { fs.unlinkSync(dl.tmpPath); } catch (e) {}
        continue;
      }

      const readStream = fs.createReadStream(dl.tmpPath);
      const sha = await hashStream(readStream);
      const existing = preserveDuplicates ? null : dedup.checkHash(sha);
      if (existing) {
        console.log(`[${contactKey}] dedup by hash: ${originalName}`);
        dedup.mergeNotes(existing, notes);
        try { fs.unlinkSync(dl.tmpPath); } catch (e) {}
        continue;
      }

      // ── NEW: Repair the filename ──
      // Priority: original name (if it has an extension) → download name → content-type ext
      let resolvedName = String(originalName || '').trim();
      const hasExt = (n) => /\.[a-z0-9]{2,5}$/i.test(String(n || ''));

      // If the original name is generic or has no extension, use the download's name
      const isGeneric = (n) => {
        const clean = String(n || '').trim().toLowerCase();
        if (!clean) return true;
        if (clean === 'ملف' || clean === 'file' || clean === 'ملف_1' || clean === 'file_1') return true;
        if (/^(ملف|file)_\d+$/i.test(clean)) return true;
        return false;
      };

      if (!hasExt(resolvedName) || isGeneric(resolvedName)) {
        // Try dl.name first (it may have an extension from Content-Disposition)
        if (dl.name && hasExt(dl.name)) {
          resolvedName = dl.name;
        } else {
          // Try to add an extension from content-type
          const ext = extFromMime(dl.contentType || '');
          if (ext) {
            // Keep the base name if it's meaningful; otherwise generate
            const base = isGeneric(resolvedName)
              ? `file_${Date.now().toString(36)}`
              : resolvedName.replace(/\.[^.]*$/, '');
            resolvedName = base + ext;
          } else if (!resolvedName) {
            resolvedName = `file_${Date.now().toString(36)}`;
          }
        }
      }

      const finalName = uniquify(
        buildFinalFilename(resolvedName, { notes, copies, printType }),
        usedNames
      );
      entries.push({ name: finalName, sourcePath: dl.tmpPath });
      totalBytes += dl.size;

      const newId = dedup.register({
        etag: dl.etag,
        contentLength: dl.contentLength,
        lastModified: dl.lastModified,
        name: finalName,
        url,
        notes
      });
      dedup.registerHash(sha, newId);

      if (totalBytes > MAX_ZIP_BYTES) throw new Error('zip_too_large');
    }

    if (entries.length === 0) {
      return res.json({
        ok: false,
        error: 'all_failed',
        fallback: 'list_urls',
        skipped
      });
    }

    // ── NEW: sanitize contactKey inside the zipId ──
    const zipId = `zip_${safeKey}_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}_${crypto.randomBytes(3).toString('hex')}.zip`;
    const zipPath = path.join(ZIP_DIR, zipId);

    const { size } = await createZip(entries, zipPath);
    if (size > MAX_ZIP_BYTES) {
      try { fs.unlinkSync(zipPath); } catch (e) {}
      return res.json({
        ok: false,
        error: 'zip_too_large',
        sizeBytes: size,
        maxBytes: MAX_ZIP_BYTES,
        fallback: 'list_urls',
        skipped
      });
    }

    const expiresAt = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
    const metaPath = path.join(ZIP_DIR, zipId.replace(/\.zip$/, '.meta.json'));
    fs.writeFileSync(metaPath, JSON.stringify({
      zipId, contactKey, safeKey, conversationId, accountId,
      createdAt: new Date().toISOString(),
      expiresAt,
      fileCount: entries.length,
      sizeBytes: size,
      manifest: entries.map(e => ({ final: e.name })),
      skipped
    }, null, 2));

    const durationMs = Date.now() - start;
    console.log(`[${contactKey}] zip ready: ${zipId} (${entries.length} files, ${(size / 1024 / 1024).toFixed(1)} MB, ${durationMs}ms)`);

    res.json({
      ok: true,
      zipId,
      zipUrl: `${ZIP_PUBLIC_BASE}/${zipId}`,
      sizeBytes: size,
      fileCount: entries.length,
      skippedCount: skipped.length,
      expiresAt,
      manifest: entries.map(e => ({ final: e.name })),
      skipped
    });

  } catch (e) {
    const msg = String(e.message || e);
    console.error(`[${contactKey}] bundle failed: ${msg}`);
    res.json({
      ok: false,
      error: msg === 'zip_too_large' ? 'exceeds_max_size' : 'service_error',
      detail: msg,
      fallback: 'list_urls',
      skipped
    });
  } finally {
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch (e) {}
  }
});

// ── Manual delete ──
app.delete('/files/:zipId', requireToken, (req, res) => {
  const zipId = String(req.params.zipId).replace(/[^a-zA-Z0-9._-]/g, '');
  const full = path.join(ZIP_DIR, zipId);
  if (!fs.existsSync(full)) return res.status(404).json({ ok: false });
  fs.unlinkSync(full);
  res.json({ ok: true });
});

function guessNameFromUrl(url) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(last) || 'file';
  } catch (e) {
    return 'file';
  }
}

startCleanupCron();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`media-bundler listening on :${PORT}`);
  console.log(`ZIP_DIR=${ZIP_DIR}`);
  console.log(`MAX_ZIP_BYTES=${MAX_ZIP_BYTES}`);
});
