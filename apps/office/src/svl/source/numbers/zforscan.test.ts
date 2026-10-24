/** @fileoverview Original pointer-walk General name extraction includes malformed source modifier inputs. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { extractStandardGeneralName } from "./zforscan";
import formats from "../../../i18npool/source/localedata/data/number-formats.json";

it("retains native modifier,delimiter,and malformed/nested bracket behavior", /** These observations follow the original pointers,not a regex cleanup policy. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["", ""],
    ["General", "General"],
    ["[NatNum1]General", "General"],
    ["[A][B]常规;other", "常规"],
    ["[A;B]Standard;next", "Standard"],
    [";next", ""],
    ["General;", "General"],
    ["[A]", ""],
    ["[A", ""],
    ["[A[B]General", "General"],
    ["]General", "]General"],
    ["[A]General[B]tail", "tail"],
    ["[A]🧮General", "🧮General"],
  ]) {
    const code = unicode(input as string),
      result = extractStandardGeneralName(code);
    try {
      expect(text(result)).toBe(expected);
    } finally {
      result.dispose();
      code.dispose();
    }
  }
});

it("extracts every registered locale's actual index-zero standard name", /** Only the admitted standard entry is tested;this does not assert full scanner parsing. @returns Nothing. */ () => {
  let count = 0;
  for (const catalog of Object.values(formats)) {
    const standard = catalog.find(
      /** Finds original General. @param row - Source locale entry. @returns Index match. */ (
        row,
      ) => row.formatIndex === 0,
    );
    expect(standard).toBeDefined();
    const source = standard as (typeof catalog)[number];
    const code = unicode(source.formatCode),
      name = extractStandardGeneralName(code);
    try {
      expect(name.getLength()).toBeGreaterThan(0);
      expect(text(name)).toBe(source.formatCode.replace(/^\[NatNum1\]/, ""));
      ++count;
    } finally {
      name.dispose();
      code.dispose();
    }
  }
  expect(count).toBe(284);
});
