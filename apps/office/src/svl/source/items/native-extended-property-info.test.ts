/** @fileoverview Original extended property-info component value ownership, sorted merging, descriptor COW and actual UNO/weak lifetime. */
import { expect, it } from "vitest";
import { SfxExtItemPropertySetInfo } from "./itemprop";
import { SfxItemPropertyMapEntry as Entry } from "../../inc/itemprop";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceReference,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../../cppu/inc/unotype";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { WeakReferenceHelper } from "../../../cppuhelper/source/weak";
import { unicode, text } from "../../../sw/source/core/unocore/unocrsrhelper";
import { uno_type_assignData } from "../../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
const Properties = Sequence.specialize<Property>(propertyType, 32);
/** Actual generated native descriptor with owned name/type. @param name - Native name. @param handle - Signed descriptor handle. @returns Owned value. */
function descriptor(name: string, handle: number): Property {
  const key = unicode(name);
  try {
    return new Property(key, handle, UnoType.get("sal_Int32"), 1);
  } finally {
    key.dispose();
  }
}
/** Actual native static-schema entry value. @param name - Native name. @param which - Native WhichId. @returns Owned value. */
function entry(name: string, which: number): Entry {
  const key = unicode(name);
  try {
    return new Entry(key, which, UnoType.get("bool"), 16, 0);
  } finally {
    key.dispose();
  }
}
/** Original generated struct assignment at a native sequence element. @param values - Actual sequence. @param index - Element. @param value - Borrowed descriptor. @returns Nothing. */
function put(values: Sequence<Property>, index: number, value: Property): void {
  expect(
    uno_type_assignData(
      (values.getArray() as SequenceElements).get(index * 32),
      propertyType().getTypeLibType() as R,
      value,
      propertyType().getTypeLibType(),
      cpp_queryInterface,
      cpp_acquire,
      cpp_release,
    ),
  ).toBe(true);
}
/** Copies one actual native sequence element. @param values - Actual sequence. @param index - Element. @returns Owned descriptor. */
function get(values: SequenceReference<Property>, index: number): Property {
  const result = new Property();
  expect(
    uno_type_assignData(
      result,
      propertyType().getTypeLibType() as R,
      (values.getConstArray() as SequenceElements).get(index * 32),
      propertyType().getTypeLibType(),
      cpp_queryInterface,
      cpp_acquire,
      cpp_release,
    ),
  ).toBe(true);
  return result;
}
/** Observes original descriptors without keeping borrowed members alive. @param values - Native sequence. @returns Scalar rows. */
function rows(values: SequenceReference<Property>): [string, number, number][] {
  const result: [string, number, number][] = [];
  for (let i = 0; i < values.getLength(); ++i) {
    const value = get(values, i);
    try {
      result.push([text(value.Name), value.Handle, value.Attributes]);
    } finally {
      value.dispose();
    }
  }
  return result;
}

it("owns copied values and merges both sources in native UTF16 order with first-name precedence", /** Uses actual entries and Sequence<Property>, never a host descriptor array masquerading as UNO. @returns Nothing. */ () => {
  const entries = [entry("b", 7), entry("a", 8), entry("b", 9)],
    sequence = new Properties(3),
    external = [descriptor("b", 90), descriptor("c", 10), descriptor("c", 11)];
  external.forEach(
    /** Assigns genuine descriptor members. @param value - Native descriptor. @param index - Sequence index. @returns Nothing. */ (
      value,
      index,
    ) => put(sequence, index, value),
  );
  const owner = new SfxExtItemPropertySetInfo(entries, sequence),
    strong = new Reference(owner);
  for (const value of entries) value.dispose();
  for (const value of external) value.dispose();
  sequence.dispose();
  try {
    const result = owner.getProperties();
    try {
      expect(rows(result)).toEqual([
        ["a", 8, 16],
        ["b", 7, 16],
        ["c", 10, 1],
      ]);
    } finally {
      result.dispose();
    }
    const name = unicode("c"),
      property = owner.getPropertyByName(name);
    try {
      expect(text(property.Type.getTypeName())).toBe("long");
      expect(property.Handle).toBe(10);
    } finally {
      property.dispose();
      name.dispose();
    }
  } finally {
    strong.dispose();
  }
});

