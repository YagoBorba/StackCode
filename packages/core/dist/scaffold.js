import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function copyTemplateFiles(src, dest, replacements) {
    try {
        await fs.access(src);
    }
    catch {
        return;
    }
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        const children = await fs.readdir(src);
        for (const childItemName of children) {
            await copyTemplateFiles(path.join(src, childItemName), path.join(dest, childItemName.replace(".tpl", "")), replacements);
        }
    }
    else {
        let content = await fs.readFile(src, "utf8");
        content = content.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return replacements[trimmedKey] || match;
        });
        await fs.writeFile(dest, content);
    }
}
export async function scaffoldProject(options) {
    const { projectPath, stack, features, replacements } = options;
    await fs.mkdir(projectPath, { recursive: true });
    const stackTemplatePath = path.join(__dirname, "templates", stack);
    await copyTemplateFiles(stackTemplatePath, projectPath, replacements);
    if (features.includes("docker")) {
        const commonTemplatePath = path.join(__dirname, "templates", "common");
        await copyTemplateFiles(commonTemplatePath, projectPath, replacements);
    }
}
export async function setupHusky(projectPath) {
    const huskyDir = path.join(projectPath, ".husky");
    await fs.mkdir(huskyDir, { recursive: true });
    const hookFile = path.join(huskyDir, "commit-msg");
    const scriptContent = `#!/bin/sh
npx stackcode validate "$1"
`;
    await fs.writeFile(hookFile, scriptContent);
    try {
        await fs.chmod(hookFile, "755");
    }
    catch (e) {
        console.warn(`Could not make commit-msg hook executable. This might be an issue on non-Unix systems.`);
    }
}
