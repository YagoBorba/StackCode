import express from 'express';
import { userController } from '../controllers/userController.js';

const router = express.Router();

// API Routes
router.get('/welcome', (req, res) => {
  res.json({
    message: 'Welcome to {{projectName}} API',
    description: '{{description}}',
    version: '1.0.0',
    endpoints: [
      'GET /api/welcome - This endpoint',
      'GET /api/users - Get all users',
      'GET /api/users/:id - Get user by ID',
      'POST /api/users - Create new user'
    ]
  });
});

// User routes
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

export { router };
