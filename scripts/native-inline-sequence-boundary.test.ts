/** @fileoverview Exact original inline Sequence dependency witnesses preserve unrelated cycle rejection. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { isOriginalInlineSequenceImport as check } from "./module-boundaries/inline-sequence-imports.mjs";
const source = "sax/source/expatwrap/xml2utf.ts",
  target = "comphelper/inc/sequence.ts",
  body = readFileSync("apps/office/src/comphelper/inc/sequence.ts", "utf8"),
  actual = readFileSync("apps/office/src/" + source, "utf8"),
  caller = 'import { concatSequences } from "../../../comphelper/inc/sequence";';
it("accepts only the actual pure inline owner and exact named source binding", /** Original compiler template has no Comphelper service or SAX reverse dependency. @returns Nothing. */ () => {
  expect(check(source, target, actual, body)).toBe(true);
  expect(check(source, target, caller, body)).toBe(true);
  expect(check("sax/source/other.ts", target, caller, body)).toBe(false);
  expect(check(source, "comphelper/inc/other.ts", caller, body)).toBe(false);
  expect(check(source, target, caller, "")).toBe(false);
});
it("rejects alias/default/namespace/extra/dynamic imports and executable or non-CPPU target dependencies", /** A broader dependency must remain a normal runtime edge and expose any cycle. @returns Nothing. */ () => {
  for (const value of [
    'import { concatSequences as other } from "../../../comphelper/inc/sequence";',
    'import sequence from "../../../comphelper/inc/sequence";',
    'import * as sequence from "../../../comphelper/inc/sequence";',
    'import { concatSequences, other } from "../../../comphelper/inc/sequence";',
    'import("../../../comphelper/inc/sequence");',
    caller + '\nrequire("service");',
  ])
    expect(check(source, target, value, body)).toBe(false);
  for (const value of [
    body + "\nconst service = createService();",
    body + '\nimport { service } from "../../sax/source/fastparser/fastparser";',
    body + '\nexport {service} from "service";',
    body.replace("return result;", 'require("service"); return result;'),
    body.replace("getTypeFavourUnsigned", "otherType"),
    body.replace("export function concatSequences", "export function other"),
  ])
    expect(check(source, target, caller, value)).toBe(false);
});
