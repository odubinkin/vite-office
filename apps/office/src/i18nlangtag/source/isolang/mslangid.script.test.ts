/** @fileoverview Original static script exceptions,primary categories and configured fallback resolution for native font defaults. */
import { expect, it } from "vitest";
import {
  ScriptType as S,
  getScriptType,
  resolveSystemLanguageByScriptType as resolve,
  setConfiguredWesternFallback,
  setConfiguredAsianFallback,
  setConfiguredComplexFallback,
} from "./mslangid.script";
import { MsLangId } from "../../inc/mslangid";
it("keeps native static script exception priority and on-the-fly boundary explicit", /** Uses independent IDs for competing primary and explicit branches. @returns Nothing. */ () => {
  for (const id of [0x0850, 0x7c50, 0x1226, 0x0e26, 0x0492, 0x7c92])
    expect(getScriptType(id)).toBe(S.COMPLEX);
  for (const id of [0x0450, 0x7850, 0x0a26, 0x0626]) expect(getScriptType(id)).toBe(S.LATIN);
  for (const id of [0x0804, 0x0411, 0x0412, 0x048e]) expect(getScriptType(id)).toBe(S.ASIAN);
  for (const id of [0x0401, 0x0439, 0x041e, 0x040d, 0x0451])
    expect(getScriptType(id)).toBe(S.COMPLEX);
  for (const id of [0x0409, 0x03df, 0x03e0, 0xffff, 0xffe0, 0x03ff])
    expect(getScriptType(id)).toBe(S.LATIN);
  expect(
    /** Rejects an unregistered first dynamic language ID. @returns Never. */ () =>
      getScriptType(0x07e0),
  ).toThrow(/On-the-fly/);
  expect(
    /** Rejects an unregistered last dynamic sublanguage range. @returns Never. */ () =>
      getScriptType(0xfbe0),
  ).toThrow(/On-the-fly/);
});
it("preserves NONE,WEAK,matching scripts,source fallback defaults and configured overrides", /** Restores process configuration after each native scalar state mutation. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(0x0409);
  try {
    expect(resolve(0xff, S.ASIAN)).toBe(0xff);
    expect(resolve(0, S.WEAK)).toBe(0x0409);
    expect(resolve(0, S.LATIN)).toBe(0x0409);
    expect(resolve(0, S.ASIAN)).toBe(0x0804);
    expect(resolve(0, S.COMPLEX)).toBe(0x0439);
    expect(resolve(0x0439, S.LATIN)).toBe(0x0409);
    expect(resolve(0, 999)).toBe(0x0409);
    setConfiguredWesternFallback(0x0407);
    setConfiguredAsianFallback(0x0411);
    setConfiguredComplexFallback(0x041e);
    expect(resolve(0x0439, S.LATIN)).toBe(0x0407);
    expect(resolve(0, S.ASIAN)).toBe(0x0411);
    expect(resolve(0, S.COMPLEX)).toBe(0x041e);
    expect(resolve(0x0411, S.ASIAN)).toBe(0x0411);
  } finally {
    setConfiguredWesternFallback(0);
    setConfiguredAsianFallback(0);
    setConfiguredComplexFallback(0);
    MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(0);
  }
});
