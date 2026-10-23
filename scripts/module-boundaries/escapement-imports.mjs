/** @fileoverview Validates the exact source constexpr leaf independently of the coarse library runtime graph; executable item/XML services receive no cycle exception. */
import path from "node:path";
import ts from "typescript";
/** Admits only the original constexpr-header edge, whose leaf exports six scalar expressions and imports no services. This does not admit a general editeng/xmloff runtime cycle. @param source - Importing source path. @param target - Imported header leaf. @param contents - Actual leaf source. @returns Whether the complete header is a dependency-free scalar value owner. */
export function isOriginalEscapementConstantImport(source, target, contents) {
  /** Normalizes source module identities only. @param value - Original path. @returns Canonical TS path. */
  function normalize(value) {
    return value.split(path.sep).join("/").replace(/\.ts$/u, "") + ".ts";
  }
  if (
    normalize(source) !== "xmloff/source/style/escphdl.ts" ||
    normalize(target) !== "editeng/inc/escapementitem.constants.ts"
  )
    return false;
  const expected = new Set([
      "DFLT_ESC_SUPER",
      "DFLT_ESC_SUB",
      "DFLT_ESC_PROP",
      "MAX_ESC_POS",
      "DFLT_ESC_AUTO_SUPER",
      "DFLT_ESC_AUTO_SUB",
    ]),
    declared = new Set();
  const file = ts.createSourceFile(
    "escapementitem.constants.ts",
    contents,
    ts.ScriptTarget.Latest,
    true,
  );
  if (file.parseDiagnostics.length) return false;
  /** Permits only arithmetic on previous scalar constants; no calls, properties, imports or executable service graph. @param node - Original expression. @returns Scalar-only flag. */
  function scalar(node) {
    if (ts.isNumericLiteral(node)) return true;
    if (ts.isIdentifier(node)) return declared.has(node.text);
    if (ts.isParenthesizedExpression(node)) return scalar(node.expression);
    if (ts.isPrefixUnaryExpression(node))
      return (
        [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken].includes(node.operator) &&
        scalar(node.operand)
      );
    return (
      ts.isBinaryExpression(node) &&
      [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken].includes(node.operatorToken.kind) &&
      scalar(node.left) &&
      scalar(node.right)
    );
  }
  for (const statement of file.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some(
        /** Verifies actual scalar exports only. @param modifier - Original declaration modifier. @returns Export flag. */ (
          modifier,
        ) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ) ||
      !(statement.declarationList.flags & ts.NodeFlags.Const)
    )
      return false;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        !expected.has(declaration.name.text) ||
        declared.has(declaration.name.text) ||
        !declaration.initializer ||
        !scalar(declaration.initializer)
      )
        return false;
      declared.add(declaration.name.text);
    }
  }
  return declared.size === expected.size;
}
