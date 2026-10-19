'use strict';

const fs = require('fs');
const path = require('path');

const ZIP_DIR = process.env.ZIP_STORAGE_DIR || '/data/zips';
const TTL_MS = (parseInt(process.env.ZIP_TTL_HOURS || '36', 10)) * 60 * 60 * 1000;
const INTERVAL_MS = 15 * 60 * 1000;

async function cleanupOnce() {
  const now = Date.now();
  let deleted = 0;
  let bytesFreed = 0;

  try {
    const files = await fs.promises.readdir(ZIP_DIR);
    for (const f of files) {
      const full = path.join(ZIP_DIR, f);
      try {
        const stat = await fs.promises.stat(full);
        if (now - stat.mtimeMs > TTL_MS) {
          await fs.promises.unlink(full);
          deleted++;
          bytesFreed += stat.size;
        }
      } catch (e) {
        // ignore per-file errors
      }
    }
  } catch (e) {
    console.error(`[cleanup] readdir failed: ${e.message}`);
  }

  if (deleted > 0) {
    console.log(`[cleanup] deleted ${deleted} files (${(bytesFreed / 1024 / 1024).toFixed(1)} MB)`);
  }
}

function startCleanupCron() {
  cleanupOnce();
  setInterval(cleanupOnce, INTERVAL_MS);
}

module.exports = { startCleanupCron, cleanupOnce };
