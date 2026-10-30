/** @fileoverview Original SvxFont base/derived constructor and assignment distinctions over actual Font/LanguageTag state. */
import { expect, it } from "vitest";
import { SvxFont } from "../../inc/svxfont";
import { Font } from "../../../vcl/source/font/font";
import { SvxCaseMap } from "../../inc/svxenum";
import {
  LANGUAGE_ENGLISH_US,
  LANGUAGE_GERMAN,
  LANGUAGE_SYSTEM,
  LANGUAGE_DONTKNOW,
} from "../../../i18nlangtag/inc/lang";

it("retains base Font language/COW and resets language only for SvxFont base construction", /** Original copy construction and base-reference construction select different scalar/language initialization. @returns Nothing. */ () => {
  expect(new Font().GetLanguage()).toBe(LANGUAGE_DONTKNOW);
  const source = new SvxFont();
  source.SetFamilyName("Original");
  source.SetLanguage(LANGUAGE_ENGLISH_US);
  source.SetEscapement(20);
  source.SetPropr(75);
  source.SetCaseMap(SvxCaseMap.SmallCaps);
  const copy = new SvxFont(source),
    baseCopy = new SvxFont(source, true),
    plain = new Font(source);
  expect([copy.GetLanguage(), copy.GetEscapement(), copy.GetPropr(), copy.IsCapital()]).toEqual([
    LANGUAGE_ENGLISH_US,
    20,
    75,
    true,
  ]);
  expect([
    baseCopy.GetLanguage(),
    baseCopy.GetEscapement(),
    baseCopy.GetPropr(),
    baseCopy.IsCaseMap(),
  ]).toEqual([LANGUAGE_SYSTEM, 0, 100, false]);
  plain.SetLanguage(LANGUAGE_GERMAN);
  expect(source.GetLanguage()).toBe(LANGUAGE_ENGLISH_US);
  expect(plain.EqualIgnoreColor(source)).toBe(false);
  copy.SetFamilyName("Independent");
  expect(source.GetFamilyName()).toBe("Original");
});

it("preserves derived fields under base assignment and copies them under derived assignment", /** Explicit base selection erases static C++ overload choice even for a derived runtime operand. @returns Nothing. */ () => {
  const target = new SvxFont(),
    source = new SvxFont();
  target.SetEscapement(10);
  target.SetPropr(80);
  source.SetEscapement(30);
  source.SetPropr(50);
  source.SetLanguage(LANGUAGE_GERMAN);
  target.assign(source, true);
  expect([target.GetLanguage(), target.GetEscapement(), target.GetPropr()]).toEqual([
    LANGUAGE_GERMAN,
    10,
    80,
  ]);
  target.assign(source);
  expect(target.SvxFontSubsetEquals(source)).toBe(true);
  target.SetFamilyName("different base value");
  expect(target.SvxFontSubsetEquals(source)).toBe(true);
  target.SetProprRel(33);
  expect(target.GetPropr()).toBe(16);
  target.SetEscapement(65535);
  expect(target.GetEscapement()).toBe(-1);
});
