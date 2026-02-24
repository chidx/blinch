# Blinch - Bitcoin Cash Interactive Blinks Protocol

A protocol for interactive Bitcoin Cash "Blinks" built for the BCH-1 Hackcelerator. Blinch enables interactive Bitcoin Cash links through covenant-based smart contracts that enforce on-chain protocol compliance.

## Protocol Requirement

Every transaction MUST include an OP_RETURN output with the hex prefix `464c4f5701` (`FLOW\x01`). This is enforced by the CashScript covenant using native introspection.

## Project Structure

```
blinch/
├── contracts/              # CashScript smart contracts
│   ├── scripts/            # Deployment scripts & wallet utilities
│   ├── Blinch.cash         # Main covenant contract
│   └── deployments/        # Deployment artifacts
├── backend/                # Express 5.2.1 API server
│   └── src/
│       ├── routes/         # API endpoints (actions, health, premium)
│       ├── middleware/     # Express middleware (error handling, X.402 payments)
│       ├── mcp/            # Model Context Protocol server
│       ├── services/       # Business logic (tierService, contractService)
│       ├── storage/        # In-memory action store
│       ├── lib/            # Action builder, payment verifier
│       └── types/          # TypeScript types
└── frontend/               # Next.js 16 application
    └── src/
        ├── app/            # Next.js 16 app router pages
        │   ├── action/[id]/    # Action renderer
        │   ├── create/        # Action creation flow
        │   ├── dashboard/     # User dashboard
        │   ├── demo/          # Demo actions showcase
        │   └── docs/          # Documentation
        ├── components/     # React components (UI, forms, tiers)
        ├── lib/            # Utilities (API, CashScript, blockchain)
        └── proxy.ts        # Next.js request proxy
```

## Tech Stack

### Smart Contracts
- **CashScript**: 0.12.1 with native introspection
- **Network**: Chipnet testnet
- **Features**: Covenant-based OP_RETURN enforcement

### Backend
- **Runtime**: Node.js 22.22.0+
- **Framework**: Express 5.2.1
- **MCP**: @modelcontextprotocol/sdk 1.0.4 (AI gateway)
- **SDK**: CashScript 0.12.1

### Frontend
- **Framework**: Next.js 16.0.0 (stable) with Turbopack
- **UI**: React 19.0.0
- **Styling**: Tailwind CSS 4.0 with glassmorphic dark mode
- **SDK**: CashScript 0.12.1 for transaction building

## Quick Start

```bash
# Install all dependencies (monorepo)
npm run install:all

# Development (run in separate terminals)
npm run dev:backend    # Start Express API on port 3001
npm run dev:frontend   # Start Next.js on port 3000

# Build all packages
npm run build:all

# Run tests
npm run test:all
```

## Development

### Smart Contract Development
```bash
cd contracts
npm run build          # Compile Blinch.cash to dist/Blinch.json
npm run deploy:chipnet # Deploy to Chipnet testnet
npm run clean          # Remove compiled artifacts
```

Environment variables (create `contracts/.env`):
```
WALLET_MNEMONIC="your twelve word mnemonic phrase"
TIMEOUT_BLOCKS=144
```

### Backend Development
```bash
cd backend
npm run dev            # Start development server (port 3001)
npm run build          # Compile TypeScript
npm run start          # Run production server
npm run lint           # Lint code
npm run mcp            # Run MCP server on stdio
```

### Frontend Development
```bash
cd frontend
npm run dev            # Start Next.js with Turbopack (port 3000)
npm run build          # Build for production
npm run start          # Run production server
npm run lint           # Lint code
npm run test:e2e       # Run Playwright end-to-end tests
```

## Architecture

### Three-Phase Design

1. **Phase 1: Smart Contract** (`contracts/Blinch.cash`)
   - CashScript covenant using native introspection
   - Enforces OP_RETURN prefix check via `tx.outputs[i].lockingBytecode`
   - Execute function: Releases funds to recipient with protocol compliance
   - Cancel function: Creator can reclaim after timeout blocks (default: 144)

2. **Phase 2: Backend API** (`backend/src/`)
   - Express 5.2.1 server with CORS and compression
   - Serves BCH-Action JSON Schema v1.1.0 at `/api/action/:id`
   - MCP Gateway: AI-native protocol interface (`npm run mcp`)
   - Freemium tier system with X.402 payment requirements
   - In-memory action storage with demo pre-seeded actions

3. **Phase 3: Frontend** (`frontend/src/`)
   - Next.js 16 App Router with Turbopack
   - Action renderer at `/action/[id]` consuming BCH-Action JSON Schema
   - Creation flow at `/create` with tier validation
   - Dashboard at `/dashboard` for managing actions
   - Demo showcase at `/demo` with pre-configured examples

### Demo Actions

The backend pre-seeds three demo actions on startup:

1. **Simple Tip** (`simple-tip`)
   - Basic protocol demonstration
   - Shows OP_RETURN enforcement in action

2. **Bounty Blinch** (`bounty-blinch`)
   - Conditional payment via smart contract
   - Requires proof in OP_RETURN data

3. **Dev Reward** (`dev-reward`)
   - Developer appreciation with contract protection
   - Multi-parameter form (username, contribution, message)

### MCP Server Integration

The backend includes a Model Context Protocol server for AI agents:

```bash
cd backend
npm run mcp
```

Available tools:
- `create_blinch_link`: Generate payment links with FLOW\x01 prefix
- `get_action_metadata`: Read action schema and requirements

### Freemium Tiers

| Feature | Free | Premium |
|---------|------|---------|
| Actions/month | 3 | Unlimited |
| Parameters/action | 2 | 10 |
| Advanced Analytics | ❌ | ✅ |
| API Access | ❌ | ✅ |
| Custom Branding | ❌ | ✅ |

Premium upgrade: One-time payment of 100,000 satoshis (~0.001 BCH)

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
      "parameters": [
        {"name": "note", "label": "Public Note", "type": "text"}
      ]
    }]
  },
  "metadata": {
    "protocol": "Blinch",
    "identifier": "FLOW\\x01",
    "hex_prefix": "464c4f5701"
  }
}
```

### API Endpoints

- `GET /api/action/:id` - Retrieve action schema
- `GET /api/actions` - List all actions (with pagination)
- `POST /api/action` - Create new action (public, with tier limits)
- `DELETE /api/action/:id` - Delete action (requires creator address)
- `GET /health` - Health check endpoint

### Smart Contract Functions

**Execute** (recipient spends):
```typescript
function execute(sig s, pubkey pk, int opReturnIndex)
```
- Verifies recipient signature
- Enforces OP_RETURN prefix `464c4f5701` at specified index
- Uses native introspection to validate transaction outputs

**Cancel** (creator reclaims after timeout):
```typescript
function cancel(sig s)
```
- Enforces timeout period (default: 144 blocks)
- Verifies creator signature

## License

MIT
