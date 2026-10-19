const N8N_ANALYZE_URL = process.env.N8N_ANALYZE_URL
  || 'http://n8n-n8n-1:5678/webhook/REPLACE_WITH_YOUR_SECRET';

async function callGeminiText(prompt) {
  const resp = await fetch(N8N_ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: prompt })
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`gemini_text_http_${resp.status}: ${txt.slice(0, 200)}`);
  }
  const data = await resp.json();
  if (data.error) throw new Error('gemini_text_error: ' + data.error);
  return data;
}

async function analyzeTextBuffer(buf, originalName) {
  let text = '';
  try {
    text = buf.toString('utf-8');
  } catch (e) {
    text = buf.toString('latin1');
  }

  if (!text || text.trim().length < 5) {
    return { error: 'text_file_empty', name: originalName };
  }

  const truncated = text.slice(0, 3000);
  const ext = (String(originalName || '').split('.').pop() || '').toLowerCase();

  const prompt = `You are analyzing a text file sent by a customer to a print shop.

File name: ${originalName || 'file'}
File extension: .${ext}
File content (first 3000 chars):
"""
${truncated}
"""

Return JSON only with these fields:
{
  "type": "text_file",
  "description": "short Arabic summary of what this file contains (2 lines max)",
  "content_type": "invoice | receipt | contract | design_spec | code | list | form | note | other",
  "is_transfer_receipt": false,
  "likely_print_service": "غير محدد",
  "word_count": 0
}

Rules:
- type is always "text_file".
- description: 2 lines max in Arabic.
- content_type: pick the best fit. If unclear, use "other".
- is_transfer_receipt: true only if the text contains a payment receipt.
- likely_print_service: if the text hints at a print service, name it. Otherwise "غير محدد".
- word_count: approximate count of words in the full file (not just the sample).`;

  let analysis;
  try {
    analysis = await callGeminiText(prompt);
  } catch (e) {
    return {
      type: 'text_file',
      error: 'gemini_text_failed',
      detail: String(e.message || e).slice(0, 200),
      name: originalName
    };
  }

  analysis.type = 'text_file';
  analysis.from_text = true;
  analysis.name = originalName;
  analysis.ext = ext;
  analysis.chars = text.length;
  analysis.lines = text.split('\n').length;
  analysis.text_preview = text.slice(0, 500);

  const pagesMatch = text.match(/\b(\d{1,4})\s*(?:pages?|صفحات?|صفحه|صفحة)\b/i);
  if (pagesMatch) {
    analysis.page_count_mentioned = parseInt(pagesMatch[1], 10);
  }

  return analysis;
}

module.exports = { analyzeTextBuffer };
