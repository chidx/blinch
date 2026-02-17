#!/bin/bash

# Blinch Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, production

set -e

ENV=${1:-dev}
PROJECT_NAME="blinch"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

echo "🚀 Deploying Blinch to $ENV environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi

    log_info "✓ Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    npm install
    npm run install:all

    log_info "✓ Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."

    if [ "$ENV" != "dev" ]; then
        npm run test:all
        log_info "✓ Tests passed"
    else
        log_warn "Skipping tests in development mode"
    fi
}

# Build backend
build_backend() {
    log_info "Building backend..."

    cd $BACKEND_DIR
    npm run build
    cd ..

    log_info "✓ Backend built"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."

    cd $FRONTEND_DIR
    npm run build
    cd ..

    log_info "✓ Frontend built"
}

# Deploy to development
deploy_dev() {
    log_info "Deploying to development..."

    # Start services locally
    cd $BACKEND_DIR
    npm run dev &
    BACKEND_PID=$!

    cd ../$FRONTEND_DIR
    npm run dev &
    FRONTEND_PID=$!

    log_info "✓ Development environment started"
    log_info "Backend: http://localhost:3001"
    log_info "Frontend: http://localhost:3000"
    log_info "Press Ctrl+C to stop"

    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging..."

    # Build and start services
    cd $BACKEND_DIR
    pm2 start dist/server.js --name blinch-backend
    cd ..

    cd $FRONTEND_DIR
    pm2 start node_modules/.bin/next --name blinch-frontend -- start
    cd ..

    log_info "✓ Deployed to staging"
}

# Deploy to production
deploy_production() {
    log_warn "DEPLOYING TO PRODUCTION!"

    # Confirm deployment
    read -p "Are you sure you want to deploy to production? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Deployment cancelled"
        exit 0
    fi

    log_info "Deploying to production..."

    # Run production checks
    log_info "Running production checks..."
    npm run test:all
    npm run lint

    # Build
    build_backend
    build_frontend

    # Deploy using PM2
    cd $BACKEND_DIR
    pm2 restart blinch-backend || pm2 start dist/server.js --name blinch-backend
    cd ..

    cd $FRONTEND_DIR
    pm2 restart blinch-frontend || pm2 start node_modules/.bin/next --name blinch-frontend -- start
    cd ..

    # Run smoke tests
    log_info "Running smoke tests..."
    sleep 10

    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_info "✓ Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi

    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "✓ Frontend health check passed"
    else
        log_error "Frontend health check failed"
        exit 1
    fi

    log_info "✓ Deployed to production"
}

# Main deployment flow
main() {
    check_prerequisites
    install_dependencies

    case $ENV in
        dev)
            deploy_dev
            ;;
        staging)
            run_tests
            build_backend
            build_frontend
            deploy_staging
            ;;
        production)
            run_tests
            build_backend
            build_frontend
            deploy_production
            ;;
        *)
            log_error "Unknown environment: $ENV"
            echo "Usage: $0 [dev|staging|production]"
            exit 1
            ;;
    esac

    log_info "🎉 Deployment complete!"
}

# Run main function
main
