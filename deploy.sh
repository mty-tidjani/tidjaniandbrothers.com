#!/bin/bash
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
RESET='\033[0m'

log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${RESET} $1"
}

step() {
  echo
  echo -e "${BOLD}${YELLOW}==>${RESET} ${BOLD}$1${RESET}"
}

on_error() {
  echo
  echo -e "${RED}${BOLD}✖ Deploy failed${RESET} (line $1)"
  exit 1
}
trap 'on_error $LINENO' ERR

echo -e "${BOLD}"
echo "┌───────────────────────────────────────┐"
echo "│   Tidjani & Brothers — Deploy         │"
echo "└───────────────────────────────────────┘"
echo -e "${RESET}"

step "Pulling latest changes"
git pull
log "Repository up to date"

step "Installing dependencies"
npm install
log "Dependencies installed"

step "Running database migrations"
npx prisma migrate deploy
log "Migrations applied"

step "Building application"
npm run build
log "Build complete"

step "Restarting process with PM2"
pm2 startOrRestart process.json
pm2 save
log "PM2 process (re)started and saved"

echo
echo -e "${GREEN}${BOLD}✔ Deploy finished successfully${RESET}"
