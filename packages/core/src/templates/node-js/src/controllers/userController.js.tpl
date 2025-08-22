import { logger } from '../utils/logger.js';

// Mock database - In a real app, you'd use a proper database
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() }
];

let nextId = 3;

export const userController = {
  // Get all users
  getAll: (req, res) => {
    try {
      logger.info('Getting all users');
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get user by ID
  getById: (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = users.find(u => u.id === id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info(`Getting user ${id}`);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Create new user
  create: (req, res) => {
    try {
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required'
        });
      }

      const newUser = {
        id: nextId++,
        name,
        email,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      logger.info(`Created user ${newUser.id}`);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Update user
  update: (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const { name, email } = req.body;
      users[userIndex] = {
        ...users[userIndex],
        ...(name && { name }),
        ...(email && { email }),
        updatedAt: new Date().toISOString()
      };

      logger.info(`Updated user ${id}`);
      res.json({
        success: true,
        data: users[userIndex],
        message: 'User updated successfully'
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Delete user
  delete: (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      users.splice(userIndex, 1);
      logger.info(`Deleted user ${id}`);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};
