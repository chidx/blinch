# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Blinch** is a Bitcoin Cash protocol for interactive "Blinks" being built for the BCH-1 Hackcelerator. The protocol enables interactive Bitcoin Cash links through a covenant-based smart contract system.

### Critical Protocol Requirement

Every transaction MUST include an OP_RETURN output with the hex prefix `464c4f5701` (`FLOW\x01`). This is the core protocol identifier and is required for the "Follow-through" judging criteria.

## Tech Stack

- **Frontend**: Next.js 16 (stable) with Turbopack
  - Uses new `proxy.ts` for request routing
  - Implements `'use cache'` directive for edge caching
- **Backend**: Node.js 25.6.1 with Express 5.2.1
  - Serves BCH-Action JSON Schema v1.1.0
  - CORS-enabled with OpenGraph meta tags
- **Smart Contracts**: CashScript 0.12.1
  - Covenant contracts using native introspection
  - Chipnet testnet deployment

## Architecture

### Three-Phase Structure

The project is organized into three distinct phases:

1. **Phase 1: Smart Contract** (CashScript)
   - Covenant that guards funds
   - Enforces OP_RETURN prefix check via `tx.outputs[i].lockingBytecode`
   - Execute function for specific recipientPkh
   - Cancel function for creator after 144 blocks
   - Located in: `contracts/` directory

2. **Phase 2: Backend Provider** (Express)
   - `GET /api/action/:id` endpoint serves BCH-Action JSON Schema
   - Returns: `icon`, `title`, `description`, `links.actions` array
   - Generates valid `bitcoincash:` URIs with `op_return=464c4f5701` parameter
   - Express 5.x error handling patterns

3. **Phase 3: Frontend & Proxy** (Next.js)
   - `proxy.ts` intercepts and rewrites `action/` routes
   - Action renderer component consumes BCH-Action JSON Schema
   - CashScript SDK v0.12.1 integration for transaction building
   - Tailwind CSS with glassmorphic dark-mode aesthetic

### BCH-Action JSON Schema (v1.1.0)

```json
{
  "version": "1.1.0",
  "type": "action",
  "icon": "https://blinch.network/assets/icon.png",
  "title": "Interactive Blinch Action",
  "description": "Metadata for a Bitcoin Cash interactive link.",
  "links": {
    "actions": [
      {
        "label": "Execute",
        "href": "bitcoincash:addr?amount=0.01&op_return=464c4f5701[action_type]",
        "parameters": [{ "name": "note", "label": "Public Note", "type": "text" }]
      }
    ]
  },
  "metadata": { "protocol": "Blinch", "identifier": "FLOW\x01", "hex_prefix": "464c4f5701" }
}
```

## Issue Tracking with Beads (bd)

This repository uses **Beads** for AI-native issue tracking. Issues live in `.beads/issues.jsonl` and sync with git.

### Essential Beads Commands

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

### Session Completion Workflow (MANDATORY)

When ending a work session, you MUST complete ALL steps in order:

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Development Commands

### Smart Contract Development
```bash
# Compile CashScript contract (when build system is set up)
npm run compile:contract

# Deploy to Chipnet testnet
npm run deploy:chipnet

# Run contract tests
npm run test:contract
```

### Backend Development
```bash
# Start Express development server
npm run dev:backend

# Run backend tests
npm run test:backend

# Lint backend code
npm run lint:backend
```

### Frontend Development
```bash
# Start Next.js development server with Turbopack
npm run dev

# Build for production
npm run build

# Run frontend tests
npm run test

# Lint frontend code
npm run lint
```

## Key Implementation Details

### OP_RETURN Enforcement
The CashScript covenant must use native introspection to verify:
```typescript
tx.outputs[i].lockingBytecode.contains(OP_RETURN + 464c4f5701)
```

This check must pass before allowing any fund release.

### Network Configuration
- **Target Network**: Chipnet testnet
- **Provider**: ElectrumNetworkProvider
- **Transaction Broadcasting**: CashScript SDK v0.12.1

### URI Format
All action hrefs must follow:
```
bitcoincash:<address>?amount=<value>&op_return=464c4f5701[action_data]
```

## Design Priorities

1. **Narrative Traction**: Clean, high-conversion UI
2. **Protocol Compliance**: Every transaction must include `464c4f5701` prefix
3. **User Experience**: Glassmorphic dark-mode aesthetic with smooth interactions
4. **Security**: Covenant-based fund protection with timeout cancellation
