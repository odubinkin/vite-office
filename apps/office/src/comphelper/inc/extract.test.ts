/** @fileoverview Validates actual enum2int over real CPPU type descriptions and Any values. */
import { expect, it } from "vitest";
import { enum2int } from "./extract";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import {
  typelib_static_enum_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../cppu/inc/typelib/typedescription";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
it("extracts actual declared enums and native integer families without changing failed destinations", /** Uses original public static-enum initialization, not a substitute type provider. @returns Nothing. */ () => {
  const cell: [R | null] = [null];
  const name = "com.sun.star.uno.TypeClass\0";
  typelib_static_enum_type_init(
    cell,
    new Uint8Array(
      [...name].map(
        /** ASCII type spelling. @param c - Code unit. @returns Byte. */ (c) => c.charCodeAt(0),
      ),
    ),
    0,
  );
  const type = new Type(cell[0] as R);
  const en = new Any([TypeClass.MAKE_FIXED_SIZE], type);
  const result: [number] = [91];
  expect(en.getValueTypeClass()).toBe(TypeClass.ENUM);
  expect(enum2int(result, en)).toBe(true);
  expect(result[0]).toBe(2147483647);
  const values = [
    new Any([-128], "sal_Int8"),
    new Any([-1], "sal_Int16"),
    new Any([65535], "sal_uInt16"),
    new Any([-2147483648], "sal_Int32"),
    new Any([4294967295], "sal_uInt32"),
  ];
  for (const [i, value] of values.entries()) {
    expect(enum2int(result, value)).toBe(true);
    expect(result[0]).toBe([-128, -1, 65535, -2147483648, -1][i]);
    value.dispose();
  }
  for (const bad of [
    new Any(),
    new Any(true),
    new Any([1n], "sal_Int64"),
    new Any([1], "double"),
  ]) {
    result[0] = 91;
    expect(enum2int(result, bad)).toBe(false);
    expect(result[0]).toBe(91);
    bad.dispose();
  }
  en.dispose();
  type.dispose();
});
