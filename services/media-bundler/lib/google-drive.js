const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { listFiles, getFile } = require('better-gdrive');

/**
 * Download a Google Drive file or folder.
 * Returns an array of { name, buffer } for each downloaded file.
 */
async function downloadFromDrive(url) {
  const isFolder = /\/drive\/folders\//.test(url);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gdrive-'));
  
  try {
    let success = false;

    // ── Attempt 1: gdown (best for bulk download) ──
    try {
      let cmd;
      if (isFolder) {
        cmd = `gdown --folder "${url}" --quiet -O "${tmp}" 2>&1`;
      } else {
        cmd = `gdown "${url}" --quiet -O "${tmp}/file" 2>&1`;
      }
      execSync(cmd, { timeout: 180000, stdio: 'pipe' });
      success = true;
    } catch (e) {
      console.log(`[google-drive] gdown failed: ${String(e.message || e).slice(0, 100)}`);
    }

    // ── Attempt 2: better-gdrive fallback (for public folders) ──
    if (!success || fs.readdirSync(tmp).length === 0) {
      console.log(`[google-drive] trying better-gdrive fallback`);
      if (isFolder) {
        const files = await listFiles(url);
        if (files && files.length > 0) {
          for (const file of files) {
            try {
              const buf = await getFile(file.id, 'buffer');
              fs.writeFileSync(path.join(tmp, file.name || file.id), buf);
            } catch (err) {
              console.log(`[google-drive] failed to get ${file.name}: ${err.message}`);
            }
          }
        }
      } else {
        // Single file fallback
        try {
          const buf = await getFile(url, 'buffer');
          fs.writeFileSync(path.join(tmp, 'file'), buf);
        } catch (err) {
          console.log(`[google-drive] better-gdrive file failed: ${err.message}`);
        }
      }
    }

    // Walk the tmp folder for files
    const results = [];
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile()) {
          const stat = fs.statSync(full);
          if (stat.size > 0) {
            results.push({
              name: entry.name,
              buffer: fs.readFileSync(full),
              size: stat.size
            });
          }
        }
      }
    }
    walk(tmp);

    if (results.length === 0) return null;
    return results;
  } catch (e) {
    console.log(`[google-drive] failed: ${String(e.message || e)}`);
    return null;
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

function isDriveUrl(url) {
  return /drive\.google\.com|docs\.google\.com/i.test(url);
}

module.exports = { downloadFromDrive, isDriveUrl };
