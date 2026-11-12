/** @fileoverview Populated actual PropertyValueSet relation ports the original qadevOOo _XRow scalar/bytes/date/time/timestamp/object and _XColumnLocate method bodies; no absent-relation success is counted. */
import { afterEach, expect, it } from "vitest";
import { PropertyValueSet } from "../../inc/propertyvalueset";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { UnoType, type UnoTypeArgument } from "../../../cppu/inc/unotype";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  Date,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  Time,
  cppu_detail_getUnoType_Time as timeType,
} from "../../../offapi/com/sun/star/util/Time";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it.each(["String", "Boolean", "Long", "Timestamp", "Object"] as const)(
  "ports original _XRow::_get%s with a populated CurrentRowData relation",
  /** Source no-exception criterion runs the actual method, with no skipped/missing type relation. @param method - Original method suffix. @returns Nothing. */ (
    method,
  ) => {
    const value = own(new Reference(new PropertyValueSet(own(new Reference())))),
      text = u("source"),
      timestamp = new DateTime(),
      object = own(new Any(true));
    timestamp.Year = 2026;
    timestamp.Month = 11;
    timestamp.Day = 12;
    const data = [text, true, 42n, timestamp, [object]];
    api(value).appendString(u("string"), text);
    api(value).appendBoolean(u("boolean"), true);
    api(value).appendLong(u("long"), 42n);
    api(value).appendTimestamp(u("timestamp"), timestamp);
    api(value).appendObject(u("object"), object);
    const column =
      data.findIndex(
        /** Original Java class-isInstance relation selector, lowered to its actual native carriers. @param input - Actual CurrentRowData element. @returns Original class match. */ (
          input,
        ) =>
          method === "String"
            ? input instanceof OUString
            : method === "Boolean"
              ? typeof input === "boolean"
              : method === "Long"
                ? typeof input === "bigint"
                : method === "Timestamp"
                  ? input instanceof DateTime
                  : Array.isArray(input),
      ) + 1;
    expect(column).toBeGreaterThan(0);
    // Source SQLException failures and any other unexpected harness exception both fail this native test; owned return temporaries retain their real destructors.
    if (method === "String") read(api(value).getString(column));
    else if (method === "Boolean") api(value).getBoolean(column);
    else if (method === "Long") api(value).getLong(column);
    else if (method === "Timestamp") api(value).getTimestamp(column);
    else own(api(value).getObject(column, own(new Reference())));
  },
);
it("ports original _XColumnLocate::_findColumn", /** The original required first-column-name relation is present. @returns Nothing. */ () => {
  const value = own(new Reference(new PropertyValueSet(own(new Reference())))),
    columnName = u("first");
  api(value).appendString(columnName, u("value"));
  expect(api(value).findColumn(columnName)).toBe(1);
});

it.each(["Byte", "Short", "Int", "Float", "Double", "Bytes", "Date", "Time"] as const)(
  "ports original _XRow::_get%s with a real typed CurrentRowData carrier",
  /** Original Java class selector is lowered to the exact native Any type, then calls the original getter with its no-exception criterion. @param method - Original method suffix. @returns Nothing. */ (
    method,
  ) => {
    const value = own(new Reference(new PropertyValueSet(own(new Reference()))));
    let type: UnoTypeArgument;
    let carrier: Any;
    switch (method) {
      case "Byte":
        type = "sal_Int8";
        carrier = own(new Any([7], type));
        break;
      case "Short":
        type = "sal_Int16";
        carrier = own(new Any([12], type));
        break;
      case "Int":
        type = "sal_Int32";
        carrier = own(new Any([42], type));
        break;
      case "Float":
        type = "float";
        carrier = own(new Any([1.25], type));
        break;
      case "Double":
        type = "double";
        carrier = own(new Any([2.5], type));
        break;
      case "Bytes": {
        type = ["Sequence", "sal_Int8"];
        const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))(2));
        carrier = own(new Any(bytes.getAddress(), type));
        break;
      }
      case "Date":
        type = dateType;
        carrier = own(new Any(new Date(12, 11, 2026), type));
        break;
      case "Time":
        type = timeType;
        carrier = own(new Any(new Time(), type));
        break;
    }
    const data = [carrier],
      column =
        data.findIndex(
          /** Original type relation selector over actual native typed carriers. @param item - Original row value. @returns Native class match. */ (
            item,
          ) => item.getValueType().equals(UnoType.get(type)),
        ) + 1;
    expect(column).toBeGreaterThan(0);
    api(value).appendObject(u(method), carrier);
    switch (method) {
      case "Byte":
        api(value).getByte(column);
        break;
      case "Short":
        api(value).getShort(column);
        break;
      case "Int":
        api(value).getInt(column);
        break;
      case "Float":
        api(value).getFloat(column);
        break;
      case "Double":
        api(value).getDouble(column);
        break;
      case "Bytes":
        own(api(value).getBytes(column));
        break;
      case "Date":
        api(value).getDate(column);
        break;
      case "Time":
        api(value).getTime(column);
        break;
    }
  },
);
