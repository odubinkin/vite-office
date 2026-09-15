/** @fileoverview Validates the complete local runtime surface and its semantic upstream contract disposition. */

import ts from "typescript";

/** Allowed classification outcomes from the Stage 0 reinventory. */
export type RuntimeClassification =
  | "browser-adaptation"
  | "local-infrastructure"
  | "mapping-too-broad"
  | "out-of-parity-scope"
  | "upstream-mechanism";

/** Current connection state of a runtime module. */
export type RuntimeModuleState = "active" | "foundation" | "internal";

/** Independent semantic parity state for one contract dimension. */
export type RuntimeParityStatus = "divergent" | "not-applicable" | "parity" | "unverified";

/** Approved parity-plan divergence classifications. */
export type RuntimeDivergenceClass = "A" | "B" | "P" | "X" | "none";

/** Semantic provenance and boundary evidence attached to every runtime module. */
export interface RuntimeSemanticProvenance {
  readonly behaviorStatus: RuntimeParityStatus;
  readonly contractStatus: RuntimeParityStatus;
  readonly defaultStatus: RuntimeParityStatus;
  readonly divergenceClass: RuntimeDivergenceClass;
  readonly evidence: readonly string[];
  readonly expectedBaseClass?: string | null;
  readonly justification: string;
  readonly knownViolations: readonly string[];
  readonly localSymbols: readonly string[];
  readonly sourceResponsibility: "aligned" | "browser-owned" | "divergent" | "unverified";
  readonly upstreamFile: string | null;
  readonly upstreamSymbols: readonly string[];
}

/** One exact production TypeScript module and its audited disposition. */
export interface RuntimeModuleRecord {
  readonly capabilityIds: readonly string[];
  readonly classification: RuntimeClassification;
  readonly infrastructureExemption?: string;
  readonly path: string;
  readonly semantic: RuntimeSemanticProvenance;
  readonly state: RuntimeModuleState;
  readonly subsystem: string;
  readonly suite: "shared" | "writer";
}

/** One non-module item that must remain visible in the reinventory. */
export interface RuntimeInventoryItem {
  readonly capabilityId: string;
  readonly classification: RuntimeClassification;
  readonly description: string;
  readonly id: string;
}

/** One exported non-command mutation helper that must remain explicitly inventoried. */
export interface RuntimeInternalOperation extends RuntimeInventoryItem {
  readonly modulePath: string;
  readonly symbol: string;
}

/** Complete authored runtime inventory input. */
export interface RuntimeInventoryManifest {
  readonly internalOperations: readonly RuntimeInternalOperation[];
  readonly modules: readonly RuntimeModuleRecord[];
  readonly placeholderSuites: readonly string[];
  readonly schemaVersion: 3;
  readonly uiBehaviors: readonly RuntimeInventoryItem[];
}

/** Minimal command registry shape consumed without importing React or browser code. */
export interface RuntimeCommandRecord {
  readonly capabilityId: string;
  readonly id: string;
  readonly label: string;
}

/** One classified module and its exported domain-function inventory. */
export interface RuntimeModuleReportEntry extends RuntimeModuleRecord {
  readonly exportedOperations: readonly string[];
}

/** Deterministic successful runtime-inventory report. */
export interface RuntimeInventoryReport {
  readonly commandCount: number;
  readonly exportedOperationCount: number;
  readonly internalOperationCount: number;
  readonly modules: readonly RuntimeModuleReportEntry[];
  readonly placeholderSuiteCount: number;
  readonly schemaVersion: 3;
  readonly semanticViolationCount: number;
  readonly uiBehaviorCount: number;
}

/**
 * Parses the complete strict runtime inventory.
 * @param sourceText - Authored JSON source.
 * @returns Validated runtime inventory manifest.
 */
export function parseRuntimeInventoryManifest(sourceText: string): RuntimeInventoryManifest {
  const root = parseObject(sourceText);
  if (root.schemaVersion !== 3) throw new Error("Runtime inventory schemaVersion must equal 3.");
  const modules = requireArray(root.modules, "modules").map(parseModule);
  assertOrderedUnique(modules.map(selectPath), "Runtime module paths");
  const internalOperations = parseInternalOperations(root.internalOperations);
  const uiBehaviors = parseItems(root.uiBehaviors, "uiBehaviors");
  const placeholderSuites = requireStringArray(root, "placeholderSuites");
  assertOrderedUnique(placeholderSuites, "Placeholder suites");
  return {
    internalOperations,
    modules,
    placeholderSuites,
    schemaVersion: 3,
    uiBehaviors,
  };
}

