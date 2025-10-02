import type {
  GitHubAuthContext,
  GitHubAuthInstance,
  GitHubAuthOptions,
  GitHubAuthProvider,
} from "./types.js";

export type {
  GitHubAuthContext,
  GitHubAuthInstance,
  GitHubAuthLoginOptions,
  GitHubAuthOptions,
  GitHubAuthProvider,
  GitHubAuthSession,
  GitHubAuthenticatedUser,
  TokenStorage,
} from "./types.js";
export {
  createCLIAuthProvider,
  type CLIAuthProviderOptions,
} from "./providers/cliProvider.js";
export {
  createVSCodeAuthProvider,
  type VSCodeAuthProviderOptions,
} from "./providers/vscodeProvider.js";
export {
  createFileTokenStorage,
  DEFAULT_GITHUB_TOKEN_FILE,
  DEFAULT_STACKCODE_DIRECTORY,
  type FileTokenStorageOptions,
} from "./storage/index.js";

/**
 * Factory that builds the public GitHub authentication facade used throughout
 * StackCode clients.
 */
export function createGitHubAuth(
  options: GitHubAuthOptions,
): GitHubAuthInstance {
  const provider = options.provider;
  let cachedContext: GitHubAuthContext | null = null;

  const ensureOperation = <K extends keyof GitHubAuthProvider>(
    method: K,
  ): NonNullable<GitHubAuthProvider[K]> => {
    const operation = provider[method];
    if (typeof operation !== "function") {
      throw new Error(`Provider does not implement '${String(method)}'.`);
    }
    return operation.bind(provider) as NonNullable<GitHubAuthProvider[K]>;
  };

  const login = async (...args: Parameters<GitHubAuthProvider["login"]>) => {
    const context = await provider.login(...args);
    cachedContext = context;
    return context;
  };

  const logout = async () => {
    await provider.logout();
    cachedContext = null;
  };

  const getSession = async (requestOptions?: {
    forceRefresh?: boolean;
  }): Promise<GitHubAuthContext | null> => {
    if (!requestOptions?.forceRefresh && cachedContext) {
      return cachedContext;
    }

    const context = await provider.getSession();
    cachedContext = context;
    return context;
  };

  const getAuthenticatedClient = async () => {
    const context = await getSession();
    if (!context) {
      throw new Error("GitHub user is not authenticated. Call login() first.");
    }
    return context.client;
  };

  const getStoredToken = () => {
    if (provider.getStoredToken) {
      return provider.getStoredToken();
    }
    return Promise.resolve(null);
  };

  const saveToken = async (token: string) => {
    const operation = ensureOperation("saveToken");
    cachedContext = null;
    await operation(token);
  };

  const removeToken = async () => {
    const operation = ensureOperation("removeToken");
    cachedContext = null;
    await operation();
  };

  const validateToken = async (token: string) => {
    const operation = ensureOperation("validateToken");
    return operation(token) as Promise<boolean>;
  };

  return {
    login,
    logout,
    getSession,
    getAuthenticatedClient,
    isAuthenticated: () => cachedContext !== null,
    getStoredToken,
    saveToken,
    removeToken,
    validateToken,
  };
}
