/**
 * @fileoverview Provides a strict read-only command-line validator for authored parity mapping manifests and their pinned upstream and local evidence paths.
 */

import { readFile } from "node:fs/promises";

import { isDirectModule } from "./cli";
import { parseBaselineManifest } from "./manifest";
import { parseParityMappingManifest, validateParityMappingEvidence } from "./parity-mappings";

/** Defines all explicit filesystem roots accepted by the parity mapping validator. */
export interface ParityMappingCliOptions {
  /** UTF-8 project baseline manifest path. */
  readonly baselinePath: string;
  /** Authored parity mapping manifest path. */
  readonly mappingsPath: string;
  /** Root relative to which local implementation, test, and documentation paths resolve. */
  readonly localRoot: string;
  /** Root relative to which pinned LibreOffice source, test, and help paths resolve. */
  readonly upstreamRoot: string;
}

/**
 * Parses strict parity mapping CLI flags without positional or duplicated options.
 *
 * @param argumentsList - Command arguments after the script path.
 * @returns All required explicit mapping-validation paths.
 * @throws {Error} When an option is unsupported, repeated, missing, or blank.
 */
export function parseParityMappingCliOptions(
  argumentsList: readonly string[],
): ParityMappingCliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (
      option !== "--baseline" &&
      option !== "--mappings" &&
      option !== "--local-root" &&
      option !== "--upstream-root"
    ) {
      throw new Error(`Unsupported parity mapping option: ${option}`);
    }
    if (value === undefined || value.length === 0 || value.startsWith("--"))
      throw new Error(`Option ${option} requires a non-empty value.`);
    if (values.has(option)) throw new Error(`Option ${option} may be supplied only once.`);
    values.set(option, value);
    index += 1;
  }
  const baselinePath = values.get("--baseline");
  const localRoot = values.get("--local-root");
  const mappingsPath = values.get("--mappings");
  const upstreamRoot = values.get("--upstream-root");
  if (
    baselinePath === undefined ||
    localRoot === undefined ||
    mappingsPath === undefined ||
    upstreamRoot === undefined
  ) {
    throw new Error(
      "Usage: inventory:parity -- --baseline <path> --mappings <path> --local-root <path> --upstream-root <path>",
    );
  }
  return { baselinePath, localRoot, mappingsPath, upstreamRoot };
}

/**
 * Parses a baseline and mapping manifest, resolves every declared marker, and emits one canonical JSON report.
 *
 * @param argumentsList - Strict command arguments after the script path.
 * @param readTextFile - Injected UTF-8 reader for manifests and referenced evidence.
 * @param writeOutput - Output boundary receiving canonical report JSON with a trailing newline.
 * @returns A promise resolving after successful read-only validation.
 */
export async function runParityMappingCli(
  argumentsList: readonly string[],
  readTextFile: (path: string) => Promise<string>,
  writeOutput: (output: string) => void,
): Promise<void> {
  const options = parseParityMappingCliOptions(argumentsList);
  const baseline = parseBaselineManifest(await readTextFile(options.baselinePath));
  const manifest = parseParityMappingManifest(await readTextFile(options.mappingsPath), baseline);
  const report = await validateParityMappingEvidence(manifest, readTextFile, {
    local: options.localRoot,
    upstream: options.upstreamRoot,
  });
  writeOutput(`${JSON.stringify(report, null, 2)}\n`);
}

/**
 * Reads one UTF-8 file using the production Node filesystem boundary.
 *
 * @param path - Existing source, test, documentation, baseline, or mapping manifest path.
 * @returns A promise resolving to full UTF-8 file contents.
 */
export async function readUtf8File(path: string): Promise<string> {
  return readFile(path, "utf8");
}

/* v8 ignore next 10 -- direct shell execution is covered by task-level CLI validation; injected boundaries cover command behavior. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runParityMappingCli(
    process.argv.slice(2),
    readUtf8File,
    /**
     * Writes canonical report output for CI and shell consumers.
     *
     * @param output - Complete canonical report JSON with a trailing newline.
     * @returns Nothing after writing standard output.
     */
    function writeStandardOutput(output: string): void {
      process.stdout.write(output);
    },
  );
}
