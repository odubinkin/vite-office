/** @fileoverview Original SAXInvalidCharacterException.idl comprehensive internal generated value and type owner reuse real SAXException inheritance and shared typelib registration. */
import { linkException } from "../../../../../../cppu/inc/uno/exception-bindings";
import {
  SAXException,
  cppu_detail_getUnoType as runtimeType,
} from "../../../../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { OUString, type OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { typelib_TypeClass as C } from "../../../../../../cppu/inc/typelib/typeclass";
import type { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../../../cppu/inc/typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../../../cppu/inc/typelib/typedescription";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let invalidCharacterExceptionType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (invalidCharacterExceptionType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.xml.sax.SAXInvalidCharacterException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = runtimeType();
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
    invalidCharacterExceptionType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sTypeName.dispose();
  }
  return invalidCharacterExceptionType;
}
/** Actual generated SAXInvalidCharacterException value derives from the existing SAXException owner. */
export class SAXInvalidCharacterException extends SAXException {
  /** Original explicit constructors initialize base then SAXInvalidCharacterException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: SAXInvalidCharacterException]
      | [Message: OUStringConstReference, Context: Reference, WrappedException: Any]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1], args[2]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred SAXInvalidCharacterException. */
  static override move(source: SAXInvalidCharacterException): SAXInvalidCharacterException {
    return super.move(source) as SAXInvalidCharacterException;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.xml.sax.SAXInvalidCharacterException",
  Constructor: SAXInvalidCharacterException,
  type: cppu_detail_getUnoType,
});
