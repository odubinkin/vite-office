/**
 * @fileoverview Implements the explicit write-command that validates the pinned baseline and generates canonical LibreOffice PO catalog metadata.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isDirectModule } from "./cli";
import type { GitExecutor } from "./git";
import { createGitExecutor } from "./git";
import { validateBaseline } from "./inventory";
import { parseBaselineManifest } from "./manifest";
import { createTranslationCatalogInventory } from "./translations";

/** Defines explicit paths accepted by the translation-catalog inventory command. */
export interface TranslationCatalogCliOptions {
  /** UTF-8 baseline manifest path. */
  readonly baselinePath: string;
  /** Explicit generated JSON destination path. */
  readonly outputPath: string;
  /** Ignored core checkout root whose translations submodule is inspected read-only. */
  readonly referenceRoot: string;
}

/**
 * Parses strict translation-catalog inventory command options.
 *
 * @param argumentsList - Process arguments after executable and script paths.
 * @returns Explicit manifest, checkout, and output paths.
 * @throws {Error} When options are unknown, duplicated, missing, or blank.
 */
export function parseTranslationCatalogCliOptions(
  argumentsList: readonly string[],
): TranslationCatalogCliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (option !== "--baseline" && option !== "--reference-root" && option !== "--output") {
      throw new Error(`Unsupported translation catalog inventory option: ${option}`);
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
      "Usage: inventory:translations -- --baseline <path> --reference-root <path> --output <path>",
    );
  }
  return { baselinePath, outputPath, referenceRoot };
}

/**
 * Validates the full baseline and writes canonical PO catalog metadata to the caller-selected output path.
 *
 * @param argumentsList - CLI arguments after the script path.
 * @param readTextFile - UTF-8 baseline manifest reader boundary.
 * @param writeTextFile - Explicit generated-output writer boundary.
 * @param git - Optional local read-only Git boundary.
 * @returns A promise resolving after canonical catalog inventory output is written.
 */
export async function runTranslationCatalogCli(
  argumentsList: readonly string[],
  readTextFile: (filePath: string) => Promise<string>,
  writeTextFile: (filePath: string, contents: string) => Promise<void>,
  git: GitExecutor = createGitExecutor(),
): Promise<void> {
  const options = parseTranslationCatalogCliOptions(argumentsList);
  const manifest = parseBaselineManifest(await readTextFile(options.baselinePath));
  await validateBaseline(manifest, { git, referenceRoot: options.referenceRoot });
  const translationsCorpus = manifest.corpora.find(
    isTranslationsCorpus,
  ) as (typeof manifest.corpora)[number];
  const translationsRoot = path.join(
    options.referenceRoot,
    path.relative(manifest.referencePath, translationsCorpus.referencePath),
  );
  const paths = (await git.run(translationsRoot, ["ls-files", "-z"]))
    .split("\0")
    .filter(isNonEmptyPath);
  const inventory = createTranslationCatalogInventory(translationsCorpus.commit, paths);
  await writeTextFile(options.outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
}

/**
 * Identifies the pinned translations corpus declaration from the validated manifest.
 *
 * @param corpus - One validated corpus declaration.
 * @param corpus.id - Stable identifier of the candidate corpus.
 * @returns True only for the translations corpus.
 */
function isTranslationsCorpus(corpus: { readonly id: string }): boolean {
  return corpus.id === "translations";
}

/**
 * Determines whether a split NUL-delimited Git output field represents a path.
 *
 * @param pathValue - Candidate split output field.
 * @returns True only for non-empty fields.
 */
function isNonEmptyPath(pathValue: string): boolean {
  return pathValue.length > 0;
}

/**
 * Reads one UTF-8 manifest file through the production Node filesystem boundary.
 *
 * @param filePath - Existing manifest path to read without mutation.
 * @returns A promise resolving to UTF-8 manifest contents.
 */
export async function readUtf8File(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

/**
 * Writes generated UTF-8 JSON to an explicit caller-selected destination.
 *
 * @param filePath - Existing-parent destination path.
 * @param contents - Complete canonical JSON text with one trailing newline.
 * @returns A promise resolving after output is written.
 */
export async function writeUtf8File(filePath: string, contents: string): Promise<void> {
  await writeFile(filePath, contents, "utf8");
}

/* v8 ignore next 6 -- task-level regeneration exercises production entrypoint while injected boundaries cover logic. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runTranslationCatalogCli(process.argv.slice(2), readUtf8File, writeUtf8File);
}
