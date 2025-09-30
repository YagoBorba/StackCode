import type { Octokit } from "@octokit/rest";

/**
 * Represents a standardized GitHub authentication session shared across environments.
 */
export interface GitHubAuthSession {
	/** Raw access token returned by GitHub. */
	accessToken: string;
	/** Identifier of the provider that issued the session (e.g. `cli`, `vscode`). */
	providerId: string;
	/** Optional list of scopes that were granted to the token. */
	scopes?: readonly string[];
	/** Optional metadata describing the authenticated account. */
	account?: {
		/** Friendly label or username shown to the user. */
		username?: string;
		/** Display name when available. */
		displayName?: string;
		/** Primary e-mail if exposed by the API. */
		email?: string | null;
		/** Unique account identifier returned by GitHub. */
		id?: string;
	};
	/** Arbitrary provider-specific data. */
	metadata?: Record<string, unknown>;
}

/**
 * Aggregates the current GitHub session with an authenticated Octokit instance.
 */
export interface GitHubAuthContext {
	/** Authentication session metadata. */
	session: GitHubAuthSession;
	/** Authenticated Octokit client ready for GitHub calls. */
	client: Octokit;
}

/**
 * Optional settings that fine tune the login flow for different providers.
 */
export interface GitHubAuthLoginOptions {
	/**
	 * Raw token value provided by the caller. Providers may ignore this field when
	 * they fully control the OAuth flow (e.g. VS Code).
	 */
	token?: string;
	/** When true, providers should persist the token using their configured storage. */
	persist?: boolean;
	/** Force-refreshes the session even if a cached value exists. */
	forceRefresh?: boolean;
	/** Signals that an interactive flow is allowed (e.g. device code, OAuth UI). */
	interactive?: boolean;
}

/**
 * Defines the minimal contract any GitHub auth provider must fulfill so the
 * unified API can orchestrate authentication consistently across environments.
 */
export interface GitHubAuthProvider {
	/** Performs the environment-specific login flow and returns the new context. */
	login(options?: GitHubAuthLoginOptions): Promise<GitHubAuthContext>;
	/** Clears tokens, sessions, and cached state. */
	logout(): Promise<void>;
	/** Attempts to restore a cached session (without user interaction whenever possible). */
	getSession(): Promise<GitHubAuthContext | null>;
	/** Optional hook for retrieving the persisted raw token, when applicable. */
	getStoredToken?(): Promise<string | null>;
	/** Optional hook for persisting a token without triggering a login flow. */
	saveToken?(token: string): Promise<void>;
	/** Optional hook for removing persisted tokens without a full logout. */
	removeToken?(): Promise<void>;
	/** Optional hook used to validate arbitrary tokens. */
	validateToken?(token: string): Promise<boolean>;
}

/**
 * Storage abstraction that makes token persistence pluggable and testable.
 */
export interface TokenStorage {
	/** Reads a token from the underlying storage or returns null when empty. */
	read(): Promise<string | null>;
	/** Writes or overwrites the stored token. */
	write(token: string): Promise<void>;
	/** Deletes the stored token and related metadata. */
	clear(): Promise<void>;
}

/**
 * Configuration used when instantiating the GitHub auth facade.
 */
export interface GitHubAuthOptions {
	/** Provider responsible for executing the concrete login/logout logic. */
	provider: GitHubAuthProvider;
}

/**
 * Public facade consumed by StackCode packages.
 */
export interface GitHubAuthInstance {
	/** Runs the login flow and caches the resulting session and client. */
	login(options?: GitHubAuthLoginOptions): Promise<GitHubAuthContext>;
	/** Clears cached state and invokes the provider logout logic. */
	logout(): Promise<void>;
	/** Returns the cached session or attempts to restore one from the provider. */
	getSession(options?: { forceRefresh?: boolean }): Promise<GitHubAuthContext | null>;
	/** Returns an authenticated Octokit client, ensuring the user is logged in. */
	getAuthenticatedClient(): Promise<Octokit>;
	/** Helper flag to quickly check whether a valid session is cached. */
	isAuthenticated(): boolean;
	/** Retrieves the raw persisted token when available. */
	getStoredToken(): Promise<string | null>;
	/** Persists the provided token without triggering additional validations. */
	saveToken(token: string): Promise<void>;
	/** Removes any persisted tokens from storage. */
	removeToken(): Promise<void>;
	/** Validates an arbitrary token against the provider's rules. */
	validateToken(token: string): Promise<boolean>;
}

/**
 * Common metadata returned by the GitHub REST API when requesting the
 * authenticated user. Declared separately to simplify stubbing in tests.
 */
export interface GitHubAuthenticatedUser {
	id: number;
	login: string;
	name?: string | null;
	email?: string | null;
}
