/** @fileoverview Exact original escapement constexpr header admission rejects neighboring owners and every runtime-service injection. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  isOriginalCharacterValueImport,
  isOriginalEscapementConstantImport,
  isForbiddenModuleEdge,
} from "./check-module-boundaries.mjs";
const source = "xmloff/source/style/escphdl.ts",
  target = "editeng/inc/escapementitem.constants.ts",
  leaf = readFileSync("apps/office/src/" + target, "utf8");
it("admits only the exact original Any and constant owner", /** Native typed interface/header permission does not grant general module access. @returns Nothing. */ () => {
  expect(isOriginalCharacterValueImport(source, "cppu/inc/com/sun/star/uno/Any.ts")).toBe(true);
  expect(isOriginalCharacterValueImport(source, target)).toBe(true);
  expect(isOriginalCharacterValueImport(source, "editeng/inc/escapementitem.ts")).toBe(false);
  expect(isOriginalCharacterValueImport(source.replace("escphdl", "neighbor"), target)).toBe(false);
  expect(isForbiddenModuleEdge("xmloff", "editeng")).toBe(true);
});
it("admits the actual scalar header without allowing a library runtime cycle", /** Original literal exports are a separate dependency-free file. @returns Nothing. */ () => {
  expect(isOriginalEscapementConstantImport(source, target, leaf)).toBe(true);
  expect(
    isOriginalEscapementConstantImport(source.replace("escphdl", "neighbor"), target, leaf),
  ).toBe(false);
  expect(isOriginalEscapementConstantImport(source, "editeng/inc/escapementitem.ts", leaf)).toBe(
    false,
  );
});
it.each([
  'import {Any} from "../../cppu/inc/com/sun/star/uno/Any";',
  'export {SvxEscapementItem} from "../source/items/textitem.escapement";',
  "export function service(){return 1;}",
  "export const other=1;",
  "const privateService=1;",
])(
  "rejects a non-scalar service graph %s",
  /** No hidden executable ownership is ignored by the coarse module graph. @param statement - Injected graph edge. @returns Nothing. */ (
    statement,
  ) => {
    expect(isOriginalEscapementConstantImport(source, target, leaf + statement)).toBe(false);
  },
);
it.each([
  "call()",
  "globalThis.value",
  "undefined",
  "MAX_ESC_POS * 2",
  "(1 => 2)",
  "({value:1})",
  "new Number(1)",
])(
  "rejects executable initializer %s",
  /** No expression evaluation is used to validate a scalar leaf. @param expression - Invalid source expression. @returns Nothing. */ (
    expression,
  ) => {
    expect(
      isOriginalEscapementConstantImport(
        source,
        target,
        leaf.replace("MAX_ESC_POS + 1", expression),
      ),
    ).toBe(false);
  },
);
