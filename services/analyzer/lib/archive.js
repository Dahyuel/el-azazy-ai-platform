const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { compressImage } = require('./image');
const { analyzeImage } = require('./gemini');
const { isImageExt } = require('./detect');

const MAX_TOP_FILES = parseInt(process.env.MAX_TOP_FILES || '3', 10);
const MAX_FILE_MB = parseInt(process.env.MAX_FILE_MB || '50', 10);

function isJunkFile(name) {
  const lower = name.toLowerCase();
  return (
    lower.includes('__macosx') ||
    lower.includes('.ds_store') ||
    lower.includes('thumbs.db') ||
    lower.startsWith('._') ||
    lower.endsWith('.lnk') ||
    lower.endsWith('.ini') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.url')
  );
}

function extractArchive(buf, format) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arc-'));
  const archiveName = format === 'rar' ? 'a.rar'
                    : format === '7z'  ? 'a.7z'
                    : 'a.zip';
  const archivePath = path.join(tmp, archiveName);
  fs.writeFileSync(archivePath, buf);

  try {
    if (format === 'rar') {
      execSync(`unrar x -o+ -inul "${archivePath}" "${tmp}/"`, { timeout: 60000, stdio: 'ignore' });
    } else if (format === '7z') {
      execSync(`7z x -y -o"${tmp}" "${archivePath}"`, { timeout: 60000, stdio: 'ignore' });
    } else {
      execSync(`unzip -o -qq "${archivePath}" -d "${tmp}"`, { timeout: 60000, stdio: 'ignore' });
    }
  } catch (e) {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw new Error('extraction_failed: ' + e.message);
  }
  return tmp;
}

function findImages(dir, baseDir = dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__MACOSX') continue;
      out.push(...findImages(full, baseDir));
    } else if (entry.isFile() && isImageExt(entry.name) && !isJunkFile(entry.name)) {
      const stat = fs.statSync(full);
      out.push({ path: full, name: path.relative(baseDir, full), size: stat.size });
    }
  }
  return out;
}

async function analyzeArchiveBuffer(buf, format) {
  const tmp = extractArchive(buf, format);
  try {
    const allImages = findImages(tmp).filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);
    if (allImages.length === 0) {
      return { error: 'no_images_in_archive' };
    }

    const top = allImages.sort((a, b) => b.size - a.size).slice(0, MAX_TOP_FILES);

    const perFile = [];
    for (const img of top) {
      try {
        const b = fs.readFileSync(img.path);
        const compressed = await compressImage(b);
        const analysis = await analyzeImage(compressed.toString('base64'), 'image/jpeg');
        perFile.push({ name: path.basename(img.name), analysis });
      } catch (e) {
        perFile.push({ name: path.basename(img.name), error: String(e.message) });
      }
    }

    const valid = perFile.filter(f => f.analysis);
    const anyTransfer = valid.find(f => f.analysis.is_transfer_receipt);
    const types = [...new Set(valid.map(f => f.analysis.type))];
    const services = [...new Set(
      valid.map(f => f.analysis.likely_print_service).filter(s => s && s !== 'غير محدد')
    )];

    let combinedType = 'other';
    if (anyTransfer) combinedType = 'transfer_receipt';
    else if (types.length === 1) combinedType = types[0];
    else if (types.length > 1) combinedType = types.join(' / ');

    const descParts = valid.map(f => `${path.basename(f.name)}: ${(f.analysis.description || '').slice(0, 100)}`);
    const description = allImages.length > top.length
      ? `أرشيف يحتوي على ${allImages.length} صور. أول ${top.length}: ${descParts.join(' | ')}`
      : `أرشيف يحتوي على ${allImages.length} صور: ${descParts.join(' | ')}`;

    return {
      type: combinedType,
      is_transfer_receipt: !!anyTransfer,
      transfer_provider: anyTransfer?.analysis.transfer_provider || 'none',
      transfer_amount: anyTransfer?.analysis.transfer_amount || '',
      description: description.slice(0, 600),
      likely_print_service: services.length > 0 ? services.join(' / ') : 'غير محدد',
      from_archive: true,
      files_in_archive: allImages.length,
      analyzed_file_count: top.length
    };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

module.exports = { analyzeArchiveBuffer };
