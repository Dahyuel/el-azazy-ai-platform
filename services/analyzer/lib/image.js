const sharp = require('sharp');
const { analyzeImage } = require('./gemini');

const TARGET_BASE64_BYTES = parseInt(process.env.TARGET_BASE64_BYTES || '5242880', 10);

async function compressImage(inputBuffer) {
  let quality = 80;
  let width = 2000;
  let outputBuffer = inputBuffer;
  let attempt = 0;

  while (attempt < 8) {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    const base64Size = Math.ceil(outputBuffer.length / 3) * 4;
    if (base64Size <= TARGET_BASE64_BYTES) break;

    if (quality > 40) quality -= 15;
    else width = Math.floor(width * 0.75);
    attempt++;
  }
  return outputBuffer;
}

async function analyzeImageBuffer(inputBuffer) {
  const compressed = await compressImage(inputBuffer);
  const b64 = compressed.toString('base64');
  return analyzeImage(b64, 'image/jpeg');
}

module.exports = { compressImage, analyzeImageBuffer };
