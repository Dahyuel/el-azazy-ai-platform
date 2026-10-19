const { compressImage } = require('./image');
const { analyzeImage } = require('./gemini');
const { detectDesignTool } = require('./design-tools');

const BROWSERLESS_URL = process.env.BROWSERLESS_URL || 'http://browserless:3000';
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || '';

// ── Block / login / error patterns (EN + AR) ──
const BLOCK_PATTERNS = [
  // English login walls
  /log in • sign up/i,
  /log in\s+sign up/i,
  /sign up for instagram to stay in the loop/i,
  /never miss a post from/i,
  /sign in to continue/i,
  /please log in/i,
  /sign in with/i,
  // English errors
  /access denied/i,
  /network security/i,
  /blocked by/i,
  /403 forbidden/i,
  /http error 403/i,
  /http error 404/i,
  /error 403/i,
  /error 404/i,
  /404 not found/i,
  /page not found/i,
  /this content isn't available/i,
  /content isn't available/i,
  /error 1020/i,
  /attention required/i,
  /cloudflare/i,
  // Arabic login walls
  /تسجيل الدخول/i,
  /سجل الدخول/i,
  /نافذة تسجيل الدخول/i,
  /تسجيل دخول/i,
  /الرجاء تسجيل الدخول/i,
  /من فضلك سجل الدخول/i,
  // Arabic errors
  /غير متاح/i,
  /تم حظر/i,
  /أنت محظور/i,
  /محظور/i,
  /حظر المستخدم/i,
  /أمن الشبكة/i,
  /شبكة موقع/i,
  /ممنوع الوصول/i,
  /لا يمكن الوصول/i,
  /خطأ في متصفح/i,
  /خطأ 403/i,
  /خطأ 404/i,
  /رسالة خطأ/i,
  /فشل الاتصال/i,
  /الاتصال بالموقع/i
];

function isBlockedContent(text) {
  const s = String(text || '');
  for (const p of BLOCK_PATTERNS) {
    if (p.test(s)) return true;
  }
  return false;
}

function normalizeInstagramUrl(url) {
  return String(url || '').replace(/\/embed\/?$/, '/');
}

async function checkMetaOEmbed(url) {
  const u = normalizeInstagramUrl(url);
  let endpoint = null;
  if (/instagram\.com\/(p|reel)\//.test(u)) {
    endpoint = `https://graph.facebook.com/v25.0/instagram_oembed?url=${encodeURIComponent(u)}`;
  } else if (/facebook\.com\/.*\/posts\//.test(u)) {
    endpoint = `https://graph.facebook.com/v25.0/oembed_post?url=${encodeURIComponent(u)}`;
  } else if (/threads\.net\/t\//.test(u)) {
    endpoint = `https://graph.threads.com/oembed?url=${encodeURIComponent(u)}`;
  }
  if (!endpoint) return null;

  try {
    const r = await fetch(endpoint, { headers: { 'User-Agent': 'AzzaziBot/1.0' } });
    if (!r.ok) return { valid: false, status: r.status };
    const data = await r.json();
    if (data.error || !data.html) return { valid: false, detail: data.error?.message || 'no_html' };
    return { valid: true, provider: data.provider_name || 'meta' };
  } catch (e) {
    return { valid: false, detail: String(e.message || e).slice(0, 100) };
  }
}

// ── Host-specific profile ──
function getHostProfile(url, mode = 'desktop') {
  const u = String(url || '').toLowerCase();
  const isMobile = mode === 'mobile';

  // Design tool custom wait times
  const design = detectDesignTool(url);
  if (design) {
    return {
      viewport: isMobile ? { width: 600, height: 900 } : { width: 1280, height: 900 },
      waitUntil: 'networkidle2',
      waitForTimeout: design.waitMs || 5000,
      fullPage: false
    };
  }

  if (/instagram\.com/.test(u)) {
    return { viewport: isMobile ? { width: 540, height: 960 } : { width: 1280, height: 900 }, waitUntil: 'networkidle2', waitForTimeout: isMobile ? 4000 : 6000, fullPage: false };
  }
  if (/twitter\.com|x\.com/.test(u)) {
    return { viewport: isMobile ? { width: 600, height: 900 } : { width: 1280, height: 900 }, waitUntil: 'networkidle2', waitForTimeout: isMobile ? 4000 : 6000, fullPage: !isMobile };
  }
  if (/reddit\.com/.test(u)) {
    return { viewport: isMobile ? { width: 600, height: 900 } : { width: 1280, height: 900 }, waitUntil: 'networkidle2', waitForTimeout: isMobile ? 4000 : 6000, fullPage: !isMobile };
  }
  if (/pinterest\.|facebook\.|tiktok\./.test(u)) {
    return { viewport: isMobile ? { width: 600, height: 900 } : { width: 1280, height: 900 }, waitUntil: 'networkidle2', waitForTimeout: isMobile ? 4000 : 5000, fullPage: false };
  }
  if (/youtube\.com|youtu\.be/.test(u)) {
    return { viewport: isMobile ? { width: 600, height: 900 } : { width: 1280, height: 800 }, waitUntil: 'networkidle2', waitForTimeout: 4000, fullPage: false };
  }
  return { viewport: isMobile ? { width: 600, height: 900 } : { width: 1280, height: 800 }, waitUntil: 'networkidle2', waitForTimeout: 4000, fullPage: false };
}

