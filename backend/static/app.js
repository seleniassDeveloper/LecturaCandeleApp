const $ = (id) => document.getElementById(id);

// Estado Global
let history = JSON.parse(localStorage.getItem("ceromancia_history") || "[]");

const NAV_SCREEN = {
  "nav-home": "screen-intro",
  "nav-history": "screen-history",
  "nav-guide": "screen-guide",
};

// Navegación de pantallas
function showScreen(screenId) {
  const target = document.getElementById(screenId);
  if (!target) {
    console.error("Pantalla no encontrada:", screenId);
    return;
  }

  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

  target.classList.add("active");

  const navId = Object.keys(NAV_SCREEN).find((k) => NAV_SCREEN[k] === screenId);
  if (navId) {
    const navEl = $(navId);
    if (navEl) navEl.classList.add("active");
  }

  if (screenId === "screen-history") renderHistory();

  document.body.classList.remove("view-intro", "view-wizard", "view-scroll");
  if (screenId === "screen-intro") {
    document.body.classList.add("view-intro");
  } else if (screenId === "screen-wizard") {
    document.body.classList.add("view-wizard");
  } else if (screenId === "screen-guide" || screenId === "screen-history") {
    document.body.classList.add("view-scroll");
  }

  window.scrollTo(0, 0);
}

function updateWizardUI(step) {
  document.querySelectorAll(".dot").forEach((dot) => {
    const dotStep = parseInt(dot.dataset.step, 10);
    dot.classList.toggle("active", dotStep === step);
  });

  const s1 = $("step-1-content");
  const s2 = $("step-2-content");
  const s3 = $("step-3-content");
  if (s1) {
    if (step === 1) s1.removeAttribute("hidden");
    else s1.setAttribute("hidden", "");
  }
  if (s2) {
    if (step === 2) s2.removeAttribute("hidden");
    else s2.setAttribute("hidden", "");
  }
  if (s3) {
    if (step === 3) s3.removeAttribute("hidden");
    else s3.setAttribute("hidden", "");
  }
}

// Navegación inferior (delegación: funciona aunque el JS esté en caché parcial)
document.addEventListener(
  "click",
  (e) => {
    const link = e.target.closest(".nav-link[data-screen]");
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    const screenId = link.getAttribute("data-screen");
    if (screenId) showScreen(screenId);
  },
  true,
);

function initApp() {
  $("start-btn")?.addEventListener("click", () => {
    showScreen("screen-wizard");
    updateWizardUI(1);
  });

  $("dropzone")?.addEventListener("click", () => $("file")?.click());

  $("file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if ($("preview")) $("preview").src = ev.target.result;
        if ($("preview-container")) $("preview-container").removeAttribute("hidden");
        if ($("dropzone")) $("dropzone").setAttribute("hidden", "");
      };
      reader.readAsDataURL(file);
    }
  });

  $("confirm-upload-btn")?.addEventListener("click", () => updateWizardUI(2));

  $("analyze-btn")?.addEventListener("click", async () => {
    updateWizardUI(3);
    const resultsContainer = $("results-container");
    const analyzingState = $("analyzing-state");

    if (resultsContainer) {
      resultsContainer.innerHTML =
        '<div class="analyzing-state" id="analyzing-state"><p>Consultando a los astros...</p></div>';
    }

    try {
      const formData = new FormData();
      formData.append("file", $("file").files[0]);
      formData.append("intencion", $("intencion").value);

      const response = await fetch("/api/analizar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const reading = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        intencion: $("intencion").value,
        data: data,
      };
      history.unshift(reading);
      localStorage.setItem("ceromancia_history", JSON.stringify(history));

      renderResults(data);
    } catch (error) {
      if (resultsContainer) {
        resultsContainer.innerHTML =
          '<p style="color: #ff6b6b; text-align: center;">Error al conectar con el oráculo.</p>';
      }
    }
  });

  $("restart-btn")?.addEventListener("click", () => {
    if ($("file")) $("file").value = "";
    if ($("preview-container")) $("preview-container").setAttribute("hidden", "");
    if ($("dropzone")) $("dropzone").removeAttribute("hidden");
    if ($("intencion")) $("intencion").value = "";
    showScreen("screen-intro");
  });

  document.body.classList.add("view-intro");
  showScreen("screen-intro");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function getMysticalAdvice(patternId) {
  const advice = {
    llama_estable:
      "La estabilidad que ves es el reflejo de tu propia fuerza interior. No permitas que el ruido externo desvíe tu propósito; sigue vibrando en esta frecuencia de paz.",
    llama_inclinada_derecha:
      "El oráculo detecta una apertura inminente. Lo que has sembrado está listo para florecer; solo falta que des ese paso con decisión y sin mirar atrás.",
    llama_inclinada_izquierda:
      "Hay un lazo con el ayer que aún drena tu energía. El fuego te pide que agradezcas la lección pero que cierres la puerta definitivamente.",
    cera_acumulada:
      "Tu vela muestra una carga que ya no te corresponde llevar. Aligera tu equipaje emocional y verás cómo el camino se vuelve más sencillo.",
    cera_dispersa:
      "Tu energía se está fragmentando en demasiadas direcciones. Reúne tus fuerzas y enfócate en lo esencial; la dispersión es el enemigo de la manifestación.",
    residuos_oscuros:
      "El fuego está transmutando negatividad. Es un proceso de limpieza profundo; después de esta lectura, siente cómo tu aura se ha vuelto más ligera.",
    figura_en_cera:
      "Una sorpresa o un evento inesperado se está materializando. Mantén tus sentidos alerta, pues el universo te enviará un mensajero pronto.",
    mezcla_equilibrada:
      "La complejidad de tu situación requiere paciencia. No todo es blanco o negro; aprende a navegar en los grises con sabiduría y templanza.",
  };
  return (
    advice[patternId] ||
    "Confía en el proceso divino; todo sucede en el tiempo perfecto para tu mayor bien."
  );
}

