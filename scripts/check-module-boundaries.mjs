/**
 * @fileoverview Enforces the approved LibreOffice-shaped runtime module dependency graph for Vite Office.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const sourceRoot = path.resolve("apps/office/src");
const moduleNames = [
  "comphelper",
  "configmgr",
  "cppu",
  "cppuhelper",
  "cui",
  "docmodel",
  "editeng",
  "external",
  "formula",
  "framework",
  "i18nutil",
  "o3tl",
  "offapi",
  "package",
  "sal",
  "sax",
  "sc",
  "sfx2",
  "svl",
  "svtools",
  "svx",
  "sw",
  "tools",
  "udkapi",
  "unotools",
  "vcl",
  "xmloff",
  "xmlreader",
];
const knownModules = new Set(moduleNames);
const allowedEdges = new Map([
  // Original comphelper extract.hxx uses the actual Any and generated UNO TypeClass.
  ["comphelper", new Set(["cppu", "udkapi"])],
  // Original configuration nodes use SAL/UNO values and TypeClass IDL; shared SortedVector adapts config_map ordering.
  ["configmgr", new Set(["cppu", "o3tl", "sal", "udkapi"])],
  ["cppu", new Set(["sal", "o3tl", "udkapi"])],
  // Original queryinterface.hxx and supportsservice.cxx include actual UNO and SAL owners.
  ["cppuhelper", new Set(["cppu", "sal"])],
  ["cui", new Set(["editeng", "svl", "svx", "tools"])],
  // Original justifyitem.cxx uses actual UNO Any and generated table/style enums.
  // Original frmitems.cxx uses common Tools/o3tl integer unit conversion.
  ["docmodel", new Set(["tools", "o3tl"])],
  ["editeng", new Set(["docmodel", "cppu", "o3tl", "offapi", "svl", "svtools", "tools", "vcl"])],
  ["external", new Set()],
  // Formula value owners reuse SAL/OUString and SVL/SharedString; token identity uses native JS references.
  // Original include/formula/grammar.hxx includes the shared FormulaLanguage.hpp IDL owner.
  ["formula", new Set(["offapi", "sal", "svl"])],
  ["framework", new Set(["sfx2", "svl"])],
  // Original casefolding.cxx includes the generated RuntimeException.hpp API owned by CPPU.
  ["i18nutil", new Set(["cppu", "external", "offapi", "sal", "udkapi"])],
  ["o3tl", new Set(["sal"])],
  // Original generated enum getters use actual CPPU static enum metadata.
  ["offapi", new Set(["cppu", "sal"])],
  ["package", new Set()],
  ["sal", new Set(["o3tl"])],
  ["sax", new Set()],
  [
    "sc",
    new Set([
      // Original Calc attrib.cxx exposes actual UNO Any member query/extraction.
      "cppu",
      "cui",
      "editeng",
      "external",
      // Original Calc formularesult.hxx includes the shared formula error contracts.
      "formula",
      "framework",
      "o3tl",
      "offapi",
      "package",
      // Original Calc global.hxx/token.hxx use rtl/ustring.hxx; hybrid results own OUString.
      "sal",
      "sax",
      "sfx2",
      "svl",
      "svtools",
      "svx",
      "unotools",
      "vcl",
      "xmloff",
    ]),
  ],
  ["sfx2", new Set(["svl"])],
  // Original enum items include comphelper/extract.hxx and UNO Any.hxx.
  // Original cintitem.cxx hashes unsigned values through o3tl/hash_combine.hxx.
  ["svl", new Set(["comphelper", "cppu", "o3tl", "sal"])],
  // Original svtools/source/misc/unitconv.cxx uses Tools map/field units and o3tl conversions.
  ["svtools", new Set(["tools", "o3tl"])],
  // Original sdangitm.hxx includes tools/degree.hxx.
  // Original rotmodit.cxx exposes Any and CellVertJustify2.
  ["svx", new Set(["cppu", "editeng", "o3tl", "offapi", "svl", "svtools", "tools", "vcl"])],
  [
    "sw",
    new Set([
      "cui",
      "editeng",
      "framework",
      "o3tl",
      "offapi",
      "package",
      "sfx2",
      "svl",
      "svx",
      "svtools",
      "tools",
      "vcl",
      "xmloff",
    ]),
  ],
  ["vcl", new Set(["offapi", "svl", "tools"])],
  ["udkapi", new Set(["sal"])],
  // Original include/unotools/textsearch.hxx includes rtl/ustring.hxx; SearchParam owns OUString.
  ["unotools", new Set(["sal"])],
  // Original Tools/UnitConversion.hxx delegates to o3tl/unit_conversion.hxx.
  // Original tools/color.hxx owns Any color operators and includes com/sun/star/uno/Any.hxx.
  ["tools", new Set(["o3tl", "cppu"])],
  ["xmloff", new Set(["editeng", "sax", "unotools"])],
  // Original xmlreader span.hxx/cxx exposes SAL strings and the generated UNO RuntimeException.
  ["xmlreader", new Set(["cppu", "sal"])],
]);
/** Reports whether a native module edge is outside the explicit allowlist. @param sourceModule - Importing owner. @param targetModule - Imported owner. @returns Forbidden flag. */
export function isForbiddenModuleEdge(sourceModule, targetModule) {
  return !allowedEdges.get(sourceModule)?.has(targetModule);
}
const suiteModules = new Set(["sw", "sc"]);
const browserPackageImports = ["lucide-react", "react", "react-dom"];
const protectedBrowserGlobalSymbols = new Set([
  "ClipboardEvent",
  "DedicatedWorkerGlobalScope",
  "IDBDatabase",
  "IDBFactory",
  "InputEvent",
  "Worker",
]);
const protectedBrowserStorageSymbols = new Set(["downloadTarget", "indexedDbKey"]);
const protectedBrowserStorageValues = new Set(["browser-local", "indexeddb"]);
const protectedWriterTransferSymbols = new Set([
  "WriterClipboardPaste",
  "WriterClipboardPasteParagraph",
]);
const upstreamMechanismLayers = new Set([
  "sfx",
  "upstream-mechanism",
  "writer-core",
  "writer-filter",
  "writer-uibase",
]);

