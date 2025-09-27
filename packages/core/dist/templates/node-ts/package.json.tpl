{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "keywords": ["nodejs", "typescript"],
  "author": "{{authorName}}",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.9",
    "@types/jest": "^29.5.5",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "@typescript-eslint/parser": "^6.7.0",
    "eslint": "^8.49.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.2"
  }
}