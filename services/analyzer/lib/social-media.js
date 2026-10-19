const { postfetch, download } = require('@postfetch/core');

/**
 * Try to download actual media from a social post.
 * Returns:
 *   { type: 'image', buffer, ... } — if we got an image
 *   { type: 'video', video_url, ... } — if it's a video
 *   null — if postfetch couldn't handle it
 */
async function fetchSocialMedia(url) {
  try {
    const result = await postfetch(url);
    if (!result || !result.items || result.items.length === 0) {
      console.log(`[social-media] postfetch returned no items for ${url.slice(0, 80)}`);
      return null;
    }

    // Prefer image items
    const imageItem = result.items.find(it => it.kind === 'image');
    const videoItem = result.items.find(it => it.kind === 'video');
    const target = imageItem || videoItem;

    if (!target) {
      console.log(`[social-media] no image/video in postfetch result`);
      return null;
    }

    if (target.kind === 'image') {
      try {
        const response = await download(target);
        const buf = Buffer.from(await response.arrayBuffer());
        return {
          type: 'image',
          from_social: true,
          platform: result.platform,
          buffer: buf,
          filename: target.filename || 'social-image.jpg',
          mime: target.mime || 'image/jpeg'
        };
      } catch (e) {
        console.log(`[social-media] download image failed: ${e.message}`);
        return null;
      }
    }

    if (target.kind === 'video') {
      return {
        type: 'video',
        from_social: true,
        platform: result.platform,
        video_url: target.url,
        thumbnail_url: target.thumbnail || null,
        filename: target.filename || 'video.mp4',
        mime: target.mime || 'video/mp4',
        width: target.width || null,
        height: target.height || null,
        duration: target.duration || null
      };
    }

    return null;
  } catch (e) {
    console.log(`[social-media] postfetch failed for ${url.slice(0, 80)}: ${String(e.message || e)}`);
    return null;
  }
}

const SOCIAL_PLATFORMS = /instagram\.com|tiktok\.com|facebook\.com|twitter\.com|x\.com|linkedin\.com|pinterest\.|reddit\.com|youtube\.com|youtu\.be/i;

function isSocialUrl(url) {
  return SOCIAL_PLATFORMS.test(url);
}

module.exports = { fetchSocialMedia, isSocialUrl };
