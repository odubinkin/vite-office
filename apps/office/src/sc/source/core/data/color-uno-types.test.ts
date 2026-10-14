/** @fileoverview Calc's native color Any dependency uses actual shared offapi types before its full attribute transport is available. */
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { cppu_detail_getUnoType as colorType } from "../../../../offapi/com/sun/star/util/XComplexColor";
import { cppu_detail_getUnoType as themeType } from "../../../../offapi/com/sun/star/util/XTheme";
import type { Color } from "../../../../offapi/com/sun/star/util/Color";
it("admits the native color interface and signed32 Color alias through actual shared transport", /** Does not fabricate ColorItem Any methods, components or a document pool. @returns Nothing. */ () => {
  const complex = new Any([null], ["Reference", colorType]),
    theme = new Any([null], ["Reference", themeType]),
    rgb: Color = -1,
    scalar = new Any([rgb], "sal_Int32"),
    reference = new Reference(complex, UNO_QUERY, colorType),
    out: [Color] = [0];
  try {
    expect(complex.getValueType().operatorEqual(colorType())).toBe(true);
    expect(theme.getValueType().operatorEqual(themeType())).toBe(true);
    expect(complex.getValueType().operatorEqual(theme.getValueType())).toBe(false);
    expect(reference.is()).toBe(false);
    expect(scalar.extract(out, "sal_Int32")).toBe(true);
    expect(out[0]).toBe(-1);
  } finally {
    reference.dispose();
    complex.dispose();
    theme.dispose();
    scalar.dispose();
  }
});
