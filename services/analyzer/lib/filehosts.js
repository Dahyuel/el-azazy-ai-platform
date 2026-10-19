const USER_AGENT = 'Mozilla/5.0 (compatible; AzzaziBot/1.0; +https://example.com)';

const REQUIRES_UPLOAD_HOSTS = new Set([
  'mediafire.com',
  'wetransfer.com',
  'we.tl',
  'mab.to',
  'swisstransfer.com',
  'transfernow.net',
  'wesendit.com',
  'fromsmash.com',
  'files.fm',
  'sendgb.com',
  'limewire.com',
  'filebin.net'
]);

function detectFileHost(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host === 'drive.google.com' || host === 'docs.google.com') return 'google';
    if (host === 'export-download.canva.com' || host === 'download.canva.com') return 'canva_direct';
    if (host === '1drv.ms' || host === 'onedrive.live.com' || host.endsWith('.sharepoint.com')) return 'microsoft';
    if (REQUIRES_UPLOAD_HOSTS.has(host)) return 'requires_upload';
    if (host.endsWith('.storage.googleapis.com') || host.endsWith('.s3.amazonaws.com') || host === 'storage.googleapis.com') return 'direct';

    return null;
  } catch (e) {
    return null;
  }
}

function resolveFileHost(url) {
  const kind = detectFileHost(url);
  if (!kind) return null;

  if (kind === 'google') {
    return { kind: 'google_drive', url, host: new URL(url).hostname };
  }

  if (kind === 'canva_direct') {
    return { kind: 'direct', url, host: 'canva_download', subtype: 'canva_export' };
  }

  if (kind === 'microsoft') {
    return { kind: 'requires_upload', host: 'onedrive', reason: 'requires_upload' };
  }

  if (kind === 'requires_upload') {
    return { kind: 'requires_upload', host: new URL(url).hostname, reason: 'file_host_no_public_download' };
  }

  if (kind === 'direct') {
    return { kind: 'direct', url, host: new URL(url).hostname, subtype: 'direct_file' };
  }

  return null;
}

module.exports = { resolveFileHost, detectFileHost };
