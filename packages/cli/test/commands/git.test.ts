import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import { getGitCommand } from '../../src/commands/git';

import { createBranch } from '../../src/commands/git_sub/start.js';
import { finishHandler } from '../../src/commands/git_sub/finish.js';

vi.mock('../../src/commands/git_sub/start.js', () => ({
  getStartCommand: vi.fn(() => ({ command: 'start', describe: 'starts a new branch', handler: vi.fn() })),
  createBranch: vi.fn(),
}));

vi.mock('../../src/commands/git_sub/finish.js', () => ({
  getFinishCommand: vi.fn(() => ({ command: 'finish', describe: 'finishes a branch', handler: vi.fn() })),
  finishHandler: vi.fn(),
}));

vi.mock('inquirer');

vi.mock('@stackcode/i18n', () => ({ t: (key: string) => key }));

const mockedInquirer = vi.mocked(inquirer);
const mockedCreateBranch = vi.mocked(createBranch);
const mockedFinishHandler = vi.mocked(finishHandler);


describe('Git Command', () => {
  const { handler } = getGitCommand();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Interactive Mode Handler', () => {
    it('should call createBranch with correct arguments when user chooses "start"', async () => {
      // Arrange
      mockedInquirer.prompt
        .mockResolvedValueOnce({ action: 'start' })
        .mockResolvedValueOnce({ branchName: 'new-feature' })
        .mockResolvedValueOnce({ branchType: 'feature' });
      
      const argv = { _:['git'], $0: 'stc' };

      // Act
      await handler(argv);

      // Assert
      expect(mockedInquirer.prompt).toHaveBeenCalledTimes(3);
      expect(mockedCreateBranch).toHaveBeenCalledOnce();
      expect(mockedCreateBranch).toHaveBeenCalledWith('new-feature', 'feature');
      expect(mockedFinishHandler).not.toHaveBeenCalled();
    });

    it('should call finishHandler when user chooses "finish"', async () => {
      // Arrange
      mockedInquirer.prompt.mockResolvedValueOnce({ action: 'finish' });
      const argv = { _:['git'], $0: 'stc' };

      // Act
      await handler(argv);

      // Assert
      expect(mockedInquirer.prompt).toHaveBeenCalledOnce();
      expect(mockedFinishHandler).toHaveBeenCalledOnce();
      expect(mockedCreateBranch).not.toHaveBeenCalled();
    });
  });

  describe('Non-Interactive Mode (Subcommand Dispatch)', () => {
    it('should not prompt user if a subcommand is being run', async () => {
      // Arrange
      const argv = { _:['git', 'start'], $0: 'stc', subcommand: 'start' };

      // Act
      await handler(argv);
      
      // Assert
      expect(mockedInquirer.prompt).not.toHaveBeenCalled();
    });
  });
});