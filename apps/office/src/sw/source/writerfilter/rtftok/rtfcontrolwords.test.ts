/** @fileoverview Exact pinned RTFKeyword/control-word metadata and default values, independently compared with native declarations. */
import { expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { RTFKeyword } from "./rtfcontrolwords";
import { getSymbolData, RTFControlType } from "./rtftokenizer";
import data from "./rtftokenizer.controlwords.json";
it("retains all original enum values, spellings, case sensitivity and dispatch defaults", /** This is source data, not a second parser grammar or permissive unknown-word fallback. @returns Nothing. */ () => {
  expect(Object.keys(RTFKeyword)).toHaveLength(1814);
  expect(data.controls).toHaveLength(1823);
  expect(RTFKeyword.invalid).toBe(-1);
  expect(RTFKeyword.HEXCHAR).toBe(0);
  expect(getSymbolData("PAR")).toBeNull();
  expect(getSymbolData("nativeunknown")).toBeNull();
  expect(getSymbolData("par")?.index).toBe(RTFKeyword.PAR);
  expect(getSymbolData("\r\n")?.index).toBe(RTFKeyword.PAR);
  expect(getSymbolData("paperw")).toMatchObject({
    controlType: RTFControlType.VALUE,
    defValue: 12240,
  });
  expect(getSymbolData("pnfs")?.controlType).toBe(RTFControlType.VALUE);
  expect(Object.isFrozen(getSymbolData("paperw"))).toBe(true);
});
const native = "../../vendor/libreoffice-reference/sw/source/writerfilter/rtftok/";
it.skipIf(!existsSync(native + "rtftokenizer.cxx"))(
  "matches every literal native table entry and keyword declaration",
  /** Reads unchanged pinned source directly; no algorithm implementation is copied into a fixture. @returns Nothing. */ () => {
    const enumSource =
      readFileSync(native + "rtfcontrolwords.hxx", "utf8")
        .split("enum class RTFKeyword")[1]
        ?.split("};")[0]
        ?.split("{")[1] ?? "";
    let index = -1;
    const expected: Record<string, number> = {};
    for (const token of enumSource.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/gu, "").split(",")) {
      if (!token.trim()) continue;
      const match = /^\s*(\w+)(?:\s*=\s*(-?\d+))?\s*$/u.exec(token);
      expect(match).not.toBeNull();
      if (!match) throw new Error("Invalid native declaration");
      index = match[2] === undefined ? index + 1 : Number(match[2]);
      expected[match[1] as string] = index;
    }
    expect(RTFKeyword).toEqual(expected);
    const table =
      readFileSync(native + "rtftokenizer.cxx", "utf8")
        .split("controlWords[]{")[1]
        ?.split("\n};")[0] ?? "";
    const rows = [
      ...table.matchAll(
        /\{\s*"((?:\\.|[^"\\])*)"_ostr,\s*\{\s*RTFControlType::(\w+),\s*RTFKeyword::(\w+)(?:,\s*([^}]+))?\s*\}\s*\}/gu,
      ),
    ];
    expect(rows).toHaveLength(1823);
    for (const match of rows) {
      const name = JSON.parse('"' + match[1] + '"') as string;
      expect(getSymbolData(name), name).toEqual({
        controlType: RTFControlType[match[2] as keyof typeof RTFControlType],
        index: expected[match[3] as string],
        defValue: match[4] === undefined ? 0 : Number(match[4].trim()),
      });
    }
  },
);
