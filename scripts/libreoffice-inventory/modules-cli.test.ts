/**
 * @fileoverview Verifies strict module-command options and deterministic generated JSON through injected manifest, Git, and output boundaries.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GitExecutor } from "./git";
import { parseModuleCliOptions, readUtf8File, runModuleCli, writeUtf8File } from "./modules-cli";

/**
 * Creates valid baseline JSON with lightweight acquisition floors for four controlled fake repositories.
 *
 * @returns Complete valid baseline JSON source.
 */
function createManifestSource(): string {
  return JSON.stringify({
    commit: "core-commit",
    corpora: [
      createCorpus("core", "vendor/reference/", 2),
      createCorpus("dictionaries", "vendor/reference/dictionaries/", 1),
      createCorpus("helpcontent2", "vendor/reference/helpcontent2/", 1),
      createCorpus("translations", "vendor/reference/translations/", 1),
    ],
    referencePath: "vendor/reference/",
    repository: "https://github.com/LibreOffice/core.git",
    schemaVersion: 2,
    tag: "release-tag",
    tagObject: "core-tag",
  });
}

/**
 * Creates one minimal valid corpus declaration for the module-command fixture.
 *
 * @param id - Required stable corpus identifier.
 * @param referencePath - Corpus path beneath the core reference root.
 * @param trackedFiles - Positive test acquisition floor.
 * @returns JSON-shaped corpus declaration.
 */
function createCorpus(
  id: string,
  referencePath: string,
  trackedFiles: number,
): Record<string, unknown> {
  return {
    commit: `${id}-commit`,
    id,
    referencePath,
    repository: `https://github.com/LibreOffice/${id}.git`,
    tagObject: `${id}-tag`,
    trackedFiles,
  };
}

/**
 * Creates a valid fake Git boundary with the core's two declaration paths and three auxiliary paths.
 *
 * @returns A deterministic fake Git executor.
 */
function createGitExecutor(): GitExecutor {
  return {
    /**
     * Returns controlled Git output for one fake corpus and command.
     *
     * @param repositoryPath - Local corpus path selected by module command validation.
     * @param argumentsList - Read-only Git arguments requested by the command.
     * @returns A promise resolving to deterministic fake output.
     */
    async run(repositoryPath: string, argumentsList: readonly string[]): Promise<string> {
      const directoryName = repositoryPath.split("/").at(-1) ?? "";
      const id = directoryName === "reference" ? "core" : directoryName;
      const command = argumentsList.join(" ");

      if (command === "rev-parse HEAD") return `${id}-commit\n`;
      if (command === "remote get-url origin") return `https://github.com/LibreOffice/${id}.git\n`;
      if (command === "rev-parse refs/tags/release-tag^{tag}") return `${id}-tag\n`;
      if (command === "rev-parse --is-shallow-repository") return "true\n";
      if (command === "status --short") return "";
      if (command === "ls-files -z" && id === "core") {
        return "z/Module_z.mk\0a/Module_a.mk\0README.md\0";
      }
      if (command === "ls-files -z") return "tracked-file\0";
      throw new Error(`Unexpected test Git command: ${command}`);
    },
  };
}

describe("module inventory CLI" /**
 * Groups strict option parsing and canonical generated-output cases.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineModuleCliTests(): void {
  it("requires each known option once and rejects unknown, missing, or duplicate input" /**
   * Verifies the command cannot choose an accidental output or checkout path.
   *
   * @returns Nothing; assertions validate strict option behavior.
   */, function parsesStrictModuleOptions(): void {
    expect(
      parseModuleCliOptions([
        "--baseline",
        "baseline.json",
        "--reference-root",
        "vendor/reference",
        "--output",
        "output.json",
      ]),
    ).toEqual({
      baselinePath: "baseline.json",
      outputPath: "output.json",
      referenceRoot: "vendor/reference",
    });
    expectModuleOptionError(["--unknown", "value"]);
    expectModuleOptionError(["--baseline", "baseline.json", "--output", "output.json"]);
    expectModuleOptionError([
      "--baseline",
      "baseline.json",
      "--baseline",
      "other.json",
      "--reference-root",
      "vendor/reference",
      "--output",
      "output.json",
    ]);
    expectModuleOptionError([
      "--baseline",
      "--reference-root",
      "vendor/reference",
      "--output",
      "out",
    ]);
  });

  it("writes a canonical ordered inventory only after baseline validation succeeds" /**
   * Verifies output contains provenance-only records and one trailing newline.
   *
   * @returns A promise resolving after asynchronous output assertions complete.
   */, async function writesCanonicalInventory(): Promise<void> {
    let outputPath = "";
    let contents = "";

    await runModuleCli(
      [
        "--baseline",
        "virtual.json",
        "--reference-root",
        "actual/reference",
        "--output",
        "generated.json",
      ],
      /**
       * Returns fixture manifest JSON after asserting the requested virtual path.
       *
       * @param filePath - Manifest path requested by the module command.
       * @returns A promise resolving to valid controlled baseline JSON.
       */
      async function readVirtualManifest(filePath: string): Promise<string> {
        expect(filePath).toBe("virtual.json");
        return createManifestSource();
      },
      /**
       * Captures the requested output path and canonical JSON without filesystem mutation.
       *
       * @param nextPath - Explicit caller-selected generated output path.
       * @param nextContents - Complete generated JSON contents.
       * @returns A promise resolving after retained-output assignment.
       */
      async function captureOutput(nextPath: string, nextContents: string): Promise<void> {
        outputPath = nextPath;
        contents = nextContents;
      },
      createGitExecutor(),
    );

    expect(outputPath).toBe("generated.json");
    expect(contents.endsWith("\n")).toBe(true);
    expect(JSON.parse(contents)).toMatchObject({
      coreCommit: "core-commit",
      corpusId: "core",
      records: [
        { mappingStatus: "unmapped", moduleName: "a", referencePath: "a/Module_a.mk" },
        { mappingStatus: "unmapped", moduleName: "z", referencePath: "z/Module_z.mk" },
      ],
      schemaVersion: 1,
    });
  });

  it("reads and writes UTF-8 through production filesystem wrappers" /**
   * Verifies the direct-command filesystem boundaries preserve exact generated text outside the repository.
   *
   * @returns A promise resolving after temporary-directory cleanup completes.
   */, async function readsAndWritesUtf8(): Promise<void> {
    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "vite-office-module-test-"));
    const outputPath = path.join(temporaryDirectory, "inventory.json");

    try {
      await writeUtf8File(outputPath, "inventory");
      expect(await readUtf8File(outputPath)).toBe("inventory");
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });
});

/**
 * Expects strict module CLI parsing to reject one invalid option sequence.
 *
 * @param argumentsList - Invalid module command arguments.
 * @returns Nothing; assertion validates error behavior.
 */
function expectModuleOptionError(argumentsList: readonly string[]): void {
  expect(
    /**
     * Invokes module option parsing under an expected error assertion.
     *
     * @returns Parsing result that never returns for invalid input.
     */
    function parseInvalidModuleOptions(): unknown {
      return parseModuleCliOptions(argumentsList);
    },
  ).toThrowError();
}
