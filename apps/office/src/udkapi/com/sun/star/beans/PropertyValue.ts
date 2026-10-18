/** @fileoverview Original PropertyValue IDL and normal generated value/type contracts over the existing Unicode, Any and compound dispatcher owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { PropertyState, cppu_detail_getUnoType_PropertyState as stateType } from "./PropertyState";
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Normal generated member types in IDL order, not a provider/type factory. @returns Borrowed original type. */
export function cppu_detail_getUnoType_PropertyValue(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.PropertyValue\0"),
      null,
      4,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("Any").getTypeLibType() as R,
        stateType().getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Actual IDL fields and generated value semantics. Offsets only dispatch existing logical compound member addresses; no document binary representation or new lifetime engine is supplied. */
export class PropertyValue {
  private readonly name = new OUString();
  private readonly handle: [number] = [0];
  private readonly value = new Any();
  private readonly state: [PropertyState] = [PropertyState.DIRECT_VALUE];
  /** Original generated default/copy/member constructors. @param args - Selected native form. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<PropertyValue>]
      | [name: OUStringConstReference, handle: number, value: Any, state: PropertyState]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 4) {
      this.Name = args[0];
      this.Handle = args[1];
      this.Value = args[2];
      this.State = args[3];
    }
  }
  /** Original borrowed mutable string field. @returns Stable original member. */
  get Name(): OUString {
    return this.name;
  }
  /** Original string assignment retains field identity. @param value - Const input. @returns Nothing. */
  set Name(value: OUStringConstReference) {
    this.name.assign(value);
  }
  /** Original long field. @returns Signed32 handle. */
  get Handle(): number {
    return this.handle[0];
  }
  /** Original declared-width field assignment. @param value - New handle. @returns Nothing. */
  set Handle(value: number) {
    this.handle[0] = value | 0;
  }
  /** Original borrowed mutable Any field. @returns Stable Any. */
  get Value(): Any {
    return this.value;
  }
  /** Original Any assignment retains field identity and actual transport semantics. @param value - Source Any. @returns Nothing. */
  set Value(value: Any) {
    this.value.assign(value);
  }
  /** Original enum field. @returns State. */
  get State(): PropertyState {
    return this.state[0];
  }
  /** Original generated enum assignment without extra enumerator admission. @param value - State. @returns Nothing. */
  set State(value: PropertyState) {
    this.state[0] = (value | 0) as PropertyState;
  }
  /** Original implicit fieldwise copy assignment. @param source - Native source value. @returns This value. */
  assign(source: Readonly<PropertyValue>): this {
    this.Name = source.Name;
    this.Handle = source.Handle;
    this.Value = source.Value;
    this.State = source.State;
    return this;
  }
  /** Original generated equality in declaration order. @param other - Compared value. @returns Equality. */
  equals(other: Readonly<PropertyValue>): boolean {
    return (
      this.Name.equals(other.Name) &&
      this.Handle === other.Handle &&
      this.Value.operatorEquals(other.Value) &&
      this.State === other.State
    );
  }
  /** Original generated inequality. @param other - Compared value. @returns Inequality. */
  notEquals(other: Readonly<PropertyValue>): boolean {
    return !this.equals(other);
  }
  /** Borrows real member cells for the existing original compound algorithms; valid declared member offset is the producer precondition. @param offset - Original metadata member offset. @returns Original field address. */
  get(offset: number): unknown {
    return offset === 0
      ? this.name.getDataAddress()
      : offset === 8
        ? this.handle
        : offset === 16
          ? this.value
          : this.state;
  }
}
