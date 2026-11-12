/** @fileoverview Original NotRemoveableException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
import { linkException } from "../../../../../cppu/inc/uno/exception-bindings";
import { Exception } from "../../../../../cppu/inc/com/sun/star/uno/Exception";
import { UnoType } from "../../../../../cppu/inc/unotype";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { typelib_TypeClass as C } from "../../../../../cppu/inc/typelib/typeclass";
import type { TypeClass } from "../uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../../cppu/inc/typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let exceptionValueType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (exceptionValueType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.beans.NotRemoveableException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = UnoType.get("Exception");
    typelib_typedescription_new(
      pTD,
      C.EXCEPTION,
      sTypeName.pData,
      rSuperType.getTypeLibType(),
      0,
      null,
    );
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    exceptionValueType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sTypeName.dispose();
  }
  return exceptionValueType;
}
/** Actual generated NotRemoveableException value derives from the existing Exception owner. */
export class NotRemoveableException extends Exception {
  /** Original explicit constructors initialize base then NotRemoveableException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      [] | [source: NotRemoveableException] | [Message: OUStringConstReference, Context: Reference]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred NotRemoveableException. */
  static override move(source: NotRemoveableException): NotRemoveableException {
    return super.move(source) as NotRemoveableException;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.beans.NotRemoveableException",
  Constructor: NotRemoveableException,
  type: cppu_detail_getUnoType,
});
