# App Android con Capacitor

## Requisitos

- Node.js 18+
- Android Studio (con SDK Android)
- JDK 17+

## Comandos (desde la raíz del repo)

```bash
cd LecturaCandeleApp-main

npm install

npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Atajo:

```bash
npm run cap:android
```

En Android Studio: **Build → Generate Signed Bundle / APK** para subir a Play Store.

## Cómo funciona

- `npm run build` copia `backend/static/` a `www/` con rutas relativas.
- La app nativa llama al API en Render: `https://ceromancia-velas.onrender.com`
- Cambiar URL: `CEROMANCIA_API_BASE=https://tu-dominio.com npm run build`

## Alternativa: solo web remota

En `capacitor.config.ts`, descomenta `server.url` con tu URL de Render y comenta el empaquetado local si prefieres que la app sea solo un WebView a tu sitio.

## App ID

`com.ceromancia.velas` — debe coincidir con Play Console y `ANDROID_PACKAGE_NAME` en Render (asset links).
