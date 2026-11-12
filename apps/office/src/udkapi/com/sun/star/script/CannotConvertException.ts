/** @fileoverview Original CannotConvertException.idl comprehensive internal generated value and type owner reuse real Exception inheritance and shared typelib registration. */
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
import { TypeClass as TC, cppu_detail_getUnoType_TypeClass as classType } from "../uno/TypeClass";
/** Actual generated leaked Type owner, cached once by original StaticWithInit; browser module initialization is synchronous and native thread shutdown is unverified. */
let cannotType: Type | null = null;
/** Original generated cppu_detail_getUnoType and StaticWithInit operator body, using the real factory/register/release and Type owners. @returns Same leaked shared Type value. */
export function cppu_detail_getUnoType(): Type {
  if (cannotType === null) {
    // Native JS encoding represents this known ASCII source literal as its actual terminated const char array.
    const sTypeName = new OUString(
      Uint8Array.from(
        "com.sun.star.script.CannotConvertException\0",
        /** Materializes one byte of the known ASCII source constant. @param character - Original ASCII source character. @returns Its exact native char byte. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    );
    const pTD: [D | null] = [null],
      rSuperType = getTypeFromTypeClass(C.EXCEPTION);
    const enumName = classType().getTypeName(),
      longName = new OUString(new Uint8Array([108, 111, 110, 103, 0])),
      names = ["DestinationTypeClass", "Reason", "ArgumentIndex"].map(
        /** Known source ASCII member name. @param text - Original name. @returns Owned name. */ (
          text,
        ) =>
          new OUString(
            Uint8Array.from(
              text + "\0",
              /** ASCII unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
            ),
          ),
      );
    try {
      typelib_typedescription_new(
        pTD,
        C.EXCEPTION,
        sTypeName.pData,
        rSuperType.getTypeLibType(),
        3,
        names.map(
          /** Original ordered member declaration. @param name - Actual member name. @param index - Member index. @returns Original member description. */ (
            name,
            index,
          ) => ({
            eTypeClass: index === 0 ? C.ENUM : C.LONG,
            pTypeName: (index === 0 ? enumName : longName).pData,
            pMemberName: name.pData,
          }),
        ),
      );
    } finally {
      for (const name of names) name.dispose();
      longName.dispose();
      enumName.dispose();
    }
    typelib_typedescription_register(pTD);
    typelib_typedescription_release(pTD[0] as D);
    cannotType = new Type(C.EXCEPTION as unknown as TypeClass, sTypeName);
    sTypeName.dispose();
  }
  return cannotType;
}
/** Actual generated CannotConvertException value derives from the existing Exception owner. */
export class CannotConvertException extends Exception {
  private convertFields: { DestinationTypeClass: [TC]; Reason: [number]; ArgumentIndex: [number] };
  /** Original destination enum. @returns Value. */ get DestinationTypeClass(): TC {
    return this.convertFields.DestinationTypeClass[0];
  }
  /** Original enum assignment. @param value - New enum. @returns Nothing. */ set DestinationTypeClass(
    value: TC,
  ) {
    this.convertFields.DestinationTypeClass[0] = value;
  }
  /** Original reason. @returns Signed32. */ get Reason(): number {
    return this.convertFields.Reason[0];
  }
  /** Original signed32 assignment. @param value - New reason. @returns Nothing. */ set Reason(
    value: number,
  ) {
    this.convertFields.Reason[0] = value | 0;
  }
  /** Original argument index. @returns Signed32. */ get ArgumentIndex(): number {
    return this.convertFields.ArgumentIndex[0];
  }
  /** Original signed32 assignment. @param value - New index. @returns Nothing. */ set ArgumentIndex(
    value: number,
  ) {
    this.convertFields.ArgumentIndex[0] = value | 0;
  }
  /** Original default/copy/all-member construction. @param args - Original arguments. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: CannotConvertException]
      | [
          message: OUStringConstReference,
          context: Reference,
          destination: TC,
          reason: number,
          index: number,
        ]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    this.convertFields = {
      DestinationTypeClass: [
        args.length === 0 ? TC.VOID : args.length === 1 ? args[0].DestinationTypeClass : args[2],
      ],
      Reason: [args.length === 0 ? 0 : args.length === 1 ? args[0].Reason : args[3] | 0],
      ArgumentIndex: [
        args.length === 0 ? 0 : args.length === 1 ? args[0].ArgumentIndex : args[4] | 0,
      ],
    };
    if (args.length !== 1) cppu_detail_getUnoType();
  }
  /** Original implicit move construction. @param source - Rvalue. @returns Moved exception. */
  static override move(source: CannotConvertException): CannotConvertException {
    const result = super.move(source) as CannotConvertException;
    result.convertFields = {
      DestinationTypeClass: [source.DestinationTypeClass],
      Reason: [source.Reason],
      ArgumentIndex: [source.ArgumentIndex],
    };
    return result;
  }
  /** Original copy assignment. @param source - Borrowed value. @returns This value. */ override assign(
    source: CannotConvertException,
  ): this {
    super.assign(source);
    this.DestinationTypeClass = source.DestinationTypeClass;
    this.Reason = source.Reason;
    this.ArgumentIndex = source.ArgumentIndex;
    return this;
  }
  /** Original move assignment. @param source - Rvalue. @returns This value. */ override moveAssign(
    source: CannotConvertException,
  ): this {
    super.moveAssign(source);
    this.DestinationTypeClass = source.DestinationTypeClass;
    this.Reason = source.Reason;
    this.ArgumentIndex = source.ArgumentIndex;
    return this;
  }
  /** Existing logical compound field addresses. @param offset - Logical offset. @returns Existing field. */ get(
    offset: number,
  ): unknown {
    return offset === 0
      ? this.Message.getDataAddress()
      : offset === 8
        ? this.Context.getAddress()
        : offset === 16
          ? this.convertFields.DestinationTypeClass
          : offset === 20
            ? this.convertFields.Reason
            : this.convertFields.ArgumentIndex;
  }
}

/** Original deprecated global generated type getter delegates to UnoType ADL. @returns Cached original type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
