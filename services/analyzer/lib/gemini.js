const N8N_ANALYZE_URL = process.env.N8N_ANALYZE_URL
  || 'http://n8n-n8n-1:5678/webhook/REPLACE_WITH_YOUR_SECRET';

async function analyzeImage(base64, mime) {
  const resp = await fetch(N8N_ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mime })
  });
  if (!resp.ok) throw new Error('n8n_webhook_http_' + resp.status);
  const data = await resp.json();
  if (data.error) throw new Error('gemini_error: ' + data.error);
  return data;
}

module.exports = { analyzeImage };
