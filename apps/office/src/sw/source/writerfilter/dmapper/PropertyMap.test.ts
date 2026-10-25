/** @fileoverview Native PropertyMap contracts and actual Writer API consumers: ordering, owned values, doc-default flags, interop sequences and cache behavior. */
import { expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { PropertyMap, PropValue, GrabBagType as G } from "./PropertyMap";
import {
  PropertyIds as P,
  getPropertyName,
  isCharacterProperty,
  isParagraphProperty,
} from "./PropertyIds";
import { text, unicode, stringAny } from "../../core/unocore/unocrsrhelper";
import { readNumberingProperty } from "../../core/unocore/unosett-properties";
import { createWriterDocument } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";

const Values = Sequence.specialize<PropertyValue>(propertyType, 48);
const valuesType = ["Sequence", propertyType] as const;

/** Inserts an owned temporary scalar. @param map - Map. @param id - ID. @param value - Number. @param overwrite - Mode. @param grab - Bag. @param docDefault - Marker. @returns Nothing. */
function insert(
  map: PropertyMap,
  id: P,
  value: number,
  overwrite = true,
  grab = G.NO_GRAB_BAG,
  docDefault = false,
): void {
  const any = new Any([value], "sal_Int32");
  try {
    map.Insert(id, any, overwrite, grab, docDefault);
  } finally {
    any.dispose();
  }
}
/** Extracts one native numeric Any without broad JS conversion. @param any - Borrowed value. @returns Number. */
function number(any: Any): number {
  const out: [number] = [0];
  expect(any.extract(out, "sal_Int32")).toBe(true);
  return out[0];
}
/** Returns a copied map value and releases its owned Any. @param map - Map. @param id - ID. @returns Number or undefined. */
function value(map: PropertyMap, id: P): number | undefined {
  const pair = map.getProperty(id);
  if (!pair) return undefined;
  try {
    return number(pair[1]);
  } finally {
    pair[1].dispose();
  }
}
/** Reads a real typed nested sequence, returning owned PropertyValue copies. @param any - Borrowed Any. @returns Owned values. */
function unpack(any: Any): PropertyValue[] {
  const seq = new Values();
  try {
    expect(any.extract(seq.getAddress(), valuesType)).toBe(true);
    const result: PropertyValue[] = [];
    for (let i = 0; i < seq.getLength(); ++i) result.push(readNumberingProperty(seq, i));
    return result;
  } finally {
    seq.dispose();
  }
}
/** Releases generated value fields. @param values - Owned values. @returns Nothing. */
function release(values: readonly PropertyValue[]): void {
  for (const v of values) {
    v.Name.dispose();
    v.Value.dispose();
  }
}

const nativeProperties =
  "../../vendor/libreoffice-reference/sw/source/writerfilter/dmapper/PropertyIds";
it.skipIf(!existsSync(nativeProperties + ".hxx"))(
  "matches every property enum identity and UNO name against the pinned native declarations",
  /** Verifies generated numeric and string tables independently of their local copies. @returns Nothing. */ () => {
    const header = readFileSync(nativeProperties + ".hxx", "utf8"),
      source = readFileSync(nativeProperties + ".cxx", "utf8");
    const start = header.indexOf("enum PropertyIds"),
      end = header.indexOf("};", start);
    const entries = header
      .slice(start, end)
      .replace(/\/\/[^\n]*/g, "")
      .matchAll(/(?:\{|,)\s*(\w+)\s*(?:=\s*(\w+))?/g);
    const ids = new Map<string, number>();
    let next = 0;
    for (const entry of entries) {
      const name = entry[1] as string,
        assigned = entry[2];
      if (assigned !== undefined)
        next = /^\d+$/.test(assigned) ? Number(assigned) : (ids.get(assigned) as number);
      expect((P as unknown as Record<string, number>)[name], name).toBe(next);
      ids.set(name, next++);
    }
    expect(ids.size).toBe(385);
    const bindings = [...source.matchAll(/\{\s*(\w+),\s*u"([^"]*)"_ustr\s*\}/g)];
    expect(bindings).toHaveLength(382);
    for (const binding of bindings)
      expect(text(getPropertyName(ids.get(binding[1] as string) as P)), binding[1]).toBe(
        binding[2],
      );
  },
);

it("retains original property IDs, static names and exact classification boundaries", /** Checks the original enum intervals and name ownership. @returns Nothing. */ () => {
  expect(P.INVALID).toBe(0);
  expect(P.META_PROP_CELL_MAR_BOTTOM).toBe(P.PROP_ID_START);
  expect(text(getPropertyName(P.PROP_CHAR_WEIGHT))).toBe("CharWeight");
  expect(getPropertyName(P.PROP_CHAR_WEIGHT)).toBe(getPropertyName(P.PROP_CHAR_WEIGHT));
  expect(text(getPropertyName(-1 as P))).toBe("");
  expect(isCharacterProperty(P.PROP_CHARACTER_STYLES)).toBe(false);
  expect(isCharacterProperty(P.PROP_CHAR_WEIGHT)).toBe(true);
  expect(isCharacterProperty(P.PROP_CHARACTER_END)).toBe(false);
  expect(isParagraphProperty(P.PROP_PARA_ADJUST)).toBe(true);
  expect(isParagraphProperty(P.PROP_PARA_WIDOWS)).toBe(true);
  expect(isParagraphProperty(P.PROP_FILL_COLOR)).toBe(true);
  expect(isParagraphProperty(P.PROP_FILL_COMPLEX_COLOR)).toBe(true);
  expect(isParagraphProperty(P.PROP_CHAR_WEIGHT)).toBe(false);
});

it("owns copied values, preserves numeric order, safe erasure and original default-marker overwrite behavior", /** Tests the source API with caller values released immediately. @returns Nothing. */ () => {
  const p = new PropValue();
  expect(p.getValue().hasValue()).toBe(false);
  expect(p.getGrabBagType()).toBe(G.NO_GRAB_BAG);
  expect(p.getIsDocDefault()).toBe(false);
  p.dispose();
  const m = new PropertyMap();
  expect(m.GetPropertyValues()).toEqual([]);
  expect(m.getProperty(P.PROP_CHAR_COLOR)).toBeUndefined();
  expect(m.isDocDefault(P.PROP_CHAR_COLOR)).toBe(false);
  insert(m, P.PROP_PARA_TOP_MARGIN, 100, false, G.NO_GRAB_BAG, true);
  insert(m, P.PROP_CHAR_WEIGHT, 150, true, G.NO_GRAB_BAG, true);
  expect(m.isDocDefault(P.PROP_CHAR_WEIGHT)).toBe(false);
  expect(m.isDocDefault(P.PROP_PARA_TOP_MARGIN)).toBe(true);
  insert(m, P.PROP_PARA_TOP_MARGIN, 999, false);
  expect(value(m, P.PROP_PARA_TOP_MARGIN)).toBe(100);
  expect(m.GetPropertyIds()).toEqual(
    [P.PROP_CHAR_WEIGHT, P.PROP_PARA_TOP_MARGIN].sort(
      /** Numeric original enum order. @param a - ID. @param b - ID. @returns Comparison. */ (
        a,
        b,
      ) => a - b,
    ),
  );
  const copy = m.getProperty(P.PROP_CHAR_WEIGHT) as readonly [P, Any];
  copy[1].clear();
  copy[1].dispose();
  expect(value(m, P.PROP_CHAR_WEIGHT)).toBe(150);
  insert(m, P.PROP_CHAR_WEIGHT, 100);
  expect(value(m, P.PROP_CHAR_WEIGHT)).toBe(100);
  m.Erase(P.PROP_CHAR_WEIGHT);
  m.Erase(P.PROP_CHAR_COLOR);
  expect(m.isSet(P.PROP_CHAR_WEIGHT)).toBe(false);
  m.dispose();
});

it("publishes style and numbering properties first and applies the resulting vector through the actual text API", /** Proves hard paragraph and run formatting survive style application. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    body = new SwXTextDocument(doc).getText(),
    map = new PropertyMap();
  const style = stringAny("Standard"),
    weight = new Any([150], "float");
  try {
    map.Insert(P.PROP_PARA_STYLE_NAME, style);
    map.Insert(P.PROP_CHAR_WEIGHT, weight);
  } finally {
    style.dispose();
    weight.dispose();
  }
  insert(map, P.PROP_PARA_LEFT_MARGIN, 2540);
  const properties = map.GetPropertyValues();
  expect(text((properties[0] as PropertyValue).Name)).toBe("ParaStyleName");
  expect(
    properties.every(
      /** Validates native generated metadata. @param p - Property. @returns Admission. */ (p) =>
        p.Handle === 0 && p.State === PropertyState.DIRECT_VALUE,
    ),
  ).toBe(true);
  const string = unicode("Native"),
    portion = body.appendTextPortion(string, properties);
  string.dispose();
  const paragraph = body.finishParagraph(properties);
  paragraph.Release();
  portion.dispose();
  expect(doc.paragraphs[0]?.GetText()).toBe("Native");
  expect(doc.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(1440);
  const cloned = map.GetPropertyValues();
  expect(cloned).toBe(properties);
  map.dispose();
});

it("merges native inherited defaults with source flags and calls the original derived-map hook", /** Covers both merge modes and independent value ownership. @returns Nothing. */ () => {
  /** Observes the actual original extension hook. */
  class TableMap extends PropertyMap {
    calls: boolean[] = [];
    /** Records exact merge mode. @param source - Original map. @param overwrite - Mode. @returns Nothing. */ override insertTableProperties(
      source: PropertyMap,
      overwrite = true,
    ): void {
      void source;
      this.calls.push(overwrite);
    }
  }
  const source = new PropertyMap(),
    dest = new TableMap();
  insert(source, P.PROP_CHAR_COLOR, 10, false, G.NO_GRAB_BAG, false);
  insert(source, P.PROP_CHAR_HEIGHT, 20, false, G.NO_GRAB_BAG, true);
  insert(dest, P.PROP_CHAR_COLOR, 99);
  dest.InsertProps(null);
  expect(dest.calls).toEqual([]);
  dest.InsertProps(source, false);
  expect(value(dest, P.PROP_CHAR_COLOR)).toBe(99);
  expect(value(dest, P.PROP_CHAR_HEIGHT)).toBe(20);
  expect(dest.isDocDefault(P.PROP_CHAR_HEIGHT)).toBe(true);
  dest.Erase(P.PROP_CHAR_COLOR);
  dest.InsertProps(source, false);
  expect(dest.isDocDefault(P.PROP_CHAR_COLOR)).toBe(true);
  dest.InsertProps(source);
  expect(dest.isDocDefault(P.PROP_CHAR_COLOR)).toBe(false);
  source.dispose();
  expect(value(dest, P.PROP_CHAR_COLOR)).toBe(10);
  expect(dest.calls).toEqual([false, false, true]);
  dest.dispose();
  const base = new PropertyMap(),
    empty = new PropertyMap();
  base.InsertProps(empty);
  base.insertTableProperties(empty);
  base.dispose();
  empty.dispose();
});

it("preserves all four typed interop bags and original special-property ordering", /** Exercises actual generated Sequence<PropertyValue> transport. @returns Nothing. */ () => {
  const m = new PropertyMap();
  insert(m, P.PROP_CHAR_STYLE_NAME, 1);
  insert(m, P.PROP_NUMBERING_RULES, 2);
  insert(m, P.PROP_CHAR_COLOR, 3, true, G.CHAR_GRAB_BAG);
  insert(m, P.PROP_PARA_TOP_MARGIN, 4, true, G.PARA_GRAB_BAG);
  insert(m, P.PROP_LEFT_BORDER_DISTANCE, 5, true, G.CELL_GRAB_BAG);
  insert(m, P.PROP_IS_SPLIT_ALLOWED, 6, true, G.ROW_GRAB_BAG);
  const values = m.GetPropertyValues();
  expect(
    values.map(
      /** Reads original property names. @param p - Value. @returns Name. */ (p) => text(p.Name),
    ),
  ).toEqual([
    "CharStyleName",
    "NumberingRules",
    "CharInteropGrabBag",
    "ParaInteropGrabBag",
    "CellInteropGrabBag",
    "RowInteropGrabBag",
  ]);
  for (let i = 2; i < values.length; ++i) {
    const bag = unpack((values[i] as PropertyValue).Value);
    try {
      expect(bag).toHaveLength(1);
      expect(number((bag[0] as PropertyValue).Value)).toBe(i + 1);
    } finally {
      release(bag);
    }
  }
  m.dispose();
});

it("flattens the native cell interop sequence preserving generated member fields and ignores failed extraction", /** Covers original sequence copies rather than a JSON substitute. @returns Nothing. */ () => {
  const key = unicode("SourceCell"),
    any = new Any([7], "sal_Int32"),
    property = new PropertyValue(key, 42, any, PropertyState.DEFAULT_VALUE);
  key.dispose();
  any.dispose();
  const sequence = new Values(
      { /** Borrows actual generated source fields. @returns Property. */ get: () => property },
      1,
    ),
    packed = new Any(sequence.getAddress(), valuesType),
    m = new PropertyMap();
  try {
    m.Insert(P.PROP_CELL_INTEROP_GRAB_BAG, packed);
  } finally {
    packed.dispose();
    sequence.dispose();
    release([property]);
  }
  const bag = unpack((m.GetPropertyValues()[0] as PropertyValue).Value);
  try {
    expect(text((bag[0] as PropertyValue).Name)).toBe("SourceCell");
    expect((bag[0] as PropertyValue).Handle).toBe(42);
    expect((bag[0] as PropertyValue).State).toBe(PropertyState.DEFAULT_VALUE);
    expect(number((bag[0] as PropertyValue).Value)).toBe(7);
  } finally {
    release(bag);
  }
  insert(m, P.PROP_CELL_INTEROP_GRAB_BAG, 2);
  expect(m.GetPropertyValues()).toEqual([]);
  m.dispose();
});

it("retains source first-call char-grab cache behavior until invalidation", /** Documents the observable upstream cache contract. @returns Nothing. */ () => {
  const m = new PropertyMap();
  insert(m, P.PROP_CHAR_COLOR, 1, true, G.CHAR_GRAB_BAG);
  insert(m, P.PROP_CHAR_WEIGHT, 2);
  expect(
    m
      .GetPropertyValues(false)
      .map(/** Reads names. @param p - Value. @returns Name. */ (p) => text(p.Name)),
  ).toEqual(["CharWeight"]);
  expect(m.GetPropertyValues(true)).toHaveLength(1);
  m.Erase(P.PROP_PARA_TOP_MARGIN);
  expect(m.GetPropertyValues(true)).toHaveLength(2);
  expect(m.GetPropertyValues(false)).toHaveLength(2);
  m.dispose();
  const only = new PropertyMap();
  insert(only, P.PROP_CHAR_COLOR, 1, true, G.CHAR_GRAB_BAG);
  expect(only.GetPropertyValues(false)).toEqual([]);
  expect(only.GetPropertyValues()).toHaveLength(1);
  only.dispose();
});