/** Returns the responsibility layer for one source-relative runtime path. @param relativePath - Path below apps/office/src. @returns Ownership layer or undefined. */
export function getRuntimeOwnershipLayer(relativePath) {
  const portablePath = relativePath.split(path.sep).join("/");
  if (/(?:^|\/)browser\//u.test(portablePath)) return "browser";
  if (portablePath.startsWith("sw/source/core/")) return "writer-core";
  if (portablePath.startsWith("sw/source/filter/")) return "writer-filter";
  if (portablePath.startsWith("sw/source/uibase/")) return "writer-uibase";
  if (portablePath.startsWith("sfx2/source/")) return "sfx";
  if (portablePath.startsWith("comphelper/inc/") || portablePath.startsWith("svl/inc/"))
    return "upstream-mechanism";
  if (portablePath.startsWith("docmodel/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("editeng/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("svx/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("xmlreader/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("tools/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("formula/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("o3tl/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("cppu/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("cppuhelper/inc/") || portablePath.startsWith("cppuhelper/source/"))
    return "upstream-mechanism";
  if (
    portablePath.startsWith("i18nutil/inc/") ||
    portablePath.startsWith("udkapi/") ||
    portablePath.startsWith("offapi/com/")
  )
    return "upstream-mechanism";
  if (portablePath.startsWith("external/mdds/include/")) return "upstream-mechanism";
  if (
    portablePath.startsWith("sal/rtl/") ||
    portablePath.startsWith("sal/inc/rtl/") ||
    portablePath.startsWith("sal/osl/") ||
    portablePath.startsWith("sal/inc/osl/")
  )
    return "upstream-mechanism";
  if (/^[^/]+\/source\//u.test(portablePath)) return "upstream-mechanism";
  return undefined;
}

/** Reports a forbidden reverse dependency between runtime responsibility layers. @param sourcePath - Importing source-relative path. @param targetPath - Imported source-relative path. @param importName - Authored import specifier. @returns Diagnostic or undefined. */
export function getRuntimeOwnershipViolation(sourcePath, targetPath, importName) {
  const sourceLayer = getRuntimeOwnershipLayer(sourcePath);
  if (!upstreamMechanismLayers.has(sourceLayer)) return undefined;
  if (
    browserPackageImports.some(
      /** Matches one browser-presentation package or its subpath. @param packageName - Package root. @returns Whether the import is browser-owned. */ (
        packageName,
      ) => importName === packageName || importName.startsWith(`${packageName}/`),
    )
  )
    return `${sourceLayer} must not import browser presentation package ${importName}`;
  const portableTargetPath = targetPath
    .split(path.sep)
    .join("/")
    .replace(/\.[cm]?[jt]sx?$/u, "");
  if (portableTargetPath === "framework/source/services/worker-protocol")
    return `${sourceLayer} must receive worker protocol through a browser adapter`;
  const targetLayer = getRuntimeOwnershipLayer(targetPath);
  if (targetLayer === "browser")
    return `${sourceLayer} must receive browser adapters through an injected contract`;
  if (
    sourceLayer === "writer-core" &&
    (targetLayer === "writer-filter" || targetLayer === "writer-uibase")
  )
    return `Writer core must not depend on ${targetLayer.replace("writer-", "")}`;
  if (sourceLayer === "writer-filter" && targetLayer === "writer-uibase")
    return "Writer filter must not depend on uibase";
  return undefined;
}

/** Finds browser-global identifiers that must remain behind adapters. Comments and larger domain names are ignored by parsing the source AST. @param sourceText - Authored TypeScript source. @returns Stable forbidden symbol names. */
export function getProtectedBrowserGlobalReferences(sourceText) {
  const sourceFile = ts.createSourceFile(
    "protected-source.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const references = new Set();
  /** Visits identifiers in the parsed source. @param node - Current syntax node. @returns Nothing. */
  function visit(node) {
    if (ts.isIdentifier(node) && protectedBrowserGlobalSymbols.has(node.text))
      references.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return [...references].sort();
}

/** Finds browser/storage DTO identities that must be converted before entering an upstream-shaped source layer. @param relativePath - Source-relative path. @param sourceText - Authored TypeScript. @returns Stable forbidden symbol names. */
export function getProtectedOwnershipReferences(relativePath, sourceText) {
  const layer = getRuntimeOwnershipLayer(relativePath);
  if (!upstreamMechanismLayers.has(layer)) return [];
  const protectedSymbols = new Set(protectedBrowserStorageSymbols);
  if (layer !== "writer-filter")
    for (const symbol of protectedWriterTransferSymbols) protectedSymbols.add(symbol);
  const references = new Set();
  const sourceFile = ts.createSourceFile(
    relativePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  /** Visits source identifiers without matching comments or string documentation. @param node - Current syntax node. @returns Nothing. */
  function visit(node) {
    if (ts.isIdentifier(node) && protectedSymbols.has(node.text)) references.add(node.text);
    if (ts.isStringLiteral(node) && protectedBrowserStorageValues.has(node.text))
      references.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return [...references].sort();
}

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

  for (const moduleName of graph.keys()) {
    const cycle = visit(moduleName);
    if (cycle !== undefined) return cycle;
  }
  return undefined;
}

const originalSalO3tlBindings = new Map([
  // Original unit_conversion.hxx uses these exact SAL signed64 bounds.
  ["o3tl/inc/unit_conversion.ts -> sal/inc/types.ts", ["SAL_MIN_INT64", "SAL_MAX_INT64"]],
  ["sal/rtl/strtmpl.ts -> o3tl/inc/string_view.ts", ["implIsWhitespace"]],
  ["o3tl/inc/string_view.ts -> sal/inc/rtl/ustring.h.ts", ["rtl_ustr_toInt64_WithLength"]],
  ["o3tl/inc/string_view.ts -> sal/inc/types.ts", ["SAL_MIN_INT32", "SAL_MAX_INT32"]],
]);

/** Checks the exact original mutual header dependency using named value-import syntax. @param sourcePath - Source-relative importer. @param targetPath - Resolved source-relative target. @param sourceText - Authored source. @param importName - Import specifier under inspection. @returns Whether every matching import is an approved original binding. */
export function isOriginalSalO3tlImport(sourcePath, targetPath, sourceText, importName) {
  const portableSource = sourcePath.split(path.sep).join("/");
  const portableTarget = targetPath.split(path.sep).join("/");
  const expected = originalSalO3tlBindings.get(
    `${portableSource} -> ${portableTarget.endsWith(".ts") ? portableTarget : `${portableTarget}.ts`}`,
  );
  if (expected === undefined) return false;
  const parsed = ts.createSourceFile(
    portableSource,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const bindings = new Set();
  let valid = true;
  /** Checks matching module references, rejecting every non-named-value import form. @param node - Current syntax node. @returns Nothing. */
  function visit(node) {
    if (ts.isStringLiteralLike(node) && node.text === importName) {
      const parent = node.parent;
      if (ts.isImportDeclaration(parent) && parent.moduleSpecifier === node) {
        const clause = parent.importClause;
        if (
          clause === undefined ||
          clause.isTypeOnly ||
          clause.name !== undefined ||
          clause.namedBindings === undefined ||
          !ts.isNamedImports(clause.namedBindings) ||
          clause.namedBindings.elements.length === 0
        ) {
          valid = false;
        } else {
          for (const binding of clause.namedBindings.elements) {
            if (
              binding.isTypeOnly ||
              binding.propertyName !== undefined ||
              !expected.includes(binding.name.text)
            )
              valid = false;
            bindings.add(binding.name.text);
          }
        }
      } else if (
        ts.isExportDeclaration(parent) ||
        ts.isExternalModuleReference(parent) ||
        ts.isLiteralTypeNode(parent) ||
        (ts.isCallExpression(parent) &&
          (parent.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(parent.expression) && parent.expression.text === "require")))
      ) {
        valid = false;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  return (
    valid &&
    bindings.size === expected.length &&
    expected.every(
      /** Requires all original named bindings rather than an empty witness. @param binding - Original symbol. @returns Whether present. */
      (binding) => bindings.has(binding),
    )
  );
}

/** Collects all reachable graph owners including the initial owner. @param graph - Module graph. @param start - Initial owner. @returns Reachable owners. */
function reachableModules(graph, start) {
  const reachable = new Set([start]);
  for (const owner of reachable) for (const target of graph.get(owner) ?? []) reachable.add(target);
  return reachable;
}

/** Finds forbidden cycles while admitting only the witnessed original two-owner SAL/o3tl component. @param graph - Complete module adjacency map. @param imports - All cross-owner SAL/o3tl witnesses with sourceModule, targetModule and approved fields. @returns Ordered forbidden cycle or undefined. */
export function findUnapprovedModuleCycle(graph, imports) {
  const reverse = new Map();
  for (const [source, targets] of graph)
    for (const target of targets) {
      if (!reverse.has(target)) reverse.set(target, new Set());
      reverse.get(target).add(source);
    }
  const forward = reachableModules(graph, "sal");
  const backward = reachableModules(reverse, "sal");
  const component = [...forward].filter(
    /** Selects the complete strongly connected component containing SAL. @param owner - Reachable owner. @returns Whether it can reach SAL. */
    (owner) => backward.has(owner),
  );
  if (
    component.length !== 2 ||
    !component.includes("o3tl") ||
    imports.length === 0 ||
    !imports.every(
      /** Requires every original cross-owner witness to pass syntax and binding checks. @param witness - Import observation. @returns Whether approved. */
      (witness) => witness.approved,
    ) ||
    !["sal", "o3tl"].every(
      /** Requires observed imports in both directions of the original component. @param owner - Importing owner. @returns Whether witnessed. */
      (owner) =>
        imports.some(
          /** Matches one correctly directed original edge. @param witness - Import observation. @returns Whether it belongs to this direction. */
          (witness) =>
            witness.sourceModule === owner &&
            witness.targetModule === (owner === "sal" ? "o3tl" : "sal"),
        ),
    )
  )
    return findCycle(graph);
  const projection = new Map();
  for (const [owner, targets] of graph) projection.set(owner, new Set(targets));
  projection.get("sal").delete("o3tl");
  return findCycle(projection);
}

const failures = [];
const graph = new Map(
  moduleNames.map(
    /** Creates one initially empty adjacency entry. @param moduleName - Known module name. @returns Module and mutable target set. */
    (moduleName) => [moduleName, new Set()],
  ),
);
const runtimeSources = collectRuntimeSources(sourceRoot);
const salO3tlImports = [];
let checkedImports = 0;

for (const sourceFile of runtimeSources) {
  const relativeSource = path.relative(sourceRoot, sourceFile);
  const sourceModule = getModule(relativeSource);
  if (sourceModule === undefined && relativeSource.includes(path.sep)) {
    failures.push(`${displayPath(sourceFile)}: unclassified runtime module`);
    continue;
  }
  const sourceText = fs.readFileSync(sourceFile, "utf8");
  if (upstreamMechanismLayers.has(getRuntimeOwnershipLayer(relativeSource))) {
    for (const browserProjectionSymbol of [
      "WriterPresentationProjection",
      "WriterViewSnapshot",
      "clipboardHandled",
      "paragraphId",
      "useSyncExternalStore",
    ])
      if (sourceText.includes(browserProjectionSymbol))
        failures.push(
          `${displayPath(sourceFile)}: Writer source layers must not declare browser projection symbol ${browserProjectionSymbol}`,
        );
    for (const browserGlobalSymbol of getProtectedBrowserGlobalReferences(sourceText))
      failures.push(
        `${displayPath(sourceFile)}: protected source layers must not reference browser global ${browserGlobalSymbol}`,
      );
    for (const ownershipSymbol of getProtectedOwnershipReferences(relativeSource, sourceText))
      failures.push(
        `${displayPath(sourceFile)}: protected source layers must receive ${ownershipSymbol} through an outer adapter`,
      );
  }
  const imports = ts.preProcessFile(sourceText, true, true).importedFiles;
  for (const imported of imports) {
    if (!imported.fileName.startsWith(".")) {
      const ownershipViolation = getRuntimeOwnershipViolation(
        relativeSource,
        "",
        imported.fileName,
      );
      if (ownershipViolation !== undefined)
        failures.push(`${displayPath(sourceFile)}: ${ownershipViolation}`);
      continue;
    }
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
    const ownershipViolation = getRuntimeOwnershipViolation(
      relativeSource,
      relativeTarget,
      imported.fileName,
    );
    if (ownershipViolation !== undefined) {
      failures.push(`${displayPath(sourceFile)}: ${ownershipViolation}`);
      continue;
    }
    if (sourceModule === undefined || targetModule === undefined || sourceModule === targetModule)
      continue;
    addGraphEdge(graph, sourceModule, targetModule);
    if (
      (sourceModule === "sal" && targetModule === "o3tl") ||
      (sourceModule === "o3tl" && targetModule === "sal")
    ) {
      const approved = isOriginalSalO3tlImport(
        relativeSource,
        relativeTarget,
        sourceText,
        imported.fileName,
      );
      salO3tlImports.push({ sourceModule, targetModule, approved });
      if (!approved)
        failures.push(
          `${displayPath(sourceFile)}: non-original SAL/o3tl import ${imported.fileName}`,
        );
    }
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
    if (isForbiddenModuleEdge(sourceModule, targetModule))
      failures.push(
        `${displayPath(sourceFile)}: non-allowlisted module edge ${sourceModule} -> ${targetModule}`,
      );
  }
}

const cycle = findUnapprovedModuleCycle(graph, salO3tlImports);
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
