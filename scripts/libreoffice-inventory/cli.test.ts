/**
 * @fileoverview Verifies strict CLI option handling, injected file/Git boundaries, UTF-8 reads, and entrypoint detection.
 */

import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import type { GitExecutor } from "./git";
import { isDirectModule, parseCliOptions, readUtf8File, runCli } from "./cli";

/**
 * Creates a small valid manifest JSON string accepted by the CLI's strict parser.
 *
 * @returns Complete valid baseline JSON source.
 */
function createManifestSource(): string {
  return JSON.stringify({
    commit: "core-commit",
    corpora: [
      createCorpus("core", "vendor/reference/", 1),
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
 * Creates one minimal valid corpus JSON declaration.
 *
 * @param id - Required corpus identifier.
 * @param referencePath - Corpus local path below the core reference path.
 * @param trackedFiles - Positive tracked-file acquisition floor.
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
 * Creates a compact valid Git executor with one path for every command expected by the CLI.
 *
 * @returns A deterministic fake Git executor.
 */
function createGitExecutor(): GitExecutor {
  return {
    /**
     * Returns a valid response selected from one requested Git command.
     *
     * @param repositoryPath - Local path selected by the CLI validation process.
     * @param argumentsList - Read-only Git arguments requested by inventory validation.
     * @returns A promise resolving to controlled Git output.
     */
    async run(repositoryPath: string, argumentsList: readonly string[]): Promise<string> {
      const id =
        repositoryPath.split("/").at(-1) === "reference"
          ? "core"
          : (repositoryPath.split("/").at(-1) ?? "");
      const command = argumentsList.join(" ");

      if (command === "rev-parse HEAD") return `${id}-commit\n`;
      if (command === "remote get-url origin") return `https://github.com/LibreOffice/${id}.git\n`;
      if (command === "rev-parse refs/tags/release-tag^{tag}") return `${id}-tag\n`;
      if (command === "rev-parse --is-shallow-repository") return "true\n";
      if (command === "status --short") return "";
      if (command === "ls-files -z") return "tracked-file\0";
      throw new Error(`Unexpected test Git command: ${command}`);
    },
  };
}

describe("inventory CLI" /**
 * Groups option parsing, injected execution, filesystem reading, and main-module detection cases.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineCliTests(): void {
  it("accepts exactly the two required paths and rejects unsupported or incomplete options" /**
   * Verifies command invocation cannot silently choose an accidental manifest or checkout.
   *
   * @returns Nothing; assertions validate option contracts.
   */, function parsesStrictOptions(): void {
    expect(
      parseCliOptions(["--baseline", "baseline.json", "--reference-root", "vendor/reference"]),
    ).toEqual({ baselinePath: "baseline.json", referenceRoot: "vendor/reference" });
    expectOptionError(["--baseline", "baseline.json"]);
    expectOptionError(["--unknown", "value"]);
    expectOptionError(["--baseline", "--reference-root", "vendor/reference"]);
  });

  it("serializes a valid injected inventory report as canonical JSON" /**
   * Verifies the side-effect-free CLI uses injected read, Git, and output boundaries.
   *
   * @returns A promise resolving after JSON report assertions complete.
   */, async function serializesReport(): Promise<void> {
    let output = "";

    await runCli(
      ["--baseline", "virtual.json", "--reference-root", "actual/reference"],
      /**
       * Returns the controlled manifest source without touching the filesystem.
       *
       * @param filePath - Requested manifest path.
       * @returns A promise resolving to valid fixture JSON.
       */
      async function readVirtualFile(filePath: string): Promise<string> {
        expect(filePath).toBe("virtual.json");
        return createManifestSource();
      },
      /**
       * Captures canonical standard output for assertion.
       *
       * @param nextOutput - Complete CLI JSON payload.
       * @returns Nothing after retaining output.
       */
      function captureOutput(nextOutput: string): void {
        output = nextOutput;
      },
      createGitExecutor(),
    );

    expect(JSON.parse(output)).toMatchObject({ schemaVersion: 1, status: "valid" });
    expect(output.endsWith("\n")).toBe(true);
  });

  it("uses the production Git executor when no test executor is supplied" /**
   * Verifies the default command boundary can validate the ignored pinned checkout end to end.
   *
   * @returns A promise resolving after live report assertions complete.
   */, async function usesProductionGitExecutor(): Promise<void> {
    let output = "";

    await runCli(
      [
        "--baseline",
        "docs/program/libreoffice-baseline.json",
        "--reference-root",
        "vendor/libreoffice-reference",
      ],
      readUtf8File,
      /**
       * Captures the live canonical report without writing a generated artifact.
       *
       * @param nextOutput - Complete CLI JSON payload.
       * @returns Nothing after retaining output.
       */
      function captureLiveOutput(nextOutput: string): void {
        output = nextOutput;
      },
    );

    expect(JSON.parse(output)).toMatchObject({
      baselineTag: "libreoffice-26.8.0.2",
      status: "valid",
    });
  }, 30_000);

  it("reads UTF-8 files and compares entry URLs with process paths" /**
   * Verifies the Node file boundary and direct-entrypoint detection helper.
   *
   * @returns A promise resolving after filesystem and URL assertions complete.
   */, async function readsFilesAndDetectsEntrypoint(): Promise<void> {
    expect(await readUtf8File("docs/program/libreoffice-baseline.json")).toContain(
      '"schemaVersion": 2',
    );
    expect(isDirectModule(pathToFileURL("/tmp/inventory.ts").href, "/tmp/inventory.ts")).toBe(true);
    expect(isDirectModule(pathToFileURL("/tmp/inventory.ts").href, undefined)).toBe(false);
  });
});

/**
 * Expects strict option parsing to throw one error containing a usage or option diagnostic.
 *
 * @param argumentsList - Invalid CLI argument sequence.
 * @returns Nothing; assertion validates strict rejection behavior.
 */
function expectOptionError(argumentsList: readonly string[]): void {
  expect(
    /**
     * Invokes strict option parsing for the expected exception assertion.
     *
     * @returns Parsing result that is never returned for invalid input.
     */
    function parseInvalidOptions(): unknown {
      return parseCliOptions(argumentsList);
    },
  ).toThrowError();
}
