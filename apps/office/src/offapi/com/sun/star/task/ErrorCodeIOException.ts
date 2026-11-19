/** @fileoverview Original ErrorCodeIOException.idl comprehensive internal generated value and type owner reuse real IOException inheritance and shared typelib registration. */
import { linkException } from "../../../../../cppu/inc/uno/exception-bindings";
import {
  IOException,
  cppu_detail_getUnoType as runtimeType,
} from "../../../../../cppu/inc/com/sun/star/io/IOException";
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
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let errorCodeIOType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (errorCodeIOType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.task.ErrorCodeIOException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = runtimeType();
    const memberType = new OUString(new Uint8Array([108, 111, 110, 103, 0])),
      memberName = new OUString(new Uint8Array([69, 114, 114, 67, 111, 100, 101, 0]));
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.LONG, pTypeName: memberType.pData, pMemberName: memberName.pData },
    ]);
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    errorCodeIOType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    memberName.dispose();
    memberType.dispose();
    sTypeName.dispose();
  }
  return errorCodeIOType;
}
/** Actual generated ErrorCodeIOException value derives from the existing IOException owner. */
export class ErrorCodeIOException extends IOException {
  private errCode: [number] = [0];
  /** Original signed32 scalar member; default construction initializes zero. @returns Legacy error code. */
  get ErrCode(): number {
    return this.errCode[0];
  }
  /** Assigns a sal_Int32 field with its native width. @param value - Legacy error code. @returns Nothing. */
  set ErrCode(value: number) {
    this.errCode[0] = value | 0;
  }
  /** Original explicit constructors initialize base then ErrorCodeIOException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: ErrorCodeIOException]
      | [Message: OUStringConstReference, Context: Reference, ErrCode: number]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length === 1) this.ErrCode = args[0].ErrCode;
    else if (args.length === 3) this.ErrCode = args[2];
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original generated scalar member lvalue and inherited base addresses. @param offset - Logical LP64 field offset. @returns Actual member address. */
  override get(offset: number): unknown {
    return offset === 16 ? this.errCode : super.get(offset);
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred ErrorCodeIOException. */
  static override move(source: ErrorCodeIOException): ErrorCodeIOException {
    const result = super.move(source) as ErrorCodeIOException;
    result.errCode = [source.ErrCode];
    return result;
  }
  /** Original memberwise copy assignment orders base before scalar. @param source - Source value. @returns This value. */
  override assign(source: ErrorCodeIOException): this {
    super.assign(source);
    this.ErrCode = source.ErrCode;
    return this;
  }
  /** Original implicit move retains the source scalar and transfers base fields. @param source - Source rvalue. @returns This value. */
  override moveAssign(source: ErrorCodeIOException): this {
    super.moveAssign(source);
    this.ErrCode = source.ErrCode;
    return this;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.task.ErrorCodeIOException",
  Constructor: ErrorCodeIOException,
  type: cppu_detail_getUnoType,
});
