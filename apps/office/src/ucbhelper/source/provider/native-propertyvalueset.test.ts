/** @fileoverview Actual original PropertyValueSet rows, all declared getters, cache/default semantics, stream/context ownership and genuine property-set/service-manager call paths. */
import { afterEach, expect, it } from "vitest";
import { PropertyValueSet } from "../../inc/propertyvalueset";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XRow } from "../../../offapi/com/sun/star/sdbc/XRow";
import { XColumnLocate } from "../../../offapi/com/sun/star/sdbc/XColumnLocate";
import { XRef } from "../../../offapi/com/sun/star/sdbc/XRef";
import { XBlob } from "../../../offapi/com/sun/star/sdbc/XBlob";
import { XClob } from "../../../offapi/com/sun/star/sdbc/XClob";
import { XArray } from "../../../offapi/com/sun/star/sdbc/XArray";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import {
  Date,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  Time,
  cppu_detail_getUnoType_Time as timeType,
} from "../../../offapi/com/sun/star/util/Time";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as timestampType,
} from "../../../offapi/com/sun/star/util/DateTime";
import { Property } from "../../../udkapi/com/sun/star/beans/Property";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { ServiceManager } from "../../../cppuhelper/source/servicemanager";
import { ComponentContext } from "../../../cppuhelper/source/component_context";
import { ContextEntry_Init } from "../../../cppuhelper/inc/component_context";
import { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XMultiComponentFactory } from "../../../udkapi/com/sun/star/lang/XMultiComponentFactory";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Actual source component with its permitted empty context; no conversion service is requested by direct/native reads. @returns Owned row. */
function row(): Reference<PropertyValueSet> {
  return own(new Reference(new PropertyValueSet(own(new Reference<XComponentContext>()))));
}
it("retains actual row/column facets, constructor flag, native appends, name order and duplicate lookup", /** Every value is held by the real source component. @returns Nothing. */ () => {
  const value = row(),
    facet = own(new Reference<XRow>(value, UNO_QUERY_THROW, XRow.static_type)),
    locate = own(new Reference<XColumnLocate>(value, UNO_QUERY_THROW, XColumnLocate.static_type)),
    descriptor = own(new Property());
  expect(api(facet).wasNull()).toBe(false);
  descriptor.Name = u("flag");
  api(value).appendBoolean(descriptor, true);
  api(value).appendString(u("title Ω"), u("A\0尾"));
  api(value).appendLong(u("count"), -42n);
  api(value).appendString(u("title Ω"), u("later"));
  expect(api(locate).findColumn(u("title Ω"))).toBe(2);
  expect(api(locate).findColumn(u("TITLE Ω"))).toBe(0);
  expect(api(locate).findColumn(u(""))).toBe(0);
  expect(api(facet).getBoolean(1)).toBe(true);
  expect(api(facet).wasNull()).toBe(false);
  expect(read(api(facet).getString(2))).toBe("A\0尾");
  expect(api(facet).getLong(3)).toBe(-42n);
  const object = own(api(facet).getObject(1, own(new Reference()))),
    output: [boolean] = [false];
  expect(object.extract(output, "bool")).toBe(true);
  expect(output[0]).toBe(true);
  expect(read(api(facet).getString(2))).toBe("A\0尾");
});
it("preserves all null-column getter defaults without inventing conversion or SDBC providers", /** appendVoid supplies a real existing null column for every getter. @returns Nothing. */ () => {
  const value = row();
  api(value).appendVoid(u("empty"));
  expect(read(api(value).getString(1))).toBe("");
  expect(api(value).getBoolean(1)).toBe(false);
  expect([
    api(value).getByte(1),
    api(value).getShort(1),
    api(value).getInt(1),
    api(value).getFloat(1),
    api(value).getDouble(1),
  ]).toEqual([0, 0, 0, 0, 0]);
  expect(api(value).getLong(1)).toBe(0n);
  expect(own(api(value).getBytes(1)).getLength()).toBe(0);
  expect(api(value).getDate(1).equals(new Date())).toBe(true);
  expect(api(value).getTime(1).equals(new Time())).toBe(true);
  expect(api(value).getTimestamp(1).equals(new DateTime())).toBe(true);
  for (const input of [
    api(value).getBinaryStream(1),
    api(value).getCharacterStream(1),
    api(value).getRef(1),
    api(value).getBlob(1),
    api(value).getClob(1),
    api(value).getArray(1),
  ])
    expect(own(input).is()).toBe(false);
  expect(own(api(value).getObject(1, own(new Reference()))).hasValue()).toBe(false);
  expect(api(value).wasNull()).toBe(true);
});
it("extracts actual Any scalar/date values and reuses the original native cache", /** Exact declared native types avoid a substitute converter. @returns Nothing. */ () => {
  const value = row();
  for (const [name, payload] of [
    ["byte", own(new Any([7], "sal_Int8"))],
    ["short", own(new Any([12], "sal_Int16"))],
    ["int", own(new Any([23], "sal_Int32"))],
    ["float", own(new Any([1.25], "float"))],
    ["double", own(new Any([2.5], "double"))],
  ] as const)
    api(value).appendObject(u(name), payload);
  expect(api(value).getByte(1)).toBe(7);
  expect(api(value).getShort(2)).toBe(12);
  expect(api(value).getInt(3)).toBe(23);
  expect(api(value).getInt(3)).toBe(23);
  expect(api(value).getFloat(4)).toBe(1.25);
  expect(api(value).getDouble(5)).toBe(2.5);
  const date = new Date(31, 12, 2026),
    time = new Time(123, 59, 58, 12, true),
    timestamp = new DateTime();
  timestamp.Year = 2026;
  timestamp.Month = 12;
  timestamp.Day = 31;
  api(value).appendObject(u("date"), own(new Any(date, dateType)));
  api(value).appendObject(u("time"), own(new Any(time, timeType)));
  api(value).appendTimestamp(u("stamp"), timestamp);
  expect(api(value).getDate(6).equals(date)).toBe(true);
  expect(api(value).getTime(7).equals(time)).toBe(true);
  expect(api(value).getTimestamp(8).equals(timestamp)).toBe(true);
  const copy = api(value).getTimestamp(8);
  copy.Year = 2000;
  expect(api(value).getTimestamp(8).Year).toBe(2026);
});
it("retains actual stream references, independently acquired getters and typed-null SDBC values", /** Typed-null references are native defaults, not fake positive Ref/Blob/Clob/Array implementations. @returns Nothing. */ () => {
  const value = row(),
    bytes = new Uint8Array([1, 2, 3]),
    input = own(new Reference<XInputStream>(new MemoryInputStream(bytes, bytes.length))),
    payload = own(new Any(input.getAddress(), XInputStream.static_type));
  api(value).appendObject(u("stream"), payload);
  expect(own(api(value).getBinaryStream(1)).operatorEquals(input)).toBe(true);
  expect(own(api(value).getCharacterStream(1)).operatorEquals(input)).toBe(true);
  const interfaces = [XRef, XBlob, XClob, XArray] as const;
  for (const [n, decl] of interfaces.entries())
    api(value).appendObject(u("null" + n), own(new Any([null], decl.static_type)));
  for (const result of [
    api(value).getRef(2),
    api(value).getBlob(3),
    api(value).getClob(4),
    api(value).getArray(5),
  ]) {
    expect(own(result).is()).toBe(false);
    expect(api(value).wasNull()).toBe(false);
  }
  const held = own(api(value).getBinaryStream(1));
  payload.clear();
  expect(api(held).available()).toBe(3);
});
it("preserves the source void-Any versus appendVoid wasNull distinction", /** Both are ordinary public append paths on the actual component. @returns Nothing. */ () => {
  const value = row();
  api(value).appendObject(u("object"), own(new Any()));
  api(value).appendVoid(u("void"));
  expect(own(api(value).getObject(1, own(new Reference()))).hasValue()).toBe(false);
  expect(api(value).wasNull()).toBe(false);
  expect(read(api(value).getString(1))).toBe("");
  expect(api(value).wasNull()).toBe(true);
  expect(own(api(value).getObject(2, own(new Reference()))).hasValue()).toBe(false);
  expect(api(value).wasNull()).toBe(true);
});
it("reads a real ServiceManager property set and retains original missing-property results", /** The property provider and its metadata are genuine existing components. @returns Nothing. */ () => {
  const context = own(
      new Reference<XComponentContext>(
        new ComponentContext([], 0, own(new Reference<XComponentContext>())),
      ),
    ),
    manager = own(new Reference(new ServiceManager([]))),
    properties = own(
      new Reference<XPropertySet>(manager, UNO_QUERY_THROW, XPropertySet.static_type),
    ),
    value = row();
  api(manager).setContext(context);
  api(value).appendPropertySet(properties);
  expect(api(value).findColumn(u("DefaultContext"))).toBe(1);
  const output = own(new Reference<XComponentContext>()),
    object = own(api(value).getObject(1, own(new Reference())));
  expect(object.extract(output.getAddress(), XComponentContext.static_type)).toBe(true);
  expect(output.operatorEquals(context)).toBe(true);
  const descriptor = own(new Property());
  descriptor.Name = u("DefaultContext");
  expect(api(value).appendPropertySetValue(properties, descriptor)).toBe(true);
  descriptor.Name = u("unknown");
  expect(api(value).appendPropertySetValue(properties, descriptor)).toBe(false);
  api(value).appendPropertySet(own(new Reference<XPropertySet>()));
  expect(api(value).appendPropertySetValue(own(new Reference<XPropertySet>()), descriptor)).toBe(
    false,
  );
});
it("keeps the original converter-attempt flag after real unavailable-service construction", /** A genuine context with an empty real registry supplies the failure; no injected converter is used. @returns Nothing. */ () => {
  const manager = own(new Reference(new ServiceManager([]))),
    entry = own(
      new ContextEntry_Init(
        u("/singletons/com.sun.star.lang.theServiceManager"),
        own(new Any(manager.getAddress(), XMultiComponentFactory.static_type)),
      ),
    ),
    context = own(
      new Reference<XComponentContext>(
        new ComponentContext([entry], 1, own(new Reference<XComponentContext>())),
      ),
    ),
    value = own(new Reference(new PropertyValueSet(context)));
  api(value).appendString(u("text"), u("not an integer"));
  try {
    api(value).getInt(1);
    expect.unreachable();
  } catch (error) {
    expect(error).toBeInstanceOf(DeploymentException);
    (error as DeploymentException).dispose();
  }
  expect(api(value).getInt(1)).toBe(0);
  expect(api(value).wasNull()).toBe(true);
});

