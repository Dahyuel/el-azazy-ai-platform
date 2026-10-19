const express = require('express');
const { detectFormat, classifyOffice, classifyLegacyOffice, isDocExt, isLegacyOfficeExt, isTextExt, isPrintableText, isImageExt } = require('./lib/detect');
const { analyzeImageBuffer } = require('./lib/image');
const { analyzePdfBuffer } = require('./lib/pdf');
const { analyzeOfficeBuffer } = require('./lib/office');
const { analyzeArchiveBuffer } = require('./lib/archive');
const { analyzeLinkBuffer } = require('./lib/link');
const { analyzeTextBuffer } = require('./lib/text');
const { resolveShortLink } = require('./lib/shortlinks');
const { resolveFileHost } = require('./lib/filehosts');
const { detectPaymentLink, paymentAnalysis } = require('./lib/payments');
const { detectEgyptGov, egyptGovAnalysis } = require('./lib/egypt-gov');
const { detectDesignTool } = require('./lib/design-tools');
const { classifyLongtail } = require('./lib/longtail');
const { fetchSocialMedia, isSocialUrl } = require('./lib/social-media');
const { downloadFromDrive, isDriveUrl } = require('./lib/google-drive');
const { downloadPinterestPin, isPinterestUrl } = require('./lib/pinterest');
const { analyzeVideoBuffer } = require('./lib/video');

const app = express();
app.use(express.json({ limit: '10mb' }));

const USER_AGENT = 'Mozilla/5.0 (compatible; AzzaziBot/1.0; +https://example.com)';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analyzer-service', at: new Date().toISOString() });
});

