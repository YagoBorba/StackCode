import { runCommand, getCommandOutput } from "../utils.js";

export type CommitWorkflowStep =
	| "checkingStaged"
	| "buildingMessage"
	| "committing"
	| "completed";

export interface CommitWorkflowProgress {
	step: CommitWorkflowStep;
	message?: string;
}

/**
 * Configuration options for the commit workflow.
 */
export interface CommitWorkflowOptions {
	cwd: string;
	type: string;
	scope?: string;
	shortDescription: string;
	longDescription?: string;
	breakingChanges?: string;
	affectedIssues?: string;
}

/**
 * Hooks for progress reporting during the commit workflow.
 */
export interface CommitWorkflowHooks {
	onProgress?(progress: CommitWorkflowProgress): Promise<void> | void;
}

/**
 * Result of the commit workflow execution.
 */
export interface CommitWorkflowResult {
	status: "committed" | "cancelled";
	reason?: "no-staged-changes" | "error";
	message?: string;
	error?: string;
}

/**
 * Executes the commit workflow with the provided options.
 * Creates a conventional commit with the given type, scope, description, body, and footers.
 *
 * @param options - Configuration options for the commit workflow
 * @param hooks - Optional hooks for progress reporting
 * @returns Promise resolving to the workflow result
 */
export async function runCommitWorkflow(
	options: CommitWorkflowOptions,
	hooks: CommitWorkflowHooks = {},
): Promise<CommitWorkflowResult> {
	const report = async (p: CommitWorkflowProgress) =>
		hooks.onProgress ? hooks.onProgress(p) : undefined;

	try {
		await report({ step: "checkingStaged" });
		const status = await getCommandOutput("git", ["status", "--porcelain"], {
			cwd: options.cwd,
		});
		if (!status) {
			return { status: "cancelled", reason: "no-staged-changes" };
		}

		await report({ step: "buildingMessage" });
		let msg = `${options.type}`;
		if (options.scope) msg += `(${options.scope.trim()})`;
		msg += `: ${options.shortDescription.trim()}`;

		if (options.longDescription) {
			const body = options.longDescription.replace(/\|/g, "\n");
			msg += `\n\n${body}`;
		}
		if (options.breakingChanges) {
			msg += `\n\nBREAKING CHANGE: ${options.breakingChanges.trim()}`;
		}
		if (options.affectedIssues) {
			msg += `\n\n${options.affectedIssues.trim()}`;
		}

		await report({ step: "committing", message: msg });
		await runCommand("git", ["commit", "-m", msg], { cwd: options.cwd });

		await report({ step: "completed" });
		return { status: "committed", message: msg };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e ?? "error");
		return { status: "cancelled", reason: "error", error: err };
	}
}

export type GitStartWorkflowStep =
	| "switchingBase"
	| "pullingBase"
	| "creatingBranch"
	| "completed";

export interface GitStartWorkflowProgress {
	step: GitStartWorkflowStep;
	message?: string;
}

/**
 * Configuration options for starting a Git workflow.
 */
export interface GitStartWorkflowOptions {
	cwd: string;
	branchName: string;
	branchType: string;
	baseBranch?: string;
}

/**
 * Hooks for progress reporting during the Git start workflow.
 */
export interface GitStartWorkflowHooks {
	onProgress?(progress: GitStartWorkflowProgress): Promise<void> | void;
}

/**
 * Result of the Git start workflow execution.
 */
export interface GitStartWorkflowResult {
	status: "created" | "cancelled";
	fullBranchName?: string;
	error?: string;
}

/**
 * Starts a new Git branch workflow (feature, bugfix, hotfix, release).
 * Creates and switches to a new branch with the specified name and type.
 *
 * @param options - Configuration options for starting the Git workflow
 * @param hooks - Optional hooks for progress reporting
 * @returns Promise resolving to the workflow result
 */
export async function runGitStartWorkflow(
	options: GitStartWorkflowOptions,
	hooks: GitStartWorkflowHooks = {},
): Promise<GitStartWorkflowResult> {
	const report = async (p: GitStartWorkflowProgress) =>
		hooks.onProgress ? hooks.onProgress(p) : undefined;

	const base = options.baseBranch || "develop";
	const full = `${options.branchType}/${options.branchName}`;
	try {
		await report({ step: "switchingBase", message: base });
		await runCommand("git", ["checkout", base], { cwd: options.cwd });
		await report({ step: "pullingBase", message: base });
		await runCommand("git", ["pull", "origin", base], { cwd: options.cwd });
		await report({ step: "creatingBranch", message: full });
		await runCommand("git", ["checkout", "-b", full], { cwd: options.cwd });
		await report({ step: "completed" });
		return { status: "created", fullBranchName: full };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e ?? "error");
		return { status: "cancelled", error: err };
	}
}

export type GitFinishWorkflowStep = "pushing" | "computingPrUrl" | "completed";

export interface GitFinishWorkflowProgress {
	step: GitFinishWorkflowStep;
	message?: string;
}

/**
 * Configuration options for finishing a Git workflow.
 */
export interface GitFinishWorkflowOptions {
	cwd: string;
}

/**
 * Hooks for progress reporting during the Git finish workflow.
 */
export interface GitFinishWorkflowHooks {
	onProgress?(progress: GitFinishWorkflowProgress): Promise<void> | void;
}

/**
 * Result of the Git finish workflow execution.
 */
export interface GitFinishWorkflowResult {
	status: "pushed" | "cancelled";
	branch?: string;
	prUrl?: string;
	error?: string;
}

/**
 * Finishes a Git branch workflow by pushing the branch and computing a PR URL.
 * Typically used for feature, bugfix, or hotfix branches.
 *
 * @param options - Configuration options for finishing the Git workflow
 * @param hooks - Optional hooks for progress reporting
 * @returns Promise resolving to the workflow result
 */
export async function runGitFinishWorkflow(
	options: GitFinishWorkflowOptions,
	hooks: GitFinishWorkflowHooks = {},
): Promise<GitFinishWorkflowResult> {
	const report = async (p: GitFinishWorkflowProgress) =>
		hooks.onProgress ? hooks.onProgress(p) : undefined;

	try {
		const currentBranch = await getCommandOutput(
			"git",
			["branch", "--show-current"],
			{ cwd: options.cwd },
		);
		if (!currentBranch) {
			return { status: "cancelled", error: "not-on-branch" };
		}
		await report({ step: "pushing", message: currentBranch });
		await runCommand(
			"git",
			["push", "--set-upstream", "origin", currentBranch],
			{ cwd: options.cwd },
		);
		await report({ step: "computingPrUrl" });
		const remoteUrl = await getCommandOutput(
			"git",
			["remote", "get-url", "origin"],
			{ cwd: options.cwd },
		);
		const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
		const repoPath = match ? match[1].replace(".git", "") : null;
		const prUrl = repoPath
			? `https://github.com/${repoPath}/pull/new/${currentBranch}`
			: undefined;
		await report({ step: "completed" });
		return { status: "pushed", branch: currentBranch, prUrl };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e ?? "error");
		return { status: "cancelled", error: err };
	}
}
