import { Octokit as OctokitClient } from "@octokit/rest";
import type { Octokit } from "@octokit/rest";
import type {
  GitHubAuthContext,
  GitHubAuthProvider,
  GitHubAuthSession,
  GitHubAuthenticatedUser,
  TokenStorage,
} from "../types.js";
import type { ExtensionContext, AuthenticationSession } from "vscode";

type VSCodeModule = typeof import("vscode");

/**
 * Configuration accepted by {@link createVSCodeAuthProvider}.
 */
export interface VSCodeAuthProviderOptions {
  /** Reference to the VS Code API module. */
  vscode: VSCodeModule;
  /** Extension context obtained from the activation function. */
  context: ExtensionContext;
  /** OAuth scopes requested during the login flow. */
  scopes?: readonly string[];
  /** Identifier stored alongside the session metadata. */
  providerId?: string;
  /** Secret storage key used to persist the token. */
  secretKey?: string;
  /** Optional shared storage to enable cross-environment reuse. */
  sharedStorage?: TokenStorage;
  /** When true, tokens are mirrored to {@link sharedStorage}. */
  shareTokens?: boolean;
  /** Custom Octokit factory primarily for testing. */
  octokitFactory?: (token: string) => Octokit;
}

const DEFAULT_PROVIDER_ID = "vscode";
const DEFAULT_SCOPES = ["repo", "user:email"] as const;
const DEFAULT_SECRET_KEY = "stackcode.github.token";

/**
 * Creates a VS Code oriented GitHub auth provider that relies on the native
 * authentication API and secret storage services.
 */
export function createVSCodeAuthProvider(
  options: VSCodeAuthProviderOptions,
): GitHubAuthProvider {
  const providerId = options.providerId ?? DEFAULT_PROVIDER_ID;
  const scopes = options.scopes ?? DEFAULT_SCOPES;
  const secretKey = options.secretKey ?? DEFAULT_SECRET_KEY;
  const shareTokens = options.shareTokens ?? true;

  const octokitFactory: (token: string) => Octokit =
    options.octokitFactory ??
    ((token: string) => new OctokitClient({ auth: token }));

  let cachedContext: GitHubAuthContext | null = null;

  const storeToken = async (token: string): Promise<void> => {
    await options.context.secrets.store(secretKey, token);
    if (shareTokens && options.sharedStorage) {
      await options.sharedStorage.write(token);
    }
  };

  const clearToken = async (): Promise<void> => {
    await options.context.secrets.delete(secretKey);
    if (shareTokens && options.sharedStorage) {
      await options.sharedStorage.clear();
    }
  };

  const readTokenFromSecret = async (): Promise<string | null> => {
    const stored = await options.context.secrets.get(secretKey);
    if (stored) {
      return stored;
    }
    if (shareTokens && options.sharedStorage) {
      return options.sharedStorage.read();
    }
    return null;
  };

  const buildContext = async (
    token: string,
    sessionInfo?: AuthenticationSession,
    cache = true,
  ): Promise<GitHubAuthContext> => {
    if (cache && cachedContext && cachedContext.session.accessToken === token) {
      return cachedContext;
    }

    const client = octokitFactory(token);
    let userPayload: GitHubAuthenticatedUser | null = null;

    try {
      const { data } = await client.users.getAuthenticated();
      userPayload = data as unknown as GitHubAuthenticatedUser;
    } catch (error) {
      if (!sessionInfo) {
        throw error;
      }
    }

    const resolvedAccount = sessionInfo?.account;

    const session: GitHubAuthSession = {
      accessToken: token,
      providerId,
      scopes: sessionInfo?.scopes ?? scopes,
      account: {
        username: resolvedAccount?.label ?? userPayload?.login,
        displayName: userPayload?.name ?? resolvedAccount?.label,
        email: userPayload?.email ?? null,
        id: userPayload ? String(userPayload.id) : resolvedAccount?.id,
      },
      metadata: sessionInfo ? { sessionId: sessionInfo.id } : undefined,
    };

    const context: GitHubAuthContext = { session, client };
    if (cache) {
      cachedContext = context;
    }
    return context;
  };

  const getVSCodeSession = async (
    createIfNone: boolean,
  ): Promise<AuthenticationSession | null> => {
    try {
      const session = await options.vscode.authentication.getSession(
        "github",
        scopes,
        { createIfNone },
      );
      return session ?? null;
    } catch (error) {
      console.warn(
        "[StackCode] Failed to retrieve VS Code GitHub session",
        error,
      );
      return null;
    }
  };

  return {
    /** @inheritdoc */
    async login(): Promise<GitHubAuthContext> {
      const session = await getVSCodeSession(true);
      if (!session) {
        throw new Error("GitHub authentication was cancelled or unavailable.");
      }

      const context = await buildContext(session.accessToken, session);
      await storeToken(session.accessToken);
      return context;
    },

    /** @inheritdoc */
    async logout(): Promise<void> {
      cachedContext = null;
      await clearToken();
    },

    /** @inheritdoc */
    async getSession(): Promise<GitHubAuthContext | null> {
      if (cachedContext && !cachedContext.session.accessToken) {
        cachedContext = null;
      }

      if (cachedContext) {
        return cachedContext;
      }

      const session = await getVSCodeSession(false);
      if (session) {
        return buildContext(session.accessToken, session);
      }

      const token = await readTokenFromSecret();
      if (!token) {
        cachedContext = null;
        return null;
      }

      try {
        return await buildContext(token, undefined, true);
      } catch {
        await clearToken();
        cachedContext = null;
        return null;
      }
    },

    /** @inheritdoc */
    async getStoredToken(): Promise<string | null> {
      return readTokenFromSecret();
    },

    /** @inheritdoc */
    async saveToken(token: string): Promise<void> {
      cachedContext = null;
      await storeToken(token);
    },

    /** @inheritdoc */
    async removeToken(): Promise<void> {
      cachedContext = null;
      await clearToken();
    },

    /** @inheritdoc */
    async validateToken(token: string): Promise<boolean> {
      try {
        await buildContext(token, undefined, false);
        return true;
      } catch {
        return false;
      }
    },
  };
}
