/** @fileoverview Registered stoc converter and genuine PropertyValueSet service graph through the application's production component registry. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { implementations } from "./uno-components";
import { InitApplicationServiceManager } from "../../source/app/appinit";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Converter } from "../../../udkapi/com/sun/star/script/Converter";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../../cppu/inc/unotype";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XTypeConverter } from "../../../udkapi/com/sun/star/script/XTypeConverter";
import { XRow } from "../../../offapi/com/sun/star/sdbc/XRow";
import { XColumnLocate } from "../../../offapi/com/sun/star/sdbc/XColumnLocate";
import { PropertyValueSet } from "../../../ucbhelper/inc/propertyvalueset";
import { CannotConvertException } from "../../../udkapi/com/sun/star/script/CannotConvertException";
import { FailReason } from "../../../udkapi/com/sun/star/script/FailReason";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";

beforeAll(
  /** Publishes the real application factory without replacing services or constructors. @returns Nothing. */ () =>
    InitApplicationServiceManager(implementations),
);
afterEach(releaseDomScope);
/** Borrows the actual process context through the original const-reference API. @returns Actual context owner view. */
function context(): Reference<XComponentContext> {
  return getProcessComponentContext() as Reference<XComponentContext>;
}
/** Constructs the actual source component with the production context. @returns Owned row component. */
function row(): Reference<PropertyValueSet> {
  return own(new Reference(new PropertyValueSet(context())));
}

