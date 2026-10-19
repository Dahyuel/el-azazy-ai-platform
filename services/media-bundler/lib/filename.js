'use strict';

const ILLEGAL = /[\/\\:*?"<>|\x00-\x1f]/g;

function sanitizeBase(name) {
  return String(name || 'file')
    .replace(ILLEGAL, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'file';
}

/**
 * Build final filename with note/copies/print-type injected before extension.
 * Rule: `basename (note, N نسخ, print type).ext` — brackets omitted if empty.
 */
function buildFinalFilename(originalName, meta = {}) {
  const raw = String(originalName || 'file');
  const dotIdx = raw.lastIndexOf('.');
  const hasExt = dotIdx > 0;
  const base = hasExt ? raw.slice(0, dotIdx) : raw;
  const ext  = hasExt ? raw.slice(dotIdx)    : '';

  const cleanBase = sanitizeBase(base);

  const parts = [];
  const note = String(meta.notes || '').trim();
  if (note) parts.push(note.replace(ILLEGAL, ' ').replace(/\s+/g, ' ').trim().slice(0, 60));

  const copies = Number(meta.copies);
  if (Number.isFinite(copies) && copies > 1) parts.push(`${copies} نسخ`);

  const printType = String(meta.printType || '').trim();
  if (printType) parts.push(printType.replace(ILLEGAL, ' ').slice(0, 40));

  const tag = parts.filter(Boolean).length > 0 ? ` (${parts.filter(Boolean).join(', ')})` : '';
  return `${cleanBase}${tag}${ext}`;
}

/**
 * Ensure uniqueness within a set of used names: `x.pdf`, `x_1.pdf`, `x_2.pdf`.
 */
function uniquify(finalName, usedSet) {
  if (!usedSet.has(finalName)) {
    usedSet.add(finalName);
    return finalName;
  }
  const dotIdx = finalName.lastIndexOf('.');
  const hasExt = dotIdx > 0;
  const base = hasExt ? finalName.slice(0, dotIdx) : finalName;
  const ext  = hasExt ? finalName.slice(dotIdx)    : '';
  let i = 1;
  while (usedSet.has(`${base}_${i}${ext}`)) i++;
  const unique = `${base}_${i}${ext}`;
  usedSet.add(unique);
  return unique;
}

module.exports = { buildFinalFilename, uniquify, sanitizeBase };
