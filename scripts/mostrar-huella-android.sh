#!/usr/bin/env bash
# Muestra la huella SHA-256 del keystore para configurar Play Store / assetlinks.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="${1:-$ROOT/android-twa/android.keystore}"
ALIAS="${2:-android}"

if [[ ! -f "$KEYSTORE" ]]; then
  echo "No existe: $KEYSTORE"
  echo "Primero ejecuta: bubblewrap init (crea android.keystore)"
  exit 1
fi

echo "Keystore: $KEYSTORE"
echo ""
keytool -list -v -keystore "$KEYSTORE" -alias "$ALIAS" | grep -A1 "SHA256:"
echo ""
echo "Copia la huella SHA256 y configúrala en Render/Cloud Run:"
echo "  ANDROID_PACKAGE_NAME=com.ceromancia.lecturavelas"
echo "  ANDROID_SHA256_FINGERPRINTS=<huella con dos puntos>"
