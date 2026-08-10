/**
 * @fileoverview Implements the explicit write-command that validates the pinned core checkout and generates canonical Cppunit registration provenance records.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isDirectModule } from "./cli";
import type { CoreTestSourceTargetInventory } from "./contracts";
import { extractCppunitRegistrations } from "./cppunit-registrations";
import {
  createCoreCppunitRegistrationInventory,
  type CppunitRegistrationDeclaration,
} from "./cppunit-registration-inventory";
import type { GitExecutor } from "./git";
import { createGitExecutor } from "./git";
import { validateBaseline } from "./inventory";
import { parseBaselineManifest } from "./manifest";

/** Defines explicit paths accepted by the Cppunit registration inventory command. */
export interface CppunitRegistrationCliOptions {
  /** UTF-8 baseline manifest path. */
  readonly baselinePath: string;
  /** Explicit generated JSON destination path. */
  readonly outputPath: string;
  /** Ignored validated core checkout root. */
  readonly referenceRoot: string;
  /** UTF-8 Cppunit source-target inventory path used for constructor and source-target linkage. */
  readonly sourceTargetsPath: string;
}

/**
 * Parses strict Cppunit registration inventory command options.
 *
 * @param argumentsList - Process arguments after executable and script paths.
 * @returns All required explicit input and output paths.
 * @throws {Error} When an option is unknown, duplicated, missing, or blank.
 */
export function parseCppunitRegistrationCliOptions(
  argumentsList: readonly string[],
): CppunitRegistrationCliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (
      option !== "--baseline" &&
      option !== "--reference-root" &&
      option !== "--source-targets" &&
      option !== "--output"
    ) {
      throw new Error(`Unsupported Cppunit registration inventory option: ${option}`);
    }
    if (value === undefined || value.length === 0 || value.startsWith("--")) {
      throw new Error(`Option ${option} requires a non-empty value.`);
    }
    if (values.has(option)) throw new Error(`Option ${option} may be supplied only once.`);
    values.set(option, value);
    index += 1;
  }
  const baselinePath = values.get("--baseline");
  const outputPath = values.get("--output");
  const referenceRoot = values.get("--reference-root");
  const sourceTargetsPath = values.get("--source-targets");
  if (
    baselinePath === undefined ||
    outputPath === undefined ||
    referenceRoot === undefined ||
    sourceTargetsPath === undefined
  ) {
    throw new Error(
      "Usage: inventory:cppunit-registrations -- --baseline <path> --reference-root <path> --source-targets <path> --output <path>",
    );
  }
  return { baselinePath, outputPath, referenceRoot, sourceTargetsPath };
}

/**
 * Validates the full baseline, parses Cppunit registrations only from inventoried physical source targets, and writes canonical JSON.
 *
 * @param argumentsList - CLI arguments after the script path.
 * @param readTextFile - UTF-8 reader boundary for manifest, source-target inventory, and pinned C++ files.
 * @param writeTextFile - Explicit generated-output writer boundary.
 * @param git - Optional local read-only Git boundary.
 * @returns A promise resolving after canonical Cppunit registration inventory output is written.
 */
export async function runCppunitRegistrationCli(
  argumentsList: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
  writeTextFile: (filePath: string, contents: string) => Promise<void>,
  git: GitExecutor = createGitExecutor(),
): Promise<void> {
  const options = parseCppunitRegistrationCliOptions(argumentsList);
  const manifest = parseBaselineManifest(await readTextFile(options.baselinePath));
  await validateBaseline(manifest, { git, referenceRoot: options.referenceRoot });
  const sourceTargets = JSON.parse(
    await readTextFile(options.sourceTargetsPath),
  ) as CoreTestSourceTargetInventory;
  const declarations = await readCppunitRegistrationDeclarations(
    options.referenceRoot,
    sourceTargets,
    readTextFile,
  );
  const inventory = createCoreCppunitRegistrationInventory(
    manifest.commit,
    sourceTargets,
    declarations,
  );
  await writeTextFile(options.outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
}

/**
 * Reads physical Cppunit source targets and attaches exact source paths to every parsed registration.
 *
 * @param referenceRoot - Validated local core checkout root.
 * @param sourceTargets - Existing source-target provenance inventory that limits readable physical sources.
 * @param readTextFile - UTF-8 file reader boundary.
 * @returns Parsed Cppunit registration declarations carrying exact physical source-path provenance.
 */
async function readCppunitRegistrationDeclarations(
  referenceRoot: string,
  sourceTargets: CoreTestSourceTargetInventory,
  readTextFile: (filePath: string) => Promise<string>,
): Promise<readonly CppunitRegistrationDeclaration[]> {
  const sourcePaths = sourceTargets.records.filter(isTrackedSourceTarget).map(selectSourcePath);
  const declarationsByPath = await Promise.all(
    sourcePaths.map(
      /**
       * Reads one pinned physical Cppunit source file and attaches its path to parsed registrations.
       *
       * @param sourcePath - Exact Git-tracked core-relative C++ source path.
       * @returns A promise resolving to parsed registrations from one C++ file.
       */
      async function readSourcePath(
        sourcePath: string,
      ): Promise<readonly CppunitRegistrationDeclaration[]> {
        const sourceText = await readTextFile(path.join(referenceRoot, sourcePath));
        return extractCppunitRegistrations(sourceText).map(
          /**
           * Attaches immutable physical source-path provenance to one parsed registration.
           *
           * @param registration - Parsed Cppunit registration without source text retention.
           * @returns One declaration record ready for source-target linkage.
           */
          function attachSourcePath(registration): CppunitRegistrationDeclaration {
            return { ...registration, sourcePath };
          },
        );
      },
    ),
  );
  return declarationsByPath.flat();
}

/**
 * Determines whether a Cppunit source-target record owns a physical tracked source file.
 *
 * @param record - Candidate Cppunit source-target record.
 * @returns True only for tracked physical paths eligible for registration parsing.
 */
function isTrackedSourceTarget(record: CoreTestSourceTargetInventory["records"][number]): boolean {
  return record.targetStatus === "tracked" && record.sourcePath !== null;
}

/**
 * Extracts a non-null physical source path after the tracked-target predicate has filtered records.
 *
 * @param record - Tracked physical Cppunit source-target record.
 * @returns Exact core-repository-relative C++ source path.
 * @throws {Error} When a malformed tracked record lacks its required source path.
 */
function selectSourcePath(record: CoreTestSourceTargetInventory["records"][number]): string {
  /* v8 ignore next -- source paths pass through isTrackedSourceTarget before this selector runs. */
  if (record.sourcePath === null)
    throw new Error("Tracked Cppunit source target lacks a physical source path.");
  return record.sourcePath;
}

/**
 * Reads one UTF-8 file through the production filesystem boundary.
 *
 * @param filePath - Existing manifest, source-target inventory, or pinned C++ source path.
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
  await runCppunitRegistrationCli(process.argv.slice(2), readUtf8File, writeUtf8File);
}
