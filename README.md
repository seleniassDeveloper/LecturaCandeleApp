# Ceromancia CV

Aplicación de **visión por computadora** y **TensorFlow (Keras)** para analizar fotografías de velas encendidas (llama, derretimiento de la cera y residuos) y devolver **interpretaciones simbólicas** a partir de un catálogo de patrones predefinido.

## Requisitos

- Python 3.10 u 3.11 recomendado.
- macOS / Linux / Windows con pip.

La inferencia **no requiere TensorFlow** en el servidor (usa NumPy con la misma ecuación que una capa `Dense` de Keras). TensorFlow es **opcional** para exportar el `.keras` de ejemplo o para cargar un modelo entrenado (ver más abajo).

## Puesta en marcha

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Abre en el navegador: `http://127.0.0.1:8000/`

### Probar en el móvil al instante (HTTPS, sin subir a la nube)

Terminal 1 (servidor):

```bash
cd backend && source .venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2 (túnel público con HTTPS):

```bash
bash scripts/tunel-https.sh
```

Instala [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) si hace falta (`brew install cloudflare/cloudflare/cloudflared`). Copia la URL `https://….trycloudflare.com` y ábrela en el teléfono (cualquier red).

### PWA: icono en la pantalla de inicio

Con **HTTPS** (túnel o hosting), en el móvil: **Añadir a pantalla de inicio** / **Instalar app**. El repo incluye `manifest.webmanifest`, `sw.js` e iconos en `static/icons/`.

### Desplegar en la nube (URL fija)

- **Dockerfile** en la raíz (listo para Render, Fly.io, Railway, etc.).
- **Render:** sube el código a GitHub → New Web Service → Docker → raíz del repo; o **Blueprint** con `render.yaml`.
- **Fly.io:** `fly launch` / `fly deploy` (hay un `fly.toml` de ejemplo; cambia `app` por un nombre libre).

En planes gratuitos el servicio puede **dormir**; el primer acceso puede tardar un poco.

### Ver la app desde Visual Studio Code

Cursor/VS Code no “muestra” la web sola: con el servidor ya en marcha (`uvicorn` en la terminal), abre **Safari o Chrome** y pega `http://127.0.0.1:8000/`. Si quieres dentro del editor: paleta de comandos → **Simple Browser: Show** → misma URL.

### Probar en iPhone o Android (misma Wi‑Fi)

`127.0.0.1` solo sirve en la propia Mac. Para el móvil, escucha en todas las interfaces y usa la IP local del Mac:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

En el Mac: **Ajustes del Sistema → Red → Wi‑Fi → Detalles** y anota la dirección IPv4 (p. ej. `192.168.1.23`). En el teléfono (Safari o Chrome) abre `http://192.168.1.23:8000/` (cambia por tu IP). Si no carga, revisa el **cortafuegos** del Mac o que ambos estén en la misma red.

La interfaz en `static/` ya lleva `viewport` y estilos adaptables: en móvil funciona como **web app** en el navegador. Si más adelante quieres **app nativa** en App Store / Play Store, el siguiente paso sería envolver esta misma URL o la API en **Capacitor**, **React Native** o **Flutter** (mismo backend).

### TensorFlow (opcional)

