/** @fileoverview Tests the installed official JS library through the original Numbertext loading/cache owner. */
import { expect, it } from "vitest";
import { Numbertext } from "./Numbertext";

it.each([
  ["en", "123", "one hundred twenty-three"],
  ["en-GB", "101", "one hundred and one"],
  ["en-IN", "100000", "one lakh"],
  ["fr", "80", "quatre-vingts"],
  ["fr-BE", "90", "nonante"],
  ["de-CH", "30", "dreissig"],
  ["no", "1", "én"],
  ["nb", "1", "én"],
  ["nb-NO", "1", "én"],
  ["nn", "1", "éin"],
  ["Roman", "123", "CXXIII"],
  ["it", "ordinal 1", "$1primo"],
  ["uk", "0.25", "нуль цілих й двадцять пʼят сотих"],
])(
  "loads %s and runs the dependency for %s",
  /** Checks source filename fallbacks and explicitly accepted official JS outputs. @param lang - Language key. @param input - Original input. @param expected - Output. @returns Nothing. */ (
    lang,
    input,
    expected,
  ) => {
    const owner = new Numbertext(),
      number: [string] = [input];
    expect(owner.numbertext(number, lang)).toBe(true);
    expect(number[0]).toBe(expected);
  },
);

it("retains missing-file input and distinguishes a loaded no-match", /** Preserves the loader boolean independently of interpreter output. @returns Nothing. */ () => {
  const owner = new Numbertext(),
    number: [string] = ["not a number"];
  expect(owner.numbertext(number, "unavailable")).toBe(false);
  expect(number[0]).toBe("not a number");
  expect(owner.numbertext(number, "en")).toBe(true);
  expect(number[0]).toBe("");
});

it("keeps the first exact language cache insertion and owner-local prefix", /** Exercises actual source insert and lazy-loading behavior. @returns Nothing. */ () => {
  const owner = new Numbertext(),
    number: [string] = ["1"];
  expect(owner.load("key", "en.sor")).toBe(true);
  expect(owner.load("key", "fr.sor")).toBe(true);
  expect(owner.numbertext(number, "key")).toBe(true);
  expect(number[0]).toBe("one");
  owner.set_prefix("absent/");
  number[0] = "2";
  expect(owner.numbertext(number, "key")).toBe(true);
  expect(number[0]).toBe("two");
  expect(owner.numbertext(number, "en")).toBe(false);
  expect(new Numbertext().numbertext(number, "en")).toBe(true);
});
