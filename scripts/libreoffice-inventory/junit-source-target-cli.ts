/**
 * @fileoverview Implements the explicit write-command that validates the pinned core checkout and generates canonical JunitTest Java source-target provenance records.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isDirectModule } from "./cli";
import type { CoreTestInventory } from "./contracts";
import { extractGbuildSourceTargets } from "./gbuild-source-targets";
import type { GitExecutor } from "./git";
import { createGitExecutor } from "./git";
import { validateBaseline } from "./inventory";
import {
  createCoreJunitSourceTargetInventory,
  type JunitSourceTargetDeclaration,
} from "./junit-source-target-inventory";
import { parseBaselineManifest } from "./manifest";

/** Defines explicit paths accepted by the JunitTest Java source-target inventory command. */
export interface JunitSourceTargetCliOptions {
  /** UTF-8 core test-constructor inventory path used for constructor ID linkage. */
  readonly constructorsPath: string;
  /** UTF-8 baseline manifest path. */
  readonly baselinePath: string;
  /** Explicit generated JSON destination path. */
  readonly outputPath: string;
  /** Ignored validated core checkout root. */
  readonly referenceRoot: string;
}

/**
 * Parses strict JunitTest Java source-target inventory command options.
 *
 * @param argumentsList - Process arguments after executable and script paths.
 * @returns All required explicit input and output paths.
 * @throws {Error} When an option is unknown, duplicated, missing, or blank.
 */
export function parseJunitSourceTargetCliOptions(
  argumentsList: readonly string[],
): JunitSourceTargetCliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (
      option !== "--baseline" &&
      option !== "--reference-root" &&
      option !== "--constructors" &&
      option !== "--output"
    ) {
      throw new Error(`Unsupported Junit source-target inventory option: ${option}`);
    }
    if (value === undefined || value.length === 0 || value.startsWith("--")) {
      throw new Error(`Option ${option} requires a non-empty value.`);
    }
    if (values.has(option)) {
      throw new Error(`Option ${option} may be supplied only once.`);
    }
    values.set(option, value);
    index += 1;
  }

  const baselinePath = values.get("--baseline");
  const constructorsPath = values.get("--constructors");
  const outputPath = values.get("--output");
  const referenceRoot = values.get("--reference-root");
  if (
    baselinePath === undefined ||
    constructorsPath === undefined ||
    outputPath === undefined ||
    referenceRoot === undefined
  ) {
    throw new Error(
      "Usage: inventory:junit-source-targets -- --baseline <path> --reference-root <path> --constructors <path> --output <path>",
    );
  }
  return { baselinePath, constructorsPath, outputPath, referenceRoot };
}

/**
 * Validates the full baseline, links JunitTest source declarations to constructor IDs, and writes canonical Java source-target JSON.
 *
 * @param argumentsList - CLI arguments after the script path.
 * @param readTextFile - UTF-8 reader boundary for manifest, constructor inventory, and pinned makefiles.
 * @param writeTextFile - Explicit generated-output writer boundary.
 * @param git - Optional local read-only Git boundary.
 * @returns A promise resolving after canonical Junit source-target inventory output is written.
 */
export async function runJunitSourceTargetCli(
  argumentsList: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
  writeTextFile: (filePath: string, contents: string) => Promise<void>,
  git: GitExecutor = createGitExecutor(),
): Promise<void> {
  const options = parseJunitSourceTargetCliOptions(argumentsList);
  const manifest = parseBaselineManifest(await readTextFile(options.baselinePath));
  await validateBaseline(manifest, { git, referenceRoot: options.referenceRoot });
  const constructors = JSON.parse(
    await readTextFile(options.constructorsPath),
  ) as CoreTestInventory;
  const trackedPaths = splitGitPaths(await git.run(options.referenceRoot, ["ls-files", "-z"]));
  const declarations = await readJunitSourceTargetDeclarations(
    options.referenceRoot,
    trackedPaths.filter(isJunitTestMakefilePath),
    readTextFile,
  );
  const inventory = createCoreJunitSourceTargetInventory(
    manifest.commit,
    constructors,
    declarations,
    trackedPaths,
  );
  await writeTextFile(options.outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
}

/**
 * Reads and parses all JunitTest makefiles that may hold Java source-target declarations.
 *
 * @param referenceRoot - Validated local core checkout root.
 * @param makefilePaths - Git-tracked JunitTest makefile paths to inspect.
 * @param readTextFile - UTF-8 file reader boundary.
 * @returns Parsed Java source-target declarations carrying exact makefile provenance.
 */
async function readJunitSourceTargetDeclarations(
  referenceRoot: string,
  makefilePaths: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
): Promise<readonly JunitSourceTargetDeclaration[]> {
  const declarationsByMakefile = await Promise.all(
    makefilePaths.map(
      /**
       * Reads one pinned makefile and attaches its relative path to every parsed Java source target.
       *
       * @param declarationPath - Exact Git-tracked makefile path.
       * @returns A promise resolving to parsed declarations from this makefile.
       */
      async function readMakefile(
        declarationPath: string,
      ): Promise<readonly JunitSourceTargetDeclaration[]> {
        const sourceText = await readTextFile(path.join(referenceRoot, declarationPath));
        return extractGbuildSourceTargets(sourceText, "gb_JunitTest_add_sourcefiles").map(
          /**
           * Attaches immutable makefile provenance to one parsed Java target.
           *
           * @param target - Parsed JunitTest target without source text retention.
           * @returns One declaration record ready for constructor linkage.
           */
          function attachDeclarationPath(target): JunitSourceTargetDeclaration {
            return { ...target, declarationPath };
          },
        );
      },
    ),
  );
  return declarationsByMakefile.flat();
}

/**
 * Splits NUL-delimited Git output while preserving every non-empty repository-relative path.
 *
 * @param output - Raw standard output emitted by git ls-files -z.
 * @returns Individual tracked paths without the terminal empty field.
 */
function splitGitPaths(output: string): readonly string[] {
  return output.split("\0").filter(isNonEmptyPath);
}

/**
 * Determines whether a tracked path may contain JunitTest Java source-target declarations.
 *
 * @param pathValue - Exact Git-tracked core path to inspect.
 * @returns True only for JunitTest-named makefiles.
 */
function isJunitTestMakefilePath(pathValue: string): boolean {
  return pathValue.includes("JunitTest") && pathValue.endsWith(".mk");
}

/**
 * Determines whether one split Git output field represents a real tracked path.
 *
 * @param pathValue - Candidate split output field.
 * @returns True only for non-empty fields.
 */
function isNonEmptyPath(pathValue: string): boolean {
  return pathValue.length > 0;
}

/**
 * Reads one UTF-8 file through the production filesystem boundary.
 *
 * @param filePath - Existing manifest, constructor inventory, or pinned makefile path.
 * @returns A promise resolving to UTF-8 file contents.
 */
export async function readUtf8File(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

/**
 * Writes canonical UTF-8 generated inventory JSON to an explicit caller-selected destination.
 *
 * @param filePath - Destination path whose parent already exists.
 * @param contents - Complete canonical JSON document with one trailing newline.
 * @returns A promise resolving after output is written.
 */
export async function writeUtf8File(filePath: string, contents: string): Promise<void> {
  await writeFile(filePath, contents, "utf8");
}

/* v8 ignore next 6 -- task-level regeneration exercises the entrypoint; injected boundaries cover command logic. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runJunitSourceTargetCli(process.argv.slice(2), readUtf8File, writeUtf8File);
}
