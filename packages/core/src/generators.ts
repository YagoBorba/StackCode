/**
 * @fileoverview File generation logic for StackCode.
 * @module core/generators
 */
import fs from 'fs';
import path from 'path';

/**
 * Generates the content for a .gitignore file by reading a template.
 * @param stack The technology stack (e.g., 'node').
 * @returns The content of the .gitignore file as a string.
 */
export function generateGitignoreContent(stack: 'node' | 'react'): string {
  const templatePath = path.join(__dirname, `templates/gitignore/${stack}.tpl`);
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading gitignore template for ${stack}`, error);
    return ''; // Return empty string on error
  }
}

/**
 * Generates the content for a README.md file from a template and user answers.
 * @param answers - The user's answers to the prompts.
 * @returns The content of the README.md file as a string.
 */
export function generateReadmeContent(): string {
  // Futuramente, podemos ter templates diferentes aqui
  const templatePath = path.join(__dirname, 'templates/readme/default.tpl');
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Error reading readme template', error);
    return '';
  }
}