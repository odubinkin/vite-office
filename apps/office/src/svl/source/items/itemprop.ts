/** @fileoverview Native SfxItemPropertyMap sorted borrowed-entry/cached-sequence mechanism and existing property-info projection from svl/source/items/itemprop.cxx. Full property-set/service integration remains unfinished. */
import {
  Property,
  cppu_detail_getUnoType_Property,
} from "../../../udkapi/com/sun/star/beans/Property";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
/** Existing host-array property-info projection; native XPropertySetInfo/entry-map component migration remains pending. */
export class SfxItemPropertySetInfo {
  /** Binds the represented native owner and its declared inputs. @param properties - Ordered native property values. @returns Nothing. */
  private readonly properties: readonly Property[];
  /** Copies the native descriptor map at construction. @param properties - Native map entries. @returns Metadata owner. */
  constructor(properties: readonly Property[]) {
    this.properties = properties.map(
      /** Executes this bounded native contract operation. @param property - Native operation input. @returns Native operation result. */ (
        property,
      ) => new Property(property),
    );
  }
  /** Implements the represented native getProperties operation. @returns The represented native operation result. */
  getProperties(): Property[] {
    return this.properties.map(
      /** Processes one ordered native value at this boundary. @param property - Original property input. @returns The represented native operation result. */
      (property) => new Property(property),
    );
  }
  /** Implements the represented native getPropertyByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyByName(name: OUStringConstReference): Property {
    const property = this.properties.find(
      /** Processes one ordered native value at this boundary. @param p - Original p input. @returns The represented native operation result. */
      (p) => text(p.Name) === text(name),
    );
    if (!property) throw new UnknownPropertyException(name, new Reference());
    return new Property(property);
  }
  /** Implements the represented native hasPropertyByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  hasPropertyByName(name: OUStringConstReference): boolean {
    return this.properties.some(
      /** Processes one ordered native value at this boundary. @param p - Original p input. @returns The represented native operation result. */
      (p) => text(p.Name) === text(name),
    );
  }
}

/** Reads native property names without locale processing. @param value - Native string. @returns UTF16 name. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}

import {
  SfxItemPropertyMapEntry,
  SfxItemPropertyMapCompare,
  propertyNameView,
  comparePropertyNames,
} from "../../inc/itemprop";
import { SortedVector } from "../../../o3tl/inc/sorted_vector";
import {
  Sequence,
  type SequenceReference,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { uno_type_assignData } from "../../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
const PropertySequence = Sequence.specialize<Property>(cppu_detail_getUnoType_Property, 32);
/** Original read-only pointer-vector surface; referenced entries retain their caller-owned schema lifetime. */
type PropertyEntries = Pick<
  SortedVector<SfxItemPropertyMapEntry>,
  "at" | "size" | typeof Symbol.iterator
>;
/** Native sorted schema index. Its entries are borrowed and its cached UNO property sequence is owned. */
export class SfxItemPropertyMap {
  private readonly m_aMap: SortedVector<SfxItemPropertyMapEntry>;
  private readonly m_aPropSeq: Sequence<Property>;
  /** Original span constructor and defaulted copy. JS references bind borrowed native entry pointers; pointer-vector copying inserts the same already ordered references, never cloned entries. @param source - Borrowed entry table or original map. @returns Map owner. */
  constructor(source: readonly SfxItemPropertyMapEntry[] | SfxItemPropertyMap) {
    const compare = new SfxItemPropertyMapCompare();
    this.m_aMap = new SortedVector(
      /** Original comparator policy. @param left - First pointer. @param right - Second pointer. @returns Strict order. */ (
        left,
        right,
      ) => compare.operatorCall(left, right),
    );
    this.m_aPropSeq =
      source instanceof SfxItemPropertyMap
        ? new PropertySequence(source.m_aPropSeq)
        : new PropertySequence();
    for (const entry of source instanceof SfxItemPropertyMap ? source.m_aMap : source) {
      if (!entry.aName.getLength()) throw new Error("assert(!pEntry.aName.isEmpty())");
      this.m_aMap.insert(entry);
    }
  }
  /** Original lower_bound with heterogeneous counted-name comparison. @param name - Borrowed native UTF16 view. @returns Original entry pointer or null. */
  getByName(name: Uint16Array): SfxItemPropertyMapEntry | null {
    let first = 0,
      count = this.m_aMap.size();
    while (count > 0) {
      const step = count >> 1,
        middle = first + step;
      const entry = this.m_aMap.at(middle) as SfxItemPropertyMapEntry;
      if (comparePropertyNames(propertyNameView(entry.aName), name) < 0) {
        first = middle + 1;
        count -= step + 1;
      } else count = step;
    }
    const entry = this.m_aMap.at(first);
    return entry && comparePropertyNames(name, propertyNameView(entry.aName)) === 0 ? entry : null;
  }
  /** Original lazily built cached property sequence, returned by const reference. Same-name schema insertion keeps the first pointer. @returns Borrowed cached sequence lvalue. */
  getProperties(): SequenceReference<Property> {
    if (this.m_aPropSeq.getLength() === 0) {
      this.m_aPropSeq.realloc(this.m_aMap.size());
      const array = this.m_aPropSeq.getArray() as SequenceElements;
      let index = 0;
      for (const entry of this.m_aMap) {
        const property = new Property(entry.aName, entry.nWID, entry.aType, entry.nFlags);
        try {
          // This binds generated native Property member assignment to the initialized sequence element, with actual UNO value ownership.
          uno_type_assignData(
            array.get(index * 32),
            cppu_detail_getUnoType_Property().getTypeLibType() as R,
            property,
            cppu_detail_getUnoType_Property().getTypeLibType(),
            cpp_queryInterface,
            cpp_acquire,
            cpp_release,
          );
        } finally {
          property.dispose();
        }
        ++index;
      }
    }
    return this.m_aPropSeq;
  }
  /** Original named descriptor copy or source UnknownPropertyException containing the requested name. @param name - Counted native name. @returns Owned property value. */
  getPropertyByName(name: OUStringConstReference): Property {
    const entry = this.getByName(propertyNameView(name));
    if (!entry) {
      const context = new Reference();
      try {
        throw new UnknownPropertyException(name, context);
      } finally {
        context.dispose();
      }
    }
    return new Property(name, entry.nWID, entry.aType, entry.nFlags);
  }
  /** Original named presence query. @param name - Borrowed native view. @returns Whether declared. */
  hasPropertyByName(name: Uint16Array): boolean {
    return this.getByName(name) !== null;
  }
  /** Original const reference to the pointer index. @returns Borrowed sorted entries. */
  getPropertyEntries(): PropertyEntries {
    return this.m_aMap;
  }
  /** Original owned cached value destruction; borrowed entries are not destroyed. @returns Nothing. */
  dispose(): void {
    this.m_aPropSeq.dispose();
  }
}

import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
