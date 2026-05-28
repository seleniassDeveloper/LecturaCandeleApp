# Guía completa: de tu Mac a Google Play Store

Sigue los pasos **en orden**. Marca cada casilla al terminarlo.

**Tiempo estimado:** 2–4 horas la primera vez (más la revisión de Google, 1–7 días).

**Qué necesitas:** Mac, tarjeta para Play Console (~25 USD), cuenta GitHub (gratis), correo Gmail.

---

## FASE 1 — Preparar el código en GitHub

### Paso 1.1 — Abre Terminal y ve a la carpeta del proyecto

```bash
cd "/Users/seleniasanchez/Desktop/Documents/Proyectos de github seleniaprogramacion/LecturaCandeleApp-main"
```

### Paso 1.2 — Crea el repositorio Git (si aún no existe)

```bash
git init
git add .
git commit -m "Ceromancia: app lista para Play Store"
```

### Paso 1.3 — Sube a GitHub

1. Entra en https://github.com/new  
2. Nombre del repo: `LecturaCandeleApp` (o el que quieras) → **Create repository**  
3. En Terminal (cambia `TU_USUARIO`):

```bash
git branch -M main
git remote add origin https://github.com/seleniassDeveloper/LecturaCandeleApp.git
git push -u origin main
```

Si GitHub pide login, usa tu usuario y un **Personal Access Token** como contraseña.

---

## FASE 2 — Publicar la web con HTTPS (obligatorio)

La app de Play Store **no funciona sin internet**: abre tu web publicada.

Tienes **dos opciones**. Elige **solo una**.

### Opción A — Render (más fácil, sin instalar nada extra)

1. Entra en https://render.com y regístrate (con GitHub).  
2. **Dashboard** → **New +** → **Blueprint**  
3. Conecta el repo `LecturaCandeleApp`  
4. Render detecta `render.yaml` → **Apply**  
5. Espera 5–15 minutos hasta que el estado sea **Live**  
6. Copia la URL, por ejemplo: `https://ceromancia-velas.onrender.com`

**Comprueba en el navegador:**

- `https://TU-URL.onrender.com/` → se ve la app  
- `https://TU-URL.onrender.com/api/health` → `{"status":"ok"}`  
- `https://TU-URL.onrender.com/privacidad` → política de privacidad  

> En plan gratis, la primera visita tras dormir puede tardar ~30 s.

### Opción B — Google Cloud Run (todo en Google)

1. Instala Google Cloud CLI: https://cloud.google.com/sdk/docs/install  
2. En Terminal:

```bash
gcloud auth login
gcloud projects create ceromancia-app --name="Ceromancia"
gcloud config set project ceromancia-app
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

cd "/Users/seleniasanchez/Desktop/Documents/Proyectos de github seleniaprogramacion/LecturaCandeleApp-main"
gcloud run deploy ceromancia-velas \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --port 8000
```

3. Copia la URL que imprime (termina en `.run.app`).

**Anota aquí tu URL pública (la usarás en todo lo demás):**

```
MI_URL=https://________________________________
```

---

## FASE 3 — Cuenta de Google Play Console

### Paso 3.1 — Crear cuenta de desarrollador

1. https://play.google.com/console  
2. Inicia sesión con Gmail  
3. Acepta términos y paga la **cuota única de registro** (~25 USD)  
4. Completa el perfil de desarrollador (nombre, correo de contacto)

### Paso 3.2 — Crear la aplicación

1. **Crear aplicación**  
2. Nombre: **Ceromancia**  
3. Idioma predeterminado: **Español**  
4. Tipo: **App** → Categoría: **Estilo de vida** (o la que prefieras)  
5. Gratis o de pago → **Gratis**  
6. Acepta declaraciones → **Crear app**

---

## FASE 4 — Crear el APK/AAB para Android (Bubblewrap)

### Paso 4.1 — Instalar herramientas en tu Mac

```bash
npm install -g @bubblewrap/cli
```

Comprueba Java (necesario para compilar):

```bash
java -version
```

Si falla, instala JDK 17: https://adoptium.net/

### Paso 4.2 — Generar el proyecto Android

Sustituye `MI_URL` por tu URL real **sin barra final**:

```bash
cd "/Users/seleniasanchez/Desktop/Documents/Proyectos de github seleniaprogramacion/LecturaCandeleApp-main/android-twa"
bubblewrap init --manifest https://TU-URL.onrender.com/manifest.webmanifest
```

**Respuestas recomendadas:**

| Pregunta | Valor |
|----------|--------|
| Domain | La de tu URL (ej. `ceromancia-velas.onrender.com`) |
| URL path | `/` |
| Application name | Ceromancia |
| Short name | Ceromancia |
| Package name | `com.ceromancia.lecturavelas` |
| Signing key | **Create new** → guarda contraseñas en lugar seguro |
| Key store path | `android.keystore` (dentro de android-twa) |

### Paso 4.3 — Compilar el AAB

```bash
bubblewrap build
```

El archivo para Play Store suele estar en:

`android-twa/app/build/outputs/bundle/release/app-release.aab`

(Si Bubblewrap indica otra ruta, usa esa.)

---

## FASE 5 — Enlazar web y app (Digital Asset Links)

Sin esto, en el móvil se vería la barra de Chrome en lugar de pantalla completa.

