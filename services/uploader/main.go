package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

const (
	chatwootURL        = "http://rails:3000"
	apiToken           = "REPLACE_WITH_YOUR_SECRET"
	accountID          = "2"
	port               = "3001"
	maxFileSize        = 100 * 1024 * 1024 // 100MB per file
	maxTotalSize       = 800 * 1024 * 1024 // 800MB per request
	maxFilesPerRequest = 30
)

// Per-conversation file counter
var (
	counters = make(map[string]int)
	mu       sync.Mutex
)

func getNextCounter(convID string) int {
	mu.Lock()
	defer mu.Unlock()
	counters[convID]++
	return counters[convID]
}

func getNextCounterN(convID string, n int) int {
	mu.Lock()
	defer mu.Unlock()
	start := counters[convID] + 1
	counters[convID] += n
	return start
}

var allowedExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
	".webp": true, ".bmp": true, ".tiff": true, ".tif": true, ".svg": true,
	".mp4": true, ".avi": true, ".mov": true, ".mkv": true,
	".wmv": true, ".flv": true, ".webm": true,
	".mp3": true, ".wav": true, ".ogg": true, ".aac": true,
	".pdf": true, ".doc": true, ".docx": true,
	".xls": true, ".xlsx": true, ".ppt": true, ".pptx": true,
	".txt": true, ".csv": true,
	".zip": true, ".rar": true, ".7z": true, ".tar": true, ".gz": true,
	".psd": true, ".ai": true, ".eps": true, ".indd": true,
	".fig": true, ".sketch": true, ".xd": true,
}

