import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PROTECTED_BRANCHES,
  getCurrentBranch,
  isProtectedBranch,
} from "../src/branches.js";

describe("isProtectedBranch", () => {
  it("protects main, master and develop by default", () => {
    expect(DEFAULT_PROTECTED_BRANCHES).toEqual(["main", "master", "develop"]);
    for (const branch of DEFAULT_PROTECTED_BRANCHES) {
      expect(isProtectedBranch(branch)).toBe(true);
    }
  });

  it("does not protect work branches or unknown branches", () => {
    expect(isProtectedBranch("feature/login")).toBe(false);
    expect(isProtectedBranch("release/1.2.0")).toBe(false);
    expect(isProtectedBranch(null)).toBe(false);
    expect(isProtectedBranch(undefined)).toBe(false);
  });

  it("accepts a custom list", () => {
    expect(isProtectedBranch("trunk", ["trunk"])).toBe(true);
    expect(isProtectedBranch("main", ["trunk"])).toBe(false);
  });
});

describe("getCurrentBranch", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "stackcode-branch-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns the checked-out branch", async () => {
    execFileSync("git", ["init", "-b", "develop"], {
      cwd: dir,
      stdio: "ignore",
    });
    expect(await getCurrentBranch(dir)).toBe("develop");

    execFileSync("git", ["checkout", "-b", "feature/x"], {
      cwd: dir,
      stdio: "ignore",
    });
    expect(await getCurrentBranch(dir)).toBe("feature/x");
  });

  it("returns null outside a repository", async () => {
    expect(await getCurrentBranch(dir)).toBeNull();
  });
});
