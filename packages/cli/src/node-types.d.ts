/// <reference types="node" />

// Declare Node.js built-in modules
declare module "path" {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export const sep: string;
}

declare module "fs/promises" {
  export function readFile(
    path: string,
    encoding?: string,
  ): Promise<string | Buffer>;
  export function writeFile(path: string, data: string | Buffer): Promise<void>;
  export function mkdir(
    path: string,
    options?: { recursive?: boolean },
  ): Promise<void>;
  export function access(path: string): Promise<void>;
  export function stat(
    path: string,
  ): Promise<{ isFile(): boolean; isDirectory(): boolean; size: number }>;
}

declare module "module" {
  export function createRequire(filename: string | URL): typeof require;
}

// Global augmentation for Node.js types
declare global {
  var process: NodeJS.Process;
  var console: Console;
  var require: typeof import("module").createRequire;
}

export {};
