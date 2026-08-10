/**
 * @fileoverview Reports authored files above 500 physical lines and rejects files at or above 1,000 lines.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const reviewThreshold = 500;
const failureThreshold = 1_000;
const excludedDirectories = new Set([
  ".agentplane",
  ".git",
  "coverage",
  "dist",
  "node_modules",
  "output",
  "playwright-report",
  "test-results",
  "vendor",
]);
const excludedFiles = new Set(["package-lock.json"]);
const generatedPathPrefixes = ["docs/program/inventory/"];

/**
 * Determines whether a directory is generated, vendored, or lifecycle-owned and therefore excluded.
 *
 * @param directoryName - Basename of the directory being considered.
 * @returns True when authored-file size policy must not scan the directory.
 */
function isExcludedDirectory(directoryName) {
  return excludedDirectories.has(directoryName);
}

/**
 * Determines whether a tracked generated inventory artifact is intentionally excluded from authored-module size policy.
 *
 * @param relativePath - Repository-relative path considered by the size scanner.
 * @returns True only for documented generated inventory artifacts, never authored source or prose.
 */
function isGeneratedInventoryArtifact(relativePath) {
  return generatedPathPrefixes.some(
    /**
     * Checks one explicit generated-artifact prefix against the current relative path.
     *
     * @param prefix - Repository-relative generated-artifact prefix.
     * @returns True when the current path begins with the configured prefix.
     */
    function hasGeneratedPrefix(prefix) {
      return relativePath.startsWith(prefix);
    },
  );
}

/**
 * Recursively collects authored files while preserving deterministic lexical order.
 *
 * @param directoryPath - Absolute directory path to inspect without mutation.
 * @returns A promise resolving to absolute authored-file paths below the directory.
 */
async function collectAuthoredFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  entries.sort(
    /**
     * Orders directory entries by portable lexical basename.
     *
     * @param left - First directory entry to compare.
     * @param right - Second directory entry to compare.
     * @returns A negative, zero, or positive locale comparison result.
     */
    function compareEntries(left, right) {
      return left.name.localeCompare(right.name);
    },
  );

  for (const entry of entries) {
    if (entry.isDirectory() && isExcludedDirectory(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectAuthoredFiles(entryPath)));
    } else if (entry.isFile() && !excludedFiles.has(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * Counts physical lines consistently for empty, Unix, and trailing-newline files.
 *
 * @param sourceText - Complete UTF-8 file contents.
 * @returns The number of physical lines represented by the contents.
 */
function countPhysicalLines(sourceText) {
  if (sourceText.length === 0) {
    return 0;
  }

  return sourceText.split(/\r?\n/u).length;
}

/**
 * Scans authored files, reports decomposition candidates, and fails mandatory decomposition cases.
 *
 * @returns A promise that resolves after reporting or rejects only on filesystem errors.
 */
async function main() {
  const files = await collectAuthoredFiles(repositoryRoot);
  const reviewCandidates = [];
  const failures = [];

  for (const filePath of files) {
    const relativePath = path.relative(repositoryRoot, filePath);
    if (isGeneratedInventoryArtifact(relativePath)) {
      continue;
    }

    const sourceText = await readFile(filePath, "utf8");
    const lineCount = countPhysicalLines(sourceText);

    if (lineCount >= failureThreshold) {
      failures.push(`${relativePath}: ${lineCount} lines`);
    } else if (lineCount > reviewThreshold) {
      reviewCandidates.push(`${relativePath}: ${lineCount} lines`);
    }
  }

  console.log(`File-size check scanned ${files.length} authored files.`);
  console.log(
    reviewCandidates.length === 0
      ? "No authored files exceed 500 lines."
      : `Decomposition review candidates:\n${reviewCandidates.join("\n")}`,
  );

  if (failures.length > 0) {
    throw new Error(`Authored files at or above 1,000 lines:\n${failures.join("\n")}`);
  }
}

await main();
