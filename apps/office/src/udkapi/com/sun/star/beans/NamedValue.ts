/** @fileoverview Original NamedValue IDL and normal generated compound binding use the actual Unicode and Any member owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal generated two-member struct type. @returns Borrowed static type. */
export function cppu_detail_getUnoType_NamedValue(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.NamedValue\0"),
      null,
      2,
      [UnoType.get("OUString").getTypeLibType() as R, UnoType.get("Any").getTypeLibType() as R],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated default/copy/member value semantics. */
export class NamedValue {
  private readonly name = new OUString();
  private readonly value = new Any();
  /** Original constructor overloads. @param args - Declared overload arguments. @returns Value. */
  constructor(
    ...args: [] | [source: Readonly<NamedValue>] | [name: OUStringConstReference, value: Any]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.Name = args[0];
      this.Value = args[1];
    }
  }
  /** Original stable string member. @returns Borrowed member. */
  get Name(): OUString {
    return this.name;
  }
  /** Original string assignment. @param value - Borrowed source. @returns Nothing. */
  set Name(value: OUStringConstReference) {
    this.name.assign(value);
  }
  /** Original stable Any member. @returns Borrowed member. */
  get Value(): Any {
    return this.value;
  }
  /** Original Any assignment. @param value - Borrowed source. @returns Nothing. */
  set Value(value: Any) {
    this.value.assign(value);
  }
  /** Original memberwise copy assignment. @param source - Borrowed source. @returns This value. */
  assign(source: Readonly<NamedValue>): this {
    this.Name = source.Name;
    this.Value = source.Value;
    return this;
  }
  /** Original generated field equality. @param other - Compared value. @returns Equality. */
  equals(other: Readonly<NamedValue>): boolean {
    return this.Name.equals(other.Name) && this.Value.operatorEquals(other.Value);
  }
  /** Original generated inequality. @param other - Compared value. @returns Inequality. */
  notEquals(other: Readonly<NamedValue>): boolean {
    return !this.equals(other);
  }
  /** Existing compound owner addresses; valid declared offset is the producer precondition. @param offset - Original member offset. @returns Actual member address. */
  get(offset: number): unknown {
    return offset === 0 ? this.name.getDataAddress() : this.value;
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.value.dispose();
    this.name.dispose();
  }
}
