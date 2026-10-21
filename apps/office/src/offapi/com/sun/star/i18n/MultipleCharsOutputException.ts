/** @fileoverview Actual MultipleCharsOutputException.idl generated class and original cppumaker cached type initializer retain Exception inheritance and real shared typelib registration; normal internal debug0 configuration. */
import { OUString } from "../../../../../sal/inc/rtl/ustring";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { getTypeFromTypeClass } from "../../../../../cppu/inc/unotype";
import { typelib_TypeClass as C } from "../../../../../cppu/inc/typelib/typeclass";
import type { TypeClass } from "../../../../../udkapi/com/sun/star/uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../../cppu/inc/typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let exceptionType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (exceptionType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.i18n.MultipleCharsOutputException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = getTypeFromTypeClass(C.EXCEPTION);
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
    exceptionType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sTypeName.dispose();
  }
  return exceptionType;
}

import { Exception } from "../../../../../cppu/inc/com/sun/star/uno/Exception";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original generated fieldless derived exception; native implicit special members delegate to actual Exception. */
export class MultipleCharsOutputException extends Exception {
  /** Original default/full/copy constructors; only explicit native constructors initialize the cached type. @param args - Native fields or source. @returns Exception value. */
  constructor(
    ...args:
      | []
      | [source: MultipleCharsOutputException]
      | [message: OUStringConstReference, context: Reference]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Native implicit move preserves the derived value prototype. @param source - Actual rvalue. @returns Derived value. */
  public static override move(source: MultipleCharsOutputException): MultipleCharsOutputException {
    return super.move(source) as MultipleCharsOutputException;
  }
}
