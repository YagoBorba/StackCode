import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
import { runReleaseWorkflow, createGitHubRelease, getCommandOutput, getErrorMessage, } from "@stackcode/core";
import { CLIAuthManager, getCurrentRepository } from "../services/githubAuth.js";
async function handleGitHubReleaseCreation(params, authManager) {
    const shouldCreateRelease = await ui.promptToCreateGitHubRelease();
    if (!shouldCreateRelease)
        return;
    const token = await resolveGitHubToken(authManager);
    if (!token) {
        ui.log.warning(t("github.auth.not_authenticated"));
        return;
    }
    try {
        const repository = params.githubInfo ??
            getCurrentRepository({ cwd: params.cwd }) ??
            (await fallbackResolveRepository(params.cwd));
        if (!repository) {
            throw new Error("Could not detect GitHub repository");
        }
        const { owner, repo } = repository;
        await createGitHubRelease({
            owner,
            repo,
            tagName: params.tagName,
            releaseNotes: params.releaseNotes,
            token,
        });
    }
    catch (error) {
        ui.log.error(`\n${t("common.error_generic")}`);
        const errorMessage = getErrorMessage(error);
        ui.log.gray(errorMessage);
        if (errorMessage.toLowerCase().includes("bad credentials")) {
            authManager.removeToken();
            ui.log.warning("Your saved GitHub token was invalid and has been cleared.");
        }
    }
}
async function resolveGitHubToken(authManager) {
    const storedToken = authManager.getToken();
    if (storedToken) {
        const isValid = await authManager.validateToken(storedToken);
        if (isValid) {
            return storedToken;
        }
        authManager.removeToken();
        ui.log.warning(t("github.auth.token_invalid"));
    }
    const token = (await ui.promptForToken()).trim();
    if (!token) {
        return null;
    }
    const isValid = await authManager.validateToken(token);
    if (!isValid) {
        ui.log.error(`❌ ${t("github.auth.token_invalid_error")}`);
        return null;
    }
    const shouldPersist = await ui.promptToSaveToken();
    if (shouldPersist) {
        authManager.saveToken(token);
    }
    return token;
}
async function fallbackResolveRepository(cwd) {
    try {
        const remoteUrl = (await getCommandOutput("git", ["remote", "get-url", "origin"], { cwd })).trim();
        const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
        if (!match) {
            return null;
        }
        const [owner, repoWithSuffix] = match[1].split("/");
        const repo = repoWithSuffix.replace(/\.git$/, "");
        return { owner, repo, remoteUrl };
    }
    catch {
        return null;
    }
}
export const getReleaseCommand = () => ({
    command: "release",
    describe: t("release.command_description"),
    builder: {},
    handler: async () => {
        try {
            const cwd = process.cwd();
            const authManager = new CLIAuthManager();
            ui.log.step(t("release.start"));
            const releaseHooks = {
                onProgress: async (progress) => {
                    await handleProgress(progress);
                },
                confirmLockedRelease: ({ currentVersion, newVersion }) => ui.promptForLockedRelease(currentVersion, newVersion),
                displayIndependentPlan: (plan) => {
                    ui.displayIndependentReleasePlan(plan);
                },
                confirmIndependentRelease: () => ui.promptForIndependentRelease(),
            };
            const result = await runReleaseWorkflow({ cwd }, releaseHooks);
            if (result.strategy !== "unknown") {
                ui.log.info(t("release.detected_strategy", { strategy: result.strategy }));
            }
            if (result.status === "cancelled") {
                await handleCancelledRelease(result);
                return;
            }
            await handlePreparedRelease(result);
            if (result.tagName && result.releaseNotes) {
                await handleGitHubReleaseCreation({
                    tagName: result.tagName,
                    releaseNotes: result.releaseNotes,
                    cwd,
                    githubInfo: result.github,
                }, authManager);
            }
        }
        catch (error) {
            ui.log.error(`\n${t("common.error_unexpected")}`);
            ui.log.gray(getErrorMessage(error));
            process.exit(1);
        }
    },
});
async function handleProgress(progress) {
    const messages = {
        lockedUpdatingVersions: () => ui.log.step(t("release.step_updating_versions")),
        lockedGeneratingChangelog: () => ui.log.step(t("release.step_generating_changelog")),
        independentFindingChanges: () => ui.log.info(t("release.independent_mode_start")),
        independentUpdatingPackages: () => ui.log.step(t("release.step_updating_version")),
        independentCommitting: () => ui.log.step(t("release.step_committing_and_tagging")),
    };
    const handler = messages[progress.step];
    if (handler)
        handler();
}
async function handleCancelledRelease(result) {
    switch (result.reason) {
        case "invalid-structure":
            ui.log.error(t("release.error_structure"));
            process.exit(1);
            break;
        case "no-changes":
            ui.log.success(t("release.independent_mode_no_changes"));
            break;
        case "no-bumps":
            ui.log.warning(t("release.independent_mode_no_bumps"));
            break;
        case "cancelled-by-user":
            ui.log.warning(t("common.operation_cancelled"));
            break;
        case "error":
        default:
            ui.log.error(`\n${t("common.error_generic")}`);
            if (result.error) {
                ui.log.gray(result.error);
            }
            process.exit(1);
    }
}
async function handlePreparedRelease(result) {
    if (result.strategy === "locked") {
        ui.log.success(`\n${t("release.success_ready_to_commit")}`);
        ui.log.warning(`  ${t("release.next_steps_commit")}`);
        return;
    }
    if (result.strategy === "independent") {
        ui.log.success(`\n${t("release.independent_success")}`);
        ui.log.warning(`  ${t("release.next_steps_push")}`);
    }
}
//# sourceMappingURL=release.js.map