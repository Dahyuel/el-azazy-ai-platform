'use strict';

const fs = require('fs');
const archiver = require('archiver');

/**
 * Create a ZIP file from a list of entries.
 * entries: [{ name, sourcePath }]
 * outputPath: absolute path where ZIP will be written
 * Returns: { size }
 */
async function createZip(entries, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => resolve({ size: archive.pointer() }));
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') reject(err);
    });

    archive.pipe(output);
    for (const e of entries) {
      if (e.sourcePath && fs.existsSync(e.sourcePath)) {
        archive.file(e.sourcePath, { name: e.name });
      } else if (e.buffer) {
        archive.append(e.buffer, { name: e.name });
      }
    }
    archive.finalize();
  });
}

module.exports = { createZip };
