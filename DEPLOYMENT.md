# Blinch Deployment Guide

Complete guide for deploying the Blinch protocol to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [MCP Server Deployment](#mcp-server-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### For Backend VPS Deployment

**What is a VPS?**
A VPS (Virtual Private Server) is a remote computer that runs 24/7 in the cloud. You'll rent one from a hosting provider and access it remotely to deploy your backend.

**Choosing a VPS Provider:**

Popular options (all have free trials or low-cost plans):
- **DigitalOcean** - $6/month, very beginner-friendly
- **Linode** - $5/month, good performance
- **AWS EC2** - Free tier available (12 months), more complex
- **Vultr** - $6/month, simple setup
- **Hetzner** - ~€4/month, great value in Europe

**Recommended VPS Specifications:**
- **CPU**: 1 vCPU minimum (2 recommended for production)
- **RAM**: 1GB minimum (2GB recommended)
- **Storage**: 20GB SSD minimum
- **Operating System**: Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- **Bandwidth**: 1TB/month minimum

**Required Before Starting:**

| Item | Why You Need It | How to Get It |
|------|----------------|---------------|
| **VPS Server** | Hosts your backend 24/7 | Sign up at DigitalOcean/Linode/AWS and create a "Droplet" or "Instance" |
| **Domain Name** | Makes your API accessible (e.g., `api.blinch.network`) | Buy from Namecheap, GoDaddy, or Cloudflare ($10-15/year) |
| **SSH Access** | Connect to your VPS remotely | Use Terminal (Mac/Linux) or PuTTY (Windows) |
| **Root Password** | Admin access to your server | Created when you set up your VPS |

**Network Requirements:**
- Your VPS must allow **outbound internet** (for blockchain queries)
- Your VPS must allow **inbound traffic** on ports 80 (HTTP) and 443 (HTTPS)
- Your domain's DNS A record must point to your VPS IP address

### For Local Development

If you want to test locally before deploying:

**Required Software:**
- **Node.js**: v25.6.1 or higher ([download](https://nodejs.org/))
- **npm**: v10.9.0 or higher (comes with Node.js)
- **Git**: v2.40.0 or higher ([download](https://git-scm.com/))
- **TypeScript**: v5.7.2 (installed via npm)

**Check your versions:**
```bash
node --version
npm --version
git --version
```

### Required Accounts & Services

| Service | Purpose | Required For |
|---------|---------|--------------|
| **GitHub Account** | Store your code | All deployments |
| **BCH Wallet** | Test transactions | Chipnet testing |
| **Domain Name** | Professional URL | Production deployment |
| **CashScript Wallet** | Deploy smart contracts | Contract deployment |

### Network Access

- **Chipnet Electrum Server**: For testnet deployments (`chipnet.imaginary.cash:50004`)
- **Mainnet Electrum Server**: For production deployments
- **Outbound Internet Access**: Required for npm installs and blockchain queries

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/blinch.git
cd blinch
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm run install:all
```

### 3. Configure Environment Variables

**IMPORTANT:** The project has three separate environments to configure:

**Backend** `backend/.env`:
```bash
# Server
PORT=3001
NODE_ENV=production

# Network
NETWORK=chipnet

# Electrum Server (optional, defaults to public servers)
ELECTRUM_SERVER=chipnet.imaginary.cash
ELECTRUM_PORT=50004

# Contract Deployment
CREATOR_PUBLIC_KEY=02abc...
CREATOR_PRIVATE_KEY=your_private_key
RECIPIENT_PUBLIC_KEY=03xyz...

# Payment Configuration (for x402)
PAYMENT_RECIPIENT=bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1
API_ACCESS_AMOUNT=1000
PREMIUM_AMOUNT=5000
```

**Frontend** Environment Variables:

For local development, use **Root** `.env.local`:
```bash
# This file is used by Next.js during development
# Copy from .env.local.example and fill in your values

# Backend API URL (for server-side proxy)
BACKEND_URL=http://localhost:3001

# Public API URL (for client-side requests)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Network (chipnet, testnet, mainnet)
NEXT_PUBLIC_NETWORK=chipnet
```

For production deployment on Vercel/VPS, use **Frontend** `frontend/.env.local`:
```bash
# Backend API URL
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=https://api.blinch.network

# Network
NEXT_PUBLIC_NETWORK=chipnet

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Note:** The root `.env` and `.env.local.example` files are specifically for Next.js frontend development. Variables prefixed with `NEXT_PUBLIC_*` are exposed to the browser, while `BACKEND_URL` is used server-side.

---

## Smart Contract Deployment

### Step 1: Compile Contract

```bash
cd contracts
npm run build
```

This compiles `Blinch.cash` and outputs to `dist/Blinch.json`.

### Step 2: Configure Wallet

Edit `backend/.env` with your wallet credentials:

```bash
# Option 1: HD Wallet (Recommended)
MNEMONIC="your twelve word mnemonic phrase here"
DERIVATION_PATH="m/44'/145'/0'/0/0"

# Option 2: Direct Keys
CREATOR_PUBLIC_KEY=02abc...
CREATOR_PRIVATE_KEY=your_private_key
```

### Step 3: Deploy to Chipnet (Testnet)

```bash
cd contracts
npm run deploy:chipnet -- --recipient=03abc...def
```

**Example Output:**
```
🚀 Deploying Blinch contract to chipnet...
📊 Current block height: 1234567
⏰ Timeout block: 1234711 (+144 blocks)
🔐 Deriving keys from HD wallet...
✓ Creator: bitcoincash:qabc...
✓ Recipient PK: 03abc...
📜 Contract address: bitcoincash:pxyz...
🔗 Redemption address: bitcoincash:pxyz...
✅ Contract deployed successfully!
📝 Transaction ID: 0a1b2c3d...
💾 Deployment info saved to: deployments/chipnet-1234567890.json

🔍 Verifying deployment...
✓ Found 1 UTXOs at contract address
✅ Deployment verified successfully!

🎉 Blinch contract is ready to use!

Contract address: bitcoincash:pxyz...
Transaction: https://chipnet.net/api/tx/0a1b2c3d...
```

### Step 4: Fund the Contract

Send BCH to the contract address to enable transactions:

```bash
# Using Bitcoin.com CLI
bch-cli sendtoaddress "bitcoincash:pxyz..." 0.01

# Or use chipnet faucet
# https://chipnet.net/faucet
```

### Step 5: Deploy to Testnet (Optional)

```bash
npm run deploy:testnet -- --recipient=03abc...def
```

### Step 6: Deploy to Mainnet (Production)

⚠️ **WARNING**: Only deploy to mainnet after thorough testing!

```bash
# Update .env for mainnet
NETWORK=mainnet

# Deploy
npm run deploy:mainnet -- --recipient=03abc...def
```

### Deployment Artifacts

After deployment, artifacts are saved to `contracts/deployments/`:

```json
{
  "network": "chipnet",
  "contractAddress": "bitcoincash:pxyz...",
  "transactionId": "0a1b2c3d...",
  "timeout": 1234711,
  "creatorPk": "02abc...",
  "creatorAddress": "bitcoincash:qabc...",
  "recipientPk": "03xyz...",
  "deployedAt": "2026-02-16T12:00:00.000Z",
  "blockHeight": 1234567
}
```

---

## Backend Deployment

### Understanding the Architecture

Before deploying, it helps to understand what each component does:

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  User's Browser │ ───> │  Nginx (Port │ ───> │  Your Backend   │
│  (Port 443)     │      │   80/443)    │      │  (Port 3001)    │
└─────────────────┘      └──────────────┘      └─────────────────┘
                                │                        │
                                │                        ▼
                                │                 ┌──────────────────┐
                                │                 │  BCH Blockchain  │
                                │                 │  (Electrum)      │
                                │                 └──────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  SSL Certificate │
                        │  (HTTPS)         │
                        └──────────────────┘
```

**Component Roles:**
- **Nginx**: The "doorman" - receives web requests and forwards them to your backend
- **PM2**: The "manager" - keeps your backend running and restarts it if it crashes
- **Node.js**: The "engine" - runs your JavaScript/TypeScript backend code
- **SSL Certificate**: The "security guard" - encrypts traffic so hackers can't read it
- **Firewall (ufw)**: The "bouncer" - blocks unwanted traffic

**Why do we need all this?**
- Without Nginx, you'd need to run your backend as `root` (security risk)
- Without PM2, your backend would stop if it crashes or when you close SSH
- Without SSL, your traffic would be unencrypted (security risk)
- Without a firewall, your server would be exposed to attacks

### Option 1: Traditional VPS

This guide walks through deploying the backend on a VPS (Virtual Private Server) like DigitalOcean, Linode, AWS EC2, or any similar provider.

**Estimated Time:** 30-45 minutes for first-time setup

#### Phase 1: Initial Server Setup

**What you need before starting:**
- A VPS with Ubuntu 20.04+ or Debian 11+ (recommended: 1GB RAM minimum)
- Root access or a user with sudo privileges
- Your domain name pointed to the VPS IP address (e.g., `api.yourdomain.com`)
- SSH access to your server

##### Step 1.1: Connect to Your VPS

```bash
# Replace with your actual VPS IP address and username
ssh root@your.vps.ip.address

# OR if you have a non-root user with sudo
ssh username@your.vps.ip.address
```

**What this does:** Opens a secure shell connection to your remote server.

##### Step 1.2: Update System Packages

```bash
# Update package lists and upgrade installed packages
sudo apt update && sudo apt upgrade -y
```

**What this does:** Ensures your server has the latest security updates and package information.

##### Step 1.3: Install Node.js 25.x

```bash
# Install Node.js 25.x using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_25.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v25.x.x
npm --version   # Should show v10.x.x or higher
```

**What this does:**
- Downloads and installs Node.js version 25.x
- Node.js is required to run the backend server
- npm (Node Package Manager) comes bundled with Node.js

##### Step 1.4: Install Git

```bash
sudo apt install -y git

# Verify installation
git --version
```

**What this does:** Git is needed to clone your repository from GitHub.

##### Step 1.5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

**What this does:**
- PM2 keeps your server running in the background
- Automatically restarts the server if it crashes
- Manages server logs and monitoring

##### Step 1.6: Install Nginx (Web Server)

```bash
sudo apt install -y nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Start Nginx if not already running
sudo systemctl start nginx

# Verify it's running
sudo systemctl status nginx
```

**What this does:**
- Nginx acts as a reverse proxy, directing web traffic to your backend
- Handles SSL/HTTPS encryption
- Provides security and load balancing

---

#### Phase 2: Deploy Your Code

##### Step 2.1: Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your actual repo URL)
sudo git clone https://github.com/your-username/blinch.git

# Set ownership to your user (replace 'username' with your actual username)
sudo chown -R username:username /var/www/blinch

# Navigate to backend directory
cd /var/www/blinch/backend
```

**What this does:**
- Downloads your project code from GitHub to the server
- Sets proper file permissions so you can modify files

##### Step 2.2: Install Dependencies

```bash
# Install all required Node.js packages
npm install --production
```

**What this does:**
- Downloads all libraries listed in `package.json`
- `--production` flag skips development dependencies (reduces install time and size)

##### Step 2.3: Build the Backend

```bash
# Compile TypeScript to JavaScript
npm run build
```

**What this does:**
- Converts TypeScript code to executable JavaScript
- Creates the `dist/` folder with production-ready files

---

#### Phase 3: Configure Environment

##### Step 3.1: Create Environment File

```bash
# Create .env file from template (if exists)
cp .env.example .env

# OR create a new .env file
nano .env
```

**What this does:** Creates configuration file for your environment variables.

##### Step 3.2: Edit Environment Variables

Paste the following into `.env` (replace values with your actual data):

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Network
NETWORK=chipnet  # chipnet | testnet | mainnet

# Electrum Server (for blockchain queries)
ELECTRUM_SERVER=chipnet.imaginary.cash
ELECTRUM_PORT=50004

# Contract Keys (IMPORTANT: Keep these secure!)
# Generate these using a secure wallet
CREATOR_PUBLIC_KEY=02abc...  # Your public key
CREATOR_PRIVATE_KEY=your_private_key_here  # Your private key (NEVER commit this!)

# Recipient
RECIPIENT_PUBLIC_KEY=03xyz...  # Recipient's public key

# Payment Configuration (for x402 payment feature)
PAYMENT_RECIPIENT=bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1
API_ACCESS_AMOUNT=1000
PREMIUM_AMOUNT=5000

# CORS (which domains can access your API)
CORS_ORIGIN=https://yourdomain.com
```

**Save and exit:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`.

**What this does:** Configures how your backend behaves in production.

---

#### Phase 4: Start the Backend Server

##### Step 4.1: Start with PM2

```bash
# Start the backend server with PM2
pm2 start dist/server.js --name blinch-backend

# Check if it's running
pm2 status

# View real-time logs
pm2 logs blinch-backend

# Set PM2 to start on system reboot
pm2 startup
# Run the command output by the above command
pm2 save
```

**What this does:**
- Starts your backend server in the background
- `pm2 startup` ensures the server restarts automatically if the VPS reboots
- `pm2 save` saves the current process list

##### Step 4.2: Verify Backend is Running

```bash
# Test the backend locally
curl http://localhost:3001/api/health

# You should see a JSON response like:
# {"status":"ok","service":"blinch-backend",...}
```

**What this does:** Confirms your backend is responding to requests.

---

#### Phase 5: Configure Nginx Reverse Proxy

##### Step 5.1: Create Nginx Configuration

```bash
# Create a new site configuration
sudo nano /etc/nginx/sites-available/blinch-api
```

Paste the following configuration (replace `api.blinch.network` with your actual domain):

```nginx
# /etc/nginx/sites-available/blinch-api
server {
    listen 80;
    server_name api.blinch.network;  # Replace with your domain

    # Redirect HTTP to HTTPS (uncomment after SSL is configured)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;

        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Save and exit:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`.

**What this does:**
- Tells Nginx how to handle incoming requests
- Forwards requests to your backend running on port 3001
- Sets proper headers for WebSocket and HTTPS support

##### Step 5.2: Enable the Site

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/blinch-api /etc/nginx/sites-enabled/

# Test Nginx configuration for errors
sudo nginx -t

# If test is successful, reload Nginx
sudo systemctl reload nginx
```

**What this does:**
- Activates your Nginx configuration
- Checks for syntax errors before applying
- Applies the new configuration without downtime

##### Step 5.3: Update Firewall (if enabled)

```bash
# Allow HTTP and HTTPS through firewall
sudo ufw allow 'Nginx Full'

# Allow SSH (so you don't lock yourself out)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

**What this does:**
- Opens necessary ports for web traffic (80, 443)
- Ensures you can still connect via SSH

---

#### Phase 6: Configure SSL/HTTPS

##### Step 6.1: Install Certbot

```bash
# Install Certbot for Let's Encrypt SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

**What this does:** Certbot is a tool that automatically configures free SSL certificates.

##### Step 6.2: Obtain SSL Certificate

```bash
# Obtain and configure SSL certificate
sudo certbot --nginx -d api.blinch.network

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to Terms of Service
# 3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

**What this does:**
- Generates a free SSL certificate from Let's Encrypt
- Automatically configures Nginx to use HTTPS
- Sets up auto-renewal of certificates

##### Step 6.3: Verify SSL is Working

```bash
# Test HTTPS access
curl https://api.blinch.network/api/health

# Or visit in your browser:
# https://api.blinch.network/api/health
```

**What this does:** Confirms that HTTPS is working correctly.

---

#### Phase 7: Verify Deployment

##### Step 7.1: Check All Services

```bash
# Check PM2 processes
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View recent backend logs
pm2 logs blinch-backend --lines 50
```

**What this does:** Confirms all services are running properly.

##### Step 7.2: Test API Endpoint

```bash
# Test health endpoint from your local machine
curl https://api.blinch.network/api/health

# Expected response:
# {
#   "status": "ok",
#   "service": "blinch-backend",
#   "version": "1.0.0",
#   "timestamp": "2026-02-24T12:00:00.000Z"
# }
```

**What this does:** Verifies your API is accessible from the internet.

---

### Common PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs blinch-backend

# View real-time logs
pm2 logs blinch-backend --lines 100

# Restart the server
pm2 restart blinch-backend

# Stop the server
pm2 stop blinch-backend

# Delete from PM2 list
pm2 delete blinch-backend

# Monitor CPU and memory usage
pm2 monit
```

### Updating Your Backend

When you need to deploy updates:

```bash
# SSH into your server
ssh username@your.vps.ip.address

# Navigate to project directory
cd /var/www/blinch

# Pull latest code
git pull origin main

# Install new dependencies (if package.json changed)
cd backend
npm install --production

# Rebuild
npm run build

# Restart PM2 process
pm2 restart blinch-backend

# Check logs for errors
pm2 logs blinch-backend --lines 50
```

### Option 2: Cloud Platforms

#### AWS ECS

1. Push image to ECR
2. Create ECS task definition
3. Deploy to ECS cluster

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/blinch-backend

# Deploy to Cloud Run
gcloud run deploy blinch-backend \
  --image gcr.io/PROJECT_ID/blinch-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Heroku

```bash
# Create Procfile
echo "web: node dist/server.js" > backend/Procfile

# Deploy
heroku create blinch-api
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Deploy

```bash
cd frontend
vercel

# Follow prompts
# - Link to existing project or create new
# - Set root directory to ./frontend
# - Set build command to npm run build
# - Set output directory to .next
```

#### 3. Environment Variables

Set in Vercel dashboard or via CLI:

```bash
vercel env add BACKEND_URL production
# Enter: https://api.blinch.network

vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.blinch.network
```

#### 4. Custom Domain

```bash
vercel domains add blinch.network
```

### Option 2: Netlify

#### 1. Build Configuration

Create `frontend/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[environment]
  NODE_VERSION = "25.6.1"
```

#### 2. Deploy

```bash
netlify deploy --prod
```

### Option 3: VPS with PM2

#### 1. Build Frontend

```bash
cd frontend
npm run build
```

#### 2. Start with PM2

Create `frontend/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'blinch-frontend',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/path/to/blinch/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start:
```bash
pm2 start ecosystem.config.js
```

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/blinch-frontend
server {
    listen 80;
    server_name blinch.network www.blinch.network;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## MCP Server Deployment

The MCP server can run standalone or as part of the backend.

### Standalone Deployment

#### 1. Build MCP Server

```bash
cd backend
npm run build
```

#### 2. Run MCP Server

```bash
node dist/mcp/index.js
```

#### 3. Systemd Service

Create `/etc/systemd/system/blinch-mcp.service`:

```ini
[Unit]
Description=Blinch MCP Server
After=network.target

[Service]
Type=simple
User=blinch
WorkingDirectory=/var/www/blinch/backend
ExecStart=/usr/bin/node /var/www/blinch/backend/dist/mcp/index.js
Restart=always
Environment=NODE_ENV=production
Environment=BACKEND_URL=http://localhost:3001

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable blinch-mcp
sudo systemctl start blinch-mcp
```

### Integration with Backend

The MCP server is already integrated into the backend. To expose it:

#### 1. Add MCP Route

**Backend** `src/server.ts`:
```typescript
// Add this after other routes
app.get('/mcp', (_req, res) => {
  res.json({
    name: 'blinch-gateway',
    version: '1.0.0',
    endpoint: '/mcp/stdio',
    documentation: 'https://docs.blinch.network/mcp'
  });
});
```

#### 2. WebSocket Endpoint (Optional)

For MCP-over-WebSocket support, add a WebSocket endpoint:

```typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3002 });

wss.on('connection', (ws) => {
  console.log('MCP client connected');

  ws.on('message', async (message) => {
    // Handle MCP protocol messages
    const response = await handleMCPMessage(message);
    ws.send(JSON.stringify(response));
  });
});
```

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing (`npm run test:all`)
- [ ] Code audited for security vulnerabilities
- [ ] Environment variables configured
- [ ] Database schemas prepared (if applicable)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Rate limiting configured
- [ ] CORS properly configured

### Smart Contract Checklist

- [ ] Contract thoroughly tested on Chipnet
- [ ] Audit completed
- [ ] Creator keys securely stored
- [ ] Timeout period appropriate
- [ ] Recipient address verified
- [ ] Contract funded
- [ ] Deployment artifacts backed up

### Backend Checklist

- [ ] API endpoints tested
- [ ] Database connections verified
- [ ] Payment verification working
- [ ] x402 middleware tested
- [ ] MCP server functional
- [ ] Logging configured
- [ ] Health checks working
- [ ] Error handling tested

### Frontend Checklist

- [ ] All pages rendering correctly
- [ ] API proxy working
- [ ] Caching configured
- [ ] Responsive design tested
- [ ] Performance optimized
- [ ] SEO meta tags set
- [ ] Analytics integrated
- [ ] Error pages created

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team trained
- [ ] Rollback plan tested
- [ ] Support channels ready

---

## Monitoring & Maintenance

### Health Checks

**Backend Health:**
```bash
curl https://api.blinch.network/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "blinch-backend",
  "version": "1.0.0",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

### Logs

**PM2 Logs:**
```bash
pm2 logs blinch-backend
pm2 logs blinch-frontend
```


**Systemd Logs:**
```bash
sudo journalctl -u blinch-backend -f
sudo journalctl -u blinch-mcp -f
```

### Metrics

Monitor these metrics:

- **API Response Time**: < 200ms (p95)
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **Transaction Success**: > 95%
- **Memory Usage**: < 512MB per service

### Alerting

Set up alerts for:

- Server down
- High error rate
- Slow response times
- Failed payments
- Low contract balance

### Backup Strategy

**Daily Backups:**
- Database dumps
- Deployment artifacts
- Environment variables
- SSL certificates

**Off-site Storage:**
- S3 or similar
- Encrypted backups
- 30-day retention

### Updates

**Update Process:**

1. Deploy to staging
2. Run smoke tests
3. Deploy to production (blue-green deployment)
4. Monitor for issues
5. Rollback if needed

**Rollback Command:**

```bash
# PM2
pm2 reload blinch-backend


# Git
git revert HEAD && git push
```

---

## Troubleshooting

### Contract Deployment Fails

**Error**: "Contract artifact not found"

**Solution**:
```bash
cd contracts
npm run build
```

### Backend Won't Start

**Error**: "ECONNREFUSED"

**Solution**: Check port is available:
```bash
lsof -i :3001
```

### MCP Server Not Responding

**Error**: "MCP timeout"

**Solution**: Check backend is running:
```bash
curl http://localhost:3001/api/health
```

### Payment Verification Fails

**Error**: "Transaction not found"

**Solution**:
- Verify transaction ID is correct
- Check network (chipnet vs mainnet)
- Wait for confirmations
- Verify Electrum server connectivity

### Frontend Build Fails

**Error**: "Module not found"

**Solution**:
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

---

## Security Best Practices

1. **Never commit private keys** to git
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Implement rate limiting** on public endpoints
5. **Sanitize user inputs**
6. **Keep dependencies updated**
7. **Use Strong password policies**
8. **Enable firewalls**
9. **Regular security audits**
10. **Monitor for suspicious activity**

---

## Support

For issues or questions:

- **Documentation**: https://docs.blinch.network
- **GitHub Issues**: https://github.com/blinch/protocol/issues
- **Discord**: https://discord.gg/blinch
- **Email**: support@blinch.network

---

## License

MIT

---

**Last Updated**: 2026-02-16
**Version**: 1.0.0
