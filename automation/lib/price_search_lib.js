
function normalizeAr(s) {
    return s
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ـ/g, '');
}

function stripAl(t) {
    if (t.length > 4 && t.slice(0, 3) === 'وال') return t.slice(3);
    if (t.length > 3 && t.slice(0, 2) === 'ال') return t.slice(2);
    return t;
}

function tokenize(s) {
    return normalizeAr(s.toLowerCase()).split(/[^؀-ۿa-z0-9]+/).filter(Boolean).map(stripAl);
}

const stopBase = ['خدمة','خدمات','متاح','متاحة','متوفر','متوفرة','منتج','منتجات','اسعار','سعر','عايز','اريد','طباعة','يوجد','هل','في','من','عن','كم','ما','هي','التي','تقدمها','عندكم','عندكو','لو','كل','كلها','كام','بكام','ايه','انواع'];
const stop = new Set(stopBase.flatMap(w => tokenize(w)));

function getCoreWords(queryText) {
  const q = String(queryText).toLowerCase().trim();
    let words = tokenize(q).filter(w => w.length > 1);
      const core = words.filter(w => !stop.has(w));
        return { words, core };
        }
        
        function scoreLines(lines, words) {
          const scored = lines.map(line => {
              const tokens = tokenize(line);
                  let score = 0;
                      for (const w of words) {
                            if (tokens.some(t => t === w || t.startsWith(w) || w.startsWith(t))) score++;
                                }
                                    return { line, score };
                                      }).filter(x => x.score > 0);
                                        if (scored.length === 0) return { found: false };
                                          const maxScore = Math.max(...scored.map(x => x.score));
                                            if (words.length > 1 && maxScore < 2) return { found: false };
                                              let best = scored.filter(x => x.score === maxScore).map(x => x.line);
                                                if (best.length < 3 && maxScore > 1) {
                                                    best = best.concat(scored.filter(x => x.score === maxScore - 1).map(x => x.line));
                                                      }
                                                        const MAX_RESULTS = 15;
                                                          const limited = best.slice(0, MAX_RESULTS);
                                                            return { found: true, maxScore, limited };
                                                            }
                                                            
                                                            module.exports = { normalizeAr, stripAl, tokenize, stopBase, stop, getCoreWords, scoreLines };
                                                            