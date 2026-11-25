/**
 * Workflows Module - Orchestration Layer
 *
 * This module provides high-level workflow orchestration for various StackCode operations.
 * Each workflow coordinates multiple core operations and provides progress hooks for UI integration.
 *
 * Workflows are organized by domain:
 * - init: Project initialization and scaffolding
 * - generate: File generation (README, .gitignore)
 * - validate: Commit message and project validation
 * - git: Git operations (commit, branch management)
 * - release: Version management and changelog generation
 */

export * from "./init.js";
export * from "./generate.js";
export * from "./validate.js";
export * from "./git.js";
export * from "./release.js";
export * from "./issues.js";
