/** @fileoverview Proves prior import/export assertions survived source-owner test decomposition unchanged. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const oldPath = "apps/office/src/xmloff/source/text/txtpara.test.ts";
const newPath = "apps/office/src/xmloff/source/text/txtparai.test.ts";
const baseline = execFileSync("git", ["show", `2ba1055b3e67:${oldPath}`], { encoding: "utf8" });
const printer = ts.createPrinter({ removeComments: true });

/** Collects canonical test bodies without source-position or comment differences. @param name - File name. @param source - TypeScript text. @returns Caption-to-body map. */
function testBodies(name, source) {
  const file = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = new Map();
  /** Visits test declarations and compares their full argument/expectation bodies. @param node - AST node. @returns Nothing. */
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "it" && ts.isStringLiteral(node.arguments[0])) {
      const caption = node.arguments[0].text;
      assert.equal(result.has(caption), false, `Duplicate test caption: ${caption}`);
      result.set(caption, printer.printNode(ts.EmitHint.Unspecified, node, file));
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return result;
}

const expected = testBodies(oldPath, baseline);
const retained = testBodies(oldPath, readFileSync(oldPath, "utf8"));
const imported = testBodies(newPath, readFileSync(newPath, "utf8"));
for (const [caption, body] of imported) {
  assert.equal(retained.has(caption), false, `Duplicated across suites: ${caption}`);
  retained.set(caption, body);
}
for (const [caption, body] of expected) {
  assert.equal(retained.get(caption), body, `Prior test changed: ${caption}`);
}
assert.equal(retained.size, expected.size + 1);
assert.equal(retained.has("resolves equal style names within the requested family"), true);
process.stdout.write(`PASS: ${expected.size} prior test bodies unchanged and unduplicated; one new family identity test.\n`);
