"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationManager = void 0;
const vscode = __importStar(require("vscode"));
class ConfigurationManager {
  constructor() {
    this.configuration = vscode.workspace.getConfiguration("stackcode");
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("stackcode")) {
        this.configuration = vscode.workspace.getConfiguration("stackcode");
      }
    });
  }
  get notificationsEnabled() {
    return this.configuration.get("notifications.enabled", true);
  }
  get branchCheckEnabled() {
    return this.configuration.get("notifications.branchCheck", true);
  }
  get commitCheckEnabled() {
    return this.configuration.get("notifications.commitCheck", true);
  }
  get autoGenerateReadme() {
    return this.configuration.get("autoGenerate.readme", false);
  }
  get autoGenerateGitignore() {
    return this.configuration.get("autoGenerate.gitignore", true);
  }
  get defaultBranchType() {
    return this.configuration.get("git.defaultBranchType", "feature");
  }
  get dashboardAutoOpen() {
    return this.configuration.get("dashboard.autoOpen", false);
  }
  async updateConfiguration(key, value) {
    await this.configuration.update(
      key,
      value,
      vscode.ConfigurationTarget.Workspace,
    );
  }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=ConfigurationManager.js.map
