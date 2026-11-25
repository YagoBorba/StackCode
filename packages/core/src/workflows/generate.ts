import fs from "fs/promises";
import path from "path";
import {
  generateGitignoreContent,
  generateReadmeContent,
} from "../generators.js";
import { loadStackCodeConfig } from "../utils.js";

export type GenerateFileType = "readme" | "gitignore";

export type GenerateWorkflowStep =
  | "checkingFile"
  | "generatingContent"
  | "writingFile"
  | "completed";

export interface GenerateWorkflowProgress {
  step: GenerateWorkflowStep;
  fileType?: GenerateFileType;
  filePath?: string;
}

export interface GenerateWorkflowOptions {
  projectPath: string;
  files: GenerateFileType[];
  gitignoreTechnologies?: string[];
}

export interface GenerateWorkflowHooks {
  onProgress?(progress: GenerateWorkflowProgress): Promise<void> | void;
  onEducationalMessage?(messageKey: string): Promise<void> | void;
  shouldOverwriteFile?(details: {
    fileType: GenerateFileType;
    filePath: string;
  }): Promise<boolean> | boolean;
  resolveGitignoreTechnologies?(details: {
    projectPath: string;
  }): Promise<string[] | undefined> | string[] | undefined;
}

export type GenerateWorkflowFileStatus = "created" | "overwritten" | "skipped";

export type GenerateWorkflowFileSkipReason = "overwrite-declined" | "error";

export interface GenerateWorkflowFileResult {
  fileType: GenerateFileType;
  filePath: string;
  status: GenerateWorkflowFileStatus;
  reason?: GenerateWorkflowFileSkipReason;
  error?: string;
}

export interface GenerateWorkflowResult {
  status: "completed" | "cancelled";
  files: GenerateWorkflowFileResult[];
  warnings: string[];
}

/**
 * Generates project configuration files (README.md, .gitignore).
 *
 * Checks for existing files, prompts for overwrite confirmation, generates content
 * based on project stack/technologies, and writes files to the project directory.
 *
 * @param options - Target files and project configuration
 * @param hooks - UI callbacks for progress and user confirmations
 * @returns Result object with generated file statuses and warnings
 */
export async function runGenerateWorkflow(
  options: GenerateWorkflowOptions,
  hooks: GenerateWorkflowHooks = {},
): Promise<GenerateWorkflowResult> {
  const reportProgress = async (
    step: GenerateWorkflowStep,
    fileType?: GenerateFileType,
    filePath?: string,
  ): Promise<void> => {
    if (hooks.onProgress) {
      await hooks.onProgress({ step, fileType, filePath });
    }
  };

  const sendEducationalMessage = async (messageKey: string): Promise<void> => {
    if (hooks.onEducationalMessage) {
      await hooks.onEducationalMessage(messageKey);
    }
  };

  const requestedFiles = Array.from(new Set(options.files));
  const warnings: string[] = [];
  const results: GenerateWorkflowFileResult[] = [];

  if (requestedFiles.length === 0) {
    return { status: "cancelled", files: results, warnings };
  }

  for (const fileType of requestedFiles) {
    const filePath = path.join(
      options.projectPath,
      fileType === "readme" ? "README.md" : ".gitignore",
    );

    await reportProgress("checkingFile", fileType, filePath);

    let fileExists = false;
    try {
      await fs.access(filePath);
      fileExists = true;
    } catch {
      fileExists = false;
    }

    if (fileExists) {
      const shouldOverwrite = hooks.shouldOverwriteFile
        ? await hooks.shouldOverwriteFile({ fileType, filePath })
        : false;

      if (!shouldOverwrite) {
        results.push({
          fileType,
          filePath,
          status: "skipped",
          reason: "overwrite-declined",
        });
        continue;
      }
    }

    await reportProgress("generatingContent", fileType, filePath);

    try {
      let content: string;

      if (fileType === "readme") {
        await sendEducationalMessage("educational.readme_explanation");
        content = await generateReadmeContent();
      } else {
        await sendEducationalMessage("educational.gitignore_explanation");

        let technologies = options.gitignoreTechnologies;

        if (!technologies || technologies.length === 0) {
          const resolved = hooks.resolveGitignoreTechnologies
            ? await hooks.resolveGitignoreTechnologies({
                projectPath: options.projectPath,
              })
            : undefined;
          if (resolved && resolved.length > 0) {
            technologies = resolved;
          }
        }

        if (!technologies || technologies.length === 0) {
          const config = await loadStackCodeConfig(options.projectPath);
          const inferredStack = (config as { stack?: string }).stack;
          if (inferredStack) {
            technologies = [inferredStack];
          }
        }

        if (!technologies || technologies.length === 0) {
          warnings.push("generate.warning.gitignore_default");
          technologies = ["node-ts"];
        }

        content = await generateGitignoreContent(technologies);
      }

      await reportProgress("writingFile", fileType, filePath);
      await fs.writeFile(filePath, content);

      results.push({
        fileType,
        filePath,
        status: fileExists ? "overwritten" : "created",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "error");
      warnings.push(message);
      results.push({
        fileType,
        filePath,
        status: "skipped",
        reason: "error",
        error: message,
      });
    }
  }

  await reportProgress("completed");

  const hasSuccessfulFile = results.some(
    (result) => result.status === "created" || result.status === "overwritten",
  );

  return {
    status: hasSuccessfulFile ? "completed" : "cancelled",
    files: results,
    warnings,
  };
}
