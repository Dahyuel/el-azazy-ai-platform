'use strict';

const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');

const { resolveShortLink } = require('./shortlinks');
const { isDriveUrl, downloadFromDrive } = require('./google-drive');
const { detectFileHost } = require('./filehosts');
const { fetchLinkScreenshot } = require('./link');

const USER_AGENT = 'Mozilla/5.0 (compatible; AzzaziBundler/1.0; +https://example.com)';
const TIMEOUT_MS = parseInt(process.env.DOWNLOAD_TIMEOUT_MS || '60000', 10);
const MAX_FILE_BYTES = parseInt(process.env.MAX_FILE_MB || '500', 10) * 1024 * 1024;

function classifyUrl(url) {
  if (isDriveUrl(url)) return 'drive';
  const host = detectFileHost(url);
  if (host === 'requires_upload') return 'requires_upload';
  return 'direct';
}

function guessFilename(url, headers = {}) {
  // 1. Content-Disposition
  const cd = headers['content-disposition'] || '';
  let m = cd.match(/filename\*=UTF-8''([^;]+)/i);
  if (m) {
    try { return decodeURIComponent(m[1]); } catch (e) {}
  }
  m = cd.match(/filename="?([^";]+)"?/i);
  if (m) return m[1];

  // 2. URL path (only take the last segment if it looks like a filename)
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/').filter(Boolean);
    // Walk backwards for a segment with an extension
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = decodeURIComponent(segments[i]);
      if (/\.[a-z0-9]{2,5}$/i.test(seg)) return seg;
    }
    // No extension found — return the last segment (may still be useful)
    const last = segments[segments.length - 1];
    if (last && !/^\d+$/.test(last) && last !== 'upload') return decodeURIComponent(last);
  } catch (e) {}

  // 3. Fallback
  return `file_${Date.now().toString(36)}`;
}

/**
 * Download a single URL to a temp file inside destDir.
 * Returns: { kind, tmpPath?, buffer?, name, size, contentType, error?, detail? }
 */
async function downloadOne(url, destDir) {
  const kind = classifyUrl(url);

  // ── Drive files + folders ──
  if (kind === 'drive') {
    try {
      const files = await downloadFromDrive(url);
      if (!files || files.length === 0) {
        return { error: 'drive_download_empty', detail: 'no files returned' };
      }
      return { kind: 'drive_bundle', files };
    } catch (e) {
      return { error: 'drive_download_failed', detail: String(e.message || e).slice(0, 200) };
    }
  }

  // ── Requires upload ──
  if (kind === 'requires_upload') {
    return { error: 'requires_upload', detail: 'file host needs manual upload' };
  }

  // ── Direct download ──
  try {
    const { url: resolved } = await resolveShortLink(url);
    const target = resolved || url;

    const resp = await fetch(target, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': '*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (!resp.ok) {
      return { error: `http_${resp.status}`, detail: `status ${resp.status}` };
    }

    const ct = (resp.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html')) {
      const shot = await fetchLinkScreenshot(target);
      if (shot && shot.buffer) {
        const p = path.join(destDir, shot.name);
        fs.writeFileSync(p, shot.buffer);
        return {
          kind: 'screenshot',
          tmpPath: p,
          name: shot.name,
          size: shot.buffer.length,
          url: target,
          contentType: 'image/jpeg'
        };
      }
      return { error: 'html_not_file', detail: `content-type: ${ct}` };
    }

    const name = guessFilename(target, Object.fromEntries(resp.headers));
    const tmpPath = path.join(destDir, `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

    const nodeStream = Readable.fromWeb(resp.body);
    const fileStream = fs.createWriteStream(tmpPath);
    await pipeline(nodeStream, fileStream);

    const stat = fs.statSync(tmpPath);
    if (stat.size > MAX_FILE_BYTES) {
      fs.unlinkSync(tmpPath);
      return { error: 'too_large', detail: `size ${stat.size} exceeds ${MAX_FILE_BYTES}` };
    }

    return {
      kind: 'file',
      tmpPath,
      name,
      size: stat.size,
      url: target,
      etag: resp.headers.get('etag') || null,
      contentLength: resp.headers.get('content-length') || String(stat.size),
      lastModified: resp.headers.get('last-modified') || null,
      contentType: (resp.headers.get('content-type') || '').split(';')[0].trim()
    };
  } catch (e) {
    const msg = String(e.message || e);
    const errCode = msg.includes('aborted') ? 'timeout' : 'download_failed';
    return { error: errCode, detail: msg.slice(0, 200) };
  }
}

module.exports = { downloadOne, classifyUrl, guessFilename };
