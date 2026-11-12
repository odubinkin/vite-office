/** @fileoverview Actual complete SDK metadata and CannotConvertException/TypeClass value transport used by PropertyValueSet; no type converter implementation is injected. */
import { afterEach, expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { UnoType } from "../../../cppu/inc/unotype";
import type { typelib_InterfaceTypeDescription as I } from "../../../cppu/inc/typelib/typedescription";
import * as Converter from "../../../udkapi/com/sun/star/script/XTypeConverter";
import * as Access from "../../../udkapi/com/sun/star/beans/XPropertyAccess";
import * as Locate from "../../../offapi/com/sun/star/sdbc/XColumnLocate";
import * as Cannot from "../../../udkapi/com/sun/star/script/CannotConvertException";
import { FailReason } from "../../../udkapi/com/sun/star/script/FailReason";
import {
  TypeClass as TC,
  cppu_detail_getUnoType_TypeClass as classType,
} from "../../../udkapi/com/sun/star/uno/TypeClass";
import { own, u, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it.each([
  [Converter, Converter.XTypeConverter],
  [Access, Access.XPropertyAccess],
  [Locate, Locate.XColumnLocate],
] as const)(
  "retains complete source root/cache and typed-null SDK transport %#",
  /** All normal metadata comes from actual shared CPPU factories. @param binding - Original module. @param api - Original static API. @returns Nothing. */ (
    binding,
    api,
  ) => {
    const type = binding.cppu_detail_getUnoType(),
      description = type.getTypeLibType()?.pType as unknown as I;
    expect(binding.getCppuType()).toBe(type);
    expect(binding.getCppuType(null)).toBe(type);
    expect(api.static_type()).toBe(type);
    expect(api.static_type(null)).toBe(type);
    expect(description.nBaseTypes).toBe(1);
    expect(description.pBaseTypeDescription?.aBase.pWeakRef).toBe(
      UnoType.get("XInterface").getTypeLibType(),
    );
    const value = own(new Any([null], ["Reference", binding.cppu_detail_getUnoType])),
      copy = own(new Any(value)),
      output: [unknown] = [null];
    expect(copy.extract(output, ["Reference", binding.cppu_detail_getUnoType])).toBe(true);
    expect(output[0]).toBe(null);
  },
);
it("retains all failure constants and complete exception defaults/copy/move/metadata", /** Exception fields use their actual base and declared addresses. @returns Nothing. */ () => {
  expect(Object.values(FailReason)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const empty = own(new Cannot.CannotConvertException()),
    source = own(
      new Cannot.CannotConvertException(
        u("conversion Ω"),
        own(new Reference()),
        TC.LONG,
        FailReason.IS_NOT_NUMBER,
        2,
      ),
    ),
    copy = own(new Cannot.CannotConvertException(source)),
    envelope = own(new Any(source, Cannot.cppu_detail_getUnoType));
  expect([empty.DestinationTypeClass, empty.Reason, empty.ArgumentIndex]).toEqual([TC.VOID, 0, 0]);
  expect(envelope.extract(empty, Cannot.cppu_detail_getUnoType)).toBe(true);
  expect(empty.Message.equals(u("conversion Ω"))).toBe(true);
  expect([empty.DestinationTypeClass, empty.Reason, empty.ArgumentIndex]).toEqual([
    TC.LONG,
    FailReason.IS_NOT_NUMBER,
    2,
  ]);
  const moved = own(Cannot.CannotConvertException.move(copy));
  expect(copy.Message.isEmpty()).toBe(true);
  empty.assign(source).moveAssign(moved);
  expect(empty.Reason).toBe(FailReason.IS_NOT_NUMBER);
  expect(Cannot.getCppuType()).toBe(Cannot.cppu_detail_getUnoType());
  const enumValue = own(new Any([TC.STRING], classType)),
    output: [number] = [0];
  expect(enumValue.extract(output, classType)).toBe(true);
  expect(output[0]).toBe(TC.STRING);
  expect(classType()).toBe(classType());
});
