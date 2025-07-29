import type { PackageInfo } from './index.js';
/**
 * Runs a git command and returns its stdout. Throws an error if the command fails.
 * @param {string} command - The git command to run.
 * @param {string} cwd - The current working directory to run the command in.
 * @returns {Promise<string>} The stripped stdout of the command.
 */
export declare function runCommand(command: string, cwd: string): Promise<string>;
/**
 * Finds all packages that have changed since their last version tag.
 */
export declare function findChangedPackages(allPackages: PackageInfo[], projectRoot: string): Promise<PackageInfo[]>;
