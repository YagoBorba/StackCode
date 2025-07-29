import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
/**
 * Runs a git command and returns its stdout. Throws an error if the command fails.
 * @param {string} command - The git command to run.
 * @param {string} cwd - The current working directory to run the command in.
 * @returns {Promise<string>} The stripped stdout of the command.
 */
export async function runCommand(command, cwd) {
    try {
        const { stdout } = await execAsync(command, { cwd });
        return stdout.trim();
    }
    catch (error) {
        // Retorna string vazia para erros esperados (ex: git tag not found), mas
        // lança o erro para falhas de comando reais.
        if (error instanceof Error && error.stderr?.includes('not found')) {
            return '';
        }
        // Propaga o erro para que a execução principal possa capturá-lo
        throw error;
    }
}
/**
 * Finds the latest git tag for a specific package pattern (e.g., 'core@*').
 */
async function _getLatestTagForPackage(packageName, projectRoot) {
    const command = `git tag --list "${packageName}@*" --sort=-v:refname`;
    const tags = await runCommand(command, projectRoot);
    const latestTag = tags.split('\n')[0];
    return latestTag || null;
}
/**
 * Finds all packages that have changed since their last version tag.
 */
export async function findChangedPackages(allPackages, projectRoot) {
    const changedPackages = [];
    for (const pkg of allPackages) {
        const packageNameWithoutScope = pkg.name.split('/')[1] || pkg.name;
        const latestTag = await _getLatestTagForPackage(packageNameWithoutScope, projectRoot);
        let hasChanges = false;
        if (latestTag) {
            const diffCommand = `git diff --name-only ${latestTag} HEAD -- ${pkg.path}`;
            const diffOutput = await runCommand(diffCommand, projectRoot);
            if (diffOutput) {
                hasChanges = true;
            }
        }
        else {
            const lsCommand = `git ls-files ${pkg.path}`;
            const lsOutput = await runCommand(lsCommand, projectRoot);
            if (lsOutput) {
                hasChanges = true;
            }
        }
        if (hasChanges) {
            changedPackages.push(pkg);
        }
    }
    return changedPackages;
}
