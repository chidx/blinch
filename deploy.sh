#!/bin/bash

#############################################
# Blinch VPS Deployment Script
#
# Usage: ./deploy.sh [environment]
#   environment: "production" or "staging" (default: production)
#############################################

set -e  # Exit on error

# Configuration
ENVIRONMENT=${1:-production}
APP_DIR="/home/blinch/blinch"
LOG_DIR="/home/blinch/logs"
BACKUP_DIR="/home/blinch/backups"
GIT_REPO="https://github.com/chidx/blinch.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please run as regular user, not root"
    exit 1
fi

# Create directories
log_info "Creating directories..."
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$APP_DIR"

# Backup current deployment
if [ -d "$APP_DIR/backend" ]; then
    log_info "Backing up current deployment..."
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r "$APP_DIR/backend/data" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
fi

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    log_info "Updating repository..."
    cd "$APP_DIR"
    git pull origin master
else
    log_info "Cloning repository..."
    git clone "$GIT_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

# Install backend dependencies
log_info "Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci --production

# Build backend
log_info "Building backend..."
npm run build

# Install frontend dependencies
log_info "Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm ci

# Build frontend
log_info "Building frontend..."
npm run build

# Restart services with PM2
log_info "Restarting services..."
if pm2 list | grep -q "blinch-backend"; then
    pm2 restart blinch-backend
else
    cd "$APP_DIR/backend"
    pm2 start npm --name "blinch-backend" -- run start
fi

if pm2 list | grep -q "blinch-frontend"; then
    pm2 restart blinch-frontend
else
    cd "$APP_DIR/frontend"
    pm2 start npm --name "blinch-frontend" -- run start
fi

# Save PM2 configuration
pm2 save

log_info "Deployment completed successfully!"
echo ""
echo "Services status:"
pm2 list
