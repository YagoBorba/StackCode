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
export declare function getErrorMessage(error: unknown): string;
export {};
