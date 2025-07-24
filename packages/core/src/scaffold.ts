/**
 * @fileoverview Project scaffolding logic for StackCode.
 * @module core/scaffold
 */
import fs from 'fs';
import path from 'path';

/**
 * Recursively copies files from a source directory to a destination,
 * processing template placeholders.
 * @param src - The source directory (e.g., a template folder).
 * @param dest - The destination directory (the new project).
 * @param replacements - An object with keys to find (e.g., 'projectName') and values to replace.
 */
function copyTemplateFiles(src: string, dest: string, replacements: Record<string, string>) {
    const exists = fs.existsSync(src);
    if (!exists) return;

    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyTemplateFiles(
                path.join(src, childItemName),
                path.join(dest, childItemName.replace('.tpl', '')),
                replacements
            );
        });
    } else {
        let content = fs.readFileSync(src, 'utf8');
        // Replace all instances of {{key}} with the corresponding value
        content = content.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return replacements[trimmedKey] || match;
        });
        fs.writeFileSync(dest, content);
    }
}


export interface ProjectOptions {
    projectPath: string;
    stack: 'node-ts'; // For now, only this stack is supported
    features: ('docker' | 'husky')[];
    replacements: Record<string, string>;
}

/**
 * Scaffolds a new project based on the provided options.
 * @param options - The project configuration options.
 */
export function scaffoldProject(options: ProjectOptions): void {
    const { projectPath, stack, features, replacements } = options;

    // Create the main project directory
    fs.mkdirSync(projectPath, { recursive: true });

    // Copy stack-specific files (e.g., node-ts)
    const stackTemplatePath = path.join(__dirname, 'templates', stack);
    copyTemplateFiles(stackTemplatePath, projectPath, replacements);
    
    // Copy common files if the feature is selected
    if (features.includes('docker')) {
        const commonTemplatePath = path.join(__dirname, 'templates', 'common');
        copyTemplateFiles(commonTemplatePath, projectPath, replacements);
    }
}