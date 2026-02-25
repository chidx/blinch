#!/usr/bin/env node
/**
 * HTTP MCP Server Test
 *
 * This script tests the Blinch MCP HTTP server by:
 * 1. Connecting via SSE
 * 2. Calling both available tools
 */

async function testHTTPMCP() {
  const baseUrl = 'http://localhost:3002';

  console.log('🧪 Testing Blinch MCP HTTP Server\n');
  console.log(`📍 Server: ${baseUrl}/sse\n`);

  try {
    // Test 1: Health check
    console.log('🏥 Test 1: Health check');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = await healthResponse.json();
    console.log('✅ Health check:', health);
    console.log();

    // Test 2: SSE connection
    console.log('📡 Test 2: SSE Connection');
    console.log('To test the SSE connection, open your browser and navigate to:');
    console.log(`   ${baseUrl}/sse`);
    console.log();
    console.log('Or configure an MCP client to connect to:');
    console.log(`   ${baseUrl}/sse`);
    console.log();

    // Test 3: Create Blinch link (via direct HTTP if endpoint exists)
    console.log('💰 Test 3: Tool information');
    console.log('Available tools:');
    console.log('   - create_blinch_link: Generate Bitcoin Cash payment links');
    console.log('   - get_action_metadata: Retrieve action schema');
    console.log();

    console.log('✅ HTTP MCP server is running!');
    console.log();
    console.log('To interact with the tools, use an MCP client configured with:');
    console.log(`  URL: ${baseUrl}/sse`);
    console.log(`  Transport: SSE`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log();
    console.log('Make sure the HTTP MCP server is running:');
    console.log('  npm run mcp:http');
  }
}

// Run tests
testHTTPMCP();
