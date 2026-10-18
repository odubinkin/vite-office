/** @fileoverview Verifies original normal color/theme interface metadata and actual shared Any/null-reference contracts. */
import { expect, expectTypeOf, it } from "vitest";
import { XTheme, cppu_detail_getUnoType as themeType, getCppuType as legacyTheme } from "./XTheme";
import {
  XComplexColor,
  cppu_detail_getUnoType as colorType,
  getCppuType as legacyColor,
} from "./XComplexColor";
import type { Color } from "./Color";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import { UnoType } from "../../../../../cppu/inc/unotype";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type {
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Observes the real acquired Unicode name and destroys only that name owner. @param type - Borrowed Type. @returns Exact interface name. */
function typeName(type: Type): string {
  const name = type.getTypeName();
  try {
    return String.fromCharCode(...name.getStr().subarray(0, name.getLength()));
  } finally {
    name.dispose();
  }
}
it("retains native normal auto-root metadata and cold/warm getter identity", /** Checks actual shared factory state, without a reflection/type provider. @returns Nothing. */ () => {
  for (const [api, getter, legacy, name] of [
    [XTheme, themeType, legacyTheme, "com.sun.star.util.XTheme"],
    [XComplexColor, colorType, legacyColor, "com.sun.star.util.XComplexColor"],
  ] as const) {
    const cold = getter(),
      ref = cold.getTypeLibType() as R,
      desc = ref.pType as unknown as I;
    expect(typeName(cold)).toBe(name);
    expect(cold.getTypeClass()).toBe(22);
    expect(ref.eTypeClass).toBe(22);
    expect([
      desc.nBaseTypes,
      desc.nMembers,
      desc.nAllMembers,
      desc.ppMembers,
      desc.ppAllMembers,
      desc.aBase.bComplete,
    ]).toEqual([1, 0, 0, null, null, false]);
    expect(desc.pBaseTypeDescription?.aBase.pWeakRef).toBe(
      UnoType.get("XInterface").getTypeLibType(),
    );
    expect(getter()).toBe(cold);
    expect(api.static_type()).toBe(cold);
    expect(api.static_type(null)).toBe(cold);
    expect(legacy()).toBe(cold);
    expect(legacy(null)).toBe(cold);
  }
  expect(colorType().operatorEqual(themeType())).toBe(false);
});
it("retains the exact IDL generic reference and return contracts", /** Compile-time contract witnesses are derived from native IDLs and use existing shared owners. @returns Nothing. */ () => {
  expectTypeOf<ReturnType<XTheme["getName"]>>().toEqualTypeOf<OUString>();
  expectTypeOf<ReturnType<XTheme["getColorSet"]>>().toEqualTypeOf<Sequence<Color>>();
  expectTypeOf<Parameters<XComplexColor["resolveColor"]>>().toEqualTypeOf<[Reference<XTheme>]>();
  expectTypeOf<ReturnType<XComplexColor["resolveColor"]>>().toEqualTypeOf<Color>();
});
it("transports actual typed-null interfaces through Any and Reference without a component mock", /** Checks real native interface-null assignment and root/cross queries, not a fabricated implementation. @returns Nothing. */ () => {
  for (const getter of [themeType, colorType]) {
    const value = new Any([null], ["Reference", getter]),
      same: [XInterface | null] = [null],
      cross: [XInterface | null] = [null],
      root: [XInterface | null] = [null];
    const reference = new Reference(value, UNO_QUERY, getter),
      queried = value.query(getter);
    try {
      expect(value.hasValue()).toBe(true);
      expect(value.getValueTypeClass()).toBe(22);
      expect(value.getValueType().operatorEqual(getter())).toBe(true);
      expect(value.extract(same, ["Reference", getter])).toBe(true);
      expect(
        value.extract(cross, ["Reference", getter === themeType ? colorType : themeType]),
      ).toBe(true);
      expect(value.extract(root, ["Reference", "XInterface"])).toBe(true);
      expect([same[0], cross[0], root[0], reference.get(), queried.get()]).toEqual([
        null,
        null,
        null,
        null,
        null,
      ]);
      expect(reference.is()).toBe(false);
      const invalid = new Any(true);
      try {
        expect(invalid.extract(same, ["Reference", getter])).toBe(false);
        expect(same[0]).toBe(null);
      } finally {
        invalid.dispose();
      }
    } finally {
      reference.dispose();
      queried.dispose();
      value.dispose();
    }
  }
});
it("keeps Color a signed32 long alias with no independent runtime typedef", /** Checks actual UNO numeric transport rather than pixel buffer interpretation. @returns Nothing. */ () => {
  for (const input of [-2147483648, -1, 0, 0xffffff, 2147483647]) {
    const color: Color = input,
      value = new Any([color], "sal_Int32"),
      out: [Color] = [17];
    try {
      expect(value.getValueTypeClass()).toBe(6);
      expect(typeName(value.getValueType())).toBe("long");
      expect(value.extract(out, "sal_Int32")).toBe(true);
      expect(out[0]).toBe(input);
    } finally {
      value.dispose();
    }
  }
});
