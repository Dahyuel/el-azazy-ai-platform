const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { compressImage } = require('./image');
const { analyzeImage } = require('./gemini');

function pdfInfo(pdfPath) {
  try {
    const out = execSync(`pdfinfo "${pdfPath}" 2>/dev/null`, { timeout: 10000 }).toString();
    const pagesMatch = out.match(/^Pages:\s+(\d+)/m);
    const sizeMatch = out.match(/^Page size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts/m);
    const pages = pagesMatch ? parseInt(pagesMatch[1], 10) : null;
    let dims = null;
    if (sizeMatch) {
      const wPt = parseFloat(sizeMatch[1]);
      const hPt = parseFloat(sizeMatch[2]);
      dims = {
        wCm: Math.round(wPt * 0.03528 * 10) / 10,
        hCm: Math.round(hPt * 0.03528 * 10) / 10
      };
    }
    return { pages, dims };
  } catch (e) {
    return { pages: null, dims: null };
  }
}

async function analyzePdfBuffer(buf) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-'));
  try {
    const pdfPath = path.join(tmp, 'doc.pdf');
    fs.writeFileSync(pdfPath, buf);

    const { pages, dims } = pdfInfo(pdfPath);

    if (pages === null || pages === 0) {
      return { error: 'pdf_corrupt_or_unreadable', pages: null, dims: null };
    }

    try {
      execSync(
        `pdftoppm -png -r 150 -f 1 -l 1 "${pdfPath}" "${tmp}/page"`,
        { timeout: 30000, stdio: 'ignore' }
      );
    } catch (e) {
      return { error: 'pdf_render_failed', pages, dims };
    }

    const files = fs.readdirSync(tmp).filter(f => f.startsWith('page') && f.endsWith('.png'));
    if (files.length === 0) {
      return { error: 'pdf_render_failed', pages, dims };
    }

    const imgBuf = fs.readFileSync(path.join(tmp, files[0]));
    const compressed = await compressImage(imgBuf);
    const b64 = compressed.toString('base64');

    const analysis = await analyzeImage(b64, 'image/jpeg');

    analysis.pages = pages;
    if (dims) analysis.dims = dims;
    analysis.from_pdf = true;
    analysis.pdf_page_analyzed = 1;

    return analysis;
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

module.exports = { analyzePdfBuffer, pdfInfo };
