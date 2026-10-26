/** @fileoverview Original CharClass locale ownership and Unicode classification used by number input. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { CharClass } from "./charclass";
import { KCharacterType } from "../../../i18npool/source/characterclassification/cclass_unicode";

it("requires a nonempty run of ASCII digits for native filter sheet numbers", () => {
  expect(CharClass.isAsciiNumeric("123")).toBe(true);
  expect(["", "1x", "-1", "١", "𝟙"].map(CharClass.isAsciiNumeric)).toEqual([
    false,
    false,
    false,
    false,
    false,
  ]);
});

it("keeps the construction locale for source uppercase", () => {
  const tr = new Locale(unicode("tr"), unicode("TR"), unicode("")),
    classifier = new CharClass(tr),
    input = unicode("i");
  try {
    const output = classifier.uppercase(input);
    expect(text(output)).toBe("İ");
    output.dispose();
    expect(text(classifier.getMyLocale().Language)).toBe("tr");
  } finally {
    input.dispose();
    classifier.dispose();
    tr.dispose();
  }
});

it("uses native ASCII and Unicode digit/letter-number categories", () => {
  const locale = new Locale(unicode("en"), unicode("US"), unicode("")),
    classifier = new CharClass(locale),
    ascii = unicode("A3_"),
    unicodeDigits = unicode("٣𝟠"),
    roman = unicode("Ⅻ");
  try {
    expect(classifier.isDigit(ascii, 1)).toBe(true);
    expect(classifier.getCharacterType(ascii, 1) & KCharacterType.DIGIT).toBeTruthy();
    expect(classifier.isDigit(ascii, 0)).toBe(false);
    expect(classifier.isLetterNumeric(ascii, 0)).toBe(true);
    expect(classifier.isLetterNumeric(ascii, 2)).toBe(false);
    expect(classifier.isDigit(unicodeDigits, 0)).toBe(true);
    expect(classifier.isDigit(unicodeDigits, 1)).toBe(true);
    expect(classifier.isNumeric(unicodeDigits)).toBe(true);
    expect(classifier.isDigit(roman, 0)).toBe(true);
    expect(classifier.isNumeric(ascii)).toBe(false);
  } finally {
    roman.dispose();
    unicodeDigits.dispose();
    ascii.dispose();
    classifier.dispose();
    locale.dispose();
  }
});
