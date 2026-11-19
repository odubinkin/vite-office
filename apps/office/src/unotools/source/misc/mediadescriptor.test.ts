/** @fileoverview Original ComponentData get/set/clear semantics with real Any, sequence owners, NamedValueCollection and map copies. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  PROP_COMPONENTDATA,
  getComponentDataEntry,
  setComponentDataEntry,
  clearComponentDataEntry,
} from "../../inc/mediadescriptor";
/** Actual descriptor and Unicode keys are released after each caller. @param action - Native operations. @returns Nothing. */
function withData(
  action: (
    data: SequenceAsHashMap,
    first: ReturnType<typeof unicode>,
    second: ReturnType<typeof unicode>,
  ) => void,
): void {
  const data = new SequenceAsHashMap(),
    first = unicode("A\0字😀"),
    second = unicode("B");
  try {
    action(data, first, second);
  } finally {
    data.dispose();
    first.dispose();
    second.dispose();
  }
}
it("creates named sequences by default, replaces values and returns independently owned copies", /** The copied Any survives replacement and descriptor destruction. @returns Nothing. */ () => {
  let retained: Any | undefined;
  withData(
    /** Operates on real map entries. @param data - Descriptor. @param first - First key. @param second - Second key. @returns Nothing. */ (
      data,
      first,
      second,
    ) => {
      expect(text(PROP_COMPONENTDATA)).toBe("ComponentData");
      const missing = getComponentDataEntry(data, first),
        one = new Any([1], "sal_Int32"),
        two = new Any([2], "sal_Int32");
      expect(missing.hasValue()).toBe(false);
      missing.dispose();
      try {
        setComponentDataEntry(data, first, one);
        setComponentDataEntry(data, second, two);
        expect(data.find(PROP_COMPONENTDATA)?.[1].has(["Sequence", namedType])).toBe(true);
        retained = getComponentDataEntry(data, first);
        setComponentDataEntry(data, first, two);
        const current = getComponentDataEntry(data, first);
        try {
          expect(current.get("sal_Int32")).toBe(2);
          expect(retained.get("sal_Int32")).toBe(1);
        } finally {
          current.dispose();
        }
        clearComponentDataEntry(data, first);
        expect(data.contains(PROP_COMPONENTDATA)).toBe(true);
        clearComponentDataEntry(data, second);
        expect(data.contains(PROP_COMPONENTDATA)).toBe(false);
        clearComponentDataEntry(data, second);
      } finally {
        one.dispose();
        two.dispose();
      }
    },
  );
  expect(retained?.get("sal_Int32")).toBe(1);
  retained?.dispose();
});
it.each([true, false])(
  "retains original sequence kind %s and copy-on-write snapshots",
  /** Original caller-created empty sequence determines kind. @param properties - Sequence selector. @returns Nothing. */ (
    properties,
  ) => {
    withData(
      /** Keeps a genuine prior sequence/Any snapshot. @param data - Descriptor. @param first - First key. @param second - Missing key. @returns Nothing. */ (
        data,
        first,
        second,
      ) => {
        const values = properties
            ? new (Sequence.specialize<PropertyValue>(propertyType, 48))()
            : new (Sequence.specialize<NamedValue>(namedType, 32))(),
          kind = properties ? propertyType : namedType,
          wrapped = new Any(values.getAddress(), ["Sequence", kind]),
          value = new Any(false),
          empty = new Any();
        try {
          data.operatorIndex(PROP_COMPONENTDATA).assign(wrapped);
          setComponentDataEntry(data, first, value);
          const snapshot = new SequenceAsHashMap(wrapped);
          expect(snapshot.empty()).toBe(true);
          snapshot.dispose();
          clearComponentDataEntry(data, second);
          const copy = getComponentDataEntry(data, first);
          expect(copy.getBoolean()).toBe(false);
          copy.dispose();
          setComponentDataEntry(data, first, empty);
          expect(data.contains(PROP_COMPONENTDATA)).toBe(false);
          expect(values.getLength()).toBe(0);
        } finally {
          empty.dispose();
          value.dispose();
          wrapped.dispose();
          values.dispose();
        }
      },
    );
  },
);
it("keeps unsupported and VOID component properties unchanged in release behavior", /** Debug OSL_ENSURE diagnostics are not replaced by mutation or a successful conversion. @returns Nothing. */ () => {
  withData(
    /** Uses original public Any states. @param data - Descriptor. @param first - Key. @returns Nothing. */ (
      data,
      first,
    ) => {
      const unsupported = new Any([9], "sal_Int32"),
        replacement = new Any([7], "sal_Int32"),
        empty = new Any();
      try {
        data.operatorIndex(PROP_COMPONENTDATA).assign(unsupported);
        setComponentDataEntry(data, first, replacement);
        clearComponentDataEntry(data, first);
        expect(data.find(PROP_COMPONENTDATA)?.[1].get("sal_Int32")).toBe(9);
        const absent = getComponentDataEntry(data, first);
        expect(absent.hasValue()).toBe(false);
        absent.dispose();
        data.operatorIndex(PROP_COMPONENTDATA).assign(empty);
        clearComponentDataEntry(data, first);
        expect(data.contains(PROP_COMPONENTDATA)).toBe(true);
        setComponentDataEntry(data, first, empty);
        expect(data.contains(PROP_COMPONENTDATA)).toBe(true);
      } finally {
        empty.dispose();
        replacement.dispose();
        unsupported.dispose();
      }
    },
  );
});
