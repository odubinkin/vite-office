/** @fileoverview Original grab-bag values, UDK property structs and real Any/Sequence/ContentInfo transport. */
import { expect, it } from "vitest";
import { SfxGrabBagItem } from "../../inc/grabbagitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { uno_Any } from "../../../cppu/inc/uno/any2";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  PropertyState,
  cppu_detail_getUnoType_PropertyState as stateType,
} from "../../../udkapi/com/sun/star/beans/PropertyState";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { SfxItemPool } from "../../inc/itempool";
import { SfxItemSet } from "../../inc/itemset";
import { SfxInt16Item } from "./intitem";
import { SfxPoolItem } from "../../inc/poolitem";
import { ContentInfo } from "../../../editeng/source/editeng/editobj2";
import { EE_CHAR_GRABBAG } from "../../../editeng/inc/eeitem";
/** Actual initialized Unicode value, preserving all code units. @param text - Input. @returns Original value. */
function unicode(text: string): OUString {
  const units = Uint16Array.from(
    { length: text.length },
    /** Reads one code unit. @param _ - Unused value. @param index - Unit index. @returns Unit. */ (
      _,
      index,
    ) => text.charCodeAt(index),
  );
  return new OUString(units, units.length);
}
/** Actual explicitly typed long Any. @param number - Value. @returns Any. */
function value(number: number): Any {
  return new Any([number], "sal_Int32");
}
/** Reads a typed long from an existing Any const view. @param input - Original value. @returns Long. */
function numberOf(
  input: ReturnType<SfxGrabBagItem["GetGrabBag"]> extends ReadonlyMap<string, infer V> ? V : never,
): number {
  const result: [number] = [0];
  expect(input.extract(result, "sal_Int32")).toBe(true);
  return result[0];
}
/** Actual initialized compound address returned by existing sequence storage. */
type Address = { get(offset: number): unknown };
const Properties = Sequence.specialize<Address>(propertyType, 48);
/** Transports actual PropertyValue objects through original CPPU copying. @param values - Initialized values. @returns Typed Any. */
function properties(values: PropertyValue[]): Any {
  const sequence = new Properties(
      {
        get: /** Borrows actual initialized compound objects at declared element strides. @param offset - Original element offset. @returns Existing value. */ (
          offset: number,
        ) => values[offset / 48],
      },
      values.length,
    ),
    result = new Any();
  result.insert(sequence.getAddress(), ["Sequence", propertyType]);
  sequence.dispose();
  return result;
}
/** Copies a returned compound value using the actual public IDL constructors, not a provider. @param fields - Actual borrowed compound addresses. @returns Independent initialized value. */
function property(fields: Address): PropertyValue {
  const raw = fields.get(16) as uno_Any;
  return new PropertyValue(
    OUString.unacquired(fields.get(0) as rtl_uStringSlot),
    (fields.get(8) as [number])[0],
    new Any(raw.pData, raw.pType),
    (fields.get(40) as [PropertyState])[0],
  );
}
it("retains generated PropertyValue defaults, stable fields, copied values and complete equality", /** The IDL supplies no -1 handle initializer; generated scalar defaults are zero. @returns Nothing. */ () => {
  expect([
    PropertyState.DIRECT_VALUE,
    PropertyState.DEFAULT_VALUE,
    PropertyState.AMBIGUOUS_VALUE,
    PropertyState.MAKE_FIXED_SIZE,
  ]).toEqual([0, 1, 2, 2147483647]);
  expect(stateType().equals(stateType())).toBe(true);
  expect(propertyType().equals(propertyType())).toBe(true);
  const a = new PropertyValue(),
    name = a.Name,
    any = a.Value;
  expect(a.Name.getLength()).toBe(0);
  expect([a.Handle, a.State, a.Value.hasValue()]).toEqual([0, PropertyState.DIRECT_VALUE, false]);
  const input = unicode("N\0😀"),
    source = value(7),
    b = new PropertyValue(input, -1, source, PropertyState.DEFAULT_VALUE),
    copy = new PropertyValue(b);
  expect(copy.equals(b)).toBe(true);
  expect(copy.notEquals(b)).toBe(false);
  expect(copy.Name).not.toBe(b.Name);
  expect(copy.Value).not.toBe(b.Value);
  input.assign(unicode("other"));
  source.insert([9], "sal_Int32");
  expect(b.Name.equals(unicode("N\0😀"))).toBe(true);
  expect(numberOf(b.Value)).toBe(7);
  a.assign(b);
  expect(a.Name).toBe(name);
  expect(a.Value).toBe(any);
  expect(a.equals(b)).toBe(true);
  expect(a.assign(a)).toBe(a);
  b.Name = unicode("X");
  expect(a.equals(b)).toBe(false);
  b.Name = a.Name;
  b.Handle = 0;
  expect(a.equals(b)).toBe(false);
  b.Handle = -1;
  b.Value = value(8);
  expect(a.equals(b)).toBe(false);
  b.Value = a.Value;
  b.State = PropertyState.AMBIGUOUS_VALUE;
  expect(a.equals(b)).toBe(false);
  b.Handle = 4294967295;
  expect(b.Handle).toBe(-1);
  b.State = 99 as PropertyState;
  expect(b.State).toBe(99);
  expect(a.get(0)).toBe(a.Name.getDataAddress());
  expect(a.get(8)).toBe(a.get(8));
  expect(a.get(16)).toBe(any);
  expect(a.get(40)).toBe(a.get(40));
});
it("preserves sorted UTF16 map value keys and independent concrete item copies", /** Case, embedded nulls and lone/supplementary surrogate units have no locale normalization. @returns Nothing. */ () => {
  const empty = new SfxGrabBagItem();
  expect(empty.Which()).toBe(0);
  expect(empty.GetGrabBag().size).toBe(0);
  expect(empty.hashCode()).toBe(0n);
  expect(empty.supportsHashCode()).toBe(true);
  expect(empty.QueryValue()).toBeUndefined();
  const source = value(4),
    input = new Map([
      ["z", source],
      ["😀", value(5)],
      ["A\0z", value(6)],
      ["a", value(7)],
      ["A", value(8)],
      ["\ud800", value(9)],
    ]),
    a = new SfxGrabBagItem(EE_CHAR_GRABBAG, input),
    b = new SfxGrabBagItem(a),
    c = a.Clone(new SfxItemPool());
  expect([...a.GetGrabBag().keys()]).toEqual(["A", "A\0z", "a", "z", "\ud800", "😀"]);
  expect(a.GetGrabBag()).toBe(a.GetGrabBag());
  expect(a.GetGrabBag()).not.toBe(input);
  expect(b.equals(a)).toBe(true);
  expect(c.equals(a)).toBe(true);
  expect(b.Which()).toBe(EE_CHAR_GRABBAG);
  expect(a.GetGrabBag().get("z")).not.toBe(source);
  source.insert([10], "sal_Int32");
  expect(numberOf(a.GetGrabBag().get("z") as Any)).toBe(4);
  input.clear();
  expect(a.GetGrabBag().size).toBe(6);
  expect(a.equals(new SfxGrabBagItem())).toBe(false);
  expect(a.equals(new SfxInt16Item(1))).toBe(false);
  const equalOtherWhich = new SfxGrabBagItem(1, a.GetGrabBag());
  expect(a.equals(equalOtherWhich)).toBe(true);
  expect(SfxPoolItem.areSame(a, equalOtherWhich)).toBe(false);
  const keys = new Map(a.GetGrabBag());
  keys.delete("z");
  keys.set("other", value(4));
  expect(a.equals(new SfxGrabBagItem(EE_CHAR_GRABBAG, keys))).toBe(false);
  keys.delete("other");
  keys.set("z", value(99));
  const different = new SfxGrabBagItem(EE_CHAR_GRABBAG, keys);
  expect(a.equals(different)).toBe(false);
  expect(a.hashCode()).toBe(different.hashCode());
  expect(a.hashCode()).not.toBe(0n);
});
it("uses real typed property sequences, last duplicate wins and selectors/handles/states are ignored", /** Exact compound transport distinguishes scalar, unrelated and empty sequence values. @returns Nothing. */ () => {
  const p = new PropertyValue(unicode("z"), -1, value(1), PropertyState.AMBIGUOUS_VALUE),
    q = new PropertyValue(unicode("A"), 42, value(2), PropertyState.DEFAULT_VALUE),
    duplicate = new PropertyValue(unicode("z"), 9, value(3), PropertyState.DIRECT_VALUE),
    a = new SfxGrabBagItem(EE_CHAR_GRABBAG),
    view = a.GetGrabBag();
  const input = properties([p, q, duplicate]);
  expect(a.PutValue(input, 255)).toBe(true);
  expect(a.GetGrabBag()).toBe(view);
  expect([...view.keys()]).toEqual(["A", "z"]);
  expect(numberOf(view.get("z") as Any)).toBe(3);
  duplicate.Value = value(44);
  input.clear();
  expect(numberOf(view.get("z") as Any)).toBe(3);
  const out = new Any();
  expect(a.QueryValue(out, 999)).toBe(true);
  const sequence = new Properties();
  expect(out.extract(sequence.getAddress(), ["Sequence", propertyType])).toBe(true);
  expect(sequence.getLength()).toBe(2);
  const first = property(sequence.operatorIndex(0)),
    second = property(sequence.operatorIndex(1));
  expect(first.Name.equals(unicode("A"))).toBe(true);
  expect(second.Name.equals(unicode("z"))).toBe(true);
  expect([first.Handle, first.State, second.Handle, second.State]).toEqual([0, 0, 0, 0]);
  expect(numberOf(second.Value)).toBe(3);
  second.Value = value(100);
  expect(numberOf(view.get("z") as Any)).toBe(3);
  sequence.dispose();
  const before = a.Clone();
  expect(a.PutValue({})).toBe(false);
  expect(a.PutValue(value(5))).toBe(false);
  expect(a.equals(before)).toBe(true);
  const Longs = Sequence.specialize<[number]>("sal_Int32", 4),
    longs = new Longs(1),
    wrong = new Any();
  wrong.insert(longs.getAddress(), ["Sequence", "sal_Int32"]);
  expect(a.PutValue(wrong)).toBe(false);
  expect(a.equals(before)).toBe(true);
  longs.dispose();
  expect(a.PutValue(properties([]))).toBe(true);
  expect(view.size).toBe(0);
  expect(a.PutValue(properties([]), 0)).toBe(true);
});
it("retains nested typed metadata and genuine item-set/paragraph target-pool copies", /** No fake document or pool producer is used. @returns Nothing. */ () => {
  const inner = properties([
      new PropertyValue(unicode("inside"), 0, value(8), PropertyState.DIRECT_VALUE),
    ]),
    a = new SfxGrabBagItem(EE_CHAR_GRABBAG, new Map([["nested", inner]])),
    out = new Any();
  expect(a.QueryValue(out)).toBe(true);
  const b = new SfxGrabBagItem(EE_CHAR_GRABBAG);
  expect(b.PutValue(out)).toBe(true);
  expect(b.equals(a)).toBe(true);
  inner.clear();
  out.clear();
  expect(b.equals(a)).toBe(true);
  const pool = new SfxItemPool(),
    other = new SfxItemPool(),
    set = new SfxItemSet(pool, [[EE_CHAR_GRABBAG, EE_CHAR_GRABBAG]]);
  set.Put(a);
  const clone = set.Clone(true, other);
  expect(clone.GetPool()).toBe(other);
  expect(clone.Get(EE_CHAR_GRABBAG)).not.toBe(a);
  expect(clone.Get(EE_CHAR_GRABBAG).equals(a)).toBe(true);
  const paragraph = new ContentInfo(pool);
  paragraph.SetText(unicode("text"));
  paragraph.GetParaAttribs().Put(a);
  const copied = new ContentInfo(paragraph, other);
  expect(copied.Equals(paragraph, false)).toBe(true);
  expect(copied.GetParaAttribs().Get(EE_CHAR_GRABBAG)).not.toBe(
    paragraph.GetParaAttribs().Get(EE_CHAR_GRABBAG),
  );
  a.PutValue(properties([]));
  expect(copied.GetParaAttribs().Get(EE_CHAR_GRABBAG).equals(b)).toBe(true);
});
