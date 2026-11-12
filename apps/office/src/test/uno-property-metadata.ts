/** @fileoverview Scoped test observations of genuine XPropertySetInfo References and generated Sequence<Property>, with actual value destruction after each test. No provider or schema is fabricated. */
import { afterEach } from "vitest";
import type { Reference } from "../cppu/inc/com/sun/star/uno/Reference";
import type { XPropertySetInfo } from "../udkapi/com/sun/star/beans/XPropertySetInfo";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../udkapi/com/sun/star/beans/Property";
import type { SequenceElements } from "../cppu/inc/com/sun/star/uno/Sequence";
import { uno_type_assignData } from "../cppu/inc/uno/data";
import { cpp_queryInterface, cpp_acquire, cpp_release } from "../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../cppu/inc/typelib/typedescription";
const references: Reference<XPropertySetInfo>[] = [];
const values: Property[] = [];
afterEach(
  /** Destroys fixture-owned descriptor values before their real interface References. @returns Nothing. */ () => {
    for (const value of values.splice(0)) value.dispose();
    for (const reference of references.splice(0)) reference.dispose();
  },
);
/** Keeps an actual returned interface Reference alive for this test scope. @param reference - Actual model result. @returns Borrowed genuine component. */
export function metadata(reference: Reference<XPropertySetInfo>): XPropertySetInfo {
  references.push(reference);
  const value = reference.get();
  if (!value) throw new Error("Expected actual property metadata");
  return value;
}
/** Observes actual descriptor sequence values; the test scope owns all resulting generated copies. @param info - Genuine component. @returns Descriptor observations. */
export function descriptors(info: XPropertySetInfo): readonly Property[] {
  const sequence = info.getProperties(),
    result: Property[] = [];
  try {
    for (let index = 0; index < sequence.getLength(); ++index) {
      const property = new Property();
      uno_type_assignData(
        property,
        propertyType().getTypeLibType() as R,
        (sequence.getConstArray() as SequenceElements).get(index * 32),
        propertyType().getTypeLibType(),
        cpp_queryInterface,
        cpp_acquire,
        cpp_release,
      );
      values.push(property);
      result.push(property);
    }
    return result;
  } finally {
    sequence.dispose();
  }
}
