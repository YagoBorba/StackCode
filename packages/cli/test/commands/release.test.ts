// packages/cli/test/commands/release.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getReleaseCommand } from '../../src/commands/release';
import * as core from '@stackcode/core';
import inquirer from 'inquirer';
import fs from 'fs/promises';

// Mock das dependências externas
vi.mock('@stackcode/core');
vi.mock('inquirer');
vi.mock('fs/promises');

describe('Release Command Handler', () => {
  const { handler } = getReleaseCommand();

  beforeEach(() => {
    vi.clearAllMocks();
    // Silencia o console.log antes de cada teste
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaura os mocks para o estado original depois de todos os testes
    vi.restoreAllMocks();
  });


  it('should call the correct core functions for a "locked" release', async () => {
    // Arrange
    vi.mocked(core.detectVersioningStrategy).mockResolvedValue({
      strategy: 'locked',
      rootDir: '/fake',
      packages: [],
    });
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirm: true, createRelease: true });
    vi.mocked(core.getRecommendedBump).mockResolvedValue('patch');
    vi.mocked(core.getCommandOutput).mockResolvedValue('git@github.com:owner/repo.git');
    vi.mocked(fs.readFile).mockResolvedValue('');
    vi.mocked(fs.writeFile).mockResolvedValue();

    // Act
    // @ts-ignore
    await handler({});

    // Assert
    expect(core.updateAllVersions).toHaveBeenCalledOnce();
    expect(fs.writeFile).toHaveBeenCalledOnce();
    expect(core.findChangedPackages).not.toHaveBeenCalled();
  });

  it('should call the correct core functions for an "independent" release', async () => {
    // Arrange
    vi.mocked(core.detectVersioningStrategy).mockResolvedValue({
      strategy: 'independent',
      rootDir: '/fake',
      packages: [{ name: 'pkg1', path: '/fake/pkg1' }],
    });
    vi.mocked(inquirer.prompt).mockResolvedValue({ confirmRelease: true, createRelease: true });
    vi.mocked(core.findChangedPackages).mockResolvedValue([{ name: 'pkg1', path: '/fake/pkg1' }]);
    vi.mocked(core.determinePackageBumps).mockResolvedValue([{ 
      pkg: { name: 'pkg1', path: '/fake/pkg1' }, 
      bumpType: 'patch', 
      newVersion: '1.0.1' 
    }]);
    vi.mocked(core.getCommandOutput).mockResolvedValue('git@github.com:owner/repo.git');

    // Act
    // @ts-ignore
    await handler({});

    // Assert
    expect(core.findChangedPackages).toHaveBeenCalledOnce();
    expect(core.updateAllVersions).not.toHaveBeenCalled();
  });
});