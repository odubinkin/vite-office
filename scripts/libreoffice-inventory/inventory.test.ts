/**
 * @fileoverview Verifies deterministic live-observation validation using controlled Git command boundaries.
 */

import { describe, expect, it } from "vitest";

import type { BaselineManifest, CorpusObservation } from "./contracts";
import { BaselineValidationError } from "./contracts";
import type { GitExecutor } from "./git";
import { createInventoryReport, validateBaseline } from "./inventory";

/**
 * Creates a compact valid manifest whose acquisition floors exercise every supported corpus category.
 *
 * @returns A typed valid baseline manifest.
 */
function createManifest(): BaselineManifest {
  return {
    commit: "core-commit",
    corpora: [
      {
        commit: "core-commit",
        id: "core",
        referencePath: "vendor/reference/",
        repository: "https://github.com/LibreOffice/core.git",
        tagObject: "core-tag",
        trackedFiles: 2,
      },
      {
        commit: "dictionaries-commit",
        corpusShape: { affFiles: 1, dictionaryFiles: 1 },
        id: "dictionaries",
        referencePath: "vendor/reference/dictionaries/",
        repository: "https://github.com/LibreOffice/dictionaries.git",
        tagObject: "dictionaries-tag",
        trackedFiles: 2,
      },
      {
        commit: "helpcontent2-commit",
        corpusShape: { xhpTopics: 1 },
        id: "helpcontent2",
        referencePath: "vendor/reference/helpcontent2/",
        repository: "https://github.com/LibreOffice/helpcontent2.git",
        tagObject: "helpcontent2-tag",
        trackedFiles: 1,
      },
      {
        commit: "translations-commit",
        corpusShape: { localeDirectories: 2, poCatalogs: 2 },
        id: "translations",
        referencePath: "vendor/reference/translations/",
        repository: "https://github.com/LibreOffice/translations.git",
        tagObject: "translations-tag",
        trackedFiles: 2,
      },
    ],
    referencePath: "vendor/reference/",
    repository: "https://github.com/LibreOffice/core.git",
    schemaVersion: 2,
    tag: "release-tag",
    tagObject: "core-tag",
  };
}

/**
 * Creates a deterministic fake Git executor that returns valid data for every corpus inspection command.
 *
 * @returns A controlled read-only Git executor.
 */
function createValidGitExecutor(): GitExecutor {
  return {
    /**
     * Returns controlled Git output selected by corpus path and requested command.
     *
     * @param repositoryPath - Test corpus path selected by inventory validation.
     * @param argumentsList - Git command arguments used by inventory validation.
     * @returns A promise resolving to deterministic command output.
     */
    async run(repositoryPath: string, argumentsList: readonly string[]): Promise<string> {
      const corpus = repositoryPath.split("/").at(-1) ?? "reference";
      const id = corpus === "reference" ? "core" : corpus;
      const command = argumentsList.join(" ");

      if (command === "rev-parse HEAD") return `${id}-commit\n`;
      if (command === "remote get-url origin") return `git@github.com:LibreOffice/${id}.git\n`;
      if (command === "rev-parse refs/tags/release-tag^{tag}") return `${id}-tag\n`;
      if (command === "rev-parse --is-shallow-repository") return "true\n";
      if (command === "status --short") return "";
      if (command === "ls-files -z") return getCorpusFiles(id);

      throw new Error(`Unexpected test Git command: ${command}`);
    },
  };
}

/**
 * Returns a tiny category-complete NUL-delimited tracked-file list for one test corpus.
 *
 * @param id - Corpus identifier derived from the fake repository path.
 * @returns NUL-delimited Git file list for the selected corpus.
 */
function getCorpusFiles(id: string): string {
  if (id === "core") return "README.md\0messages.po\0";
  if (id === "dictionaries") return "language.aff\0language.dic\0";
  if (id === "helpcontent2") return "source/topic.xhp\0";
  return "source/en/messages.po\0source/fr/messages.po\0";
}

