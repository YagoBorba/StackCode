"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationTarget =
  exports.StatusBarAlignment =
  exports.extensions =
  exports.commands =
  exports.workspace =
  exports.window =
    void 0;
const mockConfiguration = {
  get: jest.fn((key, defaultValue) => {
    const configs = {
      "notifications.enabled": true,
      "notifications.branchCheck": true,
      "notifications.commitCheck": true,
      "autoGenerate.readme": false,
      "autoGenerate.gitignore": true,
      "git.defaultBranchType": "feature",
      "dashboard.autoOpen": false,
    };
    return configs[key] !== undefined ? configs[key] : defaultValue;
  }),
  update: jest.fn(),
};
exports.window = {
  showInformationMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  })),
};
exports.workspace = {
  getConfiguration: jest.fn(() => mockConfiguration),
  workspaceFolders: [],
  onDidChangeConfiguration: jest.fn(),
};
exports.commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
  getCommands: jest.fn(() =>
    Promise.resolve([
      "stackcode.init",
      "stackcode.generate.readme",
      "stackcode.git.start",
    ]),
  ),
};
exports.extensions = {
  getExtension: jest.fn(() => ({
    activate: jest.fn(() => Promise.resolve()),
    isActive: true,
  })),
};
exports.StatusBarAlignment = {
  Left: 1,
  Right: 2,
};
exports.ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3,
};
//# sourceMappingURL=vscode.js.map
