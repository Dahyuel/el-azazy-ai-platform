/**
 * convert-prices.js
 *
 * Reads azazy_prices.xlsx and produces prices.json with a structured schema
 * the `get_prices` tool can query by columns (category, product, material, etc.)
 *
 * Run manually after every Excel update:
 *   docker exec n8n-n8n-1 node /files/convert-prices.js
 */

const XLSX = require('/files/node_modules/xlsx');
const fs = require('fs');
const path = require('path');

const SRC = '/files/azazy_prices.xlsx';
const DST = '/files/prices.json';
const FALLBACK_TXT = '/files/prices_optimized.txt';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function s(v) {
  return v === null || v === undefined ? '' : String(v).trim();
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function intOrNull(v) {
  const n = num(v);
  return n === null ? null : Math.round(n);
}

// Skip a row if it's completely empty or missing both category and product
function isRowEmpty(row) {
  return !s(row['الفئة']) && !s(row['المنتج']);
}

// Normalize Arabic for the text-search fallback
function normalizeAr(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')  // tashkeel
    .replace(/[\u0623\u0625\u0622]/g, '\u0627')   // alef forms → ا
    .replace(/\u0649/g, '\u064a')                  // alef maqsura → ي
    .replace(/\u0629/g, '\u0647')                  // ta marbuta → ه
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a human-readable summary line for the text fallback
function buildSummaryLine(item) {
  const parts = [];
  if (item.product) parts.push(item.product);
  if (item.size) parts.push(item.size);
  if (item.material) parts.push(item.material);
  if (item.grammage) parts.push(`${item.grammage} جرام`);
  if (item.finish && item.finish !== 'بدون تحديد') parts.push(item.finish);

  const head = parts.join(' ');
  const priceParts = [];
  if (item.price_side_1 !== null && item.price_side_2 !== null) {
    priceParts.push(`سعر الوجه الواحد: ${item.price_side_1} جنيه / سعر الوجهين: ${item.price_side_2} جنيه`);
  } else if (item.price_side_1 !== null) {
    priceParts.push(`السعر: ${item.price_side_1} جنيه`);
  } else if (item.price_flat !== null) {
    priceParts.push(`السعر: ${item.price_flat} جنيه`);
  } else if (item.price_starting !== null) {
    priceParts.push(`السعر يبدأ من ${item.price_starting} جنيه`);
  }
  if (item.unit) priceParts.push(`(${item.unit})`);
  if (item.price_notes) priceParts.push(item.price_notes);

  return `${item.category}${item.subcategory ? ' - ' + item.subcategory : ''} - ${head}: ${priceParts.join(' - ')}`;
}

// ─────────────────────────────────────────────────────────
// Read Excel
// ─────────────────────────────────────────────────────────
if (!fs.existsSync(SRC)) {
  console.error(`ERROR: source file not found: ${SRC}`);
  process.exit(1);
}

const wb = XLSX.readFile(SRC);
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

console.log(`Read sheet: ${sheetName}`);
console.log(`Total rows: ${rows.length}`);

// ─────────────────────────────────────────────────────────
// Build items
// ─────────────────────────────────────────────────────────
const items = [];
let skipped = 0;

for (const row of rows) {
  if (isRowEmpty(row)) {
    skipped++;
    continue;
  }

  const item = {
    id: intOrNull(row['م']),
    category: s(row['الفئة']),
    subcategory: s(row['الفئة الفرعية']),
    product: s(row['المنتج']),
    size: s(row['المقاس']),
    material: s(row['الخامة']),
    grammage: intOrNull(row['الجرام']),
    finish: s(row['التشطيب']),
    side: s(row['الوجه']),
    price_side_1: num(row['سعر_الوجه_الواحد']),
    price_side_2: num(row['سعر_الوجهين']),
    price_flat: num(row['السعر_الثابت']),
    price_starting: num(row['يبدأ_من']),
    unit: s(row['وحدة_التسعير']),
    price_notes: s(row['ملاحظات_السعر']),
    notes: s(row['ملاحظات']),
  };

  // Only keep rows that have at least one price field or a note
  const hasPrice = item.price_side_1 !== null
                || item.price_side_2 !== null
                || item.price_flat !== null
                || item.price_starting !== null;
  const hasNote = !!item.price_notes || !!item.notes;

  if (!hasPrice && !hasNote) {
    skipped++;
    continue;
  }

  // Enrich with a search key (used for text fallback)
  item.search_key = normalizeAr([
    item.category,
    item.subcategory,
    item.product,
    item.size,
    item.material,
    item.grammage ? String(item.grammage) : '',
    item.finish,
  ].filter(Boolean).join(' '));

  // Enrich with a summary line for the fallback text file
  item.summary_line = buildSummaryLine(item);

  items.push(item);
}

// ─────────────────────────────────────────────────────────
// Write prices.json
// ─────────────────────────────────────────────────────────
const payload = {
  version: new Date().toISOString().slice(0, 10),
  generated_at: new Date().toISOString(),
  source: path.basename(SRC),
  total_items: items.length,
  items,
};

fs.writeFileSync(DST, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Wrote ${DST}`);
console.log(`Items: ${items.length}, Skipped: ${skipped}`);

// ─────────────────────────────────────────────────────────
// Regenerate the fallback text file
// ─────────────────────────────────────────────────────────
const lines = items.map(it => it.summary_line).filter(Boolean);
fs.writeFileSync(FALLBACK_TXT, lines.join('\n') + '\n', 'utf8');
console.log(`Updated fallback text file: ${FALLBACK_TXT}`);

console.log('Done.');
