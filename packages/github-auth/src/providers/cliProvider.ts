import { Octokit as OctokitClient } from "@octokit/rest";
import type { Octokit } from "@octokit/rest";
import type {
	GitHubAuthContext,
	GitHubAuthLoginOptions,
	GitHubAuthProvider,
	GitHubAuthSession,
	GitHubAuthenticatedUser,
	TokenStorage,
} from "../types.js";

/**
 * Additional configuration accepted by {@link createCLIAuthProvider}.
 */
export interface CLIAuthProviderOptions {
	/** Storage implementation responsible for persisting the token. */
	storage: TokenStorage;
	/**
	 * Factory used to instantiate Octokit clients. Exposed for testing so the HTTP
	 * layer can be mocked easily.
	 */
	octokitFactory?: (token: string) => Octokit;
	/** Optional provider identifier added to the exported session. */
	providerId?: string;
	/** Optional fixed scopes associated with the stored token. */
	scopes?: readonly string[];
}

/** Default provider identifier for the CLI environment. */
const DEFAULT_PROVIDER_ID = "cli";

/**
 * Creates a GitHub auth provider backed by personal access tokens stored in the
 * local filesystem for the StackCode CLI.
 */
export function createCLIAuthProvider(
	options: CLIAuthProviderOptions,
): GitHubAuthProvider {
			const octokitFactory: (token: string) => Octokit =
				options.octokitFactory ?? ((token: string) => new OctokitClient({ auth: token }));

	let cachedContext: GitHubAuthContext | null = null;

	/**
	 * Materializes an authenticated context by calling GitHub's `getAuthenticated`
	 * endpoint. The result is cached to avoid redundant network calls.
	 */
		const resolveContext = async (
			token: string,
			cache = true,
		): Promise<GitHubAuthContext> => {
			if (cache && cachedContext && cachedContext.session.accessToken === token) {
			return cachedContext;
		}

		const client = octokitFactory(token);
		const userResponse = await client.users.getAuthenticated();
		const payload = userResponse.data as unknown as GitHubAuthenticatedUser;

		const session: GitHubAuthSession = {
			accessToken: token,
			providerId: options.providerId ?? DEFAULT_PROVIDER_ID,
			scopes: options.scopes,
			account: {
				username: payload.login,
				displayName: payload.name ?? undefined,
				email: payload.email ?? null,
				id: String(payload.id),
			},
		};

			const context: GitHubAuthContext = { session, client };
			if (cache) {
				cachedContext = context;
			}
			return context;
	};

	const readToken = async (): Promise<string | null> => {
		if (cachedContext) {
			return cachedContext.session.accessToken;
		}
		return options.storage.read();
	};

	return {
		/** @inheritdoc */
		async login(
			loginOptions?: GitHubAuthLoginOptions,
		): Promise<GitHubAuthContext> {
			const providedToken = loginOptions?.token;

			const token =
				providedToken ??
				(await readToken()) ??
				(() => {
					throw new Error("GitHub token not found. Provide a token to login.");
				})();

			const context = await resolveContext(token);

			const shouldPersist =
				loginOptions?.persist ?? Boolean(providedToken && providedToken !== "");
			if (shouldPersist) {
				await options.storage.write(token);
			}

			return context;
		},

		/** @inheritdoc */
		async logout(): Promise<void> {
			cachedContext = null;
			await options.storage.clear();
		},

		/** @inheritdoc */
		async getSession(): Promise<GitHubAuthContext | null> {
			const token = await readToken();
			if (!token) {
				cachedContext = null;
				return null;
			}

					try {
						return await resolveContext(token);
					} catch {
						await options.storage.clear();
						cachedContext = null;
						return null;
					}
		},

		/** @inheritdoc */
		async getStoredToken(): Promise<string | null> {
			return readToken();
		},

		/** @inheritdoc */
		async saveToken(token: string): Promise<void> {
			cachedContext = null;
			await options.storage.write(token);
		},

		/** @inheritdoc */
		async removeToken(): Promise<void> {
			cachedContext = null;
			await options.storage.clear();
		},

		/** @inheritdoc */
		async validateToken(token: string): Promise<boolean> {
					try {
						await resolveContext(token, false);
				return true;
			} catch {
				cachedContext = null;
				return false;
			}
		},
	};
}
