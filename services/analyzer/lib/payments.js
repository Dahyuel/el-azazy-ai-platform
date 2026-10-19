// ─────────────────────────────────────────────────────────
// Payment / receipt link detection
// When the customer sends a link from a known payment service,
// we return a special analysis that signals the bot to handoff.
// ─────────────────────────────────────────────────────────

const PAYMENT_HOSTS = {
  'ipn.eg': 'instapay',
  'axispay.app.link': 'axis_pay',
  'invoicing.eta.gov.eg': 'eta_tax',
  'cfspart.impots.gouv.fr': 'impots_gouv',
  'paymob.com': 'paymob',
  'paypal.com': 'paypal',
  'paypal.me': 'paypal',
  'wise.com': 'wise'
};

function detectPaymentLink(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PAYMENT_HOSTS[host] || null;
  } catch (e) {
    return null;
  }
}

function paymentAnalysis(url, provider) {
  return {
    type: 'payment_link',
    from_link: true,
    from_payment: true,
    payment_provider: provider,
    url,
    description: `لينك ${provider}`,
    require_handoff: true,
    is_transfer_receipt: provider === 'instapay',
    transfer_provider: provider,
    likely_print_service: 'غير محدد'
  };
}

module.exports = { detectPaymentLink, paymentAnalysis, PAYMENT_HOSTS };
