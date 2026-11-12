/** @fileoverview Original ContentCreationException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
import { Exception } from "../../../../../cppu/inc/com/sun/star/uno/Exception";
import { getTypeFromTypeClass } from "../../../../../cppu/inc/unotype";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { typelib_TypeClass as C } from "../../../../../cppu/inc/typelib/typeclass";
import type { TypeClass } from "../../../../../udkapi/com/sun/star/uno/TypeClass";
import type { typelib_TypeDescription as D } from "../../../../../cppu/inc/typelib/typedescription";
import {
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../../cppu/inc/typelib/typedescription";
import {
  ContentCreationError,
  cppu_detail_getUnoType_ContentCreationError as errorType,
} from "./ContentCreationError";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let creationType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (creationType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.ucb.ContentCreationException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = getTypeFromTypeClass(C.EXCEPTION);
    const memberType = errorType().getTypeName(),
      memberName = new OUString(new Uint8Array([101, 69, 114, 114, 111, 114, 0]));
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.ENUM, pTypeName: memberType.pData, pMemberName: memberName.pData },
    ]);
    memberName.dispose();
    memberType.dispose();
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    creationType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sTypeName.dispose();
  }
  return creationType;
}
/** Actual generated ContentCreationException value derives from the existing Exception owner. */
export class ContentCreationException extends Exception {
  private error: [ContentCreationError];
  /** Original enum member. @returns Current error. */
  get eError(): ContentCreationError {
    return this.error[0];
  }
  /** Original enum member assignment. @param value - New error. @returns Nothing. */
  set eError(value: ContentCreationError) {
    this.error[0] = value;
  }
  /** Original default/copy/all-field constructors. @param args - Original arguments. @returns Exception value. */
  constructor(
    ...args:
      | []
      | [source: ContentCreationException]
      | [message: OUStringConstReference, context: Reference, error: ContentCreationError]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    this.error = [
      args.length === 0
        ? ContentCreationError.UNKNOWN
        : args.length === 1
          ? args[0].eError
          : args[2],
    ];
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original implicit memberwise move construction. @param source - Actual rvalue. @returns Transferred exception. */
  static override move(source: ContentCreationException): ContentCreationException {
    const result = super.move(source) as ContentCreationException;
    result.error = [source.eError];
    return result;
  }
  /** Original base then enum copy assignment. @param source - Borrowed source. @returns This value. */
  override assign(source: ContentCreationException): this {
    super.assign(source);
    this.eError = source.eError;
    return this;
  }
  /** Original base then enum move assignment. @param source - Actual rvalue. @returns This value. */
  override moveAssign(source: ContentCreationException): this {
    super.moveAssign(source);
    this.eError = source.eError;
    return this;
  }
  /** Existing logical exception field address lowering. @param offset - Native logical field offset. @returns Existing field address. */
  get(offset: number): unknown {
    return offset === 0
      ? this.Message.getDataAddress()
      : offset === 8
        ? this.Context.getAddress()
        : this.error;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
