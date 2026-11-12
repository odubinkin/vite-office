/** @fileoverview Original complete OPropertyContainerHelper and PropertyDescription over actual initialized member addresses, Any/Type/Property owners and shared UNO data operations. STL range sorting uses actual generated values; native allocator/move traces remain unqualified. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  cpp_acquire,
  cpp_release,
  cpp_queryInterface,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import { uno_type_assignData, uno_type_equalData } from "../../../cppu/inc/uno/data";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
  type PropertyConstReference,
} from "../../../udkapi/com/sun/star/beans/Property";
import { MAYBEVOID } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { PropertyCompareByName } from "../../inc/property";
const Properties = Sequence.specialize<Property>(propertyType, 32);
/** Actual compound-address protocol already owned by UNO storage. */
interface Address {
  get(offset: number): unknown;
}
/** Original ordered location enum. */
export enum LocationType {
  DerivedClassRealType,
  DerivedClassAnyType,
  HoldMyself,
}
/** Original description aggregate and active pointer/index union. */
export class PropertyDescription {
  /** Original nested enum declaration, exposed through its containing type. */
  static readonly LocationType = LocationType;
  readonly aProperty: Property;
  eLocated: LocationType;
  aLocation: { pDerivedClassMember: unknown } | { nOwnClassVectorIndex: bigint };
  /** Original default or implicit copy construction. @param source - Optional source. @returns Aggregate. */
  constructor(source?: PropertyDescription) {
    if (source) {
      this.aProperty = new Property(source.aProperty);
      this.eLocated = source.eLocated;
      this.aLocation = { ...source.aLocation };
    } else {
      const name = new OUString(),
        type = new Type();
      try {
        this.aProperty = new Property(name, -1, type, 0);
      } finally {
        type.dispose();
        name.dispose();
      }
      this.eLocated = LocationType.HoldMyself;
      this.aLocation = { nOwnClassVectorIndex: 0xffffffffffffffffn };
    }
  }
  /** Original implicit member destruction. @returns Nothing. */ dispose(): void {
    this.aProperty.dispose();
  }
}
/** Original handle exception text. @param handle - Unknown handle. @returns Never. */
function unknownHandle(handle: number): never {
  const message = new OUString(OUString.number(handle)),
    context = new Reference();
  try {
    throw new UnknownPropertyException(message, context);
  } finally {
    context.dispose();
    message.dispose();
  }
}
/** Original complete conversion diagnostic. @param property - Declared property. @param value - Requested value. @returns Never. */
function illegalValue(property: PropertyDescription, value: Any): never {
  const buffer = new OUStringBuffer(),
    context = new Reference(),
    actual = Any.prototype.getValueTypeName.call(value),
    required = property.aProperty.Type.getTypeName();
  /** Original source ASCII fragment. @param text - Literal. @returns Nothing. */
  function literal(text: string): void {
    const bytes = Uint8Array.from(
      text,
      /** Source ASCII byte. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    );
    buffer.appendAscii(bytes, bytes.length);
  }
  try {
    literal('The given value cannot be converted to the required property type. (property name "');
    buffer.append(property.aProperty.Name);
    literal('", found value type "');
    buffer.append(actual);
    literal('", required property type "');
    buffer.append(required);
    literal('")');
    const message = buffer.makeStringAndClear();
    try {
      throw new IllegalArgumentException(message, context, 4);
    } finally {
      message.dispose();
    }
  } finally {
    required.dispose();
    actual.dispose();
    context.dispose();
    buffer.dispose();
  }
}
/** Original holder and description vectors retain distinct storage and lifetime. */
export class OPropertyContainerHelper {
  private readonly m_aHoldProperties: Any[];
  private readonly m_aProperties: PropertyDescription[];
  /** Original protected default construction in member order; copying is not exposed. @returns Helper. */ protected constructor() {
    this.m_aHoldProperties = [];
    this.m_aProperties = [];
  }
  /** Original implicit reverse vector destruction. @returns Nothing. */ dispose(): void {
    for (const property of this.m_aProperties) property.dispose();
    for (const value of this.m_aHoldProperties) value.dispose();
  }
  /** Original handle lower_bound. @param handle - Key. @returns Index. */ private lowerBound(
    handle: number,
  ): number {
    let a = 0,
      b = this.m_aProperties.length;
    while (a < b) {
      const i = a + Math.floor((b - a) / 2);
      if ((this.m_aProperties[i] as PropertyDescription).aProperty.Handle < handle) a = i + 1;
      else b = i;
    }
    return a;
  }
  /** Original temporary key, lower_bound and exact handle check. @param handle - Key. @returns Index or end. */ private searchHandle(
    handle: number,
  ): number {
    const key = new PropertyDescription();
    try {
      key.aProperty.Handle = handle;
      const i = this.lowerBound(key.aProperty.Handle);
      return i < this.m_aProperties.length &&
        (this.m_aProperties[i] as PropertyDescription).aProperty.Handle !== handle
        ? this.m_aProperties.length
        : i;
    } finally {
      key.dispose();
    }
  }
  /** Original copied insertion; duplicate checks are only debug diagnostics. @param property - Borrowed description. @returns Nothing. */ private implPushBackProperty(
    property: PropertyDescription,
  ): void {
    this.m_aProperties.splice(
      this.lowerBound(property.aProperty.Handle),
      0,
      new PropertyDescription(property),
    );
  }
  /** Original real-member registration. @param name - Name. @param handle - Handle. @param attributes - Flags. @param pointer - Actual lvalue. @param type - Declared type. @returns Nothing. */ protected registerProperty(
    name: OUStringConstReference,
    handle: number,
    attributes: number,
    pointer: unknown,
    type: Type,
  ): void {
    const p = new PropertyDescription();
    try {
      p.aProperty.Name = name;
      p.aProperty.Handle = handle;
      p.aProperty.Type = type;
      p.aProperty.Attributes = attributes;
      p.eLocated = LocationType.DerivedClassRealType;
      p.aLocation = { pDerivedClassMember: pointer };
      this.implPushBackProperty(p);
    } finally {
      p.dispose();
    }
  }
  /** Original Any-member registration forces MAYBEVOID. @param name - Name. @param handle - Handle. @param attributes - Flags. @param pointer - Actual Any. @param type - Expected type. @returns Nothing. */ protected registerMayBeVoidProperty(
    name: OUStringConstReference,
    handle: number,
    attributes: number,
    pointer: Any,
    type: Type,
  ): void {
    const p = new PropertyDescription();
    try {
      p.aProperty.Name = name;
      p.aProperty.Handle = handle;
      p.aProperty.Type = type;
      p.aProperty.Attributes = attributes | MAYBEVOID;
      p.eLocated = LocationType.DerivedClassAnyType;
      p.aLocation = { pDerivedClassMember: pointer };
      this.implPushBackProperty(p);
    } finally {
      p.dispose();
    }
  }
  /** Original owned holder append before description insertion. @param name - Name. @param handle - Handle. @param attributes - Flags. @param type - Declared type. @param initial - Initial Any. @returns Nothing. */ protected registerPropertyNoMember(
    name: OUStringConstReference,
    handle: number,
    attributes: number,
    type: Type,
    initial: Any,
  ): void {
    const p = new PropertyDescription();
    try {
      p.aProperty.Name = name;
      p.aProperty.Handle = handle;
      p.aProperty.Type = type;
      p.aProperty.Attributes = attributes;
      p.eLocated = LocationType.HoldMyself;
      p.aLocation = { nOwnClassVectorIndex: BigInt(this.m_aHoldProperties.length) };
      this.m_aHoldProperties.push(new Any(initial));
      this.implPushBackProperty(p);
    } finally {
      p.dispose();
    }
  }
  /** Original description erase leaves the old held value alive. @param handle - Handle. @returns Nothing. */ protected revokeProperty(
    handle: number,
  ): void {
    const i = this.searchHandle(handle);
    if (i === this.m_aProperties.length) unknownHandle(handle);
    (this.m_aProperties.splice(i, 1)[0] as PropertyDescription).dispose();
  }
  /** Original handle/name overload selection. @param key - Declared key. @returns Presence. */ protected isRegisteredProperty(
    key: number | OUStringConstReference,
  ): boolean {
    return typeof key === "number"
      ? this.searchHandle(key) !== this.m_aProperties.length
      : this.m_aProperties.some(
          /** Original name predicate. @param p - Actual description. @returns Match. */ (p) =>
            p.aProperty.Name.equals(key),
        );
  }
  /** Original selected Any storage. @param property - Location. @returns Borrowed actual owner. */ private anyValue(
    property: PropertyDescription,
  ): Any {
    return property.eLocated === LocationType.HoldMyself
      ? (this.m_aHoldProperties[
          Number((property.aLocation as { nOwnClassVectorIndex: bigint }).nOwnClassVectorIndex)
        ] as Any)
      : ((property.aLocation as { pDerivedClassMember: unknown }).pDerivedClassMember as Any);
  }
  /** Original three-location conversion and untouched outputs for unchanged values. @param converted - Conversion output. @param old - Old-value output. @param handle - Handle. @param value - Requested value. @returns Modified predicate. */ protected convertFastPropertyValue(
    converted: Any,
    old: Any,
    handle: number,
    value: Any,
  ): boolean {
    const i = this.searchHandle(handle);
    if (i === this.m_aProperties.length) return false;
    const p = this.m_aProperties[i] as PropertyDescription,
      type = p.aProperty.Type.getTypeLibType() as R;
    if (p.eLocated === LocationType.HoldMyself || p.eLocated === LocationType.DerivedClassAnyType) {
      const requested = new Any(value);
      try {
        if (!Any.prototype.getValueType.call(requested).equals(p.aProperty.Type)) {
          const typed = new Any(null, type);
          try {
            if (
              uno_type_assignData(
                Any.prototype.getValue.call(typed),
                type,
                Any.prototype.getValue.call(requested),
                Any.prototype.getValueTypeRef.call(requested),
                cpp_queryInterface,
                cpp_acquire,
                cpp_release,
              )
            )
              Any.prototype.moveAssign.call(requested, typed);
          } finally {
            typed.dispose();
          }
        }
        if (!(
          ((p.aProperty.Attributes & MAYBEVOID) !== 0 && !Any.prototype.hasValue.call(requested)) ||
          Any.prototype.getValueType.call(requested).equals(p.aProperty.Type)
        ))
          illegalValue(p, value);
        const current = this.anyValue(p),
          modified =
            !Any.prototype.hasValue.call(current) || !Any.prototype.hasValue.call(requested)
              ? Any.prototype.hasValue.call(current) !== Any.prototype.hasValue.call(requested)
              : !uno_type_equalData(
                  Any.prototype.getValue.call(current),
                  type,
                  Any.prototype.getValue.call(requested),
                  type,
                  cpp_queryInterface,
                  cpp_release,
                );
        if (modified) {
          Any.prototype.assign.call(old, current);
          Any.prototype.moveAssign.call(converted, requested);
        }
        return modified;
      } finally {
        requested.dispose();
      }
    }
    const typed = new Any();
    let selected = value;
    try {
      if (!Any.prototype.getValueType.call(value).equals(p.aProperty.Type)) {
        const initial = new Any(null, type);
        try {
          Any.prototype.moveAssign.call(typed, initial);
        } finally {
          initial.dispose();
        }
        if (
          !uno_type_assignData(
            Any.prototype.getValue.call(typed),
            type,
            Any.prototype.getValue.call(value),
            Any.prototype.getValueTypeRef.call(value),
            cpp_queryInterface,
            cpp_acquire,
            cpp_release,
          )
        )
          illegalValue(p, value);
        selected = typed;
      }
      const pointer = (p.aLocation as { pDerivedClassMember: unknown }).pDerivedClassMember,
        modified = !uno_type_equalData(
          pointer,
          type,
          Any.prototype.getValue.call(selected),
          type,
          cpp_queryInterface,
          cpp_release,
        );
      if (modified) {
        Any.prototype.setValue.call(old, pointer, p.aProperty.Type);
        Any.prototype.assign.call(converted, selected);
      }
      return modified;
    } finally {
      typed.dispose();
    }
  }
  /** Original selected field assignment; unknown handles retain diagnostic-only return. @param handle - Handle. @param value - Borrowed value. @returns Nothing. */ protected setFastPropertyValue(
    handle: number,
    value: Any,
  ): void {
    const i = this.searchHandle(handle);
    if (i === this.m_aProperties.length) return;
    const p = this.m_aProperties[i] as PropertyDescription;
    if (p.eLocated === LocationType.DerivedClassRealType) {
      void uno_type_assignData(
        (p.aLocation as { pDerivedClassMember: unknown }).pDerivedClassMember,
        p.aProperty.Type.getTypeLibType() as R,
        Any.prototype.getValue.call(value),
        Any.prototype.getValueTypeRef.call(value),
        cpp_queryInterface,
        cpp_acquire,
        cpp_release,
      );
    } else Any.prototype.assign.call(this.anyValue(p), value);
  }
  /** Original selected value copy; a missing handle violates the source assertion and retains its return branch. @param output - Output Any. @param handle - Handle. @returns Nothing. */ protected getFastPropertyValue(
    output: Any,
    handle: number,
  ): void {
    const i = this.searchHandle(handle);
    if (i === this.m_aProperties.length) return;
    const p = this.m_aProperties[i] as PropertyDescription;
    if (p.eLocated === LocationType.DerivedClassRealType)
      Any.prototype.setValue.call(
        output,
        (p.aLocation as { pDerivedClassMember: unknown }).pDerivedClassMember,
        p.aProperty.Type,
      );
    else Any.prototype.assign.call(output, this.anyValue(p));
  }
  /** Original borrowed property lookup. @param name - Name. @returns Existing actual Property field. */ protected getProperty(
    name: OUStringConstReference,
  ): PropertyConstReference {
    const p = this.m_aProperties.find(
      /** Original name predicate. @param v - Description. @returns Match. */ (v) =>
        v.aProperty.Name.equals(name),
    );
    if (!p) {
      const context = new Reference();
      try {
        throw new UnknownPropertyException(name, context);
      } finally {
        context.dispose();
      }
    }
    return p.aProperty;
  }
  /** Original own sequence, strict name sort, then stable merge into a new actual sequence. Sort temporaries are actual generated Property values. @param properties - Already sorted input/output. @returns Nothing. */ protected describeProperties(
    properties: Sequence<Property>,
  ): void {
    const own = new Properties(this.m_aProperties.length),
      values: Property[] = [],
      compare = new PropertyCompareByName(),
      type = propertyType().getTypeLibType() as R;
    try {
      const array = own.getArray() as SequenceElements;
      for (let i = 0; i < this.m_aProperties.length; ++i) {
        const source = (this.m_aProperties[i] as PropertyDescription).aProperty;
        void uno_type_assignData(
          array.get(i * 32),
          type,
          source,
          type,
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        );
      }
      for (let i = 0; i < own.getLength(); ++i)
        values.push(new Property(Property.unacquired(array.get(i * 32) as Address)));
      values.sort(
        /** Native strict name comparison. @param a - First value. @param b - Second value. @returns Order. */ (
          a,
          b,
        ) => (compare.operatorCall(a, b) ? -1 : compare.operatorCall(b, a) ? 1 : 0),
      );
      for (let i = 0; i < values.length; ++i)
        void uno_type_assignData(
          array.get(i * 32),
          type,
          values[i],
          type,
          cpp_queryInterface,
          cpp_acquire,
          cpp_release,
        );
      const output = new Properties(properties.getLength() + own.getLength());
      try {
        const left = properties.getConstArray() as SequenceElements,
          right = own.getConstArray() as SequenceElements,
          dest = output.getArray() as SequenceElements;
        let a = 0,
          b = 0;
        for (let i = 0; i < output.getLength(); ++i) {
          let source: unknown;
          if (
            a < properties.getLength() &&
            (b === own.getLength() ||
              !compare.operatorCall(
                Property.unacquired(right.get(b * 32) as Address),
                Property.unacquired(left.get(a * 32) as Address),
              ))
          )
            source = left.get(a++ * 32);
          else source = right.get(b++ * 32);
          void uno_type_assignData(
            dest.get(i * 32),
            type,
            source,
            type,
            cpp_queryInterface,
            cpp_acquire,
            cpp_release,
          );
        }
        properties.assign(output);
      } finally {
        output.dispose();
      }
    } finally {
      for (const value of values) value.dispose();
      own.dispose();
    }
  }
}
