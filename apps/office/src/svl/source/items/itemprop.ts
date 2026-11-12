/** @fileoverview Native SfxItemPropertyMap sorted borrowed schema and genuine ordinary/extended property-info components from svl/source/items/itemprop.cxx. Full property-set/service integration remains unfinished. */
import {
  Property,
  cppu_detail_getUnoType_Property,
} from "../../../udkapi/com/sun/star/beans/Property";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
/** Original template-linkage base over the genuine complete XPropertySetInfo interface. */
export class SfxItemPropertySetInfo_Base extends WeakImplHelper.specialize(XPropertySetInfo) {}
/** Original ordinary metadata component copies the pointer map while borrowing its caller's immutable schema lifetime. */
export class SfxItemPropertySetInfo
  extends SfxItemPropertySetInfo_Base
  implements XPropertySetInfo
{
  private readonly m_aOwnMap: SfxItemPropertyMap;
  /** Original span and const-map constructors. @param source - Actual native schema or pointer map. @returns Component at native zero strong count. */
  constructor(source: readonly SfxItemPropertyMapEntry[] | SfxItemPropertyMap) {
    super();
    this.m_aOwnMap = new SfxItemPropertyMap(source);
  }
  /** Original by-value return copies the actual cached sequence handle. @returns Owning UNO sequence. */
  getProperties(): Sequence<Property> {
    return new PropertySequence(this.m_aOwnMap.getProperties());
  }
  /** Original map delegation. @param name - Native counted name. @returns Owned property value. */
  getPropertyByName(name: OUStringConstReference): Property {
    return this.m_aOwnMap.getPropertyByName(name);
  }
  /** Original exact presence lookup. @param name - Native counted name. @returns Original flag. */
  hasPropertyByName(name: OUStringConstReference): boolean {
    return this.m_aOwnMap.hasPropertyByName(propertyNameView(name));
  }
  /** Original member destruction on the actual last strong release. @returns Nothing. */
  protected override destroy(): void {
    this.m_aOwnMap.dispose();
    super.destroy();
  }
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

import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { MAYBEVOID } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { SfxItemPool } from "./itempool";
import { SfxItemSet, SfxItemState } from "./itemset";
import type { SfxPoolItem } from "./poolitem";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original plain property-set owner with native value/state helpers and lazy genuine metadata component. */
export class SfxItemPropertySet {
  private readonly m_aMap: SfxItemPropertyMap;
  private readonly m_xInfo = new Reference<SfxItemPropertySetInfo>();
  /** Original span constructor borrows its caller's static schema through the map. @param entries - Actual native entries. @returns Owner. */
  constructor(entries: readonly SfxItemPropertyMapEntry[]) {
    this.m_aMap = new SfxItemPropertyMap(entries);
  }
  /** Original static value read retains item-state gating, pool default selection and enum normalization. MAYBEVOID does not clear the caller's existing Any. @param entry - Native descriptor. @param set - Actual item set. @param output - Caller-owned Any. @returns Nothing. */
  static getPropertyValue(entry: SfxItemPropertyMapEntry, set: SfxItemSet, output: Any): void {
    const item: [SfxPoolItem | null] = [null];
    const state = set.GetItemState(entry.nWID, true, item);
    if (state !== SfxItemState.SET && SfxItemPool.IsWhich(entry.nWID))
      item[0] = set.GetPool().GetUserOrPoolDefaultItem(entry.nWID);
    if (state >= SfxItemState.DEFAULT && item[0]) {
      (item[0] as SfxPoolItem & { QueryValue(value: Any, member: number): boolean }).QueryValue(
        output,
        entry.nMemberId,
      );
    } else if (!(entry.nFlags & MAYBEVOID)) {
      const units = Uint16Array.from(
        "Property not found in ItemSet but not MAYBEVOID?",
        /** Exact source diagnostic units. @param character - Source unit. @returns Unit. */ (
          character,
        ) => character.charCodeAt(0),
      );
      const message = new OUString(units, units.length),
        context = new Reference();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (
      entry.aType.getTypeClass() === TypeClass.ENUM &&
      entry.aType.getTypeClass() !== output.getValueTypeClass()
    ) {
      const value: [number] = [0];
      if (output.extract(value, "sal_Int32")) output.setValue(value, entry.aType);
    }
  }
  /** Original named read overload returns an owned Any. @param name - Native name. @param set - Actual item set. @returns Owned result. */
  getPropertyValue(name: OUStringConstReference, set: SfxItemSet): Any;
  /** Original named read overload writes the caller's Any. @param name - Native name. @param set - Actual item set. @param output - Actual output. @returns Nothing. */
  getPropertyValue(name: OUStringConstReference, set: SfxItemSet, output: Any): void;
  /** Compiler overload binding; by-value temporary destruction remains exception safe. @param name - Native name. @param set - Actual item set. @param output - Optional original output argument. @returns Original owned value or nothing. */
  getPropertyValue(name: OUStringConstReference, set: SfxItemSet, output?: Any): Any | void {
    if (output === undefined) {
      const value = new Any();
      try {
        this.getPropertyValue(name, set, value);
        return value;
      } catch (error) {
        value.dispose();
        throw error;
      }
    }
    const entry = this.m_aMap.getByName(propertyNameView(name));
    if (!entry) this.unknown(name);
    SfxItemPropertySet.getPropertyValue(entry, set, output);
  }
  /** Original static write clones the effective source item and transfers that clone only after successful PutValue. Rejected values preserve the actual set. @param entry - Native descriptor. @param value - Borrowed Any. @param set - Actual destination. @param ignore - Original ignore flag. @returns Nothing. */
  static setPropertyValue(
    entry: SfxItemPropertyMapEntry,
    value: Any,
    set: SfxItemSet,
    ignore = false,
  ): void {
    const item: [SfxPoolItem | null] = [null];
    const state = set.GetItemState(entry.nWID, true, item);
    if (state !== SfxItemState.SET && SfxItemPool.IsWhich(entry.nWID))
      item[0] = set.GetPool().GetUserOrPoolDefaultItem(entry.nWID);
    if (!item[0]) return;
    const copy = item[0].Clone();
    if (!copy) return;
    let owned = true;
    try {
      if (!copy.PutValue(value, entry.nMemberId)) {
        if (ignore) return;
        throw new IllegalArgumentException();
      }
      owned = false;
      set.Put(copy, true);
    } finally {
      if (owned) copy.Dispose();
    }
  }
  /** Original named setter checks the name before delegating, preserving ignore-unknown behavior. @param name - Native name. @param value - Borrowed Any. @param set - Actual set. @param ignore - Original ignore flag. @returns Nothing. */
  setPropertyValue(
    name: OUStringConstReference,
    value: Any,
    set: SfxItemSet,
    ignore = false,
  ): void {
    const entry = this.m_aMap.getByName(propertyNameView(name));
    if (!entry) {
      if (ignore) return;
      this.unknown(name);
    }
    SfxItemPropertySet.setPropertyValue(entry, value, set, ignore);
  }
  /** Original state reflection deliberately uses shallow state and no value query/default normalization. @param entry - Native descriptor. @param set - Actual set. @returns Native state. */
  static getPropertyState(entry: SfxItemPropertyMapEntry, set: SfxItemSet): PropertyState {
    const state = set.GetItemState(entry.nWID, false);
    return state === SfxItemState.DEFAULT
      ? PropertyState.DEFAULT_VALUE
      : state < SfxItemState.DEFAULT
        ? PropertyState.AMBIGUOUS_VALUE
        : PropertyState.DIRECT_VALUE;
  }
  /** Original named state query also rejects a declared zero WhichId. @param name - Native name. @param set - Actual set. @returns Native state. */
  getPropertyState(name: OUStringConstReference, set: SfxItemSet): PropertyState {
    const entry = this.m_aMap.getByName(propertyNameView(name));
    if (!entry || !entry.nWID) this.unknown(name);
    return SfxItemPropertySet.getPropertyState(entry, set);
  }
  /** Original lazy rtl::Reference member and const-reference return; the existing one-pointer strong Reference binds the same acquire/release ownership without an extra query. @returns Borrowed member reference; callers copy when returning by value. */
  getPropertySetInfo(): Readonly<Reference<SfxItemPropertySetInfo>> {
    if (!this.m_xInfo.is()) this.m_xInfo.assign(new SfxItemPropertySetInfo(this.m_aMap));
    return this.m_xInfo;
  }
  /** Original map reference getter. @returns Borrowed map owner. */
  getPropertyMap(): SfxItemPropertyMap {
    return this.m_aMap;
  }
  /** Original named exception construction with empty generated default context. @param name - Requested native name. @returns Never. */
  private unknown(name: OUStringConstReference): never {
    const context = new Reference();
    try {
      throw new UnknownPropertyException(name, context);
    } finally {
      context.dispose();
    }
  }
  /** Original owned-map destruction; entry-table lifetime belongs to its caller. @returns Nothing. */
  dispose(): void {
    this.m_xInfo.dispose();
    this.m_aMap.dispose();
  }
}

import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { SfxItemPropertyMapCompare2 } from "../../inc/itemprop";
/** Original MSVC template-linkage base; its complete declared interface uses the genuine weak/type-provider implementation. */
export class SfxExtItemPropertySetInfo_Base extends WeakImplHelper.specialize(XPropertySetInfo) {}
/** Original extended metadata component owns its copied entry values, unlike SfxItemPropertyMap's borrowed pointer table. */
export class SfxExtItemPropertySetInfo
  extends SfxExtItemPropertySetInfo_Base
  implements XPropertySetInfo
{
  private readonly maMap: SortedVector<SfxItemPropertyMapEntry>;
  private readonly m_aPropSeq = new PropertySequence();
  /** Original entry-span plus external sequence constructor; first same-name insertion wins, including original schema over extension descriptors. @param entries - Borrowed native schema. @param properties - Borrowed actual UNO sequence. @returns Component at native zero reference count. */
  constructor(
    entries: readonly SfxItemPropertyMapEntry[],
    properties: SequenceReference<Property>,
  ) {
    super();
    const compare = new SfxItemPropertyMapCompare2();
    this.maMap = new SortedVector(
      /** Compiler-bound value comparator. @param left - First value. @param right - Second value. @returns Strict order. */ (
        left,
        right,
      ) => compare.operatorCall(left, right),
    );
    try {
      for (const entry of entries) {
        if (!entry.aName.getLength()) throw new Error("assert(!rEntry.aName.isEmpty())");
        // Erased vector<const Value&> insertion copies only an accepted value.
        if (this.maMap.find(entry) < 0) this.maMap.insert(new SfxItemPropertyMapEntry(entry));
      }
      const array = properties.getConstArray() as SequenceElements;
      for (let index = 0; index < properties.getLength(); ++index) {
        const property = new Property();
        try {
          uno_type_assignData(
            property,
            cppu_detail_getUnoType_Property().getTypeLibType() as R,
            array.get(index * 32),
            cppu_detail_getUnoType_Property().getTypeLibType(),
            cpp_queryInterface,
            cpp_acquire,
            cpp_release,
          );
          // sal::static_int_cast<sal_Int16> checks the signed source range before nWID's unsigned conversion.
          if (property.Handle < -32768 || property.Handle > 32767)
            throw new Error("assert(sal::static_int_cast<sal_Int16>(rProp.Handle))");
          const entry = new SfxItemPropertyMapEntry(
            property.Name,
            property.Handle,
            property.Type,
            property.Attributes,
            0,
          );
          try {
            if (this.maMap.find(entry) < 0) this.maMap.insert(new SfxItemPropertyMapEntry(entry));
          } finally {
            entry.dispose();
          }
        } finally {
          property.dispose();
        }
      }
    } catch (error) {
      // C++ unwinds already constructed vector/sequence members if this constructor throws.
      this.destroy();
      throw error;
    }
  }
  /** Original lazy cache returns an owning sequence copy; callers cannot mutate the cache through COW. @returns Owned descriptor sequence. */
  getProperties(): Sequence<Property> {
    if (!this.m_aPropSeq.getLength()) {
      this.m_aPropSeq.realloc(this.maMap.size());
      const array = this.m_aPropSeq.getArray() as SequenceElements;
      let index = 0;
      for (const entry of this.maMap) {
        const property = new Property(entry.aName, entry.nWID, entry.aType, entry.nFlags);
        try {
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
    return new PropertySequence(this.m_aPropSeq);
  }
  /** Original lookup copies the requested name and declared fields or throws UnknownPropertyException. @param name - Exact counted native name. @returns Owned descriptor. */
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
  /** Original named presence query. @param name - Exact counted native name. @returns Whether present. */
  hasPropertyByName(name: OUStringConstReference): boolean {
    return this.getByName(propertyNameView(name)) !== null;
  }
  /** Original heterogeneous lower_bound over value entries, without string conversion or locale sorting. @param name - Native UTF16 view. @returns Borrowed value or null. */
  private getByName(name: Uint16Array): SfxItemPropertyMapEntry | null {
    let first = 0,
      count = this.maMap.size();
    while (count > 0) {
      const step = count >> 1,
        middle = first + step;
      const entry = this.maMap.at(middle) as SfxItemPropertyMapEntry;
      if (comparePropertyNames(propertyNameView(entry.aName), name) < 0) {
        first = middle + 1;
        count -= step + 1;
      } else count = step;
    }
    const entry = this.maMap.at(first);
    return entry && comparePropertyNames(name, propertyNameView(entry.aName)) === 0 ? entry : null;
  }
  /** Original derived destructor releases cached descriptors and value-vector members at the actual final strong release. @returns Nothing. */
  protected override destroy(): void {
    this.m_aPropSeq.dispose();
    for (let index = this.maMap.size(); index > 0; --index)
      (this.maMap.at(index - 1) as SfxItemPropertyMapEntry).dispose();
    this.maMap.clear();
    super.destroy();
  }
}
