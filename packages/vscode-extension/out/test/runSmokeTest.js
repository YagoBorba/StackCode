"use strict";
/**
 * Smoke Tests for VS Code Extension
 *
 * These tests launch a real VS Code instance and execute commands to verify
 * that the extension works end-to-end in a realistic environment.
 */
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const test_electron_1 = require("@vscode/test-electron");
async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    // The path to the extension test runner script
    const extensionTestsPath = path.resolve(__dirname, "./smoke/index");
    // Create a temporary workspace for testing
    const testWorkspacePath = path.resolve(__dirname, "../../test-workspace");
    try {
      await fs.mkdir(testWorkspacePath, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
    }
    console.log("📦 Extension Development Path:", extensionDevelopmentPath);
    console.log("🧪 Extension Tests Path:", extensionTestsPath);
    console.log("📁 Test Workspace Path:", testWorkspacePath);
    // Download VS Code, unzip it and run the integration test
    await (0, test_electron_1.runTests)({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        testWorkspacePath,
        "--disable-extensions",
        "--disable-workspace-trust", // Don't prompt for workspace trust
      ],
    });
    // Cleanup: remove test workspace
    try {
      await fs.rm(testWorkspacePath, { recursive: true, force: true });
    } catch (error) {
      console.warn("⚠️  Could not clean up test workspace:", error);
    }
  } catch (err) {
    console.error("❌ Failed to run smoke tests:", err);
    process.exit(1);
  }
}
main();
//# sourceMappingURL=runSmokeTest.js.map
