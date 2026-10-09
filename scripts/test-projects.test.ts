/** @fileoverview Exercises actual Vitest discovery to prevent omitted or duplicated application tests. */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

import { createOfficeTestOptions } from "../apps/office/test-projects";

/** Recursively inventories authored unit tests independently of Vitest project filters. @param directory - Source directory. @returns Absolute unit test paths. */
function collectTests(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(
    /** Expands one source entry. @param entry - Directory entry. @returns Nested or matching test files. */
    (entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? collectTests(file) : /\.test\.tsx?$/u.test(file) ? [file] : [];
    },
  );
}

/** Invokes the installed Vitest discovery command without executing application tests. @param config - Workspace config filename. @returns Project names and discovered test paths. */
function discover(config: string): { file: string; projectName: string }[] {
  const result = spawnSync(
    process.execPath,
    [
      path.resolve("node_modules/vitest/vitest.mjs"),
      "list",
      "--config",
      config,
      "--filesOnly",
      "--json",
    ],
    {
      cwd: path.resolve("apps/office"),
      encoding: "utf8",
      timeout: 30_000,
    },
  );
  expect(result.status, result.stderr).toBe(0);
  const files = JSON.parse(result.stdout) as { file: string; projectName: string }[];
  return files.sort(
    /** Normalizes filesystem discovery order. @param left - First record. @param right - Second record. @returns Lexical path order. */
    (left, right) => left.file.localeCompare(right.file),
  );
}

it("partitions every existing unit test exactly once and scoped configs discover the same owners", /** Verifies actual CLI discovery rather than mirroring glob implementation. @returns Nothing. */ () => {
  const full = discover("vite.config.ts");
  expect(discover("vitest.shared-coverage.config.ts")).toEqual(full);
  const expected = collectTests(path.resolve("apps/office/src")).sort();
  expect(
    full
      .map(
        /** Extracts a test path. @param entry - Discovery record. @returns Path. */ (entry) =>
          entry.file,
      )
      .sort(),
  ).toEqual(expected);
  expect(
    new Set(
      full.map(
        /** Extracts a unique path. @param entry - Discovery record. @returns Path. */ (entry) =>
          entry.file,
      ),
    ).size,
  ).toBe(full.length);
  for (const owner of ["writer", "shared", "calc"] as const) {
    const scoped = discover(`vitest.${owner}.config.ts`);
    expect(scoped).toEqual(
      full.filter(
        /** Selects the expected owner. @param entry - Discovery record. @returns Owner match. */ (
          entry,
        ) => entry.projectName === owner,
      ),
    );
    if (owner === "shared") {
      for (const entry of scoped) {
        const imports = ts.preProcessFile(
          readFileSync(entry.file, "utf8"),
          true,
          true,
        ).importedFiles;
        for (const imported of imports) {
          const target = path.resolve(path.dirname(entry.file), imported.fileName);
          expect(target.startsWith(path.resolve("apps/office/src/sw") + path.sep), entry.file).toBe(
            false,
          );
          expect(target.startsWith(path.resolve("apps/office/src/sc") + path.sep), entry.file).toBe(
            false,
          );
        }
      }
    }
    const coverage = createOfficeTestOptions(owner).coverage;
    expect(coverage?.provider).toBe("istanbul");
    expect(coverage?.thresholds).toEqual({
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    });
    expect(coverage?.reportsDirectory).toBe(`./coverage/${owner}`);
    expect(coverage?.include).toEqual([
      owner === "writer"
        ? "src/sw/**/*.{ts,tsx}"
        : owner === "calc"
          ? "src/sc/**/*.{ts,tsx}"
          : "src/**/*.{ts,tsx}",
    ]);
    if (owner === "shared")
      expect(coverage?.exclude).toEqual(expect.arrayContaining(["src/sw/**", "src/sc/**"]));
  }
}, 60_000);
