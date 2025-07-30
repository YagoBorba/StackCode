import { describe, it, expect } from 'vitest';
import { validateCommitMessage } from '../src/validator.js';

describe('validateCommitMessage', () => {
  it('should return true for a valid feat message', () => {
    const message = 'feat: add new button';
    expect(validateCommitMessage(message)).toBe(true);
  });

  it('should return true for a valid fix message with scope', () => {
    const message = 'fix(login): correct password validation';
    expect(validateCommitMessage(message)).toBe(true);
  });

  it('should return true for a commit with breaking change', () => {
    const message = 'feat(api)!: drop support for v1 endpoints';
    expect(validateCommitMessage(message)).toBe(true);
  });

  it('should return false for a message without a type', () => {
    const message = 'add new button';
    expect(validateCommitMessage(message)).toBe(false);
  });

  it('should return false for a message without a subject', () => {
    const message = 'fix:';
    expect(validateCommitMessage(message)).toBe(false);
  });

  it('should return false for an empty string', () => {
    const message = '';
    expect(validateCommitMessage(message)).toBe(false);
  });
});