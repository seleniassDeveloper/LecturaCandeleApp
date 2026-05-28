/**
 * Interfaz en español, inglés y portugués (Brasil).
 * El análisis del servidor sigue en español; solo cambia la UI.
 */
(function () {
  const STORAGE_KEY = "ceromancia_lang";
  const SUPPORTED = ["es", "en", "pt"];

  const STRINGS = {
    es: {
      meta_description: "Lectura asistida de velas: llama, cera y residuos.",
      doc_title: "Ceromancia CV",
      nav_sections_aria: "Secciones",
      lang_aria: "Idioma",
      shell_kicker: "Lectura asistida",
      shell_title: "Ceromancia",
      tab_vela: "Tu vela",
      tab_intention: "Intención · opc.",
      tab_reading: "Lectura",
      block_your_image: "Tu imagen",
      shell_instructions_html:
        "Foto nítida de la vela encendida. La intención es <strong>opcional</strong>; si la escribes, el análisis y las pistas se afinan con más precisión. Luego <strong>Analizar</strong>.",
      shell_instructions_step1_html:
        "Elige o arrastra una foto <strong>nítida</strong> de la vela encendida. Formatos JPEG, PNG o HEIC (máx. 12&nbsp;MB).",
      dropzone_title: "Toca para elegir foto",
      dropzone_hint: "Cámara o galería · JPEG, PNG, HEIC · máx. 12&nbsp;MB",
      change_photo: "Cambiar foto",
      preview_alt: "Vista previa de la foto",
      block_intention_title: "Intención (opcional)",
      intention_lede:
        "Puedes dejarlo vacío. Si indicas para qué encendiste la vela o qué contexto importa, la lectura y «Otras pistas» se ajustan con más precisión.",
      sr_only_intention: "Intención opcional para afinar la lectura",
      intention_placeholder:
        "Ej.: trabajo, familia, agradecer, protección… (opcional, para más precisión)",
      intention_counter: "{n} / 400",
      context_label: "Contexto",
      context_hint: "Opcional · más precisión si eliges uno",
      chips_group_aria: "Contexto opcional para afinar la precisión",
      btn_analyze: "Analizar imagen",
      btn_analyzing: "Analizando…",
      btn_continue: "Siguiente",
      btn_back: "Atrás",
      btn_new_reading: "Nueva lectura",
      results_heading: "Signo y mensaje",
      tb_your_reading: "Tu lectura",
      subheading_other_clues: "Otras pistas",
      footer_disclaimer:
        "Las lecturas son orientativas. No sustituyen el criterio humano ni prácticas espirituales reales.",
      footer_mystic_quote:
        "La luz que enciendes afuera también ilumina tu camino interior.",
      bridge_label: "Tu intención",
      confidence_aria: "Confianza del modelo",
      confidence_line: "{pct}% de confianza",
      alt_probability_line: "{pct}% de probabilidad",
      err_not_image:
        "No se reconoció como imagen. Prueba otra foto o formato (JPEG, PNG, HEIC).",
      err_analyze_fallback: "No se pudo analizar la imagen.",
      err_server_fallback: "Error del servidor",
      heic_note:
        "HEIC: la miniatura a veces no se ve en el iPhone; igual puedes pulsar «Analizar imagen».",
      preview_error_note: "No se pudo mostrar la miniatura; puedes analizar la foto igualmente.",
      file_ready: "Listo: {name} · {size}",
      intents: {
        trabajo: "Trabajo",
        amor: "Amor",
        dinero: "Dinero",
        proteccion: "Protección",
        salud: "Salud",
        guia: "Guía",
      },
      intent_values: {
        trabajo: "Trabajo",
        amor: "Amor",
        dinero: "Dinero",
        proteccion: "Protección",
        salud: "Salud",
        guia: "Guía espiritual",
      },
    },
    en: {
      meta_description: "Assisted candle reading: flame, wax, and residue.",
      doc_title: "Ceromancia CV",
      nav_sections_aria: "Sections",
      lang_aria: "Language",
      shell_kicker: "Assisted reading",
      shell_title: "Ceromancia",
      tab_vela: "Your candle",
      tab_intention: "Intention · opt.",
      tab_reading: "Reading",
      block_your_image: "Your photo",
      shell_instructions_html:
        "A clear photo of the lit candle. <strong>Intention is optional</strong>; if you add it, the analysis and hints become more precise. Then tap <strong>Analyze</strong>.",
      shell_instructions_step1_html:
        "Choose or drag a <strong>clear</strong> photo of the lit candle. JPEG, PNG, or HEIC (max 12&nbsp;MB).",
      dropzone_title: "Tap to choose photo",
      dropzone_hint: "Camera or library · JPEG, PNG, HEIC · max 12&nbsp;MB",
      change_photo: "Change photo",
      preview_alt: "Photo preview",
      block_intention_title: "Intention (optional)",
      intention_lede:
        "You can leave this empty. If you say why you lit the candle or what context matters, the reading and “Other hints” adjust with more precision.",
      sr_only_intention: "Optional intention to refine the reading",
      intention_placeholder:
        "E.g. work, family, gratitude, protection… (optional, for more precision)",
      intention_counter: "{n} / 400",
      context_label: "Context",
      context_hint: "Optional · more precision if you pick one",
      chips_group_aria: "Optional context to refine precision",
      btn_analyze: "Analyze image",
      btn_analyzing: "Analyzing…",
      btn_continue: "Next",
      btn_back: "Back",
      btn_new_reading: "New reading",
      results_heading: "Sign and message",
      tb_your_reading: "Your reading",
      subheading_other_clues: "Other hints",
      footer_disclaimer:
        "Readings are for guidance. They do not replace human judgment or real spiritual practice.",
      footer_mystic_quote:
        "The light you kindle outside also lights your inner path.",
      bridge_label: "Your intention",
      confidence_aria: "Model confidence",
      confidence_line: "{pct}% confidence",
      alt_probability_line: "{pct}% probability",
      err_not_image:
        "Not recognized as an image. Try another photo or format (JPEG, PNG, HEIC).",
      err_analyze_fallback: "Could not analyze the image.",
      err_server_fallback: "Server error",
      heic_note:
        "HEIC: the thumbnail may not show on iPhone; you can still tap “Analyze image”.",
      preview_error_note: "Thumbnail could not be shown; you can still analyze the photo.",
      file_ready: "Ready: {name} · {size}",
      intents: {
        trabajo: "Work",
        amor: "Love",
        dinero: "Money",
        proteccion: "Protection",
        salud: "Health",
        guia: "Guidance",
      },
      intent_values: {
        trabajo: "Work",
        amor: "Love",
        dinero: "Money",
        proteccion: "Protection",
        salud: "Health",
        guia: "Spiritual guidance",
      },
    },
    pt: {
      meta_description: "Leitura assistida de velas: chama, cera e resíduos.",
      doc_title: "Ceromancia CV",
      nav_sections_aria: "Seções",
      lang_aria: "Idioma",
      shell_kicker: "Leitura assistida",
      shell_title: "Ceromancia",
      tab_vela: "Sua vela",
      tab_intention: "Intenção · opc.",
      tab_reading: "Leitura",
      block_your_image: "Sua foto",
      shell_instructions_html:
        "Foto nítida da vela acesa. A intenção é <strong>opcional</strong>; se você escrever, a análise e as pistas ficam mais precisas. Depois <strong>Analisar</strong>.",
      shell_instructions_step1_html:
        "Escolha ou arraste uma foto <strong>nítida</strong> da vela acesa. JPEG, PNG ou HEIC (máx. 12&nbsp;MB).",
      dropzone_title: "Toque para escolher foto",
      dropzone_hint: "Câmera ou galeria · JPEG, PNG, HEIC · máx. 12&nbsp;MB",
      change_photo: "Trocar foto",
      preview_alt: "Pré-visualização da foto",
      block_intention_title: "Intenção (opcional)",
      intention_lede:
        "Pode deixar em branco. Se indicar por que acendeu a vela ou que contexto importa, a leitura e «Outras pistas» se ajustam com mais precisão.",
      sr_only_intention: "Intenção opcional para afinar a leitura",
      intention_placeholder:
        "Ex.: trabalho, família, gratidão, proteção… (opcional, para mais precisão)",
      intention_counter: "{n} / 400",
      context_label: "Contexto",
      context_hint: "Opcional · mais precisão se escolher um",
      chips_group_aria: "Contexto opcional para afinar a precisão",
      btn_analyze: "Analisar imagem",
      btn_analyzing: "Analisando…",
      btn_continue: "Seguinte",
      btn_back: "Voltar",
      btn_new_reading: "Nova leitura",
      results_heading: "Sinal e mensagem",
      tb_your_reading: "Sua leitura",
      subheading_other_clues: "Outras pistas",
      footer_disclaimer:
        "As leituras são orientativas. Não substituem o julgamento humano nem práticas espirituais reais.",
      footer_mystic_quote:
        "A luz que você acende lá fora também ilumina seu caminho interior.",
      bridge_label: "Sua intenção",
      confidence_aria: "Confiança do modelo",
      confidence_line: "{pct}% de confiança",
      alt_probability_line: "{pct}% de probabilidade",
      err_not_image:
        "Não reconhecido como imagem. Tente outra foto ou formato (JPEG, PNG, HEIC).",
      err_analyze_fallback: "Não foi possível analisar a imagem.",
      err_server_fallback: "Erro do servidor",
      heic_note:
        "HEIC: a miniatura às vezes não aparece no iPhone; ainda pode tocar em «Analisar imagem».",
      preview_error_note: "Não foi possível mostrar a miniatura; você ainda pode analisar a foto.",
      file_ready: "Pronto: {name} · {size}",
      intents: {
        trabalho: "Trabalho",
        amor: "Amor",
        dinero: "Dinheiro",
        proteccion: "Proteção",
        salud: "Saúde",
        guia: "Guia",
      },
      intent_values: {
        trabalho: "Trabalho",
        amor: "Amor",
        dinero: "Dinheiro",
        proteccion: "Proteção",
        salud: "Saúde",
        guia: "Orientação espiritual",
      },
    },
  };

  function normalizeLang(raw) {
    const s = (raw || "es").toLowerCase().slice(0, 2);
    return SUPPORTED.includes(s) ? s : "es";
  }

  function getLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return normalizeLang(stored);
    } catch {
      /* ignore */
    }
    if (typeof navigator !== "undefined" && navigator.language) {
      const n = navigator.language.toLowerCase();
      if (n.startsWith("en")) return "en";
      if (n.startsWith("pt")) return "pt";
    }
    return "es";
  }

  function setLang(lang) {
    const l = normalizeLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    apply(l);
    try {
      window.dispatchEvent(new CustomEvent("ceromancia:lang", { detail: { lang: l } }));
    } catch {
      /* ignore */
    }
  }

  function t(lang, key, vars) {
    const l = normalizeLang(lang);
    const pack = STRINGS[l] || STRINGS.es;
    let s = pack[key];
    if (s === undefined) {
      s = STRINGS.es[key] !== undefined ? STRINGS.es[key] : key;
    }
    if (vars && typeof s === "string") {
      Object.keys(vars).forEach((k) => {
        s = s.split(`{${k}}`).join(String(vars[k]));
      });
    }
    return s;
  }

  function intentValue(lang, id) {
    const l = normalizeLang(lang);
    const pack = STRINGS[l] || STRINGS.es;
    const v = pack.intent_values && pack.intent_values[id];
    if (v) return v;
    return STRINGS.es.intent_values[id] || id;
  }

  function intentLabel(lang, id) {
    const l = normalizeLang(lang);
    const pack = STRINGS[l] || STRINGS.es;
    const v = pack.intents && pack.intents[id];
    if (v) return v;
    return STRINGS.es.intents[id] || id;
  }

  function apply(lang) {
    const l = normalizeLang(lang);
    document.documentElement.lang = l === "pt" ? "pt-BR" : l;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t(l, "meta_description"));

    const titleEl = document.querySelector("title");
    if (titleEl) titleEl.textContent = t(l, "doc_title");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const mode = el.getAttribute("data-i18n-html");
      const val = t(l, key);
      if (mode === "1" || mode === "true") {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key && "placeholder" in el) el.placeholder = t(l, key);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(l, key));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (key && el instanceof HTMLImageElement) el.alt = t(l, key);
    });

    document.querySelectorAll("[data-intent-id]").forEach((btn) => {
      const id = btn.getAttribute("data-intent-id");
      const label = btn.querySelector(".chip-label");
      if (id && label) label.textContent = intentLabel(l, id);
    });

    const bridgeLbl = document.querySelector(".intention-bridge-label");
    if (bridgeLbl) bridgeLbl.textContent = t(l, "bridge_label");

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const bLang = btn.getAttribute("data-lang");
      const active = bLang === l;
      btn.classList.toggle("lang-btn--active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const nav = document.querySelector(".tab-strip");
    if (nav) nav.setAttribute("aria-label", t(l, "nav_sections_aria"));

    const chips = document.querySelector(".intention-chips--cloud");
    if (chips) chips.setAttribute("aria-label", t(l, "chips_group_aria"));

    const analyzeBtn = document.getElementById("analyzeBtn");
    const lbl = analyzeBtn?.querySelector(".btn-primary-label");
    if (lbl && analyzeBtn) {
      if (analyzeBtn.dataset.analyzing === "1") {
        lbl.textContent = t(l, "btn_analyzing");
      } else {
        lbl.textContent = t(l, "btn_analyze");
      }
    }
  }

  let langButtonsWired = false;
  function wireLangButtons() {
    if (langButtonsWired) return;
    langButtonsWired = true;
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (lang) setLang(lang);
      });
    });
  }

  window.CeromanciaI18n = {
    getLang,
    setLang,
    t: (key, vars) => t(getLang(), key, vars),
    intentValue: (id) => intentValue(getLang(), id),
    intentLabel: (id) => intentLabel(getLang(), id),
    apply: () => apply(getLang()),
    init() {
      wireLangButtons();
      apply(getLang());
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.CeromanciaI18n.init());
  } else {
    window.CeromanciaI18n.init();
  }
})();
