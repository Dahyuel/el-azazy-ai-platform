// ─────────────────────────────────────────────────────────
// Long-tail domain handling
// Small sets of domains that need special treatment.
// ─────────────────────────────────────────────────────────

// Direct-image hosts — treat as direct file downloads
const IMAGE_CDN_HOSTS = new Set([
  'upload.wikimedia.org',
  'encrypted-tbn0.gstatic.com',
  'cdn.nis-egypt.com',
  'lh3.google.com',
  't3.ftcdn.net',
  'assets.ctfassets.net',
  'rc-assets.teacherspayteachers.com',
  'storage.googleapis.com'
]);

// E-commerce reference hosts — screenshot + ask what to print
const ECOMMERCE_HOSTS = new Set([
  'temu.com',
  'noon.com',
  'etsy.com',
  'amzn.eu',
  'amazon.eg',
  'hedeya.com'
]);

// Educational content hosts — screenshot
const EDU_CONTENT_HOSTS = new Set([
  'coursera.org',
  'udemy.com',
  'udacity.com',
  'pastpapers.papacambridge.com',
  'content.twinkl.co.uk',
  'sparklebox.co.uk',
  'totcards.com',
  'journals.ekb.eg',
  'brightnetwork.co.uk',
  'sakscholarship.org'
]);

// Multi-link / bio pages — screenshot
const LINKTREE_HOSTS = new Set([
  'linktr.ee',
  'link.camscanner.com',
  'render.vivenu.com'
]);

// Search pages — screenshot
const SEARCH_HOSTS = new Set([
  'share.google',
  'google.com',
  'bing.com',
  'claude.ai'  // covered by design-tools too, but safe here
]);

function classifyLongtail(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (IMAGE_CDN_HOSTS.has(host)) return 'image_cdn';
    if (ECOMMERCE_HOSTS.has(host)) return 'ecommerce';
    if (EDU_CONTENT_HOSTS.has(host)) return 'edu_content';
    if (LINKTREE_HOSTS.has(host)) return 'linktree';
    if (SEARCH_HOSTS.has(host)) return 'search';
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = { classifyLongtail, IMAGE_CDN_HOSTS, ECOMMERCE_HOSTS, EDU_CONTENT_HOSTS, LINKTREE_HOSTS, SEARCH_HOSTS };