it("returns separate COW handles and keeps returned descriptors alive beyond component destruction", /** The cache and returned sequence have real independent native ownership. @returns Nothing. */ () => {
  const source = new Properties(1),
    value = descriptor("original", 12);
  put(source, 0, value);
  value.dispose();
  const object = new SfxExtItemPropertySetInfo([], source),
    strong = new Reference(object),
    first = object.getProperties(),
    second = object.getProperties(),
    changed = descriptor("changed", 99);
  source.dispose();
  try {
    expect(first).not.toBe(second);
    expect(first.get()).toBe(second.get());
    put(first, 0, changed);
    expect(first.get()).not.toBe(second.get());
    expect(rows(first)).toEqual([["changed", 99, 1]]);
    expect(rows(second)).toEqual([["original", 12, 1]]);
    const third = object.getProperties();
    try {
      expect(third.get()).toBe(second.get());
    } finally {
      third.dispose();
    }
    strong.dispose();
    expect(rows(second)).toEqual([["original", 12, 1]]);
  } finally {
    changed.dispose();
    first.dispose();
    second.dispose();
  }
});

it("uses the genuine complete XPropertySetInfo weak/type-provider component and actual final release", /** Queries real declared interfaces and weak adapter without a substitute provider or subclass. @returns Nothing. */ () => {
  const sequence = new Properties(),
    object = new SfxExtItemPropertySetInfo([], sequence),
    strong = new Reference(object),
    weak = new WeakReferenceHelper(strong),
    queried = new Reference<XPropertySetInfo>(
      strong,
      UNO_QUERY_THROW,
      XPropertySetInfo.static_type,
    ),
    types = new Reference<XTypeProvider>(strong, UNO_QUERY_THROW, XTypeProvider.static_type);
  sequence.dispose();
  try {
    expect(queried.get()).toBe(object);
    expect(types.get()).toBe(object);
    const props = (queried.get() as XPropertySetInfo).getProperties();
    try {
      expect(props.getLength()).toBe(0);
    } finally {
      props.dispose();
    }
    const again = object.getProperties();
    try {
      expect(again.getLength()).toBe(0);
    } finally {
      again.dispose();
    }
    strong.dispose();
    let hardened = weak.get();
    try {
      expect(hardened.get()).toBe(object);
    } finally {
      hardened.dispose();
    }
    queried.dispose();
    types.dispose();
    hardened = weak.get();
    try {
      expect(hardened.is()).toBe(false);
    } finally {
      hardened.dispose();
    }
  } finally {
    weak.dispose();
  }
});

it("retains source signed handle narrowing followed by unsigned WhichId conversion", /** Native negative handles are not replaced with synthetic fallback identifiers. @returns Nothing. */ () => {
  const input = new Properties(2),
    negative = descriptor("negative", -1),
    lower = descriptor("lower", -32768);
  put(input, 0, negative);
  put(input, 1, lower);
  const object = new SfxExtItemPropertySetInfo([], input),
    strong = new Reference(object);
  negative.dispose();
  lower.dispose();
  input.dispose();
  try {
    const result = object.getProperties();
    try {
      expect(rows(result)).toEqual([
        ["lower", 32768, 1],
        ["negative", 65535, 1],
      ]);
    } finally {
      result.dispose();
    }
  } finally {
    strong.dispose();
  }
});

it("preserves counted NUL, surrogate and case distinctions through actual native lookup", /** Native lexical comparison and exact unknown-property Message are tested without host locale collation. @returns Nothing. */ () => {
  const entries = [entry("a\u0000b", 1), entry("a", 2), entry("\ud800", 3), entry("A", 4)],
    input = new Properties(),
    object = new SfxExtItemPropertySetInfo(entries, input),
    strong = new Reference(object);
  input.dispose();
  for (const value of entries) value.dispose();
  try {
    for (const [name, which] of [
      ["a\u0000b", 1],
      ["a", 2],
      ["\ud800", 3],
      ["A", 4],
    ] as const) {
      const key = unicode(name);
      try {
        expect(object.hasPropertyByName(key)).toBe(true);
        const value = object.getPropertyByName(key);
        try {
          expect(value.Handle).toBe(which);
          expect(text(value.Name)).toBe(name);
        } finally {
          value.dispose();
        }
      } finally {
        key.dispose();
      }
    }
    for (const name of ["", "a\u0000", "Z", "\uffff"]) {
      const key = unicode(name);
      try {
        expect(object.hasPropertyByName(key)).toBe(false);
        try {
          object.getPropertyByName(key);
          throw new Error("Expected UnknownPropertyException");
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
        key.dispose();
      }
    }
  } finally {
    strong.dispose();
  }
});

it("retains original checked handle range and unwinds constructed value members on invalid extension", /** Invalid signed handle input exercises the actual constructor assertion rather than an invalid pool graph. @returns Nothing. */ () => {
  const source = new Properties(1),
    value = descriptor("invalid", 32768),
    schema = entry("kept", 1);
  put(source, 0, value);
  try {
    expect(
      /** Executes the original checked constructor. @returns No successful component. */ () =>
        new SfxExtItemPropertySetInfo([schema], source),
    ).toThrow("static_int_cast");
  } finally {
    schema.dispose();
    value.dispose();
    source.dispose();
  }
});
