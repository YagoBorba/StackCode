/**
 * @fileoverview File generation logic for StackCode.
 * @module core/generators
 */

// Um mapa simples para armazenar templates de .gitignore
const gitignoreTemplates = {
  node: `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependencies
node_modules/
.pnp
.pnp.js

# Build artifacts
dist/
build/

# Environment variables
.env
.env.local
`,
  // No futuro, podemos adicionar 'react', 'python', etc.
  react: ``, 
};

/**
 * Generates the content for a .gitignore file based on a given stack.
 * @param stack The technology stack (e.g., 'node').
 * @returns The content of the .gitignore file as a string.
 */
export function generateGitignoreContent(stack: 'node' | 'react'): string {
  return gitignoreTemplates[stack] || gitignoreTemplates.node; // Default to node
}