describe("validateBaseline" /**
 * Groups success, deterministic ordering, malformed path, and multi-issue validation cases.
 *
 * @returns Nothing; Vitest registers the enclosed test cases.
 */, function defineInventoryValidationTests(): void {
  it("returns canonically ordered observations when every identity and acquisition floor matches" /**
   * Verifies normalized SSH provenance, count categories, and report ordering.
   *
   * @returns A promise resolving after asynchronous report assertions complete.
   */, async function validatesMatchingCheckout(): Promise<void> {
    const report = await validateBaseline(createManifest(), {
      git: createValidGitExecutor(),
      referenceRoot: "actual/reference",
    });

    expect(report).toMatchObject({ baselineTag: "release-tag", schemaVersion: 1, status: "valid" });
    expect(report.corpora.map(selectObservationId)).toEqual([
      "core",
      "dictionaries",
      "helpcontent2",
      "translations",
    ]);
    expect(report.corpora[1]).toMatchObject({ affFiles: 1, dictionaryFiles: 1 });
    expect(report.corpora[3]).toMatchObject({ localeDirectories: 2, poCatalogs: 2 });
  });

  it("collects and sorts identity, clean-state, shallow-state, and acquisition-floor failures" /**
   * Verifies no contract failure is hidden when a local corpus is incomplete or untrusted.
   *
   * @returns A promise resolving after structured error assertions complete.
   */, async function collectsAllIssues(): Promise<void> {
    const validGit = createValidGitExecutor();
    const failingGit: GitExecutor = {
      /**
       * Returns deliberately invalid dictionaries outputs while delegating all other corpus commands.
       *
       * @param repositoryPath - Test corpus path selected by inventory validation.
       * @param argumentsList - Git command arguments used by inventory validation.
       * @returns A promise resolving to invalid or valid controlled command output.
       */
      async run(repositoryPath: string, argumentsList: readonly string[]): Promise<string> {
        if (repositoryPath.endsWith("dictionaries")) {
          const command = argumentsList.join(" ");
          if (command === "rev-parse HEAD") return "wrong-commit\n";
          if (command === "remote get-url origin") return "https://example.invalid/dictionaries\n";
          if (command === "rev-parse refs/tags/release-tag^{tag}") return "wrong-tag\n";
          if (command === "rev-parse --is-shallow-repository") return "false\n";
          if (command === "status --short") return " M local-change\n";
          if (command === "ls-files -z") return "partial";
        }

        return validGit.run(repositoryPath, argumentsList);
      },
    };

    await expectValidationFailure(createManifest(), failingGit, "actual/reference", [
      "affFiles",
      "commit",
      "dictionaryFiles",
      "isClean",
      "isShallow",
      "origin",
      "tagObject",
      "trackedFiles",
    ]);
  });

  it("rejects a manifest corpus path outside the declared core checkout before any Git command runs" /**
   * Verifies path traversal is blocked at the inventory boundary.
   *
   * @returns A promise resolving after the structured failure assertion completes.
   */, async function rejectsEscapingCorpusPath(): Promise<void> {
    const manifest = createManifest();
    const core = manifest.corpora[0] as BaselineManifest["corpora"][number];
    const escapedManifest: BaselineManifest = {
      ...manifest,
      corpora: [{ ...core, referencePath: "vendor/outside/" }, ...manifest.corpora.slice(1)],
    };

    await expectValidationFailure(escapedManifest, createValidGitExecutor(), "actual/reference", [
      "referencePath",
    ]);
  });

  it("creates the same report for identical observations regardless of input order" /**
   * Verifies report serialization remains deterministic without timestamps or host paths.
   *
   * @returns Nothing; assertions compare canonical reports.
   */, function createsStableReport(): void {
    const core = createObservation("core");
    const translations = createObservation("translations");

    expect(createInventoryReport("release-tag", [translations, core])).toEqual(
      createInventoryReport("release-tag", [core, translations]),
    );
  });
});

/**
 * Extracts an observation identifier for explicit report-order assertions.
 *
 * @param observation - Report observation whose identifier is needed.
 * @returns The observation's stable corpus identifier.
 */
function selectObservationId(observation: CorpusObservation): string {
  return observation.id;
}

/**
 * Creates one minimal observation for report-order testing only.
 *
 * @param id - Stable corpus identifier assigned to the test observation.
 * @returns A complete observation with neutral count fields.
 */
function createObservation(id: CorpusObservation["id"]): CorpusObservation {
  return {
    affFiles: 0,
    commit: `${id}-commit`,
    dictionaryFiles: 0,
    id,
    isClean: true,
    isShallow: true,
    localeDirectories: 0,
    origin: `https://github.com/LibreOffice/${id}`,
    poCatalogs: 0,
    referencePath: id,
    tagObject: `${id}-tag`,
    trackedFiles: 1,
    xhpTopics: 0,
  };
}

/**
 * Expects validation to reject a manifest and compares only the stable issue field ordering.
 *
 * @param manifest - Baseline manifest supplied to the validator.
 * @param git - Controlled Git boundary supplied to the validator.
 * @param referenceRoot - Local checkout root supplied to the validator.
 * @param fields - Expected deterministic issue field sequence.
 * @returns A promise resolving after structured error assertions complete.
 */
async function expectValidationFailure(
  manifest: BaselineManifest,
  git: GitExecutor,
  referenceRoot: string,
  fields: readonly string[],
): Promise<void> {
  try {
    await validateBaseline(manifest, { git, referenceRoot });
    throw new Error("Expected baseline validation to fail.");
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(BaselineValidationError);
    expect((error as BaselineValidationError).issues.map(selectIssueField)).toEqual(fields);
  }
}

/**
 * Extracts one stable issue field for deterministic error-order assertions.
 *
 * @param issue - Structured validation issue to inspect.
 * @returns The issue's stable field name.
 */
function selectIssueField(issue: BaselineValidationError["issues"][number]): string {
  return issue.field;
}
