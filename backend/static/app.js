const $ = (id) => document.getElementById(id);

function T(key, vars) {
  if (typeof window.CeromanciaI18n !== "undefined") {
    return window.CeromanciaI18n.t(key, vars);
  }
  return key;
}

const uploadPanel = $("uploadPanel");
const dropzone = $("dropzone");
const fileInput = $("file");
const fileStatus = $("fileStatus");
const changePhotoBtn = $("changePhotoBtn");
const previewWrap = $("previewWrap");
const preview = $("preview");
const previewNote = $("previewNote");
const intencionEl = $("intencion");
const intencionCounter = $("intencionCounter");
const analyzeBtn = $("analyzeBtn");
const errorEl = $("error");
const results = $("results");
const intentionBridge = $("intentionBridge");
const principal = $("principal");
const alternatives = $("alternatives");

let selectedFile = null;
let previewObjectUrl = null;

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function updateIntencionCounter() {
  if (!intencionEl || !intencionCounter) return;
  const n = intencionEl.value.length;
  intencionCounter.textContent = T("intention_counter", { n });
}

intencionEl?.addEventListener("input", updateIntencionCounter);
updateIntencionCounter();

document.addEventListener("ceromancia:lang", () => {
  updateIntencionCounter();
  if (selectedFile && fileStatus && !fileStatus.hidden) {
    const name = selectedFile.name || "—";
    fileStatus.textContent = T("file_ready", { name, size: formatBytes(selectedFile.size) });
  }
  if (previewNote && !previewNote.hidden && selectedFile && isHeicLike(selectedFile)) {
    previewNote.textContent = T("heic_note");
  }
});

document.querySelectorAll(".intention-chips .chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-intent-id");
    if (!id || !intencionEl) return;
    if (typeof window.CeromanciaI18n !== "undefined") {
      intencionEl.value = window.CeromanciaI18n.intentValue(id);
    } else {
      const lab = btn.querySelector(".chip-label");
      intencionEl.value = lab ? lab.textContent : "";
    }
    updateIntencionCounter();
    intencionEl.focus();
  });
});

function isLikelyImageFile(file) {
  if (!file || file.size === 0) return false;
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  if (t === "application/octet-stream") {
    const n = (file.name || "").toLowerCase();
    return /\.(heic|heif|jpg|jpeg|png|webp|gif|bmp|tif|tiff|avif)$/i.test(n);
  }
  const n = (file.name || "").toLowerCase();
  if (/\.(heic|heif|jpg|jpeg|png|webp|gif|bmp|tif|tiff|avif)$/i.test(n)) return true;
  // iPhone a veces deja MIME vacío pero el archivo viene de Fotos
  if (!t && file.size > 200 && file.size < 40 * 1024 * 1024) {
    if (!n || /^img_\d+\.(heic|jpg|jpeg|png)$/i.test(n) || /^image\./i.test(n)) return true;
  }
  return false;
}

function isHeicLike(file) {
  const t = (file.type || "").toLowerCase();
  if (t === "image/heic" || t === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name || "");
}

function setFile(file) {
  if (!isLikelyImageFile(file)) {
    showError(T("err_not_image"));
    return;
  }
  selectedFile = file;
  showError("");
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  previewNote.hidden = true;
  previewNote.textContent = "";
  preview.classList.remove("preview-hidden");

  const name = file.name || "—";
  if (fileStatus) {
    fileStatus.hidden = false;
    fileStatus.textContent = T("file_ready", { name, size: formatBytes(file.size) });
  }
  if (changePhotoBtn) changePhotoBtn.hidden = false;

  if (isHeicLike(file)) {
    preview.removeAttribute("src");
    previewNote.textContent = T("heic_note");
    previewNote.hidden = false;
    preview.classList.add("preview-hidden");
  } else {
    previewObjectUrl = URL.createObjectURL(file);
    preview.src = previewObjectUrl;
    preview.onerror = () => {
      preview.classList.add("preview-hidden");
      previewNote.textContent = T("preview_error_note");
      previewNote.hidden = false;
    };
    preview.onload = () => {
      preview.classList.remove("preview-hidden");
    };
  }

  previewWrap.hidden = false;
  analyzeBtn.disabled = false;
}

fileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) setFile(f);
  queueMicrotask(() => {
    e.target.value = "";
  });
});

