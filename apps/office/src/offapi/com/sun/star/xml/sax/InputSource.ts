/** @fileoverview Original InputSource IDL value and normal CPPUMaker struct binding over actual Reference and OUString field owners. */
import { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../../../../udkapi/com/sun/star/io/XInputStream";
import { XInputStream as Input } from "../../../../../../udkapi/com/sun/star/io/XInputStream";
import { OUString, type OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal cached struct metadata in IDL field order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType_InputSource(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.InputSource\0"),
      null,
      4,
      [
        UnoType.get(Input.static_type).getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Const-reference field contract; each member retains its actual native owner. */
export interface InputSourceConstReference {
  readonly aInputStream: Reference<XInputStream>;
  readonly sEncoding: OUStringConstReference;
  readonly sPublicId: OUStringConstReference;
  readonly sSystemId: OUStringConstReference;
}
/** Original generated InputSource value, with normal initialized members and implicit memberwise operations. */
export class InputSource implements InputSourceConstReference {
  private fields = {
    stream: new Reference<XInputStream>(),
    encoding: new OUString(),
    publicId: new OUString(),
    systemId: new OUString(),
  };
  /** Original default/copy/all-field constructors. @param args - Native selected arguments. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: InputSourceConstReference]
      | [
          stream: Reference<XInputStream>,
          encoding: OUStringConstReference,
          publicId: OUStringConstReference,
          systemId: OUStringConstReference,
        ]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 4) {
      this.aInputStream = args[0];
      this.sEncoding = args[1];
      this.sPublicId = args[2];
      this.sSystemId = args[3];
    }
  }
  /** Original stream member lvalue. @returns Reference owner. */ get aInputStream(): Reference<XInputStream> {
    return this.fields.stream;
  }
  /** Original Reference assignment. @param value - Borrowed interface. @returns Nothing. */ set aInputStream(
    value: Reference<XInputStream>,
  ) {
    this.fields.stream.assign(value);
  }
  /** Original encoding member. @returns String owner. */ get sEncoding(): OUString {
    return this.fields.encoding;
  }
  /** Original encoding assignment. @param value - Borrowed string. @returns Nothing. */ set sEncoding(
    value: OUStringConstReference,
  ) {
    this.fields.encoding.assign(value);
  }
  /** Original public ID member. @returns String owner. */ get sPublicId(): OUString {
    return this.fields.publicId;
  }
  /** Original public ID assignment. @param value - Borrowed string. @returns Nothing. */ set sPublicId(
    value: OUStringConstReference,
  ) {
    this.fields.publicId.assign(value);
  }
  /** Original system ID member. @returns String owner. */ get sSystemId(): OUString {
    return this.fields.systemId;
  }
  /** Original system ID assignment. @param value - Borrowed string. @returns Nothing. */ set sSystemId(
    value: OUStringConstReference,
  ) {
    this.fields.systemId.assign(value);
  }
  /** Original implicit copy assignment in declaration order. @param source - Borrowed value. @returns This owner. */ assign(
    source: InputSourceConstReference,
  ): this {
    this.aInputStream = source.aInputStream;
    this.sEncoding = source.sEncoding;
    this.sPublicId = source.sPublicId;
    this.sSystemId = source.sSystemId;
    return this;
  }
  /** Original generated equality preserves field comparison order. @param other - Other value. @returns Equal. */ equals(
    other: InputSourceConstReference,
  ): boolean {
    return (
      this.aInputStream.operatorEquals(other.aInputStream) &&
      this.sEncoding.equals(other.sEncoding) &&
      this.sPublicId.equals(other.sPublicId) &&
      this.sSystemId.equals(other.sSystemId)
    );
  }
  /** Original generated inequality. @param other - Other value. @returns Different. */ notEquals(
    other: InputSourceConstReference,
  ): boolean {
    return !this.equals(other);
  }
  /** Original implicit fieldwise move constructor. @param source - Actual rvalue. @returns Moved value. */ static move(
    source: InputSource,
  ): InputSource {
    const result = Object.create(InputSource.prototype) as InputSource;
    result.fields = {
      stream: Reference.move(source.aInputStream),
      encoding: OUString.move(source.sEncoding),
      publicId: OUString.move(source.sPublicId),
      systemId: OUString.move(source.sSystemId),
    };
    return result;
  }
  /** Original implicit move assignment delegates to real member operations. @param source - Actual rvalue. @returns This owner. */ moveAssign(
    source: InputSource,
  ): this {
    this.fields.stream.moveAssign(source.aInputStream);
    this.fields.encoding.moveAssign(source.sEncoding);
    this.fields.publicId.moveAssign(source.sPublicId);
    this.fields.systemId.moveAssign(source.sSystemId);
    return this;
  }
  /** Original compound lvalue address lowering at valid declared64-bit logical offsets. @param offset - Metadata field offset. @returns Actual field address. */ get(
    offset: number,
  ): unknown {
    return offset === 0
      ? this.fields.stream.getAddress()
      : offset === 8
        ? this.fields.encoding.getDataAddress()
        : offset === 16
          ? this.fields.publicId.getDataAddress()
          : this.fields.systemId.getDataAddress();
  }
  /** Original reverse member destruction. @returns Nothing. */ dispose(): void {
    this.fields.systemId.dispose();
    this.fields.publicId.dispose();
    this.fields.encoding.dispose();
    this.fields.stream.dispose();
  }
}
