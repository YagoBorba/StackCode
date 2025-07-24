"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGitignoreContent = generateGitignoreContent;
exports.generateReadmeContent = generateReadmeContent;
/**
 * @fileoverview File generation logic for StackCode.
 * @module core/generators
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Generates the content for a .gitignore file by reading a template.
 * @param stack The technology stack (e.g., 'node').
 * @returns The content of the .gitignore file as a string.
 */
function generateGitignoreContent(stack) {
    const templatePath = path_1.default.join(__dirname, `templates/gitignore/${stack}.tpl`);
    try {
        return fs_1.default.readFileSync(templatePath, 'utf-8');
    }
    catch (error) {
        console.error(`Error reading gitignore template for ${stack}`, error);
        return ''; // Return empty string on error
    }
}
/**
 * Generates the content for a README.md file from a template and user answers.
 * @param answers - The user's answers to the prompts.
 * @returns The content of the README.md file as a string.
 */
function generateReadmeContent() {
    // Futuramente, podemos ter templates diferentes aqui
    const templatePath = path_1.default.join(__dirname, 'templates/readme/default.tpl');
    try {
        return fs_1.default.readFileSync(templatePath, 'utf-8');
    }
    catch (error) {
        console.error('Error reading readme template', error);
        return '';
    }
}
