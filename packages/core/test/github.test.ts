import { describe, it, expect, vi, afterEach } from "vitest";
import { Octokit } from "@octokit/rest";
import { createGitHubRelease } from "../src/github.js";

const createReleaseMock = vi.fn();

vi.mock("@octokit/rest", () => {
  const MockedOctokit = vi.fn().mockImplementation(() => {
    return {
      repos: {
        createRelease: createReleaseMock,
      },
    };
  });

  return { Octokit: MockedOctokit };
});

describe("createGitHubRelease", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call the octokit createRelease method with correct parameters", async () => {
    const mockOptions = {
      owner: "YagoBorba",
      repo: "StackCode",
      tagName: "v1.1.0",
      releaseNotes: "This is a great new release!",
      token: "fake-token",
    };

    await createGitHubRelease(mockOptions);
    expect(Octokit).toHaveBeenCalledWith({ auth: "fake-token" });

    expect(createReleaseMock).toHaveBeenCalledOnce();
    expect(createReleaseMock).toHaveBeenCalledWith({
      owner: "YagoBorba",
      repo: "StackCode",
      tag_name: "v1.1.0",
      name: `Release v1.1.0`,
      body: "This is a great new release!",
      prerelease: false,
    });
  });
});
