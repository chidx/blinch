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
    {
      name: 'blinch-mcp',
      script: './dist/mcp/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        BACKEND_URL: 'http://localhost:3001'
      }
    }
  ]
};
