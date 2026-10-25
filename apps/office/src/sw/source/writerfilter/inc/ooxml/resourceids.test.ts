/** @fileoverview Checks native generated OOXML resource IDs without assigning new local token numbers. */
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";
import { NS_ooxml } from "./resourceids";

const nativeRoot = "../../vendor/libreoffice-reference/sw/source/writerfilter/ooxml/";

it("retains fixed native IDs and immutable generated declarations", /** Covers independent pinned generator results for actual consumed names. @returns Nothing. */ () => {
  expect(NS_ooxml.LN_EG_RPrBase_b).toBe(92555);
  expect(NS_ooxml.LN_EG_RPrBase_color).toBe(92571);
  expect(NS_ooxml.LN_EG_RPrBase_sz).toBe(92576);
  expect(NS_ooxml.LN_CT_Fonts_ascii).toBe(92545);
  expect(NS_ooxml.LN_CT_PPrBase_keepLines).toBe(92199);
  expect(Object.isFrozen(NS_ooxml)).toBe(true);
  expect(new Set(Object.values(NS_ooxml)).size).toBe(Object.keys(NS_ooxml).length);
});

it.skipIf(!existsSync(nativeRoot + "model.xml"))(
  "matches every consumed ID against the unchanged original generator",
  /** Executes the actual pinned generator locally; no fixtures or generated native implementation are copied. @returns Nothing. */ () => {
    const output = execFileSync(
      "python3",
      [nativeRoot + "resourceids.py", nativeRoot + "model.xml"],
      { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
    );
    const expected = new Map(
      [...output.matchAll(/const Id (LN_\w+) = (\d+);/g)].map(
        /** Reads exact original definitions. @param match - Declaration. @returns Name/value pair. */ (
          match,
        ) => [match[1], Number(match[2])],
      ),
    );
    for (const [name, value] of Object.entries(NS_ooxml))
      expect(value, name).toBe(expected.get(name));
  },
);
