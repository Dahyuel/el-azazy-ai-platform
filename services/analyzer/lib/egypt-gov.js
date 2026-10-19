// ─────────────────────────────────────────────────────────
// Egyptian government + educational portal handling
// These sites often have login walls or security blocks that
// browserless can't bypass. We detect them and return a
// specialized reason so the bot asks for upload/screenshot.
// ─────────────────────────────────────────────────────────

const EGYPT_GOV_HOSTS = new Set([
  'digital.gov.eg',
  'invoicing.eta.gov.eg',
  'tansiq.mod.gov.eg',
  'tansiksec.emis.gov.eg',
  'cairo.gov.eg',
  'eduserv.cairo.gov.eg',
  'azhar.gov.eg',
  'ellibrary.moe.gov.eg',
  'tagphase.mod.gov.eg',
  'freshgraduate.moss.gov.eg',
  'military.asu.edu.eg',
  'tansik.emis.gov.eg',
  'cms.guc.edu.eg',
  'mede.capu.edu.eg',
  'edu.bkarnak.edu.eg',
  'asu2learn.asu.edu.eg',
  'lms.alalson.edu.eg',
  'tanseeq.mod.gov.eg'
]);

const EGYPT_EDU_HOSTS = new Set([
  'cms.guc.edu.eg',
  'mede.capu.edu.eg',
  'edu.bkarnak.edu.eg',
  'asu2learn.asu.edu.eg',
  'lms.alalson.edu.eg',
  'military.asu.edu.eg'
]);

function detectEgyptGov(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (EGYPT_GOV_HOSTS.has(host) || host.endsWith('.gov.eg')) return 'gov';
    if (EGYPT_EDU_HOSTS.has(host) || host.endsWith('.edu.eg')) return 'edu';
    return null;
  } catch (e) {
    return null;
  }
}

function egyptGovAnalysis(url, kind) {
  return {
    type: 'link',
    url,
    from_link: true,
    screenshot_failed: true,
    reason: kind === 'gov' ? 'egypt_gov_login_required' : 'egypt_edu_login_required',
    host: new URL(url).hostname,
    hint: 'ask_customer_to_upload_or_screenshot',
    description: kind === 'gov'
      ? 'لينك حكومي مصري — يحتاج تسجيل دخول'
      : 'لينك تعليمي مصري — يحتاج تسجيل دخول',
    likely_print_service: 'غير محدد',
    is_transfer_receipt: false
  };
}

module.exports = { detectEgyptGov, egyptGovAnalysis };
