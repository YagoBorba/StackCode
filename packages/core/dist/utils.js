/**
 * @fileoverview General utility functions for StackCode.
 * @module core/utils
 */
import { spawn } from 'child_process';
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
export function runCommand(command, args, options) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, {
            cwd: options.cwd,
            // 'inherit' pipes the child process's stdio to the parent's,
            // so the user sees the command's output in their terminal.
            stdio: 'inherit',
            // On Windows, npm/git commands often need to be run in a shell.
            shell: process.platform === 'win32',
        });
        childProcess.on('close', (code) => {
            if (code === 0) {
                // The command succeeded.
                resolve();
            }
            else {
                // The command failed.
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        childProcess.on('error', (error) => {
            // An error occurred trying to spawn the process.
            reject(error);
        });
    });
}
/**
 * Executes a shell command and captures its standard output.
 * Ideal for getting information like the current git branch name or remote URL.
 * @param command - The command to execute.
 * @param args - An array of string arguments.
 * @param options - The execution options.
 * @returns A promise that resolves with the command's stdout string, or rejects with the stderr.
 */
export function getCommandOutput(command, args, options) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, {
            cwd: options.cwd,
            shell: process.platform === 'win32',
        });
        let stdout = '';
        let stderr = '';
        childProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        childProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            }
            else {
                reject(new Error(stderr.trim()));
            }
        });
        childProcess.on('error', (error) => {
            reject(error);
        });
    });
}
