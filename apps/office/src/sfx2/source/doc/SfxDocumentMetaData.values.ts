/** @fileoverview Original SfxDocumentMetaData.cxx anonymous scalar/property conversion functions over actual PropertyBag/Any/Sequence/string owners. Service/DOM/storage entry points remain with their original owner and are not manufactured here. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { UnoType } from "../../../cppu/inc/unotype";
import {
  Date,
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
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { Converter } from "../../../sax/source/tools/converter";
import { Property } from "../../../udkapi/com/sun/star/beans/Property";
import type { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { TRANSIENT } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
const Names = Sequence.specialize<OUString>("OUString", 8);
/** Original vector<vector<pair<OUString,OUString>>>; each actual value owner belongs to its returned vector. */
export type AttrVector = [OUString, OUString][][];
/** Source-known literal. @param text - Literal. @returns Actual string owner. */
function literal(text: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(text + "\0"));
}
/** Original validity checks only Month>0. @param value - Date. @returns Source validity. */
export function isValidDate(value: Readonly<Date>): boolean {
  return value.Month > 0;
}
/** Original validity checks only Month>0. @param value - DateTime. @returns Source validity. */
export function isValidDateTime(value: Readonly<DateTime>): boolean {
  return value.Month > 0;
}
/** Original date/dateTime parser wrapper, without replacement outputs on failure. @param date - Actual Date output. @param datetime - Actual DateTime output. @param isDateTime - Selected kind. @param timezone - Optional offset output. @param text - Native string. @returns Success. */
export function textToDateOrDateTime(
  date: Date,
  datetime: DateTime,
  isDateTime: [boolean],
  timezone: [number | undefined],
  text: OUStringConstReference,
): boolean {
  return Converter.parseDateOrDateTime(date, datetime, isDateTime, timezone, text);
}
/** Original strict parse wrapper. @param output - Actual destination. @param text - Native string. @returns Success. */
export function textToDateTime(output: DateTime, text: OUStringConstReference): boolean {
  return Converter.parseDateTime(output, text);
}
/** Original default generated value remains unchanged on parse failure. @param text - Native string. @returns Actual value. */
export function textToDateTimeDefault(text: OUStringConstReference): DateTime {
  const value = new DateTime();
  textToDateTime(value, text);
  return value;
}
/** Original date formatting gate and native buffer. @param value - Date. @param timezone - Optional offset pointer. @returns Owned text. */
export function dateToText(value: Readonly<Date>, timezone: readonly [number] | null): OUString {
  if (!isValidDate(value)) return new OUString();
  const buffer = new OUStringBuffer();
  try {
    Converter.convertDate(buffer, value, timezone);
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original DateTime formatting always includes time at midnight. @param value - Value. @param timezone - Optional source offset pointer. @returns Owned text. */
export function dateTimeToText(
  value: Readonly<DateTime>,
  timezone: readonly [number] | null = null,
): OUString {
  if (!isValidDateTime(value)) return new OUString();
  const buffer = new OUStringBuffer(32);
  try {
    Converter.convertDateTime(buffer, value, timezone, true);
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original typed duration parse. @param output - Actual generated duration. @param text - Native string. @returns Success. */
export function textToDuration(output: Duration, text: OUStringConstReference): boolean;
/** Original signed32 editing duration approximation. @param text - Native string. @returns Seconds or zero. */
export function textToDuration(text: OUStringConstReference): number;
/** Source overload selection by declared argument count. Integer overflow/machine UB is not certified; no saturation or sign repair is added. @param first - Original output or input. @param second - Original input. @returns Parsed success or signed32 seconds. */
export function textToDuration(
  first: Duration | OUStringConstReference,
  second?: OUStringConstReference,
): boolean | number {
  if (second !== undefined) return Converter.convertDuration(first as Duration, second);
  const value = new Duration();
  if (textToDuration(value, first as OUStringConstReference)) {
    const days = value.Years * 365 + value.Months * 30 + value.Days;
    return (Math.imul(days, 86400) + value.Hours * 3600 + value.Minutes * 60 + value.Seconds) | 0;
  }
  return 0;
}
/** Original generated-duration output overload. @param value - Duration. @returns Owned text. */
export function durationToText(value: Readonly<Duration>): OUString;
/** Original signed32 seconds output overload, whose caller validates nonnegative values. @param value - Seconds. @returns Owned text. */
// eslint-disable-next-line @typescript-eslint/unified-signatures -- Preserve the source signed-seconds overload separately from its structured Duration overload.
export function durationToText(value: number): OUString;
/** Original source overloads retain unsigned16 duration fields, with no alternate ISO formatter. @param value - Selected source input. @returns Owned text. */
export function durationToText(value: Readonly<Duration> | number): OUString {
  if (typeof value === "number") {
    value |= 0;
    const duration = new Duration();
    duration.Days = Math.trunc(value / 86400);
    duration.Hours = Math.trunc((value % 86400) / 3600);
    duration.Minutes = Math.trunc((value % 3600) / 60);
    duration.Seconds = value % 60;
    duration.NanoSeconds = 0;
    return durationToText(duration);
  }
  const buffer = new OUStringBuffer();
  try {
    Converter.convertDuration(buffer, value);
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original compiler binding for vector<pair<OUString,OUString>> element construction. @param attributes - Actual vector. @param name - Source literal. @param value - Borrowed value. @returns Nothing. */
function attribute(
  attributes: [OUString, OUString][],
  name: string,
  value: OUStringConstReference,
): void {
  attributes.push([literal(name), new OUString(value)]);
}
/** Explicit C++ implicit nested-vector element destruction at its caller-owned lifetime boundary. @param attributes - Owned vector. @returns Nothing. */
export function disposeAttrVector(attributes: AttrVector): void {
  for (const row of attributes)
    for (const [name, value] of row) {
      value.dispose();
      name.dispose();
    }
}
/** Original property list to text/attribute vectors. Uses source descriptor index for first-four string compatibility and ignores getter UNO exceptions. @param properties - Actual property-set interface. @returns Owned sequence and attribute vector. */
export function propsToStrings(
  properties: Reference<XPropertySet>,
): [Sequence<OUString>, AttrVector] {
  const values: OUString[] = [],
    attributes: AttrVector = [],
    info = properties.operatorStar().getPropertySetInfo();
  let descriptions: Sequence<Property> | undefined;
  try {
    descriptions = info.operatorStar().getProperties();
    for (let i = 0; i < descriptions.getLength(); ++i) {
      const property = Property.unacquired(
        descriptions.operatorIndex(i) as { get(offset: number): unknown },
      );
      if (property.Attributes & TRANSIENT) continue;
      const name = new OUString(property.Name),
        any = new Any(),
        row: [OUString, OUString][] = [];
      let retained = false;
      try {
        try {
          const value = properties.operatorStar().getPropertyValue(name);
          try {
            any.assign(value);
          } finally {
            value.dispose();
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
        const type = any.getValueType();
        attribute(row, "meta:name", name);
        let valueType: string | undefined;
        if (type.equals(UnoType.get("bool"))) {
          const value: [boolean] = [false];
          any.extract(value, "bool");
          const buffer = new OUStringBuffer();
          try {
            Converter.convertBool(buffer, value[0]);
            values.push(buffer.makeStringAndClear());
          } finally {
            buffer.dispose();
          }
          valueType = "boolean";
        } else if (type.equals(UnoType.get("OUString"))) {
          const value = new OUString();
          try {
            any.extract(value, "OUString");
            values.push(new OUString(value));
          } finally {
            value.dispose();
          }
          if (i >= 4) valueType = "string";
        } else if (type.equals(datetimeType())) {
          const value = new DateTime();
          any.extract(value, datetimeType);
          values.push(dateTimeToText(value));
          valueType = "date";
        } else if (type.equals(dateType())) {
          const value = new Date();
          any.extract(value, dateType);
          values.push(dateToText(value, null));
          valueType = "date";
        } else if (type.equals(datetimeTZType())) {
          const value = new DateTimeWithTimezone();
          any.extract(value, datetimeTZType);
          values.push(dateTimeToText(value.DateTimeInTZ, [value.Timezone]));
          valueType = "date";
        } else if (type.equals(dateTZType())) {
          const value = new DateWithTimezone();
          any.extract(value, dateTZType);
          values.push(dateToText(value.DateInTZ, [value.Timezone]));
          valueType = "date";
        } else if (type.equals(timeType())) {
          const value = new Time(),
            duration = new Duration();
          any.extract(value, timeType);
          duration.Hours = value.Hours;
          duration.Minutes = value.Minutes;
          duration.Seconds = value.Seconds;
          duration.NanoSeconds = value.NanoSeconds;
          values.push(durationToText(duration));
          valueType = "time";
        } else if (type.equals(durationType())) {
          const value = new Duration();
          any.extract(value, durationType);
          values.push(durationToText(value));
          valueType = "time";
        } else if (UnoType.get("double").isAssignableFrom(type)) {
          const value: [number] = [0];
          any.extract(value, "double");
          const buffer = new OUStringBuffer();
          try {
            Converter.convertDouble(buffer, value[0]);
            values.push(buffer.makeStringAndClear());
          } finally {
            buffer.dispose();
          }
          valueType = "float";
        } else continue;
        if (valueType !== undefined) {
          const text = literal(valueType);
          try {
            attribute(row, "meta:value-type", text);
          } finally {
            text.dispose();
          }
        }
        attributes.push(row);
        retained = true;
      } finally {
        if (!retained) disposeAttrVector([row]);
        any.dispose();
        name.dispose();
      }
    }
    const result = new Names(
      {
        /** Original vector element address. @param offset - Byte offset. @returns Actual string field. */ get(
          offset: number,
        ) {
          return (values[offset / 8] as OUString).getDataAddress();
        },
      },
      values.length,
    );
    return [result, attributes];
  } catch (error) {
    disposeAttrVector(attributes);
    throw error;
  } finally {
    for (const value of values) value.dispose();
    descriptions?.dispose();
    info.dispose();
  }
}
