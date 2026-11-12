/** @fileoverview Actual original converter component, native value conversions and the available original XTypeConverter QA method; no service manager, type provider or interface mock. */
import { afterEach, expect, it } from "vitest";
import { com_sun_star_comp_stoc_TypeConverter_get_implementation as create } from "./convert";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType, getTypeFromTypeClass, type UnoTypeArgument } from "../../../cppu/inc/unotype";
import { SAL_NO_ACQUIRE } from "../../../sal/inc/types";
import { XTypeConverter } from "../../../udkapi/com/sun/star/script/XTypeConverter";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { cppu_detail_getUnoType_TypeClass as enumType } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { cppu_detail_getUnoType as argumentType } from "../../../udkapi/com/sun/star/script/CannotConvertException";
import { typelib_TypeClass as TC } from "../../../cppu/inc/typelib/typeclass";
import { TypeClass as C } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { CannotConvertException } from "../../../udkapi/com/sun/star/script/CannotConvertException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { FailReason } from "../../../udkapi/com/sun/star/script/FailReason";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Calls the actual original acquired component export and queries its declared facet. @returns Actual converter. */
function converter(): XTypeConverter {
  const args = own(new (Sequence.specialize<Any>("Any", 24))()),
    root = own(new Reference(create(null, args), SAL_NO_ACQUIRE));
  return api(own(new Reference<XTypeConverter>(root, UNO_QUERY_THROW, XTypeConverter.static_type)));
}
/** Actual declared scalar Any. @param value - Native scalar. @param type - Declared type. @returns Owned Any. */
function scalar(value: number | boolean | bigint, type: UnoTypeArgument): Any {
  return own(new Any([value], type));
}
/** Actual string Any retaining counted Unicode. @param value - Original text. @returns Owned Any. */
function str(value: string): Any {
  return own(new Any(u(value).getDataAddress(), "OUString"));
}
/** Reads the actual inline scalar address. @param value - Returned Any. @returns Scalar. */
function value(value: Any): unknown {
  own(value);
  return (value.getValue() as [unknown])[0];
}
/** Checks and destroys the actual generated failure value. @param operation - Native invocation. @param reason - Original failure code. @param destination - Original class field. @returns Nothing. */
function failure(operation: () => Any, reason: number, destination: C): void {
  try {
    own(operation());
    expect.fail("Expected native CannotConvertException");
  } catch (error) {
    expect(error).toBeInstanceOf(CannotConvertException);
    const exception = error as CannotConvertException;
    try {
      expect(exception.Reason).toBe(reason);
      expect(exception.DestinationTypeClass).toBe(destination);
      expect(exception.ArgumentIndex).toBe(0);
      expect(exception.Context.is()).toBe(false);
    } finally {
      exception.dispose();
    }
  }
}
it("ports _XTypeConverter::_convertToSimpleType with its exact Integer123 to String assertion", /** Original qadevOOo method input, method call and expected string on the genuine native component. @returns Nothing. */ () => {
  const result = own(converter().convertToSimpleType(scalar(123, "sal_Int32"), C.STRING));
  const output = u("");
  expect(result.extract(output, "OUString")).toBe(true);
  expect(read(output.copy(0))).toBe("123");
});
it("exposes actual converter and service-info facets with original singleton service names", /** Real component identity and owned results. @returns Nothing. */ () => {
  const c = converter(),
    reference = own(new Reference(c)),
    info = own(new Reference<XServiceInfo>(reference, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(api(info).getImplementationName())).toBe("com.sun.star.comp.stoc.TypeConverter");
  expect(api(info).supportsService(u("com.sun.star.script.Converter"))).toBe(true);
  expect(api(info).supportsService(u("com.sun.star.script.converter"))).toBe(false);
  expect(own(api(info).getSupportedServiceNames()).getLength()).toBe(1);
});
it("preserves every integral destination, signed ranges and half-away-from-zero rounding", /** Original scalar conversion switches. @returns Nothing. */ () => {
  const c = converter();
  for (const [target, expected] of [
    [C.BYTE, 2],
    [C.SHORT, 2],
    [C.UNSIGNED_SHORT, 2],
    [C.LONG, 2],
    [C.UNSIGNED_LONG, 2],
    [C.HYPER, 2n],
    [C.UNSIGNED_HYPER, 2n],
  ] as const) {
    const result = own(c.convertToSimpleType(scalar(1.5, "double"), target));
    expect(result.getValueTypeClass()).toBe(target);
    expect(value(result)).toBe(expected);
  }
  expect(value(c.convertToSimpleType(scalar(-1.5, "double"), C.LONG))).toBe(-2);
  expect(value(c.convertToSimpleType(scalar(255, "sal_uInt16"), C.SHORT))).toBe(255);
  expect(value(c.convertToSimpleType(scalar(true, "bool"), C.HYPER))).toBe(1n);
  expect(value(c.convertToSimpleType(scalar(65, "sal_Unicode"), C.LONG))).toBe(65);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(scalar(128, "sal_Int32"), C.BYTE),
    FailReason.OUT_OF_RANGE,
    C.LONG,
  );
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(scalar(-1, "sal_Int32"), C.UNSIGNED_SHORT),
    FailReason.OUT_OF_RANGE,
    C.LONG,
  );
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(scalar(1n << 63n, "sal_uInt64"), C.HYPER),
    FailReason.OUT_OF_RANGE,
    C.UNSIGNED_HYPER,
  );
});
it("retains source decimal/hex prefix acceptance, zero rules, signed64 patterns and string range failures", /** Original helpers deliberately do not impose stricter lexical validation. @returns Nothing. */ () => {
  const c = converter();
  for (const [input, expected] of [
    ["", 0n],
    ["0", 0n],
    ["   ", 0n],
    ["+", 0n],
    ["-0.0", 0n],
    ["12tail", 12n],
    ["-2.5", -3n],
    ["0x2a", 42n],
    ["+0X2az", 42n],
    ["-0x2a", -42n],
    ["0xffffffffffffffff", -1n],
    ["0x", 0n],
  ] as const)
    expect(value(c.convertToSimpleType(str(input), C.HYPER))).toBe(expected);
  for (const input of ["hello", "0bad", "0xg", "x1", "00x1", "12suffix"])
    failure(
      /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
        c.convertToSimpleType(str(input), C.HYPER),
      FailReason.IS_NOT_NUMBER,
      C.STRING,
    );
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(str("32768"), C.SHORT),
    FailReason.OUT_OF_RANGE,
    C.STRING,
  );
  for (const [input, expected] of [
    ["0x2a", 42],
    ["-0x2a", -42],
    ["1.25suffix", 1.25],
    [".000", 0],
  ] as const)
    expect(value(c.convertToSimpleType(str(input), C.DOUBLE))).toBe(expected);
});
it("preserves boolean string rules, character exclusion, typed string and binary32 formatting", /** Case folding is ASCII-only, with no trimming added. @returns Nothing. */ () => {
  const c = converter();
  for (const [input, expected] of [
    ["TrUe", true],
    ["FALSE", false],
    ["1", true],
    ["0", false],
  ] as const)
    expect(value(c.convertToSimpleType(str(input), C.BOOLEAN))).toBe(expected);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(str(" true"), C.BOOLEAN),
    FailReason.IS_NOT_BOOL,
    C.BOOLEAN,
  );
  expect(value(c.convertToSimpleType(scalar(0, "sal_Int32"), C.BOOLEAN))).toBe(false);
  expect(value(c.convertToSimpleType(str("Ω"), C.CHAR))).toBe(937);
  expect(value(c.convertToSimpleType(scalar(65, "sal_Int32"), C.CHAR))).toBe(65);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(str("AB"), C.CHAR),
    FailReason.INVALID,
    C.CHAR,
  );
  expect(value(c.convertToSimpleType(scalar(1.1, "double"), C.FLOAT))).toBe(Math.fround(1.1));
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(scalar(Infinity, "double"), C.FLOAT),
    FailReason.OUT_OF_RANGE,
    C.DOUBLE,
  );
  for (const [input, expected] of [
    [scalar(true, "bool"), "true"],
    [scalar(65, "sal_Unicode"), "A"],
    [scalar(4294967295, "sal_uInt32"), "4294967295"],
    [scalar(-42n, "sal_Int64"), "-42"],
    [scalar(1.25, "double"), "1.25"],
  ] as const) {
    const result = own(c.convertToSimpleType(input, C.STRING)),
      output = u("");
    expect(result.extract(output, "OUString")).toBe(true);
    expect(read(output.copy(0))).toBe(expected);
  }
});
it("copies identical/ANY values, preserves VOID and rejects nonsimple requested classes", /** Original early returns and exact IllegalArgumentException contract. @returns Nothing. */ () => {
  const c = converter(),
    source = str("A\0尾");
  for (const target of [C.STRING, C.ANY])
    expect(own(c.convertToSimpleType(source, target)).operatorEquals(source)).toBe(true);
  expect(own(c.convertToSimpleType(source, C.VOID)).hasValue()).toBe(false);
  expect(own(c.convertTo(source, UnoType.get("Any"))).operatorEquals(source)).toBe(true);
  expect(own(c.convertTo(source, UnoType.get("void"))).hasValue()).toBe(false);
  expect(value(c.convertTo(scalar(1.5, "double"), UnoType.get("sal_Int32")))).toBe(2);
  try {
    c.convertToSimpleType(source, C.STRUCT);
    expect.fail("Expected IllegalArgumentException");
  } catch (error) {
    expect(error).toBeInstanceOf(IllegalArgumentException);
    const e = error as IllegalArgumentException;
    try {
      expect(e.ArgumentPosition).toBe(1);
    } finally {
      e.dispose();
    }
  }
});
it("queries real facets, preserves void-to-typed-null and rejects absent or null interfaces", /** Uses genuine converter facets without an interface provider substitute. @returns Nothing. */ () => {
  const c = converter(),
    reference = own(new Reference(c)),
    source = own(new Any(reference.getAddress(), XTypeConverter.static_type));
  const result = own(c.convertTo(source, XServiceInfo.static_type())),
    info = own(new Reference<XServiceInfo>());
  expect(result.extract(info.getAddress(), XServiceInfo.static_type)).toBe(true);
  expect(read(api(info).getImplementationName())).toBe("com.sun.star.comp.stoc.TypeConverter");
  expect(value(c.convertTo(own(new Any()), XServiceInfo.static_type()))).toBe(null);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertTo(scalar(2, "sal_Int32"), XServiceInfo.static_type()),
    FailReason.NO_SUCH_INTERFACE,
    C.INTERFACE,
  );
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertTo(source, XPropertySet.static_type()),
    FailReason.NO_SUCH_INTERFACE,
    C.INTERFACE,
  );
  const nullRef = own(new Reference()),
    nullAny = own(new Any(nullRef.getAddress(), XTypeConverter.static_type));
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertTo(nullAny, XServiceInfo.static_type()),
    FailReason.NO_SUCH_INTERFACE,
    C.INTERFACE,
  );
});
it("converts actual sequences recursively in reverse order, including Any elements", /** Real source sequence records and real C engine assignment. @returns Nothing. */ () => {
  const c = converter(),
    input = own(new (Sequence.specialize<number>("sal_Int32", 4))(3));
  for (let i = 0; i < 3; ++i)
    ((input.getArray() as SequenceElements).get(i * 4) as [number])[0] = (i + 1) * 10;
  const source = own(new Any(input.getAddress(), ["Sequence", "sal_Int32"]));
  const result = own(c.convertTo(source, UnoType.get(["Sequence", "double"]))),
    output = own(new (Sequence.specialize<number>("double", 8))());
  expect(result.extract(output.getAddress(), ["Sequence", "double"])).toBe(true);
  expect(
    [0, 1, 2].map(
      /** Reads a genuine sequence scalar field. @param i - Element index. @returns Scalar. */ (
        i,
      ) => ((output.getConstArray() as SequenceElements).get(i * 8) as [number])[0],
    ),
  ).toEqual([10, 20, 30]);
  const boxed = own(c.convertTo(source, UnoType.get(["Sequence", "Any"]))),
    anys = own(new (Sequence.specialize<Any>("Any", 24))());
  expect(boxed.extract(anys.getAddress(), ["Sequence", "Any"])).toBe(true);
  expect((anys.operatorIndex(2).pData as [number])[0]).toBe(30);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertTo(str("bad"), UnoType.get(["Sequence", "double"])),
    FailReason.INVALID,
    C.SEQUENCE,
  );
});

