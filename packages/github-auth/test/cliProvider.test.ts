import { describe, it, expect, beforeEach, vi } from "vitest";
import { createGitHubAuth } from "../src/index.js";
import { createCLIAuthProvider } from "../src/providers/cliProvider.js";
import type { TokenStorage } from "../src/types.js";
import type { Octokit } from "@octokit/rest";

const createMemoryStorage = (): TokenStorage => {
  let value: string | null = null;
  return {
    async read() {
      return value;
    },
    async write(token: string) {
      value = token;
    },
    async clear() {
      value = null;
    },
  };
};

describe("CLI auth provider", () => {
  const userPayload = {
    id: 123,
    login: "stackcoder",
    name: "Stack Coder",
    email: "stackcoder@example.com",
  };

  const createStubOctokit = (): Octokit => ({
    users: {
      getAuthenticated: vi.fn().mockResolvedValue({ data: userPayload }),
    },
  }) as unknown as Octokit;

  let storage: TokenStorage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("persists tokens when requested during login", async () => {
    const auth = createGitHubAuth({
      provider: createCLIAuthProvider({
        storage,
        octokitFactory: () => createStubOctokit(),
      }),
    });

    await auth.login({ token: "token123", persist: true });

    expect(await storage.read()).toBe("token123");
    expect(auth.isAuthenticated()).toBe(true);

    const client = await auth.getAuthenticatedClient();
    const session = await auth.getSession();

    expect(session?.session.account?.username).toBe("stackcoder");
    expect((session?.client as unknown as { users: { getAuthenticated: () => unknown } }).users.getAuthenticated).toBeDefined();
    expect(typeof client).toBe("object");
  });

  it("validates tokens and clears cache on failure", async () => {
    const provider = createCLIAuthProvider({
      storage,
      octokitFactory: () =>
        ({
          users: {
            getAuthenticated: vi
              .fn()
              .mockRejectedValue(new Error("bad token")),
          },
        }) as unknown as Octokit,
    });

    const auth = createGitHubAuth({ provider });

  expect(await auth.validateToken("invalid")).toBe(false);
    expect(await auth.getStoredToken()).toBeNull();
  });

  it("saves and removes tokens via helper methods", async () => {
    const auth = createGitHubAuth({
      provider: createCLIAuthProvider({
        storage,
        octokitFactory: () => createStubOctokit(),
      }),
    });

    await auth.saveToken("temp-token");
    expect(await storage.read()).toBe("temp-token");

    await auth.removeToken();
    expect(await storage.read()).toBeNull();
  });
});