app.post('/analyze', async (req, res) => {
  const start = Date.now();
  const { url: rawUrl, contactKey, msgId } = req.body || {};
  if (!rawUrl) return res.status(400).json({ error: 'url_required' });

  console.log(`[${contactKey || '?'}] analyze: ${String(rawUrl).slice(-100)}`);

  try {
    // ── Step 1: Resolve short-links ──
    const { url, resolved, original } = await resolveShortLink(rawUrl);
    if (resolved) {
      console.log(`[${contactKey}] short-link: ${original.slice(-60)} → ${url.slice(-60)}`);
    }

    // ── Step 2: Payment link detection ──
    const paymentProvider = detectPaymentLink(url);
    if (paymentProvider) {
      console.log(`[${contactKey}] payment link: ${paymentProvider}`);
      return res.json({
        success: true,
        analysis: paymentAnalysis(url, paymentProvider),
        totalMs: Date.now() - start
      });
    }

    // ── Step 3: Pinterest full-res download ──
    if (isPinterestUrl(url)) {
      console.log(`[${contactKey}] pinterest full-res download`);
      const pin = await downloadPinterestPin(url);

      if (pin && pin.buffer) {
        const analysis = await analyzeImageBuffer(pin.buffer);
        analysis.type = analysis.type || 'image';
        analysis.from_image = true;
        analysis.from_pinterest = true;
        analysis.name = pin.name;
        return res.json({ success: true, analysis, totalMs: Date.now() - start });
      }

      console.log(`[${contactKey}] pinterest download failed, trying screenshot`);
      const fallback = await analyzeLinkBuffer(url);
      if (fallback && !fallback.screenshot_failed) {
        fallback.from_pinterest_fallback = true;
        return res.json({ success: true, analysis: fallback, totalMs: Date.now() - start });
      }

      return res.status(422).json({
        success: false,
        error: 'pinterest_pin_unavailable',
        analysis: {
          type: 'link',
          url,
          screenshot_failed: true,
          reason: 'pinterest_pin_unavailable',
          description: 'مش قادر أفتح البين. ممكن تبعتلي سكرين شوت من اللي عاجبك فيه؟'
        },
        totalMs: Date.now() - start
      });
    }

    // ── Step 4: Social media download ──
    if (isSocialUrl(url)) {
      console.log(`[${contactKey}] social media download: ${new URL(url).hostname}`);
      const media = await fetchSocialMedia(url);

      if (media && media.type === 'image' && media.buffer) {
        const analysis = await analyzeImageBuffer(media.buffer);
        analysis.type = analysis.type || 'image';
        analysis.from_image = true;
        analysis.from_social = true;
        analysis.platform = media.platform;
        analysis.name = media.filename;
        return res.json({ success: true, analysis, totalMs: Date.now() - start });
      }

      if (media && media.type === 'video') {
        return res.json({
          success: true,
          analysis: {
            type: 'video',
            from_social: true,
            platform: media.platform,
            video_url: media.video_url,
            thumbnail_url: media.thumbnail_url,
            filename: media.filename,
            duration: media.duration,
            description: 'فيديو من سوشيال ميديا. الفريق هيراجعه.',
            likely_print_service: 'غير محدد',
            is_transfer_receipt: false
          },
          totalMs: Date.now() - start
        });
      }

      console.log(`[${contactKey}] social download failed, trying screenshot`);
      const fallback = await analyzeLinkBuffer(url);
      if (fallback && !fallback.screenshot_failed) {
        fallback.from_social_fallback = true;
        return res.json({ success: true, analysis: fallback, totalMs: Date.now() - start });
      }

      return res.status(422).json({
        success: false,
        error: 'social_post_unavailable',
        analysis: {
          type: 'link',
          url,
          screenshot_failed: true,
          reason: 'social_post_unavailable',
          description: 'مش قادر أفتح اللينك. ممكن تبعتلي سكرين شوت من اللي عاجبك فيه؟'
        },
        totalMs: Date.now() - start
      });
    }

    // ── Step 5: Google Drive download (files, folders, docs) ──
    if (isDriveUrl(url)) {
      console.log(`[${contactKey}] google drive download`);
      const files = await downloadFromDrive(url);

      if (files && files.length > 0) {
        const analyses = [];
        for (const f of files) {
          try {
            const a = await analyzeBuffer(f.buffer, f.name);
            a.name = f.name;
            a.from_drive = true;
            analyses.push(a);
          } catch (e) {
            analyses.push({ name: f.name, error: String(e.message || e) });
          }
        }

        if (analyses.length === 1) {
          return res.json({ success: true, analysis: analyses[0], totalMs: Date.now() - start });
        }

        return res.json({
          success: true,
          analysis: {
            type: 'drive_folder',
            from_drive: true,
            files_count: analyses.length,
            files: analyses,
            description: `فولدر Google Drive فيه ${analyses.length} ملف`,
            likely_print_service: 'غير محدد',
            is_transfer_receipt: false
          },
          totalMs: Date.now() - start
        });
      }

      // ── Drive failed (gdown + better-gdrive) → try screenshot as fallback ──
      const isFolder = /\/drive\/folders\//.test(url);
      console.log(`[${contactKey}] drive ${isFolder ? 'folder' : 'file'} download failed, trying screenshot`);

      const fallback = await analyzeLinkBuffer(url);
      if (fallback && !fallback.screenshot_failed) {
        fallback.from_drive_fallback = true;
        fallback.is_drive_folder = isFolder;
        return res.json({ success: true, analysis: fallback, totalMs: Date.now() - start });
      }

      // Only ask for upload if screenshot also failed
      return res.status(422).json({
        success: false,
        error: 'requires_upload',
        analysis: {
          type: 'link',
          url,
          requires_upload: true,
          host: 'drive.google.com',
          reason: isFolder ? 'drive_folder_requires_upload' : 'drive_file_requires_upload',
          screenshot_failed: true
        },
        totalMs: Date.now() - start
      });
    }

    // ── Step 6: Other file hosts ──
    const fileHost = resolveFileHost(url);
    if (fileHost) {
      if (fileHost.kind === 'requires_upload') {
        return res.status(422).json({
          success: false,
          error: 'requires_upload',
          analysis: {
            type: 'link',
            url,
            requires_upload: true,
            host: fileHost.host,
            reason: fileHost.reason,
            screenshot_failed: true
          },
          totalMs: Date.now() - start
        });
      }
      if (fileHost.kind === 'direct') {
        return await handleDirectDownload(fileHost.url, url, contactKey, msgId, start, res);
      }
    }

    // ── Step 7: Egyptian gov / edu ──
    const egyptKind = detectEgyptGov(url);
    if (egyptKind) {
      console.log(`[${contactKey}] egypt ${egyptKind}: ${new URL(url).hostname}`);
      return res.status(422).json({
        success: false,
        error: egyptKind === 'gov' ? 'egypt_gov_login_required' : 'egypt_edu_login_required',
        analysis: egyptGovAnalysis(url, egyptKind),
        totalMs: Date.now() - start
      });
    }

    // ── Step 8: Design tools ──
    const designTool = detectDesignTool(url);
    if (designTool) {
      console.log(`[${contactKey}] design tool: ${designTool.type}`);
      const analysis = await analyzeLinkBuffer(url);
      if (analysis && !analysis.screenshot_failed) {
        analysis.from_design_tool = true;
        analysis.design_tool_type = designTool.type;
      }
      return res.json({
        success: !analysis.screenshot_failed,
        analysis,
        totalMs: Date.now() - start
      });
    }

    // ── Step 9: Long-tail categories ──
    const longtail = classifyLongtail(url);
    if (longtail) {
      console.log(`[${contactKey}] longtail: ${longtail}`);
      if (longtail === 'image_cdn') {
        return await handleDirectDownload(url, rawUrl, contactKey, msgId, start, res);
      }
      const analysis = await analyzeLinkBuffer(url);
      if (analysis && !analysis.screenshot_failed) {
        analysis.longtail_category = longtail;
      }
      return res.json({
        success: !analysis.screenshot_failed,
        analysis,
        totalMs: Date.now() - start
      });
    }

    // ── Step 10: Generic download + analyze ──
    return await handleDirectDownload(url, rawUrl, contactKey, msgId, start, res);

  } catch (err) {
    console.error(`[${contactKey}] error:`, err.message);
    res.status(500).json({ success: false, error: String(err.message || err) });
  }
});

