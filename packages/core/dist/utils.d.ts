interface RunCommandOptions {
    /** The current working directory for the command. */
    cwd: string;
}
/**
 * Executes a shell command and streams its output.
 * We use `spawn` instead of `exec` because it's better for long-running processes
 * and for streaming I/O, which is exactly what we need for `npm install`.
 * It's also generally safer as it doesn't invoke a shell by default.
 * @param command - The command to execute (e.g., 'npm').
 * @param args - An array of string arguments (e.g., ['install']).
 * @param options - The execution options, including the working directory.
 * @returns A promise that resolves when the command completes successfully, or rejects on error.
 */
export declare function runCommand(command: string, args: string[], options: RunCommandOptions): Promise<void>;
export {};
