/**
 * Blinch MCP Server Setup
 *
 * Shared MCP server configuration for both stdio and HTTP transports.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createBlinchLinkTool } from './tools/createBlinchLink';
import { getActionMetadataTool, setActionStore } from './tools/getActionMetadata';
import type { CreateBlinchLinkParams, GetActionMetadataParams } from './types';

/**
 * Create and configure the MCP server instance
 */
export function createMCPServer() {
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
      if (!args) {
        throw new Error('Arguments are required');
      }

      switch (name) {
        case 'create_blinch_link': {
          const result = await createBlinchLinkTool.handler(args as unknown as CreateBlinchLinkParams);
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
          const result = await getActionMetadataTool.handler(args as unknown as GetActionMetadataParams);
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

  return server;
}

export { setActionStore };
