/** @fileoverview Source property-set value/state helpers over real Writer pools, native items and ownership-preserving set APIs. */
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SfxItemPropertySet } from "./itemprop";
import { SfxItemPropertyMapEntry as Entry } from "../../inc/itemprop";
import { SfxItemSet, SfxItemState } from "./itemset";
import { SfxBoolItem } from "./cenumitm";
import type { SfxPoolItem } from "./poolitem";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { RES_PARATR_TABSTOP, RES_PARATR_SPLIT, RES_BREAK } from "../../../sw/inc/hintids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../../cppu/inc/unotype";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import * as Flags from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { MID_STD_TAB } from "../../../editeng/inc/memberids";
import { CONVERT_TWIPS } from "../../inc/poolitem";
import { SvxTabStopItem } from "../../../editeng/inc/tstpitem";
import {
  BreakType,
  cppu_detail_getUnoType_BreakType as breakType,
} from "../../../offapi/com/sun/star/style/BreakType";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { unicode, text } from "../../../sw/source/core/unocore/unocrsrhelper";

/** Actual canonical Writer pool and source-declared property table. @returns Owned session. */
function session() {
  const doc = createWriterDocument(),
    pool = doc.GetAttrPool();
  const names = [
    unicode("TabStopDistance"),
    unicode("ParaSplit"),
    unicode("BreakType"),
    unicode("Missing"),
    unicode("Zero"),
  ] as const;
  const entries = [
    new Entry(
      names[0],
      RES_PARATR_TABSTOP,
      UnoType.get("sal_Int32"),
      0,
      MID_STD_TAB | CONVERT_TWIPS,
    ),
    new Entry(names[1], RES_PARATR_SPLIT, UnoType.get("bool"), 0, 0),
    new Entry(names[2], RES_BREAK, breakType(), Flags.MAYBEVOID, 0),
    new Entry(names[3], 5000, UnoType.get("sal_Int32"), Flags.MAYBEVOID, 0),
    new Entry(names[4], 0, UnoType.get("bool"), Flags.MAYBEVOID, 0),
  ] as const;
  const properties = new SfxItemPropertySet(entries),
    parent = new SfxItemSet(pool, [
      [RES_PARATR_SPLIT, RES_PARATR_TABSTOP],
      [RES_BREAK, RES_BREAK],
    ]),
    child = new SfxItemSet(
      pool,
      [
        [RES_PARATR_SPLIT, RES_PARATR_TABSTOP],
        [RES_BREAK, RES_BREAK],
      ],
      parent,
    );
  return {
    doc,
    pool,
    names,
    entries,
    properties,
    parent,
    child,
    /** Destroys actual set entries before their document/pool and borrowed metadata table. @returns Nothing. */ dispose() {
      child.Dispose();
      parent.Dispose();
      properties.dispose();
      for (const entry of entries) entry.dispose();
      for (const name of names) name.dispose();
      doc.Dispose();
    },
  };
}
/** Reads an actual scalar Any without accepting a host value surrogate. @param value - Borrowed value. @param type - Expected native scalar. @returns Extracted value. */
function scalar(value: Any, type: "sal_Int32" | "bool"): number | boolean {
  const result: [number | boolean] = [0];
  expect(value.extract(result, type)).toBe(true);
  return result[0];
}

it("retains every source PropertyAttribute constant and deprecated alias", /** Compares against original local IDL rather than a duplicate local expectation table. @returns Nothing. */ () => {
  const source = readFileSync(
    resolve("../../vendor/libreoffice-reference/udkapi/com/sun/star/beans/PropertyAttribute.idl"),
    "utf8",
  );
  const expected = Object.fromEntries(
    [...source.matchAll(/const short (\w+) = (\d+);/g)].map(
      /** Original constant declaration. @param match - Source match. @returns Name/value. */ (
        match,
      ) => [match[1], Number(match[2])],
    ),
  );
  expect({ ...Flags }).toEqual(expected);
});

