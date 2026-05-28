#!/usr/bin/env bash
# Instala herramientas para generar el AAB de Play Store (Mac).
set -euo pipefail

echo "==> Comprobando Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo "Instala Node.js desde https://nodejs.org y vuelve a ejecutar este script."
  exit 1
fi
node --version
npm --version

echo "==> Instalando Bubblewrap (Google TWA)..."
npm install -g @bubblewrap/cli

echo "==> Comprobando Java..."
if ! command -v java >/dev/null 2>&1; then
  echo "Falta Java. Instala JDK 17: https://adoptium.net/"
  exit 1
fi
java -version

echo ""
echo "Listo. Siguiente paso (cuando tengas URL HTTPS):"
echo "  cd android-twa"
echo "  bubblewrap init --manifest https://TU-URL/manifest.webmanifest"
echo ""
echo "Guía completa: docs/GUIA_COMPLETA_PLAY_STORE.md"
