#!/usr/bin/env node
/**
 * Blinch MCP Server (HTTP/SSE transport)
 *
 * Model Context Protocol server that enables AI agents to interact
 * with the Blinch protocol programmatically via HTTP with Server-Sent Events.
 *
 * This is suitable for VPS deployment and remote access.
 *
 * Tools:
 * - create_blinch_link: Generate payment links with FLOW\x01 prefix
 * - get_action_metadata: Read action schema and requirements
 */

import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMCPServer, setActionStore } from './server.js';

const PORT = process.env.MCP_PORT || 3002;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Start the MCP server with HTTP/SSE transport
 */
async function main() {
  const app = express();

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'blinch-mcp' });
  });

  // MCP SSE endpoint
  app.get('/sse', async (req, res) => {
    console.log('New MCP connection established');

    // Create SSE transport
    const transport = new SSEServerTransport('/message', res);
    const server = createMCPServer();

    try {
      await server.connect(transport);
      console.log('MCP server connected via SSE');

      // Log on disconnect
      res.on('close', () => {
        console.log('MCP connection closed');
      });
    } catch (error) {
      console.error('Failed to connect MCP server:', error);
      res.status(500).json({ error: 'Failed to establish MCP connection' });
    }
  });

  // Handle POST messages for SSE transport
  app.post('/message', express.json(), async (req, res) => {
    // The SSE transport handles this via the connected response
    res.status(200).send('OK');
  });

  // Start server
  app.listen(PORT, () => {
    console.error(`Blinch MCP Gateway running on HTTP port ${PORT}`);
    console.error(`SSE endpoint: http://localhost:${PORT}/sse`);
    console.error(`Health check: http://localhost:${PORT}/health`);
    console.error(`Backend URL: ${BACKEND_URL}`);
    console.error('');
    console.error('Available tools:');
    console.error('  - create_blinch_link');
    console.error('  - get_action_metadata');
    console.error('');
    console.error('Configure MCP clients to connect to:');
    console.error(`  http://localhost:${PORT}/sse`);
  });
}

// Run server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { setActionStore };
