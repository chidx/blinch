/**
 * PM2 Ecosystem Configuration
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'blinch-backend',
      script: 'npm',
      args: 'start',
      cwd: '/home/blinch/blinch/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Autorestart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // Logging
      log_file: '/home/blinch/logs/backend.log',
      error_file: '/home/blinch/logs/backend-error.log',
      out_file: '/home/blinch/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Instance management
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'blinch-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/blinch/blinch/frontend',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/home/blinch/logs/frontend.log',
      error_file: '/home/blinch/logs/frontend-error.log',
      out_file: '/home/blinch/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
