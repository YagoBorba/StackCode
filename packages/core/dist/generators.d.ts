/**
 * Generates the content for a .gitignore file by reading a template.
 * @param stack The technology stack (e.g., 'node').
 * @returns The content of the .gitignore file as a string.
 */
export declare function generateGitignoreContent(stack: 'node' | 'react'): string;
/**
 * Generates the content for a README.md file from a template and user answers.
 * @param answers - The user's answers to the prompts.
 * @returns The content of the README.md file as a string.
 */
export declare function generateReadmeContent(): string;
