/** @fileoverview Native stylesheet property owners, generated interop value copies, inherited property precedence and conditional-table style masks/border asymmetries. */
import { expect, it } from "vitest";
import {
  StyleSheetEntry as Entry,
  TableStyleSheetEntry as TableEntry,
  StyleSheetTable as Table,
  StyleType,
} from "./StyleSheetTable";
import { PropertyMap, StyleSheetPropertyMap } from "./PropertyMap";
import { TblStyleType as S } from "./TblStylePrHandler";
import { PropertyIds as P } from "./PropertyIds";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2 as borderType,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { BorderLineStyle as LineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { readNumberingProperty } from "../../core/unocore/unosett-properties";

/** Stores one native numeric Any. @param map - Actual map. @param id - ID. @param value - Signed32 value. @returns Nothing. */
function insert(map: PropertyMap, id: P, value: number): void {
  const any = new Any([value], "sal_Int32");
  try {
    map.Insert(id, any);
  } finally {
    any.dispose();
  }
}
/** Reads one retained numeric value. @param map - Actual map. @param id - ID. @returns Scalar or absent. */
function number(map: PropertyMap, id: P): number | undefined {
  const value = map.getProperty(id);
  if (!value) return undefined;
  try {
    return value[1].get("sal_Int32");
  } finally {
    value[1].dispose();
  }
}
/** Inserts an actual typed native border rather than a placeholder property payload. @param map - Map. @param id - Border ID. @param width - Native mm100 width. @returns Nothing. */
function border(map: PropertyMap, id: P, width: number): void {
  const any = new Any(new BorderLine2(0x112233, 0, width, 0, LineStyle.SOLID, width), borderType);
  try {
    map.Insert(id, any);
  } finally {
    any.dispose();
  }
}
/** Extracts the original typed border. @param map - Map. @param id - Border. @returns Width or absent. */
function borderWidth(map: PropertyMap, id: P): number | undefined {
  const property = map.getProperty(id);
  if (!property) return undefined;
  try {
    const value = new BorderLine2();
    expect(property[1].extract(value, borderType)).toBe(true);
    return value.LineWidth;
  } finally {
    property[1].dispose();
  }
}
/** Original generated member destruction for caller-owned values. @param value - Value. @returns Nothing. */
function release(value: PropertyValue): void {
  value.Name.dispose();
  value.Value.dispose();
}

it("owns the native stylesheet map and copies only the fields selected by the table-entry conversion constructor", /** Does not clone already accumulated properties or bags into a converted table style. @returns Nothing. */ () => {
  const original = new Entry();
  expect(original.m_pProperties).toBeInstanceOf(StyleSheetPropertyMap);
  expect([
    original.m_bIsDefaultStyle,
    original.m_bAssignedAsChapterNumbering,
    original.m_bInvalidHeight,
    original.m_bHasUPE,
    original.m_bAutoRedefine,
    original.m_nStyleTypeCode,
  ]).toEqual([false, false, false, false, false, StyleType.Unknown]);
  original.m_sStyleIdentifierD = "id";
  original.m_sStyleName = "Table Name";
  original.m_sBaseStyleIdentifier = "base";
  original.m_sNextStyleIdentifier = "next";
  original.m_sLinkStyleIdentifier = "link";
  original.m_bIsDefaultStyle = true;
  original.m_bAssignedAsChapterNumbering = true;
  original.m_bInvalidHeight = true;
  original.m_bHasUPE = true;
  original.m_bAutoRedefine = true;
  original.m_sConvertedStyleName = "Converted";
  insert(original.m_pProperties, P.PROP_PARA_LEFT_MARGIN, 10);
  const value = new PropertyValue();
  original.AppendInteropGrabBag(value);
  release(value);
  const converted = new TableEntry(original);
  expect([
    converted.m_sStyleIdentifierD,
    converted.m_sStyleName,
    converted.m_sBaseStyleIdentifier,
    converted.m_sNextStyleIdentifier,
    converted.m_sLinkStyleIdentifier,
  ]).toEqual(["id", "Table Name", "base", "next", "link"]);
  expect([
    converted.m_bIsDefaultStyle,
    converted.m_bInvalidHeight,
    converted.m_bHasUPE,
    converted.m_nStyleTypeCode,
  ]).toEqual([true, true, true, StyleType.Table]);
  expect([
    converted.m_bAssignedAsChapterNumbering,
    converted.m_bAutoRedefine,
    converted.m_sConvertedStyleName,
  ]).toEqual([false, false, ""]);
  expect(converted.m_pProperties).not.toBe(original.m_pProperties);
  expect(converted.m_pProperties.GetPropertyIds()).toEqual([]);
  const bag = converted.GetInteropGrabBagSeq();
  expect(bag.getLength()).toBe(0);
  bag.dispose();
  expect(converted.m_aLatentStyles).toEqual([]);
  expect(converted.m_aLsdExceptions).toEqual([]);
  expect(converted.m_aStyleInteropProps).toEqual([]);
  converted.dispose();
  original.dispose();
});

it("copies ordered duplicate interop values into native sequences and preserves the Unicode style-ID wrapper", /** Generated Any/sequence members survive mutation and destruction of the input value. @returns Nothing. */ () => {
  const entry = new Entry(),
    value = new PropertyValue(),
    name = unicode("qFormat");
  entry.m_sStyleIdentifierD = "Style😀";
  value.Name = name;
  value.Value.insert([1], "sal_Int32");
  entry.AppendInteropGrabBag(value);
  value.Value.insert([2], "sal_Int32");
  entry.AppendInteropGrabBag(value);
  value.Value.clear();
  name.dispose();
  release(value);
  const sequence = entry.GetInteropGrabBagSeq(),
    first = readNumberingProperty(sequence, 0),
    second = readNumberingProperty(sequence, 1);
  expect(sequence.getLength()).toBe(2);
  expect([text(first.Name), text(second.Name)]).toEqual(["qFormat", "qFormat"]);
  expect([first.Value.get("sal_Int32"), second.Value.get("sal_Int32")]).toEqual([1, 2]);
  const wrapped = entry.GetInteropGrabBag();
  expect(text(wrapped.Name)).toBe("Style😀");
  const borrowed = entry.GetInteropGrabBagSeq();
  expect(wrapped.Value.hasValue()).toBe(true);
  borrowed.dispose();
  entry.dispose();
  expect(first.Value.get("sal_Int32")).toBe(1);
  expect(second.Value.get("sal_Int32")).toBe(2);
  release(first);
  release(second);
  sequence.dispose();
  release(wrapped);
});

it("merges original imported parent properties without converting them to pooled styles and retains direct self/missing-parent guards", /** Actual source-order table identities provide inheritance and fresh result ownership. @returns Nothing. */ () => {
  const table = new Table(),
    root = new Entry(),
    middle = new Entry(),
    leaf = new Entry();
  for (const [entry, id, parent] of [
    [root, "root", ""],
    [middle, "middle", "root"],
    [leaf, "leaf", "middle"],
  ] as const) {
    entry.m_sStyleIdentifierD = id;
    entry.m_sStyleName = id;
    entry.m_sBaseStyleIdentifier = parent;
    table.AppendEntry(entry);
  }
  insert(root.m_pProperties, P.PROP_PARA_LEFT_MARGIN, 10);
  insert(root.m_pProperties, P.PROP_PARA_RIGHT_MARGIN, 20);
  insert(middle.m_pProperties, P.PROP_PARA_LEFT_MARGIN, 30);
  insert(leaf.m_pProperties, P.PROP_PARA_TOP_MARGIN, 40);
  const inherited = leaf.GetMergedInheritedProperties(table);
  expect([
    number(inherited, P.PROP_PARA_LEFT_MARGIN),
    number(inherited, P.PROP_PARA_RIGHT_MARGIN),
    number(inherited, P.PROP_PARA_TOP_MARGIN),
  ]).toEqual([30, 20, 40]);
  expect(inherited).not.toBe(leaf.m_pProperties);
  expect(inherited).not.toBeInstanceOf(StyleSheetPropertyMap);
  insert(inherited, P.PROP_PARA_RIGHT_MARGIN, 99);
  expect(number(root.m_pProperties, P.PROP_PARA_RIGHT_MARGIN)).toBe(20);
  leaf.m_sBaseStyleIdentifier = "missing";
  const missing = leaf.GetMergedInheritedProperties(table);
  expect(missing.GetPropertyIds()).toEqual([P.PROP_PARA_TOP_MARGIN]);
  leaf.m_sBaseStyleIdentifier = "leaf";
  const self = leaf.GetMergedInheritedProperties(table);
  expect(self.GetPropertyIds()).toEqual([P.PROP_PARA_TOP_MARGIN]);
  leaf.m_sBaseStyleIdentifier = "root";
  const noTable = leaf.GetMergedInheritedProperties(null);
  expect(noTable.GetPropertyIds()).toEqual([P.PROP_PARA_TOP_MARGIN]);
  inherited.dispose();
  missing.dispose();
  self.dispose();
  noTable.dispose();
  table.dispose();
});

it("uses the native conditional masks and their precedence while excluding the base map and unmasked whole-table bucket", /** Literal masks and scalar conflicts make the source ordering observable. @returns Nothing. */ () => {
  const source = new Entry(),
    entry = new TableEntry(source),
    owners: PropertyMap[] = [];
  insert(entry.m_pProperties, P.PROP_PARA_RIGHT_MARGIN, 999);
  const whole = new PropertyMap();
  insert(whole, P.PROP_PARA_RIGHT_MARGIN, 888);
  entry.AddTblStylePr(S.WholeTable, whole);
  owners.push(whole);
  const cases: readonly (readonly [number, S, number])[] = [
    [0x010, S.Band2Horz, 109],
    [0x020, S.Band1Horz, 108],
    [0x040, S.Band2Vert, 107],
    [0x080, S.Band1Vert, 106],
    [0x100, S.LastCol, 105],
    [0x200, S.FirstCol, 104],
    [0x400, S.LastRow, 103],
    [0x800, S.FirstRow, 102],
    [0x001, S.SWCell, 113],
    [0x002, S.SECell, 112],
    [0x004, S.NWCell, 111],
    [0x008, S.NECell, 110],
  ];
  expect(entry.Has(0xffff)).toBe(false);
  for (const [mask, type, expected] of cases) {
    const map = new PropertyMap();
    insert(map, P.PROP_PARA_LEFT_MARGIN, expected);
    owners.push(map);
    entry.AddTblStylePr(type, map);
    const selected = entry.GetProperties(mask);
    expect(number(selected, P.PROP_PARA_LEFT_MARGIN)).toBe(expected);
    expect(number(selected, P.PROP_PARA_RIGHT_MARGIN)).toBeUndefined();
    selected.dispose();
  }
  for (const [mask, expected] of [
    [0xfff, 110],
    [0x030, 108],
    [0x0c0, 106],
    [0x300, 104],
    [0xc00, 102],
    [0x003, 112],
    [0x00c, 110],
    [0x811, 113],
    [0x808, 110],
  ] as const) {
    const merged = entry.GetProperties(mask);
    expect(number(merged, P.PROP_PARA_LEFT_MARGIN)).toBe(expected);
    expect(entry.Has(mask)).toBe(true);
    merged.dispose();
  }
  expect(entry.Has(0)).toBe(false);
  expect(entry.Has(0x1000)).toBe(false);
  const replacement = new PropertyMap();
  insert(replacement, P.PROP_PARA_LEFT_MARGIN, 777);
  entry.AddTblStylePr(S.NECell, replacement);
  owners.push(replacement);
  const result = entry.GetProperties(0xfff);
  expect(number(result, P.PROP_PARA_LEFT_MARGIN)).toBe(777);
  result.dispose();
  entry.dispose();
  source.dispose();
  for (const owner of owners) owner.dispose();
});

it.each([
  [S.FirstRow, P.PROP_BOTTOM_BORDER, P.META_PROP_HORIZONTAL_BORDER],
  [S.LastRow, P.PROP_TOP_BORDER, P.META_PROP_HORIZONTAL_BORDER],
  [S.FirstCol, P.PROP_RIGHT_BORDER, P.META_PROP_VERTICAL_BORDER],
  [S.LastCol, P.PROP_LEFT_BORDER, P.META_PROP_VERTICAL_BORDER],
] as const)(
  "erases the native inside-border conflict from supplied edge style %s",
  /** Insertion changes the actual shared input map before retaining it. @param type - Conditional type. @param edge - Checked border. @param inside - Removed border. @returns Nothing. */ (
    type,
    edge,
    inside,
  ) => {
    const source = new Entry(),
      entry = new TableEntry(source),
      properties = new PropertyMap();
    border(properties, edge, 254);
    border(properties, inside, 127);
    entry.AddTblStylePr(type, properties);
    expect(borderWidth(properties, inside)).toBeUndefined();
    expect(borderWidth(properties, edge)).toBe(254);
    const band = new PropertyMap();
    border(band, inside, 127);
    entry.AddTblStylePr(S.Band1Horz, band);
    const merged = entry.GetProperties(0xf20);
    expect(borderWidth(merged, edge)).toBe(254);
    expect(borderWidth(merged, inside)).toBe(
      type === S.FirstRow || type === S.LastRow ? undefined : 127,
    );
    merged.dispose();
    entry.dispose();
    source.dispose();
    properties.dispose();
    band.dispose();
  },
);

it("preserves the native insertion/merge column-border asymmetry instead of normalizing opposite edges", /** Real typed border values expose the source's different FirstCol checks. @returns Nothing. */ () => {
  const source = new Entry(),
    entry = new TableEntry(source),
    band = new PropertyMap(),
    right = new PropertyMap(),
    left = new PropertyMap(),
    unrelated = new PropertyMap();
  border(band, P.META_PROP_VERTICAL_BORDER, 127);
  entry.AddTblStylePr(S.Band1Horz, band);
  border(right, P.PROP_RIGHT_BORDER, 254);
  entry.AddTblStylePr(S.FirstCol, right);
  const rightResult = entry.GetProperties(0x220);
  expect(borderWidth(rightResult, P.META_PROP_VERTICAL_BORDER)).toBe(127);
  expect(borderWidth(rightResult, P.PROP_RIGHT_BORDER)).toBe(254);
  border(left, P.PROP_LEFT_BORDER, 381);
  entry.AddTblStylePr(S.FirstCol, left);
  const leftResult = entry.GetProperties(0x220);
  expect(borderWidth(leftResult, P.META_PROP_VERTICAL_BORDER)).toBeUndefined();
  expect(borderWidth(leftResult, P.PROP_LEFT_BORDER)).toBe(381);
  entry.AddTblStylePr(S.FirstRow, unrelated);
  expect(unrelated.GetPropertyIds()).toEqual([]);
  const rowResult = entry.GetProperties(0xa20);
  expect(borderWidth(rowResult, P.PROP_LEFT_BORDER)).toBe(381);
  rightResult.dispose();
  leftResult.dispose();
  rowResult.dispose();
  entry.dispose();
  source.dispose();
  for (const owner of [band, right, left, unrelated]) owner.dispose();
});