it("reads native default/parent/direct values while reflecting shallow property state", /** Source value lookup searches parents; property state intentionally does not. @returns Nothing. */ () => {
  const s = session(),
    value = new Any([2540], "sal_Int32");
  try {
    const initial = s.properties.getPropertyValue(s.names[0], s.child);
    try {
      expect(scalar(initial, "sal_Int32")).toBe(2000);
    } finally {
      initial.dispose();
    }
    expect(s.properties.getPropertyState(s.names[0], s.child)).toBe(PropertyState.DEFAULT_VALUE);
    s.properties.setPropertyValue(s.names[0], value, s.parent);
    const inherited = s.properties.getPropertyValue(s.names[0], s.child);
    try {
      expect(scalar(inherited, "sal_Int32")).toBe(2540);
    } finally {
      inherited.dispose();
    }
    expect(s.properties.getPropertyState(s.names[0], s.child)).toBe(PropertyState.DEFAULT_VALUE);
    SfxItemPropertySet.setPropertyValue(s.entries[0], value, s.child);
    expect(SfxItemPropertySet.getPropertyState(s.entries[0], s.child)).toBe(
      PropertyState.DIRECT_VALUE,
    );
    expect(
      s.properties
        .getPropertyMap()
        .getByName(s.names[0].getStr().subarray(0, s.names[0].getLength())),
    ).toBe(s.entries[0]);
    const result = new Any();
    try {
      s.properties.getPropertyValue(s.names[0], s.child, result);
      expect(scalar(result, "sal_Int32")).toBe(2540);
    } finally {
      result.dispose();
    }
    const poolDefault = new Any();
    try {
      (s.pool.GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue(
        poolDefault,
        MID_STD_TAB | CONVERT_TWIPS,
      );
      expect(scalar(poolDefault, "sal_Int32")).toBe(2000);
    } finally {
      poolDefault.dispose();
    }
  } finally {
    value.dispose();
    s.dispose();
  }
});

it("rejects failed PutValue without changing the set and retains source ignore semantics", /** Wrong-type Any is a real source value failure, not a fake item/provider callback. @returns Nothing. */ () => {
  const s = session(),
    wrong = new Any(true),
    good = new Any(false),
    missing = unicode("undeclared");
  try {
    try {
      s.properties.setPropertyValue(s.names[0], wrong, s.child);
      throw new Error("Expected native argument error");
    } catch (error) {
      if (!(error instanceof IllegalArgumentException)) throw error;
      error.dispose();
    }
    expect(s.child.Count()).toBe(0);
    s.properties.setPropertyValue(s.names[0], wrong, s.child, true);
    expect(s.child.Count()).toBe(0);
    s.properties.setPropertyValue(s.names[1], good, s.child);
    const result = s.properties.getPropertyValue(s.names[1], s.child);
    try {
      expect(scalar(result, "bool")).toBe(false);
    } finally {
      result.dispose();
    }
    s.properties.setPropertyValue(missing, good, s.child, true);
    for (const action of [
      /** Named read must reject unknown names. @returns Owned result if unexpectedly admitted. */ () =>
        s.properties.getPropertyValue(missing, s.child),
      /** Named write must reject unknown names. @returns Nothing. */ () =>
        s.properties.setPropertyValue(missing, good, s.child),
      /** Named state must reject unknown names. @returns State if unexpectedly admitted. */ () =>
        s.properties.getPropertyState(missing, s.child),
      /** Original named state also rejects declared zero Which. @returns State if unexpectedly admitted. */ () =>
        s.properties.getPropertyState(s.names[4], s.child),
    ]) {
      try {
        action();
        throw new Error("Expected native unknown property");
      } catch (error) {
        if (!(error instanceof UnknownPropertyException)) throw error;
        error.dispose();
      }
    }
    // A declared property without any source item is an original silent setter no-op.
    const count = s.child.Count();
    s.properties.setPropertyValue(s.names[3], good, s.child);
    expect(s.child.Count()).toBe(count);
    s.child.DisableItem(RES_PARATR_SPLIT);
    expect(s.properties.getPropertyState(s.names[1], s.child)).toBe(PropertyState.AMBIGUOUS_VALUE);
  } finally {
    missing.dispose();
    good.dispose();
    wrong.dispose();
    s.dispose();
  }
});

it("keeps source MAYBEVOID output preservation and enum normalization, including missing/invalid states", /** The original out-parameter overload may retain/convert an earlier caller value. @returns Nothing. */ () => {
  const s = session(),
    output = new Any([BreakType.PAGE_BEFORE], "sal_Int32");
  const narrow = new SfxItemSet(s.pool, [[RES_PARATR_TABSTOP, RES_PARATR_TABSTOP]]);
  try {
    SfxItemPropertySet.getPropertyValue(s.entries[2], narrow, output);
    expect(output.getValueTypeClass()).toBe(TypeClass.ENUM);
    const value: [number] = [0];
    expect(output.extract(value, breakType)).toBe(true);
    expect(value[0]).toBe(BreakType.PAGE_BEFORE);
    const empty = s.properties.getPropertyValue(s.names[3], s.child);
    try {
      expect(empty.hasValue()).toBe(false);
    } finally {
      empty.dispose();
    }
    const actual = s.properties.getPropertyValue(s.names[2], s.child);
    try {
      expect(actual.getValueTypeClass()).toBe(TypeClass.ENUM);
    } finally {
      actual.dispose();
    }
    s.child.InvalidateItem(RES_BREAK);
    expect(s.properties.getPropertyState(s.names[2], s.child)).toBe(PropertyState.AMBIGUOUS_VALUE);
    const invalid = s.properties.getPropertyValue(s.names[2], s.child);
    try {
      expect(invalid.hasValue()).toBe(false);
    } finally {
      invalid.dispose();
    }
    const strict = new Entry(s.names[3], 5000, UnoType.get("sal_Int32"), 0, 0);
    try {
      try {
        SfxItemPropertySet.getPropertyValue(strict, s.child, output);
        throw new Error("Expected native runtime error");
      } catch (error) {
        if (!(error instanceof RuntimeException)) throw error;
        try {
          expect(text(error.Message)).toBe("Property not found in ItemSet but not MAYBEVOID?");
        } finally {
          error.dispose();
        }
      }
    } finally {
      strict.dispose();
    }
  } finally {
    narrow.Dispose();
    output.dispose();
    s.dispose();
  }
});

it("writes GetItemState's pointer only for SET and consumes the owned Put overload without cloning", /** Uses actual registered Writer values and public item reference counts. @returns Nothing. */ () => {
  const s = session(),
    item = new SfxBoolItem(RES_PARATR_SPLIT, false),
    output: [SfxPoolItem | null] = [null];
  try {
    const stored = s.parent.Put(item, true);
    expect(stored).toBe(item);
    expect(item.GetRefCount()).toBe(1);
    expect(s.child.GetItemState(RES_PARATR_SPLIT, true, output)).toBe(SfxItemState.SET);
    expect(output[0]).toBe(item);
    expect(s.child.GetItemState(RES_PARATR_TABSTOP, false, output)).toBe(SfxItemState.DEFAULT);
    expect(output[0]).toBe(item);
    s.child.InvalidateItem(RES_PARATR_SPLIT);
    expect(s.child.GetItemState(RES_PARATR_SPLIT, true, output)).toBe(SfxItemState.INVALID);
    expect(output[0]).toBe(item);
    s.child.DisableItem(RES_PARATR_SPLIT);
    expect(s.child.GetItemState(RES_PARATR_SPLIT, true, output)).toBe(SfxItemState.DISABLED);
    expect(output[0]).toBe(item);
    const equal = new SfxBoolItem(RES_PARATR_SPLIT, false);
    expect(s.parent.Put(equal, true)).toBeUndefined();
    const outside = s.pool.GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP).Clone() as SvxTabStopItem,
      empty = new SfxItemSet(s.pool, []);
    try {
      expect(empty.Put(outside, true)).toBeUndefined();
    } finally {
      empty.Dispose();
    }
  } finally {
    s.dispose();
  }
});

import { DomainMapper } from "../../../sw/source/writerfilter/dmapper/DomainMapper";
import { SourceDocumentType } from "../../../sw/source/writerfilter/inc/dmapper/DomainMapperFactory";
import { SwXTextDocument } from "../../../sw/source/uibase/uno/unotxdoc";
it("applies the actual OOXML settings tab distance through native item/set/document-default APIs", /** This proves the kernel prerequisite, not unported SwXTextDefaults/filter/UI dispatch. @returns Nothing. */ () => {
  const s = session(),
    model = new SwXTextDocument(s.doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  const distance = new Any([mapper.impl.GetSettingsTable().GetDefaultTabStop()], "sal_Int32");
  try {
    s.properties.setPropertyValue(s.names[0], distance, s.child);
    s.doc.SetDefault(s.child);
    const effective = s.properties.getPropertyValue(s.names[0], s.parent);
    try {
      expect(scalar(effective, "sal_Int32")).toBe(1270);
    } finally {
      effective.dispose();
    }
  } finally {
    distance.dispose();
    mapper.dispose();
    model.dispose();
    s.dispose();
  }
});
