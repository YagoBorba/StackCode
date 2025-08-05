import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCommitMessage } from '@stackcode/core';
import { getValidateCommand } from '../../src/commands/validate';

vi.mock('@stackcode/core', () => ({
  validateCommitMessage: vi.fn(),
}));
vi.mock('@stackcode/i18n', () => ({ t: (key: string) => key }));

const mockedCore = {
  validateCommitMessage: vi.mocked(validateCommitMessage),
};

describe('Validate Command', () => {
  const { handler } = getValidateCommand();
  const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as () => never);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log a success message for a valid commit message', () => {
    // Arrange
    const argv = { message: 'feat: add new feature', _: [], $0: 'stc' };
    mockedCore.validateCommitMessage.mockReturnValue(true);

    // Act
    handler(argv);

    // Assert
    expect(mockedCore.validateCommitMessage).toHaveBeenCalledWith(argv.message);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('validate.success'));
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should log an error and exit with code 1 for an invalid commit message', () => {
    // Arrange
    const argv = { message: 'invalid message', _: [], $0: 'stc' };
    mockedCore.validateCommitMessage.mockReturnValue(false);

    // Act
    handler(argv);

    // Assert
    expect(mockedCore.validateCommitMessage).toHaveBeenCalledWith(argv.message);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('validate.error_invalid'));
    expect(mockProcessExit).toHaveBeenCalledOnce();
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it.todo('yargs should enforce the message argument');
});