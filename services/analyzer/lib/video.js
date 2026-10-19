const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { analyzeImageBuffer } = require('./image');

const MAX_VIDEO_MB = Math.max(1, Number(process.env.MAX_VIDEO_MB) || 100);
const MAX_VIDEO_SECONDS = Math.max(10, Number(process.env.MAX_VIDEO_SECONDS) || 600);
const MAX_FRAMES = 3;

function probeDuration(inputPath) {
  try {
    const raw = execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', inputPath
    ], { timeout: 10000, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const duration = Number(raw);
    return Number.isFinite(duration) && duration > 0 ? duration : null;
  } catch (_) {
    return null;
  }
}

function sampleTimes(duration) {
    if (!duration) return [0, 1, 2];
  const candidates = duration < 2
    ? [0]
    : [Math.min(0.25, duration / 4), duration / 2, Math.max(0, duration - 0.25)];
  return [...new Set(candidates.map(value => Math.max(0, value).toFixed(2)))].slice(0, MAX_FRAMES).map(Number);
}

async function analyzeVideoBuffer(buffer, originalName = 'video') {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return { error: 'video_empty' };
  if (buffer.length > MAX_VIDEO_MB * 1024 * 1024) {
    return { error: 'video_too_large', max_mb: MAX_VIDEO_MB, name: originalName };
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'video-'));
  try {
    const inputPath = path.join(tmp, 'input-video');
    fs.writeFileSync(inputPath, buffer);
    const duration = probeDuration(inputPath);
    if (duration && duration > MAX_VIDEO_SECONDS) {
      return { error: 'video_too_long', max_seconds: MAX_VIDEO_SECONDS, duration_seconds: Math.round(duration), name: originalName };
    }

    const frameRows = [];
    for (const [index, seconds] of sampleTimes(duration).entries()) {
      const outputPath = path.join(tmp, `frame-${index}.jpg`);
      try {
        execFileSync('ffmpeg', [
          '-nostdin', '-hide_banner', '-loglevel', 'error', '-ss', String(seconds),
          '-i', inputPath, '-frames:v', '1', '-vf', 'scale=1600:-1', '-q:v', '4', '-y', outputPath
        ], { timeout: 20000, stdio: 'ignore' });
        const frame = fs.readFileSync(outputPath);
        const analysis = await analyzeImageBuffer(frame);
        if (analysis && !analysis.error) {
          frameRows.push({ at_seconds: seconds, type: analysis.type || 'other', description: String(analysis.description || '').slice(0, 300),
            is_transfer_receipt: analysis.is_transfer_receipt === true, transfer_provider: analysis.transfer_provider || 'none',
            transfer_amount: analysis.transfer_amount || '', likely_print_service: analysis.likely_print_service || 'غير محدد' });
        }
      } catch (_) {
        // Keep processing the other bounded samples when one frame is unreadable.
      }
    }

    if (!frameRows.length) return { error: 'video_frames_unreadable', name: originalName, duration_seconds: duration ? Math.round(duration) : null };
    const receipt = frameRows.find(row => row.is_transfer_receipt);
    const descriptions = frameRows.map((row, index) => `لقطة ${index + 1} (${row.at_seconds}ث): ${row.description || 'لا يوجد وصف واضح'}`);
    return {
      type: 'video', from_video: true, name: originalName,
      duration_seconds: duration ? Math.round(duration) : null,
      frames_analyzed: frameRows.length, frame_observations: frameRows,
      is_transfer_receipt: !!receipt,
      transfer_provider: receipt?.transfer_provider || 'none',
      transfer_amount: receipt?.transfer_amount || '',
      likely_print_service: frameRows.map(row => row.likely_print_service).find(value => value && value !== 'غير محدد') || 'غير محدد',
      description: `تم فحص ${frameRows.length} لقطات من الفيديو. ${descriptions.join(' | ')}`.slice(0, 1200)
    };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
  }
}

module.exports = { analyzeVideoBuffer };
