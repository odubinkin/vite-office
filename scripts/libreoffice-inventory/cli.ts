/**
 * @fileoverview Implements the side-effect-free command-line entrypoint for validating and serializing the pinned LibreOffice baseline.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { createGitExecutor } from "./git";
import type { GitExecutor } from "./git";
import { validateBaseline } from "./inventory";
import { parseBaselineManifest } from "./manifest";

/** Defines the explicit file and checkout arguments accepted by the inventory CLI. */
export interface CliOptions {
  /** UTF-8 baseline manifest path to parse. */
  readonly baselinePath: string;
  /** Local ignored core checkout path to inspect read-only. */
  readonly referenceRoot: string;
}

/**
 * Parses inventory CLI flags without accepting positional values or unrecognized options.
 *
 * @param argumentsList - Process arguments after the executable and script paths.
 * @returns Explicit inventory CLI options.
 * @throws {Error} When a required option is missing or an unsupported option is supplied.
 */
export function parseCliOptions(argumentsList: readonly string[]): CliOptions {
  let baselinePath: string | undefined;
  let referenceRoot: string | undefined;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const nextArgument = argumentsList[index + 1];

    if (argument === "--baseline") {
      baselinePath = requireOptionValue(argument, nextArgument);
      index += 1;
    } else if (argument === "--reference-root") {
      referenceRoot = requireOptionValue(argument, nextArgument);
      index += 1;
    } else {
      throw new Error(`Unsupported inventory option: ${argument}`);
    }
  }

  if (baselinePath === undefined || referenceRoot === undefined) {
    throw new Error("Usage: inventory:validate -- --baseline <path> --reference-root <path>");
  }

  return { baselinePath, referenceRoot };
}

/**
 * Runs the inventory CLI against injected process boundaries for deterministic unit testing.
 *
 * @param argumentsList - CLI flags after the script path.
 * @param readTextFile - Asynchronous UTF-8 file reader boundary.
 * @param writeOutput - Standard-output boundary receiving canonical JSON plus a newline.
 * @param git - Optional Git boundary; production defaults to the local read-only executor.
 * @returns A promise resolving after successful validation output is written.
 */
export async function runCli(
  argumentsList: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
  writeOutput: (output: string) => void,
  git: GitExecutor = createGitExecutor(),
): Promise<void> {
  const options = parseCliOptions(argumentsList);
  const manifest = parseBaselineManifest(await readTextFile(options.baselinePath));
  const report = await validateBaseline(manifest, {
    git,
    referenceRoot: options.referenceRoot,
  });

  writeOutput(`${JSON.stringify(report, null, 2)}\n`);
}

/**
 * Requires the non-empty value that follows one known CLI option.
 *
 * @param option - Recognized option that requires a following value.
 * @param value - Candidate following argument.
 * @returns The non-empty option value.
 * @throws {Error} When the value is missing, blank, or another option.
 */
function requireOptionValue(option: string, value: string | undefined): string {
  if (value === undefined || value.length === 0 || value.startsWith("--")) {
    throw new Error(`Option ${option} requires a non-empty value.`);
  }

  return value;
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
 * Determines whether a module URL corresponds to the process entry script without comparing platform-specific URL syntax.
 *
 * @param moduleUrl - URL of the current ECMAScript module.
 * @param entryPath - Optional path supplied by the current Node-compatible runtime.
 * @returns True only when the module is the executing CLI entrypoint.
 */
export function isDirectModule(moduleUrl: string, entryPath: string | undefined): boolean {
  return entryPath !== undefined && fileURLToPath(moduleUrl) === entryPath;
}

/* v8 ignore next 11 -- exercised by the task's live CLI verification, while unit tests cover the called boundaries. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runCli(
    process.argv.slice(2),
    readUtf8File,
    /**
     * Writes canonical JSON to standard output for shell and CI consumers.
     *
     * @param output - Complete JSON report with one trailing newline.
     * @returns Nothing after output is written.
     */
    function writeStandardOutput(output: string): void {
      process.stdout.write(output);
    },
  );
}
