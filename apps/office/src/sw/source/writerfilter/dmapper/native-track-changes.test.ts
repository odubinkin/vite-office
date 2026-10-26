/** @fileoverview Native table redline parameters, date parsing and generated DateTime/PropertyValue ownership without a replacement date parser or model. */
import { expect, it } from "vitest";
import { TrackChangesHandler } from "./TrackChangesHandler";
import { RedlineParams } from "./PropertyMap";
import { ConvertDateStringToDateTime } from "./ConversionHelper";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as dateType,
} from "../../../../offapi/com/sun/star/util/DateTime";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { readNumberingProperty } from "../../core/unocore/unosett-properties";
import { getTokenFromUtf8 } from "../../../../oox/source/token/tokenmap";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  OOXMLValue as V,
  OOXMLProperty,
  OOXMLPropertyType as Kind,
} from "../ooxml/OOXMLPropertySet";

/** Copies an actual string resource value. @param value - UTF16 text. @returns Native value. */
function string(value: string): V {
  const source = unicode(value);
  try {
    return V.createString(source);
  } finally {
    source.dispose();
  }
}
/** Reads one generated string Any. @param property - Actual property. @returns Text. */
function str(property: PropertyValue): string {
  const value = unicode("");
  try {
    expect(property.Value.extract(value, "OUString")).toBe(true);
    return text(value);
  } finally {
    value.dispose();
  }
}
/** Releases copied generated compound members. @param property - Owned value. @returns Nothing. */
function release(property: PropertyValue): void {
  property.Name.dispose();
  property.Value.dispose();
}
/** Parses an exact bounded native string view. @param value - UTF16 string. @returns Native DateTime. */
function date(value: string): DateTime {
  const source = unicode(value);
  try {
    return ConvertDateStringToDateTime(source.getStr().subarray(0, source.getLength()));
  } finally {
    source.dispose();
  }
}
/** Reads the original native field order. @param value - Actual DateTime. @returns Scalar assertion values. */
function fields(value: DateTime): readonly (number | boolean)[] {
  return [
    value.NanoSeconds,
    value.Seconds,
    value.Minutes,
    value.Hours,
    value.Day,
    value.Month,
    value.Year,
    value.IsUTC,
  ];
}

it("keeps native Word date interpretation independent of ISO timezone conversion", /** Literal source behavior includes ignored fractions, offsets and UTC suffix. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["2008-01-21T10:42:05Z", [0, 5, 42, 10, 21, 1, 2008, false]],
    ["2008-01-21T10:42:05+02:30", [0, 5, 42, 10, 21, 1, 2008, false]],
    ["2008-01-21T10:42:05.987654321-03:00", [0, 5, 42, 10, 21, 1, 2008, false]],
    ["2008-01-21", [0, 0, 0, 0, 21, 1, 2008, false]],
    ["", [0, 0, 0, 0, 0, 0, 0, false]],
    ["2008", [0, 0, 0, 0, 0, 0, 2008, false]],
    ["2008-01T10", [0, 0, 0, 10, 0, 1, 2008, false]],
    ["-2024-01-02T03:04:05Z", [0, 5, 4, 3, 1, 2024, 0, false]],
    ["32768-65537-65538T65539:65540:65541Z", [0, 5, 4, 3, 2, 1, -32768, false]],
    ["bad-xx-yyT-1:-2:-3Z", [0, 65533, 65534, 65535, 0, 0, 0, false]],
    ["2008-01-21t10:42:05Z", [0, 0, 0, 0, 21, 1, 2008, false]],
  ] as const)
    expect(fields(date(input)), input).toEqual(expected);
});

it("uses actual native DateTime member widths, value copies and compound Any binding", /** The IDL value remains usable by existing SAX consumers while acquiring its real generated type. @returns Nothing. */ () => {
  const empty = new DateTime();
  expect(fields(empty)).toEqual([0, 0, 0, 0, 0, 0, 0, false]);
  const value = new DateTime(-1, -1, 65536, 65537, 65538, 65539, 65535, true);
  expect(fields(value)).toEqual([4294967295, 65535, 0, 1, 2, 3, -1, true]);
  const copy = new DateTime(value);
  expect(copy.equals(value)).toBe(true);
  expect(copy.notEquals(value)).toBe(false);
  expect(copy.assign(copy)).toBe(copy);
  const actual = new Any(value, dateType),
    result = new DateTime();
  expect(actual.extract(result, dateType)).toBe(true);
  expect(result.equals(value)).toBe(true);
  const equal = new Any(result, dateType);
  try {
    expect(actual.operatorEquals(equal)).toBe(true);
  } finally {
    equal.dispose();
  }
  const numeric = ["NanoSeconds", "Seconds", "Minutes", "Hours", "Day", "Month", "Year"] as const;
  for (const member of numeric) {
    copy.assign(value);
    copy[member]++;
    expect(copy.equals(value)).toBe(false);
    expect(copy.notEquals(value)).toBe(true);
  }
  copy.assign(value);
  copy.IsUTC = false;
  expect(copy.notEquals(value)).toBe(true);
  expect([
    value.get(0)[0],
    value.get(4)[0],
    value.get(6)[0],
    value.get(8)[0],
    value.get(10)[0],
    value.get(12)[0],
    value.get(14)[0],
    value.get(16)[0],
  ]).toEqual(fields(value));
  expect(value.get(0)).toBe(value.get(0));
  expect(dateType().equals(dateType())).toBe(true);
  const Dates = Sequence.specialize<DateTime>(dateType, 20),
    dates = new Dates(
      {
        /** Borrows one actual DateTime at its declared native array stride. @param offset - Original byte offset. @returns Date-time. */
        get: (offset) => {
          expect(offset).toBe(0);
          return value;
        },
      },
      1,
    );
  value.Year = 42;
  const retained = new Any(dates.operatorIndex(0), dateType),
    scalar = new DateTime();
  try {
    expect(retained.extract(scalar, dateType)).toBe(true);
    expect(scalar.Year).toBe(-1);
  } finally {
    retained.dispose();
    dates.dispose();
  }
  actual.dispose();
});

