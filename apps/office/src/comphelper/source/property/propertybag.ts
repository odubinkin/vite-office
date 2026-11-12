/** @fileoverview Original complete low-level PropertyBag owns dynamic defaults and delegates actual value storage/conversion to OPropertyContainerHelper. This is not the separate UNO OPropertyBag service. */
import { OPropertyContainerHelper } from "../../inc/propertycontainerhelper";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Property } from "../../../udkapi/com/sun/star/beans/Property";
import { IllegalTypeException } from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import { PropertyExistException } from "../../../udkapi/com/sun/star/beans/PropertyExistException";
import { NotRemoveableException } from "../../../udkapi/com/sun/star/beans/NotRemoveableException";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { MAYBEVOID, REMOVABLE } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Compiler-known ASCII source literal. @param text - Literal. @returns Owned string. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Original ASCII source unit. @param c - Character. @returns Byte. */ (c) =>
        c.charCodeAt(0),
    ),
  );
}
/** Original typed handle failure. @param handle - Unknown signed32 handle. @returns Never. */
function unknown(handle: number): never {
  const message = new OUString(OUString.number(handle)),
    context = new Reference();
  try {
    throw new UnknownPropertyException(message, context);
  } finally {
    context.dispose();
    message.dispose();
  }
}
/** Original dynamic-property bag with empty names disallowed by default. */
export class PropertyBag extends OPropertyContainerHelper {
  private readonly aDefaults = new Map<number, Any>();
  private m_bAllowEmptyPropertyName: boolean;
  /** Original public default constructor. @returns Bag. */ constructor() {
    super();
    this.m_bAllowEmptyPropertyName = false;
  }
  /** Original reverse derived/default and base destruction. @returns Nothing. */ override dispose(): void {
    for (const value of this.aDefaults.values()) value.dispose();
    super.dispose();
  }
  /** Original flag assignment. @param allowed - Source choice. @returns Nothing. */ setAllowEmptyPropertyName(
    allowed: boolean,
  ): void {
    this.m_bAllowEmptyPropertyName = allowed;
  }
  /** Original empty-name argument1 check. @param name - Borrowed name. @returns Nothing. */ private checkName(
    name: OUStringConstReference,
  ): void {
    if (!this.m_bAllowEmptyPropertyName && name.isEmpty()) {
      const message = literal("The property name must not be empty."),
        context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original two declared duplicate exception choices. @param name - Borrowed name. @param handle - Handle. @param voidProperty - Original void overload selection. @returns Nothing. */ private checkDuplicate(
    name: OUStringConstReference,
    handle: number,
    voidProperty: boolean,
  ): void {
    if (this.hasPropertyByName(name) || this.hasPropertyByHandle(handle)) {
      const message = literal("Property name or handle already used."),
        context = new Reference();
      try {
        if (voidProperty) throw new ElementExistException(message, context);
        throw new PropertyExistException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original nonvoid value type, name/handle validation and held-value/default copy. @param name - Name. @param handle - Handle. @param attributes - Flags. @param initial - Actual initial Any. @returns Nothing. */ addProperty(
    name: OUStringConstReference,
    handle: number,
    attributes: number,
    initial: Any,
  ): void {
    const type = Any.prototype.getValueType.call(initial);
    if (type.getTypeClass() === TypeClass.VOID) {
      const message = literal("The initial value must be non-NULL to determine the property type."),
        context = new Reference();
      try {
        throw new IllegalTypeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.checkName(name);
    this.checkDuplicate(name, handle, false);
    this.registerPropertyNoMember(name, handle, attributes, type, initial);
    this.aDefaults.set(handle, new Any(initial));
  }
  /** Original VOID rejection, distinct duplicate exception and forced MAYBEVOID. @param name - Name. @param type - Declared type. @param handle - Handle. @param attributes - Flags. @returns Nothing. */ addVoidProperty(
    name: OUStringConstReference,
    type: Type,
    handle: number,
    attributes: number,
  ): void {
    if (type.getTypeClass() === TypeClass.VOID) {
      const message = literal("Illegal property type: VOID"),
        context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.checkName(name);
    this.checkDuplicate(name, handle, true);
    const empty = new Any();
    try {
      this.registerPropertyNoMember(name, handle, attributes | MAYBEVOID, type, empty);
    } finally {
      empty.dispose();
    }
    this.aDefaults.set(handle, new Any());
  }
  /** Original removable check precedes descriptor revocation and default erase. @param name - Existing name. @returns Nothing. */ removeProperty(
    name: OUStringConstReference,
  ): void {
    const property = this.getProperty(name);
    if ((property.Attributes & REMOVABLE) === 0) {
      const message = new OUString(),
        context = new Reference();
      try {
        throw new NotRemoveableException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const handle = property.Handle;
    this.revokeProperty(handle);
    this.aDefaults.get(handle)?.dispose();
    this.aDefaults.delete(handle);
  }
  /** Original public description forwarding. @param output - Name-sorted native input/output. @returns Nothing. */ override describeProperties(
    output: Sequence<Property>,
  ): void {
    super.describeProperties(output);
  }
  /** Original public handle/value overload and protected qualified base overload use different argument order. Host overload selection erases access qualifiers, not value policy. @param args - Original selected argument order. @returns Nothing. */ override getFastPropertyValue(
    ...args: [handle: number, output: Any] | [output: Any, handle: number]
  ): void {
    if (typeof args[0] === "number") {
      if (!this.hasPropertyByHandle(args[0])) unknown(args[0]);
      super.getFastPropertyValue(args[1] as Any, args[0]);
    } else super.getFastPropertyValue(args[0], args[1] as number);
  }
  /** Original public checked overload and protected base-qualified overload. @param args - Original selected argument order. @returns Modified predicate. */ override convertFastPropertyValue(
    ...args:
      | [handle: number, value: Any, converted: Any, old: Any]
      | [converted: Any, old: Any, handle: number, value: Any]
  ): boolean {
    if (typeof args[0] === "number") {
      if (!this.hasPropertyByHandle(args[0])) unknown(args[0]);
      return super.convertFastPropertyValue(args[2] as Any, args[3], args[0], args[1]);
    }
    return super.convertFastPropertyValue(args[0], args[1], args[2] as number, args[3]);
  }
  /** Original checked assignment forwarding. @param handle - Existing handle. @param value - Borrowed value. @returns Nothing. */ override setFastPropertyValue(
    handle: number,
    value: Any,
  ): void {
    if (!this.hasPropertyByHandle(handle)) unknown(handle);
    super.setFastPropertyValue(handle, value);
  }
  /** Original missing-default inconsistency clears output after a valid handle; ordinary registered defaults copy their actual Any. @param handle - Existing handle. @param output - Inout value. @returns Nothing. */ getPropertyDefaultByHandle(
    handle: number,
    output: Any,
  ): void {
    if (!this.hasPropertyByHandle(handle)) unknown(handle);
    const value = this.aDefaults.get(handle);
    if (value) Any.prototype.assign.call(output, value);
    else Any.prototype.clear.call(output);
  }
  /** Original name-presence forwarding. @param name - Borrowed name. @returns Presence. */ hasPropertyByName(
    name: OUStringConstReference,
  ): boolean {
    return this.isRegisteredProperty(name);
  }
  /** Original handle-presence forwarding. @param handle - Native handle. @returns Presence. */ hasPropertyByHandle(
    handle: number,
  ): boolean {
    return this.isRegisteredProperty(handle);
  }
}