/**
 * Shared: download a URL and route by detected format.
 */
async function handleDirectDownload(url, originalUrl, contactKey, msgId, start, res) {
  let buf = null;
  let contentType = '';
  let downloadFailed = false;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Ssl': 'on'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000)
    });
    if (!r.ok) throw new Error('download_http_' + r.status);
    contentType = r.headers.get('content-type') || '';
    buf = Buffer.from(await r.arrayBuffer());
  } catch (e) {
    downloadFailed = true;
    console.log(`[${contactKey}] download failed: ${e.message}`);
  }

  if (downloadFailed) {
    const analysis = await analyzeLinkBuffer(url);
    return res.json({
      success: !analysis.screenshot_failed,
      analysis,
      totalMs: Date.now() - start
    });
  }

  console.log(`[${contactKey}] downloaded ${(buf.length / 1024).toFixed(0)} KB, ct=${contentType}`);

  let format = detectFormat(buf);
  const urlName = decodeURIComponent(String(url).split('?')[0].split('/').pop() || '');
  if (format === 'zip_or_office') format = classifyOffice(buf);
  if (format === 'doc_legacy') format = classifyLegacyOffice(buf, urlName);

  console.log(`[${contactKey}] format=${format} name=${urlName}`);

  // ── Check for HTML first (broad match) ──
  const isHtml = (
    contentType.includes('text/html') ||
    contentType.includes('xhtml') ||
    contentType.includes('application/xml') ||
    /\.(html?|php|asp|aspx)$/i.test(urlName)
  );

  // If it's HTML or an unknown format, route to link analysis
  const isVideo = /^video\//i.test(contentType) || /\.(mp4|m4v|mov|webm|mkv|avi|mpeg|mpg|3gp|ts|flv|wmv)$/i.test(urlName);
  if (isVideo) {
    const analysis = await analyzeVideoBuffer(buf, urlName || 'video');
    return res.status(analysis.error ? 422 : 200).json({
      success: !analysis.error,
      ...(analysis.error ? { error: analysis.error } : {}),
      analysis,
      totalMs: Date.now() - start
    });
  }

  if (isHtml || (format === 'unknown' && !isTextExt(urlName) && !isPrintableText(buf) && !isImageExt(urlName) && !/^image\//i.test(contentType))) {
    console.log(`[${contactKey}] routing to link analysis (html/unknown)`);
    const analysis = await analyzeLinkBuffer(url);
    return res.json({
      success: !analysis.screenshot_failed,
      analysis,
      totalMs: Date.now() - start
    });
  }

  // ── Route by format ──
  let analysis = null;

  if (isTextExt(urlName)) {
    analysis = await analyzeTextBuffer(buf, urlName);
  }
  else if (isLegacyOfficeExt(urlName) || ['doc_legacy', 'xls_legacy', 'ppt_legacy'].includes(format)) {
    analysis = await analyzeOfficeBuffer(buf, urlName);
  }
  else if (['jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic', 'avif', 'svg'].includes(format) || isImageExt(urlName) || /^image\//i.test(contentType)) {
    analysis = await analyzeImageBuffer(buf);
    analysis.type = analysis.type || 'image';
    analysis.from_image = true;
  }
  else if (format === 'pdf') {
    analysis = await analyzePdfBuffer(buf);
  }
  else if (['docx', 'pptx', 'xlsx'].includes(format) || isDocExt(urlName)) {
    analysis = await analyzeOfficeBuffer(buf, urlName);
  }
  else if (['rar', 'zip', '7z'].includes(format)) {
    analysis = await analyzeArchiveBuffer(buf, format);
  }
  else if (buf.length < 500000 && isPrintableText(buf)) {
    analysis = await analyzeTextBuffer(buf, urlName || 'file.txt');
  }
  else {
    console.log(`[${contactKey}] format unclear, trying screenshot`);
    const fallback = await analyzeLinkBuffer(url);
    return res.json({
      success: !fallback.screenshot_failed,
      analysis: fallback,
      totalMs: Date.now() - start
    });
  }

  if (analysis && analysis.error) {
    return res.status(422).json({
      success: false,
      error: analysis.error,
      analysis,
      totalMs: Date.now() - start
    });
  }

  res.json({ success: true, analysis, totalMs: Date.now() - start });
}

