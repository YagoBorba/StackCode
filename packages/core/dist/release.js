import fs from "fs/promises";
import path from "path";
import semver from "semver";
import { Bumper } from "conventional-recommended-bump";
import conventionalChangelog from "conventional-changelog-core";
import { getCommandOutput, runCommand } from "./utils.js";
async function _safeReadJson(filePath) {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
async function _findPackagePaths(rootDir, rootPackageJson) {
    const packagePaths = [];
    let workspaces;
    if (Array.isArray(rootPackageJson.workspaces)) {
        workspaces = rootPackageJson.workspaces;
    }
    else if (rootPackageJson.workspaces?.packages) {
        workspaces = rootPackageJson.workspaces.packages;
    }
    else {
        workspaces = ["packages/*"];
    }
    for (const pattern of workspaces) {
        if (pattern.endsWith("/*")) {
            const baseDir = path.join(rootDir, pattern.replace("/*", ""));
            try {
                const entries = await fs.readdir(baseDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const pkgJsonPath = path.join(baseDir, entry.name, "package.json");
                        try {
                            await fs.access(pkgJsonPath);
                            packagePaths.push(path.join(baseDir, entry.name));
                        }
                        catch {
                            // Ignore if package.json doesn't exist
                        }
                    }
                }
            }
            catch {
                // Ignore if directory doesn't exist
            }
        }
        else {
            packagePaths.push(path.join(rootDir, pattern));
        }
    }
    return packagePaths;
}
async function _getLatestTags(packageNames, projectRoot) {
    const tagMap = new Map();
    try {
        const allTags = await getCommandOutput("git", ["tag", "--list", "*@*"], {
            cwd: projectRoot,
        });
        const tagLines = allTags.split("\n").filter(Boolean);
        for (const pkgName of packageNames) {
            const shortName = pkgName.split("/")[1] || pkgName;
            const pkgTags = tagLines
                .filter((tag) => tag.startsWith(`${shortName}@`))
                .sort(semver.rcompare);
            if (pkgTags.length > 0) {
                tagMap.set(pkgName, pkgTags[0]);
            }
        }
    }
    catch {
        // Ignore git command errors
    }
    return tagMap;
}
export async function detectVersioningStrategy(startPath) {
    const rootDir = startPath;
    const rootPackageJsonPath = path.join(rootDir, "package.json");
    const rootPackageJson = await _safeReadJson(rootPackageJsonPath);
    if (!rootPackageJson) {
        return { strategy: "unknown", rootDir, packages: [] };
    }
    const rootVersion = rootPackageJson.version;
    const packagePaths = await _findPackagePaths(rootDir, rootPackageJson);
    const packagePromises = packagePaths.map(async (pkgPath) => {
        const pkgJson = await _safeReadJson(path.join(pkgPath, "package.json"));
        return pkgJson?.name
            ? { name: pkgJson.name, version: pkgJson.version, path: pkgPath }
            : null;
    });
    const packages = (await Promise.all(packagePromises)).filter((p) => p !== null);
    if (!rootVersion || packages.some((p) => p.version !== rootVersion)) {
        return { strategy: "independent", rootDir, rootVersion, packages };
    }
    return { strategy: "locked", rootDir, rootVersion, packages };
}
export async function findChangedPackages(allPackages, projectRoot) {
    const packageNames = allPackages.map((p) => p.name);
    const latestTags = await _getLatestTags(packageNames, projectRoot);
    if (latestTags.size === 0) {
        return allPackages;
    }
    const changedFilesOutput = await getCommandOutput("git", ["diff", "--name-only", "HEAD", ...latestTags.values()], { cwd: projectRoot });
    const changedFiles = new Set(changedFilesOutput.split("\n"));
    return allPackages.filter((pkg) => {
        const relativePkgPath = path
            .relative(projectRoot, pkg.path)
            .replace(/\\/g, "/");
        for (const file of changedFiles) {
            if (file.startsWith(relativePkgPath))
                return true;
        }
        return !latestTags.has(pkg.name);
    });
}
export async function getRecommendedBump(projectRoot) {
    const bumper = new Bumper(projectRoot).loadPreset("angular");
    const recommendation = await bumper.bump();
    return recommendation?.releaseType || "patch";
}
export async function determinePackageBumps(changedPackages) {
    const bumpInfoPromises = changedPackages.map(async (pkg) => {
        const bumpType = await getRecommendedBump(pkg.path);
        const newVersion = semver.inc(pkg.version || "0.0.0", bumpType);
        return newVersion ? { pkg, bumpType, newVersion } : null;
    });
    const results = await Promise.all(bumpInfoPromises);
    return results.filter((info) => info !== null);
}
export function generateChangelog(monorepoInfo, pkgInfo) {
    return new Promise((resolve, reject) => {
        let changelogContent = "";
        const shortName = pkgInfo?.pkg.name.split("/")[1] || pkgInfo?.pkg.name;
        const tagPrefix = pkgInfo ? `${shortName}@` : "v";
        const options = { preset: "angular", tagPrefix };
        const gitRawCommitsOpts = {
            path: pkgInfo ? pkgInfo.pkg.path : monorepoInfo.rootDir,
        };
        const stream = conventionalChangelog(options, {}, gitRawCommitsOpts);
        stream.on("data", (chunk) => (changelogContent += chunk.toString()));
        stream.on("end", () => resolve(changelogContent));
        stream.on("error", reject);
    });
}
export async function updatePackageVersion(pkgInfo) {
    const pkgJsonPath = path.join(pkgInfo.pkg.path, "package.json");
    const pkgJson = await _safeReadJson(pkgJsonPath);
    if (pkgJson) {
        pkgJson.version = pkgInfo.newVersion;
        await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
    }
}
export async function updateAllVersions(monorepoInfo, newVersion) {
    const allPaths = [
        path.join(monorepoInfo.rootDir, "package.json"),
        ...monorepoInfo.packages.map((pkg) => path.join(pkg.path, "package.json")),
    ];
    await Promise.all(allPaths.map(async (pkgPath) => {
        const pkgJson = await _safeReadJson(pkgPath);
        if (pkgJson) {
            pkgJson.version = newVersion;
            await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
        }
    }));
}
export async function performReleaseCommit(packages, projectRoot) {
    const filesToAdd = [];
    let commitMessage = "chore(release): release\n\n";
    for (const pkgInfo of packages) {
        const tagName = `${pkgInfo.pkg.name.split("/")[1] || pkgInfo.pkg.name}@${pkgInfo.newVersion}`;
        commitMessage += `- ${tagName}\n`;
        filesToAdd.push(path.join(pkgInfo.pkg.path, "package.json"), path.join(pkgInfo.pkg.path, "CHANGELOG.md"));
    }
    await runCommand("git", ["add", ...filesToAdd], { cwd: projectRoot });
    await runCommand("git", ["commit", "-m", commitMessage], {
        cwd: projectRoot,
    });
    for (const pkgInfo of packages) {
        const tagName = `${pkgInfo.pkg.name.split("/")[1] || pkgInfo.pkg.name}@${pkgInfo.newVersion}`;
        await runCommand("git", ["tag", tagName], { cwd: projectRoot });
    }
}
//# sourceMappingURL=release.js.map