/**
 * Proves every discovered runtime module and command is classified and linked to a known capability.
 * @param manifest - Parsed authored runtime inventory.
 * @param discoveredModulePaths - Production module paths discovered from the runtime tree.
 * @param readModule - Source reader used to inventory exported operations.
 * @param commands - Complete visible Writer command registry.
 * @param knownCapabilityIds - Capability IDs declared by the parity manifest.
 * @returns Deterministic complete runtime report.
 */
export async function validateRuntimeInventory(
  manifest: RuntimeInventoryManifest,
  discoveredModulePaths: readonly string[],
  readModule: (path: string) => Promise<string>,
  commands: readonly RuntimeCommandRecord[],
  knownCapabilityIds: ReadonlySet<string>,
): Promise<RuntimeInventoryReport> {
  const discovered = [...discoveredModulePaths].sort();
  assertOrderedUnique(discovered, "Discovered runtime module paths");
  const authored = manifest.modules.map(selectPath);
  if (JSON.stringify(authored) !== JSON.stringify(discovered))
    throw new Error(
      "Runtime module inventory does not exactly cover discovered production modules.",
    );
  const commandIds = commands.map(selectCommandId);
  assertUnique(commandIds, "Runtime command IDs");
  for (const command of commands) {
    if (
      !/^(?:\.uno:\S+|vnd\.vite-office\.browser:[A-Za-z0-9.-]+)$/.test(command.id) ||
      command.label.trim().length === 0
    )
      throw new Error(`Invalid runtime command record: ${command.id}`);
    assertKnownCapability(command.capabilityId, knownCapabilityIds, command.id);
  }
  for (const item of [...manifest.internalOperations, ...manifest.uiBehaviors])
    assertKnownCapability(item.capabilityId, knownCapabilityIds, item.id);
  const modules: RuntimeModuleReportEntry[] = [];
  const operationsByModule = new Map<string, readonly string[]>();
  let semanticViolationCount = 0;
  for (const module of manifest.modules) {
    if (module.capabilityIds.length === 0 && module.infrastructureExemption === undefined)
      throw new Error(
        `Runtime module ${module.path} requires a capability or infrastructure exemption.`,
      );
    if (
      module.infrastructureExemption !== undefined &&
      (module.classification !== "local-infrastructure" || module.capabilityIds.length > 0)
    )
      throw new Error(`Runtime module ${module.path} has an invalid infrastructure exemption.`);
    for (const capabilityId of module.capabilityIds)
      assertKnownCapability(capabilityId, knownCapabilityIds, module.path);
    const source = await readModule(module.path);
    const semanticViolations = analyzeRuntimeModuleSemantics(module, source);
    assertSameValues(
      [...semanticViolations].sort(),
      [...module.semantic.knownViolations].sort(),
      `Runtime semantic violations for ${module.path}`,
    );
    semanticViolationCount += semanticViolations.length;
    const exportedOperations = extractExportedOperations(source);
    operationsByModule.set(module.path, exportedOperations);
    modules.push({ ...module, exportedOperations });
  }
  const expectedMutationHelpers = modules.flatMap(
    /** Selects qualified mutation helpers from one module. @param module - Validated runtime module. @returns Qualified helper references. */
    function selectMutationHelpers(module) {
      return module.exportedOperations.filter(isMutationHelper).map(
        /** Qualifies one exported symbol by module path. @param symbol - Exported symbol. @returns Qualified reference. */
        function qualify(symbol): string {
          return `${module.path}#${symbol}`;
        },
      );
    },
  );
  const inventoriedMutationHelpers = manifest.internalOperations.map(
    /** Resolves and qualifies one authored operation. @param operation - Authored operation. @returns Qualified reference. */
    function qualify(operation) {
      const exported = operationsByModule.get(operation.modulePath);
      if (exported === undefined)
        throw new Error(`Internal operation ${operation.id} names an unknown runtime module.`);
      if (!exported.includes(operation.symbol))
        throw new Error(`Internal operation ${operation.id} names a non-exported symbol.`);
      return `${operation.modulePath}#${operation.symbol}`;
    },
  );
  assertOrderedUnique(
    [...inventoriedMutationHelpers].sort(),
    "Internal mutation helper references",
  );
  assertSameValues(
    [...expectedMutationHelpers].sort(),
    [...inventoriedMutationHelpers].sort(),
    "Runtime mutation helper inventory",
  );
  return {
    commandCount: commands.length,
    exportedOperationCount: modules.flatMap(selectExportedOperations).length,
    internalOperationCount: manifest.internalOperations.length,
    modules,
    placeholderSuiteCount: manifest.placeholderSuites.length,
    schemaVersion: 3,
    semanticViolationCount,
    uiBehaviorCount: manifest.uiBehaviors.length,
  };
}

