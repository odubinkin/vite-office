/** @fileoverview Original embed/UseBackupException.idl comprehensive internal generated value and type owner reuse real IOException inheritance and shared typelib registration. */
import { linkException } from "../../../../../cppu/inc/uno/exception-bindings";
import {
  IOException,
  getCppuType as getIOExceptionType,
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
let useBackupType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (useBackupType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.embed.UseBackupException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = getIOExceptionType();
    const memberType = OUString.fromUtf8(new TextEncoder().encode("string")),
      memberName = OUString.fromUtf8(new TextEncoder().encode("TemporaryFileURL"));
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.STRING, pTypeName: memberType.pData, pMemberName: memberName.pData },
    ]);
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    useBackupType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    memberName.dispose();
    memberType.dispose();
    sTypeName.dispose();
  }
  return useBackupType;
}
/** Actual generated UseBackupException value derives from the existing IOException owner. */
export class UseBackupException extends IOException {
  private temporaryFileURL: OUString;
  /** Original stable generated string member. @returns Borrowed owned member. */ get TemporaryFileURL(): OUString {
    return this.temporaryFileURL;
  }
  /** Original generated string assignment. @param value - Actual borrowed value. @returns Nothing. */ set TemporaryFileURL(
    value: OUStringConstReference,
  ) {
    this.temporaryFileURL.assign(value);
  }
  /** Original default/copy/member constructors. @param args - Source constructor arguments. @returns Actual exception. */
  constructor(
    ...args:
      | []
      | [source: UseBackupException]
      | [message: OUStringConstReference, context: Reference, url: OUStringConstReference]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    this.temporaryFileURL =
      args.length === 0
        ? new OUString()
        : new OUString(args.length === 1 ? args[0].TemporaryFileURL : args[2]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original string lvalue after inherited fields. @param offset - Original LP64 field offset. @returns Actual address. */ override get(
    offset: number,
  ): unknown {
    return offset === 16 ? this.temporaryFileURL.getDataAddress() : super.get(offset);
  }
  /** Original implicit move construction. @param source - Actual rvalue. @returns Transferred value. */ static override move(
    source: UseBackupException,
  ): UseBackupException {
    const result = super.move(source) as UseBackupException;
    result.temporaryFileURL = OUString.move(source.TemporaryFileURL);
    return result;
  }
  /** Original memberwise assignment. @param source - Original value. @returns This value. */ override assign(
    source: UseBackupException,
  ): this {
    super.assign(source);
    this.TemporaryFileURL = source.TemporaryFileURL;
    return this;
  }
  /** Original memberwise move. @param source - Original rvalue. @returns This value. */ override moveAssign(
    source: UseBackupException,
  ): this {
    super.moveAssign(source);
    this.temporaryFileURL.moveAssign(source.TemporaryFileURL);
    return this;
  }
  /** Original reverse member/base destruction. @returns Nothing. */ override dispose(): void {
    this.temporaryFileURL.dispose();
    super.dispose();
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.embed.UseBackupException",
  Constructor: UseBackupException,
  type: cppu_detail_getUnoType,
});
