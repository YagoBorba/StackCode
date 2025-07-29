import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import { Bumper } from 'conventional-recommended-bump';
import conventionalChangelog from 'conventional-changelog-core';
import { runCommand } from './git-utils.js';
// --- FUNÇÕES AUXILIARES INTERNAS ---
async function _safeReadJson(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
async function _findPackagePaths(rootDir, rootPackageJson) {
    const packagePaths = [];
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
            }
            catch (error) { }
        }
        else {
            packagePaths.push(path.join(rootDir, pattern));
        }
    }
    return packagePaths;
}
// --- FUNÇÕES EXPORTADAS PRINCIPAIS ---
export async function detectVersioningStrategy(startPath) {
    const rootDir = startPath;
    const rootPackageJsonPath = path.join(rootDir, 'package.json');
    const rootPackageJson = await _safeReadJson(rootPackageJsonPath);
    if (!rootPackageJson) {
        return { strategy: 'unknown', rootDir, packages: [] };
    }
    const rootVersion = rootPackageJson.version;
    const packagePaths = await _findPackagePaths(rootDir, rootPackageJson);
    const packagePromises = packagePaths.map(async (pkgPath) => {
        const pkgJsonPath = path.join(pkgPath, 'package.json');
        const pkgJson = await _safeReadJson(pkgJsonPath);
        if (pkgJson?.name) {
            const packageInfo = { name: pkgJson.name, version: pkgJson.version, path: pkgPath };
            return packageInfo;
        }
        return null;
    });
    const packages = (await Promise.all(packagePromises)).filter((p) => p !== null);
    if (!rootVersion || packages.length === 0 || packages.some(p => p.version !== rootVersion)) {
        return { strategy: 'independent', rootDir, rootVersion, packages };
    }
    return { strategy: 'locked', rootDir, rootVersion, packages };
}
export async function getRecommendedBump(projectRoot) {
    const bumper = new Bumper(projectRoot).loadPreset('angular');
    const recommendation = await bumper.bump();
    return recommendation?.releaseType || 'patch';
}
export async function updateAllVersions(monorepoInfo, newVersion) {
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
export async function determinePackageBumps(changedPackages) {
    const bumpInfoPromises = changedPackages.map(async (pkg) => {
        const projectRoot = pkg.path;
        const currentVersion = pkg.version || '0.0.0';
        const bumpType = await getRecommendedBump(projectRoot);
        const newVersion = semver.inc(currentVersion, bumpType);
        if (!newVersion) {
            return null;
        }
        return { pkg, bumpType, newVersion };
    });
    const results = await Promise.all(bumpInfoPromises);
    return results.filter((info) => info !== null);
}
export function generateChangelog(monorepoInfo, pkgInfo) {
    return new Promise((resolve, reject) => {
        let changelogContent = '';
        const options = { preset: 'angular', tagPrefix: 'v' };
        const context = {};
        const gitRawCommitsOpts = {
            path: pkgInfo ? pkgInfo.pkg.path : monorepoInfo.rootDir,
        };
        const changelogStream = conventionalChangelog(options, context, gitRawCommitsOpts);
        changelogStream.on('data', (chunk) => changelogContent += chunk.toString());
        changelogStream.on('end', () => resolve(changelogContent));
        changelogStream.on('error', (err) => reject(err));
    });
}
export async function updatePackageVersion(pkgInfo) {
    const pkgJsonPath = path.join(pkgInfo.pkg.path, 'package.json');
    const pkgJson = await _safeReadJson(pkgJsonPath);
    if (pkgJson) {
        pkgJson.version = pkgInfo.newVersion;
        await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
    }
}
export async function commitAndTagPackage(pkgInfo, projectRoot) {
    const packageName = pkgInfo.pkg.name.split('/')[1] || pkgInfo.pkg.name;
    const tagName = `${packageName}@${pkgInfo.newVersion}`;
    const commitMessage = `chore(release): release ${tagName}`;
    const pkgJsonPath = path.join(pkgInfo.pkg.path, 'package.json');
    const changelogPath = path.join(pkgInfo.pkg.path, 'CHANGELOG.md');
    await runCommand(`git add ${pkgJsonPath} ${changelogPath}`, projectRoot);
    await runCommand(`git commit -m "${commitMessage}"`, projectRoot);
    await runCommand(`git tag ${tagName}`, projectRoot);
}