it("serializes genuine native long/timestamp appends and retains byte sequence copies", /** Uses real input and output owners for the original getObject/native-cache paths. @returns Nothing. */ () => {
  const value = row(),
    timestamp = new DateTime();
  timestamp.Year = 2026;
  timestamp.Month = 11;
  timestamp.Day = 12;
  api(value).appendLong(u("long"), 42n);
  api(value).appendTimestamp(u("stamp"), timestamp);
  const number = own(api(value).getObject(1, own(new Reference()))),
    out: [bigint] = [0n],
    object = own(api(value).getObject(2, own(new Reference()))),
    date = new DateTime();
  expect(number.extract(out, "sal_Int64")).toBe(true);
  expect(out[0]).toBe(42n);
  expect(object.extract(date, timestampType)).toBe(true);
  expect(date.equals(timestamp)).toBe(true);
  const input = own(
      new (Sequence.specialize<number>("sal_Int8", 1))(
        new Map([
          [0, [1]],
          [1, [2]],
        ]),
        2,
      ),
    ),
    payload = own(new Any(input.getAddress(), ["Sequence", "sal_Int8"]));
  api(value).appendObject(u("bytes"), payload);
  const result = own(api(value).getBytes(3));
  expect(result.getLength()).toBe(2);
  expect(own(api(value).getBytes(3)).operatorEquals(result)).toBe(true);
  payload.clear();
  expect(result.getLength()).toBe(2);
});
