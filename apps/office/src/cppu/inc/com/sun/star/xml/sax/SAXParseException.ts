/** @fileoverview Original SAXParseException.idl generated value, inherited ownership and normal CPPU exception metadata; no JavaScript Error envelope is substituted. */
import { linkException } from "../../../../../uno/exception-bindings";
import { SAXException, cppu_detail_getUnoType as saxType } from "./SAXException";
import { Any } from "../../uno/Any";
import { Reference } from "../../uno/Reference";
import { Type } from "../../uno/Type";
import { OUString, type OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_ASCII_US } from "../../../../../../../sal/inc/rtl/textenc";
import { typelib_TypeClass as C } from "../../../../../typelib/typeclass";
import type { TypeClass } from "../../../../../../../udkapi/com/sun/star/uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../../typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../../typelib/typedescription";

let parseType: Type | null = null;
/** Materializes a compiler-known counted ASCII literal. @param value - Source literal. @returns Owned RTL value. */
function literal(value: string): OUString {
  return new OUString(new TextEncoder().encode(value), value.length, RTL_TEXTENCODING_ASCII_US);
}
/** Original comprehensive generated getter registers the base and four members in declaration order. @returns Shared cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (parseType === null) {
    const name = literal("com.sun.star.xml.sax.SAXParseException"),
      stringType = literal("string"),
      longType = literal("long"),
      names = ["PublicId", "SystemId", "LineNumber", "ColumnNumber"].map(literal),
      description: [D | null] = [null];
    try {
      typelib_typedescription_new(
        description,
        C.EXCEPTION,
        name.pData,
        saxType().getTypeLibType(),
        4,
        names.map(
          /** Preserves IDL field order and declared types. @param field - Owned member name. @param index - Original member index. @returns Native member declaration. */
          (field, index) => ({
            eTypeClass: index < 2 ? C.STRING : C.LONG,
            pTypeName: (index < 2 ? stringType : longType).pData,
            pMemberName: field.pData,
          }),
        ),
      );
      typelib_typedescription_register(description);
      typelib_typedescription_release(description[0] as D);
      parseType = new Type(C.EXCEPTION as unknown as TypeClass, name);
    } finally {
      for (const field of names) field.dispose();
      longType.dispose();
      stringType.dispose();
      name.dispose();
    }
  }
  return parseType;
}
/** Complete generated exception value and original implicit member operations. */
export class SAXParseException extends SAXException {
  private publicId: OUString;
  private systemId: OUString;
  private line: [number];
  private column: [number];
  /** Original default, copy and all-field constructors. @param args - Selected native arguments in inherited/member declaration order. @returns Actual UNO exception value. */
  constructor(
    ...args:
      | []
      | [source: SAXParseException]
      | [
          message: OUStringConstReference,
          context: Reference,
          wrapped: Any,
          publicId: OUStringConstReference,
          systemId: OUStringConstReference,
          line: number,
          column: number,
        ]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1], args[2]);
    this.publicId =
      args.length === 0
        ? new OUString()
        : new OUString(args.length === 1 ? args[0].PublicId : args[3]);
    this.systemId =
      args.length === 0
        ? new OUString()
        : new OUString(args.length === 1 ? args[0].SystemId : args[4]);
    this.line = [args.length === 0 ? 0 : (args.length === 1 ? args[0].LineNumber : args[5]) | 0];
    this.column = [
      args.length === 0 ? 0 : (args.length === 1 ? args[0].ColumnNumber : args[6]) | 0,
    ];
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original public identifier member owner. @returns Borrowed member. */ get PublicId(): OUString {
    return this.publicId;
  }
  /** Original public identifier assignment. @param value - Borrowed value. @returns Nothing. */ set PublicId(
    value: OUStringConstReference,
  ) {
    this.publicId.assign(value);
  }
  /** Original system identifier member owner. @returns Borrowed member. */ get SystemId(): OUString {
    return this.systemId;
  }
  /** Original system identifier assignment. @param value - Borrowed value. @returns Nothing. */ set SystemId(
    value: OUStringConstReference,
  ) {
    this.systemId.assign(value);
  }
  /** Original signed32 line. @returns Member value. */ get LineNumber(): number {
    return this.line[0];
  }
  /** Original signed32 assignment. @param value - Native scalar. @returns Nothing. */ set LineNumber(
    value: number,
  ) {
    this.line[0] = value | 0;
  }
  /** Original signed32 column. @returns Member value. */ get ColumnNumber(): number {
    return this.column[0];
  }
  /** Original signed32 assignment. @param value - Native scalar. @returns Nothing. */ set ColumnNumber(
    value: number,
  ) {
    this.column[0] = value | 0;
  }
  /** Original implicit copy assignment orders base then derived members. @param source - Borrowed source. @returns This value. */ override assign(
    source: SAXParseException,
  ): this {
    super.assign(source);
    this.PublicId = source.PublicId;
    this.SystemId = source.SystemId;
    this.LineNumber = source.LineNumber;
    this.ColumnNumber = source.ColumnNumber;
    return this;
  }
  /** Original implicit move constructor delegates to actual base/member moves and retains scalar source values. @param source - Actual rvalue. @returns Moved exception. */ static override move(
    source: SAXParseException,
  ): SAXParseException {
    const result = super.move(source) as SAXParseException;
    result.publicId = OUString.move(source.PublicId);
    result.systemId = OUString.move(source.SystemId);
    result.line = [source.LineNumber];
    result.column = [source.ColumnNumber];
    return result;
  }
  /** Original implicit move assignment. @param source - Actual rvalue. @returns This value. */ override moveAssign(
    source: SAXParseException,
  ): this {
    super.moveAssign(source);
    this.publicId.moveAssign(source.PublicId);
    this.systemId.moveAssign(source.SystemId);
    this.LineNumber = source.LineNumber;
    this.ColumnNumber = source.ColumnNumber;
    return this;
  }
  /** Original generated member lvalues at shared CPPU logical LP64 offsets. @param offset - Metadata member offset. @returns Existing address, without owning/copying data. */ override get(
    offset: number,
  ): unknown {
    switch (offset) {
      case 40:
        return this.publicId.getDataAddress();
      case 48:
        return this.systemId.getDataAddress();
      case 56:
        return this.line;
      case 60:
        return this.column;
      default:
        return super.get(offset);
    }
  }
  /** Original reverse derived/base member destruction. @returns Nothing. */ override dispose(): void {
    this.systemId.dispose();
    this.publicId.dispose();
    super.dispose();
  }
}
/** Original deprecated generated type getter. @returns Shared cached Type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.xml.sax.SAXParseException",
  Constructor: SAXParseException,
  type: cppu_detail_getUnoType,
});