it("constructs the production converter by service helper, implementation name and argument route", /** Genuine manager dispatch invokes the actual stoc constructor in every case. @returns Nothing. */ () => {
  const helper = own(Converter.create(context())),
    manager = own(context().operatorStar().getServiceManager()),
    args = own(new (Sequence.specialize<Any>("Any", 24))());
  const direct = own(
    api(manager).createInstanceWithContext(u("com.sun.star.comp.stoc.TypeConverter"), context()),
  );
  const withArgs = own(
    api(manager).createInstanceWithArgumentsAndContext(
      u("com.sun.star.script.Converter"),
      args,
      context(),
    ),
  );
  for (const instance of [helper, direct, withArgs]) {
    const converter = own(
        new Reference<XTypeConverter>(instance, UNO_QUERY_THROW, XTypeConverter.static_type),
      ),
      info = own(new Reference<XServiceInfo>(instance, UNO_QUERY_THROW, XServiceInfo.static_type));
    expect(read(api(info).getImplementationName())).toBe("com.sun.star.comp.stoc.TypeConverter");
    const source = own(new Any(u("42").getDataAddress(), "OUString")),
      result = own(api(converter).convertTo(source, UnoType.get("sal_Int32"))),
      output: [number] = [0];
    expect(result.extract(output, "sal_Int32")).toBe(true);
    expect(output[0]).toBe(42);
  }
  expect(helper.get()).not.toBe(direct.get());
});
it("converts actual row strings into every numeric getter and caches original typed results", /** All getters use the real context/manager/converter path after direct extraction fails. @returns Nothing. */ () => {
  const component = row(),
    values = own(new Reference<XRow>(component, UNO_QUERY_THROW, XRow.static_type));
  api(component).appendString(u("integer"), u("42"));
  expect(api(values).getByte(1)).toBe(42);
  expect(api(values).wasNull()).toBe(false);
  expect(api(values).getShort(1)).toBe(42);
  expect(api(values).getInt(1)).toBe(42);
  expect(api(values).getLong(1)).toBe(42n);
  expect(api(values).getFloat(1)).toBe(42);
  expect(api(values).getDouble(1)).toBe(42);
  expect(api(values).getInt(1)).toBe(42);
  expect(api(values).wasNull()).toBe(false);
  expect(read(api(values).getString(1))).toBe("42");
  const original = own(api(values).getObject(1, own(new Reference()))),
    output = u("");
  expect(original.extract(output, "OUString")).toBe(true);
  expect(read(output.copy(0))).toBe("42");
});
it("retains numeric-to-string and source long identity after cached cross-type reads", /** A real originally typed long takes getObjectImpl and then the registered converter. @returns Nothing. */ () => {
  const component = row(),
    values = own(new Reference<XRow>(component, UNO_QUERY_THROW, XRow.static_type));
  api(component).appendLong(u("n"), -42n);
  expect(read(api(values).getString(1))).toBe("-42");
  expect(api(values).wasNull()).toBe(false);
  expect(api(values).getLong(1)).toBe(-42n);
  const original = own(api(values).getObject(1, own(new Reference()))),
    output: [bigint] = [0n];
  expect(original.extract(output, "sal_Int64")).toBe(true);
  expect(output[0]).toBe(-42n);
});
it("suppresses original conversion failures and preserves first-read Any cache effects on wasNull", /** Actual converter failures, no injected callback or private cache mutation. @returns Nothing. */ () => {
  const component = row(),
    values = own(new Reference<XRow>(component, UNO_QUERY_THROW, XRow.static_type));
  api(component).appendString(u("bad"), u("not-a-number"));
  api(component).appendString(u("overflow"), u("128"));
  api(component).appendString(u("good"), u("123"));
  expect(api(values).getInt(1)).toBe(0);
  expect(api(values).wasNull()).toBe(false);
  expect(api(values).getByte(2)).toBe(0);
  expect(api(values).wasNull()).toBe(false);
  expect(api(values).getInt(2)).toBe(128);
  expect(api(values).wasNull()).toBe(false);
  expect(api(values).getInt(3)).toBe(123);
  expect(api(values).wasNull()).toBe(false);
  expect(api(values).getInt(1)).toBe(0);
  expect(api(values).wasNull()).toBe(true);
  expect(read(api(values).getString(1))).toBe("not-a-number");
  expect(api(values).wasNull()).toBe(false);
});
it("converts booleans through the registered service and keeps exact names and empty-object behavior", /** Complete source row facets retain their shared component identity. @returns Nothing. */ () => {
  const component = row(),
    locate = own(
      new Reference<XColumnLocate>(component, UNO_QUERY_THROW, XColumnLocate.static_type),
    );
  api(component).appendString(u("flag"), u("TrUe"));
  api(component).appendString(u("number"), u("1"));
  api(component).appendObject(u("void"), own(new Any()));
  api(component).appendVoid(u("null"));
  expect(api(component).getBoolean(1)).toBe(true);
  expect(api(component).wasNull()).toBe(false);
  expect(api(component).getBoolean(2)).toBe(true);
  expect(api(locate).findColumn(u("flag"))).toBe(1);
  expect(api(locate).findColumn(u("FLAG"))).toBe(0);
  expect(own(api(component).getObject(3, own(new Reference()))).hasValue()).toBe(false);
  expect(api(component).wasNull()).toBe(false);
  expect(api(component).getInt(3)).toBe(0);
  expect(api(component).wasNull()).toBe(true);
  expect(own(api(component).getObject(4, own(new Reference()))).hasValue()).toBe(false);
  expect(api(component).wasNull()).toBe(true);
});
it("propagates the actual service failure value when called directly", /** The row suppresses this generated exception; the service itself keeps the original typed failure. @returns Nothing. */ () => {
  const converter = own(Converter.create(context())),
    source = own(new Any(u("128").getDataAddress(), "OUString"));
  try {
    own(api(converter).convertTo(source, UnoType.get("sal_Int8")));
    expect.fail("Expected conversion failure");
  } catch (error) {
    expect(error).toBeInstanceOf(CannotConvertException);
    const failure = error as CannotConvertException;
    try {
      expect(failure.Reason).toBe(FailReason.OUT_OF_RANGE);
      expect(failure.DestinationTypeClass).toBe(TypeClass.STRING);
    } finally {
      failure.dispose();
    }
  }
});
