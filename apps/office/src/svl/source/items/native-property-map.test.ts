/** @fileoverview Native property-schema value/pointer ownership, sorted lookup, duplicate handling and real UNO descriptor sequence caching/COW. */
import { expect, it } from "vitest";
import {
  SfxItemPropertyMapEntry as Entry,
  SfxItemPropertyMapCompare,
  PropertyMoreFlags as Flags,
  PROPERTY_NONE,
  propertyNameView,
} from "../../inc/itemprop";
import { SfxItemPropertyMap } from "./itemprop";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { UnoType } from "../../../cppu/inc/unotype";
import {
  Sequence,
  type SequenceElements,
  type SequenceReference,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { uno_type_assignData } from "../../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
import { unicode, text } from "../../../sw/source/core/unocore/unocrsrhelper";
const Properties = Sequence.specialize<Property>(propertyType, 32);
/** Creates a native schema value without leaking its source string temporary. @param name - Exact UTF16 name. @param which - Native WhichId. @returns Entry. */
function entry(name: string, which: number): Entry {
  const string = unicode(name);
  try {
    return new Entry(string, which, UnoType.get("sal_Int32"), PROPERTY_NONE, 0);
  } finally {
    string.dispose();
  }
}
/** Copies one initialized native Sequence<Property> element into a genuine generated Property owner. @param sequence - Borrowed sequence. @param index - Native element index. @returns Owned descriptor. */
function property(sequence: SequenceReference<Property>, index: number): Property {
  const result = new Property();
  expect(
    uno_type_assignData(
      result,
      propertyType().getTypeLibType() as R,
      (sequence.getConstArray() as SequenceElements).get(index * 32),
      propertyType().getTypeLibType(),
      cpp_queryInterface,
      cpp_acquire,
      cpp_release,
    ),
  ).toBe(true);
  return result;
}
/** Reads native descriptor values while destroying returned values exactly once. @param sequence - Borrowed actual sequence. @returns Ordinary observation rows. */
function rows(sequence: SequenceReference<Property>): [string, number, number][] {
  const result: [string, number, number][] = [];
  for (let index = 0; index < sequence.getLength(); ++index) {
    const value = property(sequence, index);
    try {
      result.push([text(value.Name), value.Handle, value.Attributes]);
    } finally {
      value.dispose();
    }
  }
  return result;
}

it("keeps actual owned entry values, implicit copies/assignment and native integer widths", /** Source table values remain independently owned; maps later borrow their pointers. @returns Nothing. */ () => {
  const name = unicode("距離😀"),
    original = new Entry(name, 65537, UnoType.get("sal_Int32"), 0x10000, 0x181, Flags.METRIC_ITEM),
    copied = new Entry(original),
    target = entry("other", 2);
  name.dispose();
  try {
    expect([
      text(original.aName),
      original.nWID,
      original.nFlags,
      original.nMemberId,
      original.nMoreFlags,
    ]).toEqual(["距離😀", 1, 0, 0x81, Flags.METRIC_ITEM]);
    expect(copied.aName).not.toBe(original.aName);
    expect(copied.aName.pData).toBe(original.aName.pData);
    expect(copied.aType).not.toBe(original.aType);
    expect(copied.aType.equals(original.aType)).toBe(true);
    expect(target.assign(copied)).toBe(target);
    expect(target.assign(target)).toBe(target);
    expect(text(target.aName)).toBe("距離😀");
    const compare = new SfxItemPropertyMapCompare();
    expect(compare.operatorCall(original, copied)).toBe(false);
  } finally {
    target.dispose();
    copied.dispose();
    original.dispose();
  }
});

it.each(["sal_Int8", "sal_Int16", "sal_uInt16", "sal_Int32", "sal_uInt32"] as const)(
  "admits the original METRIC_ITEM type %s",
  /** All five supported native integer classes remain distinct Type owners. @param type - Native primitive. @returns Nothing. */ (
    type,
  ) => {
    const name = unicode("Metric");
    const value = new Entry(name, 1, UnoType.get(type), 0x1ff, 0x80, Flags.METRIC_ITEM);
    name.dispose();
    try {
      expect(value.aType.equals(UnoType.get(type))).toBe(true);
      expect(value.nFlags).toBe(511);
    } finally {
      value.dispose();
    }
  },
);

it("preserves checked constructor assertions without inventing successful invalid entries", /** NDEBUG behavior is not certified by this checked binding. @returns Nothing. */ () => {
  const name = unicode("Invalid");
  try {
    expect(
      /** Exercises the native checked flags precondition. @returns Never-constructed invalid entry. */ () =>
        new Entry(name, 1, UnoType.get("bool"), 0x200, 0),
    ).toThrow("_nFlags <= 0x1ff");
    expect(
      /** Exercises the native forbidden-member-bit precondition. @returns Never-constructed invalid entry. */ () =>
        new Entry(name, 1, UnoType.get("bool"), 0, 0x40),
    ).toThrow("_nMemberId & 0x40");
    expect(
      /** Exercises the native metric-type precondition. @returns Never-constructed invalid entry. */ () =>
        new Entry(name, 1, UnoType.get("bool"), 0, 0, Flags.METRIC_ITEM),
    ).toThrow("supported integer type");
  } finally {
    name.dispose();
  }
});

it("retains native sorted counted-name lookup, first same-name entry and actual borrowed pointers", /** No replacement query provider or fake descriptor state is used. @returns Nothing. */ () => {
  const entries = [
    entry("字", 5),
    entry("A\0Z", 3),
    entry("Alpha", 2),
    entry("A", 1),
    entry("Alpha", 99),
    entry("😀", 6),
    entry("Z", 4),
  ];
  const map = new SfxItemPropertyMap(entries);
  try {
    expect(
      [...map.getPropertyEntries()].map(
        /** Reads original pointer names. @param value - Entry. @returns Name. */ (value) =>
          text(value.aName),
      ),
    ).toEqual(["A", "A\0Z", "Alpha", "Z", "字", "😀"]);
    for (const name of ["A", "A\0Z", "Alpha", "Z", "字", "😀"]) {
      const owned = unicode(name);
      try {
        const actual = map.getByName(propertyNameView(owned));
        expect(actual).toBe(
          entries.find(
            /** Original first matching pointer. @param value - Entry. @returns Match. */ (value) =>
              text(value.aName) === name,
          ),
        );
        expect(map.hasPropertyByName(propertyNameView(owned))).toBe(true);
        const descriptor = map.getPropertyByName(owned);
        try {
          expect(descriptor.Handle).toBe(actual?.nWID);
          expect(text(descriptor.Name)).toBe(name);
        } finally {
          descriptor.dispose();
        }
      } finally {
        owned.dispose();
      }
    }
    for (const name of ["", "@", "A\0", "AB", "Alph", "Alpha!", "zz", "末", "😁"]) {
      const owned = unicode(name);
      try {
        expect(map.getByName(propertyNameView(owned))).toBeNull();
        expect(map.hasPropertyByName(propertyNameView(owned))).toBe(false);
        try {
          map.getPropertyByName(owned);
          throw new Error("Expected source exception");
        } catch (error) {
          if (!(error instanceof UnknownPropertyException)) throw error;
          try {
            expect(text(error.Message)).toBe(name);
            expect(error.Context.is()).toBe(false);
          } finally {
            error.dispose();
          }
        }
      } finally {
        owned.dispose();
      }
    }
  } finally {
    map.dispose();
    for (const value of entries) value.dispose();
  }
});

it("owns a cached native descriptor sequence, shares copied cache values and honors real COW", /** Uses public Sequence storage APIs and genuine UNO field assignment, never synthetic private graph injection. @returns Nothing. */ () => {
  const entries = [entry("b", 2), entry("a", 1)];
  const map = new SfxItemPropertyMap(entries),
    beforeCache = new SfxItemPropertyMap(map);
  const cache = map.getProperties(),
    copied = new SfxItemPropertyMap(map);
  const result = new Properties(cache);
  try {
    expect(map.getProperties()).toBe(cache);
    expect(copied.getProperties().get()).toBe(cache.get());
    expect(beforeCache.getProperties().get()).not.toBe(cache.get());
    expect([...copied.getPropertyEntries()][0]).toBe(entries[1]);
    expect(rows(cache)).toEqual([
      ["a", 1, 0],
      ["b", 2, 0],
    ]);
    const changed = property(result, 0),
      name = unicode("changed");
    try {
      changed.Name = name;
      changed.Handle = 99;
      expect(
        uno_type_assignData(
          (result.getArray() as SequenceElements).get(0),
          propertyType().getTypeLibType() as R,
          changed,
          propertyType().getTypeLibType(),
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        ),
      ).toBe(true);
    } finally {
      name.dispose();
      changed.dispose();
    }
    expect(rows(result)).toEqual([
      ["changed", 99, 0],
      ["b", 2, 0],
    ]);
    expect(rows(cache)).toEqual([
      ["a", 1, 0],
      ["b", 2, 0],
    ]);
  } finally {
    result.dispose();
    copied.dispose();
    beforeCache.dispose();
    map.dispose();
    for (const value of entries) value.dispose();
  }
});

it("retains source empty-map queries and empty cached sequence without fabricating a schema entry", /** Empty source spans are admitted by the original constructor. @returns Nothing. */ () => {
  const map = new SfxItemPropertyMap([]),
    name = new OUString();
  try {
    expect(map.getProperties().getLength()).toBe(0);
    expect(map.getProperties().getLength()).toBe(0);
    expect(map.getByName(propertyNameView(name))).toBeNull();
  } finally {
    name.dispose();
    map.dispose();
  }
});