changePhotoBtn?.addEventListener("click", (ev) => {
  ev.preventDefault();
  fileInput?.click();
});

const dragTarget = uploadPanel || dropzone;
["dragenter", "dragover"].forEach((ev) => {
  dragTarget.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("drag");
  });
});
["dragleave", "drop"].forEach((ev) => {
  dragTarget.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag");
  });
});
dragTarget.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) setFile(f);
});

function renderIntentionBridge(data) {
  if (!intentionBridge) return;
  if (data.intencion_recibida && data.puente_intencion) {
    intentionBridge.hidden = false;
    intentionBridge.innerHTML = `
      <p class="intention-bridge-label">${escapeHtml(T("bridge_label"))}</p>
      <p class="intention-bridge-quote">«${escapeHtml(data.intencion_recibida)}»</p>
      <p class="intention-bridge-text">${escapeHtml(data.puente_intencion)}</p>
    `;
  } else {
    intentionBridge.hidden = true;
    intentionBridge.innerHTML = "";
  }
}

function renderPrincipal(p) {
  const tags = (p.etiquetas || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  const simbolico =
    typeof p.mensaje_simbolico === "string" && p.mensaje_simbolico.trim()
      ? p.mensaje_simbolico.trim()
      : (p.interpretacion || "").trim();
  const pct = (p.probabilidad * 100).toFixed(0);
  principal.innerHTML = `
    <h3 class="card-title">${escapeHtml(p.nombre)}</h3>
    <p class="card-confidence" aria-label="${escapeHtml(T("confidence_aria"))}">
      ${escapeHtml(T("confidence_line", { pct }))}
    </p>
    <ul class="card-tags">${tags}</ul>
    <p class="card-body">${escapeHtml(simbolico)}</p>
  `;
}

function renderAlternatives(items) {
  alternatives.innerHTML = items
    .map((p) => {
      const cuerpo =
        typeof p.analisis_pista === "string" && p.analisis_pista.trim()
          ? p.analisis_pista.trim()
          : (p.interpretacion || "").trim();
      const pct = (p.probabilidad * 100).toFixed(0);
      return `
    <li>
      <span class="alt-name">${escapeHtml(p.nombre)}</span>
      <span class="alt-pct">${escapeHtml(T("alt_probability_line", { pct }))}</span>
      <p class="alt-body">${escapeHtml(cuerpo)}</p>
    </li>`;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

document.querySelectorAll(".tab-strip a.tab").forEach((tab) => {
  tab.addEventListener("click", (ev) => {
    const href = tab.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      const studioBody = document.querySelector(".shell-body--studio");
      if (target && studioBody && studioBody.contains(target)) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    document.querySelectorAll(".tab-strip a.tab").forEach((t) => t.classList.remove("tab--active"));
    tab.classList.add("tab--active");
  });
});

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  showError("");
  analyzeBtn.disabled = true;
  analyzeBtn.dataset.analyzing = "1";
  const label = analyzeBtn.querySelector(".btn-primary-label");
  if (label) label.textContent = T("btn_analyzing");
  results.hidden = true;
  try {
    const fd = new FormData();
    fd.append("file", selectedFile, selectedFile.name || "photo.jpg");
    fd.append("intencion", intencionEl ? intencionEl.value.trim() : "");
    const res = await fetch("/api/analizar?top_k=4", {
      method: "POST",
      body: fd,
    });
    let data = {};
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    if (!res.ok) {
      const detail = data.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join(" ")
            : res.statusText || T("err_server_fallback");
      throw new Error(msg);
    }
    renderIntentionBridge(data);
    renderPrincipal(data.patron_principal);
    renderAlternatives(data.patrones.slice(1));
    results.hidden = false;
    document.querySelectorAll(".tab-strip a.tab").forEach((t) => t.classList.remove("tab--active"));
    document.querySelector('.tab-strip a.tab[href="#results"]')?.classList.add("tab--active");
    requestAnimationFrame(() => {
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } catch (e) {
    showError(e.message || T("err_analyze_fallback"));
  } finally {
    delete analyzeBtn.dataset.analyzing;
    analyzeBtn.disabled = false;
    if (typeof window.CeromanciaI18n !== "undefined") {
      window.CeromanciaI18n.apply();
    } else {
      const lbl = analyzeBtn.querySelector(".btn-primary-label");
      if (lbl) lbl.textContent = "Analizar imagen";
    }
  }
});