```bash
pip install -r requirements-ml.txt   # descomenta tensorflow en ese archivo o instala a mano
python scripts/export_keras_model.py  # crea models/symbol_classifier.keras
CEROMANCIA_USE_TF=1 uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Estructura

- `Dockerfile` / `render.yaml` / `fly.toml` — despliegue en contenedor (HTTPS en la nube).
- `scripts/tunel-https.sh` — URL HTTPS temporal para probar en el móvil sin desplegar.
- `backend/static/manifest.webmanifest`, `sw.js`, `icons/` — PWA (añadir a inicio).
- `backend/scripts/generate_pwa_icons.py` — regenera iconos PNG (también se ejecuta en el build Docker).
- `app/cv_features.py` — segmentación heurística (HSV, luminancia, contornos) y vector de **10 medidas** por imagen.
- `app/tf_classifier.py` — logits `x @ W + b` en **NumPy**; con `CEROMANCIA_USE_TF=1` y `models/symbol_classifier.keras`, inferencia vía **Keras**.
- `scripts/export_keras_model.py` — genera el `.keras` de ejemplo (requiere TensorFlow instalado).
- `app/symbols.py` — catálogo de patrones y textos simbólicos.
- `app/engine.py` — decodificación (OpenCV → Pillow/pillow-heif → en macOS `sips` como respaldo HEIC), inferencia y JSON.
- `app/main.py` — FastAPI (`POST /api/analizar`, `GET /api/patrones`) y frontend estático.
- `static/` — interfaz de subida y resultados.

---

## Flujo del modelo de IA (reconocimiento de patrones)

1. **Entrada**  
   Imagen RGB/BGR de una vela (cualquier resolución razonable; se reescala internamente para acelerar el procesamiento).

2. **Preprocesamiento**  
   - Conversión a **HSV** y suavizado gaussiano del canal **V** (luminancia).  
   - Recorte conceptual: **zona superior** para la llama, **zona inferior** para el charco de cera y residuos.

3. **Segmentación clásica (OpenCV)**  
   - **Llama**: píxeles cálidos (matiz amarillo/naranja/rojo) con saturación y valor altos en la mitad superior.  
   - **Cera fundida**: umbral adaptativo (Otsu) sobre luminancia en la mitad inferior, con morfología para cerrar regiones.  
   - **Residuos oscuros**: píxeles de muy baja luminancia en el tercio inferior (proxy de hollín o carbonilla).

4. **Extracción de características (vector de 10 dimensiones)**  
   | Índice | Significado aproximado |
   |--------|-------------------------|
   | 0–1 | Desplazamiento normalizado del **centroide de la llama** respecto al centro de la imagen (inclinación / desvío). |
   | 2 | **Área relativa** de la máscara de llama. |
   | 3 | **Área relativa** del charco de cera. |
   | 4 | **Excentricidad** del charco (bounding box alargado). |
   | 5 | **Compacidad** del charco (área / casco convexo). |
   | 6 | **Masa secundaria** en la cera (posible “figura” o protuberancia). |
   | 7 | **Proporción de oscuridad** (residuos) en la zona baja. |
   | 8 | **Estructura vertical** de la cera (columnas / acumulación). |
   | 9 | **Dispersión** del perímetro del charco (surcos, bordes irregulares). |

5. **Clasificación (misma forma que Keras / TensorFlow)**  
   - Vector `x ∈ R^10`.  
   - **Por defecto:** `logits = x W + b` en NumPy (equivalente a `keras.layers.Dense(..., activation=None)` sobre el vector de entrada).  
   - Los pesos `W` y `b` iniciales están **alineados con reglas** (correlaciones esperadas entre medidas y clases).  
   - **Con TensorFlow:** si exportas o entrenas `backend/models/symbol_classifier.keras` y arrancas con `CEROMANCIA_USE_TF=1`, los logits salen del grafo Keras cargado (útil tras entrenamiento con datos propios).

6. **Softmax y ranking**  
   `p_i = exp(z_i) / Σ exp(z_j)` sobre los logits `z`. Se devuelve el **patrón principal** y los **top-k** con sus probabilidades.

7. **Mapeo patrón → salida simbólica**  
   Cada `id` de clase en `CLASS_ORDER` corresponde a una entrada en `PATTERNS` (`symbols.py`): **nombre**, **etiquetas** temáticas y **texto de interpretación**. La API no inventa texto libre: solo **selecciona** el patrón y expone el texto asociado (trazabilidad y control editorial del significado).

---

## Cómo mejorar el sistema con datos reales

1. Recolectar imágenes etiquetadas con uno o varios `id` de `CLASS_ORDER`.  
2. Exportar el vector de 10 features por imagen (puedes añadir un script que llame a `extract_features`).  
3. Entrenar una red más profunda (por ejemplo la función `build_deep_model` en `tf_classifier.py`) con `sparse_categorical_crossentropy`.  
4. Guardar el modelo en `backend/models/symbol_classifier.keras` y reiniciar el servidor.

---

## Aviso

Las lecturas simbólicas son **ilustrativas** y dependen de la calidad de la foto, iluminación y heurísticas. No constituyen asesoramiento espiritual, médico ni legal.
