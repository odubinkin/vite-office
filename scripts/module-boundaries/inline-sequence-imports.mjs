/** @fileoverview Recognizes exact original inline comphelper/sequence.hxx callers without admitting SAX/Comphelper or Cppuhelper/Comphelper service cycles. */
import ts from "typescript";
const callers = new Map([
  [
    "sax/source/expatwrap/xml2utf.ts",
    { path: "../../../comphelper/inc/sequence", names: ["concatSequences"] },
  ],
  [
    "cppuhelper/source/component_context.ts",
    { path: "../../comphelper/inc/sequence", names: ["mapKeysToSequence"] },
  ],
]);
const cppuBindings = new Map([
  ["../../cppu/inc/unotype", ["getTypeFavourUnsigned"]],
  ["../../cppu/inc/uno/data", ["uno_type_assignData"]],
  ["../../cppu/inc/com/sun/star/uno/genfunc", ["cpp_queryInterface", "cpp_acquire", "cpp_release"]],
]);
const typePaths = new Set([
  "../../cppu/inc/com/sun/star/uno/Sequence",
  "../../cppu/inc/typelib/typedescription",
]);
/** Requires an exact static named-value import with no aliases, defaults, namespace or erased fields. @param statement - Original import. @param names - Complete expected symbols. @returns Exact binding. */
function namedImport(statement, names) {
  const clause = statement.importClause;
  if (
    !clause ||
    clause.isTypeOnly ||
    clause.name ||
    !clause.namedBindings ||
    !ts.isNamedImports(clause.namedBindings)
  )
    return false;
  const elements = clause.namedBindings.elements;
  return (
    elements.length === names.length &&
    elements.every(
      /** Exact original value binding. @param value - Imported name. @returns Allowed. */ (
        value,
      ) => !value.isTypeOnly && !value.propertyName && names.includes(value.name.text),
    )
  );
}
/** Admits the original pure template owner with only its existing CPPU assignment/type dependencies and no runtime initialization. @param source - Source-relative importer. @param target - Source-relative resolved target. @param importer - Actual caller source. @param contents - Actual inline owner. @returns Proven inline-header dependency. */
export function isOriginalInlineSequenceImport(source, target, importer, contents) {
  const binding = callers.get(source);
  if (!binding || target.replace(/\.ts$/u, "") !== "comphelper/inc/sequence") return false;
  const options = [ts.ScriptTarget.Latest, true, ts.ScriptKind.TS],
    file = ts.createSourceFile("sequence.ts", contents, ...options),
    caller = ts.createSourceFile("xml2utf.ts", importer, ...options);
  if (file.parseDiagnostics.length || caller.parseDiagnostics.length || !file.statements.length)
    return false;
  const functions = new Set();
  let valid = true;
  const imports = new Set();
  for (const statement of file.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      if (statement.importClause?.isTypeOnly) {
        if (!typePaths.has(specifier)) return false;
      } else {
        const names = cppuBindings.get(specifier);
        if (!names || !namedImport(statement, names) || imports.has(specifier)) return false;
        imports.add(specifier);
      }
    } else if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      ["concatSequences", "mapKeysToSequence"].includes(statement.name.text) &&
      !functions.has(statement.name.text) &&
      statement.body
    ) {
      functions.add(statement.name.text);
    } else return false;
  }
  /** Rejects deferred loading and reexport paths in every function body as well. @param node - Parsed syntax. @returns Nothing. */
  function inspect(node) {
    if (
      node.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node) && node.text === "require") ||
      ts.isExportDeclaration(node)
    )
      valid = false;
    ts.forEachChild(node, inspect);
  }
  inspect(file);
  inspect(caller);
  const matches = caller.statements.filter(
    /** Selects every import of the exact compiled header. @param statement - Syntax. @returns Matching. */ (
      statement,
    ) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === binding.path,
  );
  return (
    valid &&
    functions.size === 2 &&
    imports.size === cppuBindings.size &&
    matches.length === 1 &&
    namedImport(matches[0], binding.names)
  );
}