/**
 * Selects production TypeScript entries and returns repository-relative sorted paths.
 * @param runtimeRoot - Repository-relative runtime root.
 * @param relativeEntries - Recursive entries relative to that root.
 * @returns Sorted production TypeScript paths.
 */
export function selectRuntimeModulePaths(
  runtimeRoot: string,
  relativeEntries: readonly string[],
): readonly string[] {
  return relativeEntries
    .filter(
      /**
       * Keeps production TypeScript modules only.
       * @param path - Runtime-root-relative candidate path.
       * @returns Whether the path is a production TypeScript module.
       */
      function isProductionTypeScript(path): boolean {
        return (
          (path.endsWith(".ts") || path.endsWith(".tsx")) &&
          !path.endsWith(".test.ts") &&
          !path.endsWith(".test.tsx") &&
          path !== "test/setup.ts"
        );
      },
    )
    .map(
      /**
       * Adds the normalized runtime root.
       * @param path - Accepted runtime-root-relative path.
       * @returns Repository-relative runtime module path.
       */
      function addRuntimeRoot(path): string {
        return `${runtimeRoot.replace(/\/$/, "")}/${path}`;
      },
    )
    .sort();
}

/**
 * Extracts named exported functions as the domain-operation inventory inherited from each module classification.
 * @param source - TypeScript module source.
 * @returns Sorted named exported function identities.
 */
export function extractExportedOperations(source: string): readonly string[] {
  return [...source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)]
    .map(
      /**
       * Selects the captured operation name.
       * @param match - Regular-expression match containing the function name.
       * @returns Exported function identity.
       */
      function selectOperation(match): string {
        return match[1] as string;
      },
    )
    .sort();
}

/**
 * Detects AST/API and browser-boundary divergences whose exact disposition must be authored.
 * @param module - Runtime module and semantic contract.
 * @param source - Complete TypeScript source.
 * @returns Stable violation identifiers detected in the source.
 */
