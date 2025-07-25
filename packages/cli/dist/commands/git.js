"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const start_feature_1 = require("./git_sub/start-feature");
exports.gitCommand = {
    command: 'git <subcommand>',
    describe: 'Provides a suite of commands to assist with the GitFlow workflow.',
    builder: (yargs) => {
        // Registra todos os sub-comandos do 'git' aqui
        return yargs
            .command(start_feature_1.startFeatureCommand);
    },
    handler: () => {
        console.log(chalk_1.default.yellow('Please specify a git subcommand (e.g., start-feature).'));
    }
};
