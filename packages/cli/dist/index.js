#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
// Import all command modules from their dedicated files
const validate_1 = require("./commands/validate");
const generate_1 = require("./commands/generate");
const init_1 = require("./commands/init");
const git_1 = require("./commands/git"); // <-- NOSSA NOVA IMPORTAÇÃO
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .scriptName("stackcode")
    .version('1.0.0')
    .usage('Usage: $0 <command> [options]')
    .strict()
    // Register all commands in a clean, modular way
    .command(validate_1.validateCommand)
    .command(generate_1.generateCommand)
    .command(init_1.initCommand)
    .command(git_1.gitCommand) // <-- NOSSO NOVO COMANDO
    .demandCommand(1, 'You need at least one command before moving on.')
    .help()
    .argv;
