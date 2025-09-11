export type VersioningStrategy = "locked" | "independent" | "unknown";

export interface PackageInfo {
  name: string;
  version?: string;
  path: string;
}

export interface MonorepoInfo {
  strategy: VersioningStrategy;
  rootDir: string;
  rootVersion?: string;
  packages: PackageInfo[];
}

export interface PackageBumpInfo {
  pkg: PackageInfo;
  bumpType: string;
  newVersion: string;
}

export interface GitHubReleaseOptions {
  owner: string;
  repo: string;
  tagName: string;
  releaseNotes: string;
  token: string;
}

export interface StackCodeConfig {
  defaultAuthor?: string;
  defaultLicense?: string;
  defaultDescription?: string;
  features?: {
    commitValidation?: boolean;
    husky?: boolean;
    docker?: boolean;
  };
}

export interface ProjectOptions {
  projectPath: string;
  stack: SupportedStack;
  features: ("docker" | "husky")[];
  replacements: {
    projectName: string;
    description: string;
    authorName: string;
  };
}

export type SupportedStack =
  | "node-js"
  | "node-ts"
  | "react"
  | "vue"
  | "angular"
  | "svelte"
  | "python"
  | "java"
  | "go"
  | "php";
