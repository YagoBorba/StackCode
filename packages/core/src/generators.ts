import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a .gitignore file content by combining multiple templates.
 * @param technologies An array of strings representing the technologies (e.g., ['node', 'ides']).
 * @returns {Promise<string>} The combined and formatted .gitignore content.
 */
export async function generateGitignoreContent(
  technologies: string[],
): Promise<string> {
  const contentParts: string[] = [];

  const allTechs = [...new Set(technologies)];

  for (const tech of allTechs) {
    const templatePath = path.resolve(
      __dirname,
      "templates/gitignore",
      `${tech}.tpl`,
    );

    try {
      const templateContent = await fs.readFile(templatePath, "utf-8");

      const header = `# --- ${tech.charAt(0).toUpperCase() + tech.slice(1)} ---`;
      contentParts.push(header, templateContent.trim(), "");
    } catch {
      console.warn(
        `[Warning] Gitignore template for '${tech}' not found. Skipping.`,
      );
    }
  }

  return contentParts.join("\n");
}

/**
 * Reads the content of the default README.md template.
 * @returns {Promise<string>} The template content.
 */
export async function generateReadmeContent(): Promise<string> {
  const templatePath = path.resolve(__dirname, "templates/readme/default.tpl");
  return fs.readFile(templatePath, "utf-8");
}