### Paso 5.1 — Obtener huella SHA-256

```bash
cd "/Users/seleniasanchez/Desktop/Documents/Proyectos de github seleniaprogramacion/LecturaCandeleApp-main/android-twa"
keytool -list -v -keystore android.keystore -alias android
```

Copia la línea **SHA256:** (con dos puntos, ejemplo `A1:B2:C3:...`).

### Paso 5.2 — Configurar variables en el servidor

**Si usas Render:**

1. Dashboard → tu servicio **ceromancia-velas** → **Environment**  
2. Añade:

| Variable | Valor |
|----------|--------|
| `ANDROID_PACKAGE_NAME` | `com.ceromancia.lecturavelas` |
| `ANDROID_SHA256_FINGERPRINTS` | La huella SHA256 que copiaste |

3. **Save Changes** → Render redespliega solo.

**Si usas Cloud Run:**

```bash
gcloud run services update ceromancia-velas \
  --region europe-west1 \
  --set-env-vars "ANDROID_PACKAGE_NAME=com.ceromancia.lecturavelas,ANDROID_SHA256_FINGERPRINTS=TU_HUELLA_SHA256"
```

### Paso 5.3 — Comprobar

Abre en el navegador:

`https://TU-URL/.well-known/assetlinks.json`

Debe mostrar JSON con tu `package_name`, **no** un error 503.

Validación opcional:

```bash
bubblewrap validate --url https://TU-URL.onrender.com
```

---

## FASE 6 — Completar la ficha en Play Console

En Play Console, menú izquierdo:

### 6.1 — Ficha de Play Store → Contenido principal

| Campo | Qué poner |
|-------|-----------|
| Nombre | Ceromancia |
| Descripción breve | Lectura asistida de velas con foto e interpretación simbólica. |
| Descripción completa | Explica: subes foto de vela, análisis orientativo, historial local, etc. |
| Icono | Sube `backend/static/icons/icon-512.png` |
| Gráfico de funciones | Opcional 1024×500 |
| Capturas de pantalla | Mínimo **2** (haz capturas en el móvil con la web o la app de prueba) |

### 6.2 — Política de privacidad

URL: `https://TU-URL/privacidad`

Edita `backend/static/privacidad.html` y pon **tu correo de contacto** antes de publicar.

### 6.3 — Clasificación de contenido

Menú → **Clasificación de contenido** → rellena el cuestionario → guarda.

### 6.4 — Público objetivo

Indica si hay menores; para app espiritual/orientativa suele ser **13+** o **18+** según tu criterio.

### 6.5 — Seguridad de los datos

Declara que la app:

- Recoge **fotos** (para análisis)  
- Los envía al **servidor**  
- No vendes datos a terceros (ajusta a lo real)

### 6.6 — Países y prueba

- **Países:** los que quieras (ej. España + Latinoamérica)  
- Para probar antes de publicar: **Prueba interna** → crea lista de testers con emails Gmail

---

## FASE 7 — Subir el AAB y publicar

1. **Producción** (o **Prueba interna** para probar primero)  
2. **Crear nueva versión**  
3. Sube `app-release.aab`  
4. Nombre de versión: `1.0.0`  
5. Notas de la versión: "Primera versión"  
6. **Revisar versión** → **Iniciar implementación en producción** (o en prueba interna)

Google revisará la app (horas a varios días). Te avisará por correo.

---

## FASE 8 — Probar en tu móvil antes de producción

1. Play Console → **Prueba interna** → añade tu Gmail como tester  
2. Abre el enlace de opt-in que te da Google en el móvil  
3. Instala desde Play Store (versión de prueba)  
4. Prueba: subir foto, analizar, ver Lecturas y Guía

---

## Resumen de archivos importantes

| Archivo | Para qué |
|---------|----------|
| `docs/GUIA_COMPLETA_PLAY_STORE.md` | Esta guía |
| `docs/PLAY_STORE.md` | Detalles técnicos TWA |
| `android-twa/` | Proyecto Android (Bubblewrap) |
| `backend/static/privacidad.html` | URL obligatoria Play Store |
| `render.yaml` | Despliegue automático en Render |
| `Dockerfile` | Contenedor para Render / Cloud Run |

---

## Si algo falla

| Problema | Solución |
|----------|----------|
| `gcloud: command not found` | Usa **Opción A Render** en Fase 2 |
| `bubblewrap: command not found` | `npm install -g @bubblewrap/cli` |
| assetlinks 503 | Faltan variables `ANDROID_*` en Render/Cloud Run |
| App abre con barra de Chrome | assetlinks mal o huella SHA incorrecta |
| Render muy lento al entrar | Normal en plan free; espera o paga plan de pago |
| Play rechaza por privacidad | Revisa URL `/privacidad` y formulario de datos |

---

## Lo que solo tú puedes hacer (no lo hace nadie por ti)

- [ ] Pagar cuenta Play Console (~25 USD)  
- [ ] Iniciar sesión en GitHub / Render / Google  
- [ ] Guardar el **keystore** (`android.keystore`) y contraseñas  
- [ ] Poner tu **email** en la política de privacidad  
- [ ] Hacer **capturas de pantalla** del móvil  

Cuando tengas la **URL pública** (Fase 2), puedes pedir ayuda para revisar `assetlinks` o errores de Bubblewrap.
