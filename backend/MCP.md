# Blinch MCP Server

Model Context Protocol (MCP) server that enables AI agents to interact with the Blinch protocol programmatically.

## Overview

The Blinch MCP Server exposes two primary tools for AI agents:

1. **create_blinch_link** - Generate Bitcoin Cash payment links with the Blinch protocol prefix
2. **get_action_metadata** - Retrieve action schema and payment requirements

## Installation

```bash
cd backend
npm install
```

## Running the MCP Server

### Development Mode

```bash
npm run mcp
```

The server will run on stdio (standard input/output) for communication with MCP clients.

### Production Mode

```bash
npm run build
npm run mcp
```

## MCP Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "blinch": {
      "command": "node",
      "args": ["/path/to/blinch/backend/dist/mcp/index.js"],
      "env": {
        "BACKEND_URL": "http://localhost:3001"
      }
    }
  }
}
```

### Continue.dev

```javascript
// config.json
{
  "mcp": {
    "servers": {
      "blinch": {
        "command": "node",
        "args": ["/path/to/blinch/backend/dist/mcp/index.js"]
      }
    }
  }
}
```

## Tools

### create_blinch_link

Creates a Blinch-standardized Bitcoin Cash payment link.

**Parameters:**
- `amount` (number, required): Amount in satoshis
- `recipient` (string, required): Bitcoin Cash address
- `action_type` (string, optional): Action type (e.g., "tip", "vote", "api_access")
- `note` (string, optional): Note or metadata

**Returns:**
```json
{
  "url": "bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1?amount=0.00001&op_return=464c4f5701tip",
  "amount": 1000,
  "recipient": "bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1",
  "op_return": "464c4f5701tip",
  "protocol_prefix": "464c4f5701"
}
```

**Example:**
```typescript
const result = await mcp.callTool({
  name: 'create_blinch_link',
  arguments: {
    amount: 1000,
    recipient: 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1',
    action_type: 'tip',
    note: 'Great work!'
  }
});
```

### get_action_metadata

Retrieves metadata for a Blinch action including payment requirements.

**Parameters:**
- `id` (string, required): Action ID to retrieve

**Returns:**
```json
{
  "id": "example",
  "title": "Example Blinch Action",
  "description": "An example interactive Bitcoin Cash action",
  "amount": 10000,
  "recipient": "bitcoincash:...",
  "parameters": [
    { "name": "note", "label": "Public Note", "type": "text", "required": false }
  ],
  "protocol": {
    "name": "Blinch",
    "version": "1.1.0",
    "prefix": "464c4f5701"
  }
}
```

**Example:**
```typescript
const metadata = await mcp.callTool({
  name: 'get_action_metadata',
  arguments: { id: 'example' }
});
```

## Complete Agent Flow

```typescript
// 1. Try to access protected resource
const response = await fetch('http://api.blinch.network/api/protected/data');

if (response.status === 402) {
  // 2. Parse payment requirements from headers
  const paymentLink = response.headers.get('X-Payment-Link');
  const paymentAmount = response.headers.get('X-Payment-Amount');

  // 3. Get action metadata to understand requirements
  const metadata = await mcp.callTool({
    name: 'get_action_metadata',
    arguments: { id: 'api_access' }
  });

  // 4. Create payment link using MCP
  const payment = await mcp.callTool({
    name: 'create_blinch_link',
    arguments: {
      amount: parseInt(paymentAmount),
      recipient: metadata.recipient,
      action_type: 'api_access'
    }
  });

  // 5. Sign and broadcast transaction using wallet
  const txId = await wallet.signAndBroadcast(payment.url);

  // 6. Retry request with payment
  const finalResponse = await fetch('http://api.blinch.net/api/protected/data', {
    headers: { 'X-Payment': txId }
  });

  const data = await finalResponse.json();
}
```

## Protocol Compliance

All generated Bitcoin Cash URIs include the mandatory OP_RETURN prefix:

```
464c4f5701 = FLOW\x01
```

This ensures compliance with the Blinch protocol requirements for the BCH-1 Hackcelerator.

## Error Handling

### Action Not Found

```json
{
  "error": "Action not found: unknown_id. Available actions: example, api_access"
}
```

### Invalid Amount

```json
{
  "error": "Amount must be greater than 0"
}
```

## Testing

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/mcp/index.js
```

This will open a web interface to test the MCP tools.

### Manual Testing

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/mcp/index.js']
});

const client = new Client({ name: 'test-client', version: '1.0.0' }, {
  capabilities: {}
});

await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log(tools);

// Call tool
const result = await client.callTool({
  name: 'create_blinch_link',
  arguments: {
    amount: 1000,
    recipient: 'bitcoincash:...',
    action_type: 'test'
  }
});
```

## Architecture

```
src/mcp/
├── index.ts              # MCP server entry point
├── types.ts              # Type definitions
└── tools/
    ├── createBlinchLink.ts  # create_blinch_link tool
    └── getActionMetadata.ts # get_action_metadata tool
```

## Integration with Backend

The MCP server integrates with the backend's action store:

```typescript
import { setActionStore } from './mcp/index';
import { actionStore } from './routes/actions';

// Initialize MCP server with action store
setActionStore(actionStore);
```

## License

MIT
