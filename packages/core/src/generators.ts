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
export function generateGitignoreContent(stack: 'node'): string {
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
 * @param replacements - An object with keys to find (e.g., 'projectName') and values to replace.
 * @returns The content of the README.md file as a string.
 */
export function generateReadmeContent(replacements: Record<string, string>): string {
    const templatePath = path.join(__dirname, 'templates/readme/default.tpl');
    try {
        let content = fs.readFileSync(templatePath, 'utf-8');
        // Replace all instances of {{key}} with the corresponding value
        content = content.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return replacements[trimmedKey] || match;
        });
        return content;
    } catch (error) {
        console.error('Error reading readme template', error);
        return '';
    }
}