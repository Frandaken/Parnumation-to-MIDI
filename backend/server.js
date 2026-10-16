const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check endpoint (Operations & Verification Runbook: curl http://localhost:3000/api/health)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'parnumation-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.status(200).json({
    name: 'Parnumation to MIDI Backend API',
    version: '1.0.0',
    description: 'Containerized Express API backend service for Parnumation music notation and MIDI processing',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Parnumation API Server is running',
    healthCheck: '/api/health'
  });
});

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Backend Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start listening
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend API] Server listening on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
});

// Graceful termination handling
const handleShutdown = (signal) => {
  console.log(`[Backend API] Received ${signal}, closing server gracefully...`);
  server.close(() => {
    console.log('[Backend API] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Backend API] Forced termination after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
