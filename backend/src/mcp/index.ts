#!/usr/bin/env node
/**
 * Blinch MCP Server (stdio transport)
 *
 * Model Context Protocol server that enables AI agents to interact
 * with the Blinch protocol programmatically via stdio.
 *
 * Tools:
 * - create_blinch_link: Generate payment links with FLOW\x01 prefix
 * - get_action_metadata: Read action schema and requirements
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer, setActionStore } from './server.js';

/**
 * Start the MCP server with stdio transport
 */
async function main() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Blinch MCP Gateway running on stdio');
  console.error('Available tools:');
  console.error('  - create_blinch_link');
  console.error('  - get_action_metadata');
}

// Run server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { server, setActionStore };
