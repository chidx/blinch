#!/usr/bin/env node
/**
 * Blinch MCP Server
 *
 * Model Context Protocol server that enables AI agents to interact
 * with the Blinch protocol programmatically.
 *
 * Tools:
 * - create_blinch_link: Generate payment links with FLOW\x01 prefix
 * - get_action_metadata: Read action schema and requirements
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createBlinchLinkTool } from './tools/createBlinchLink';
import { getActionMetadataTool, setActionStore } from './tools/getActionMetadata';

// Initialize MCP server
const server = new Server(
  {
    name: 'blinch-gateway',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: createBlinchLinkTool.name,
        description: createBlinchLinkTool.description,
        inputSchema: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Amount in satoshis',
            },
            recipient: {
              type: 'string',
              description: 'Bitcoin Cash address',
            },
            action_type: {
              type: 'string',
              description: 'Optional action type (e.g., "tip", "vote")',
            },
            note: {
              type: 'string',
              description: 'Optional note or metadata',
            },
          },
          required: ['amount', 'recipient'],
        },
      },
      {
        name: getActionMetadataTool.name,
        description: getActionMetadataTool.description,
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The action ID to retrieve',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_blinch_link': {
        const result = await createBlinchLinkTool.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_action_metadata': {
        const result = await getActionMetadataTool.handler(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the MCP server
 */
async function main() {
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
