// ─────────────────────────────────────────────────────────
// Design tool link handling
// For Canva, ChatGPT, Gemini, Claude, Adobe, WPS, etc.
// These are handled via browserless screenshot with a
// specific wait time and viewport for better renders.
// ─────────────────────────────────────────────────────────

const DESIGN_HOSTS = {
  'canva.com': { type: 'canva', waitMs: 6000 },
  'www.canva.com': { type: 'canva', waitMs: 6000 },
  'export-download.canva.com': { type: 'canva_export', waitMs: 2000 },
  'chatgpt.com': { type: 'chatgpt', waitMs: 5000 },
  'chat.openai.com': { type: 'chatgpt', waitMs: 5000 },
  'share.gemini.google': { type: 'gemini', waitMs: 5000 },
  'gemini.google.com': { type: 'gemini', waitMs: 5000 },
  'claude.ai': { type: 'claude', waitMs: 5000 },
  'copilot.microsoft.com': { type: 'copilot', waitMs: 5000 },
  'acrobat.adobe.com': { type: 'adobe', waitMs: 5000 },
  'eu.wps.com': { type: 'wps', waitMs: 4000 },
  'us.wps.com': { type: 'wps', waitMs: 4000 },
  'eu.docworkspace.com': { type: 'wps', waitMs: 4000 },
  'menna-omar-wedding.my.canva.site': { type: 'canva_site', waitMs: 5000 }
};

function detectDesignTool(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (DESIGN_HOSTS[host]) return DESIGN_HOSTS[host];
    if (host.endsWith('.my.canva.site')) return { type: 'canva_site', waitMs: 5000 };
    if (host.endsWith('.canva.com')) return { type: 'canva', waitMs: 6000 };
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = { detectDesignTool, DESIGN_HOSTS };
