{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix"
  },
  "keywords": ["node", "javascript", "express", "api"],
  "author": "{{authorName}}",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "eslint-config-standard": "^17.1.0",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-n": "^16.0.1",
    "eslint-plugin-promise": "^6.1.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
