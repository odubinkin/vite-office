/** @fileoverview Original polymorphic field/URL/page/table values and real pooled text-attribute copies from flditem.cxx. */
import { expect, it } from "vitest";
import {
  SvxFieldData,
  SvxFieldItem,
  SvxURLField,
  SvxURLFormat,
  SvxPageField,
  SvxPagesField,
  SvxPageTitleField,
  SvxTimeField,
  SvxFileField,
  SvxTableField,
  type SvxFieldDataConstReference,
  type SvxURLFieldConstReference,
} from "../../inc/flditem";
import * as FieldType from "../../../offapi/com/sun/star/text/textfield/Type";
import { EE_FEATURE_FIELD } from "../../inc/eeitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SfxPoolItem } from "../../../svl/inc/poolitem";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxItemPool } from "../../../svl/inc/itempool";
import { SfxItemSet, SfxPoolItemHolder } from "../../../svl/inc/itemset";
import { ContentInfo, XEditAttribute } from "../editeng/editobj2";
/** Builds an actual Unicode string with all logical code units. @param text - Input. @returns Native value. */
function unicode(text: string): OUString {
  const units = Uint16Array.from(
    { length: text.length },
    /** Reads one UTF16 unit. @param _ - Unused value. @param index - Unit position. @returns Unit. */ (
      _,
      index,
    ) => text.charCodeAt(index),
  );
  return new OUString(units, units.length);
}
/** Reads the actual const URL field of a genuine native pooled item. @param item - Pooled field. @returns Real URL field view. */
function urlOf(item: SvxFieldItem): SvxURLFieldConstReference {
  return item.GetField() as SvxURLFieldConstReference;
}
it("declares all original field IDs and preserves empty base value/copy/assignment behavior", /** Opaque RTTI hash values are tested by contract rather than native compiler-specific bits. @returns Nothing. */ () => {
  expect(FieldType).toMatchObject({
    UNSPECIFIED: -1,
    DATE: 0,
    URL: 1,
    PAGE: 2,
    PAGES: 3,
    TIME: 4,
    TABLE: 5,
    EXTENDED_TIME: 6,
    EXTENDED_FILE: 7,
    AUTHOR: 8,
    MEASURE: 9,
    DOCINFO_TITLE: 10,
    PRESENTATION_HEADER: 11,
    PRESENTATION_FOOTER: 12,
    PRESENTATION_DATE_TIME: 13,
    PAGE_NAME: 14,
    DOCINFO_CUSTOM: 15,
  });
  expect(Object.keys(FieldType)).toHaveLength(17);
  const base = new SvxFieldData(),
    copy = new SvxFieldData(base),
    clone = base.Clone() as SvxFieldData,
    url = new SvxURLField();
  expect(base.GetClassId()).toBe(-1);
  expect(copy).not.toBe(base);
  expect(clone).not.toBe(base);
  expect(clone.constructor).toBe(SvxFieldData);
  expect(base.assign(copy)).toBe(base);
  expect(base.assign(base)).toBe(base);
  expect(base.equals(copy)).toBe(true);
  expect(base.equals(url)).toBe(true);
  expect(base.hashCode()).toBe(copy.hashCode());
  expect(base.hashCode()).toBe(clone.hashCode());
  const sliced = SvxFieldData.prototype.Clone.call(url) as SvxFieldData;
  expect(sliced.constructor).toBe(SvxFieldData);
  expect(sliced.GetClassId()).toBe(-1);
});
it("retains complete URL defaults, stable Unicode views and source-independent copies", /** The borrowed member identity survives assignment; input and returned copies do not reset their source. @returns Nothing. */ () => {
  expect([SvxURLFormat.AppDefault, SvxURLFormat.Url, SvxURLFormat.Repr]).toEqual([0, 1, 2]);
  const a = new SvxURLField(),
    url = a.GetURL(),
    representation = a.GetRepresentation(),
    name = a.GetName(),
    target = a.GetTargetFrame();
  expect(a.GetClassId()).toBe(FieldType.URL);
  expect(a.GetFormat()).toBe(SvxURLFormat.Url);
  for (const text of [url, representation, name, target]) expect(text.getLength()).toBe(0);
  const input = unicode("https://example.invalid/a\0😀"),
    display = unicode("shown");
  a.SetURL(input);
  a.SetRepresentation(display);
  a.SetTargetFrame(unicode("frame"));
  a.SetName(unicode("name"));
  a.SetFormat(SvxURLFormat.Repr);
  expect(a.GetURL()).toBe(url);
  expect(a.GetRepresentation()).toBe(representation);
  expect(a.GetName()).toBe(name);
  expect(a.GetTargetFrame()).toBe(target);
  expect(url.equals(input)).toBe(true);
  input.assign(unicode("changed"));
  display.assign(unicode("changed"));
  expect(url.equals(unicode("https://example.invalid/a\0😀"))).toBe(true);
  expect(representation.equals(unicode("shown"))).toBe(true);
  const copy = new SvxURLField(a),
    clone = a.Clone(),
    assigned = new SvxURLField();
  assigned.assign(a);
  expect(assigned.assign(assigned)).toBe(assigned);
  for (const c of [copy, clone, assigned]) {
    expect(c.equals(a)).toBe(true);
    expect(c.GetName().equals(unicode("name"))).toBe(true);
    expect(c.GetURL()).not.toBe(url);
    expect(c.GetTargetFrame()).not.toBe(target);
    expect(c.hashCode()).toBe(a.hashCode());
  }
  a.SetURL(unicode("different"));
  a.SetRepresentation(unicode("different"));
  a.SetTargetFrame(unicode("different"));
  a.SetName(unicode("different"));
  a.SetFormat(SvxURLFormat.Url);
  expect(copy.GetURL().equals(unicode("https://example.invalid/a\0😀"))).toBe(true);
  expect(copy.GetRepresentation().equals(unicode("shown"))).toBe(true);
  expect(copy.GetTargetFrame().equals(unicode("frame"))).toBe(true);
  expect(copy.GetName().equals(unicode("name"))).toBe(true);
  const explicitDefault = new SvxURLField(unicode("a"), unicode("b")),
    explicitMode = new SvxURLField(unicode("a"), unicode("b"), SvxURLFormat.AppDefault);
  expect(explicitDefault.GetFormat()).toBe(SvxURLFormat.Url);
  expect(explicitMode.GetFormat()).toBe(SvxURLFormat.AppDefault);
  explicitMode.SetFormat(99 as SvxURLFormat);
  expect(explicitMode.GetFormat()).toBe(99);
});
it("preserves native URL equality/hash omissions and every compared value", /** Changing Name alone remains equal, even in the actual item-set change gate. @returns Nothing. */ () => {
  const a = new SvxURLField(unicode("a"), unicode("b")),
    b = new SvxURLField(a);
  a.SetTargetFrame(unicode("c"));
  b.SetTargetFrame(unicode("c"));
  expect(a.equals(new SvxFieldData())).toBe(false);
  expect(a.equals(b)).toBe(true);
  b.SetFormat(SvxURLFormat.Repr);
  expect(a.equals(b)).toBe(false);
  b.SetFormat(a.GetFormat());
  b.SetURL(unicode("different"));
  expect(a.equals(b)).toBe(false);
  b.SetURL(a.GetURL());
  b.SetRepresentation(unicode("different"));
  expect(a.equals(b)).toBe(false);
  b.SetRepresentation(a.GetRepresentation());
  b.SetTargetFrame(unicode("different"));
  expect(a.equals(b)).toBe(false);
  b.SetTargetFrame(a.GetTargetFrame());
  a.SetName(unicode("first"));
  b.SetName(unicode("second"));
  expect(a.equals(b)).toBe(true);
  expect(a.hashCode()).toBe(b.hashCode());
  expect(b.Clone().GetName().equals(unicode("second"))).toBe(true);
  const pool = new SfxItemPool(),
    set = new SfxItemSet(pool, [[EE_FEATURE_FIELD, EE_FEATURE_FIELD]]);
  set.Put(new SvxFieldItem(a, EE_FEATURE_FIELD));
  expect(set.Put(new SvxFieldItem(b, EE_FEATURE_FIELD))).toBeUndefined();
  expect(
    urlOf(set.Get(EE_FEATURE_FIELD) as SvxFieldItem)
      .GetName()
      .equals(unicode("first")),
  ).toBe(true);
});
it("distinguishes copy/adopt/null constructors and exact field-item equality paths", /** Adoption is only the erased unique_ptr constructor selector, without lifetime machinery. @returns Nothing. */ () => {
  const field = new SvxURLField(unicode("a"), unicode("shown")),
    copy = new SvxFieldItem(field, EE_FEATURE_FIELD),
    adopted = new SvxFieldItem(field, EE_FEATURE_FIELD, true),
    same = new SvxFieldItem(field, 1, true),
    cloned = copy.Clone(new SfxItemPool()),
    empty = new SvxFieldItem(null, EE_FEATURE_FIELD, true),
    emptyCopy = new SvxFieldItem(empty);
  expect(copy.GetField()).not.toBe(field);
  expect(adopted.GetField()).toBe(field);
  expect(adopted.GetField()).toBe(adopted.GetField());
  expect(adopted.equals(same)).toBe(true);
  expect(SfxPoolItem.areSame(adopted, same)).toBe(false);
  expect(cloned.Which()).toBe(EE_FEATURE_FIELD);
  expect(cloned.GetField()).not.toBe(copy.GetField());
  expect(cloned.GetField()).toBeInstanceOf(SvxURLField);
  expect(cloned.equals(copy)).toBe(true);
  expect(cloned.hashCode()).toBe(copy.hashCode());
  expect(empty.GetField()).toBeNull();
  expect(emptyCopy.GetField()).toBeNull();
  expect(empty.Clone().GetField()).toBeNull();
  expect(empty.hashCode()).toBe(0n);
  expect(empty.equals(emptyCopy)).toBe(true);
  expect(empty.equals(copy)).toBe(false);
  expect(copy.equals(empty)).toBe(false);
  expect(copy.equals(new SfxInt16Item(1))).toBe(false);
  expect(copy.equals(new SvxFieldItem(new SvxFieldData(), EE_FEATURE_FIELD))).toBe(false);
  field.SetURL(unicode("changed"));
  expect(adopted.equals(copy)).toBe(false);
  expect(urlOf(copy).GetURL().equals(unicode("a"))).toBe(true);
  expect(copy.supportsHashCode()).toBe(true);
  expect(copy.QueryValue()).toBeUndefined();
  expect(copy.PutValue({}, 0)).toBe(false);
});
it("copies actual page/time/title/table value families with native class IDs", /** Stateless fields compare by dynamic type and table values retain their independent integer. @returns Nothing. */ () => {
  const types: readonly [typeof SvxFieldData, number][] = [
    [SvxPageField, 2],
    [SvxPagesField, 3],
    [SvxPageTitleField, 14],
    [SvxTimeField, 4],
    [SvxFileField, 10],
  ];
  for (const [C, id] of types) {
    const field = new C(),
      copy = new C(field),
      clone = field.Clone() as SvxFieldData;
    expect(field.GetClassId()).toBe(id);
    expect(field.equals(copy)).toBe(true);
    expect(field.equals(clone)).toBe(true);
    expect(field.equals(new SvxFieldData())).toBe(false);
    expect(clone.constructor).toBe(C);
    expect(clone).not.toBe(field);
    expect(clone.hashCode()).toBe(field.hashCode());
    const item = new SvxFieldItem(field, EE_FEATURE_FIELD);
    expect(item.GetField()?.GetClassId()).toBe(id);
    expect(item.Clone().equals(item)).toBe(true);
  }
  expect(SvxPageField.CLASS_ID).toBe(FieldType.UNSPECIFIED);
  const a = new SvxTableField(),
    b = new SvxTableField(7),
    copy = new SvxTableField(b);
  expect(a.GetClassId()).toBe(5);
  expect(a.GetTab()).toBe(0);
  expect(copy.GetTab()).toBe(7);
  expect(copy.equals(b)).toBe(true);
  expect(copy.equals(a)).toBe(false);
  expect(copy.equals(new SvxFieldData())).toBe(false);
  a.SetTab(7);
  expect(a.equals(b)).toBe(true);
  a.SetTab(4294967295);
  expect(a.GetTab()).toBe(-1);
  expect(copy.GetTab()).toBe(7);
  expect(a.Clone().GetTab()).toBe(-1);
  a.assign(b);
  expect(a.GetTab()).toBe(7);
  expect(a.assign(a)).toBe(a);
  b.SetTab(8);
  expect(a.GetTab()).toBe(7);
  expect(a.hashCode()).toBe(b.hashCode());
});
it("retains nonempty field features through actual holder, attribute and paragraph copies", /** Real shared owners are exercised without creating a fake EditEngine item pool or text-object factory. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    target = new SfxItemPool(),
    field = new SvxURLField(unicode("url"), unicode("shown")),
    item = new SvxFieldItem(field, EE_FEATURE_FIELD, true),
    holder = new SfxPoolItemHolder(pool, item),
    attribute = new XEditAttribute(pool, item, 0, 1);
  expect(attribute.IsFeature()).toBe(true);
  expect(attribute.GetLen()).toBe(1);
  expect(holder.getItem()).toBeInstanceOf(SvxFieldItem);
  const paragraph = new ContentInfo(pool);
  paragraph.SetText(unicode("\ufffc"));
  paragraph.GetCharAttribs().push(attribute);
  const copy = new ContentInfo(paragraph, target),
    copiedItem = copy.GetCharAttribs()[0]?.GetItem() as SvxFieldItem;
  expect(copy.Equals(paragraph, false)).toBe(true);
  expect(copy.GetCharAttribs()[0]?.GetItemHolder().getPool()).toBe(target);
  expect(copiedItem.GetField()).not.toBe(item.GetField());
  expect(copiedItem.GetField()).toBeInstanceOf(SvxURLField);
  field.SetURL(unicode("changed"));
  expect(urlOf(item).GetURL().equals(unicode("changed"))).toBe(true);
  expect(urlOf(copiedItem).GetURL().equals(unicode("url"))).toBe(true);
  const defaultItem = new SvxFieldItem(new SvxFieldData(), EE_FEATURE_FIELD);
  pool.RegisterDefaultItem(defaultItem);
  const realDefault = pool.GetPoolDefaultItem(EE_FEATURE_FIELD) as SvxFieldItem;
  expect(realDefault.GetField()).not.toBe(defaultItem.GetField());
  expect(realDefault.GetField()?.GetClassId()).toBe(FieldType.UNSPECIFIED);
  const constField: SvxFieldDataConstReference = realDefault.GetField() as SvxFieldData;
  expect(constField.equals(new SvxFieldData())).toBe(true);
});
