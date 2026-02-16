/**
 * Blinch Backend Server
 * Express 5.2.1 API Server for BCH-Action JSON Schema
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS - Allow all origins for development
app.use(cors());

// Body parsing middleware (Express 5.x uses body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Blinch Backend API',
    version: '1.0.0',
    description: 'Bitcoin Cash Interactive Blinks Protocol API',
    endpoints: {
      health: '/api/health',
      actions: '/api/actions',
      action: '/api/action/:id',
    },
    documentation: 'https://docs.blinch.network',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Blinch Backend API                                    ║
║                                                            ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                                            ║
║   Endpoints:                                               ║
║   → GET  /api/health                                       ║
║   → GET  /api/actions                                      ║
║   → GET  /api/action/:id                                   ║
║   → POST /api/action                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