export function analyzeRuntimeModuleSemantics(
  module: RuntimeModuleRecord,
  source: string,
): readonly string[] {
  const sourceFile = ts.createSourceFile(
    module.path,
    source,
    ts.ScriptTarget.Latest,
    true,
    module.path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations = new Set<string>();
  const declaredSymbols = collectDeclaredSymbols(sourceFile);
  for (const symbol of module.semantic.localSymbols)
    if (!declaredSymbols.has(symbol)) violations.add(`missing-local-symbol:${symbol}`);

  if (module.semantic.expectedBaseClass !== undefined) {
    const classDeclaration = findClassDeclaration(sourceFile, module.semantic.localSymbols[0]);
    const actualBaseClass =
      classDeclaration === undefined ? undefined : getBaseClass(classDeclaration);
    if (actualBaseClass !== module.semantic.expectedBaseClass)
      violations.add(
        `inheritance:${module.semantic.localSymbols[0] ?? "unknown"}:${actualBaseClass ?? "none"}`,
      );
  }

  const protectedPath =
    /\/(?:inc|source\/(?:core|filter|uibase\/(?:dochdl|shells|uiview))|uiconfig)\//u.test(
      module.path,
    );
  if (protectedPath && containsBrowserApi(sourceFile))
    violations.add("browser-api-in-upstream-core");
  if (
    module.classification === "browser-adaptation" &&
    /\/(?:source|uiconfig)\//u.test(module.path)
  )
    violations.add("browser-adapter-upstream-path");
  if (
    module.path.endsWith("/sw/uiconfig/swriter/menubar/menubar-commands.ts") &&
    /["']writer\.[a-z0-9.-]+["']/u.test(source)
  )
    violations.add("custom-command-namespace");
  if (
    module.path.endsWith("/sw/source/uibase/shells/listsh.ts") &&
    module.classification === "upstream-mechanism" &&
    !declaredSymbols.has("SwListShell")
  )
    violations.add("placeholder-upstream-mechanism");
  return [...violations].sort();
}

/** Collects declared top-level and class-member API names. @param sourceFile - Parsed source file. @returns Declared symbol set. */
function collectDeclaredSymbols(sourceFile: ts.SourceFile): ReadonlySet<string> {
  const symbols = new Set<string>();
  /** Visits declarations recursively. @param node - Current syntax node. @returns Nothing. */
  function visit(node: ts.Node): void {
    if (
      (ts.isClassDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isVariableDeclaration(node) ||
        ts.isMethodDeclaration(node)) &&
      node.name !== undefined
    )
      symbols.add(node.name.getText(sourceFile));
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return symbols;
}

/** Finds a named class declaration. @param sourceFile - Parsed source. @param name - Expected class name. @returns Matching declaration or undefined. */
function findClassDeclaration(
  sourceFile: ts.SourceFile,
  name: string | undefined,
): ts.ClassDeclaration | undefined {
  return sourceFile.statements.find(
    /** Matches one class statement. @param statement - Top-level statement. @returns Whether it declares the requested class. */ (
      statement,
    ): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === name,
  );
}

/** Reads one class's extends expression. @param declaration - Class declaration. @returns Base-class text or null. */
function getBaseClass(declaration: ts.ClassDeclaration): string | null {
  const heritage = declaration.heritageClauses?.find(
    /** Selects an extends clause. @param clause - Heritage clause. @returns Whether it is extends. */ (
      clause,
    ) => clause.token === ts.SyntaxKind.ExtendsKeyword,
  );
  return heritage?.types[0]?.expression.getText(declaration.getSourceFile()) ?? null;
}

/** Detects React, DOM, Worker, IndexedDB, or browser-global usage in a parsed module. @param sourceFile - Parsed source. @returns Whether a browser boundary is present. */
function containsBrowserApi(sourceFile: ts.SourceFile): boolean {
  const browserIdentifiers = new Set([
    "ClipboardEvent",
    "Document",
    "HTMLElement",
    "IDBDatabase",
    "Range",
    "Selection",
    "Worker",
    "indexedDB",
  ]);
  let found = false;
  /** Visits browser-sensitive syntax. @param node - Current syntax node. @returns Nothing. */
  function visit(node: ts.Node): void {
    if (found) return;
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === "react"
    )
      found = true;
    else if (ts.isIdentifier(node) && browserIdentifiers.has(node.text)) found = true;
    else if (
      ts.isPropertyAccessExpression(node) &&
      node.expression.getText(sourceFile) === "globalThis" &&
      (node.name.text === "document" ||
        node.name.text === "getSelection" ||
        node.name.text === "indexedDB" ||
        node.name.text === "window")
    )
      found = true;
    else ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

/** Parses semantic provenance required for every runtime module. @param candidate - Unknown semantic record. @param modulePath - Owning module path. @returns Validated semantic provenance. */
function parseSemanticProvenance(
  candidate: unknown,
  modulePath: string,
): RuntimeSemanticProvenance {
  if (!isRecord(candidate))
    throw new Error(`Runtime module ${modulePath} requires semantic provenance.`);
  const divergenceClass = parseDivergenceClass(candidate.divergenceClass, modulePath);
  const evidence = requireStringArray(candidate, "evidence");
  const justification = requireString(candidate, "justification");
  if (justification.length < 40)
    throw new Error(`Runtime semantic justification is too short for ${modulePath}.`);
  if (divergenceClass === "B" && evidence.length === 0)
    throw new Error(`Browser divergence ${modulePath} requires exact evidence.`);
  const upstreamFile = candidate.upstreamFile;
  if (upstreamFile !== null && (typeof upstreamFile !== "string" || upstreamFile.length === 0))
    throw new Error(`Runtime semantic upstreamFile is invalid for ${modulePath}.`);
  const expectedBaseClass = candidate.expectedBaseClass;
  if (
    expectedBaseClass !== undefined &&
    expectedBaseClass !== null &&
    (typeof expectedBaseClass !== "string" || expectedBaseClass.length === 0)
  )
    throw new Error(`Runtime semantic expectedBaseClass is invalid for ${modulePath}.`);
  return {
    behaviorStatus: parseParityStatus(candidate.behaviorStatus, modulePath),
    contractStatus: parseParityStatus(candidate.contractStatus, modulePath),
    defaultStatus: parseParityStatus(candidate.defaultStatus, modulePath),
    divergenceClass,
    evidence,
    ...(expectedBaseClass === undefined ? {} : { expectedBaseClass }),
    justification,
    knownViolations: requireStringArray(candidate, "knownViolations"),
    localSymbols: requireStringArray(candidate, "localSymbols"),
    sourceResponsibility: parseSourceResponsibility(candidate.sourceResponsibility, modulePath),
    upstreamFile,
    upstreamSymbols: requireStringArray(candidate, "upstreamSymbols"),
  };
}

/** Parses one parity status. @param candidate - Unknown status. @param modulePath - Diagnostic path. @returns Valid status. */
function parseParityStatus(candidate: unknown, modulePath: string): RuntimeParityStatus {
  if (
    candidate !== "divergent" &&
    candidate !== "not-applicable" &&
    candidate !== "parity" &&
    candidate !== "unverified"
  )
    throw new Error(`Runtime semantic parity status is invalid for ${modulePath}.`);
  return candidate;
}

/** Parses one divergence class. @param candidate - Unknown class. @param modulePath - Diagnostic path. @returns Valid class. */
function parseDivergenceClass(candidate: unknown, modulePath: string): RuntimeDivergenceClass {
  if (
    candidate !== "A" &&
    candidate !== "B" &&
    candidate !== "P" &&
    candidate !== "X" &&
    candidate !== "none"
  )
    throw new Error(`Runtime semantic divergence class is invalid for ${modulePath}.`);
  return candidate;
}

/** Parses source responsibility state. @param candidate - Unknown state. @param modulePath - Diagnostic path. @returns Valid state. */
function parseSourceResponsibility(
  candidate: unknown,
  modulePath: string,
): RuntimeSemanticProvenance["sourceResponsibility"] {
  if (
    candidate !== "aligned" &&
    candidate !== "browser-owned" &&
    candidate !== "divergent" &&
    candidate !== "unverified"
  )
    throw new Error(`Runtime source responsibility is invalid for ${modulePath}.`);
  return candidate;
}

/**
 * Parses one exact module record.
 * @param candidate - Unknown authored record.
 * @param index - Source array index used in errors.
 * @returns Validated runtime module record.
 */
function parseModule(candidate: unknown, index: number): RuntimeModuleRecord {
  if (!isRecord(candidate)) throw new Error(`Runtime modules[${index}] must be an object.`);
  const infrastructureExemption = optionalString(candidate, "infrastructureExemption");
  const path = requireString(candidate, "path");
  const classification = parseClassification(candidate.classification);
  const semantic = parseSemanticProvenance(candidate.semantic, path);
  if (classification === "upstream-mechanism" && semantic.upstreamFile === null)
    throw new Error(`Upstream mechanism ${path} requires an exact upstreamFile.`);
  if (classification !== "upstream-mechanism" && semantic.upstreamFile !== null)
    throw new Error(`Local or browser module ${path} cannot claim an upstreamFile.`);
  if (semantic.knownViolations.length > 0 && semantic.divergenceClass === "none")
    throw new Error(`Runtime module ${path} has unclassified semantic violations.`);
  return {
    capabilityIds: requireStringArray(candidate, "capabilityIds"),
    classification,
    ...(infrastructureExemption === undefined ? {} : { infrastructureExemption }),
    path,
    semantic,
    state: parseState(candidate.state),
    subsystem: requireString(candidate, "subsystem"),
    suite: parseRuntimeSuite(candidate.suite),
  };
}

/**
 * Parses one sorted non-module inventory collection.
 * @param candidate - Unknown authored item array.
 * @param location - Field location used in errors.
 * @returns Validated ordered items.
 */
function parseItems(candidate: unknown, location: string): readonly RuntimeInventoryItem[] {
  const items = requireArray(candidate, location).map(
    /**
     * Parses an item at its source index.
     * @param value - Unknown authored item.
     * @param index - Source array index used in errors.
     * @returns Validated inventory item.
     */
    function parseItem(value, index): RuntimeInventoryItem {
      if (!isRecord(value)) throw new Error(`${location}[${index}] must be an object.`);
      return {
        capabilityId: requireString(value, "capabilityId"),
        classification: parseClassification(value.classification),
        description: requireString(value, "description"),
        id: requireString(value, "id"),
      };
    },
  );
  assertOrderedUnique(items.map(selectId), `${location} IDs`);
  return items;
}

/**
 * Parses exact exported mutation-helper records.
 * @param candidate - Unknown operation array.
 * @returns Parsed internal operation records.
 */
function parseInternalOperations(candidate: unknown): readonly RuntimeInternalOperation[] {
  const items = requireArray(candidate, "internalOperations").map(
    /** Parses one exported mutation helper. @param value - Unknown operation. @param index - Operation index. @returns Validated operation. */
    function parseOperation(value, index): RuntimeInternalOperation {
      if (!isRecord(value)) throw new Error(`internalOperations[${index}] must be an object.`);
      return {
        capabilityId: requireString(value, "capabilityId"),
        classification: parseClassification(value.classification),
        description: requireString(value, "description"),
        id: requireString(value, "id"),
        modulePath: requireString(value, "modulePath"),
        symbol: requireString(value, "symbol"),
      };
    },
  );
  assertOrderedUnique(items.map(selectId), "internalOperations IDs");
  return items;
}

/**
 * Identifies exported non-command helpers that mutate Writer or lifecycle state.
 * @param symbol - Exported function name.
 * @returns Whether it follows the mutation-helper naming contract.
 */
function isMutationHelper(symbol: string): boolean {
  return /^(?:append|change|close|insert|mark|merge|move|remove|replace|setWriter|split|toggleWriter)/u.test(
    symbol,
  );
}

/**
 * Requires two sorted value sets to match exactly.
 * @param expected - Discovered values.
 * @param actual - Authored values.
 * @param label - Diagnostic label.
 * @returns Nothing; mismatches throw.
 */
function assertSameValues(
  expected: readonly string[],
  actual: readonly string[],
  label: string,
): void {
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw new Error(
      `${label} must be exhaustive; expected ${expected.join(", ") || "none"}; received ${actual.join(", ") || "none"}.`,
    );
}

/**
 * Parses a Stage 0 disposition.
 * @param candidate - Unknown authored classification.
 * @returns Validated runtime classification.
 */
function parseClassification(candidate: unknown): RuntimeClassification {
  if (
    candidate !== "upstream-mechanism" &&
    candidate !== "browser-adaptation" &&
    candidate !== "local-infrastructure" &&
    candidate !== "mapping-too-broad" &&
    candidate !== "out-of-parity-scope"
  )
    throw new Error("Invalid runtime classification.");
  return candidate;
}

/**
 * Parses module connection state.
 * @param candidate - Unknown authored state.
 * @returns Validated module state.
 */
function parseState(candidate: unknown): RuntimeModuleState {
  if (candidate !== "active" && candidate !== "foundation" && candidate !== "internal")
    throw new Error("Invalid runtime module state.");
  return candidate;
}

/**
 * Parses the only currently executable/shared suite ownership values.
 * @param candidate - Unknown authored suite.
 * @returns Validated runtime suite.
 */
function parseRuntimeSuite(candidate: unknown): RuntimeModuleRecord["suite"] {
  if (candidate !== "shared" && candidate !== "writer")
    throw new Error("Invalid runtime module suite.");
  return candidate;
}

/**
 * Requires an array value.
 * @param candidate - Unknown authored value.
 * @param location - Field location used in errors.
 * @returns Validated array.
 */
function requireArray(candidate: unknown, location: string): readonly unknown[] {
  if (!Array.isArray(candidate)) throw new Error(`Runtime inventory ${location} must be an array.`);
  return candidate;
}

/**
 * Requires an array containing only non-blank strings.
 * @param record - Parsed object carrying the field.
 * @param field - Required array field name.
 * @returns Validated string array.
 */
function requireStringArray(record: Record<string, unknown>, field: string): readonly string[] {
  const value = requireArray(record[field], field);
  if (value.some(isNotNonBlankString))
    throw new Error(`Runtime inventory ${field} must contain non-empty strings.`);
  return value as readonly string[];
}

/**
 * Requires one non-blank string.
 * @param record - Parsed object carrying the field.
 * @param field - Required string field name.
 * @returns Validated non-blank string.
 */
function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`Runtime inventory ${field} must be a non-empty string.`);
  return value;
}

/**
 * Reads one optional non-blank string.
 * @param record - Parsed object carrying the field.
 * @param field - Optional string field name.
 * @returns Validated string or undefined.
 */
function optionalString(record: Record<string, unknown>, field: string): string | undefined {
  if (record[field] === undefined) return undefined;
  return requireString(record, field);
}

/**
 * Parses a JSON object with stable error translation.
 * @param sourceText - Authored JSON source.
 * @returns Parsed root object.
 */
function parseObject(sourceText: string): Record<string, unknown> {
  try {
    const value = JSON.parse(sourceText) as unknown;
    if (!isRecord(value)) throw new Error("Runtime inventory root must be an object.");
    return value;
  } catch (error) {
    if (error instanceof Error && error.message === "Runtime inventory root must be an object.")
      throw error;
    throw new Error("Runtime inventory must be valid JSON.", { cause: error });
  }
}

/**
 * Rejects duplicate or non-sorted stable values.
 * @param values - Authored stable values.
 * @param label - Collection label used in errors.
 * @returns Nothing after order and uniqueness are proven.
 */
function assertOrderedUnique(values: readonly string[], label: string): void {
  for (let index = 1; index < values.length; index += 1)
    if ((values[index - 1] as string) >= (values[index] as string))
      throw new Error(`${label} must be unique and lexicographically ordered.`);
}

/**
 * Rejects duplicate values where presentation order is intentionally meaningful.
 * @param values - Authored stable values.
 * @param label - Collection label used in errors.
 * @returns Nothing after uniqueness is proven.
 */
function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} must be unique.`);
}

/**
 * Rejects references to unknown domain-agnostic capability IDs.
 * @param capabilityId - Referenced capability ID.
 * @param knownCapabilityIds - IDs declared in the parity manifest.
 * @param owner - Runtime item owning the reference.
 * @returns Nothing after the reference resolves.
 */
function assertKnownCapability(
  capabilityId: string,
  knownCapabilityIds: ReadonlySet<string>,
  owner: string,
): void {
  if (!knownCapabilityIds.has(capabilityId))
    throw new Error(`${owner} references unknown capability ${capabilityId}.`);
}

/**
 * Selects a runtime module path.
 * @param record - Runtime module record.
 * @returns Repository-relative module path.
 */
function selectPath(record: RuntimeModuleRecord): string {
  return record.path;
}
/**
 * Selects a non-module inventory identity.
 * @param record - Runtime inventory item.
 * @returns Stable item identity.
 */
function selectId(record: RuntimeInventoryItem): string {
  return record.id;
}
/**
 * Selects a visible runtime command identity.
 * @param record - Visible command record.
 * @returns Stable command identity.
 */
function selectCommandId(record: RuntimeCommandRecord): string {
  return record.id;
}
/**
 * Selects exported operations for aggregate counting.
 * @param record - Runtime module report entry.
 * @returns Exported operations from that module.
 */
function selectExportedOperations(record: RuntimeModuleReportEntry): readonly string[] {
  return record.exportedOperations;
}
/**
 * Detects a value that is not a non-blank string.
 * @param value - Unknown array member.
 * @returns Whether the value violates the string contract.
 */
function isNotNonBlankString(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}
/**
 * Detects a non-null object that is not an array.
 * @param value - Unknown parsed value.
 * @returns Whether the value can be inspected as a record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
