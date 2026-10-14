/** @fileoverview Source-backed schema and dynamic type cases using real Any/UnoType values, without a type provider substitute. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { UnoType } from "../../cppu/inc/unotype";
import type { UnoTypeArgument } from "../../cppu/inc/unotype";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Type, isListType, elementType, mapType, getDynamicType } from "./type";

/** Reads the actual UTF16 owner. @param value - Actual string. @returns Exact JS string. */
function text(value: OUStringConstReference): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}

it("retains schema enum values, every list element and real cached UNO type mapping", /** Checks literal native declarations rather than inferring types from JS values. @returns Nothing. */ () => {
  const names = [
    "TYPE_ERROR",
    "TYPE_NIL",
    "TYPE_ANY",
    "TYPE_BOOLEAN",
    "TYPE_SHORT",
    "TYPE_INT",
    "TYPE_LONG",
    "TYPE_DOUBLE",
    "TYPE_STRING",
    "TYPE_HEXBINARY",
    "TYPE_BOOLEAN_LIST",
    "TYPE_SHORT_LIST",
    "TYPE_INT_LIST",
    "TYPE_LONG_LIST",
    "TYPE_DOUBLE_LIST",
    "TYPE_STRING_LIST",
    "TYPE_HEXBINARY_LIST",
  ] as const;
  for (let index = 0; index < names.length; index++) {
    const type = Type[names[index] as keyof typeof Type] as Type;
    expect(type).toBe(index);
    expect(isListType(type)).toBe(index >= 10);
    if (index >= 10) expect(elementType(type)).toBe(index - 7);
  }
  const shapes: readonly [Type, UnoTypeArgument, string][] = [
    [Type.TYPE_ANY, "Any", "any"],
    [Type.TYPE_BOOLEAN, "sal_Bool", "boolean"],
    [Type.TYPE_SHORT, "sal_Int16", "short"],
    [Type.TYPE_INT, "sal_Int32", "long"],
    [Type.TYPE_LONG, "sal_Int64", "hyper"],
    [Type.TYPE_DOUBLE, "double", "double"],
    [Type.TYPE_STRING, "OUString", "string"],
    [Type.TYPE_HEXBINARY, ["Sequence", "sal_Int8"], "[]byte"],
    [Type.TYPE_BOOLEAN_LIST, ["Sequence", "sal_Bool"], "[]boolean"],
    [Type.TYPE_SHORT_LIST, ["Sequence", "sal_Int16"], "[]short"],
    [Type.TYPE_INT_LIST, ["Sequence", "sal_Int32"], "[]long"],
    [Type.TYPE_LONG_LIST, ["Sequence", "sal_Int64"], "[]hyper"],
    [Type.TYPE_DOUBLE_LIST, ["Sequence", "double"], "[]double"],
    [Type.TYPE_STRING_LIST, ["Sequence", "OUString"], "[]string"],
    [Type.TYPE_HEXBINARY_LIST, ["Sequence", ["Sequence", "sal_Int8"]], "[][]byte"],
  ];
  for (const [type, shape, name] of shapes) {
    const actual = mapType(type);
    expect(actual.getTypeLibType()).toBe(UnoType.get(shape).getTypeLibType());
    expect(mapType(type)).toBe(actual);
    expect(text(actual.getTypeName())).toBe(name);
  }
});

it("classifies actual primitive, unsigned boundary and sequence values through existing UNO contracts", /** Does not fabricate a false has result or invent a payload-range test. @returns Nothing. */ () => {
  const primitive: readonly [UnoTypeArgument, Type][] = [
    ["void", Type.TYPE_NIL],
    ["bool", Type.TYPE_BOOLEAN],
    ["sal_Int8", Type.TYPE_SHORT],
    ["sal_Int16", Type.TYPE_SHORT],
    ["sal_uInt16", Type.TYPE_SHORT],
    ["sal_Int32", Type.TYPE_INT],
    ["sal_uInt32", Type.TYPE_INT],
    ["sal_Int64", Type.TYPE_LONG],
    ["sal_uInt64", Type.TYPE_LONG],
    ["float", Type.TYPE_DOUBLE],
    ["double", Type.TYPE_DOUBLE],
    ["OUString", Type.TYPE_STRING],
    ["sal_Unicode", Type.TYPE_ERROR],
    ["Type", Type.TYPE_ERROR],
  ];
  for (const [shape, expected] of primitive) {
    const value = new Any(null, UnoType.get(shape));
    expect(getDynamicType(value)).toBe(expected);
  }
  for (const [shape, value, expected] of [
    ["sal_uInt16", 65535, Type.TYPE_SHORT],
    ["sal_uInt32", 4294967295, Type.TYPE_INT],
    ["sal_uInt64", 18446744073709551615n, Type.TYPE_LONG],
  ] as const) {
    const actual = new Any([value], UnoType.get(shape));
    expect(getDynamicType(actual)).toBe(expected);
    expect(
      actual.has(
        shape === "sal_uInt16" ? "sal_Int16" : shape === "sal_uInt32" ? "sal_Int32" : "sal_Int64",
      ),
    ).toBe(true);
  }
  const sequence: readonly [UnoTypeArgument, Type][] = [
    ["sal_Int8", Type.TYPE_HEXBINARY],
    ["sal_Bool", Type.TYPE_BOOLEAN_LIST],
    ["sal_Int16", Type.TYPE_SHORT_LIST],
    ["sal_Int32", Type.TYPE_INT_LIST],
    ["sal_Int64", Type.TYPE_LONG_LIST],
    ["double", Type.TYPE_DOUBLE_LIST],
    ["OUString", Type.TYPE_STRING_LIST],
    [["Sequence", "sal_Int8"], Type.TYPE_HEXBINARY_LIST],
    ["float", Type.TYPE_ERROR],
    ["sal_uInt16", Type.TYPE_ERROR],
  ];
  for (const [element, expected] of sequence)
    expect(getDynamicType(new Any(null, UnoType.get(["Sequence", element])))).toBe(expected);
});

it("throws the actual original UNO exception for non-list element and unsupported schema mapping release fallbacks", /** Explicit release contract excludes the preceding native debug assertions. @returns Nothing. */ () => {
  for (const [operation, input] of [
    [elementType, Type.TYPE_STRING],
    [mapType, Type.TYPE_ERROR],
    [mapType, Type.TYPE_NIL],
  ] as const) {
    let caught: unknown;
    try {
      operation(input);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(RuntimeException);
    expect(text((caught as RuntimeException).Message)).toBe("this cannot happen");
  }
});
