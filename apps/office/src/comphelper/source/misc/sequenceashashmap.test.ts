/** @fileoverview Source-backed SequenceAsHashMap callers exercise real Any/Sequence/Unicode ownership, overload asymmetries, partial writes, reused compound slots and weak component lifetime. */
import { expect, it } from "vitest";
import {
  SequenceAsHashMap,
  OUStringAndHashCode,
  OUStringAndHashCodeEqual,
  OUStringAndHashCodeHash,
} from "./sequenceashashmap";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { OWeakObject, WeakReferenceHelper } from "../../../cppuhelper/source/weak";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
const Names = Sequence.specialize<NamedValue>(namedType, 32),
  Props = Sequence.specialize<PropertyValue>(propertyType, 48),
  Anys = Sequence.specialize<Any>("Any", 24);
/** Actual caller constructs UTF16, including embedded zero and unpaired surrogates. @param value - Caller units. @returns Owned string. */
function str(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      { length: value.length },
      /** Reads one exact UTF16 code unit, including surrogate pairs. @param unused - Unused array slot. @param index - Unit index. @returns Code unit. */ (
        unused,
        index,
      ) => {
        void unused;
        return value.charCodeAt(index);
      },
    ),
    value.length,
  );
}
/** Copies concrete caller values through genuine Sequence construction. @param values - Actual value addresses. @param kind - Declared overload. @returns Owned sequence. */
function seq(values: readonly NamedValue[], kind: "NamedValue"): Sequence<NamedValue>;
/** Copies property values through genuine Sequence construction. @param values - Actual values. @param kind - Declared overload. @returns Owned sequence. */
function seq(values: readonly PropertyValue[], kind: "PropertyValue"): Sequence<PropertyValue>;
/** Copies actual Any values through genuine Sequence construction. @param values - Actual values. @param kind - Declared overload. @returns Owned sequence. */
function seq(values: readonly Any[], kind: "Any"): Sequence<Any>;
/** Test caller array pointer/sizeof spelling, not a library value/default factory. @param values - Actual owned values. @param kind - Declared test type. @returns Actual sequence. */
function seq(
  values: readonly unknown[],
  kind: "NamedValue" | "PropertyValue" | "Any",
): Sequence<unknown> {
  const C = kind === "NamedValue" ? Names : kind === "PropertyValue" ? Props : Anys,
    size = kind === "NamedValue" ? 32 : kind === "PropertyValue" ? 48 : 24;
  return new C(
    {
      /** Caller pointer addition. @param offset - Native byte offset. @returns Borrowed element. */ get: (
        offset,
      ) => values[offset / size],
    },
    values.length,
  );
}
/** Destroys actual native PropertyValue members. @param p - Owned value. @returns Nothing. */
function release(p: PropertyValue): void {
  p.Value.dispose();
  p.Name.dispose();
}
/** Observe only original UNO exception fields and release the actual thrown owner. @param call - Actual overload. @param expected - Source message. @returns Nothing. */
function rejects(call: () => void, expected: string): void {
  let caught = false;
  try {
    call();
  } catch (e) {
    expect(e).toBeInstanceOf(IllegalArgumentException);
    const error = e as IllegalArgumentException;
    try {
      const message = str(expected);
      try {
        expect(error.Message.equals(message)).toBe(true);
      } finally {
        message.dispose();
      }
      expect(error.ArgumentPosition).toBe(-1);
      expect(error.Context.is()).toBe(false);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Reads one actual generated output field without wrapping data in a projected document representation. @param sequence - Actual sequence. @param index - Index. @returns Borrowed native compound. */
function member(sequence: Sequence<unknown>, index = 0): { get(offset: number): unknown } {
  return sequence.operatorIndex(index) as { get(offset: number): unknown };
}

it("retains generated NamedValue constructors, stable members, equality and real compound copies", /** Covers the generated value and cached type over actual shared owners. @returns Nothing. */ () => {
  const name = str("item"),
    value = new Any([7], "sal_Int32"),
    a = new NamedValue(),
    b = new NamedValue(name, value),
    c = new NamedValue(b),
    oldName = a.Name,
    oldValue = a.Value;
  expect(a.notEquals(b)).toBe(true);
  a.assign(b);
  expect(a.equals(c)).toBe(true);
  expect(a.Name).toBe(oldName);
  expect(a.Value).toBe(oldValue);
  value.insert([8], "sal_Int32");
  c.Value = value;
  expect(a.equals(c)).toBe(false);
  expect(a.notEquals(b)).toBe(false);
  expect(a.get(0)).toBe(a.Name.getDataAddress());
  expect(a.get(8)).toBe(a.Value);
  expect(namedType()).toBe(namedType());
  const encoded = new Any(a, namedType),
    decoded = new NamedValue();
  expect(encoded.extract(decoded, namedType)).toBe(true);
  expect(decoded.equals(a)).toBe(true);
  encoded.dispose();
  decoded.dispose();
  a.dispose();
  b.dispose();
  c.dispose();
  value.dispose();
  name.dispose();
});

it("owns Unicode cache keys, hash functors and exact code-unit names without inserting on lookup", /** Keeps actual key hashing and pair references without a second value owner. @returns Nothing. */ () => {
  const name = str("A😀\0\ud800"),
    other = str("other"),
    aa = str("Aa"),
    bb = str("B<"),
    a = new OUStringAndHashCode(name),
    same = new OUStringAndHashCode(name),
    different = new OUStringAndHashCode(other),
    collisionA = new OUStringAndHashCode(aa),
    collisionB = new OUStringAndHashCode(bb),
    eq = new OUStringAndHashCodeEqual(),
    hash = new OUStringAndHashCodeHash(),
    map = new SequenceAsHashMap();
  expect(a.maString).not.toBe(name);
  expect(a.mnHashCode).toBe(name.hashCode());
  expect(eq.call(a, same)).toBe(true);
  expect(eq.call(a, different)).toBe(false);
  expect(collisionA.mnHashCode).toBe(collisionB.mnHashCode);
  expect(eq.call(collisionA, collisionB)).toBe(false);
  expect(hash.call(a)).toBe(BigInt.asUintN(64, BigInt(name.hashCode())));
  expect(map.empty()).toBe(true);
  const absent = map.getValue(name);
  expect(absent.hasValue()).toBe(false);
  absent.dispose();
  expect(map.size()).toBe(0);
  const slot = map.operatorIndex(a);
  slot.insert([17], "sal_Int32");
  expect(map.operatorIndex(name)).toBe(slot);
  expect(map.find(same)?.[1]).toBe(slot);
  expect(map.contains(name)).toBe(true);
  expect([...map.begin()].length).toBe(1);
  expect(map.getUnpackedValueOrDefault(name, 44, "sal_Int32")).toBe(17);
  expect(map.getUnpackedValueOrDefault(other, 44, "sal_Int32")).toBe(44);
  slot.insert([true], "bool");
  expect(map.getUnpackedValueOrDefault(name, 44, "sal_Int32")).toBe(44);
  expect(map.createItemIfMissing(name, [99], "sal_Int32")).toBe(false);
  expect(map.createItemIfMissing(other, [33], "sal_Int32")).toBe(true);
  const copy = map.getValue(other);
  expect(copy.get("sal_Int32")).toBe(33);
  copy.insert([88], "sal_Int32");
  expect(map.getUnpackedValueOrDefault(other, 0, "sal_Int32")).toBe(33);
  copy.dispose();
  expect(map.erase(other)).toBe(1);
  expect(map.erase(other)).toBe(0);
  map.clear();
  expect(map.empty()).toBe(true);
  map.dispose();
  for (const key of [a, same, different, collisionA, collisionB]) key.dispose();
  for (const s of [name, other, aa, bb]) s.dispose();
});

it("resets direct named/property input, accepts empty fields and retains last duplicate value", /** Distinguishes typed sequence reset from Any-sequence merge. @returns Nothing. */ () => {
  const key = str("x"),
    blank = new OUString(),
    first = new Any([1], "sal_Int32"),
    last = new Any([2], "sal_Int32"),
    empty = new Any(),
    a = new NamedValue(key, first),
    b = new NamedValue(key, last),
    n = new NamedValue(blank, empty),
    names = seq([a, b, n], "NamedValue"),
    map = new SequenceAsHashMap(names, "NamedValue");
  expect(map.size()).toBe(2);
  expect(map.getUnpackedValueOrDefault(key, -1, "sal_Int32")).toBe(2);
  const nil = map.getValue(blank);
  expect(nil.hasValue()).toBe(false);
  nil.dispose();
  const p = new PropertyValue(key, 123, first, PropertyState.AMBIGUOUS_VALUE),
    properties = seq([p], "PropertyValue");
  map.insert(properties, "PropertyValue");
  expect(map.size()).toBe(1);
  expect(map.contains(blank)).toBe(false);
  expect(map.getUnpackedValueOrDefault(key, 0, "sal_Int32")).toBe(1);
  const constructed = new SequenceAsHashMap(properties, "PropertyValue");
  expect(constructed.match(map)).toBe(true);
  const anyNamed = new Any(names.getAddress(), ["Sequence", namedType]);
  map.insert(anyNamed);
  expect(map.size()).toBe(2);
  const anyProperties = new Any(properties.getAddress(), ["Sequence", propertyType]),
    fromAny = new SequenceAsHashMap(anyProperties);
  expect(fromAny.size()).toBe(1);
  map.insert(empty);
  expect(map.empty()).toBe(true);
  const unchanged = new SequenceAsHashMap(fromAny);
  rejects(
    /** Source rejects a filled wrong Any without clearing current contents. @returns Nothing. */ () =>
      unchanged.insert(first),
    "Any contains wrong type.",
  );
  expect(unchanged.match(fromAny)).toBe(true);
  unchanged.dispose();
  constructed.dispose();
  fromAny.dispose();
  map.dispose();
  anyNamed.dispose();
  anyProperties.dispose();
  names.dispose();
  properties.dispose();
  a.dispose();
  b.dispose();
  n.dispose();
  release(p);
  key.dispose();
  blank.dispose();
  first.dispose();
  last.dispose();
  empty.dispose();
});

it("merges Any element sequences, ignores VOID and keeps earlier writes when a later element fails", /** Preserves all original rejection messages and partial mutation. @returns Nothing. */ () => {
  const key = str("x"),
    other = str("y"),
    blank = new OUString(),
    one = new Any([1], "sal_Int32"),
    two = new Any([2], "sal_Int32"),
    empty = new Any(),
    p = new PropertyValue(key, 1, one, PropertyState.DEFAULT_VALUE),
    n = new NamedValue(other, two),
    pa = new Any(p, propertyType),
    na = new Any(n, namedType),
    input = seq([pa, empty, na], "Any"),
    map = new SequenceAsHashMap(input, "Any");
  expect(map.size()).toBe(2);
  expect(map.getUnpackedValueOrDefault(key, 0, "sal_Int32")).toBe(1);
  expect(map.getUnpackedValueOrDefault(other, 0, "sal_Int32")).toBe(2);
  const badPName = new PropertyValue(blank, 0, one, PropertyState.DIRECT_VALUE),
    badPValue = new PropertyValue(key, 0, empty, PropertyState.DIRECT_VALUE),
    badNName = new NamedValue(blank, one),
    badNValue = new NamedValue(key, empty);
  for (const [object, type, message] of [
    [badPName, propertyType, "PropertyValue struct contains no useful information."],
    [badPValue, propertyType, "PropertyValue struct contains no useful information."],
    [badNName, namedType, "NamedValue struct contains no useful information."],
    [badNValue, namedType, "NamedValue struct contains no useful information."],
  ] as const) {
    const bad = new Any(object, type),
      values = seq([pa, bad], "Any");
    map.clear();
    rejects(
      /** Real overload leaves its first successful insertion. @returns Nothing. */ () =>
        map.insert(values, "Any"),
      message,
    );
    expect(map.size()).toBe(1);
    expect(map.contains(key)).toBe(true);
    values.dispose();
    bad.dispose();
  }
  const invalid = seq([na, one], "Any");
  rejects(
    /** Wrong filled element fails after a valid named element. @returns Nothing. */ () =>
      map.insert(invalid, "Any"),
    "Any contains wrong type.",
  );
  expect(map.size()).toBe(2);
  const encoded = new Any(input.getAddress(), ["Sequence", "Any"]);
  rejects(
    /** Outer Any accepts only named/property sequences. @returns Nothing. */ () =>
      map.insert(encoded),
    "Any contains wrong type.",
  );
  encoded.dispose();
  invalid.dispose();
  input.dispose();
  map.dispose();
  pa.dispose();
  na.dispose();
  release(p);
  release(badPName);
  release(badPValue);
  n.dispose();
  badNName.dispose();
  badNValue.dispose();
  key.dispose();
  other.dispose();
  blank.dispose();
  one.dispose();
  two.dispose();
  empty.dispose();
});

it("uses actual subset equality, independent map copies and update overwrites without deleting unspecified names", /** Tests actual C Any comparison, stable slots and self update. @returns Nothing. */ () => {
  const x = str("x"),
    y = str("y"),
    z = str("z"),
    base = new SequenceAsHashMap(),
    check = new SequenceAsHashMap();
  base.createItemIfMissing(x, [1], "sal_Int32");
  base.createItemIfMissing(y, [2], "sal_Int32");
  check.createItemIfMissing(x, [1], "sal_Int32");
  expect(base.match(check)).toBe(true);
  expect(check.match(base)).toBe(false);
  check.operatorIndex(x).insert([3], "sal_Int32");
  expect(base.match(check)).toBe(false);
  const copied = new SequenceAsHashMap(base),
    oldSlot = copied.operatorIndex(x);
  copied.update(check);
  copied.update(copied);
  expect(copied.operatorIndex(x)).toBe(oldSlot);
  expect(copied.getUnpackedValueOrDefault(x, 0, "sal_Int32")).toBe(3);
  expect(copied.contains(y)).toBe(true);
  expect(base.getUnpackedValueOrDefault(x, 0, "sal_Int32")).toBe(1);
  check.createItemIfMissing(z, [4], "sal_Int32");
  copied.update(check);
  expect(copied.contains(z)).toBe(true);
  base.dispose();
  check.dispose();
  copied.dispose();
  x.dispose();
  y.dispose();
  z.dispose();
});

it("writes real sequence compound fields, keeps reused Handle/State and returns independent Any sequences", /** Genuine COW/output storage retains fields not assigned by upstream extraction. @returns Nothing. */ () => {
  const name = str("output"),
    old = str("old"),
    value = new Any([9], "sal_Int32"),
    map = new SequenceAsHashMap();
  map.operatorIndex(name).assign(value);
  const existing = new PropertyValue(old, 123, value, PropertyState.AMBIGUOUS_VALUE),
    output = seq([existing], "PropertyValue"),
    alias = new Props(output);
  map.extract(output, "PropertyValue");
  const slot = member(output),
    gotName = new OUString((slot.get(0) as [rtl_uString])[0]);
  expect(gotName.equals(name)).toBe(true);
  expect((slot.get(8) as [number])[0]).toBe(123);
  expect((slot.get(40) as [number])[0]).toBe(PropertyState.AMBIGUOUS_VALUE);
  gotName.dispose();
  const aliasName = new OUString((member(alias).get(0) as [rtl_uString])[0]);
  expect(aliasName.equals(old)).toBe(true);
  aliasName.dispose();
  const properties = map.getAsConstPropertyValueList(),
    names = map.getAsConstNamedValueList();
  expect((member(properties).get(8) as [number])[0]).toBe(0);
  expect((member(properties).get(40) as [number])[0]).toBe(PropertyState.DIRECT_VALUE);
  const namedAny = map.getAsConstAny(false),
    propertyAny = map.getAsConstAny(true),
    fromNamed = new SequenceAsHashMap(namedAny),
    fromProperty = new SequenceAsHashMap(propertyAny);
  expect(fromNamed.match(map)).toBe(true);
  expect(fromProperty.match(map)).toBe(true);
  fromNamed.dispose();
  fromProperty.dispose();
  namedAny.dispose();
  propertyAny.dispose();
  properties.dispose();
  names.dispose();
  output.dispose();
  alias.dispose();
  release(existing);
  map.dispose();
  name.dispose();
  old.dispose();
  value.dispose();
});

it("retains actual component values until the last map or output owner is destroyed", /** Uses actual weak invalidation without forging ownership state. @returns Nothing. */ () => {
  const key = str("component"),
    root = new Reference<XInterface>(new OWeakObject()),
    weak = new WeakReferenceHelper(root),
    value = new Any(root.getAddress(), ["Reference", "XInterface"]),
    map = new SequenceAsHashMap();
  map.operatorIndex(key).assign(value);
  const copied = new SequenceAsHashMap(map),
    output = map.getAsConstAny(false);
  root.dispose();
  value.dispose();
  map.dispose();
  copied.erase(key);
  copied.dispose();
  const live = weak.get();
  expect(live.is()).toBe(true);
  live.dispose();
  output.dispose();
  const dead = weak.get();
  expect(dead.is()).toBe(false);
  dead.dispose();
  weak.dispose();
  key.dispose();
});
