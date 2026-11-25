import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { LocalRepositoryStatsService } from "../services/LocalRepositoryStatsService";

function git(cwd: string, ...args: string[]) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

function commit(cwd: string, file: string, message: string, author: string) {
  fs.writeFileSync(path.join(cwd, file), message);
  git(cwd, "add", file);
  git(
    cwd,
    "-c",
    `user.name=${author}`,
    "-c",
    `user.email=${author.toLowerCase()}@example.com`,
    "commit",
    "-m",
    message,
  );
}

describe("LocalRepositoryStatsService", () => {
  let dir: string;
  const service = new LocalRepositoryStatsService(2);

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "stackcode-stats-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns null outside a Git repository", async () => {
    expect(await service.collect(dir)).toBeNull();
  });

  it("reports an empty repository without commits", async () => {
    git(dir, "init", "-b", "main");

    const stats = await service.collect(dir);

    expect(stats).toMatchObject({
      commits: 0,
      contributors: 0,
      trackedFiles: 0,
      recentCommits: [],
      lastCommitDate: null,
    });
  });

  it("counts commits, branches, contributors and tracked files", async () => {
    git(dir, "init", "-b", "main");
    commit(dir, "a.txt", "feat: first", "Ana");
    commit(dir, "b.txt", "fix: second", "Bruno");
    commit(dir, "c.txt", "docs: third", "Ana");
    git(dir, "branch", "develop");

    const stats = await service.collect(dir);

    expect(stats).not.toBeNull();
    expect(stats!.currentBranch).toBe("main");
    expect(stats!.branches).toBe(2);
    expect(stats!.commits).toBe(3);
    expect(stats!.contributors).toBe(2);
    expect(stats!.trackedFiles).toBe(3);
    expect(stats!.commitsThisWeek).toBe(3);
    expect(stats!.commitsThisMonth).toBe(3);
    expect(stats!.recentCommits.map((c) => c.subject)).toEqual([
      "docs: third",
      "fix: second",
    ]);
    expect(stats!.recentCommits[0].author).toBe("Ana");
    expect(stats!.lastCommitDate).toBe(stats!.recentCommits[0].date);
  });
});
