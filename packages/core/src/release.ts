import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import { Bumper } from 'conventional-recommended-bump';
import conventionalChangelog from 'conventional-changelog-core';
import { getCommandOutput, runCommand } from './utils.js';

export type VersioningStrategy = 'locked' | 'independent' | 'unknown';

export interface PackageInfo {
    name: string;
    version?: string;
    path: string;
}

export interface MonorepoInfo {
    strategy: VersioningStrategy;
    rootDir: string;
    rootVersion?: string;
    packages: PackageInfo[];
}

export interface PackageBumpInfo {
    pkg: PackageInfo;
    bumpType: string;
    newVersion: string;
}

async function _safeReadJson(filePath: string): Promise<any | null> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

async function _findPackagePaths(rootDir: string, rootPackageJson: any): Promise<string[]> {
    const packagePaths: string[] = [];
    const workspaces = rootPackageJson.workspaces?.packages ?? rootPackageJson.workspaces ?? ['packages/*'];

    for (const pattern of workspaces) {
        if (pattern.endsWith('/*')) {
            const baseDir = path.join(rootDir, pattern.replace('/*', ''));
            try {
                const entries = await fs.readdir(baseDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        packagePaths.push(path.join(baseDir, entry.name));
                    }
                }
            } catch (error) {
            }
        } else {
            packagePaths.push(path.join(rootDir, pattern));
        }
    }
    return packagePaths;
}

async function _getLatestTagForPackage(packageName: string, projectRoot: string): Promise<string | null> {
    try {
        const tags = await getCommandOutput('git', ['tag', '--list', `${packageName}@*`, '--sort=-v:refname'], { cwd: projectRoot });
        return tags.split('\n')[0] || null;
    } catch (error) {
        return null;
    }
}

export async function detectVersioningStrategy(startPath: string): Promise<MonorepoInfo> {
    const rootDir = startPath;
    const rootPackageJsonPath = path.join(rootDir, 'package.json');
    const rootPackageJson = await _safeReadJson(rootPackageJsonPath);

    if (!rootPackageJson) {
        return { strategy: 'unknown', rootDir, packages: [] };
    }

    const rootVersion = rootPackageJson.version;
    const packagePaths = await _findPackagePaths(rootDir, rootPackageJson);

    const packagePromises = packagePaths.map(async (pkgPath): Promise<PackageInfo | null> => {
        const pkgJsonPath = path.join(pkgPath, 'package.json');
        const pkgJson = await _safeReadJson(pkgJsonPath);
        if (pkgJson?.name) {
            const packageInfo: PackageInfo = { name: pkgJson.name, version: pkgJson.version, path: pkgPath };
            return packageInfo;
        }
        return null;
    });

    const packages = (await Promise.all(packagePromises)).filter((p): p is PackageInfo => p !== null);

    if (!rootVersion || packages.length === 0 || packages.some(p => p.version !== rootVersion)) {
        return { strategy: 'independent', rootDir, rootVersion, packages };
    }

    return { strategy: 'locked', rootDir, rootVersion, packages };
}

export async function findChangedPackages(allPackages: PackageInfo[], projectRoot: string): Promise<PackageInfo[]> {
    const changedPackages: PackageInfo[] = [];

    for (const pkg of allPackages) {
        const packageNameWithoutScope = pkg.name.split('/')[1] || pkg.name;
        const latestTag = await _getLatestTagForPackage(packageNameWithoutScope, projectRoot);

        let hasChanges = false;
        if (latestTag) {
            const diffOutput = await getCommandOutput('git', ['diff', '--name-only', latestTag, 'HEAD', '--', pkg.path], { cwd: projectRoot });
            if (diffOutput) {
                hasChanges = true;
            }
        } else {
            const lsOutput = await getCommandOutput('git', ['ls-files', pkg.path], { cwd: projectRoot });
            if (lsOutput) {
                hasChanges = true;
            }
        }

        if (hasChanges) {
            changedPackages.push(pkg);
        }
    }

    return changedPackages;
}


export async function getRecommendedBump(projectRoot: string): Promise<string> {
    const bumper = new Bumper(projectRoot).loadPreset('angular');
    const recommendation = await bumper.bump() as any;
    return recommendation?.releaseType || 'patch';
}

export async function updateAllVersions(monorepoInfo: MonorepoInfo, newVersion: string): Promise<void> {
    const allPackageJsonPaths = [
        path.join(monorepoInfo.rootDir, 'package.json'),
        ...monorepoInfo.packages.map(pkg => path.join(pkg.path, 'package.json'))
    ];

    const updatePromises = allPackageJsonPaths.map(async (pkgPath) => {
        const pkgJson = await _safeReadJson(pkgPath);
        if (pkgJson) {
            pkgJson.version = newVersion;
            await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
        }
    });

    await Promise.all(updatePromises);
}

export async function determinePackageBumps(changedPackages: PackageInfo[]): Promise<PackageBumpInfo[]> {
    const bumpInfoPromises = changedPackages.map(async (pkg) => {
        const projectRoot = pkg.path;
        const currentVersion = pkg.version || '0.0.0';
        const bumpType = await getRecommendedBump(projectRoot);
        const newVersion = semver.inc(currentVersion, bumpType as semver.ReleaseType);

        if (!newVersion) {
            return null;
        }

        return { pkg, bumpType, newVersion };
    });

    const results = await Promise.all(bumpInfoPromises);
    return results.filter((info): info is PackageBumpInfo => info !== null);
}

export function generateChangelog(monorepoInfo: MonorepoInfo, pkgInfo?: PackageBumpInfo): Promise<string> {
    return new Promise((resolve, reject) => {
        let changelogContent = '';
        const options = { preset: 'angular', tagPrefix: 'v' };
        const context = {};
        const gitRawCommitsOpts = {
            path: pkgInfo ? pkgInfo.pkg.path : monorepoInfo.rootDir,
        };

        const changelogStream = (conventionalChangelog as any)(options, context, gitRawCommitsOpts);

        changelogStream.on('data', (chunk: Buffer) => changelogContent += chunk.toString());
        changelogStream.on('end', () => resolve(changelogContent));
        changelogStream.on('error', (err: Error) => reject(err));
    });
}

export async function updatePackageVersion(pkgInfo: PackageBumpInfo): Promise<void> {
    const pkgJsonPath = path.join(pkgInfo.pkg.path, 'package.json');
    const pkgJson = await _safeReadJson(pkgJsonPath);
    if (pkgJson) {
        pkgJson.version = pkgInfo.newVersion;
        await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
    }
}

/**
 * Executes the git commands to add, commit, and tag a release.
 * This is the function we are testing.
 */
export async function performReleaseCommit(pkgInfo: PackageBumpInfo, projectRoot: string): Promise<void> {
    const packageName = pkgInfo.pkg.name.split('/')[1] || pkgInfo.pkg.name;
    const tagName = `${packageName}@${pkgInfo.newVersion}`;
    const commitMessage = `chore(release): release ${tagName}`;

    const pkgJsonPath = path.join(pkgInfo.pkg.path, 'package.json');
    const changelogPath = path.join(pkgInfo.pkg.path, 'CHANGELOG.md');

    await runCommand('git', ['add', pkgJsonPath, changelogPath], { cwd: projectRoot });
    await runCommand('git', ['commit', '-m', commitMessage], { cwd: projectRoot });
    await runCommand('git', ['tag', tagName], { cwd: projectRoot });
}