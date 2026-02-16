# Blinch Quick Start Guide

Get Blinch up and running in 5 minutes.

## Prerequisites

- Node.js 25.6.1+
- npm 10.0.0+
- Git

## Installation

```bash
# Clone repository
git clone https://github.com/your-org/blinch.git
cd blinch

# Install dependencies
npm run install:all
```

## Configuration

### 1. Environment Variables

Copy example environment files:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp .env.local.example frontend/.env.local
```

### 2. Configure Backend

Edit `backend/.env`:

```bash
PORT=3001
NETWORK=chipnet
NODE_ENV=development
```

### 3. Configure Frontend

Edit `frontend/.env.local`:

```bash
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_NETWORK=chipnet
```

## Development

### Start Backend

```bash
cd backend
npm run dev
```

Backend runs on http://localhost:3001

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:3000

### Run MCP Server

```bash
cd backend
npm run mcp
```

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/api/health

# Get example action
curl http://localhost:3001/api/action/example

# Test protected endpoint (returns 402)
curl http://localhost:3001/api/protected/hello
```

### Test Frontend

Visit http://localhost:3000 in your browser

### Test MCP Server

```bash
# Using MCP Inspector
npx @modelcontextprotocol/inspector node backend/dist/mcp/index.js
```

## Smart Contract Deployment (Optional)

### Deploy to Chipnet

```bash
cd contracts

# Configure wallet in backend/.env
# CREATOR_PRIVATE_KEY=your_key
# RECIPIENT_PUBLIC_KEY=recipient_key

# Deploy
npm run deploy:chipnet -- --recipient=03abc...
```

## Next Steps

- Read [Full Deployment Guide](DEPLOYMENT.md)
- Check [API Documentation](backend/README.md)
- Explore [MCP Integration](backend/MCP.md)
- Review [x402 Protocol](backend/X402.md)

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Module Not Found

```bash
cd backend
rm -rf node_modules
npm install
```

### Build Errors

```bash
# Clean build
cd contracts
npm run clean
npm run build
```

## Support

- **Issues**: https://github.com/blinch/protocol/issues
- **Docs**: https://docs.blinch.network
- **Discord**: https://discord.gg/blinch

---

**Ready to build the future of Bitcoin Cash interactions?** 🚀
