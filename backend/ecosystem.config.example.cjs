module.exports = {
  apps: [
    {
      name: 'blinch-backend',
      script: './dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    // HTTP/SSE MCP Server - Use this for VPS deployment
    // Accessible at http://your-server:3002/sse
    {
      name: 'blinch-mcp-http',
      script: './dist/mcp/http.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        BACKEND_URL: 'http://localhost:3001',
        MCP_PORT: 3002
      }
    }
    // stdio MCP Server - Only use for local development with Claude Desktop
    // Comment out the HTTP version above if using this
    // {
    //   name: 'blinch-mcp-stdio',
    //   script: './dist/mcp/index.js',
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '512M',
    //   interpreter: 'node',
    //   env: {
    //     NODE_ENV: 'production',
    //     BACKEND_URL: 'http://localhost:3001'
    //   }
    // }
  ]
};
