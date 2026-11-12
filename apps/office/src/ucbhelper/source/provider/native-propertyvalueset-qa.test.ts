/** @fileoverview Populated actual PropertyValueSet relation ports the original qadevOOo _XRow string/boolean/long/timestamp/object and _XColumnLocate method bodies; no absent-relation success is counted. */
import { afterEach, expect, it } from "vitest";
import { PropertyValueSet } from "../../inc/propertyvalueset";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
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
