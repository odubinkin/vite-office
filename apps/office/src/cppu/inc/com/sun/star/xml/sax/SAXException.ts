/** @fileoverview Original SAXException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
import { Any } from "../../uno/Any";
import { Exception } from "../../uno/Exception";
import { getTypeFromTypeClass } from "../../../../../unotype";
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
let saxType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (saxType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.xml.sax.SAXException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = getTypeFromTypeClass(C.EXCEPTION);
    const sMemberType0 = new OUString(new Uint8Array([97, 110, 121, 0])),
      sMemberName0 = new OUString(
        Uint8Array.from(
          "WrappedException\0",
          /** Original ASCII member-name literal. @param c - Character. @returns Byte. */ (c) =>
            c.charCodeAt(0),
        ),
      );
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.ANY, pTypeName: sMemberType0.pData, pMemberName: sMemberName0.pData },
    ]);
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    saxType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sMemberName0.dispose();
    sMemberType0.dispose();
    sTypeName.dispose();
  }
  return saxType;
}
/** Actual generated SAXException value derives from the existing Exception owner. */
export class SAXException extends Exception {
  private wrappedException: Any;
  /** Original stable owned Any member. @returns Borrowed field owner. */
  get WrappedException(): Any {
    return this.wrappedException;
  }
  /** Original Any field copy assignment. @param value - Borrowed Any. @returns Nothing. */
  set WrappedException(value: Any) {
    this.wrappedException.assign(value);
  }
  /** Original explicit constructors initialize base then SAXException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: SAXException]
      | [Message: OUStringConstReference, Context: Reference, WrappedException: Any]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    this.wrappedException =
      args.length === 0
        ? new Any()
        : new Any(args.length === 1 ? args[0].WrappedException : args[2]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred SAXException. */
  static override move(source: SAXException): SAXException {
    const result = super.move(source) as SAXException;
    result.wrappedException = Any.move(source.WrappedException);
    return result;
  }
  /** Original memberwise assignment orders base before owned Any. @param source - Source value. @returns This value. */
  override assign(source: SAXException): this {
    super.assign(source);
    this.WrappedException = source.WrappedException;
    return this;
  }
  /** Original implicit move delegates each field to its actual move operation. @param source - Source rvalue. @returns This value. */
  override moveAssign(source: SAXException): this {
    super.moveAssign(source);
    this.wrappedException.moveAssign(source.WrappedException);
    return this;
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  override dispose(): void {
    this.wrappedException.dispose();
    super.dispose();
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
