/**
 * @fileoverview Validates file overviews and declaration-level JSDoc across authored JavaScript and TypeScript.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const repositoryRoot = process.cwd();
const authoredRoots = ["apps", "scripts"];
const authoredRootFiles = ["eslint.config.js", "prettier.config.js"];
const sourceExtensions = new Set([".js", ".mjs", ".ts", ".tsx"]);
const excludedDirectories = new Set(["coverage", "dist", "node_modules", "playwright-report"]);

/**
 * Recursively collects authored source files from one approved code root.
 *
 * @param directoryPath - Absolute source directory to inspect without mutation.
 * @returns A promise resolving to deterministic absolute source paths.
 */
async function collectSourceFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  entries.sort(
    /**
     * Orders source entries by portable lexical basename.
     *
     * @param left - First source entry to compare.
     * @param right - Second source entry to compare.
     * @returns A negative, zero, or positive locale comparison result.
     */
    function compareEntries(left, right) {
      return left.name.localeCompare(right.name);
    },
  );

  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * Returns the nearest leading JSDoc block attached to a syntax node.
 *
 * @param sourceText - Complete source text containing the node.
 * @param node - TypeScript syntax node whose leading documentation is required.
 * @returns The JSDoc block text, or null when no block is attached.
 */
function getLeadingJsdoc(sourceText, node) {
  const ranges = ts.getLeadingCommentRanges(sourceText, node.getFullStart()) ?? [];

  for (let index = ranges.length - 1; index >= 0; index -= 1) {
    const range = ranges[index];
    const commentText = sourceText.slice(range.pos, range.end);
    if (commentText.startsWith("/**")) {
      return commentText;
    }
  }

  const prefixStart = Math.max(0, node.getStart() - 4_000);
  const immediatePrefix = sourceText.slice(prefixStart, node.getStart());
  const documentationPattern = /\/\*\*[\s\S]*?\*\//gu;
  let nearestDocumentation = null;
  let documentationMatch = documentationPattern.exec(immediatePrefix);

  while (documentationMatch !== null) {
    nearestDocumentation = documentationMatch;
    documentationMatch = documentationPattern.exec(immediatePrefix);
  }

  if (nearestDocumentation !== null) {
    const documentationEnd = nearestDocumentation.index + nearestDocumentation[0].length;
    const trailingText = immediatePrefix.slice(documentationEnd);
    if (
      /^\s*(?:(?:\/\* v8 ignore next[^*]*\*\/|\/\* eslint-disable-next-line jsdoc\/require-jsdoc \*\/)\s*)*(?:[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\s*=\s*|[A-Za-z_$][\w$]*\s*:\s*)?,?\s*$/u.test(
        trailingText,
      )
    ) {
      return nearestDocumentation[0];
    }
  }

  return null;
}

/**
 * Identifies authored function bodies that require purpose, parameter, and return documentation.
 *
 * @param node - TypeScript syntax node encountered during traversal.
 * @returns True for executable authored function and method declarations.
 */
function isDocumentedFunction(node) {
  return (
    ts.isArrowFunction(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

/**
 * Identifies authored type and class declarations that require descriptive documentation.
 *
 * @param node - TypeScript syntax node encountered during traversal.
 * @returns True for a class, enum, interface, or type alias declaration.
 */
function isDocumentedType(node) {
  return (
    ts.isClassDeclaration(node) ||
    ts.isEnumDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node)
  );
}

/**
 * Produces a stable line number for a declaration diagnostic.
 *
 * @param sourceFile - Parsed source file containing the declaration.
 * @param node - Syntax node whose start position should be reported.
 * @returns One-based physical line number for the node start.
 */
function getLineNumber(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

/**
 * Validates one function's attached JSDoc parameter and return contract.
 *
 * @param sourceFile - Parsed source file containing the function.
 * @param node - Executable function declaration under validation.
 * @param errors - Mutable diagnostic collection owned by the current file validation.
 * @returns Nothing; any violations are appended to the provided diagnostic collection.
 */
function validateFunction(sourceFile, node, errors) {
  const documentation = getLeadingJsdoc(sourceFile.text, node);
  const lineNumber = getLineNumber(sourceFile, node);

  if (documentation === null) {
    errors.push(`${sourceFile.fileName}:${lineNumber} function is missing JSDoc`);
    return;
  }

  const parameterTags = documentation.match(/@param\b/gu) ?? [];
  if (parameterTags.length < node.parameters.length) {
    errors.push(
      `${sourceFile.fileName}:${lineNumber} function documents ${parameterTags.length}/${node.parameters.length} parameters`,
    );
  }

  if (!documentation.includes("@returns")) {
    errors.push(`${sourceFile.fileName}:${lineNumber} function is missing @returns`);
  }
}

/**
 * Validates one authored file's overview and declaration documentation.
 *
 * @param filePath - Absolute JavaScript or TypeScript path to parse without mutation.
 * @returns A promise resolving to all documentation diagnostics for the file.
 */
async function validateSourceFile(filePath) {
  const sourceText = await readFile(filePath, "utf8");
  const relativePath = path.relative(repositoryRoot, filePath);
  const scriptKind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    relativePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const errors = [];

  if (!sourceText.trimStart().startsWith("/**") || !sourceText.includes("@fileoverview")) {
    errors.push(`${relativePath}:1 file is missing an opening @fileoverview JSDoc block`);
  }

  /**
   * Traverses declarations recursively and delegates detailed validation by declaration kind.
   *
   * @param node - Current TypeScript syntax node in depth-first traversal order.
   * @returns Nothing; diagnostics accumulate in the enclosing file collection.
   */
  function visitNode(node) {
    if (isDocumentedFunction(node)) {
      validateFunction(sourceFile, node, errors);
    } else if (isDocumentedType(node) && getLeadingJsdoc(sourceText, node) === null) {
      errors.push(`${relativePath}:${getLineNumber(sourceFile, node)} type is missing JSDoc`);
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return errors;
}

/**
 * Validates every authored source file and fails with a deterministic diagnostic list.
 *
 * @returns A promise that resolves after reporting or rejects when documentation is incomplete.
 */
async function main() {
  const files = [];

  for (const rootPath of authoredRoots) {
    files.push(...(await collectSourceFiles(path.join(repositoryRoot, rootPath))));
  }

  for (const rootFile of authoredRootFiles) {
    files.push(path.join(repositoryRoot, rootFile));
  }

  files.sort();
  const errors = [];
  for (const filePath of files) {
    errors.push(...(await validateSourceFile(filePath)));
  }

  if (errors.length > 0) {
    throw new Error(`JSDoc validation failed:\n${errors.join("\n")}`);
  }

  console.log(`JSDoc validation passed for ${files.length} authored source files.`);
}

await main();
