# Publicar Ceromancia en Google Play Store

Tu app es una **web (PWA)** con backend FastAPI. En Play Store se publica como **Trusted Web Activity (TWA)**: un contenedor Android que abre tu URL con HTTPS en pantalla completa, sin barra del navegador.

## Resumen del proceso

1. Desplegar la web con **HTTPS** (obligatorio).
2. Crear cuenta de **Google Play Console** (pago único ~25 USD).
3. Generar el APK/AAB con **Bubblewrap** (Google).
4. Configurar **Digital Asset Links** en tu dominio.
5. Subir el **AAB** y completar la ficha de la tienda.

---

## Paso 1 — Desplegar la web (primero)

Sin URL pública HTTPS no puedes continuar. Ejemplo con Cloud Run:

```bash
cd LecturaCandeleApp-main
gcloud run deploy ceromancia-velas --source . --region europe-west1 --allow-unauthenticated --memory 512Mi --port 8000
```

Anota la URL, por ejemplo: `https://ceromancia-velas-xxxxx.europe-west1.run.app`

Comprueba en el navegador:

- `https://TU-URL/` — carga la app
- `https://TU-URL/manifest.webmanifest` — JSON del manifiesto
- `https://TU-URL/privacidad` — política de privacidad (la pide Play Store)

---

## Paso 2 — Cuenta de desarrollador

1. Entra en [Google Play Console](https://play.google.com/console).
2. Crea cuenta de desarrollador y paga la cuota única.
3. Crea una **aplicación** nueva (tipo: app o juego; categoría que encaje, p. ej. Estilo de vida).

---

## Paso 3 — Herramientas en tu Mac

```bash
# Node.js (si no lo tienes): https://nodejs.org
npm install -g @bubblewrap/cli

# Java JDK 17+ (Android build)
# Android Studio (opcional pero útil para depurar)
```

---

## Paso 4 — Generar el proyecto Android (Bubblewrap)

Desde la carpeta `android-twa/` del repo (o donde quieras el proyecto):

```bash
cd android-twa
bubblewrap init --manifest https://TU-URL.run.app/manifest.webmanifest
```

Responde las preguntas:

| Campo | Sugerencia |
|-------|------------|
| **Package name** | `com.ceromancia.lecturavelas` (único, no lo cambies después) |
| **App name** | Ceromancia |
| **Host** | El dominio de tu URL (sin `https://`) |
| **Start URL** | `/` |
| **Icon** | Usa `/static/icons/icon-512.png` de tu servidor |
| **Signing key** | Crea uno nuevo y **guarda el archivo `.jks` y las contraseñas** |

```bash
bubblewrap build
```

Obtendrás un **AAB** en `app-release-bundle.aab` (ruta puede variar según versión de Bubblewrap).

---

## Paso 5 — Digital Asset Links (obligatorio)

Play Store exige que tu dominio “confíe” en la app Android.

### 5.1 Obtener la huella SHA-256 del certificado

```bash
# Si Bubblewrap creó android.keystore en android-twa:
keytool -list -v -keystore android.keystore -alias android
```

Copia la línea **SHA256** (formato con dos puntos, p. ej. `AB:CD:12:...`).

### 5.2 Configurar el servidor

En Cloud Run (o tu hosting), variables de entorno:

```
ANDROID_PACKAGE_NAME=com.ceromancia.lecturavelas
ANDROID_SHA256_FINGERPRINTS=AB:CD:12:...:EF
```

Varias huellas (debug + release) separadas por coma.

Vuelve a desplegar y comprueba:

`https://TU-URL/.well-known/assetlinks.json`

Debe devolver JSON válido (no error 503).

### 5.3 Verificar

```bash
bubblewrap validate --url https://TU-URL
```

O la herramienta online: [Statement List Generator and Tester](https://developers.google.com/digital-asset-links/tools/generator)

---

## Paso 6 — Subir a Play Console

1. **Producción** o **Prueba interna** → Crear versión.
2. Sube el archivo **`.aab`**.
3. Completa la ficha:

| Requisito | Qué poner |
|-----------|-----------|
| **Título** | Ceromancia — Lectura de velas |
| **Descripción corta/larga** | Qué hace la app (lectura orientativa de velas con foto) |
| **Icono** | 512×512 PNG |
| **Capturas** | Mínimo 2 capturas de teléfono (1080×1920 o similar) |
| **Política de privacidad** | `https://TU-URL/privacidad` |
| **Clasificación de contenido** | Cuestionario en Play Console |
| **Público objetivo** | Edad según tu criterio |
| **Datos de seguridad** | Indica que se suben fotos para análisis |

4. **Revisión**: Google suele tardar desde horas hasta varios días.

---

## Paso 7 — Actualizar la app después

1. Cambias la web en tu servidor (usuarios ven cambios al abrir la app).
2. Si cambias `packageId`, icono de launcher o permisos Android → nuevo `bubblewrap build` y subes nuevo AAB con **versionCode** mayor.

En `android-twa/twa-manifest.json` (o `app/build.gradle`) incrementa `versionCode` y `versionName` antes de cada subida.

---

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| Pantalla en blanco / barra de Chrome | `assetlinks.json` mal configurado o huella SHA incorrecta |
| Play rechaza por privacidad | URL `/privacidad` accesible y formulario “Seguridad de datos” coherente |
| La cámara no abre | Tu app usa selector de archivos; no hace falta permiso CAMERA si solo eliges de galería |
| App muy pesada | TWA pesa poco; casi todo es la web remota |

---

## Alternativa: Capacitor

Si más adelante quieres plugins nativos (notificaciones push, compras in-app), puedes migrar a [Capacitor](https://capacitorjs.com/) envolviendo la misma URL. Para empezar, **TWA + Bubblewrap** es lo más simple.

---

## Checklist rápido

- [ ] URL HTTPS en producción
- [ ] `/manifest.webmanifest` y iconos 192/512
- [ ] `/privacidad` publicada
- [ ] Cuenta Play Console
- [ ] `bubblewrap init` + `bubblewrap build` → AAB
- [ ] Variables `ANDROID_*` y `assetlinks.json` OK
- [ ] Ficha de tienda + capturas + política de privacidad
- [ ] Subir AAB y enviar a revisión
