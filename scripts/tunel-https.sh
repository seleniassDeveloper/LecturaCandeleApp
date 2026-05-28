#!/usr/bin/env bash
# Expone tu servidor local con HTTPS público (ideal para probar en el móvil al instante).
# Terminal 1: cd backend && source .venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8000
# Terminal 2: bash scripts/tunel-https.sh

set -e
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Instala cloudflared:"
  echo "  brew install cloudflare/cloudflare/cloudflared"
  echo "O descarga: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
  exit 1
fi
echo "Creando túnel hacia http://127.0.0.1:8000 ..."
cloudflared tunnel --url http://127.0.0.1:8000
