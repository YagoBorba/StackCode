import * as path from "path";
import { runTests } from "@vscode/test-electron";

/**
 * Starts a real VS Code with the bundled extension (dist/extension.js) and
 * runs src/test/smoke/index.ts inside it.
 */
async function main(): Promise<void> {
  const extensionDevelopmentPath = path.resolve(__dirname, "../..");
  const extensionTestsPath = path.resolve(__dirname, "./smoke/index");
  const workspace = path.resolve(extensionDevelopmentPath, "../..");

  try {
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspace, "--disable-extensions"],
    });
  } catch (error) {
    console.error("Smoke test failed:", error);
    process.exit(1);
  }
}

void main();
