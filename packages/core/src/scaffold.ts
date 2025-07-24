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
        content = content.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return replacements[trimmedKey] || match;
        });
        fs.writeFileSync(dest, content);
    }
}


export interface ProjectOptions {
    projectPath: string;
    stack: 'node-ts';
    features: ('docker' | 'husky')[];
    replacements: Record<string, string>;
}

/**
 * Scaffolds a new project based on the provided options.
 * @param options - The project configuration options.
 */
export function scaffoldProject(options: ProjectOptions): void {
    const { projectPath, stack, features, replacements } = options;
    fs.mkdirSync(projectPath, { recursive: true });

    const stackTemplatePath = path.join(__dirname, 'templates', stack);
    copyTemplateFiles(stackTemplatePath, projectPath, replacements);
    
    if (features.includes('docker')) {
        const commonTemplatePath = path.join(__dirname, 'templates', 'common');
        copyTemplateFiles(commonTemplatePath, projectPath, replacements);
    }
}

// --- NOVA FUNÇÃO ABAIXO ---

/**
 * Sets up Husky hooks in the newly created project directory.
 * @param projectPath - The absolute path to the project's root directory.
 */
export function setupHusky(projectPath: string): void {
    const huskyDir = path.join(projectPath, '.husky');
    fs.mkdirSync(huskyDir, { recursive: true });

    const hookFile = path.join(huskyDir, 'commit-msg');
    const scriptContent = `#!/bin/sh
npx stackcode validate "$1"
`;

    fs.writeFileSync(hookFile, scriptContent);

    // This is a crucial step on Unix-like systems (Linux, macOS).
    // The hook script must be executable to be run by Git.
    try {
        fs.chmodSync(hookFile, '755');
    } catch (e) {
        console.warn(`Could not make commit-msg hook executable. This might be an issue on non-Unix systems.`);
    }
}