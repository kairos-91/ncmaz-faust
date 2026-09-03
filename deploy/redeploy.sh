#!/usr/bin/env bash
# Corre esto en el VPS (dentro de la carpeta del proyecto) para llevar
# el servidor a la última versión de la rama actual.
#   bash deploy/redeploy.sh
set -euo pipefail

echo "→ git pull"
git pull

echo "→ npm ci"
npm ci

echo "→ npm run build"
npm run build

echo "→ pm2 reload levery"
pm2 reload levery

echo "✓ Listo. pm2 status:"
pm2 status levery