/**
 * Analyze a raw buffer, detect format, route to the right analyzer.
 */
async function analyzeBuffer(buf, sourceUrl) {
  let format = detectFormat(buf);
  const urlName = decodeURIComponent(String(sourceUrl).split('?')[0].split('/').pop() || '');
  if (format === 'zip_or_office') format = classifyOffice(buf);
  if (format === 'doc_legacy') format = classifyLegacyOffice(buf, urlName);

  let analysis = null;

  if (isTextExt(urlName)) {
    analysis = await analyzeTextBuffer(buf, urlName);
  }
  else if (isLegacyOfficeExt(urlName) || ['doc_legacy', 'xls_legacy', 'ppt_legacy'].includes(format)) {
    analysis = await analyzeOfficeBuffer(buf, urlName);
  }
  else if (['jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic', 'avif', 'svg'].includes(format) || isImageExt(urlName)) {
    analysis = await analyzeImageBuffer(buf);
    analysis.type = analysis.type || 'image';
    analysis.from_image = true;
  }
  else if (format === 'pdf') {
    analysis = await analyzePdfBuffer(buf);
  }
  else if (['docx', 'pptx', 'xlsx'].includes(format) || isDocExt(urlName)) {
    analysis = await analyzeOfficeBuffer(buf, urlName);
  }
  else if (['rar', 'zip', '7z'].includes(format)) {
    analysis = await analyzeArchiveBuffer(buf, format);
  }
  else if (buf.length < 500000 && isPrintableText(buf)) {
    analysis = await analyzeTextBuffer(buf, urlName || 'file.txt');
  }
  else {
    analysis = { error: 'unsupported_file_type', format, name: urlName };
  }

  return analysis;
}

const PORT = process.env.PORT || 3456;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`analyzer-service listening on :${PORT}`);
});
