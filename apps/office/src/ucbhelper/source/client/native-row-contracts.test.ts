/** @fileoverview Complete XRow dependency declarations use normal CPPU metadata and typed-null transport; no positive row/database/result-set provider is manufactured. */
import { expect, expectTypeOf, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../../cppu/inc/unotype";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { typelib_InterfaceTypeDescription as I } from "../../../cppu/inc/typelib/typedescription";
import * as Row from "../../../offapi/com/sun/star/sdbc/XRow";
import * as Array from "../../../offapi/com/sun/star/sdbc/XArray";
import * as Ref from "../../../offapi/com/sun/star/sdbc/XRef";
import * as Blob from "../../../offapi/com/sun/star/sdbc/XBlob";
import * as Clob from "../../../offapi/com/sun/star/sdbc/XClob";
import * as ResultSet from "../../../offapi/com/sun/star/sdbc/XResultSet";
it.each([
  [Row, Row.XRow],
  [Array, Array.XArray],
  [Ref, Ref.XRef],
  [Blob, Blob.XBlob],
  [Clob, Clob.XClob],
  [ResultSet, ResultSet.XResultSet],
] as const)(
  "retains original direct root and real typed-null transport %#",
  /** All type descriptions come from shared CPPU factories. @param binding - Actual SDK module. @param api - Actual static API. @returns Nothing. */ (
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
    const value = new Any([null], ["Reference", binding.cppu_detail_getUnoType]),
      copy = new Any(value),
      output: [XInterface | null] = [null];
    try {
      expect(copy.extract(output, ["Reference", binding.cppu_detail_getUnoType])).toBe(true);
      expect(output[0]).toBe(null);
    } finally {
      copy.dispose();
      value.dispose();
    }
  },
);

it("retains original hyper versus long method signatures", /** Original XClob.position start remains signed32 while the blob and clob-pattern operations use signed64. @returns Nothing. */ () => {
  expectTypeOf<ReturnType<Row.XRow["getLong"]>>().toEqualTypeOf<bigint>();
  expectTypeOf<Parameters<Blob.XBlob["position"]>[1]>().toEqualTypeOf<bigint>();
  expectTypeOf<Parameters<Clob.XClob["position"]>[1]>().toEqualTypeOf<number>();
  expectTypeOf<Parameters<Clob.XClob["positionOfClob"]>[1]>().toEqualTypeOf<bigint>();
});
