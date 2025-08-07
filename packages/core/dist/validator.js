/**
 * @fileoverview Core validation logic for StackCode.
 * @module core/validator
 */
const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?!?: .{1,}/;
/**
 * Validates a commit message string against the Conventional Commits specification.
 * @param {string} message - The commit message to validate.
 * @returns {boolean} - True if the message is valid, false otherwise.
 */
export function validateCommitMessage(message) {
    if (!message) {
        return false;
    }
    return CONVENTIONAL_COMMIT_REGEX.test(message);
}
//# sourceMappingURL=validator.js.map