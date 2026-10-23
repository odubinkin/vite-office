/** @fileoverview Original UnknownPropertyException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
import { Exception } from "../uno/Exception";
import { UnoType } from "../../../../unotype";
import { OUString, type OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import { Reference } from "../uno/Reference";
import { Type } from "../uno/Type";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../typelib/typedescription";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let exceptionValueType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (exceptionValueType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.beans.UnknownPropertyException\0",
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
/** Actual generated UnknownPropertyException value derives from the existing Exception owner. */
export class UnknownPropertyException extends Exception {
  /** Original explicit constructors initialize base then UnknownPropertyException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: UnknownPropertyException]
      | [Message: OUStringConstReference, Context: Reference]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Exposes original base-member addresses to the existing compound Any copier. @param offset - Native member offset. @returns Borrowed member cell. */
  get(offset: number): unknown {
    return offset === 0 ? this.Message.getDataAddress() : [this.Context.get()];
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred UnknownPropertyException. */
  static override move(source: UnknownPropertyException): UnknownPropertyException {
    return super.move(source) as UnknownPropertyException;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
