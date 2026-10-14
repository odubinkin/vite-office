/** @fileoverview Original shared address convention enum from complete ordinary ScCalcConfig native observations. */
import { expect, it } from "vitest";
import { FormulaGrammar } from "./grammar";
import fixture from "./native-grammar-cases.json";
import { FormulaLanguage } from "../../offapi/com/sun/star/sheet/FormulaLanguage";
import wholeFixture from "./native-grammar-state-cases.json";
it("matches original shared address convention enum", /** Compares all original address enum values. @returns Nothing. */ () => {
  expect(
    "grammar " +
      Object.values(FormulaGrammar.AddressConvention)
        .map(/** Emits original enum entry. @param v - Value. @returns Field. */ (v) => v + ",")
        .join(""),
  ).toBe(fixture.output);
});

it("matches complete original shared grammar and language stream", /** Replays every original named grammar/API query and initialized packed-state history. @returns Nothing. */ () => {
  const lines: string[] = [];
  for (const [name, value] of Object.entries(FormulaLanguage))
    lines.push(`language ${name} ${value}`);
  lines.push(
    `flags ${FormulaGrammar.kConventionOffset} ${FormulaGrammar.kConventionShift} ${FormulaGrammar.kEnglishBit} ${FormulaGrammar.kFlagMask}`,
  );
  for (const [name, value] of Object.entries(FormulaGrammar.Grammar))
    lines.push(`enum ${name} ${value}`);
  /** Mirrors native observation fields, skipping original out-of-domain negative convention casts. @param stage - History stage. @param input - Input. @param value - Packed grammar. @returns Nothing. */
  function state(stage: string, input: number, value: number): void {
    const conv = value < 0 ? "excluded" : FormulaGrammar.extractRefConvention(value);
    const ooRef = value < 0 ? "excluded" : +FormulaGrammar.isRefConventionOOXML(value);
    const excel = value < 0 ? "excluded" : +FormulaGrammar.isExcelSyntax(value);
    lines.push(
      `${stage} ${input} ${value} ${+FormulaGrammar.isEnglish(value)} ${+FormulaGrammar.isSupported(value)} ${FormulaGrammar.extractFormulaLanguage(value)} ${conv} ${+FormulaGrammar.isPODF(value)} ${+FormulaGrammar.isODFF(value)} ${+FormulaGrammar.isOOXML(value)} ${ooRef} ${excel}`,
    );
  }
  for (const english of [false, true])
    for (const xml of [false, true])
      state("api", +english * 2 + +xml, FormulaGrammar.mapAPItoGrammar(english, xml));
  const values = [
    ...Object.values(FormulaGrammar.Grammar),
    0,
    6,
    32767,
    65535,
    65536,
    16777216,
    16777222,
    FormulaGrammar.Grammar.GRAM_EXTERNAL | (9 << 16) | FormulaGrammar.kEnglishBit,
  ];
  for (const value of values) {
    state("query", value, value);
    for (const english of [false, true])
      state("english", +english, FormulaGrammar.setEnglishBit(value, english));
    for (const convention of Object.values(FormulaGrammar.AddressConvention))
      state("merge", convention, FormulaGrammar.mergeToGrammar(value, convention));
  }
  expect(lines.join("\n") + "\n").toBe(wholeFixture.captures.state);
});