it("retains native enum exclusions and numeric access without supplying a missing enum-name provider", /** Actual declared enum values; full named enum conversion awaits the genuine type manager. @returns Nothing. */ () => {
  const c = converter(),
    input = own(new Any([C.BYTE], enumType));
  expect(value(c.convertToSimpleType(input, C.LONG))).toBe(C.BYTE);
  expect(value(c.convertToSimpleType(input, C.DOUBLE))).toBe(C.BYTE);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(input, C.BOOLEAN),
    FailReason.INVALID,
    C.BOOLEAN,
  );
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertToSimpleType(input, C.CHAR),
    FailReason.INVALID,
    C.CHAR,
  );
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertTo(scalar(true, "bool"), enumType()),
    FailReason.IS_NOT_ENUM,
    C.ENUM,
  );
});
it("upcasts actual generated exception data and rejects an unrelated scalar", /** Real base/derived typelib descriptions and owned exception fields. @returns Nothing. */ () => {
  const c = converter(),
    context = own(new Reference()),
    exception = own(new CannotConvertException(u("A\0尾"), context, C.STRING, 3, 1));
  const source = own(new Any(exception, argumentType)),
    result = own(c.convertTo(source, getTypeFromTypeClass(TC.EXCEPTION)));
  expect(result.getValueType().equals(getTypeFromTypeClass(TC.EXCEPTION))).toBe(true);
  failure(
    /** Invokes the actual converter for the expected source failure. @returns Owned Any or the original exception. */ () =>
      c.convertTo(scalar(1, "sal_Int32"), argumentType()),
    FailReason.SOURCE_IS_NO_DERIVED_TYPE,
    C.EXCEPTION,
  );
});
it("retains full UTF16 error messages including surrogate pairs", /** Runtime message concatenation preserves source code units. @returns Nothing. */ () => {
  try {
    converter().convertToSimpleType(str("😀"), C.BOOLEAN);
    expect.fail("Expected conversion failure");
  } catch (error) {
    expect(error).toBeInstanceOf(CannotConvertException);
    const e = error as CannotConvertException;
    try {
      expect(read(e.Message.copy(0))).toBe("STRING has no boolean value, 😀");
    } finally {
      e.dispose();
    }
  }
});
