/** @fileoverview Prevents the inline native date dependency from becoming a service-cycle exception. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { isOriginalInlineDateImport } from "./module-boundaries/inline-date-imports.mjs";

const source = "sax/source/tools/converter.ts";
const target = "comphelper/source/misc/date";
const importer = 'import { getDaysInMonth } from "../../../comphelper/source/misc/date";';
const contents = readFileSync("apps/office/src/comphelper/source/misc/date.ts", "utf8");

it("admits only the actual independent inline date owner and original call binding", /** Mirrors converter.cxx's comphelper/date.hxx call without admitting service initialization. @returns Nothing. */ () => {
  expect(isOriginalInlineDateImport(source, target, importer, contents)).toBe(true);
  expect(isOriginalInlineDateImport(source, target + ".ts", importer, contents)).toBe(true);
  expect(
    isOriginalInlineDateImport("sax/source/fastparser/fastparser.ts", target, importer, contents),
  ).toBe(false);
  expect(
    isOriginalInlineDateImport(source, "comphelper/source/xml/ofopxmlhelper", importer, contents),
  ).toBe(false);
});

it("rejects unrelated bindings, aliases, namespace, default, side-effect and duplicate imports", /** A coarse module-cycle exemption must never authorize other Comphelper APIs. @returns Nothing. */ () => {
  for (const invalid of [
    importer.replace("getDaysInMonth", "normalize"),
    importer.replace("getDaysInMonth", "getDaysInMonth as days"),
    importer.replace("getDaysInMonth", "getDaysInMonth, normalize"),
    importer.replace("{ getDaysInMonth }", "* as date"),
    importer.replace("{ getDaysInMonth }", "getDaysInMonth"),
    importer.replace("{ getDaysInMonth } from ", ""),
    importer.replace("import {", "import type {"),
    importer + importer,
    "",
  ])
    expect(isOriginalInlineDateImport(source, target, invalid, contents)).toBeFalsy();
});

it("rejects static, deferred or executable service dependencies in the date owner", /** Any dependency or initialization restores the normal cycle guard. @returns Nothing. */ () => {
  for (const invalid of [
    'import "../xml/ofopxmlhelper";' + contents,
    contents + '\nexport { ReadContentTypeSequence } from "../xml/ofopxmlhelper";',
    contents + '\nfunction load() { return import("../xml/ofopxmlhelper"); }',
    contents + '\nfunction load() { return require("../xml/ofopxmlhelper"); }',
    contents + "\ninitialize();",
    contents + "\nconst initialized = initialize();",
    "function {",
    "",
  ])
    expect(isOriginalInlineDateImport(source, target, importer, invalid)).toBe(false);
});
