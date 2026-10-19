const Redis = require('/files/node_modules/ioredis');
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('/files/redis.json', 'utf8'));

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Redis({
      host: cfg.host || 'botredis',
      port: cfg.port || 6379,
      password: cfg.password,
      connectTimeout: 4000,
      maxRetriesPerRequest: 2,
      lazyConnect: false
    });
    _client.on('error', () => {});
  }
  return _client;
}

function todayKey() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────────────────────
// Pricing table (USD per token)
// Source: Google + Groq public pricing
// ─────────────────────────────────────────────────────────
const PRICING = {
  'gemini-3.1-flash-lite': { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  'gemini-2.0-flash':      { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  'gemini-1.5-flash':      { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  'whisper-large-v3-turbo': { audioPerSecond: 0.04 / 3600 }
};

function getPricing(model) { return PRICING[model] || null; }

async function logTokens(opts) {
  const { provider = 'gemini', mode = 'agent', prompt = 0, completion = 0, contactKey = null, meta = {} } = opts || {};
  const model = meta.model || 'unknown';
  const audioSeconds = Number(meta.audioSeconds) || 0;
  const total = prompt + completion;

  const pricing = getPricing(model);
  let costUSD = 0;
  if (pricing) {
    if (pricing.audioPerSecond != null) costUSD = audioSeconds * pricing.audioPerSecond;
    else costUSD = (prompt * pricing.input) + (completion * pricing.output);
  }
  const costMicro = Math.round(costUSD * 1_000_000);

  const r = getClient();
  const day = todayKey();
  const base = `tokens:daily:${day}:${provider}:${mode}`;

  try {
    await r.incrby(`${base}:prompt`, prompt);
    await r.incrby(`${base}:completion`, completion);
    await r.incrby(`${base}:total`, total);
    await r.incrby(`${base}:requests`, 1);
    await r.incrby(`${base}:costMicro`, costMicro);

    const modelBase = `tokens:daily:${day}:${provider}:${mode}:model:${model}`;
    await r.incrby(`${modelBase}:prompt`, prompt);
    await r.incrby(`${modelBase}:completion`, completion);
    await r.incrby(`${modelBase}:requests`, 1);
    await r.incrby(`${modelBase}:costMicro`, costMicro);
    if (audioSeconds > 0) await r.incrby(`${modelBase}:audioSeconds`, Math.round(audioSeconds));

    for (const s of ['prompt','completion','total','requests','costMicro']) {
      await r.expire(`${base}:${s}`, 7776000);
      await r.expire(`${modelBase}:${s}`, 7776000);
    }
    await r.expire(`${modelBase}:audioSeconds`, 7776000);

    if (contactKey) {
      const ck = `tokens:contact:${contactKey}:${day}`;
      await r.incrby(`${ck}:prompt`, prompt);
      await r.incrby(`${ck}:completion`, completion);
      await r.incrby(`${ck}:total`, total);
      await r.incrby(`${ck}:requests`, 1);
      await r.incrby(`${ck}:costMicro`, costMicro);
      for (const s of ['prompt','completion','total','requests','costMicro']) await r.expire(`${ck}:${s}`, 7776000);
    }

    const eventKey = `token_events:${day}`;
    await r.rpush(eventKey, JSON.stringify({ provider, mode, model, prompt, completion, total, contactKey, source: meta.source || null, audioSeconds: audioSeconds || null, costUSD, at: Date.now() }));
    await r.expire(eventKey, 7776000);
    await r.ltrim(eventKey, -100000, -1);
  } catch (e) { console.log(`[token_tracker] log failed: ${String(e.message || e)}`); }
}

module.exports = { logTokens, todayKey, PRICING, getPricing };
