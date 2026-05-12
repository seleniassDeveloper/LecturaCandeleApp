const $ = (id) => document.getElementById(id);

function T(key, vars) {
  if (typeof window.CeromanciaI18n !== "undefined") {
    return window.CeromanciaI18n.t(key, vars);
  }
  return key;
}

const appPage = $("appPage");
const wizardStudioBody = $("wizardStudioBody");
const wizardStep1 = $("wizardStep1");
const wizardStep2 = $("wizardStep2");
const wizardContinueBtn = $("wizardContinueBtn");
const wizardBackBtn = $("wizardBackBtn");
const newReadingBtn = $("newReadingBtn");
const stepperBtn3 = $("stepperBtn3");
const appFooter = $("appFooter");

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
let wizardStep = 1;
let readingReady = false;

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function syncWizardContinue() {
  if (wizardContinueBtn) wizardContinueBtn.disabled = !selectedFile;
}

function updateStepperUI() {
  document.querySelectorAll("[data-wizard-go]").forEach((btn) => {
    const step = parseInt(btn.getAttribute("data-wizard-go"), 10);
    if (!Number.isFinite(step)) return;
    const active = step === wizardStep;
    btn.classList.toggle("tab--active", active);
    if (active) btn.setAttribute("aria-current", "step");
    else btn.removeAttribute("aria-current");
  });
  if (stepperBtn3) stepperBtn3.disabled = !readingReady;
}

function goToStep(n) {
  if (n === 2 && !selectedFile) return;
  if (n === 3 && !readingReady) return;
  wizardStep = n;
  if (appPage) appPage.setAttribute("data-wizard-step", String(n));

  if (n === 3) {
    if (wizardStudioBody) wizardStudioBody.hidden = true;
    if (results) results.hidden = false;
    if (appFooter) appFooter.hidden = true;
  } else {
    if (wizardStudioBody) wizardStudioBody.hidden = false;
    if (results) results.hidden = true;
    if (appFooter) appFooter.hidden = false;
    if (wizardStep1) wizardStep1.hidden = n !== 1;
    if (wizardStep2) wizardStep2.hidden = n !== 2;
  }
  updateStepperUI();
  window.scrollTo(0, 0);
}

function resetWizard() {
  readingReady = false;
  selectedFile = null;
  showError("");
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  if (preview) preview.removeAttribute("src");
  if (previewWrap) previewWrap.hidden = true;
  if (previewNote) {
    previewNote.hidden = true;
    previewNote.textContent = "";
  }
  if (fileStatus) fileStatus.hidden = true;
  if (changePhotoBtn) changePhotoBtn.hidden = true;
  if (intencionEl) intencionEl.value = "";
  updateIntencionCounter();
  if (principal) principal.innerHTML = "";
  if (alternatives) alternatives.innerHTML = "";
  if (intentionBridge) {
    intentionBridge.hidden = true;
    intentionBridge.innerHTML = "";
  }
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    delete analyzeBtn.dataset.analyzing;
  }
  syncWizardContinue();
  goToStep(1);
  if (typeof window.CeromanciaI18n !== "undefined") {
    window.CeromanciaI18n.apply();
  }
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
  if (analyzeBtn) analyzeBtn.disabled = false;
  syncWizardContinue();
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
    if (typeof window.CeromanciaI18n !== "undefined") {
      window.CeromanciaI18n.apply();
    }
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
    <div class="reading-oracle">
      <div class="reading-oracle__corners" aria-hidden="true"></div>
      <p class="reading-oracle__glyph" aria-hidden="true">✦</p>
      <h3 class="reading-oracle__title">${escapeHtml(p.nombre)}</h3>
      <p class="reading-oracle__confidence" aria-label="${escapeHtml(T("confidence_aria"))}">
        ${escapeHtml(T("confidence_line", { pct }))}
      </p>
      <ul class="reading-oracle__tags">${tags}</ul>
      <div class="reading-oracle__divider" aria-hidden="true"></div>
      <p class="reading-oracle__body">${escapeHtml(simbolico)}</p>
    </div>
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
    <li class="reading-hint-card">
      <span class="reading-hint-card__glyph" aria-hidden="true">◇</span>
      <div class="reading-hint-card__main">
        <span class="reading-hint-card__name">${escapeHtml(p.nombre)}</span>
        <span class="reading-hint-card__pct">${escapeHtml(T("alt_probability_line", { pct }))}</span>
        <p class="reading-hint-card__body">${escapeHtml(cuerpo)}</p>
      </div>
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

document.querySelectorAll("[data-wizard-go]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const step = parseInt(btn.getAttribute("data-wizard-go"), 10);
    if (!Number.isFinite(step)) return;
    goToStep(step);
  });
});

wizardContinueBtn?.addEventListener("click", () => {
  if (!selectedFile) return;
  goToStep(2);
});

wizardBackBtn?.addEventListener("click", () => {
  goToStep(1);
});

newReadingBtn?.addEventListener("click", () => {
  resetWizard();
});

goToStep(1);
syncWizardContinue();

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  showError("");
  analyzeBtn.disabled = true;
  analyzeBtn.dataset.analyzing = "1";
  const label = analyzeBtn.querySelector(".btn-primary-label");
  if (label) label.textContent = T("btn_analyzing");
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
    readingReady = true;
    updateStepperUI();
    goToStep(3);
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
