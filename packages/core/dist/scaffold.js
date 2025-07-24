"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaffoldProject = scaffoldProject;
exports.setupHusky = setupHusky;
/**
 * @fileoverview Project scaffolding logic for StackCode.
 * @module core/scaffold
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Recursively copies files from a source directory to a destination,
 * processing template placeholders.
 * @param src - The source directory (e.g., a template folder).
 * @param dest - The destination directory (the new project).
 * @param replacements - An object with keys to find (e.g., 'projectName') and values to replace.
 */
function copyTemplateFiles(src, dest, replacements) {
    const exists = fs_1.default.existsSync(src);
    if (!exists)
        return;
    const stats = fs_1.default.statSync(src);
    if (stats.isDirectory()) {
        fs_1.default.mkdirSync(dest, { recursive: true });
        fs_1.default.readdirSync(src).forEach(childItemName => {
            copyTemplateFiles(path_1.default.join(src, childItemName), path_1.default.join(dest, childItemName.replace('.tpl', '')), replacements);
        });
    }
    else {
        let content = fs_1.default.readFileSync(src, 'utf8');
        content = content.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return replacements[trimmedKey] || match;
        });
        fs_1.default.writeFileSync(dest, content);
    }
}
/**
 * Scaffolds a new project based on the provided options.
 * @param options - The project configuration options.
 */
function scaffoldProject(options) {
    const { projectPath, stack, features, replacements } = options;
    fs_1.default.mkdirSync(projectPath, { recursive: true });
    const stackTemplatePath = path_1.default.join(__dirname, 'templates', stack);
    copyTemplateFiles(stackTemplatePath, projectPath, replacements);
    if (features.includes('docker')) {
        const commonTemplatePath = path_1.default.join(__dirname, 'templates', 'common');
        copyTemplateFiles(commonTemplatePath, projectPath, replacements);
    }
}
// --- NOVA FUNÇÃO ABAIXO ---
/**
 * Sets up Husky hooks in the newly created project directory.
 * @param projectPath - The absolute path to the project's root directory.
 */
function setupHusky(projectPath) {
    const huskyDir = path_1.default.join(projectPath, '.husky');
    fs_1.default.mkdirSync(huskyDir, { recursive: true });
    const hookFile = path_1.default.join(huskyDir, 'commit-msg');
    const scriptContent = `#!/bin/sh
npx stackcode validate "$1"
`;
    fs_1.default.writeFileSync(hookFile, scriptContent);
    // This is a crucial step on Unix-like systems (Linux, macOS).
    // The hook script must be executable to be run by Git.
    try {
        fs_1.default.chmodSync(hookFile, '755');
    }
    catch (e) {
        console.warn(`Could not make commit-msg hook executable. This might be an issue on non-Unix systems.`);
    }
}