async function browserlessAttempt(url, mode = 'desktop') {
  const endpoint = `${BROWSERLESS_URL}/screenshot?token=REPLACE_WITH_YOUR_SECRET`;
  const profile = getHostProfile(url, mode);

  const body = {
    url,
    options: { fullPage: profile.fullPage, type: 'jpeg', quality: 80 },
    viewport: profile.viewport,
    gotoOptions: { waitUntil: profile.waitUntil, timeout: 45000 },
    waitForTimeout: profile.waitForTimeout
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`browserless_http_${resp.status}: ${txt.slice(0, 200)}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  if (!buf || buf.length < 1000) throw new Error('browserless_empty_buffer');
  return buf;
}

async function screenshotWithFallback(url) {
  const attempts = [
    { mode: 'desktop', label: 'desktop-v1' },
    { mode: 'desktop', label: 'desktop-v2-retry' },
    { mode: 'mobile',  label: 'mobile-fallback' },
    { mode: 'desktop', label: 'desktop-long-wait' }
  ];

  let lastErr = null;
  for (let i = 0; i < attempts.length; i++) {
    const { mode, label } = attempts[i];
    try {
      console.log(`[Link] browserless attempt ${i + 1}/${attempts.length} (${label})`);
      const buf = await browserlessAttempt(url, mode);
      console.log(`[Link] browserless success on ${label}`);
      return { buf, mode, label };
    } catch (e) {
      lastErr = e;
      console.log(`[Link] attempt ${label} failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return { buf: null, mode: null, label: null, error: String(lastErr?.message || 'all_attempts_failed') };
}

async function fetchStaticPage(url) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AzzaziBot/1.0)', 'Accept': 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) return null;

    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return null;

    const html = await r.text();
    if (!html || html.length < 200) return null;

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    if (text.length < 50) return null;

    if (isBlockedContent(text)) {
      console.log(`[Link] static fallback detected block/login content — rejecting`);
      return null;
    }

    return {
      type: 'screenshot',
      url,
      from_link: true,
      from_static_fallback: true,
      description: text.slice(0, 500),
      likely_print_service: 'غير محدد',
      is_transfer_receipt: false
    };
  } catch (e) {
    console.log(`[Link] static fetch failed: ${e.message}`);
    return null;
  }
}

function rewriteInstagramToEmbed(url) {
  const m = String(url || '').match(/instagram\.com\/(p|reel)\/([^\/\?]+)/);
  if (!m) return null;
  return `https://www.instagram.com/${m[1]}/${m[2]}/embed/`;
}

async function analyzeLinkBuffer(url) {
  try {
    // 1. Meta oEmbed pre-check (skip for /embed/ URLs)
    const isMeta = /instagram\.com|facebook\.com|threads\.net/.test(url);
    const isAlreadyEmbed = /\/embed\/?$/.test(url);
    let metaCheck = null;
    if (isMeta && !isAlreadyEmbed) {
      metaCheck = await checkMetaOEmbed(url);
      if (metaCheck && metaCheck.valid === false) {
        console.log(`[Link] meta oEmbed says unavailable`);
        return {
          type: 'link',
          url,
          screenshot_failed: true,
          reason: 'meta_post_unavailable',
          detail: metaCheck.detail || 'post not available'
        };
      }
    }

    // 2. Instagram: try embed URL FIRST
    if (/instagram\.com/.test(url)) {
      const embedUrl = isAlreadyEmbed ? url : rewriteInstagramToEmbed(url);
      if (embedUrl) {
        console.log(`[Link] trying Instagram embed: ${embedUrl}`);
        try {
          const embedBuf = await browserlessAttempt(embedUrl, 'desktop');
          if (embedBuf && embedBuf.length > 1000) {
            const compressed = await compressImage(embedBuf);
            const analysis = await analyzeImage(compressed.toString('base64'), 'image/jpeg');
            if (!isBlockedContent(analysis.description)) {
              analysis.type = analysis.type || 'screenshot';
              analysis.from_link = true;
              analysis.from_instagram_embed = true;
              analysis.url = url;
              if (metaCheck) analysis.meta_verified = true;
              console.log(`[Link] Instagram embed succeeded`);
              return analysis;
            }
            console.log(`[Link] Instagram embed returned block content — rejecting`);
          }
        } catch (e) {
          console.log(`[Link] Instagram embed attempt failed: ${e.message}`);
        }
      }
    }

    // 3. Standard Browserless fallback
    const shot = await screenshotWithFallback(url);

    if (shot.buf) {
      const compressed = await compressImage(shot.buf);
      const analysis = await analyzeImage(compressed.toString('base64'), 'image/jpeg');

      if (isBlockedContent(analysis.description)) {
        console.log(`[Link] browserless returned block content — rejecting`);
        const staticResult = await fetchStaticPage(url);
        if (staticResult) return staticResult;
        return {
          type: 'link',
          url,
          screenshot_failed: true,
          reason: 'login_wall_or_dead_page',
          description: analysis.description
        };
      }

      analysis.type = analysis.type || 'screenshot';
      analysis.from_link = true;
      analysis.url = url;
      analysis.browserless_mode = shot.mode;
      if (metaCheck) analysis.meta_verified = true;
      return analysis;
    }

    // 4. Static HTML fallback (strict)
    console.log(`[Link] browserless exhausted, trying static fetch`);
    const staticResult = await fetchStaticPage(url);
    if (staticResult) return staticResult;

    // 5. Give up
    return {
      type: 'link',
      url,
      screenshot_failed: true,
      reason: 'browserless_exhausted',
      detail: shot.error
    };
  } catch (e) {
    return {
      type: 'link',
      url,
      screenshot_failed: true,
      reason: String(e.message || e).slice(0, 200)
    };
  }
}

module.exports = { analyzeLinkBuffer };
