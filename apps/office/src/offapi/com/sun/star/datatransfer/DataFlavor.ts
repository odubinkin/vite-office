/** @fileoverview Original DataFlavor.idl native struct value, complete field/copy/equality operations and cached CPPUMaker type. String and Type fields retain their actual shared owner storage. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../../sal/inc/rtl/ustring.h";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Actual original borrowed field contract. */
export interface DataFlavorConstReference {
  readonly MimeType: OUStringConstReference;
  readonly HumanPresentableName: OUStringConstReference;
  readonly DataType: Type;
}
const the_type: [R | null] = [null];
/** Original ordered member metadata, with native LP64 offsets0/8/16. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType_DataFlavor(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.datatransfer.DataFlavor\0"),
      null,
      3,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("Type").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original aggregate pointer. */
type Address = Pick<ReadonlyMap<number, unknown>, "get">;
const borrowed = new WeakMap<Address, DataFlavorConstReference>();
/** Original actual generated value. */
export class DataFlavor implements DataFlavorConstReference {
  private mime = new OUString();
  private name = new OUString();
  private type = new Type();
  /** Original default/copy/member constructors. @param args - Source operands. @returns Actual native value. */
  constructor(
    ...args:
      [] | [DataFlavorConstReference] | [OUStringConstReference, OUStringConstReference, Type]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 3) {
      this.MimeType = args[0];
      this.HumanPresentableName = args[1];
      this.DataType = args[2];
    }
  }
  /** Original stable MIME member. @returns Borrowed string. */ get MimeType(): OUString {
    return this.mime;
  }
  /** Original MIME assignment. @param value - Borrowed string. @returns Nothing. */ set MimeType(
    value: OUStringConstReference,
  ) {
    this.mime.assign(value);
  }
  /** Original display member. @returns Borrowed string. */ get HumanPresentableName(): OUString {
    return this.name;
  }
  /** Original display assignment. @param value - Borrowed string. @returns Nothing. */ set HumanPresentableName(
    value: OUStringConstReference,
  ) {
    this.name.assign(value);
  }
  /** Original declared Type member. @returns Borrowed Type. */ get DataType(): Type {
    return this.type;
  }
  /** Original Type assignment. @param value - Actual source Type. @returns Nothing. */ set DataType(
    value: Type,
  ) {
    this.type.assign(value);
  }
  /** Original declaration-order copy assignment. @param value - Actual source fields. @returns This value. */ assign(
    value: DataFlavorConstReference,
  ): this {
    this.MimeType = value.MimeType;
    this.HumanPresentableName = value.HumanPresentableName;
    this.DataType = value.DataType;
    return this;
  }
  /** Original field equality order. @param value - Actual source fields. @returns Equality. */ equals(
    value: DataFlavorConstReference,
  ): boolean {
    return (
      this.MimeType.equals(value.MimeType) &&
      this.HumanPresentableName.equals(value.HumanPresentableName) &&
      this.DataType.equals(value.DataType)
    );
  }
  /** Original inequality. @param value - Actual source fields. @returns Inequality. */ notEquals(
    value: DataFlavorConstReference,
  ): boolean {
    return !this.equals(value);
  }
  /** Original actual member address. @param offset - Original valid declared offset. @returns Native member cell. */ get(
    offset: number,
  ): rtl_uStringSlot | [R | null] {
    return offset === 0
      ? this.mime.getDataAddress()
      : offset === 8
        ? this.name.getDataAddress()
        : this.type.getAddress();
  }
  /** Original borrowed aggregate view. @param address - Existing native initialized record. @returns Live source fields. */ static unacquired(
    address: Address,
  ): DataFlavorConstReference {
    let result = borrowed.get(address);
    if (result === undefined) {
      result = Object.freeze({
        MimeType: OUString.unacquired(address.get(0) as rtl_uStringSlot),
        HumanPresentableName: OUString.unacquired(address.get(8) as rtl_uStringSlot),
        DataType: getTypeFromTypeDescriptionReference(address.get(16) as [R | null]),
      });
      borrowed.set(address, result);
    }
    return result;
  }
  /** Original implicit move construction, including copy fallback for members without a move constructor. @param source - Actual native rvalue. @returns Moved value. */
  static move(source: DataFlavor): DataFlavor {
    const result = Object.create(DataFlavor.prototype) as DataFlavor;
    result.mime = OUString.move(source.mime);
    result.name = OUString.move(source.name);
    result.type = new Type(source.type);
    return result;
  }
  /** Original memberwise move assignment preserves scalar source values. @param source - Actual native rvalue. @returns This value. */
  moveAssign(source: DataFlavor): this {
    this.mime.moveAssign(source.mime);
    this.name.moveAssign(source.name);
    this.type.moveAssign(source.type);
    return this;
  }
  /** Original reverse member destruction. @returns Nothing. */ dispose(): void {
    this.type.dispose();
    this.name.dispose();
    this.mime.dispose();
  }
}
