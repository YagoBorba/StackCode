import path from "path";
import fs from "fs/promises";
import semver from "semver";
import Configstore from "configstore";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
import { detectVersioningStrategy, findChangedPackages, determinePackageBumps, updatePackageVersion, updateAllVersions, generateChangelog, getRecommendedBump, performReleaseCommit, createGitHubRelease, getCommandOutput, getErrorMessage, } from "@stackcode/core";
const config = new Configstore("@stackcode/cli", { github_token: "" });
async function handleGitHubReleaseCreation(tagName, releaseNotes) {
    const shouldCreateRelease = await ui.promptToCreateGitHubRelease();
    if (!shouldCreateRelease)
        return;
    let token = config.get("github_token");
    if (!token) {
        token = await ui.promptForToken();
        if (await ui.promptToSaveToken()) {
            config.set("github_token", token);
        }
    }
    try {
        const remoteUrl = await getCommandOutput("git", ["remote", "get-url", "origin"], { cwd: process.cwd() });
        const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
        if (!match)
            throw new Error("Could not parse GitHub owner/repo from remote URL.");
        const [owner, repo] = match[1].replace(".git", "").split("/");
        await createGitHubRelease({ owner, repo, tagName, releaseNotes, token });
    }
    catch (error) {
        ui.log.error(`\n${t("common.error_generic")}`);
        const errorMessage = getErrorMessage(error);
        ui.log.gray(errorMessage);
        if (errorMessage.toLowerCase().includes("bad credentials")) {
            config.delete("github_token");
            ui.log.warning("Your saved GitHub token was invalid and has been cleared.");
        }
    }
}
async function handleLockedRelease(monorepoInfo) {
    const bumpType = await getRecommendedBump(monorepoInfo.rootDir);
    const currentVersion = monorepoInfo.rootVersion || "0.0.0";
    const newVersion = semver.inc(currentVersion, bumpType);
    if (!newVersion) {
        ui.log.error(t("release.error_calculating_version"));
        return;
    }
    const confirm = await ui.promptForLockedRelease(currentVersion, newVersion);
    if (!confirm) {
        ui.log.warning(t("common.operation_cancelled"));
        return;
    }
    ui.log.step(t("release.step_updating_versions"));
    await updateAllVersions(monorepoInfo, newVersion);
    ui.log.step(t("release.step_generating_changelog"));
    const changelog = await generateChangelog(monorepoInfo);
    const changelogPath = path.join(monorepoInfo.rootDir, "CHANGELOG.md");
    const existing = await fs.readFile(changelogPath, "utf-8").catch(() => "");
    await fs.writeFile(changelogPath, `${changelog}\n${existing}`);
    ui.log.success(`\n${t("release.success_ready_to_commit")}`);
    ui.log.warning(`  ${t("release.next_steps_commit")}`);
    await handleGitHubReleaseCreation(`v${newVersion}`, changelog);
}
async function handleIndependentRelease(monorepoInfo) {
    const changedPackages = await findChangedPackages(monorepoInfo.packages, monorepoInfo.rootDir);
    if (changedPackages.length === 0) {
        ui.log.success(t("release.independent_mode_no_changes"));
        return;
    }
    const packagesToUpdate = await determinePackageBumps(changedPackages);
    if (packagesToUpdate.length === 0) {
        ui.log.warning(t("release.independent_mode_no_bumps"));
        return;
    }
    ui.displayIndependentReleasePlan(packagesToUpdate);
    const confirm = await ui.promptForIndependentRelease();
    if (!confirm) {
        ui.log.warning(t("common.operation_cancelled"));
        return;
    }
    const allChangelogs = [];
    for (const pkgInfo of packagesToUpdate) {
        await updatePackageVersion(pkgInfo);
        const changelogContent = await generateChangelog(monorepoInfo, pkgInfo);
        const changelogPath = path.join(pkgInfo.pkg.path, "CHANGELOG.md");
        const existing = await fs.readFile(changelogPath, "utf-8").catch(() => "");
        await fs.writeFile(changelogPath, `${changelogContent}\n${existing}`);
        allChangelogs.push({
            header: `### 🎉 Release for ${pkgInfo.pkg.name}@${pkgInfo.newVersion}`,
            content: changelogContent,
        });
    }
    await performReleaseCommit(packagesToUpdate, monorepoInfo.rootDir);
    ui.log.success(`\n${t("release.independent_success")}`);
    const combinedNotes = allChangelogs
        .map((c) => `${c.header}\n\n${c.content}`)
        .join("\n\n");
    const primaryPackage = packagesToUpdate.find((p) => p.pkg.name === "@stackcode/cli") ||
        packagesToUpdate[0];
    const tagName = `${primaryPackage.pkg.name.split("/")[1] || primaryPackage.pkg.name}@${primaryPackage.newVersion}`;
    await handleGitHubReleaseCreation(tagName, combinedNotes);
    ui.log.warning(`  ${t("release.next_steps_push")}`);
}
export const getReleaseCommand = () => ({
    command: "release",
    describe: t("release.command_description"),
    builder: {},
    handler: async () => {
        try {
            ui.log.step(t("release.start"));
            const monorepoInfo = await detectVersioningStrategy(process.cwd());
            if (monorepoInfo.strategy === "unknown") {
                throw new Error(t("release.error_structure"));
            }
            ui.log.info(t("release.detected_strategy", { strategy: monorepoInfo.strategy }));
            if (monorepoInfo.strategy === "locked") {
                await handleLockedRelease(monorepoInfo);
            }
            else if (monorepoInfo.strategy === "independent") {
                await handleIndependentRelease(monorepoInfo);
            }
        }
        catch (error) {
            ui.log.error(`\n${t("common.error_unexpected")}`);
            ui.log.gray(getErrorMessage(error));
            process.exit(1);
        }
    },
});
//# sourceMappingURL=release.js.map