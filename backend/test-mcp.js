#!/usr/bin/env node
/**
 * Manual MCP Server Test
 *
 * This script tests the Blinch MCP server by:
 * 1. Starting the MCP server as a child process
 * 2. Connecting via stdio
 * 3. Calling both available tools
 */

import { spawn } from 'child_process';

// Start MCP server
const mcpServer = spawn('node', ['dist/mcp/index.js'], {
  cwd: import.meta.dirname,
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestId = 0;
const pendingRequests = new Map();

// Handle stdout from MCP server
mcpServer.stdout.on('data', (data) => {
  const responses = data.toString().split('\n').filter(Boolean);

  for (const responseStr of responses) {
    try {
      const response = JSON.parse(responseStr);

      if (response.id !== undefined && pendingRequests.has(response.id)) {
        const { resolve } = pendingRequests.get(response.id);
        pendingRequests.delete(response.id);
        resolve(response);
      }
    } catch (e) {
      // Ignore non-JSON output (e.g., console.error messages)
    }
  }
});

// Send request to MCP server
function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });

    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    mcpServer.stdin.write(JSON.stringify(request) + '\n');
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Blinch MCP Server\n');

  try {
    // Test 1: List tools
    console.log('📋 Test 1: List available tools');
    const toolsResponse = await sendRequest('tools/list');
    console.log('✅ Available tools:', toolsResponse.result?.tools?.map(t => t.name).join(', ') || 'None');
    console.log();

    // Test 2: Create Blinch link
    console.log('💰 Test 2: Create Blinch link');
    const createLinkResponse = await sendRequest('tools/call', {
      name: 'create_blinch_link',
      arguments: {
        amount: 1000,
        recipient: 'bitcoincash:qzp2wq8l9r5h6l7x8z9c0b1n2m3k4j5k6l7z8c9b0n1',
        action_type: 'tip',
        note: 'Test payment'
      }
    });

    if (createLinkResponse.result) {
      const content = createLinkResponse.result.content[0];
      const result = JSON.parse(content.text);
      console.log('✅ Created Blinch link:');
      console.log('   URL:', result.url);
      console.log('   Amount:', result.amount, 'satoshis');
      console.log('   OP_RETURN:', result.op_return);
      console.log();
    } else {
      console.log('❌ Failed to create link:', createLinkResponse);
    }

    // Test 3: Get action metadata
    console.log('📄 Test 3: Get action metadata');
    const metadataResponse = await sendRequest('tools/call', {
      name: 'get_action_metadata',
      arguments: {
        id: 'example'
      }
    });

    if (metadataResponse.result) {
      const content = metadataResponse.result.content[0];
      const result = JSON.parse(content.text);
      console.log('✅ Action metadata retrieved:');
      console.log('   Title:', result.title);
      console.log('   Description:', result.description);
      if (result.error) {
        console.log('   ⚠️  Note:', result.error);
      }
    } else {
      console.log('❌ Failed to get metadata:', metadataResponse);
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    mcpServer.kill();
  }
}

// Handle server errors
mcpServer.on('error', (err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});

// Wait a bit for server to start, then run tests
setTimeout(() => {
  runTests().then(() => {
    process.exit(0);
  });
}, 500);
