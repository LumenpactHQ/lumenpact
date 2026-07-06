#!/usr/bin/env bash
set -euo pipefail

if [ -f frontend/package.json ]; then
  cd frontend
  npm run build
  if [ -d .next ] && [ ! -d ../.next ]; then
    mkdir -p ../.next
    cp -R .next/. ../.next/
  fi
else
  npm run build
fi
