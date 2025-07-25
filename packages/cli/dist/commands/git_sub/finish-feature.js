"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishFeatureCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const open_1 = __importDefault(require("open"));
const core_1 = require("@stackcode/core");
exports.finishFeatureCommand = {
    command: 'finish-feature',
    describe: 'Pushes the current feature branch and opens the New Pull Request page in the browser.',
    builder: (yargs) => yargs, // Este comando não precisa de argumentos adicionais.
    handler: async () => {
        console.log(chalk_1.default.cyan('🚀 Finalizing feature...'));
        try {
            // 1. Get current branch name
            const branchName = await (0, core_1.getCommandOutput)('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: process.cwd() });
            if (!branchName.startsWith('feature/')) {
                console.error(chalk_1.default.red(`✖ This command can only be run on a 'feature/' branch.`));
                console.log(chalk_1.default.yellow(`   You are currently on branch: '${branchName}'.`));
                return;
            }
            // 2. Push the current branch to the remote repository
            console.log(chalk_1.default.blue(`   -> Pushing branch '${branchName}' to remote...`));
            await (0, core_1.runCommand)('git', ['push', '--set-upstream', 'origin', branchName], { cwd: process.cwd() });
            // 3. Get the remote URL and construct the PR link
            const remoteUrl = await (0, core_1.getCommandOutput)('git', ['remote', 'get-url', 'origin'], { cwd: process.cwd() });
            // Extracts 'user/repo' from both SSH and HTTPS urls
            const repoPathMatch = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-]+)\.git/);
            if (!repoPathMatch) {
                throw new Error('Could not parse GitHub repository path from remote URL.');
            }
            const repoPath = repoPathMatch[1];
            const prUrl = `https://github.com/${repoPath}/pull/new/${branchName}`;
            // 4. Open the browser
            console.log(chalk_1.default.blue('   -> Opening your browser to create a Pull Request...'));
            await (0, open_1.default)(prUrl);
            console.log(chalk_1.default.green.bold('\n✅ Success! Your browser is open and ready.'));
            console.log(chalk_1.default.yellow('   Please review your changes and create the Pull Request on GitHub.'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`✖ An error occurred while finishing the feature.`));
            console.error(chalk_1.default.gray(error.message));
        }
    }
};
