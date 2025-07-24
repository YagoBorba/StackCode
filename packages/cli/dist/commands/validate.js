"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const core_1 = require("@stackcode/core");
exports.validateCommand = {
    command: 'validate <message>',
    describe: 'Validates if a string is a conventional commit message.',
    builder: (yargs) => {
        return yargs.positional('message', {
            describe: 'The commit message to validate',
            type: 'string',
            demandOption: true,
        });
    },
    handler: (argv) => {
        const isValid = (0, core_1.validateCommitMessage)(argv.message);
        if (isValid) {
            console.log(chalk_1.default.green.bold('✔ Valid: This is a valid conventional commit message.'));
        }
        else {
            console.log(chalk_1.default.red.bold('✖ Invalid: This is not a valid conventional commit message.'));
        }
    }
};
