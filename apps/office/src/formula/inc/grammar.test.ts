/** @fileoverview Original shared address convention enum from complete ordinary ScCalcConfig native observations. */
import { expect, it } from "vitest";
import { FormulaGrammar } from "./grammar";
import fixture from "./native-grammar-cases.json";
it("matches original shared address convention enum", /** Compares all original address enum values. @returns Nothing. */ () => {
  expect(
    "grammar " +
      Object.values(FormulaGrammar.AddressConvention)
        .map(/** Emits original enum entry. @param v - Value. @returns Field. */ (v) => v + ",")
        .join(""),
  ).toBe(fixture.output);
});
