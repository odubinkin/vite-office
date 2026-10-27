/** @fileoverview Source UTF16 script runs,weak handling,surrogates and retained cache quirk CALC-200. */
import { expect, it } from "vitest";
import { BreakIteratorImpl } from "./breakiteratorImpl";
import * as S from "../../../offapi/com/sun/star/i18n/ScriptType";
/** Creates a logical UTF16 view without host script classification. @param value - Text. @returns Code units. */
function units(value: string): Uint16Array {
  return Uint16Array.from(
    { length: value.length },
    /** Copies one original UTF16 code unit. @param _ - Original callback input. @param i - Original callback input. @returns Operation result. */ (
      _,
      i,
    ) => value.charCodeAt(i),
  );
}
it("preserves the process cache's original first-NUL behavior and shares it between instances", /** Preserves the process cache's original first-NUL behavior and shares it between instances. @returns Operation result. */ () => {
  const bi = new BreakIteratorImpl();
  expect(bi.getScriptClass(0)).toBe(S.WEAK);
  expect(bi.getScriptClass(65)).toBe(S.LATIN);
  expect(new BreakIteratorImpl().getScriptClass(0)).toBe(S.LATIN);
  expect(bi.getScriptClass(0)).toBe(S.LATIN);
});
it("returns native UTF16 run boundaries and attaches trailing weak codepoints", /** Returns native UTF16 run boundaries and attaches trailing weak codepoints. @returns Operation result. */ () => {
  const bi = new BreakIteratorImpl(),
    text = units("A 漢字 العربية😀");
  expect(bi.getScriptType(text, -1)).toBe(S.WEAK);
  expect(bi.getScriptType(text, text.length)).toBe(S.WEAK);
  expect(bi.endOfScript(text, -1, S.LATIN)).toBe(-1);
  expect(bi.endOfScript(text, text.length, S.LATIN)).toBe(-1);
  expect(bi.endOfScript(text, 0, S.ASIAN)).toBe(-1);
  expect(bi.endOfScript(text, 0, S.LATIN)).toBe(2);
  expect(bi.endOfScript(text, 2, S.ASIAN)).toBe(5);
  expect(bi.endOfScript(text, 5, S.COMPLEX)).toBe(text.length);
  for (const value of ["😀", "𠀀", "𠀀A", "A𠀀", "𠀀𠀀", "\ud800", "\udc00"]) {
    const t = units(value),
      script = bi.getScriptType(t, 0);
    const firstEnd = bi.endOfScript(t, 0, script);
    expect(firstEnd).toBeGreaterThan(0);
    expect(firstEnd).toBeLessThanOrEqual(t.length);
  }
  expect(bi.endOfScript(units("𠀀"), 0, S.ASIAN)).toBe(2);
  expect(bi.endOfScript(units("𠀀A"), 0, S.ASIAN)).toBe(2);
  expect(bi.endOfScript(units("A𠀀"), 0, S.LATIN)).toBe(1);
});
it("retains backward-run weak asymmetry and source low-surrogate offsets", /** beginOfScript searches exactly its input class and advances past a mismatching codepoint. @returns Nothing. */ () => {
  const bi = new BreakIteratorImpl(),
    text = units("A  漢");
  expect(bi.beginOfScript(text, -1, S.WEAK)).toBe(-1);
  expect(bi.beginOfScript(text, 4, S.WEAK)).toBe(-1);
  expect(bi.beginOfScript(text, 0, S.ASIAN)).toBe(-1);
  expect(bi.beginOfScript(text, 0, S.LATIN)).toBe(0);
  expect(bi.beginOfScript(text, 2, S.WEAK)).toBe(1);
  expect(bi.beginOfScript(text, 3, S.ASIAN)).toBe(3);
  expect(bi.beginOfScript(units("𠀀𠀀"), 2, S.ASIAN)).toBe(0);
  expect(bi.beginOfScript(units("𠀀"), 1, S.WEAK)).toBe(2);
});
