const fs = require('fs');
const Redis = require('/files/node_modules/ioredis');
const cfg = JSON.parse(fs.readFileSync('/files/redis.json', 'utf8'));

const TTL = 86400;          // state TTL (24h)
const EVENTS_TTL = 2592000; // events TTL (30d)
const EVENT_MAX = 500;      // cap events per contact
const sleep = ms => new Promise(r => setTimeout(r, ms));
const digits = s => String(s || '').replace(/\D/g, '');

async function run(fn) {
  const r = new Redis({
    host: cfg.host || 'botredis',
    port: cfg.port || 6379,
    password: cfg.password,
    connectTimeout: 4000,
    maxRetriesPerRequest: 2
  });
  r.on('error', () => {});
  try { return await fn(r); } finally { r.disconnect(); }
}

// ─────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────
function fresh(extra) {
  return Object.assign({
    // identity + links
    state: 'NORMAL',
    conversationId: '',
    accountId: null,
    baseUrl: '',
    contactPhone: '',

    // customer
    customer: {
      name: null,
      phone: null,
      whatsappPhone: null,
      whatsappUsername: null
    },

    // order in progress
    partialOrder: {
      name: null,
      phone: null,
      orderDetails: null,
      dimensions: { wCm: null, hCm: null },
      expectedFileCount: null,
      designNotes: [],
      estimatedPrice: null,
      startedAt: null,
      lastDetailText: null,
      lastDetailAt: 0,
      updatedAt: 0
    },

    // confirmed order
    confirmedOrder: null,
    orderConfirmedAt: 0,

    // inquiry
    inquiry: {
      topic: null,
      askedAbout: [],
      quotedPrices: [],
      lastInquiryAt: 0
    },

    // feedback
    feedback: {
      sentiment: null,
      lastFeedbackAt: 0,
      history: []
    },

    // media
    media: {
      urls: [],
      count: 0,
      lastMediaAt: 0
    },
    pendingInternalMedia: false,
    replyToMedia: null,

    // conversation flow
    recentClientMessages: [],
    recentClientMessagesAt: 0,

    lastCustomerAt: 0,
    lastBotAt: 0,

    // nudge / handoff
    nudgeCount: 0,
    lastNudgeAt: 0,
    handoffReason: null,
    handedOffAt: 0,
    resolvedAt: 0,
    botDisabledPermanently: false,

    // timestamps
    createdAt: Date.now(),
    updatedAt: Date.now()
  }, extra || {});
}

// ─────────────────────────────────────────────────────────
// Helper: extract WhatsApp username from sender attributes
// Chatwoot stores it under additional_attributes.social_whatsapp_user_name
// or additional_attributes.social_profiles.whatsapp
// ─────────────────────────────────────────────────────────
function extractWaUsername(meta) {
  const attrs = (meta || {}).additional_attributes || {};
  const fromDirect = String(attrs.social_whatsapp_user_name || '').trim();
  const fromProfile = String((attrs.social_profiles || {}).whatsapp || '').trim();
  const raw = fromDirect || fromProfile;
  if (!raw) return '';
  return raw.replace(/^@/, '').toLowerCase();
}

function contactKey(b) {
  const conv = b.conversation || {};
  const meta = (conv.meta || {}).sender || {};
  const ci = conv.contact_inbox || {};
  const inbox = (b.inbox || {}).id || conv.inbox_id || 0;

  // Priority 1: phone number
  let phone = digits(meta.phone_number);
  if (!phone && String(conv.channel || '').includes('Whatsapp')) phone = digits(ci.source_id);
  if (phone.length >= 8) return inbox + ':' + phone;

  // Priority 2: WhatsApp username (stable across inboxes for the same person)
  const wa = extractWaUsername(meta);
  if (wa) return inbox + ':wa:' + wa;

  // Priority 3: contact ID (per-inbox — last resort)
  const cid = meta.id || ci.contact_id;
  return cid ? inbox + ':c' + cid : inbox + ':conv' + conv.id;
}

const K = key => 'ct:' + key;

async function get(r, key) {
  const s = await r.get(K(key));
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}

async function set(r, key, st) {
  st.updatedAt = Date.now();
  await r.set(K(key), JSON.stringify(st), 'EX', TTL);
}

async function update(r, key, fn) {
  const lk = 'lock:' + key;
  let locked = false;
  for (let i = 0; i < 60 && !locked; i++) {
    locked = (await r.set(lk, '1', 'PX', 5000, 'NX')) === 'OK';
    if (!locked) await sleep(100);
  }
  try {
    const cur = (await get(r, key)) || fresh();
    const next = (await fn(cur)) || cur;
    await set(r, key, next);
    return next;
  } finally {
    if (locked) await r.del(lk);
  }
}

// ─────────────────────────────────────────────────────────
// Event log — append-only timeline per contact
// Stored as a Redis list: events:<key>  (newest first)
// Each entry: { type, at, data }
// ─────────────────────────────────────────────────────────
async function logEvent(r, key, type, data) {
  try {
    const ev = JSON.stringify({
      type: String(type || 'unknown'),
      at: Date.now(),
      data: data || {}
    });
    const k = 'events:' + key;
    await r.lpush(k, ev);
    await r.ltrim(k, 0, EVENT_MAX - 1);
    await r.expire(k, EVENTS_TTL);
  } catch (e) {}
}

async function getEvents(r, key, limit) {
  try {
    const raw = await r.lrange('events:' + key, 0, (limit || 20) - 1);
    return raw.map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
  } catch (e) { return []; }
}

const clearChat = (r, key) => r.del('chat:' + key);

module.exports = {
  run, fresh, contactKey, get, set, update, clearChat,
  logEvent, getEvents,
  extractWaUsername,
  TTL, EVENTS_TTL, EVENT_MAX,
  digits
};