function renderResults(data) {
  const container = $("results-container");
  if (!container) return;
  const p = data.patron_principal;

  let html = `
        <div class="reading-details">
            ${
              data.puente_intencion
                ? `
                <div class="reading-bridge">
                    <p>"${data.puente_intencion}"</p>
                </div>
            `
                : ""
            }
            <div class="reading-grid">
                <div class="reading-row">
                    <span class="reading-row__icon" aria-hidden="true">🔥</span>
                    <div>
                        <strong class="reading-row__title">Visión de la llama</strong>
                        <p class="reading-row__text">${p.id.includes("llama") ? p.mensaje_simbolico : "La luz que emite tu vela es pura y constante, señal de una petición escuchada."}</p>
                    </div>
                </div>
                <div class="reading-row">
                    <span class="reading-row__icon" aria-hidden="true">💧</span>
                    <div>
                        <strong class="reading-row__title">Lenguaje de la cera</strong>
                        <p class="reading-row__text">${p.id.includes("cera") || p.id.includes("figura") ? p.mensaje_simbolico : "El descenso de la cera es armonioso; el camino se allana para tus deseos."}</p>
                    </div>
                </div>
                <div class="reading-oracle">
                    <h5 class="reading-oracle__name">${p.nombre}</h5>
                    <p class="reading-oracle__quote">"${p.interpretacion || p.mensaje_simbolico}"</p>
                </div>
                <div class="reading-advice">
                    <strong class="reading-advice__label">Guía práctica del oráculo</strong>
                    <p class="reading-advice__text">${getMysticalAdvice(p.id)}</p>
                </div>
            </div>
        </div>
    `;
  container.innerHTML = html;
}

function renderHistory() {
  const list = $("history-list");
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML =
      '<p style="color: var(--texto-dim); text-align: center; font-style: italic; margin-top: 40px;">No hay lecturas guardadas todavía.</p>';
    return;
  }

  list.innerHTML = history
    .map(
      (item) => `
        <div class="wizard-card" style="padding: 15px; margin-bottom: 10px; cursor: pointer;" onclick="viewHistoryItem(${item.id})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--oro); font-size: 0.9rem; display: block;">${item.data.patron_principal.nombre}</strong>
                    <small style="color: var(--texto-dim);">${item.date}</small>
                </div>
                <div style="color: var(--oro);">➔</div>
            </div>
        </div>
    `,
    )
    .join("");
}

window.viewHistoryItem = (id) => {
  const item = history.find((i) => i.id === id);
  if (item) {
    showScreen("screen-wizard");
    updateWizardUI(3);
    renderResults(item.data);
  }
};

window.showScreen = showScreen;
