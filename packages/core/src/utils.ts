/**
 * @fileoverview General utility functions for StackCode.
 * @module core/utils
 */
import { spawn } from 'child_process';

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
export function runCommand(command: string, args: string[], options: RunCommandOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, {
            cwd: options.cwd,
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });

        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        childProcess.on('error', (error) => {
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
export function getCommandOutput(command: string, args: string[], options: RunCommandOptions): Promise<string> {
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
            } else {
                reject(new Error(stderr.trim()));
            }
        });

        childProcess.on('error', (error) => {
            reject(error);
        });
    });
}