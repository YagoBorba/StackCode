"use strict";
/**
 * @fileoverview Main entry point for the @stackcode/core package.
 * It exports all the public-facing functions and types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.setupHusky = exports.scaffoldProject = exports.generateReadmeContent = exports.generateGitignoreContent = exports.validateCommitMessage = void 0;
// From validator.ts
var validator_1 = require("./validator");
Object.defineProperty(exports, "validateCommitMessage", { enumerable: true, get: function () { return validator_1.validateCommitMessage; } });
// From generators.ts
var generators_1 = require("./generators");
Object.defineProperty(exports, "generateGitignoreContent", { enumerable: true, get: function () { return generators_1.generateGitignoreContent; } });
Object.defineProperty(exports, "generateReadmeContent", { enumerable: true, get: function () { return generators_1.generateReadmeContent; } });
// From scaffold.ts
var scaffold_1 = require("./scaffold");
Object.defineProperty(exports, "scaffoldProject", { enumerable: true, get: function () { return scaffold_1.scaffoldProject; } });
Object.defineProperty(exports, "setupHusky", { enumerable: true, get: function () { return scaffold_1.setupHusky; } });
// From utils.ts
var utils_1 = require("./utils");
Object.defineProperty(exports, "runCommand", { enumerable: true, get: function () { return utils_1.runCommand; } });
