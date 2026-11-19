/** @fileoverview Complete original Attribute.idl generated struct value and cached native CPPU type over actual string/scalar member storage. */
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
export function cppu_detail_getUnoType_Attribute(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.Attribute\0"),
      null,
      3,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original borrowed aggregate fields, without default/provider construction. */
export interface AttributeConstReference {
  readonly Name: OUStringConstReference;
  readonly NamespaceURL: OUStringConstReference;
  readonly Value: OUStringConstReference;
}
/** Actual aggregate pointer protocol. */
type Address = Pick<ReadonlyMap<number, unknown>, "get">;
const borrowed = new WeakMap<Address, AttributeConstReference>();
/** Actual original generated value. */
export class Attribute implements AttributeConstReference {
  private fieldName = new OUString();
  private fieldNamespaceURL = new OUString();
  private fieldValue = new OUString();
  /** Original default/copy/all-member construction. @param args - Original selected operands. @returns Actual value. */
  constructor(
    ...args:
      | []
      | [AttributeConstReference]
      | [
          name: OUStringConstReference,
          namespaceurl: OUStringConstReference,
          value: OUStringConstReference,
        ]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 3) {
      this.Name = args[0];
      this.NamespaceURL = args[1];
      this.Value = args[2];
    }
  }
  /** Original Name read. @returns Native value. */ get Name(): OUString {
    return this.fieldName;
  }
  /** Original Name assignment. @param value - Source value. @returns Nothing. */ set Name(
    value: OUStringConstReference,
  ) {
    this.fieldName.assign(value);
  }
  /** Original NamespaceURL read. @returns Native value. */ get NamespaceURL(): OUString {
    return this.fieldNamespaceURL;
  }
  /** Original NamespaceURL assignment. @param value - Source value. @returns Nothing. */ set NamespaceURL(
    value: OUStringConstReference,
  ) {
    this.fieldNamespaceURL.assign(value);
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
  assign(source: AttributeConstReference): this {
    this.Name = source.Name;
    this.NamespaceURL = source.NamespaceURL;
    this.Value = source.Value;
    return this;
  }
  /** Original comparison in member order. @param other - Borrowed source. @returns Equality. */
  equals(other: AttributeConstReference): boolean {
    return (
      this.Name.equals(other.Name) &&
      this.NamespaceURL.equals(other.NamespaceURL) &&
      this.Value.equals(other.Value)
    );
  }
  /** Original inequality. @param other - Borrowed source. @returns Inequality. */
  notEquals(other: AttributeConstReference): boolean {
    return !this.equals(other);
  }
  /** Original field address binding for valid member offsets. @param offset - Declared byte offset. @returns Actual native cell. */
  get(offset: number): rtl_uStringSlot | [number] {
    if (offset === 0) return this.fieldName.getDataAddress();
    if (offset === 8) return this.fieldNamespaceURL.getDataAddress();
    if (offset === 16) return this.fieldValue.getDataAddress();
    throw new Error("assert(valid generated member offset)");
  }
  /** Original aggregate const-reference view over actual initialized storage. @param address - Native aggregate address. @returns Borrowed existing fields. */
  static unacquired(address: Address): AttributeConstReference {
    let value = borrowed.get(address);
    if (value === undefined) {
      value = Object.freeze({
        Name: OUString.unacquired(address.get(0) as rtl_uStringSlot),
        NamespaceURL: OUString.unacquired(address.get(8) as rtl_uStringSlot),
        Value: OUString.unacquired(address.get(16) as rtl_uStringSlot),
      });
      borrowed.set(address, value);
    }
    return value;
  }
  /** Original implicit move construction, including copy fallback for members without a move constructor. @param source - Actual native rvalue. @returns Moved value. */
  static move(source: Attribute): Attribute {
    const result = Object.create(Attribute.prototype) as Attribute;
    result.fieldName = OUString.move(source.fieldName);
    result.fieldNamespaceURL = OUString.move(source.fieldNamespaceURL);
    result.fieldValue = OUString.move(source.fieldValue);
    return result;
  }
  /** Original memberwise move assignment preserves scalar source values. @param source - Actual native rvalue. @returns This value. */
  moveAssign(source: Attribute): this {
    this.fieldName.moveAssign(source.fieldName);
    this.fieldNamespaceURL.moveAssign(source.fieldNamespaceURL);
    this.fieldValue.moveAssign(source.fieldValue);
    return this;
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.fieldValue.dispose();
    this.fieldNamespaceURL.dispose();
    this.fieldName.dispose();
  }
}
