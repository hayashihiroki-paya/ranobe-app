import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const typescriptCompiler = require.resolve("typescript/bin/tsc");

execFileSync(
  process.execPath,
  [
    typescriptCompiler,
    "--target",
    "ES2020",
    "--module",
    "CommonJS",
    "--moduleResolution",
    "Node",
    "--esModuleInterop",
    "--skipLibCheck",
    "--rootDir",
    ".",
    "--outDir",
    ".seed-build",
    "scripts/seedTags.ts",
    "scripts/seed.ts",
  ],
  { cwd: projectRoot, stdio: "inherit" },
);

if (!process.argv.includes("--compile-only")) {
  for (const scriptName of ["seedTags", "seed"]) {
    execFileSync(
      process.execPath,
      [resolve(projectRoot, ".seed-build", "scripts", `${scriptName}.js`)],
      { cwd: projectRoot, stdio: "inherit" },
    );
  }
}
