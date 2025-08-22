import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  res.json({
    status: 'OK',
    checks: {
      database: 'OK', // Add actual database check here
      cache: 'OK',     // Add actual cache check here
      external_api: 'OK' // Add external API checks here
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    timestamp: new Date().toISOString()
  });
});

export { router };
