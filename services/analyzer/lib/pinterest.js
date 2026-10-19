const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Download a Pinterest pin image.
 *
 * Strategy:
 *   1. Try `pinterest-dl scrape` (fast, full-res)
 *   2. Fallback to Pinterest's public oEmbed API (thumbnail, but reliable)
 *   3. Return null if both fail
 */
async function downloadPinterestPin(url) {
  const m = String(url).match(/\/pin\/(\d+)/);
  const pinId = m ? m[1] : 'pin';

  // ── Attempt 1: pinterest-dl ──
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pin-'));
  try {
    try {
      execSync(`pinterest-dl scrape "${url}" "${tmp}" -l 1 2>&1`, {
        timeout: 45000,
        stdio: 'pipe'
      });
    } catch (e) {
      // pinterest-dl often exits non-zero even on partial success
      console.log(`[pinterest] pinterest-dl exit: ${String(e.message || e).slice(0, 100)}`);
    }

    const files = fs.readdirSync(tmp).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    if (files.length > 0) {
      const first = files[0];
      const fullPath = path.join(tmp, first);
      const stat = fs.statSync(fullPath);
      if (stat.size > 1000) {
        console.log(`[pinterest] downloaded via pinterest-dl: ${first} (${stat.size} bytes)`);
        return {
          name: first,
          buffer: fs.readFileSync(fullPath),
          size: stat.size,
          source: 'pinterest-dl'
        };
      }
    }
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }

  // ── Attempt 2: oEmbed API ──
  try {
    console.log(`[pinterest] trying oEmbed API for ${pinId}`);
    const oembed = await fetch(`https://www.pinterest.com/oembed.json?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AzzaziBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });

    if (oembed.ok) {
      const data = await oembed.json();
      const imageUrl = data.thumbnail_url || data.image_url;
      if (imageUrl) {
        console.log(`[pinterest] oEmbed returned image: ${imageUrl.slice(0, 100)}`);
        const img = await fetch(imageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000)
        });
        if (img.ok) {
          const buf = Buffer.from(await img.arrayBuffer());
          if (buf.length > 1000) {
            console.log(`[pinterest] downloaded via oEmbed (${buf.length} bytes)`);
            return {
              name: `${pinId}.jpg`,
              buffer: buf,
              size: buf.length,
              source: 'oembed'
            };
          }
        }
      }
    } else {
      console.log(`[pinterest] oEmbed failed: HTTP ${oembed.status}`);
    }
  } catch (e) {
    console.log(`[pinterest] oEmbed error: ${String(e.message || e)}`);
  }

  console.log(`[pinterest] all strategies failed for ${url}`);
  return null;
}

function isPinterestUrl(url) {
  return /pinterest\.|pin\.it/i.test(url);
}

module.exports = { downloadPinterestPin, isPinterestUrl };
