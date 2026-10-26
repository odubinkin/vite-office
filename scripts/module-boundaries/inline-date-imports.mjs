/** @fileoverview Recognizes the original inline comphelper/date.hxx helper without admitting a SAX/Comphelper service cycle. */
import ts from "typescript";

/** Admits the one native inline date call only when its local owner contains declarations and no runtime dependencies or initialization. @param source - Importer path. @param target - Resolved target path. @param importer - Actual importer source. @param contents - Actual date owner source. @returns Whether this is the independent inline value dependency. */
export function isOriginalInlineDateImport(source, target, importer, contents) {
  if (
    source !== "sax/source/tools/converter.ts" ||
    target.replace(/\.ts$/u, "") !== "comphelper/source/misc/date"
  )
    return false;
  const options = [ts.ScriptTarget.Latest, true, ts.ScriptKind.TS];
  const file = ts.createSourceFile("date.ts", contents, ...options);
  if (
    file.parseDiagnostics.length ||
    !file.statements.length ||
    !file.statements.every(
      /** Rejects imports, reexports, global variables and executable top-level statements. @param statement - Date declaration. @returns Whether declaration-only. */
      (statement) => ts.isFunctionDeclaration(statement) || ts.isTypeAliasDeclaration(statement),
    )
  )
    return false;
  let valid = true;
  /** Rejects deferred service loading in function bodies as well. @param node - Date syntax node. @returns Nothing. */
  function inspect(node) {
    if (
      node.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node) && node.text === "require")
    )
      valid = false;
    ts.forEachChild(node, inspect);
  }
  inspect(file);
  const sourceFile = ts.createSourceFile("converter.ts", importer, ...options);
  const imports = sourceFile.statements.filter(
    /** Selects references to the exact inline owner. @param statement - Importer statement. @returns Whether matching import. */
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === "../../../comphelper/source/misc/date",
  );
  if (imports.length !== 1) return false;
  const clause = imports[0].importClause;
  return (
    valid &&
    clause &&
    !clause.isTypeOnly &&
    !clause.name &&
    clause.namedBindings &&
    ts.isNamedImports(clause.namedBindings) &&
    clause.namedBindings.elements.length === 1 &&
    clause.namedBindings.elements[0].name.text === "getDaysInMonth" &&
    !clause.namedBindings.elements[0].propertyName &&
    !clause.namedBindings.elements[0].isTypeOnly
  );
}
