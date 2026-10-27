/** @fileoverview Source SwBreakIt script decisions, weak-run priority, UTF16 boundaries and current application language binding. */
import { afterEach, expect, it } from "vitest";
import { SwBreakIt, GetWriterTextUnits } from "./breakit";
import * as S from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import {
  getConfiguredSystemLanguage,
  setConfiguredSystemLanguage,
} from "../../../../i18nlangtag/source/isolang/mslangid";
const prior = getConfiguredSystemLanguage();
afterEach(
  /** Restores the genuine configured language. @returns Nothing. */ () =>
    setConfiguredSystemLanguage(prior),
);
it.each([
  ["A  漢", 1, S.LATIN],
  ["A  漢", 2, S.LATIN],
  ["  漢", 0, S.ASIAN],
  ["العربية 漢", 7, S.COMPLEX],
  ["A漢", 1, S.ASIAN],
  ["A漢", 2, S.ASIAN],
  ["A", -1, S.LATIN],
  ["漢", -1, S.ASIAN],
  ["漢", 1, S.ASIAN],
  ["𠀀", 0, S.ASIAN],
  ["𠀀", 2, S.LATIN],
  ["𠀀", 1, S.LATIN],
  [" ा", 0, S.COMPLEX],
  ["A ा", 1, S.COMPLEX],
] as const)(
  "follows source real script for %s at %s",
  /** Checks source precedence and original code-unit access. @param text - Logical text. @param position - Native position. @param script - Source result. @returns Nothing. */ (
    text,
    position,
    script,
  ) => {
    setConfiguredSystemLanguage(0x409);
    expect(new SwBreakIt().GetRealScriptOfText(text, position)).toBe(script);
  },
);
it("uses the actual configured language only after weak text fails both directions", /** No hardcoded Latin service is introduced. @returns Nothing. */ () => {
  const owner = new SwBreakIt();
  setConfiguredSystemLanguage(0x411);
  expect(owner.GetRealScriptOfText("", 0)).toBe(S.ASIAN);
  expect(owner.GetRealScriptOfText("   ", 1)).toBe(S.ASIAN);
  setConfiguredSystemLanguage(0x401);
  expect(owner.GetRealScriptOfText("", 0)).toBe(S.COMPLEX);
  expect(owner.GetRealScriptOfText("A ", 1)).toBe(S.LATIN);
});
it.each([
  ["", 0],
  ["A", 1],
  ["漢", 2],
  ["العربية", 4],
  ["A漢", 3],
  ["A العربية", 5],
  ["漢العربية", 6],
  ["A漢العربية", 7],
  [" A", 7],
  [" 漢", 7],
  [" ", 7],
  ["A ", 1],
  ["𠀀", 2],
] as const)(
  "keeps original all-scripts mask for %s",
  /** Initial weak text contributes all original script bits. @param text - Logical text. @param mask - Source mask. @returns Nothing. */ (
    text,
    mask,
  ) => {
    expect(new SwBreakIt().GetAllScriptsOfText(text)).toBe(mask as SvtScriptType);
  },
);
it("borrows one actual break service and keeps raw UTF16 text units", /** Tests the native owner rather than a browser language projection. @returns Nothing. */ () => {
  const owner = new SwBreakIt();
  expect(owner.GetBreakIter()).toBe(owner.GetBreakIter());
  expect([...GetWriterTextUnits("𠀀\ud800")]).toEqual([0xd840, 0xdc00, 0xd800]);
});
