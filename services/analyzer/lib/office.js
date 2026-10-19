const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pdfInfo } = require('./pdf');
const { compressImage } = require('./image');
const { analyzeImage } = require('./gemini');

const MAX_PAGES_RENDER = parseInt(process.env.MAX_PAGES_RENDER || '3', 10);

async function analyzeOfficeBuffer(buf, originalName) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'office-'));
  try {
    let ext = (path.extname(originalName || '') || '.docx').toLowerCase().replace(/^\./, '');
    if (!ext) ext = 'docx';

    const inputPath = path.join(tmp, 'input.' + ext);
    fs.writeFileSync(inputPath, buf);

    try {
      execSync(
        `libreoffice --headless --convert-to pdf --outdir "${tmp}" "${inputPath}" 2>/dev/null`,
        { timeout: 180000, stdio: 'ignore' }
      );
    } catch (e) {
      return { error: 'office_convert_failed', detail: String(e.message), name: originalName };
    }

    const pdfFiles = fs.readdirSync(tmp).filter(f => f.endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      return { error: 'office_convert_failed', detail: 'no_output_pdf', name: originalName };
    }

    const pdfPath = path.join(tmp, pdfFiles[0]);
    const { pages, dims } = pdfInfo(pdfPath);

    try {
      execSync(
        `pdftoppm -png -r 150 -f 1 -l 1 "${pdfPath}" "${tmp}/page"`,
        { timeout: 30000, stdio: 'ignore' }
      );
    } catch (e) {
      return { error: 'office_render_failed', pages, dims, name: originalName };
    }

    const pagesImg = fs.readdirSync(tmp).filter(f => f.startsWith('page') && f.endsWith('.png'));
    if (pagesImg.length === 0) {
      return { error: 'office_render_failed', pages, dims, name: originalName };
    }

    const imgBuf = fs.readFileSync(path.join(tmp, pagesImg[0]));
    const compressed = await compressImage(imgBuf);
    const b64 = compressed.toString('base64');

    const analysis = await analyzeImage(b64, 'image/jpeg');

    analysis.pages = pages;
    if (dims) analysis.dims = dims;
    analysis.from_doc = true;
    analysis.from_libreoffice = true;
    analysis.original_ext = ext;
    analysis.name = originalName;

    if (['pptx', 'ppt', 'odp'].includes(ext)) analysis.slides = pages;
    if (['xlsx', 'xls', 'ods'].includes(ext)) analysis.sheets = pages;

    return analysis;
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

module.exports = { analyzeOfficeBuffer };
