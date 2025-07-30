/**
 * Generates a .gitignore file content by combining multiple templates.
 * @param technologies An array of strings representing the technologies (e.g., ['node', 'ides']).
 * @returns {Promise<string>} The combined and formatted .gitignore content.
 */
export declare function generateGitignoreContent(technologies: string[]): Promise<string>;
/**
 * Reads the content of the default README.md template.
 * @returns {Promise<string>} The template content.
 */
export declare function generateReadmeContent(): Promise<string>;
