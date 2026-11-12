/** @fileoverview Original metadata property/scalar conversion over the real registered PropertyBag and actual generated temporal/UNO values. No metadata service/model substitute is registered. */
import { afterEach, beforeAll, expect, it } from "vitest";
import {
  propsToStrings,
  disposeAttrVector,
  dateToText,
  dateTimeToText,
  textToDateTimeDefault,
  textToDateTime,
  textToDateOrDateTime,
  textToDuration,
  durationToText,
} from "./SfxDocumentMetaData.values";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { PropertyBag } from "../../../udkapi/com/sun/star/beans/PropertyBag";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { TRANSIENT } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import {
  Date as UnoDate,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as datetimeType,
} from "../../../offapi/com/sun/star/util/DateTime";
import {
  DateWithTimezone,
  cppu_detail_getUnoType_DateWithTimezone as dateTZType,
} from "../../../offapi/com/sun/star/util/DateWithTimezone";
import {
  DateTimeWithTimezone,
  cppu_detail_getUnoType_DateTimeWithTimezone as datetimeTZType,
} from "../../../offapi/com/sun/star/util/DateTimeWithTimezone";
import {
  Duration,
  cppu_detail_getUnoType_Duration as durationType,
} from "../../../offapi/com/sun/star/util/Duration";
import {
  Time,
  cppu_detail_getUnoType_Time as timeType,
} from "../../../offapi/com/sun/star/util/Time";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
beforeAll(
  /** Installs the production UNO registry for these service tests. @returns Original operation result. */ () =>
    InitApplicationServiceManager(implementations),
);
afterEach(releaseDomScope);
/** Actual source constructor uses the production manager. @returns Acquired bag. */
function bag() {
  return own(
    PropertyBag.createDefault(
      own(new Reference<XComponentContext>(getProcessComponentContext().get())),
    ),
  );
}
it("converts every source-supported temporal/scalar property with original value-type attributes", /** Verifies converts every source-supported temporal/scalar property with original value-type attributes. @returns Original operation result. */ () => {
  const value = bag(),
    api = value.operatorStar();
  for (const [name, any] of [
    ["00_bool", own(new Any([true], "bool"))],
    ["01_string", own(new Any(u("text").getDataAddress(), "OUString"))],
    ["02_datetime", own(new Any(new DateTime(9, 8, 7, 6, 5, 4, 2023, true), datetimeType))],
    ["03_date", own(new Any(new UnoDate(29, 2, 2024), dateType))],
    [
      "04_datetimeTZ",
      own(
        new Any(
          new DateTimeWithTimezone(new DateTime(0, 0, 0, 0, 2, 1, 2024, false), 330),
          datetimeTZType,
        ),
      ),
    ],
    ["05_dateTZ", own(new Any(new DateWithTimezone(new UnoDate(2, 1, 2024), -90), dateTZType))],
    ["06_time", own(new Any(new Time(9, 6, 5, 4, true), timeType))],
    ["07_duration", own(new Any(new Duration(true, 1, 2, 3, 4, 5, 6, 7), durationType))],
    ["08_float", own(new Any([42], "sal_Int32"))],
  ] as const)
    api.addProperty(u(name), 0, any);
  const [values, attributes] = propsToStrings(
    own(new Reference<XPropertySet>(value, UNO_QUERY_THROW, XPropertySet.static_type)),
  );
  try {
    const text = [];
    for (let i = 0; i < values.getLength(); ++i)
      text.push(
        read(
          new OUString(
            OUString.unacquired(
              values.operatorIndex(i) as unknown as Parameters<typeof OUString.unacquired>[0],
            ),
          ),
        ),
      );
    expect(text).toEqual([
      "true",
      "text",
      "2023-04-05T06:07:08.000000009Z",
      "2024-02-29",
      "2024-01-02T00:00:00+05:30",
      "2024-01-02-01:30",
      "PT4H5M6.000000009S",
      "-P1Y2M3DT4H5M6.000000007S",
      "42",
    ]);
    expect(
      attributes.map(
        /** Copies the actual source Unicode name. @param row - Declared source operand. @returns Original operation result. */ (
          row,
        ) =>
          row.map(
            /** Copies the actual source Unicode name. @param value0 - Declared source operand. @returns Original operation result. */ ([
              name,
              value,
            ]) => [read(new OUString(name)), read(new OUString(value))],
          ),
      ),
    ).toEqual([
      [
        ["meta:name", "00_bool"],
        ["meta:value-type", "boolean"],
      ],
      [["meta:name", "01_string"]],
      [
        ["meta:name", "02_datetime"],
        ["meta:value-type", "date"],
      ],
      [
        ["meta:name", "03_date"],
        ["meta:value-type", "date"],
      ],
      [
        ["meta:name", "04_datetimeTZ"],
        ["meta:value-type", "date"],
      ],
      [
        ["meta:name", "05_dateTZ"],
        ["meta:value-type", "date"],
      ],
      [
        ["meta:name", "06_time"],
        ["meta:value-type", "time"],
      ],
      [
        ["meta:name", "07_duration"],
        ["meta:value-type", "time"],
      ],
      [
        ["meta:name", "08_float"],
        ["meta:value-type", "float"],
      ],
    ]);
  } finally {
    values.dispose();
    disposeAttrVector(attributes);
  }
});
it("preserves descriptor-index string compatibility after transient and unsupported properties", /** Verifies preserves descriptor-index string compatibility after transient and unsupported properties. @returns Original operation result. */ () => {
  const value = bag(),
    api = value.operatorStar();
  api.addProperty(u("00_transient"), TRANSIENT, own(new Any([1], "sal_Int32")));
  const ints = own(new (Sequence.specialize<number>("sal_Int32", 4))());
  api.addProperty(
    u("01_unsupported"),
    0,
    own(new Any(ints.getAddress(), ["Sequence", "sal_Int32"])),
  );
  for (const name of ["02_first", "03_second", "04_third"])
    api.addProperty(u(name), 0, own(new Any(u(name).getDataAddress(), "OUString")));
  const [values, attributes] = propsToStrings(
    own(new Reference<XPropertySet>(value, UNO_QUERY_THROW, XPropertySet.static_type)),
  );
  try {
    expect(values.getLength()).toBe(3);
    expect(
      attributes.map(
        /** Executes the actual native-value test operation. @param row - Declared source operand. @returns Original operation result. */ (
          row,
        ) => row.length,
      ),
    ).toEqual([1, 1, 2]);
    expect(read(new OUString(attributes[2]?.[1]?.[1] as OUString))).toBe("string");
  } finally {
    values.dispose();
    disposeAttrVector(attributes);
  }
});
it("uses original validity/default/timezone and duration approximation helpers", /** Verifies uses original validity/default/timezone and duration approximation helpers. @returns Original operation result. */ () => {
  expect(read(dateToText(new UnoDate(), null))).toBe("");
  expect(read(dateTimeToText(new DateTime()))).toBe("");
  expect(read(dateTimeToText(new DateTime(0, 0, 0, 0, 2, 1, 2024, false)))).toBe(
    "2024-01-02T00:00:00",
  );
  expect(textToDateTimeDefault(u("invalid")).equals(new DateTime())).toBe(true);
  const dt = new DateTime(),
    date = new UnoDate(),
    kind: [boolean] = [true],
    timezone: [number | undefined] = [777];
  expect(textToDateTime(dt, u("2024-01-02T03:04:05Z"))).toBe(true);
  expect(textToDateOrDateTime(date, dt, kind, timezone, u("2024-01-02+05:30"))).toBe(true);
  expect([date.Day, kind[0], timezone[0]]).toEqual([2, false, 330]);
  const duration = new Duration();
  expect(textToDuration(duration, u("-P1Y2M3DT4H5M6S"))).toBe(true);
  expect(duration.Negative).toBe(true);
  expect(textToDuration(u("-P1D"))).toBe(86400);
  expect(textToDuration(u("invalid"))).toBe(0);
  expect(read(durationToText(90061))).toBe("P1DT1H1M1S");
});
