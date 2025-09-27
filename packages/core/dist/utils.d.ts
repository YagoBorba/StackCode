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
export declare function runCommand(command: string, args: string[], options: RunCommandOptions): Promise<void>;
/**
 * Executes a shell command and captures its standard output.
 * Ideal for getting information, like the current git branch name.
 * @param command - The command to execute.
 * @param args - An array of string arguments.
 * @param options - The execution options.
 * @returns A promise that resolves with the command's stdout string.
 */
export declare function getCommandOutput(command: string, args: string[], options: RunCommandOptions): Promise<string>;
/**
 * Checks if a command is available in the system PATH.
 * @param command - The command to check (e.g., 'go', 'composer', 'mvn').
 * @returns A promise that resolves to true if the command is available, false otherwise.
 */
export declare function isCommandAvailable(command: string): Promise<boolean>;
/**
 * Gets the required dependencies for a given stack.
 * @param stack - The stack name (e.g., 'go', 'php', 'java', 'python').
 * @returns An array of required commands for the stack.
 */
export declare function getStackDependencies(stack: string): string[];
/**
 * Validates if all required dependencies for a stack are available.
 * @param stack - The stack name to validate.
 * @returns A promise that resolves to an object with validation results.
 */
export declare function validateStackDependencies(stack: string): Promise<{
    isValid: boolean;
    missingDependencies: string[];
    availableDependencies: string[];
}>;
/**
 * Extracts a readable error message from various error types.
 * @param error - The error object to extract message from.
 * @returns A human-readable error message string.
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Loads StackCode configuration from .stackcoderc.json file.
 * @param projectPath - The project path to look for configuration.
 * @returns A promise that resolves to the configuration object.
 */
export declare function loadStackCodeConfig(projectPath: string): Promise<StackCodeConfig>;
/**
 * Saves StackCode configuration to .stackcoderc.json file.
 * @param projectPath - The project path to save configuration.
 * @param config - The configuration object to save.
 */
export declare function saveStackCodeConfig(projectPath: string, config: StackCodeConfig): Promise<void>;
export {};
