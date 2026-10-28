/** @fileoverview Distinguishes the original UNO awt.InputEvent IDL binding from the forbidden DOM InputEvent global. */
import ts from "typescript";
/** Checks an exact original type-only named import, without namespace/default/aliased bindings. @param source - Parsed source. @param name - Original type name. @param module - Original relative module. @returns Whether the native binding exists. */
function hasTypeImport(source, name, module) {
  return source.statements.some(
    /** Checks the actual declaration and sole named binding. @param statement - Source statement. @returns Exact import match. */
    (statement) => {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text !== module
      )
        return false;
      const clause = statement.importClause,
        bindings = clause?.namedBindings;
      return (
        clause?.isTypeOnly === true &&
        clause.name === undefined &&
        bindings !== undefined &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length === 1 &&
        bindings.elements[0].name.text === name &&
        bindings.elements[0].propertyName === undefined
      );
    },
  );
}
/** Admits only native declaration/import/extends identifiers in the three original IDL source owners. Constructor calls, arbitrary type uses, globalThis access and neighboring owners retain the DOM guard. @param source - Actual parsed source. @param node - Identifier being checked. @param relativePath - Source-root-relative owner. @returns Whether this exact identifier binds the native IDL type. */
export function isOriginalInputEventIdentifier(source, node, relativePath) {
  const prefix = "offapi/com/sun/star/awt/",
    parent = node.parent;
  if (node.text !== "InputEvent") return false;
  if (relativePath === prefix + "InputEvent.ts") {
    return (
      ts.isInterfaceDeclaration(parent) &&
      parent.name === node &&
      hasTypeImport(source, "EventObject", "../../../../../udkapi/com/sun/star/lang/EventObject") &&
      parent.heritageClauses?.length === 1 &&
      parent.heritageClauses[0].token === ts.SyntaxKind.ExtendsKeyword &&
      parent.heritageClauses[0].types.length === 1 &&
      parent.heritageClauses[0].types[0].expression.getText(source) === "EventObject" &&
      parent.members.length === 1 &&
      ts.isPropertySignature(parent.members[0]) &&
      parent.members[0].name.getText(source) === "Modifiers" &&
      parent.members[0].type?.kind === ts.SyntaxKind.NumberKeyword
    );
  }
  if (
    ![prefix + "KeyEvent.ts", prefix + "MouseEvent.ts"].includes(relativePath) ||
    !hasTypeImport(source, "InputEvent", "./InputEvent")
  )
    return false;
  if (ts.isImportSpecifier(parent)) return parent.name === node;
  if (
    !ts.isExpressionWithTypeArguments(parent) ||
    parent.expression !== node ||
    !ts.isHeritageClause(parent.parent) ||
    parent.parent.token !== ts.SyntaxKind.ExtendsKeyword ||
    !ts.isInterfaceDeclaration(parent.parent.parent)
  )
    return false;
  return (
    parent.parent.parent.name.text ===
    (relativePath.endsWith("/KeyEvent.ts") ? "KeyEvent" : "MouseEvent")
  );
}
