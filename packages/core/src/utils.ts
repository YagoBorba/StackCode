/**
 * @fileoverview General utility functions for StackCode.
 * @module core/utils
 */
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { StackCodeConfig } from "./types.js";

interface RunCommandOptions {
  cwd: string;
}

/**
 * Executes a shell command and streams its output.
 * Ideal for long-running processes like 'npm install' where the user needs to see the output live.
 * @param command - The command to execute (e.g., 'npm').
 * @param args - An array of string arguments (e.g., ['install']).
 * @param options - The execution options, including the working directory.
 * @returns A promise that resolves when the command completes successfully.
 */
export function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: options.cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    childProcess.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Executes a shell command and captures its standard output.
 * Ideal for getting information, like the current git branch name.
 * @param command - The command to execute.
 * @param args - An array of string arguments.
 * @param options - The execution options.
 * @returns A promise that resolves with the command's stdout string.
 */
export function getCommandOutput(
  command: string,
  args: string[],
  options: RunCommandOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: options.cwd,
      shell: process.platform === "win32",
    });

    let stdout = "";
    let stderr = "";

    childProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim()));
      }
    });

    childProcess.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Checks if a command is available in the system PATH.
 * @param command - The command to check (e.g., 'go', 'composer', 'mvn').
 * @returns A promise that resolves to true if the command is available, false otherwise.
 */
export async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    const checkCommand = process.platform === "win32" ? "where" : "which";
    await getCommandOutput(checkCommand, [command], { cwd: process.cwd() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the required dependencies for a given stack.
 * @param stack - The stack name (e.g., 'go', 'php', 'java', 'python').
 * @returns An array of required commands for the stack.
 */
export function getStackDependencies(stack: string): string[] {
  const stackMap: Record<string, string[]> = {
    go: ["go"],
    php: ["composer", "php"],
    java: ["mvn", "java"],
    python: ["pip", "python"],
    "node-js": ["npm"],
    "node-ts": ["npm"],
    react: ["npm"],
    vue: ["npm"],
    angular: ["npm"],
    svelte: ["npm"],
  };

  return stackMap[stack] || ["npm"];
}

/**
 * Validates if all required dependencies for a stack are available.
 * @param stack - The stack name to validate.
 * @returns A promise that resolves to an object with validation results.
 */
export async function validateStackDependencies(stack: string): Promise<{
  isValid: boolean;
  missingDependencies: string[];
  availableDependencies: string[];
}> {
  const dependencies = getStackDependencies(stack);
  const results = await Promise.all(
    dependencies.map(async (dep) => ({
      command: dep,
      available: await isCommandAvailable(dep),
    })),
  );

  const missingDependencies = results
    .filter((result) => !result.available)
    .map((result) => result.command);

  const availableDependencies = results
    .filter((result) => result.available)
    .map((result) => result.command);

  return {
    isValid: missingDependencies.length === 0,
    missingDependencies,
    availableDependencies,
  };
}

/**
 * Extracts a readable error message from various error types.
 * @param error - The error object to extract message from.
 * @returns A human-readable error message string.
 */
export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "stderr" in error &&
    typeof (error as { stderr?: unknown }).stderr === "string"
  ) {
    return (error as { stderr: string }).stderr;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Loads StackCode configuration from .stackcoderc.json file.
 * @param projectPath - The project path to look for configuration.
 * @returns A promise that resolves to the configuration object.
 */
export async function loadStackCodeConfig(
  projectPath: string,
): Promise<StackCodeConfig> {
  const configPath = path.join(projectPath, ".stackcoderc.json");

  try {
    const configContent = await fs.readFile(configPath, "utf8");
    return JSON.parse(configContent) as StackCodeConfig;
  } catch {
    return {
      stack: undefined,
      features: {
        commitValidation: false,
        husky: false,
        docker: false,
      },
    };
  }
}

/**
 * Saves StackCode configuration to .stackcoderc.json file.
 * @param projectPath - The project path to save configuration.
 * @param config - The configuration object to save.
 */
export async function saveStackCodeConfig(
  projectPath: string,
  config: StackCodeConfig,
): Promise<void> {
  const configPath = path.join(projectPath, ".stackcoderc.json");
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}
