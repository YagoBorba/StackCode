import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCommitCommand } from '../../src/commands/commit';
import * as core from '@stackcode/core';
import inquirer from 'inquirer';

vi.mock('@stackcode/core');
vi.mock('inquirer');

describe('Commit Command Handler', () => {
  const { handler } = getCommitCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format a simple commit message and call git commit', async () => {
    vi.mocked(core.getCommandOutput).mockResolvedValue('M  packages/cli/src/commands/commit.ts');

    vi.mocked(inquirer.prompt).mockResolvedValue({
      type: 'feat',
      scope: 'api',
      shortDescription: 'add new login endpoint',
      longDescription: '',
      breakingChanges: '',
      affectedIssues: '',
    });

    const runCommandMock = vi.mocked(core.runCommand);

    await handler({ _: [], $0: 'stc' });
    expect(runCommandMock).toHaveBeenCalledOnce();
    expect(runCommandMock).toHaveBeenCalledWith(
      'git',
      ['commit', '-m', 'feat(api): add new login endpoint'],
      expect.anything()
    );
  });

  it('should format a complex commit message with body, breaking change, and footer', async () => {
    vi.mocked(core.getCommandOutput).mockResolvedValue('M  packages/cli/src/commands/commit.ts');
    
    vi.mocked(inquirer.prompt).mockResolvedValue({
      type: 'refactor',
      scope: 'auth',
      shortDescription: 'use JWT service for authentication',
      longDescription: 'Implement new JWT service for better security.|Separate concerns.',
      breakingChanges: 'The token format has changed and now requires a new validation method.',
      affectedIssues: 'closes #42',
    });

    const runCommandMock = vi.mocked(core.runCommand);

    await handler({ _: [], $0: 'stc' });

    const expectedMessage = `refactor(auth): use JWT service for authentication

Implement new JWT service for better security.
Separate concerns.

BREAKING CHANGE: The token format has changed and now requires a new validation method.

closes #42`;

    expect(runCommandMock).toHaveBeenCalledOnce();
    expect(runCommandMock).toHaveBeenCalledWith(
      'git',
      ['commit', '-m', expectedMessage],
      expect.anything()
    );
  });
});