/** @fileoverview Original Calc script flags over actual OUString UTF16,without host Unicode heuristics. */
import { expect, it } from "vitest";
import { GetStringScriptType } from "./documen6";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType as S } from "../../../../svl/inc/languageoptions";
it("aggregates source Latin,Asian and complex runs,ignoring empty and weak strings", /** Aggregates source Latin,Asian and complex runs,ignoring empty and weak strings. @returns Operation result. */ () => {
  const breakIterator = new BreakIteratorImpl();
  for (const [value, script] of [
    ["", S.NONE],
    [" \u00a0\u0001\u0002😀", S.NONE],
    ["123!?", S.LATIN],
    ["Русский", S.LATIN],
    ["漢字𠀀", S.ASIAN],
    ["العربيةไทย", S.COMPLEX],
    ["A漢字 العربية", S.LATIN | S.ASIAN | S.COMPLEX],
  ] as const) {
    const string = unicode(value);
    try {
      expect(GetStringScriptType(string, breakIterator)).toBe(script);
      expect(GetStringScriptType(string, null)).toBe(S.NONE);
    } finally {
      string.dispose();
    }
  }
});
