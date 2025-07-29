/**
 * Reads the content of the .gitignore template for a specific stack.
 * @param {string} stack - The technology stack (e.g., 'node-ts').
 * @returns {Promise<string>} The template content.
 */
export declare function generateGitignoreContent(stack: string): Promise<string>;
/**
 * Reads the content of the default README.md template.
 * @returns {Promise<string>} The template content.
 */
export declare function generateReadmeContent(): Promise<string>;
