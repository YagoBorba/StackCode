{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "dist/index.js",
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "{{authorName}}",
  "license": "ISC",
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.14.9",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.2"
  }
}