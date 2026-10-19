const SHORTLINK_HOSTS = new Set([
  'pin.it',
  'vt.tiktok.com',
  'youtu.be',
  'chat.whatsapp.com',
  'wa.me',
  't.me',
  'photos.app.goo.gl',
  'share.google',
  'g.co',
  'g.page',
  'maps.app.goo.gl',
  'maps.google.com',
  'canva.link',
  'we.tl',
  'mab.to',
  '1drv.ms',
  'adobeacrobat.app.link',
  'axispay.app.link',
  'tinyurl.com',
  'spr.ly',
  'bit.ly',
  't.co',
  'ow.ly',
  'buff.ly'
]);

const USER_AGENT = 'Mozilla/5.0 (compatible; AzzaziBot/1.0; +https://example.com)';
const TIMEOUT_MS = 8000;

async function resolveShortLink(url) {
  const original = String(url || '').trim();
  if (!original) return { url: '', resolved: false, original: '' };

  let parsed;
  try {
    parsed = new URL(original);
  } catch (e) {
    return { url: original, resolved: false, original };
  }

  const host = parsed.hostname.toLowerCase();
  if (!SHORTLINK_HOSTS.has(host)) {
    return { url: original, resolved: false, original };
  }

  // Try HEAD first (fast)
  try {
    const resp = await fetch(original, {
      method: 'HEAD',
      redirect: 'manual',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    const location = resp.headers.get('location');
    if (location) {
      const finalUrl = new URL(location, original).toString();
      console.log(`[shortlinks] resolved ${host} → ${finalUrl.slice(0, 120)}`);
      return { url: finalUrl, resolved: true, original };
    }
  } catch (e) {
    // fall through to GET
  }

  // Some shorteners use meta/JS redirects — try GET with follow
  try {
    const resp = await fetch(original, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    const finalUrl = resp.url || original;
    if (finalUrl && finalUrl !== original) {
      console.log(`[shortlinks] resolved (GET) ${host} → ${finalUrl.slice(0, 120)}`);
      return { url: finalUrl, resolved: true, original };
    }
  } catch (e) {
    // give up
  }

  return { url: original, resolved: false, original };
}

module.exports = { resolveShortLink, SHORTLINK_HOSTS };
