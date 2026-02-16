# Blinch Agent Gateway - Enhancement 1

## Overview

The Blinch Agent Gateway enables AI agents to interact with the Blinch protocol programmatically using Model Context Protocol (MCP) and the x402 HTTP 402 payment standard.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AI Agent                                │
│  (Claude, GPT, or any MCP-compatible AI system)                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ MCP Protocol
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blinch MCP Server                            │
│  - create_blinch_link: Generate payment URLs                    │
│  - get_action_metadata: Read payment requirements               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Bitcoin Cash
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BCH Blockchain                                │
│  - Transactions with OP_RETURN 464c4f5701                       │
│  - On-chain payment verification                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   x402 API Gateway                              │
│  - Returns 402 with payment headers                            │
│  - Verifies payments on-chain                                   │
│  - Grants access after payment                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. MCP Server (backend/src/mcp/)

**Tools:**

- `create_blinch_link`: Generate Bitcoin Cash URIs with mandatory protocol prefix
- `get_action_metadata`: Retrieve action schema and payment requirements

**Location:** `backend/src/mcp/`

**Run:** `npm run mcp`

### 2. x402 Middleware (backend/src/middleware/x402.ts)

Express middleware that implements HTTP 402 Payment Required:

- Returns 402 for unprotected requests
- Includes `X-Payment-Link` header with Blinch URL
- Includes `X-Payment-Amount` header in satoshis
- Verifies `X-Payment` header with transaction ID
- Grants 200 OK after payment verification

### 3. Payment Verifier (backend/src/lib/paymentVerifier.ts)

CashScript SDK integration for on-chain verification:

- Fetches transaction from blockchain
- Validates OP_RETURN contains `464c4f5701` prefix
- Confirms payment amount meets requirement
- Checks transaction confirmations

## Agent Flow Example

```typescript
// AI Agent attempting to access protected API

async function accessProtectedResource() {
  // Step 1: Try to access protected resource
  let response = await fetch('https://api.blinch.network/api/protected/ai-prompt');

  // Step 2: Check if payment is required
  if (response.status === 402) {
    const paymentLink = response.headers.get('X-Payment-Link');
    const paymentAmount = parseInt(response.headers.get('X-Payment-Amount')!);

    console.log(`Payment required: ${paymentAmount} sats`);
    console.log(`Payment link: ${paymentLink}`);

    // Step 3: Use MCP to understand payment requirements
    const metadata = await mcp.callTool({
      name: 'get_action_metadata',
      arguments: { id: 'api_access' }
    });

    // Step 4: Use MCP to create payment transaction
    const payment = await mcp.callTool({
      name: 'create_blinch_link',
      arguments: {
        amount: paymentAmount,
        recipient: metadata.recipient,
        action_type: 'api_access'
      }
    });

    // Step 5: Sign and broadcast transaction
    const txId = await wallet.signAndBroadcast(payment.url);

    console.log(`Payment sent: ${txId}`);

    // Step 6: Wait for confirmation (optional)
    await waitForConfirmation(txId);

    // Step 7: Retry request with payment proof
    response = await fetch('https://api.blinch.network/api/protected/ai-prompt', {
      headers: {
        'X-Payment': txId
      }
    });
  }

  // Step 8: Access granted!
  const data = await response.json();
  return data;
}
```

## x402 Headers

### Response Headers (402 Payment Required)

```http
HTTP/1.1 402 Payment Required
X-Payment-Link: bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1?amount=0.00001&op_return=464c4f5701api_access
X-Payment-Amount: 1000
X-Payment-Currency: sat
X-Payment-Description: Access to premium API endpoint
```

### Request Headers (Payment Proof)

```http
GET /api/protected/data HTTP/1.1
X-Payment: 0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

## Protected Endpoints

| Endpoint | Amount | Description |
|----------|--------|-------------|
| GET /api/protected/hello | 1000 sats | Simple hello message |
| GET /api/protected/data | 1000 sats | Protected data endpoint |
| GET /api/protected/premium | 5000 sats | Premium features |
| GET /api/protected/ai-prompt | 1000 sats | AI prompt templates |
| POST /api/protected/generate | 1000 sats | AI generation |

## Protocol Compliance

✅ Every transaction includes OP_RETURN with `464c4f5701` (`FLOW\x01`) prefix
✅ Covenant enforcement via CashScript SDK
✅ On-chain verification via Electrum
✅ BCH-1 Hackcelerator "Follow-through" criteria met

## Use Cases

### 1. AI Assistant Monetization

AI assistants can charge per-use for premium features:

```typescript
// User asks AI to perform premium task
if (requiresPremium(task)) {
  const paymentRequired = await checkPaymentRequired(task.id);
  if (paymentRequired) {
    await requestPayment(user, paymentRequired);
  }
}
```

### 2. Data Feed Access

Monetize real-time data feeds:

```typescript
// Each data access requires micropayment
const pricePerCall = 100; // 100 sats
app.get('/api/market-data', x402({
  amount: pricePerCall,
  recipient: MARKET_RECIPIENT,
  actionType: 'market_data'
}), dataHandler);
```

### 3. API Rate Limiting

Replace traditional rate limiting with pay-per-call:

```typescript
// No more rate limits - just pay for what you use
app.use('/api/*', x402({
  amount: 10, // 10 sats per call
  recipient: API_RECIPIENT
}));
```

### 4. Content Gating

Gate premium content behind micropayments:

```typescript
app.get('/articles/premium/:id', x402({
  amount: 5000, // 5000 sats ($0.05 approx)
  recipient: CONTENT_CREATOR
}), articleHandler);
```

## Testing

### Test MCP Server

```bash
cd backend
npm run mcp
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/mcp/index.js
```

### Test x402 Flow

```bash
# 1. Try to access protected endpoint (returns 402)
curl http://localhost:3001/api/protected/hello

# 2. Extract payment link from headers
# 3. Pay using Bitcoin Cash wallet
# 4. Retry with payment header
curl -H "X-Payment: YOUR_TX_ID" http://localhost:3001/api/protected/hello
```

## Documentation

- **MCP Server**: [backend/MCP.md](backend/MCP.md)
- **x402 Protocol**: [backend/X402.md](backend/X402.md)
- **Payment Verification**: [backend/src/lib/paymentVerifier.ts](backend/src/lib/paymentVerifier.ts)

## License

MIT
