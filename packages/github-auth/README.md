# @stackcode/github-auth

Shared GitHub authentication utilities for the StackCode CLI and VS Code extension.

## Features

- Unified API that exposes `login`, `logout`, `getSession`, `getAuthenticatedClient`, and validation helpers
- Pluggable providers for CLI (Personal Access Token) and VS Code (OAuth via `vscode.authentication`)
- Secure token storage abstractions with filesystem and secret storage implementations
- Optional cross-environment token sharing so one login can power multiple clients

## Usage

```ts
import {
  createGitHubAuth,
  createCLIAuthProvider,
  createFileTokenStorage,
} from "@stackcode/github-auth";

const auth = createGitHubAuth({
  provider: createCLIAuthProvider({
    storage: createFileTokenStorage(),
  }),
});

const session = await auth.login({ token: "ghp_xxx", persist: true });
const client = await auth.getAuthenticatedClient();
```

## Scripts

- `npm run build` – emit compiled JavaScript and type declarations
- `npm run test` – execute unit tests with Vitest
- `npm run clean` – remove build artifacts

## License

MIT © StackCode
