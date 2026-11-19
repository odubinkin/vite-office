/** @fileoverview Complete original FastAttribute.idl generated struct value and cached native CPPU type over actual string/scalar member storage. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../../sal/inc/rtl/ustring.h";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original ordered struct metadata. @returns Borrowed cached type. */
export function cppu_detail_getUnoType_FastAttribute(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.FastAttribute\0"),
      null,
      2,
      [
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original borrowed aggregate fields, without default/provider construction. */
export interface FastAttributeConstReference {
  readonly Token: number;
  readonly Value: OUStringConstReference;
}
/** Actual aggregate pointer protocol. */
type Address = Pick<ReadonlyMap<number, unknown>, "get">;
const borrowed = new WeakMap<Address, FastAttributeConstReference>();
/** Actual original generated value. */
export class FastAttribute implements FastAttributeConstReference {
  private fieldToken = [0] as [number];
  private fieldValue = new OUString();
  /** Original default/copy/all-member construction. @param args - Original selected operands. @returns Actual value. */
  constructor(
    ...args: [] | [FastAttributeConstReference] | [token: number, value: OUStringConstReference]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.Token = args[0];
      this.Value = args[1];
    }
  }
  /** Original Token read. @returns Native value. */ get Token(): number {
    return this.fieldToken[0];
  }
  /** Original Token assignment. @param value - Source value. @returns Nothing. */ set Token(
    value: number,
  ) {
    this.fieldToken[0] = value | 0;
  }
  /** Original Value read. @returns Native value. */ get Value(): OUString {
    return this.fieldValue;
  }
  /** Original Value assignment. @param value - Source value. @returns Nothing. */ set Value(
    value: OUStringConstReference,
  ) {
    this.fieldValue.assign(value);
  }
  /** Original declaration-order assignment. @param source - Borrowed source. @returns This value. */
  assign(source: FastAttributeConstReference): this {
    this.Token = source.Token;
    this.Value = source.Value;
    return this;
  }
  /** Original comparison in member order. @param other - Borrowed source. @returns Equality. */
  equals(other: FastAttributeConstReference): boolean {
    return this.Token === other.Token && this.Value.equals(other.Value);
  }
  /** Original inequality. @param other - Borrowed source. @returns Inequality. */
  notEquals(other: FastAttributeConstReference): boolean {
    return !this.equals(other);
  }
  /** Original field address binding for valid member offsets. @param offset - Declared byte offset. @returns Actual native cell. */
  get(offset: number): rtl_uStringSlot | [number] {
    if (offset === 0) return this.fieldToken;
    if (offset === 8) return this.fieldValue.getDataAddress();
    throw new Error("assert(valid generated member offset)");
  }
  /** Original aggregate const-reference view over actual initialized storage. @param address - Native aggregate address. @returns Borrowed existing fields. */
  static unacquired(address: Address): FastAttributeConstReference {
    let value = borrowed.get(address);
    if (value === undefined) {
      value = Object.freeze({
        /** Borrows the current original scalar cell. @returns Live source token. */
        get Token() {
          return (address.get(0) as [number])[0];
        },
        Value: OUString.unacquired(address.get(8) as rtl_uStringSlot),
      });
      borrowed.set(address, value);
    }
    return value;
  }
  /** Original implicit move construction, including copy fallback for members without a move constructor. @param source - Actual native rvalue. @returns Moved value. */
  static move(source: FastAttribute): FastAttribute {
    const result = Object.create(FastAttribute.prototype) as FastAttribute;
    result.fieldToken = [source.fieldToken[0]];
    result.fieldValue = OUString.move(source.fieldValue);
    return result;
  }
  /** Original memberwise move assignment preserves scalar source values. @param source - Actual native rvalue. @returns This value. */
  moveAssign(source: FastAttribute): this {
    this.fieldToken[0] = source.fieldToken[0];
    this.fieldValue.moveAssign(source.fieldValue);
    return this;
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.fieldValue.dispose();
  }
}
