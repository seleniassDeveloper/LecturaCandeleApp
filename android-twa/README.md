# Proyecto Android (TWA) para Play Store

Esta carpeta es donde generarás el proyecto con **Bubblewrap**. No subas el keystore (`.jks` / `.keystore`) a GitHub.

## Comandos

```bash
npm install -g @bubblewrap/cli

# Sustituye por tu URL ya desplegada:
bubblewrap init --manifest https://TU-DOMINIO.run.app/manifest.webmanifest

bubblewrap build
```

El AAB para Play Store suele estar en:

`app/build/outputs/bundle/release/app-release.aab`

## Después del init

1. Copia la huella **SHA-256** del keystore.
2. Configura en Cloud Run (o tu host):
   - `ANDROID_PACKAGE_NAME` = el `packageId` que elegiste en el init
   - `ANDROID_SHA256_FINGERPRINTS` = huella SHA-256
3. Ejecuta `bubblewrap validate --url https://TU-DOMINIO.run.app`

Guía completa: [docs/PLAY_STORE.md](../docs/PLAY_STORE.md)
