/** @fileoverview Original DOMException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
import { linkException } from "../../../../../uno/exception-bindings";
import { Exception } from "../../uno/Exception";
import { UnoType } from "../../../../../unotype";
import { DOMExceptionType, cppu_detail_getUnoType_DOMExceptionType } from "./DOMExceptionType";
import { OUString, type OUStringConstReference } from "../../../../../../../sal/inc/rtl/ustring";
import { Reference } from "../../uno/Reference";
import { Type } from "../../uno/Type";
import { typelib_TypeClass as C } from "../../../../../typelib/typeclass";
import type { TypeClass } from "../../../../../../../udkapi/com/sun/star/uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../../typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../../typelib/typedescription";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let domExceptionValueType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (domExceptionValueType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.xml.dom.DOMException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = UnoType.get("Exception");
    cppu_detail_getUnoType_DOMExceptionType();
    const memberType = new OUString(
        new Uint8Array([
          99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 120, 109, 108, 46, 100, 111,
          109, 46, 68, 79, 77, 69, 120, 99, 101, 112, 116, 105, 111, 110, 84, 121, 112, 101, 0,
        ]),
      ),
      memberName = new OUString(new Uint8Array([67, 111, 100, 101, 0]));
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.ENUM, pTypeName: memberType.pData, pMemberName: memberName.pData },
    ]);
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    domExceptionValueType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    memberName.dispose();
    memberType.dispose();
    sTypeName.dispose();
  }
  return domExceptionValueType;
}
/** Actual generated DOMException value derives from the existing Exception owner. */
export class DOMException extends Exception {
  private code: [DOMExceptionType] = [DOMExceptionType.DOMSTRING_SIZE_ERR];
  /** Original signed32 enum member; default construction initializes zero. @returns Declared DOM exception code. */
  get Code(): DOMExceptionType {
    return this.code[0];
  }
  /** Assigns the native enum field with its native width. @param value - Enum value. @returns Nothing. */
  set Code(value: DOMExceptionType) {
    this.code[0] = (value | 0) as DOMExceptionType;
  }
  /** Original explicit constructors initialize base then DOMException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: DOMException]
      | [Message: OUStringConstReference, Context: Reference, Code: DOMExceptionType]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length === 1) this.Code = args[0].Code;
    else if (args.length === 3) this.Code = args[2];
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original generated enum member lvalue and inherited base addresses. @param offset - Logical LP64 field offset. @returns Actual member address. */
  override get(offset: number): unknown {
    return offset === 16 ? this.code : super.get(offset);
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred DOMException. */
  static override move(source: DOMException): DOMException {
    const result = super.move(source) as DOMException;
    result.code = [source.Code];
    return result;
  }
  /** Original memberwise copy assignment orders base before scalar. @param source - Source value. @returns This value. */
  override assign(source: DOMException): this {
    super.assign(source);
    this.Code = source.Code;
    return this;
  }
  /** Original implicit move retains the source scalar and transfers base fields. @param source - Source rvalue. @returns This value. */
  override moveAssign(source: DOMException): this {
    super.moveAssign(source);
    this.Code = source.Code;
    return this;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.xml.dom.DOMException",
  Constructor: DOMException,
  type: cppu_detail_getUnoType,
});
