import { Octokit } from "@octokit/rest";
/**
 * Busca issues de um repositório GitHub
 *
 * @param octokit - Cliente Octokit autenticado
 * @param options - Opções de busca
 * @returns Promise com array de issues formatadas
 */
export async function fetchRepositoryIssues(octokit, options) {
    const { owner, repo, state = "open", assignee, labels, sort = "updated", direction = "desc", per_page = 30, } = options;
    console.log(`[Core] Fetching issues for ${owner}/${repo}...`);
    try {
        const response = await octokit.issues.listForRepo({
            owner,
            repo,
            state,
            assignee,
            labels,
            sort,
            direction,
            per_page,
        });
        // Filtrar apenas issues (não pull requests)
        const issues = response.data.filter(issue => !issue.pull_request);
        console.log(`[Core] Found ${issues.length} issues`);
        return issues.map(issue => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body || null,
            state: issue.state,
            html_url: issue.html_url,
            user: {
                login: issue.user?.login || "unknown",
                avatar_url: issue.user?.avatar_url || "",
            },
            assignees: issue.assignees?.map(assignee => ({
                login: assignee?.login || "unknown",
                avatar_url: assignee?.avatar_url || "",
            })) || [],
            labels: issue.labels?.map(label => ({
                name: typeof label === "string" ? label : label.name || "",
                color: typeof label === "string" ? "000000" : label.color || "000000",
                description: typeof label === "string" ? null : label.description || null,
            })) || [],
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            closed_at: issue.closed_at,
        }));
    }
    catch (error) {
        console.error(`[Core] Failed to fetch issues for ${owner}/${repo}:`, error);
        throw new Error(`Failed to fetch repository issues: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
export async function createGitHubRelease(options) {
    const { owner, repo, tagName, releaseNotes, token } = options;
    const octokit = new Octokit({ auth: token });
    console.log(`Creating GitHub release for tag ${tagName}...`);
    await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: `Release ${tagName}`,
        body: releaseNotes,
        prerelease: false,
    });
    console.log("✅ GitHub release created successfully!");
}
//# sourceMappingURL=github.js.map