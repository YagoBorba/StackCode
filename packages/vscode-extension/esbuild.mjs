// Bundles the extension and its runtime dependencies into dist/extension.js.
//
// @stackcode/core and @stackcode/i18n are ES modules that read their templates
// and locale files relative to import.meta.url. The bundle is CommonJS (what
// VS Code loads), so import.meta.url is rewritten to the bundle's own URL and
// the files they read are copied next to it.
import { build } from "esbuild";
import { cp, rm } from "fs/promises";

const production = process.argv.includes("--production");

await rm("dist/extension.js", { force: true });
await rm("dist/templates", { recursive: true, force: true });
await rm("dist/locales", { recursive: true, force: true });

await build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "dist/extension.js",
  external: ["vscode"],
  sourcemap: !production,
  minify: production,
  define: { "import.meta.url": "importMetaUrl" },
  banner: {
    js: "const importMetaUrl = require('url').pathToFileURL(__filename).href;",
  },
  logLevel: "info",
});

await cp("../core/dist/templates", "dist/templates", { recursive: true });
await cp("../i18n/dist/locales", "dist/locales", { recursive: true });
