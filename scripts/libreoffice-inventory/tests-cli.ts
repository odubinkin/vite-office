/**
 * @fileoverview Implements the explicit write-command that validates the pinned baseline and generates canonical gbuild test-constructor records.
 */

import { readFile, writeFile } from "node:fs/promises";

import { isDirectModule } from "./cli";
import type { CoreTestKind } from "./contracts";
import type { GitExecutor } from "./git";
import { createGitExecutor } from "./git";
import { validateBaseline } from "./inventory";
import { parseBaselineManifest } from "./manifest";
import { createCoreTestInventory } from "./tests";

const testKinds: readonly CoreTestKind[] = ["CppunitTest", "JunitTest", "PythonTest", "UITest"];

/** Defines explicit paths accepted by the core test-inventory command. */
export interface TestCliOptions {
  /** UTF-8 baseline manifest path. */
  readonly baselinePath: string;
  /** Explicit generated JSON destination. */
  readonly outputPath: string;
  /** Ignored validated core checkout root. */
  readonly referenceRoot: string;
}

/**
 * Parses the strict core test-inventory command options.
 *
 * @param argumentsList - Process arguments after executable and script paths.
 * @returns All required explicit input and output paths.
 * @throws {Error} When an option is unknown, duplicated, missing, or blank.
 */
export function parseTestCliOptions(argumentsList: readonly string[]): TestCliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (option !== "--baseline" && option !== "--reference-root" && option !== "--output") {
      throw new Error(`Unsupported test inventory option: ${option}`);
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
      "Usage: inventory:tests -- --baseline <path> --reference-root <path> --output <path>",
    );
  }
  return { baselinePath, outputPath, referenceRoot };
}

/**
 * Validates the complete baseline and writes canonical gbuild test-constructor JSON to the selected destination.
 *
 * @param argumentsList - CLI arguments after the script path.
 * @param readTextFile - UTF-8 manifest reader boundary.
 * @param writeTextFile - Explicit generated-output writer boundary.
 * @param git - Optional local read-only Git boundary.
 * @returns A promise resolving after canonical test inventory is written.
 */
export async function runTestCli(
  argumentsList: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
  writeTextFile: (filePath: string, contents: string) => Promise<void>,
  git: GitExecutor = createGitExecutor(),
): Promise<void> {
  const options = parseTestCliOptions(argumentsList);
  const manifest = parseBaselineManifest(await readTextFile(options.baselinePath));
  await validateBaseline(manifest, { git, referenceRoot: options.referenceRoot });
  const outputEntries = await Promise.all(
    testKinds.map(
      /**
       * Reads one exact constructor-family grep stream from the validated core checkout.
       *
       * @param kind - Supported gbuild constructor family.
       * @returns A promise resolving to the family and its raw Git grep output.
       */
      async function readKind(kind: CoreTestKind): Promise<readonly [CoreTestKind, string]> {
        const output = await git.run(options.referenceRoot, ["grep", "-n", `gb_${kind}_${kind}`]);
        return [kind, output];
      },
    ),
  );
  const grepOutputByKind = Object.fromEntries(outputEntries) as Record<CoreTestKind, string>;
  const inventory = createCoreTestInventory(manifest.commit, grepOutputByKind);
  await writeTextFile(options.outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
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
 * Writes canonical UTF-8 generated inventory JSON to an explicit caller-selected destination.
 *
 * @param filePath - Destination path whose parent already exists.
 * @param contents - Full canonical JSON text with a trailing newline.
 * @returns A promise resolving after the generated artifact is written.
 */
export async function writeUtf8File(filePath: string, contents: string): Promise<void> {
  await writeFile(filePath, contents, "utf8");
}

/* v8 ignore next 6 -- task-level regeneration exercises the entrypoint; injected boundaries cover command logic. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runTestCli(process.argv.slice(2), readUtf8File, writeUtf8File);
}
