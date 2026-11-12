/** @fileoverview Original complete property-array helper and immutable PropertySetInfo snapshot over actual native UNO sequence/value owners. Notification and property-set helpers are separate, still unported source owners. */
import { Sequence, type SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper } from "../inc/implbase";
import { XPropertySetInfo } from "../../udkapi/com/sun/star/beans/XPropertySetInfo";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
  type PropertyConstReference,
} from "../../udkapi/com/sun/star/beans/Property";
import { UnknownPropertyException } from "../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { uno_type_assignData } from "../../cppu/inc/uno/data";
import {
  cpp_acquire,
  cpp_release,
  cpp_queryInterface,
} from "../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../cppu/inc/typelib/typedescription";
const Properties = Sequence.specialize<Property>(propertyType, 32);
/** Original property descriptor access interface; no component or descriptor provider is synthesized. */
export abstract class IPropertyArrayHelper {
  /** Original optional output parameters, left untouched on failure. @param name - Name output or null. @param attributes - Attribute output or null. @param handle - Handle. @returns Whether found. */
  abstract fillPropertyMembersByHandle(
    name: OUString | null,
    attributes: [number] | null,
    handle: number,
  ): boolean;
  /** Original name-sorted description sequence. @returns Owned sequence. */
  abstract getProperties(): Sequence<Property>;
  /** Original named descriptor copy. @param name - Name. @returns Owned descriptor. */
  abstract getPropertyByName(name: OUStringConstReference): Property;
  /** Original name lookup. @param name - Name. @returns Presence. */
  abstract hasPropertyByName(name: OUStringConstReference): boolean;
  /** Original lookup returning minus one when absent. @param name - Name. @returns Handle. */
  abstract getHandleByName(name: OUStringConstReference): number;
  /** Original sorted-name batch lookup with source hybrid linear/binary cursor semantics. @param handles - Caller output array. @param names - Native input sequence. @returns Hit count. */
  abstract fillHandles(handles: number[], names: Sequence<OUString>): number;
  /** Original virtual destruction. @returns Nothing. */
  abstract dispose(): void;
}
/** Borrows one actual initialized sequence element; introduces no Property owner. @param values - Actual native element storage. @param index - Element index. @returns Existing fields. */
function property(values: SequenceElements, index: number): PropertyConstReference {
  return Property.unacquired(values.get(index * 32) as { get(offset: number): unknown });
}
/** Original bsearch comparator and lookup over name-sorted actual descriptors. Equal-key selection is C-library-specific and unqualified. @param values - Actual sequence. @param name - Name key. @returns Actual borrowed descriptor or null. */
function find(
  values: Sequence<Property>,
  name: OUStringConstReference,
): PropertyConstReference | null {
  const array = values.getConstArray() as SequenceElements;
  let first = 0,
    length = values.getLength();
  while (length > 0) {
    const half = Math.floor(length / 2),
      index = first + half,
      value = property(array, index),
      comparison = name.compareTo(value.Name);
    if (comparison === 0) return value;
    if (comparison > 0) {
      first = index + 1;
      length -= half + 1;
    } else length = half;
  }
  return null;
}
/** Original UnknownPropertyException(name), with the actual generated empty default Context. @param name - Unknown key. @returns Never. */
function unknown(name: OUStringConstReference): never {
  const context = new Reference();
  try {
    throw new UnknownPropertyException(name, context);
  } finally {
    context.dispose();
  }
}
/** Original descriptor array, native Sequence COW and indexed-handle optimization. */
export class OPropertyArrayHelper extends IPropertyArrayHelper {
  protected readonly m_pReserved = null;
  private readonly aInfos: Sequence<Property>;
  private bRightOrdered = false;
  /** Original sequence-copy and initialized-array/count overloads. @param args - Declared source overload. @returns Helper. */
  constructor(
    ...args:
      | [values: Sequence<Property>, sorted?: boolean]
      | [values: SequenceElements | null, count: number, sorted?: boolean]
  ) {
    super();
    if (args[0] instanceof Sequence) {
      this.aInfos = new Properties(args[0]);
      this.init((args[1] as boolean | undefined) ?? true);
    } else {
      this.aInfos = new Properties(args[0], args[1] as number);
      this.init(args[2] ?? true);
    }
  }
  /** Original implicit member destruction. @returns Nothing. */
  override dispose(): void {
    this.aInfos.dispose();
  }
  /** Original nonconst sequence subscripts detach before reading; an incorrect sorted hint diagnoses but still sorts. @param sorted - Original diagnostic-only hint. @returns Nothing. */
  private init(sorted: boolean): void {
    const count = this.aInfos.getLength();
    for (let i = 1; i < count; ++i) {
      const values = this.aInfos.getArray() as SequenceElements;
      if (property(values, i - 1).Name.compareTo(property(values, i).Name) > 0) {
        void sorted; // OSL_FAIL is a diagnostic, not a different sorting policy.
        const copies: Property[] = [];
        try {
          for (let n = 0; n < count; ++n) copies.push(new Property(property(values, n)));
          copies.sort(
            /** Original qsort name comparator. @param a - Left. @param b - Right. @returns Signed order. */ (
              a,
              b,
            ) => a.Name.compareTo(b.Name),
          );
          const type = propertyType().getTypeLibType() as R;
          for (let n = 0; n < count; ++n)
            void uno_type_assignData(
              values.get(n * 32),
              type,
              copies[n],
              type,
              cpp_queryInterface,
              cpp_acquire,
              cpp_release,
            );
        } finally {
          for (const value of copies) value.dispose();
        }
        break;
      }
    }
    for (let i = 0; i < count; ++i)
      if (property(this.aInfos.getArray() as SequenceElements, i).Handle !== i) return;
    this.bRightOrdered = true;
  }
  /** Original descriptor count. @returns Length. */
  getCount(): number {
    return this.aInfos.getLength();
  }
  /** Original direct index or linear handle lookup, preserving nullable outputs. @param name - Optional owned string output. @param attributes - Optional signed16 cell. @param handle - Signed32 key. @returns Presence. */
  override fillPropertyMembersByHandle(
    name: OUString | null,
    attributes: [number] | null,
    handle: number,
  ): boolean {
    const count = this.aInfos.getLength();
    if (this.bRightOrdered) {
      if (handle < 0 || handle >= count) return false;
      const value = property(this.aInfos.getArray() as SequenceElements, handle);
      if (name) name.assign(value.Name);
      if (attributes) attributes[0] = value.Attributes;
      return true;
    }
    for (let i = 0; i < count; ++i) {
      const value = property(this.aInfos.getArray() as SequenceElements, i);
      if (value.Handle === handle) {
        if (name) name.assign(value.Name);
        if (attributes) attributes[0] = value.Attributes;
        return true;
      }
    }
    return false;
  }
  /** Original acquired sequence copy; callers mutate via native COW. @returns Owned shared sequence. */
  override getProperties(): Sequence<Property> {
    return new Properties(this.aInfos);
  }
  /** Original bsearch and generated descriptor copy. @param name - Name. @returns Owned descriptor. */
  override getPropertyByName(name: OUStringConstReference): Property {
    const value = find(this.aInfos, name);
    if (!value) unknown(name);
    return new Property(value);
  }
  /** Original bsearch presence. @param name - Name. @returns Presence. */
  override hasPropertyByName(name: OUStringConstReference): boolean {
    return find(this.aInfos, name) !== null;
  }
  /** Original bsearch handle or minus one. @param name - Name. @returns Handle. */
  override getHandleByName(name: OUStringConstReference): number {
    return find(this.aInfos, name)?.Handle ?? -1;
  }
  /** Original hybrid algorithm, including its branch-dependent handling of repeated sorted names. @param handles - Caller output. @param names - Native names. @returns Hit count. */
  override fillHandles(handles: number[], names: Sequence<OUString>): number {
    let hits = 0,
      current = 0,
      end = this.aInfos.getLength();
    const length = names.getLength(),
      values = this.aInfos.getConstArray() as SequenceElements,
      input = names.getConstArray() as SequenceElements;
    for (let i = 0; i < length; ++i) {
      const name = OUString.unacquired(
        input.get(i * 8) as Parameters<typeof OUString.unacquired>[0],
      );
      let n = end - current,
        logarithm = 0;
      while (n) {
        ++logarithm;
        n >>= 1;
      }
      if ((length - i) * logarithm >= end - current) {
        while (current < end && name.compareTo(property(values, current).Name) > 0) ++current;
        if (current < end && name.equals(property(values, current).Name)) {
          handles[i] = property(values, current).Handle;
          ++hits;
        } else handles[i] = -1;
      } else {
        let comparison = 1;
        const oldEnd = end--;
        let middle = current;
        while (comparison !== 0 && current <= end) {
          middle = Math.floor((end - current) / 2) + current;
          comparison = name.compareTo(property(values, middle).Name);
          if (comparison > 0) current = middle + 1;
          else end = middle - 1;
        }
        if (comparison === 0) {
          handles[i] = property(values, middle).Handle;
          ++hits;
          current = middle + 1;
        } else if (comparison > 0) {
          handles[i] = -1;
          current = middle + 1;
        } else {
          handles[i] = -1;
          current = middle;
        }
        end = oldEnd;
      }
    }
    return hits;
  }
}
/** Original anonymous-namespace component, exported only to bind the same source factory across erased compilation units. It snapshots descriptions rather than retaining the helper. */
export class OPropertySetHelperInfo_Impl
  extends WeakImplHelper.specialize(XPropertySetInfo)
  implements XPropertySetInfo
{
  private readonly aInfos: Sequence<Property>;
  /** Original helper snapshot. @param helper - Borrowed real helper. @returns Component. */
  constructor(helper: IPropertyArrayHelper) {
    super();
    this.aInfos = helper.getProperties();
  }
  /** Original implicit member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.aInfos.dispose();
    super.destroy();
  }
  /** Original shared sequence return. @returns Owned sequence. */
  getProperties(): Sequence<Property> {
    return new Properties(this.aInfos);
  }
  /** Original descriptor copy or UnknownPropertyException. @param name - Name. @returns Owned descriptor. */
  getPropertyByName(name: OUStringConstReference): Property {
    const value = find(this.aInfos, name);
    if (!value) unknown(name);
    return new Property(value);
  }
  /** Original snapshot presence check. @param name - Name. @returns Presence. */
  hasPropertyByName(name: OUStringConstReference): boolean {
    return find(this.aInfos, name) !== null;
  }
}
/** Original event-hook declaration; dispatch remains with actual property-set helper and concrete hook owners. */
export interface IEventNotificationHook {
  /** Original hook callback. @param handles - Actual changed handles. @param count - Native count. @param vetoable - Vetoable pass. @param ignoreRuntimeExceptions - Original policy. @returns Nothing. */
  fireEvents(
    handles: number[],
    count: number,
    vetoable: boolean,
    ignoreRuntimeExceptions: boolean,
  ): void;
}
