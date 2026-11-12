/** @fileoverview Original CommandFailedException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
import { linkException } from "../../../../../cppu/inc/uno/exception-bindings";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../../cppu/inc/com/sun/star/uno/Exception";
import { UnoType } from "../../../../../cppu/inc/unotype";
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
let commandFailedType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (commandFailedType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.ucb.CommandFailedException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = UnoType.get("Exception");
    const sMemberType0 = new OUString(new Uint8Array([97, 110, 121, 0])),
      sMemberName0 = new OUString(new Uint8Array([82, 101, 97, 115, 111, 110, 0]));
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.ANY, pTypeName: sMemberType0.pData, pMemberName: sMemberName0.pData },
    ]);
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    commandFailedType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sMemberName0.dispose();
    sMemberType0.dispose();
    sTypeName.dispose();
  }
  return commandFailedType;
}
/** Actual generated CommandFailedException value derives from the existing Exception owner. */
export class CommandFailedException extends Exception {
  private reason: Any;
  /** Original stable owned Any member. @returns Borrowed field owner. */
  get Reason(): Any {
    return this.reason;
  }
  /** Original Any field copy assignment. @param value - Borrowed Any. @returns Nothing. */
  set Reason(value: Any) {
    this.reason.assign(value);
  }
  /** Original explicit constructors initialize base then CommandFailedException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: CommandFailedException]
      | [Message: OUStringConstReference, Context: Reference, Reason: Any]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    this.reason =
      args.length === 0 ? new Any() : new Any(args.length === 1 ? args[0].Reason : args[2]);
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original generated Any member lvalue and inherited base addresses. @param offset - Logical LP64 field offset. @returns Actual member address. */
  override get(offset: number): unknown {
    return offset === 16 ? this.reason : super.get(offset);
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred CommandFailedException. */
  static override move(source: CommandFailedException): CommandFailedException {
    const result = super.move(source) as CommandFailedException;
    result.reason = Any.move(source.Reason);
    return result;
  }
  /** Original memberwise assignment orders base before owned Any. @param source - Source value. @returns This value. */
  override assign(source: CommandFailedException): this {
    super.assign(source);
    this.Reason = source.Reason;
    return this;
  }
  /** Original implicit move delegates each field to its actual move operation. @param source - Source rvalue. @returns This value. */
  override moveAssign(source: CommandFailedException): this {
    super.moveAssign(source);
    this.reason.moveAssign(source.Reason);
    return this;
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  override dispose(): void {
    this.reason.dispose();
    super.dispose();
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}

// Compiler-emitted JavaScript RTTI linkage for this actual generated declaration.
linkException({
  name: "com.sun.star.ucb.CommandFailedException",
  Constructor: CommandFailedException,
  type: cppu_detail_getUnoType,
});
