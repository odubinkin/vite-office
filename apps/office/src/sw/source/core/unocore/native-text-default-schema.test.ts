/** @fileoverview Native current-core TEXT_DEFAULT schema, original flag normalization and actual Writer document default-value round-trip. No partial default-service provider is registered. */
import { expect, it } from "vitest";
import { aSwMapProvider, SwUnoPropertyMapProvider } from "./unomap";
import { PROPERTY_MAP_TEXT_DEFAULT } from "../../../inc/unomap";
import {
  RES_PARATR_TABSTOP,
  RES_PAGEDESC,
  RES_ROW_SPLIT,
  RES_TEXTGRID,
  RES_COLLAPSING_BORDERS,
  RES_TXTATR_CHARFMT,
} from "../../../inc/hintids";
import { MID_STD_TAB } from "../../../../editeng/inc/memberids";
import { MID_PAGEDESC_PAGEDESCNAME, MID_GRID_STANDARD_MODE } from "../../../inc/unomid";
import { MAYBEVOID } from "../../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { createWriterDocument } from "../doc/doc";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { XPropertySetInfo } from "../../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { propertyNameView } from "../../../../svl/inc/itemprop";
import { unicode, text } from "./unocrsrhelper";
it("retains static default-table identity and clears MAYBEVOID except the original PageDescName entry", /** Real original schema values survive provider instances and repeated queries. @returns Nothing. */ () => {
  const first = new SwUnoPropertyMapProvider(),
    second = new SwUnoPropertyMapProvider(),
    entries = first.GetPropertyMapEntries(PROPERTY_MAP_TEXT_DEFAULT),
    set = first.GetPropertySet(PROPERTY_MAP_TEXT_DEFAULT);
  expect(entries.length).toBe(78);
  const flags = upstream.originalFlags as Readonly<Record<string, number>>;
  for (const entry of entries) {
    const name = text(entry.aName);
    expect(Object.hasOwn(flags, name)).toBe(true);
    const original = flags[name] as number;
    expect(entry.nFlags).toBe(name === "PageDescName" ? original : original & ~MAYBEVOID);
  }
  expect(second.GetPropertyMapEntries(PROPERTY_MAP_TEXT_DEFAULT)).toBe(entries);
  expect(second.GetPropertySet(PROPERTY_MAP_TEXT_DEFAULT)).toBe(set);
  expect(aSwMapProvider.GetPropertySet(65536 + PROPERTY_MAP_TEXT_DEFAULT)).toBe(set);
  const key = unicode("CharWeight"),
    defaultEntry = set.getPropertyMap().getByName(propertyNameView(key)),
    cursorEntry = first.GetPropertySet(0).getPropertyMap().getByName(propertyNameView(key));
  try {
    expect(defaultEntry).not.toBe(cursorEntry);
    expect([defaultEntry?.nFlags, cursorEntry?.nFlags]).toEqual([0, MAYBEVOID]);
  } finally {
    key.dispose();
  }
  const maybeVoid = entries.filter(
    /** Observes original native flags. @param entry - Native row. @returns MAYBEVOID membership. */ (
      entry,
    ) => (entry.nFlags & MAYBEVOID) !== 0,
  );
  expect(
    maybeVoid.map(
      /** Observes actual names. @param entry - Native row. @returns Name. */ (entry) =>
        text(entry.aName),
    ),
  ).toEqual(["PageDescName"]);
  expect(
    maybeVoid.map(
      /** Observes the source Which/member exception. @param entry - Native row. @returns Original identity. */ (
        entry,
      ) => [entry.nWID, entry.nMemberId],
    ),
  ).toEqual([[RES_PAGEDESC, MID_PAGEDESC_PAGEDESCNAME]]);
});
it("publishes actual native default metadata and excludes cursor-only dispatch properties", /** Queries the genuine metadata component; no host-array facade or invented provider participates. @returns Nothing. */ () => {
  const set = aSwMapProvider.GetPropertySet(PROPERTY_MAP_TEXT_DEFAULT),
    info = new Reference<XPropertySetInfo>(set.getPropertySetInfo().get()),
    queried = new Reference<XPropertySetInfo>(info, UNO_QUERY_THROW, XPropertySetInfo.static_type);
  try {
    expect(queried.get()).toBe(info.get());
    for (const [name, which, member] of [
      ["TabStopDistance", RES_PARATR_TABSTOP, MID_STD_TAB | CONVERT_TWIPS],
      ["CharStyleName", RES_TXTATR_CHARFMT, 0],
      ["IsSplitAllowed", RES_ROW_SPLIT, 0],
      ["CollapsingBorders", RES_COLLAPSING_BORDERS, 0],
      ["StandardPageMode", RES_TEXTGRID, MID_GRID_STANDARD_MODE],
    ] as const) {
      const key = unicode(name),
        entry = set.getPropertyMap().getByName(propertyNameView(key)),
        property = (info.get() as XPropertySetInfo).getPropertyByName(key);
      try {
        expect([entry?.nWID, entry?.nMemberId, property.Handle, property.Attributes]).toEqual([
          which,
          member,
          which,
          0,
        ]);
      } finally {
        property.dispose();
        key.dispose();
      }
    }
    for (const name of [
      "ParaStyleName",
      "NumberingRules",
      "NumberingLevel",
      "ListAutoFormat",
      "CharAutoStyleName",
      "OutlineLevel",
      "FillStyle",
      "DefaultPageMode",
    ]) {
      const key = unicode(name);
      try {
        expect((info.get() as XPropertySetInfo).hasPropertyByName(key)).toBe(false);
      } finally {
        key.dispose();
      }
    }
  } finally {
    queried.dispose();
    info.dispose();
  }
});
it("applies tab distance via the real native default schema and existing SwDoc default owner", /** Kernel prerequisite only: SwXTextDefaults, its broader value-rejection contract and model/service routing remain unported. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    set = new SfxItemSet(doc.GetAttrPool(), [[RES_PARATR_TABSTOP, RES_PARATR_TABSTOP]]),
    properties = aSwMapProvider.GetPropertySet(PROPERTY_MAP_TEXT_DEFAULT),
    key = unicode("TabStopDistance"),
    distance = new Any([1270], "sal_Int32");
  try {
    const before = properties.getPropertyValue(key, set),
      output: [number] = [0];
    try {
      expect(before.extract(output, "sal_Int32")).toBe(true);
      expect(output[0]).toBe(2000);
    } finally {
      before.dispose();
    }
    properties.setPropertyValue(key, distance, set);
    doc.SetDefault(set);
    const reader = new SfxItemSet(doc.GetAttrPool(), [[RES_PARATR_TABSTOP, RES_PARATR_TABSTOP]]);
    const actual = properties.getPropertyValue(key, reader);
    try {
      expect(actual.extract(output, "sal_Int32")).toBe(true);
      expect(output[0]).toBe(1270);
    } finally {
      actual.dispose();
      reader.Dispose();
    }
  } finally {
    distance.dispose();
    key.dispose();
    set.Dispose();
    doc.Dispose();
  }
});

import upstream from "./native-text-default-schema.upstream.json";
