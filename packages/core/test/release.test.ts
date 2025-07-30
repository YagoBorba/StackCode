import { describe, it, expect, vi, afterEach } from 'vitest';

import { performReleaseCommit } from '../src/release.js';
import { runCommand } from '../src/utils.js';
import type { PackageBumpInfo } from '../src/release.js';

vi.mock('../src/utils.js');

describe('performReleaseCommit', () => {

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should run git add, commit, and tag in the correct order', async () => {
    const mockPkgInfo: PackageBumpInfo = {
      pkg: { name: '@stackcode/core', path: '/fake/path/packages/core', version: '1.0.0' },
      bumpType: 'minor',
      newVersion: '1.1.0',
    };
    const projectRoot = '/fake/path';
    const tagName = `core@1.1.0`;

    await performReleaseCommit(mockPkgInfo, projectRoot);

    expect(runCommand).toHaveBeenNthCalledWith(1, 
      'git', 
      ['add', '/fake/path/packages/core/package.json', '/fake/path/packages/core/CHANGELOG.md'], 
      { cwd: projectRoot }
    );
    
    expect(runCommand).toHaveBeenNthCalledWith(2, 
      'git', 
      ['commit', '-m', `chore(release): release ${tagName}`], 
      { cwd: projectRoot }
    );

    expect(runCommand).toHaveBeenNthCalledWith(3, 
      'git', 
      ['tag', tagName], 
      { cwd: projectRoot }
    );
  });
});