func main() {
	http.HandleFunc("/upload/", handleUploadPage)
	http.HandleFunc("/do-upload/", handleFileUpload)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
	fmt.Printf("Upload server on :%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func handleUploadPage(w http.ResponseWriter, r *http.Request) {
	convID := strings.TrimPrefix(r.URL.Path, "/upload/")
	convID = strings.TrimSuffix(convID, "/")
	if convID == "" {
		http.Error(w, "Conversation ID required", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, htmlPage, convID, convID)
}

// ─────────────────────────────────────────────────────────────
// Multi-file upload handler
//
// Accepts:
//   - "files"     (new — multiple files)
//   - "files[]"   (HTML form array syntax — multiple files)
//   - "file"      (legacy — single file, backward compat)
//
// All collected files go into ONE Chatwoot message with ONE private note.
// ─────────────────────────────────────────────────────────────
func handleFileUpload(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte(`{"error":"Method not allowed"}`))
		return
	}

	convID := strings.TrimPrefix(r.URL.Path, "/do-upload/")
	convID = strings.TrimSuffix(convID, "/")
	if convID == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"Conversation ID required"}`))
		return
	}

	// 800 MB max total
	if err := r.ParseMultipartForm(maxTotalSize); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		writeJSON(w, map[string]string{"error": "Failed to parse form: " + err.Error()})
		return
	}

	// ── Collect files from all field names ──
	var fileHeaders []*multipart.FileHeader

	for _, field := range []string{"files", "files[]", "file"} {
		if fhs, ok := r.MultipartForm.File[field]; ok {
			fileHeaders = append(fileHeaders, fhs...)
		}
	}

	if len(fileHeaders) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"No files provided"}`))
		return
	}

	if len(fileHeaders) > maxFilesPerRequest {
		w.WriteHeader(http.StatusBadRequest)
		writeJSON(w, map[string]string{
			"error": fmt.Sprintf("Too many files (max %d per request)", maxFilesPerRequest),
		})
		return
	}

	// ── Validate ALL files first ──
	type loadedFile struct {
		Name  string
		Bytes []byte
		Size  int64
	}
	var loaded []loadedFile
	var totalSize int64
	var rejected []string

	for _, header := range fileHeaders {
		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedExtensions[ext] {
			rejected = append(rejected, header.Filename)
			continue
		}

		f, err := header.Open()
		if err != nil {
			rejected = append(rejected, header.Filename)
			continue
		}

		b, err := io.ReadAll(f)
		f.Close()
		if err != nil {
			rejected = append(rejected, header.Filename)
			continue
		}

		totalSize += int64(len(b))
		if totalSize > maxTotalSize {
			w.WriteHeader(http.StatusRequestEntityTooLarge)
			writeJSON(w, map[string]string{
				"error": fmt.Sprintf("Total size exceeds %d MB", maxTotalSize/1024/1024),
			})
			return
		}

		loaded = append(loaded, loadedFile{
			Name:  header.Filename,
			Bytes: b,
			Size:  int64(len(b)),
		})
	}

	if len(loaded) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		writeJSON(w, map[string]interface{}{
			"error":    "No valid files (unsupported types)",
			"rejected": rejected,
		})
		return
	}

	// ── Build the private note ──
	startNum := getNextCounterN(convID, len(loaded))

	var noteBuf strings.Builder
	if len(loaded) == 1 {
		noteBuf.WriteString(fmt.Sprintf("📎 ملف رقم %d", startNum))
		if loaded[0].Size > maxFileSize {
			noteBuf.WriteString(" - حجم الملف أكبر من ١٠٠ ميجابايت")
		}
	} else {
		noteBuf.WriteString(fmt.Sprintf("📎 %d ملفات (أرقام %d-%d)",
			len(loaded), startNum, startNum+len(loaded)-1))
	}

	note := noteBuf.String()

	// ── Build multipart body for Chatwoot ──
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)

	mw.WriteField("message_type", "outgoing")
	mw.WriteField("content", note)
	mw.WriteField("private", "true")

	// Attach every file with field name "attachments[]"
	for _, lf := range loaded {
		fw, err := mw.CreateFormFile("attachments[]", lf.Name)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			writeJSON(w, map[string]string{"error": "Failed to build request"})
			return
		}
		if _, err := fw.Write(lf.Bytes); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			writeJSON(w, map[string]string{"error": "Failed to write attachment"})
			return
		}
	}

	if err := mw.Close(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		writeJSON(w, map[string]string{"error": "Failed to finalize request"})
		return
	}

	// ── Send to Chatwoot ──
	url := fmt.Sprintf("%s/api/v1/accounts/%s/conversations/%s/messages",
		chatwootURL, accountID, convID)

	req, err := http.NewRequest("POST", url, &buf)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		writeJSON(w, map[string]string{"error": "Failed to create request"})
		return
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())
	req.Header.Set("api_access_token", apiToken)
	req.Header.Set("X-Forwarded-Proto", "https")
	req.Header.Set("X-Forwarded-Ssl", "on")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusBadGateway)
		writeJSON(w, map[string]string{"error": "Failed to reach Chatwoot"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		writeJSON(w, map[string]interface{}{
			"success":  true,
			"count":    len(loaded),
			"rejected": rejected,
			"note":     note,
		})
		return
	}

	// Chatwoot returned an error
	body, _ := io.ReadAll(resp.Body)
	w.WriteHeader(http.StatusBadGateway)
	writeJSON(w, map[string]interface{}{
		"error":  fmt.Sprintf("Chatwoot error %d", resp.StatusCode),
		"detail": string(body),
	})
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	b, _ := json.Marshal(v)
	w.Write(b)
}

