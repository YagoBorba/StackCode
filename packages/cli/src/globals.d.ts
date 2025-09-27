/// <reference types="node" />

declare module "path" {
  import * as path from "path";
  export = path;
}

declare module "fs/promises" {
  import * as fs from "fs/promises";
  export = fs;
}

declare module "fs" {
  import * as fs from "fs";
  export = fs;
}

declare module "util" {
  import * as util from "util";
  export = util;
}

declare module "child_process" {
  import * as cp from "child_process";
  export = cp;
}

declare global {
  const process: NodeJS.Process;
  const console: Console;
}

export {};
