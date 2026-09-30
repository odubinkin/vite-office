/** @fileoverview Confirms unchanged list-geometry serializer body after source-owner extraction. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";
const baseline = execFileSync("git", ["show", "c80f82d45904:apps/office/src/xmloff/source/text/txtparae.ts"], {encoding: "utf8"});
const extracted = readFileSync("apps/office/src/xmloff/source/style/xmlnume.ts", "utf8");
/** Prints the canonical function body independent of formatting. @param text - Source text. @returns Canonical body. */
function body(text) {
  const source = ts.createSourceFile("module.ts", text, ts.ScriptTarget.Latest, true);
  const declaration = source.statements.find(
    /** Selects the exported serializer. @param node - Statement. @returns Whether it owns the helper. */
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "exportListLevelLayout",
  );
  assert.ok(declaration?.body);
  return ts.createPrinter({removeComments: true}).printNode(ts.EmitHint.Unspecified, declaration.body, source);
}
assert.equal(body(extracted), body(baseline).replaceAll("exportOdfLength", "exportLength"));
console.log("List-geometry serializer body is unchanged; only the existing length converter is passed explicitly.");
