import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface RecentCommit {
  hash: string;
  subject: string;
  author: string;
  date: string;
}

export interface LocalRepositoryStats {
  currentBranch: string | null;
  branches: number;
  commits: number;
  contributors: number;
  trackedFiles: number;
  commitsThisWeek: number;
  commitsThisMonth: number;
  lastCommitDate: string | null;
  recentCommits: RecentCommit[];
}

const FIELD = "\x1f";

/**
 * Reads statistics from the local Git repository of the workspace.
 * Works offline and without a GitHub account; GitHub data (stars, forks,
 * issues) is added separately when the user is signed in.
 */
export class LocalRepositoryStatsService {
  constructor(private readonly recentCommitLimit = 5) {}

  /** Returns null when the folder is not inside a Git work tree. */
  async collect(cwd: string): Promise<LocalRepositoryStats | null> {
    const git = async (args: string[]): Promise<string> => {
      const { stdout } = await execFileAsync("git", args, {
        cwd,
        maxBuffer: 32 * 1024 * 1024,
        windowsHide: true,
      });
      return stdout.trim();
    };

    try {
      if ((await git(["rev-parse", "--is-inside-work-tree"])) !== "true") {
        return null;
      }
    } catch {
      return null;
    }

    const [branchList, trackedFiles, currentBranch] = await Promise.all([
      git(["branch", "--format=%(refname:short)"]),
      git(["ls-files"]),
      git(["branch", "--show-current"]).catch(() => ""),
    ]);

    const empty: LocalRepositoryStats = {
      currentBranch: currentBranch || null,
      branches: countLines(branchList),
      commits: 0,
      contributors: 0,
      trackedFiles: countLines(trackedFiles),
      commitsThisWeek: 0,
      commitsThisMonth: 0,
      lastCommitDate: null,
      recentCommits: [],
    };

    try {
      await git(["rev-parse", "--verify", "HEAD"]);
    } catch {
      // Repository without commits yet.
      return empty;
    }

    const [commits, thisWeek, thisMonth, authors, log] = await Promise.all([
      git(["rev-list", "--count", "HEAD"]),
      git(["rev-list", "--count", "--since=1.week.ago", "HEAD"]),
      git(["rev-list", "--count", "--since=1.month.ago", "HEAD"]),
      git(["log", "--format=%ae", "HEAD"]),
      git([
        "log",
        `-n${this.recentCommitLimit}`,
        `--format=%h${FIELD}%s${FIELD}%an${FIELD}%aI`,
        "HEAD",
      ]),
    ]);

    const recentCommits = log
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, subject, author, date] = line.split(FIELD);
        return { hash, subject, author, date };
      });

    return {
      ...empty,
      commits: Number(commits) || 0,
      contributors: new Set(
        authors
          .split("\n")
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      ).size,
      commitsThisWeek: Number(thisWeek) || 0,
      commitsThisMonth: Number(thisMonth) || 0,
      lastCommitDate: recentCommits[0]?.date ?? null,
      recentCommits,
    };
  }
}

function countLines(text: string): number {
  return text ? text.split("\n").filter((line) => line.trim()).length : 0;
}
