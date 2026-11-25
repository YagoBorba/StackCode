import * as assert from "assert";
import * as vscode from "vscode";

const EXTENSION_ID = "YagoBorba.stackcode-vscode";

const EXPECTED_COMMANDS = [
  "stackcode.init",
  "stackcode.generate.readme",
  "stackcode.generate.gitignore",
  "stackcode.git.start",
  "stackcode.git.finish",
  "stackcode.commit",
  "stackcode.validate",
  "stackcode.release",
  "stackcode.config",
  "stackcode.dashboard",
  "stackcode.auth.login",
  "stackcode.auth.logout",
];

/**
 * Runs inside VS Code: the packaged bundle must activate (which loads
 * @stackcode/core and the i18n locales) and register every contributed command.
 */
export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  assert.ok(extension, `${EXTENSION_ID} is not installed`);

  await extension.activate();
  assert.ok(extension.isActive, "extension did not activate");

  const commands = await vscode.commands.getCommands(true);
  const missing = EXPECTED_COMMANDS.filter((id) => !commands.includes(id));
  assert.deepStrictEqual(
    missing,
    [],
    `commands not registered: ${missing.join(", ")}`,
  );

  console.log(
    `StackCode smoke test passed: ${EXPECTED_COMMANDS.length} commands registered.`,
  );
}
