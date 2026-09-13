/**
 * @fileoverview Enforces the approved LibreOffice-shaped runtime module dependency graph for Vite Office.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const sourceRoot = path.resolve("apps/office/src");
const moduleNames = ["editeng", "framework", "package", "sfx2", "svl", "sw", "vcl", "xmloff"];
const knownModules = new Set(moduleNames);
const allowedEdges = new Map([
  ["editeng", new Set(["svl"])],
  ["framework", new Set(["sfx2", "svl"])],
  ["package", new Set()],
  ["sfx2", new Set(["svl"])],
  ["svl", new Set()],
  ["sw", new Set(["editeng", "framework", "package", "sfx2", "svl", "vcl", "xmloff"])],
  ["vcl", new Set(["svl"])],
  ["xmloff", new Set()],
]);
const suiteModules = new Set(["sw"]);

/** Recursively collects runtime TypeScript sources in deterministic path order. @param directory - Directory to scan. @returns Ordered absolute source paths. */
function collectRuntimeSources(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap(
      /** Expands one directory entry into its recursively collected source files. @param entry - Filesystem entry to inspect. @returns Nested or direct file paths. */
      (entry) => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? collectRuntimeSources(entryPath) : [entryPath];
      },
    )
    .filter(
      /** Keeps authored runtime TypeScript while excluding colocated and shared tests. @param file - Candidate absolute path. @returns True for runtime source. */
      (file) =>
        /\.tsx?$/.test(file) &&
        !/\.test\.tsx?$/.test(file) &&
        !file.includes(`${path.sep}test${path.sep}`),
    )
    .sort();
}

/** Returns the configured module owning a source-relative path, or undefined for the composition root. @param relativePath - Path below apps/office/src. @returns Known module name or undefined. */
function getModule(relativePath) {
  const [candidate] = relativePath.split(path.sep);
  return candidate !== undefined && knownModules.has(candidate) ? candidate : undefined;
}

/** Formats one source path relative to the repository root. @param absolutePath - Absolute source path. @returns Portable repository-relative path. */
function displayPath(absolutePath) {
  return path.relative(process.cwd(), absolutePath).split(path.sep).join("/");
}

/** Adds a directed edge to the module graph. @param graph - Mutable module adjacency map. @param source - Importing module. @param target - Imported module. @returns Nothing. */
function addGraphEdge(graph, source, target) {
  const targets = graph.get(source);
  if (targets === undefined) throw new Error(`Dependency checker has no graph node for ${source}.`);
  targets.add(target);
}

/** Finds a directed module cycle, if one exists. @param graph - Complete module adjacency map. @returns Ordered cycle or undefined. */
function findCycle(graph) {
  const visited = new Set();
  const active = new Set();
  const stack = [];

  /** Visits one graph node depth-first. @param moduleName - Module to inspect. @returns Cycle when found. */
  function visit(moduleName) {
    if (active.has(moduleName)) {
      const cycleStart = stack.indexOf(moduleName);
      return [...stack.slice(cycleStart), moduleName];
    }
    if (visited.has(moduleName)) return undefined;
    visited.add(moduleName);
    active.add(moduleName);
    stack.push(moduleName);
    for (const target of graph.get(moduleName) ?? []) {
      const cycle = visit(target);
      if (cycle !== undefined) return cycle;
    }
    stack.pop();
    active.delete(moduleName);
    return undefined;
  }

  for (const moduleName of moduleNames) {
    const cycle = visit(moduleName);
    if (cycle !== undefined) return cycle;
  }
  return undefined;
}

const failures = [];
const graph = new Map(
  moduleNames.map(
    /** Creates one initially empty adjacency entry. @param moduleName - Known module name. @returns Module and mutable target set. */
    (moduleName) => [moduleName, new Set()],
  ),
);
const runtimeSources = collectRuntimeSources(sourceRoot);
let checkedImports = 0;

for (const sourceFile of runtimeSources) {
  const relativeSource = path.relative(sourceRoot, sourceFile);
  const sourceModule = getModule(relativeSource);
  if (sourceModule === undefined && relativeSource.includes(path.sep)) {
    failures.push(`${displayPath(sourceFile)}: unclassified runtime module`);
    continue;
  }
  const imports = ts.preProcessFile(fs.readFileSync(sourceFile, "utf8"), true, true).importedFiles;
  for (const imported of imports) {
    if (!imported.fileName.startsWith(".")) continue;
    checkedImports += 1;
    const targetPath = path.resolve(path.dirname(sourceFile), imported.fileName);
    const relativeTarget = path.relative(sourceRoot, targetPath);
    if (relativeTarget.startsWith("..")) {
      failures.push(
        `${displayPath(sourceFile)}: relative import escapes runtime source root: ${imported.fileName}`,
      );
      continue;
    }
    const targetModule = getModule(relativeTarget);
    if (sourceModule === undefined || targetModule === undefined || sourceModule === targetModule)
      continue;
    addGraphEdge(graph, sourceModule, targetModule);
    if (sourceModule === "framework" && suiteModules.has(targetModule)) {
      failures.push(
        `${displayPath(sourceFile)}: framework core must receive ${targetModule} through a registered module factory`,
      );
      continue;
    }
    if (
      relativeSource.includes(`${path.sep}source${path.sep}core${path.sep}`) &&
      targetModule === "vcl"
    ) {
      failures.push(
        `${displayPath(sourceFile)}: domain core must receive browser adapters through an injected contract`,
      );
      continue;
    }
    if (!allowedEdges.get(sourceModule)?.has(targetModule))
      failures.push(
        `${displayPath(sourceFile)}: non-allowlisted module edge ${sourceModule} -> ${targetModule}`,
      );
  }
}

const cycle = findCycle(graph);
if (cycle !== undefined) failures.push(`runtime module cycle: ${cycle.join(" -> ")}`);

if (failures.length > 0) {
  console.error(
    `Module boundary check failed:\n${failures
      .map(
        /** Formats one boundary failure for command-line output. @param failure - Failure message. @returns Bulleted diagnostic. */
        (failure) => `- ${failure}`,
      )
      .join("\n")}`,
  );
  process.exitCode = 1;
} else {
  const edgeCount = [...graph.values()].reduce(
    /** Adds one module adjacency count to the graph total. @param total - Accumulated edge count. @param targets - Current module targets. @returns Updated count. */
    (total, targets) => total + targets.size,
    0,
  );
  console.log(
    `Module boundary check passed: ${runtimeSources.length} runtime sources, ${checkedImports} relative imports, ${edgeCount} allowed cross-module edges.`,
  );
}
