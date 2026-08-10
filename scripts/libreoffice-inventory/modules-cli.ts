/**
 * @fileoverview Implements the explicit write-command that validates the pinned core checkout and generates its canonical Module_*.mk inventory.
 */

import { readFile, writeFile } from "node:fs/promises";

import type { GitExecutor } from "./git";
import { createGitExecutor } from "./git";
import { isDirectModule } from "./cli";
import { validateBaseline } from "./inventory";
import { parseBaselineManifest } from "./manifest";
import { createCoreModuleInventory } from "./modules";

/** Defines the three explicit paths accepted by the core-module inventory command. */
export interface ModuleCliOptions {
  /** Baseline JSON manifest path to parse. */
  readonly baselinePath: string;
  /** Generated JSON destination path explicitly selected by the caller. */
  readonly outputPath: string;
  /** Ignored local core checkout root to inspect read-only. */
  readonly referenceRoot: string;
}

/**
 * Parses the strict core-module inventory command-line options.
 *
 * @param argumentsList - Process arguments after the executable and script paths.
 * @returns All required paths selected by the caller.
 * @throws {Error} When options are unknown, duplicated, or missing a non-empty value.
 */
export function parseModuleCliOptions(argumentsList: readonly string[]): ModuleCliOptions {
  const values = new Map<string, string>();

  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (option !== "--baseline" && option !== "--reference-root" && option !== "--output") {
      throw new Error(`Unsupported module inventory option: ${option}`);
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
  const outputPath = values.get("--output");
  const referenceRoot = values.get("--reference-root");
  if (baselinePath === undefined || outputPath === undefined || referenceRoot === undefined) {
    throw new Error(
      "Usage: inventory:modules -- --baseline <path> --reference-root <path> --output <path>",
    );
  }

  return { baselinePath, outputPath, referenceRoot };
}

/**
 * Validates the full baseline then writes one canonical core-module inventory document.
 *
 * @param argumentsList - CLI flags after the script path.
 * @param readTextFile - UTF-8 file reader boundary for the baseline manifest.
 * @param writeTextFile - UTF-8 file writer boundary for the caller-selected generated output.
 * @param git - Optional Git boundary; production defaults to the local read-only executor.
 * @returns A promise resolving after canonical generated JSON is written.
 */
export async function runModuleCli(
  argumentsList: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
  writeTextFile: (filePath: string, contents: string) => Promise<void>,
  git: GitExecutor = createGitExecutor(),
): Promise<void> {
  const options = parseModuleCliOptions(argumentsList);
  const manifest = parseBaselineManifest(await readTextFile(options.baselinePath));
  await validateBaseline(manifest, { git, referenceRoot: options.referenceRoot });
  const paths = splitGitPaths(await git.run(options.referenceRoot, ["ls-files", "-z"]));
  const inventory = createCoreModuleInventory(manifest.commit, paths);

  await writeTextFile(options.outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
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
 * Determines whether a split Git output field represents a real tracked path.
 *
 * @param pathValue - Candidate split field.
 * @returns True only for non-empty path fields.
 */
function isNonEmptyPath(pathValue: string): boolean {
  return pathValue.length > 0;
}

/**
 * Reads one UTF-8 manifest file through the Node filesystem boundary.
 *
 * @param filePath - Existing manifest path to read without mutation.
 * @returns A promise resolving to UTF-8 file contents.
 */
export async function readUtf8File(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

/**
 * Writes canonical UTF-8 generated inventory JSON to the explicit caller-selected destination.
 *
 * @param filePath - Destination path whose parent must already exist.
 * @param contents - Complete canonical JSON document with one trailing newline.
 * @returns A promise resolving after the file is written.
 */
export async function writeUtf8File(filePath: string, contents: string): Promise<void> {
  await writeFile(filePath, contents, "utf8");
}

/* v8 ignore next 6 -- the write entrypoint is exercised by task-level regeneration; injected boundaries cover all logic. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runModuleCli(process.argv.slice(2), readUtf8File, writeUtf8File);
}
