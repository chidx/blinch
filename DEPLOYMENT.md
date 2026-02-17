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

### Required Software

- **Node.js**: v25.6.1 or higher
- **npm**: v10.0.0 or higher
- **Git**: v2.40.0 or higher
- **TypeScript**: v5.7.2

### Required Accounts

- **Bitcoin Cash Testnet Wallet**: For Chipnet testing
- **Domain Name**: For frontend deployment (optional but recommended)
- **Hosting Provider**: VPS or cloud platform (AWS, GCP, DigitalOcean, etc.)

### Network Access

- **Chipnet Electrum Server**: For testnet deployments
- **Mainnet Electrum Server**: For production deployments
- **Outbound Internet Access**: For npm installs and blockchain queries

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

Create environment files for each workspace:

**Root** `.env`:
```bash
# Network Configuration
NETWORK=chipnet  # chipnet | testnet | mainnet

# Backend API
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

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

**Frontend** `frontend/.env.local`:
```bash
# Backend API URL
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=https://api.blinch.network

# Network
NEXT_PUBLIC_NETWORK=chipnet

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

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

### Option 1: Traditional VPS

#### 1. Build Backend

```bash
cd backend
npm run build
```

#### 2. Start Server

```bash
# Production mode
NODE_ENV=production npm start

# Or using PM2 (recommended)
pm2 start dist/server.js --name blinch-backend
```

#### 3. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/blinch-api
server {
    listen 80;
    server_name api.blinch.network;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/blinch-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Configure SSL with Let's Encrypt

```bash
sudo certbot --nginx -d api.blinch.network
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
