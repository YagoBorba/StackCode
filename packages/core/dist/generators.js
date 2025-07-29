import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Reads the content of the .gitignore template for a specific stack.
 * @param {string} stack - The technology stack (e.g., 'node-ts').
 * @returns {Promise<string>} The template content.
 */
export async function generateGitignoreContent(stack) {
    const templatePath = path.resolve(__dirname, `templates/${stack}/gitignore.tpl`);
    return fs.readFile(templatePath, 'utf-8');
}
/**
 * Reads the content of the default README.md template.
 * @returns {Promise<string>} The template content.
 */
export async function generateReadmeContent() {
    // Este caminho já estava correto.
    const templatePath = path.resolve(__dirname, 'templates/readme/default.tpl');
    return fs.readFile(templatePath, 'utf-8');
}
