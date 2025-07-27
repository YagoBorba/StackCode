import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import { Bumper } from 'conventional-recommended-bump'; 
import conventionalChangelog from 'conventional-changelog-core';

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
            } catch (error) {}
        } else {
            packagePaths.push(path.join(rootDir, pattern));
        }
    }
    return packagePaths;
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

export async function getRecommendedBump(projectRoot: string): Promise<string> {
  const bumper = new Bumper(projectRoot).loadPreset('angular');
  // FIX: Cast the result to 'any' to bypass the faulty type definitions.
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

export function generateChangelog(monorepoInfo: MonorepoInfo): Promise<string> {
    return new Promise((resolve, reject) => {
        let changelogContent = '';
        
        const changelogStream = (conventionalChangelog as any)({
            preset: 'angular',
            tagPrefix: 'v'
        }, {}, {
            path: monorepoInfo.rootDir
        });

        changelogStream.on('data', (chunk: Buffer) => {
            changelogContent += chunk.toString();
        });

        changelogStream.on('end', () => resolve(changelogContent));
        changelogStream.on('error', (err: Error) => reject(err));
    });
}