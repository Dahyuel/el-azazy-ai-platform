function detectFormat(buf) {
  if (!buf || buf.length < 8) return 'unknown';
  const header = buf.slice(0, 32);
  const magic = header.slice(0, 8).toString('hex');
  const isoBrand = header.slice(4, 12).toString('ascii').toLowerCase();
  const textStart = header.toString('utf8').replace(/^\uFEFF/, '').trimStart().toLowerCase();
  if (magic.startsWith('526172211a07')) return 'rar';
  if (magic.startsWith('377abcaf271c')) return '7z';
  if (magic.startsWith('25504446')) return 'pdf';
  if (magic.startsWith('504b0304')) return 'zip_or_office';
  if (magic.startsWith('d0cf11e0')) return 'doc_legacy';
  if (magic.startsWith('ffd8')) return 'jpeg';
  if (magic === '89504e47') return 'png';
  if (magic === '47494638') return 'gif';
  if (magic === '52494646') return 'webp';
  if (magic.startsWith('424d')) return 'bmp';
  if (magic.startsWith('49492a00') || magic.startsWith('4d4d002a')) return 'tiff';
  if (/^ftyp(?:avif|avis)/.test(isoBrand)) return 'avif';
  if (/^ftyp(?:heic|heix|hevc|hevx|mif1|msf1)/.test(isoBrand)) return 'heic';
  if (textStart.startsWith('<svg') || (textStart.startsWith('<?xml') && /<svg\b/.test(textStart))) return 'svg';
  return 'unknown';
}

function classifyOffice(buf) {
  const s = buf.toString('binary');
  if (s.includes('word/document.xml'))   return 'docx';
  if (s.includes('ppt/presentation.xml')) return 'pptx';
  if (s.includes('xl/workbook.xml'))     return 'xlsx';
  if (s.includes('word/'))  return 'docx';
  if (s.includes('ppt/'))   return 'pptx';
  if (s.includes('xl/'))    return 'xlsx';
  return 'zip';
}

// NEW: detect legacy Office subtype
function classifyLegacyOffice(buf, urlName) {
  const name = String(urlName || '').toLowerCase();
  if (name.endsWith('.doc')) return 'doc_legacy';
  if (name.endsWith('.xls')) return 'xls_legacy';
  if (name.endsWith('.ppt')) return 'ppt_legacy';
  const s = buf.toString('binary').slice(0, 2000);
  if (s.includes('Word.Document') || s.includes('Microsoft Word')) return 'doc_legacy';
  if (s.includes('Excel.Sheet') || s.includes('Microsoft Excel')) return 'xls_legacy';
  if (s.includes('PowerPoint') || s.includes('Microsoft PowerPoint')) return 'ppt_legacy';
  return 'doc_legacy';
}

function isImageExt(name) {
  return /\.(jpg|jpeg|png|webp|gif|bmp|tiff?|avif|heic|heif|svg)$/i.test(name || '');
}

function isDocExt(name) {
  return /\.(docx?|pptx?|xlsx?|odt|odp|ods)$/i.test(name || '');
}

function isLegacyOfficeExt(name) {
  return /\.(doc|xls|ppt)$/i.test(name || '');
}

function isTextExt(name) {
  return /\.(txt|text|csv|log|json|md|xml)$/i.test(name || '');
}

function isLinkExt(name) {
  return /\.(html?|php|asp)$/i.test(name || '');
}

// NEW: detect plain text by content (no magic bytes)
function isPrintableText(buf) {
  if (!buf || buf.length < 10) return false;
  const sample = buf.slice(0, Math.min(2000, buf.length));
  let printable = 0;
  for (const byte of sample) {
    if (byte >= 32 && byte <= 126) printable++;
    else if (byte === 9 || byte === 10 || byte === 13) printable++;
  }
  return (printable / sample.length) > 0.85;
}

module.exports = {
  detectFormat,
  classifyOffice,
  classifyLegacyOffice,
  isImageExt,
  isDocExt,
  isLegacyOfficeExt,
  isTextExt,
  isLinkExt,
  isPrintableText
};
