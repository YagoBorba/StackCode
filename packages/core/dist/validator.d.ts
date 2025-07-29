/**
 * @fileoverview Core validation logic for StackCode.
 * @module core/validator
 */
/**
 * Validates a commit message string against the Conventional Commits specification.
 * @param {string} message - The commit message to validate.
 * @returns {boolean} - True if the message is valid, false otherwise.
 */
export declare function validateCommitMessage(message: string): boolean;
