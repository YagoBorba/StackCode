import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import {
    scaffoldProject,
    setupHusky,
    generateReadmeContent,
    generateGitignoreContent,
    runCommand,
} from '@stackcode/core';
import { getInitCommand } from '../../src/commands/init';

vi.mock('@stackcode/core', () => ({
  scaffoldProject: vi.fn(),
  setupHusky: vi.fn(),
  generateReadmeContent: vi.fn(),
  generateGitignoreContent: vi.fn(),
  runCommand: vi.fn(),
}));

vi.mock('inquirer');
vi.mock('fs/promises');
vi.mock('@stackcode/i18n', () => ({ t: (key: string) => key }));

const mockedInquirer = vi.mocked(inquirer);
const mockedFs = vi.mocked(fs);
const mockedCore = {
  scaffoldProject: vi.mocked(scaffoldProject),
  setupHusky: vi.mocked(setupHusky),
  generateReadmeContent: vi.mocked(generateReadmeContent),
  generateGitignoreContent: vi.mocked(generateGitignoreContent),
  runCommand: vi.mocked(runCommand),
};

describe('Init Command', () => {
  const { handler } = getInitCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should run the full project initialization flow successfully', async () => {
    const mockAnswers = {
      projectName: 'test-project',
      description: 'A test project.',
      authorName: 'Test Author',
      stack: 'node-ts',
      features: ['docker', 'husky'],
      commitValidation: true,
    };
    mockedInquirer.prompt.mockResolvedValue(mockAnswers);
    mockedFs.access.mockRejectedValue(new Error('not found')); 
    mockedCore.generateReadmeContent.mockResolvedValue('# Test Project');
    mockedCore.generateGitignoreContent.mockResolvedValue('node_modules');

    // Act
    await handler({ _:[], $0: 'stc' });
    // Assert
    const projectPath = expect.stringContaining(mockAnswers.projectName);

    expect(mockedCore.scaffoldProject).toHaveBeenCalledWith({
      projectPath: projectPath,
      stack: mockAnswers.stack,
      features: mockAnswers.features,
      replacements: {
        projectName: mockAnswers.projectName,
        description: mockAnswers.description,
        authorName: mockAnswers.authorName,
      },
    });

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.stackcoderc.json'),
      expect.stringContaining('"commitValidation": true')
    );
 
    expect(mockedFs.writeFile).toHaveBeenCalledWith(projectPath, '# Test Project');
    expect(mockedFs.writeFile).toHaveBeenCalledWith(projectPath, 'node_modules');

    expect(mockedCore.setupHusky).toHaveBeenCalledWith(projectPath);

    expect(mockedCore.runCommand).toHaveBeenCalledWith('git', ['init'], { cwd: projectPath });
    expect(mockedCore.runCommand).toHaveBeenCalledWith('npm', ['install'], { cwd: projectPath });

    expect(console.log).toHaveBeenCalledWith('init.success.ready');
  });

  it('should cancel the operation if user denies overwrite', async () => {
    // Arrange
    const mockAnswers = { projectName: 'existing-project' };
    mockedInquirer.prompt
      .mockResolvedValueOnce(mockAnswers) 
      .mockResolvedValueOnce({ overwrite: false }); 
    mockedFs.access.mockResolvedValue(undefined);

    // Act
    await handler({ _:[], $0: 'stc' });

    // Assert
    expect(mockedInquirer.prompt).toHaveBeenCalledTimes(2);
    expect(mockedCore.scaffoldProject).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('common.operation_cancelled');
  });
});