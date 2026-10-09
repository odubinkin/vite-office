/** @fileoverview Verifies native compiler diagnostics and legacy compiler API compatibility. */

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

/** Runs an installed compiler command exactly as npm scripts resolve it. @param command - Compiler binary name. @param args - CLI arguments. @returns Compiler exit status and output. */
function compile(command: "tsc" | "tsc6", args: string[]) {
  return spawnSync(path.resolve("node_modules/.bin", command), args, {
    encoding: "utf8",
    timeout: 30_000,
  });
}

it("resolves tsc to TS7 while preserving TS6 CLI and AST consumers", /** Checks actual executables and parses imports with the compatibility API. @returns Nothing. */ () => {
  for (const [command, major] of [
    ["tsc", "7"],
    ["tsc6", "6"],
  ] as const) {
    const result = compile(command, ["--version"]);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(new RegExp(`^Version ${major}\\.`));
  }
  expect(ts.versionMajorMinor).toMatch(/^6\./u);
  const source = 'import type { OfficeState } from "./office";';
  const parsed = ts.createSourceFile("fixture.ts", source, ts.ScriptTarget.Latest, true);
  const statement = parsed.statements[0];
  expect(statement && ts.isImportDeclaration(statement)).toBe(true);
  expect(ts.preProcessFile(source).importedFiles).toEqual([
    expect.objectContaining({ fileName: "./office" }),
  ]);
});

it("checks valid code and rejects type errors with the native compiler", /** Exercises native diagnostics without using the legacy checker. @returns Nothing. */ () => {
  const cache = path.resolve("node_modules/.cache");
  mkdirSync(cache, { recursive: true });
  const directory = mkdtempSync(path.join(cache, "typescript-toolchain-"));
  try {
    writeFileSync(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { strict: true, noEmit: true, types: [], target: "ES2022" },
        files: ["fixture.ts"],
      }),
    );
    const fixture = path.join(directory, "fixture.ts");
    writeFileSync(fixture, 'export const label: string = "office";');
    const valid = compile("tsc", ["--project", directory]);
    expect(valid.status, valid.stdout + valid.stderr).toBe(0);
    writeFileSync(fixture, "export const label: string = 42;");
    const invalid = compile("tsc", ["--project", directory]);
    expect(invalid.status).not.toBe(0);
    expect(invalid.stdout + invalid.stderr).toContain("TS2322");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
