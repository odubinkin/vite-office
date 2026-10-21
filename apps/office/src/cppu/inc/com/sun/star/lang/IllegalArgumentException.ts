/** @fileoverview Original IllegalArgumentException.idl comprehensive internal generated value and type owner reuse real RuntimeException inheritance and shared typelib registration. */
import { RuntimeException, cppu_detail_getUnoType as runtimeType } from "../uno/RuntimeException";
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
let illegalArgumentType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (illegalArgumentType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.lang.IllegalArgumentException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = runtimeType();
    const memberType = new OUString(new Uint8Array([115, 104, 111, 114, 116, 0])),
      memberName = new OUString(
        new Uint8Array([
          65, 114, 103, 117, 109, 101, 110, 116, 80, 111, 115, 105, 116, 105, 111, 110, 0,
        ]),
      );
    typelib_typedescription_new(pTD, C.EXCEPTION, sTypeName.pData, rSuperType.getTypeLibType(), 1, [
      { eTypeClass: C.SHORT, pTypeName: memberType.pData, pMemberName: memberName.pData },
    ]);
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    illegalArgumentType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    memberName.dispose();
    memberType.dispose();
    sTypeName.dispose();
  }
  return illegalArgumentType;
}
/** Actual generated IllegalArgumentException value derives from the existing RuntimeException owner. */
export class IllegalArgumentException extends RuntimeException {
  private argumentPosition = 0;
  /** Original signed16 scalar member; default construction initializes zero. @returns Declared argument position. */
  get ArgumentPosition(): number {
    return this.argumentPosition;
  }
  /** Assigns a sal_Int16 field with its native width. @param value - Position. @returns Nothing. */
  set ArgumentPosition(value: number) {
    this.argumentPosition = (value << 16) >> 16;
  }
  /** Original explicit constructors initialize base then IllegalArgumentException type; implicit copy construction copies the base without this call. @param args - Original arguments. @returns Actual exception value. */
  constructor(
    ...args:
      | []
      | [source: IllegalArgumentException]
      | [Message: OUStringConstReference, Context: Reference, ArgumentPosition: number]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length === 1) this.ArgumentPosition = args[0].ArgumentPosition;
    else if (args.length === 3) this.ArgumentPosition = args[2];
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original implicit move construction delegates to base/member moves without registering again. @param source - Actual rvalue. @returns Transferred IllegalArgumentException. */
  static override move(source: IllegalArgumentException): IllegalArgumentException {
    const result = super.move(source) as IllegalArgumentException;
    result.ArgumentPosition = source.ArgumentPosition;
    return result;
  }
  /** Original memberwise copy assignment orders base before scalar. @param source - Source value. @returns This value. */
  override assign(source: IllegalArgumentException): this {
    super.assign(source);
    this.ArgumentPosition = source.ArgumentPosition;
    return this;
  }
  /** Original implicit move retains the source scalar and transfers base fields. @param source - Source rvalue. @returns This value. */
  override moveAssign(source: IllegalArgumentException): this {
    super.moveAssign(source);
    this.ArgumentPosition = source.ArgumentPosition;
    return this;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
