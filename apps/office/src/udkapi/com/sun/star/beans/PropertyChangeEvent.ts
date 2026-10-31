/** @fileoverview Original PropertyChangeEvent.idl inherited fields and cppumaker-normal value/type contracts over actual Reference, OUString, Any and compound owners. */
import { EventObject, cppu_detail_getUnoType_EventObject as eventType } from "../lang/EventObject";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const theType: [R | null] = [null];
/** Original five declared member types follow the actual EventObject base. @returns Borrowed cached type. */
export function cppu_detail_getUnoType_PropertyChangeEvent(): Type {
  if (theType[0] === null) {
    const any = UnoType.get("Any").getTypeLibType() as R;
    typelib_static_struct_type_init(
      theType,
      new TextEncoder().encode("com.sun.star.beans.PropertyChangeEvent\0"),
      eventType().getTypeLibType(),
      5,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("bool").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        any,
        any,
      ],
      null,
    );
  }
  return getTypeFromTypeDescriptionReference(theType);
}
/** Original generated event value with the real inherited Source owner and stable mutable member cells. */
export class PropertyChangeEvent extends EventObject {
  private readonly propertyName = new OUString();
  private readonly further: [boolean] = [false];
  private readonly propertyHandle: [number] = [0];
  private readonly oldValue = new Any();
  private readonly newValue = new Any();
  /** Original generated default/copy/all-member constructors. @param args - Source form, including inherited Source first. @returns Owned event. */
  constructor(
    ...args:
      | []
      | [source: Readonly<PropertyChangeEvent>]
      | [
          source: Reference<XInterface>,
          name: OUStringConstReference,
          further: boolean,
          handle: number,
          oldValue: Any,
          newValue: Any,
        ]
  ) {
    super();
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 6) {
      this.Source = args[0];
      this.PropertyName = args[1];
      this.Further = args[2];
      this.PropertyHandle = args[3];
      this.OldValue = args[4];
      this.NewValue = args[5];
    }
  }
  /** Original mutable string member. @returns Stable member. */
  get PropertyName(): OUString {
    return this.propertyName;
  }
  /** Original string copy assignment. @param value - Source string. @returns Nothing. */
  set PropertyName(value: OUStringConstReference) {
    this.propertyName.assign(value);
  }
  /** Original declared Boolean field. @returns Source flag. */
  get Further(): boolean {
    return this.further[0];
  }
  /** Original Boolean assignment. @param value - Declared Boolean. @returns Nothing. */
  set Further(value: boolean) {
    this.further[0] = value;
  }
  /** Original signed32 field, default zero rather than a guessed invalid handle. @returns Handle. */
  get PropertyHandle(): number {
    return this.propertyHandle[0];
  }
  /** Original declared-width assignment. @param value - Source handle. @returns Nothing. */
  set PropertyHandle(value: number) {
    this.propertyHandle[0] = value | 0;
  }
  /** Original mutable Any member. @returns Stable old value. */
  get OldValue(): Any {
    return this.oldValue;
  }
  /** Original Any copy assignment. @param value - Source Any. @returns Nothing. */
  set OldValue(value: Any) {
    this.oldValue.assign(value);
  }
  /** Original mutable Any member. @returns Stable new value. */
  get NewValue(): Any {
    return this.newValue;
  }
  /** Original Any copy assignment. @param value - Source Any. @returns Nothing. */
  set NewValue(value: Any) {
    this.newValue.assign(value);
  }
  /** Original base-first implicit assignment. @param source - Source event. @returns This event. */
  override assign(source: Readonly<PropertyChangeEvent>): this {
    super.assign(source);
    this.PropertyName = source.PropertyName;
    this.Further = source.Further;
    this.PropertyHandle = source.PropertyHandle;
    this.OldValue = source.OldValue;
    this.NewValue = source.NewValue;
    return this;
  }
  /** Original base-first generated equality. @param other - Source event. @returns Equality. */
  override equals(other: Readonly<PropertyChangeEvent>): boolean {
    return (
      super.equals(other) &&
      this.PropertyName.equals(other.PropertyName) &&
      this.Further === other.Further &&
      this.PropertyHandle === other.PropertyHandle &&
      this.OldValue.operatorEquals(other.OldValue) &&
      this.NewValue.operatorEquals(other.NewValue)
    );
  }
  /** Original generated inequality. @param other - Source event. @returns Inequality. */
  override notEquals(other: Readonly<PropertyChangeEvent>): boolean {
    return !this.equals(other);
  }
  /** Original inherited Source pointer address at zero. @param offset - Declared zero offset. @returns Actual interface pointer cell. */
  override get(offset: 0): [XInterface | null];
  /** Original erased compound address supports every declared member type. @param offset - Actual metadata offset. @returns Actual field address. */
  override get(offset: number): unknown;
  /** Original compound member addresses, including inherited Source at zero. Only declared metadata offsets are valid. @param offset - Actual compound member offset. @returns Stable original field address. */
  override get(offset: number): unknown {
    return offset === 0
      ? super.get(0)
      : offset === 8
        ? this.propertyName.getDataAddress()
        : offset === 16
          ? this.further
          : offset === 20
            ? this.propertyHandle
            : offset === 24
              ? this.oldValue
              : this.newValue;
  }
  /** Original reverse member destruction followed by the base. @returns Nothing. */
  override dispose(): void {
    this.newValue.dispose();
    this.oldValue.dispose();
    this.propertyName.dispose();
    super.dispose();
  }
}
