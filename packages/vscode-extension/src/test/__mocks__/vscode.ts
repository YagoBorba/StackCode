const mockConfiguration = {
  get: jest.fn((key: string, defaultValue?: unknown) => {
    const configs: { [key: string]: unknown } = {
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

export const window = {
  showInformationMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  })),
};

export const workspace = {
  getConfiguration: jest.fn(() => mockConfiguration),
  workspaceFolders: [],
  onDidChangeConfiguration: jest.fn(),
};

export const commands = {
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

export const extensions = {
  getExtension: jest.fn(() => ({
    activate: jest.fn(() => Promise.resolve()),
    isActive: true,
  })),
};

export const StatusBarAlignment = {
  Left: 1,
  Right: 2,
};

export const ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3,
};
