# Blinch - Bitcoin Cash Interactive Blinks Protocol

A protocol for interactive Bitcoin Cash "Blinks" built for the BCH-1 Hackcelerator.

## Protocol Requirement

Every transaction MUST include an OP_RETURN output with the hex prefix `464c4f5701` (`FLOW\x01`).

## Project Structure

```
blinch/
├── contracts/          # CashScript smart contracts
│   ├── scripts/        # Deployment scripts
│   └── Blinch.cash     # Main covenant contract
├── backend/            # Express 5.2.1 API server
│   └── src/
│       ├── routes/     # API endpoints
│       ├── middleware/ # Express middleware
│       └── types/      # TypeScript types
└── frontend/           # Next.js 16 application
    └── src/
        ├── app/        # Next.js 16 app router
        ├── components/ # React components
        └── lib/        # Utilities and SDK integrations
```

## Tech Stack

- **Contracts**: CashScript 0.12.1
- **Backend**: Node.js 25.6.1 + Express 5.2.1
- **Frontend**: Next.js 16 (stable) with Turbopack
- **Styling**: Tailwind CSS 4.0 with glassmorphic dark mode

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev:backend    # Start Express API on port 3001
npm run dev:frontend   # Start Next.js on port 3000

# Build
npm run build:all

# Test
npm run test:all
```

## Development

### Smart Contract Development
```bash
cd contracts
npm run build          # Compile Blinch.cash
npm run deploy:chipnet # Deploy to Chipnet testnet
```

### Backend Development
```bash
cd backend
npm run dev            # Start development server
npm run test           # Run tests
npm run lint           # Lint code
```

### Frontend Development
```bash
cd frontend
npm run dev            # Start Next.js with Turbopack
npm run build          # Build for production
npm run lint           # Lint code
```

## Architecture

### Three-Phase Design

1. **Phase 1: Smart Contract** - CashScript covenant with OP_RETURN enforcement
2. **Phase 2: Backend API** - Express server serving BCH-Action JSON Schema
3. **Phase 3: Frontend** - Next.js app with proxy and action renderer

### BCH-Action JSON Schema

The backend serves action metadata at `/api/action/:id` following the v1.1.0 schema:

```json
{
  "version": "1.1.0",
  "type": "action",
  "icon": "https://blinch.network/assets/icon.png",
  "title": "Interactive Blinch Action",
  "description": "Metadata for a Bitcoin Cash interactive link.",
  "links": {
    "actions": [{
      "label": "Execute",
      "href": "bitcoincash:addr?amount=0.01&op_return=464c4f5701[action_type]",
      "parameters": [{"name": "note", "label": "Public Note", "type": "text"}]
    }]
  },
  "metadata": {
    "protocol": "Blinch",
    "identifier": "FLOW\\x01",
    "hex_prefix": "464c4f5701"
  }
}
```

## License

MIT
