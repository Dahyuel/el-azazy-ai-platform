// ─────────────────────────────────────────────────────────
// OCR for scanned receipts / invoices
// When an image is detected as a "transfer_receipt" or "invoice"
// but Gemini's text extraction is weak, we run Tesseract OCR
// and merge the results.
//
// NOTE: Requires `tesseract-ocr` and `tesseract-ocr-ara` in the
// Docker image. If not installed, this module silently returns null.
// ─────────────────────────────────────────────────────────

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function hasTesseract() {
  try {
    execSync('which tesseract', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

const TESSERACT_AVAILABLE = hasTesseract();

async function ocrImage(buf) {
  if (!TESSERACT_AVAILABLE) return null;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'));
  try {
    const imgPath = path.join(tmp, 'input.png');
    fs.writeFileSync(imgPath, buf);

    // Try Arabic + English
    let text = '';
    try {
      text = execSync(
        `tesseract "${imgPath}" stdout -l ara+eng --psm 6 2>/dev/null`,
        { timeout: 30000 }
      ).toString();
    } catch (e) {
      try {
        text = execSync(
          `tesseract "${imgPath}" stdout --psm 6 2>/dev/null`,
          { timeout: 30000 }
        ).toString();
      } catch (e2) {
        return null;
      }
    }

    const trimmed = String(text || '').trim();
    if (!trimmed || trimmed.length < 10) return null;
    return trimmed.slice(0, 2000);
  } catch (e) {
    return null;
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

module.exports = { ocrImage, TESSERACT_AVAILABLE };