it("retains RedlineParams native string and revert-sequence owners without a fabricated token default", /** The importing producer is responsible for assigning the native token. @returns Nothing. */ () => {
  const value = new RedlineParams();
  expect(text(value.m_sAuthor)).toBe("");
  expect(text(value.m_sDate)).toBe("");
  expect(value.m_aRevertProperties.getLength()).toBe(0);
  const source = unicode("Author😀"),
    author = value.m_sAuthor;
  value.m_sAuthor.assign(source);
  source.dispose();
  expect(value.m_sAuthor).toBe(author);
  expect(text(author)).toBe("Author😀");
  value.m_nToken = 123;
  expect(value.m_nToken).toBe(123);
  value.dispose();
});

it.each([
  ["tableRowInsert", "TableRowInsert"],
  ["tableRowDelete", "TableRowDelete"],
  ["tableCellInsert", "TableCellInsert"],
  ["tableCellDelete", "TableCellDelete"],
  ["invalid", ""],
] as const)(
  "keeps native token masking and three-property sequence for %s",
  /** Tests actual generated values and ownership after receiver destruction. @param token - Original token spelling. @param type - Expected native redline type. @returns Nothing. */ (
    token,
    type,
  ) => {
    const handler = new TrackChangesHandler((getTokenFromUtf8(token) & 0xffff) | 0xabcd0000);
    handler.attribute(N.LN_CT_TrackChange_author, string("Author😀"));
    handler.attribute(N.LN_CT_TrackChange_author, string("Final😀"));
    handler.attribute(N.LN_CT_TrackChange_date, string("2008-01-21T10:42:05Z"));
    handler.attribute(N.LN_CT_Markup_id, V.createInteger(99));
    handler.attribute(1, string("ignored"));
    handler.sprm(new OOXMLProperty(1, new V(), Kind.SPRM));
    const properties = handler.getRedlineProperties(),
      values = Array.from(
        { length: 3 },
        /** Copies original generated sequence members. @param unused - Unused initializer. @param index - Position. @returns Owned property. */ (
          unused,
          index,
        ) => {
          void unused;
          return readNumberingProperty(properties, index);
        },
      );
    expect(
      values.map(
        /** Reads native property names. @param value - Property. @returns Name. */ (value) =>
          text(value.Name),
      ),
    ).toEqual(["RedlineType", "RedlineAuthor", "RedlineDateTime"]);
    for (const value of values) {
      expect(value.Handle).toBe(0);
      expect(value.State).toBe(PropertyState.DIRECT_VALUE);
    }
    expect(str(values[0] as PropertyValue)).toBe(type);
    expect(str(values[1] as PropertyValue)).toBe("Final😀");
    const datetime = new DateTime();
    expect((values[2] as PropertyValue).Value.extract(datetime, dateType)).toBe(true);
    expect(fields(datetime)).toEqual([0, 5, 42, 10, 21, 1, 2008, false]);
    handler.dispose();
    properties.dispose();
    expect(str(values[1] as PropertyValue)).toBe("Final😀");
    for (const value of values) release(value);
  },
);

it("returns zero dates and empty author from a newly constructed native receiver", /** No browser Date, timezone normalization or synthetic author is supplied. @returns Nothing. */ () => {
  const handler = new TrackChangesHandler(getTokenFromUtf8("tableRowInsert")),
    values = handler.getRedlineProperties(),
    author = readNumberingProperty(values, 1),
    timestamp = readNumberingProperty(values, 2),
    value = new DateTime();
  expect(str(author)).toBe("");
  expect(timestamp.Value.extract(value, dateType)).toBe(true);
  expect(fields(value)).toEqual(fields(new DateTime()));
  release(author);
  release(timestamp);
  values.dispose();
  handler.dispose();
});