const htmlPage = `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Al Azazy — Upload Files</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#ffffff;--fg:#0a0a0a;--muted:#6b6b6b;
  --border:#e2e2e2;--accent:#0a0a0a;
  --success:#16a34a;--error:#dc2626;
  --radius:12px;
  --shadow-lg:0 4px 6px rgba(0,0,0,.05),0 20px 60px rgba(0,0,0,.12);
}
html,body{height:100%%;background:var(--bg);color:var(--fg);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
body{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}

.card{width:100%%;max-width:560px;background:#fff;border:1px solid var(--border);border-radius:20px;padding:40px;box-shadow:var(--shadow-lg);animation:slideUp .5s cubic-bezier(.16,1,.3,1) both}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.brand{display:flex;align-items:center;gap:12px;margin-bottom:24px;animation:fadeIn .5s ease .1s both}
.brand-logo{width:40px;height:40px;background:var(--fg);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.brand-logo svg{width:20px;height:20px;fill:#fff}
.brand-name{font-size:18px;font-weight:600;letter-spacing:-.3px}
.brand-sub{font-size:12px;color:var(--muted);margin-top:1px}

@keyframes fadeIn{from{opacity:0}to{opacity:1}}

h1{font-size:22px;font-weight:600;letter-spacing:-.5px;margin-bottom:6px;animation:fadeIn .5s ease .15s both}
.subtitle{font-size:14px;color:var(--muted);margin-bottom:28px;line-height:1.5;animation:fadeIn .5s ease .2s both}

.drop-zone{border:2px dashed var(--border);border-radius:var(--radius);padding:40px 20px;text-align:center;cursor:pointer;transition:all .25s ease;position:relative;background:#fafafa;animation:fadeIn .5s ease .25s both}
.drop-zone:hover,.drop-zone.drag-over{border-color:var(--accent);background:#f5f5f5;transform:scale(1.01)}
.drop-zone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%%;height:100%%}

.drop-icon{width:48px;height:48px;margin:0 auto 14px;background:var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;transition:all .25s ease}
.drop-zone:hover .drop-icon{background:var(--fg)}
.drop-zone:hover .drop-icon svg{fill:#fff}
.drop-icon svg{width:22px;height:22px;fill:var(--muted);transition:fill .25s}
.drop-label{font-size:14px;font-weight:500;margin-bottom:4px}
.drop-hint{font-size:12px;color:var(--muted);font-family:'DM Mono',monospace}

.files-list{margin-top:16px;display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto}
.file-info{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f5f5f5;border-radius:8px;border:1px solid var(--border);animation:fadeIn .3s ease both}
.file-icon{width:36px;height:36px;background:var(--fg);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.file-icon svg{width:16px;height:16px;fill:#fff}
.file-meta{flex:1;min-width:0}
.file-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.file-size{font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;margin-top:2px}
.remove-file{background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;border-radius:4px;transition:color .2s;display:flex}
.remove-file:hover{color:var(--error)}
.remove-file svg{width:16px;height:16px;fill:currentColor}

.files-summary{margin-top:12px;padding:10px 14px;background:#eff6ff;border-radius:8px;font-size:12px;color:#1e40af;text-align:center;animation:fadeIn .3s ease both;display:none}
.files-summary.show{display:block}

.progress-wrap{display:none;margin-top:16px;animation:fadeIn .3s ease both}
.progress-wrap.show{display:block}
.progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.progress-label{font-size:12px;font-weight:500}
.progress-pct{font-size:12px;font-family:'DM Mono',monospace;color:var(--muted)}
.progress-bar{height:6px;background:var(--border);border-radius:6px;overflow:hidden}
.progress-fill{height:100%%;background:var(--fg);border-radius:6px;width:0%%;transition:width .2s ease}
.progress-speed{font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;margin-top:4px}

.btn{width:100%%;margin-top:20px;padding:14px;background:var(--fg);color:#fff;border:none;border-radius:var(--radius);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s ease;letter-spacing:.2px;animation:fadeIn .5s ease .3s both;display:flex;align-items:center;justify-content:center;gap:8px}
.btn:hover:not(:disabled){background:#222;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.2)}
.btn:active:not(:disabled){transform:translateY(0)}
.btn:disabled{background:#ccc;cursor:not-allowed;transform:none;box-shadow:none}
.spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%%;animation:spin .6s linear infinite;display:none;flex-shrink:0}
.btn.loading .spinner{display:block}
@keyframes spin{to{transform:rotate(360deg)}}

.popup-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:100;align-items:center;justify-content:center;padding:24px}
.popup-overlay.show{display:flex;animation:overlayIn .25s ease both}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
.popup{background:#fff;border-radius:20px;padding:36px 32px;max-width:380px;width:100%%;text-align:center;box-shadow:var(--shadow-lg);animation:popupIn .35s cubic-bezier(.16,1,.3,1) both}
@keyframes popupIn{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.popup-icon{width:64px;height:64px;border-radius:50%%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.popup-icon.success{background:#dcfce7}
.popup-icon.error{background:#fee2e2}
.popup-icon svg{width:28px;height:28px}
.popup-icon.success svg{fill:var(--success)}
.popup-icon.error svg{fill:var(--error)}
.popup-title{font-size:18px;font-weight:600;letter-spacing:-.3px;margin-bottom:8px}
.popup-msg{font-size:14px;color:var(--muted);line-height:1.6;margin-bottom:24px}
.popup-btn{padding:11px 28px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
.popup-btn.success{background:var(--success);color:#fff}
.popup-btn.success:hover{background:#15803d}
.popup-btn.error{background:var(--error);color:#fff}
.popup-btn.error:hover{background:#b91c1c}

.conv-id{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);margin-top:28px;text-align:center;animation:fadeIn .5s ease .4s both}
</style>
</head>
<body>
<div class="card">
  <div class="brand">
    <div class="brand-logo">
      <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
    </div>
    <div>
      <div class="brand-name">Al Azazy</div>
      <div class="brand-sub">File Upload Portal</div>
    </div>
  </div>

  <h1>Send Your Files</h1>
  <p class="subtitle">Upload files directly to your conversation. Supports documents, images, videos, and design files.</p>

  <div class="drop-zone" id="dropZone">
    <input type="file" id="fileInput" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg,.mp4,.avi,.mov,.mkv,.wmv,.flv,.webm,.mp3,.wav,.ogg,.aac,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.tar,.gz,.psd,.ai,.eps,.indd,.fig,.sketch,.xd">
    <div class="drop-icon">
      <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
    </div>
    <div class="drop-label">Drop files here or click to browse</div>
    <div class="drop-hint">PDF · DOC · XLS · PSD · AI · MP4 · JPG · ZIP and more · multiple allowed</div>
  </div>

  <div class="files-list" id="filesList"></div>

  <div class="files-summary" id="filesSummary"></div>

  <div class="progress-wrap" id="progressWrap">
    <div class="progress-header">
      <span class="progress-label">Uploading...</span>
      <span class="progress-pct" id="progressPct">0%%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <div class="progress-speed" id="progressSpeed"></div>
  </div>

  <button class="btn" id="uploadBtn" disabled>
    <span class="spinner"></span>
    <span id="uploadBtnText">Upload File</span>
  </button>

  <div class="conv-id">Conversation #%s</div>
</div>

<!-- Success Popup -->
<div class="popup-overlay" id="successPopup">
  <div class="popup">
    <div class="popup-icon success">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    </div>
    <div class="popup-title">Files Sent!</div>
    <p class="popup-msg">Your files have been uploaded successfully and added to the conversation.</p>
    <button class="popup-btn success" onclick="closePopup('successPopup')">Done</button>
  </div>
</div>

<!-- Error Popup -->
<div class="popup-overlay" id="errorPopup">
  <div class="popup">
    <div class="popup-icon error">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
    </div>
    <div class="popup-title">Upload Failed</div>
    <p class="popup-msg" id="errorMsg">Something went wrong. Please try again.</p>
    <button class="popup-btn error" onclick="closePopup('errorPopup')">Close</button>
  </div>
</div>

<script>
const convID = '%s';
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const filesSummary = document.getElementById('filesSummary');
const uploadBtn = document.getElementById('uploadBtn');
const uploadBtnText = document.getElementById('uploadBtnText');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressPct = document.getElementById('progressPct');
const progressSpeed = document.getElementById('progressSpeed');

let selectedFiles = [];

function formatSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderFiles() {
  filesList.innerHTML = '';
  if (selectedFiles.length === 0) {
    filesSummary.classList.remove('show');
    uploadBtn.disabled = true;
    uploadBtnText.textContent = 'Upload File';
    return;
  }

  selectedFiles.forEach((f, idx) => {
    const row = document.createElement('div');
    row.className = 'file-info';
    row.innerHTML =
      '<div class="file-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg></div>' +
      '<div class="file-meta">' +
        '<div class="file-name">' + escapeHtml(f.name) + '</div>' +
        '<div class="file-size">' + formatSize(f.size) + '</div>' +
      '</div>' +
      '<button class="remove-file" data-idx="' + idx + '" title="Remove">' +
        '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '</button>';
    filesList.appendChild(row);
  });

  filesList.querySelectorAll('.remove-file').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const i = parseInt(btn.dataset.idx, 10);
      selectedFiles.splice(i, 1);
      renderFiles();
    });
  });

  // Summary
  const total = selectedFiles.reduce((s, f) => s + f.size, 0);
  filesSummary.textContent = selectedFiles.length + ' file' + (selectedFiles.length > 1 ? 's' : '') +
    ' selected · ' + formatSize(total) + ' total';
  filesSummary.classList.add('show');

  uploadBtn.disabled = false;
  uploadBtnText.textContent = 'Upload ' + selectedFiles.length + ' File' + (selectedFiles.length > 1 ? 's' : '');
}

function addFiles(fileList) {
  for (const f of fileList) {
    // Prevent exact duplicates by name+size
    const isDup = selectedFiles.some(x => x.name === f.name && x.size === f.size);
    if (!isDup) selectedFiles.push(f);
  }
  renderFiles();
}

function clearFiles() {
  selectedFiles = [];
  fileInput.value = '';
  renderFiles();
  progressWrap.classList.remove('show');
  progressFill.style.width = '0%%';
  progressPct.textContent = '0%%';
  progressSpeed.textContent = '';
}

fileInput.addEventListener('change', e => {
  if (e.target.files.length) addFiles(e.target.files);
});

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});

uploadBtn.addEventListener('click', () => {
  if (selectedFiles.length === 0) return;
  uploadBtn.classList.add('loading');
  uploadBtn.disabled = true;
  progressWrap.classList.add('show');

  const formData = new FormData();
  selectedFiles.forEach(f => formData.append('files', f, f.name));

  const xhr = new XMLHttpRequest();
  const startTime = Date.now();

  xhr.upload.addEventListener('progress', e => {
    if (!e.lengthComputable) return;
    const pct = Math.round((e.loaded / e.total) * 100);
    progressFill.style.width = pct + '%%';
    progressPct.textContent = pct + '%%';
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > 0.5) {
      const speed = e.loaded / elapsed;
      const remaining = (e.total - e.loaded) / speed;
      progressSpeed.textContent = formatSize(speed) + '/s · ' +
        (remaining < 60 ? Math.ceil(remaining) + 's left' : Math.ceil(remaining/60) + 'm left');
    }
  });

  xhr.addEventListener('load', () => {
    progressFill.style.width = '100%%';
    progressPct.textContent = '100%%';
    progressSpeed.textContent = '';
    uploadBtn.classList.remove('loading');
    setTimeout(() => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          const count = data.count || selectedFiles.length;
          document.querySelector('#successPopup .popup-title').textContent =
            count + ' File' + (count > 1 ? 's' : '') + ' Sent!';
          document.getElementById('successPopup').classList.add('show');
          clearFiles();
        } else {
          document.getElementById('errorMsg').textContent = data.error || 'Upload failed.';
          document.getElementById('errorPopup').classList.add('show');
          uploadBtn.disabled = false;
        }
      } catch {
        document.getElementById('errorMsg').textContent = 'Unexpected server response.';
        document.getElementById('errorPopup').classList.add('show');
        uploadBtn.disabled = false;
      }
    }, 400);
  });

  xhr.addEventListener('error', () => {
    uploadBtn.classList.remove('loading');
    uploadBtn.disabled = false;
    progressWrap.classList.remove('show');
    document.getElementById('errorMsg').textContent = 'Network error. Please check your connection.';
    document.getElementById('errorPopup').classList.add('show');
  });

  xhr.open('POST', '/do-upload/' + convID);
  xhr.send(formData);
});

function closePopup(id) { document.getElementById(id).classList.remove('show'); }
</script>
</body>
</html>`
