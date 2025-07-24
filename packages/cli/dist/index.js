#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 1. Import the necessary types from yargs
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@stackcode/core");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .scriptName("stackcode")
    .version('1.0.0')
    // 2. Changed .description() to the correct .usage() method
    .usage('Usage: $0 <command> [options]')
    .strict()
    // --- Comando 'validate' ---
    .command('validate <message>', 'Validates if a string is a conventional commit message.', () => { }, 
// 3. Added type for the 'argv' parameter
(argv) => {
    const isValid = (0, core_1.validateCommitMessage)(argv.message);
    if (isValid) {
        console.log(chalk_1.default.green.bold('✔ Valid: This is a valid conventional commit message.'));
    }
    else {
        console.log(chalk_1.default.red.bold('✖ Invalid: This is not a valid conventional commit message.'));
    }
})
    // --- Comando 'generate' ---
    .command('generate <filetype>', 'Generate common project files.', 
// 4. Added type for the 'yargs' parameter
(yargs) => {
    return yargs
        .command('gitignore', 'Generates a .gitignore file.', () => { }, async () => {
        const gitignorePath = path_1.default.join(process.cwd(), '.gitignore');
        // ... (rest of the gitignore logic is unchanged)
    })
        .command('readme', 'Generates a rich README.md template file.', () => { }, async () => {
        const readmePath = path_1.default.join(process.cwd(), 'README.md');
        if (fs_1.default.existsSync(readmePath)) {
            const { overwrite } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: 'A README.md file already exists. Do you want to overwrite it?',
                    default: false,
                },
            ]);
            if (!overwrite) {
                console.log(chalk_1.default.yellow('Operation cancelled.'));
                return;
            }
        }
        const content = (0, core_1.generateReadmeContent)();
        fs_1.default.writeFileSync(readmePath, content);
        console.log(chalk_1.default.green.bold('✔ Success! README.md template generated.'));
    });
}, () => {
    console.log(chalk_1.default.yellow('Please specify a file type to generate (e.g., gitignore, readme).'));
})
    .demandCommand(1, 'You need at least one command before moving on.')
    .help()
    .argv;
