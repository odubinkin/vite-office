/** @fileoverview Original XElementAccess.idl and comprehensive cppumaker type owner over actual shared typelib factories; concrete services and native physical threading remain unported. */
import type { XInterface } from "../uno/XInterface";
import { Type } from "../uno/Type";
/** Original abstract collection base; its runtime type metadata supplies no concrete service implementation. */
export interface XElementAccess extends XInterface {
  /** Original element type;void denotes heterogeneous values. @returns Owned native type value. */
  getElementType(): Type;
  /** Original nonempty query. @returns Has elements. */
  hasElements(): boolean;
}

import type { Reference } from "../uno/Reference";
import { cppu_detail_getUnoType as runtimeExceptionType } from "../uno/RuntimeException";
import { UnoType } from "../../../../unotype";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
} from "../../../../typelib/typedescription";
import {
  typelib_typedescriptionreference_new,
  typelib_typedescriptionreference_release,
  typelib_typedescription_newMIInterface,
  typelib_typedescription_newInterfaceMethod,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../../typelib/typedescription";
/** Actual generated StaticWithInit cached leaked Type. */
let interfaceType: Type | null = null;
/** Original ADL gate is set before runtime exception and method initialization. */
let bInitStarted = false;
/** Original comprehensive generated ADL and StaticWithInit bodies; no service or type provider substitute. @returns Borrowed original Type. */
export function cppu_detail_getUnoType(): Type {
  if (interfaceType === null) {
    const sTypeName = new OUString(
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105, 110,
        101, 114, 46, 88, 69, 108, 101, 109, 101, 110, 116, 65, 99, 99, 101, 115, 115, 0,
      ]),
    );
    try {
      const pTD: [I | null] = [null],
        aSuperTypes = [UnoType.get(["Reference", "XInterface"]).getTypeLibType() as R],
        sMethodName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105,
            110, 101, 114, 46, 88, 69, 108, 101, 109, 101, 110, 116, 65, 99, 99, 101, 115, 115, 58,
            58, 103, 101, 116, 69, 108, 101, 109, 101, 110, 116, 84, 121, 112, 101, 0,
          ]),
        ),
        member0: [R | null] = [null];
      try {
        typelib_typedescriptionreference_new(member0, C.INTERFACE_METHOD, sMethodName0.pData);
        const sMethodName1 = new OUString(
            new Uint8Array([
              99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97,
              105, 110, 101, 114, 46, 88, 69, 108, 101, 109, 101, 110, 116, 65, 99, 99, 101, 115,
              115, 58, 58, 104, 97, 115, 69, 108, 101, 109, 101, 110, 116, 115, 0,
            ]),
          ),
          member1: [R | null] = [null];
        try {
          typelib_typedescriptionreference_new(member1, C.INTERFACE_METHOD, sMethodName1.pData);
          typelib_typedescription_newMIInterface(
            pTD,
            sTypeName.pData,
            0,
            0,
            0,
            0,
            0,
            1,
            aSuperTypes,
            2,
            [member0[0] as R, member1[0] as R],
          );
          typelib_typedescription_register(pTD as unknown as [D | null]);
          typelib_typedescriptionreference_release(member0[0] as R);
          typelib_typedescriptionreference_release(member1[0] as R);
          typelib_typedescription_release((pTD[0] as I).aBase);
          interfaceType = new Type(C.INTERFACE as unknown as TypeClass, sTypeName);
        } finally {
          sMethodName1.dispose();
        }
      } finally {
        sMethodName0.dispose();
      }
    } finally {
      sTypeName.dispose();
    }
  }
  const rRet = interfaceType;
  if (!bInitStarted) {
    // Browser module execution is synchronous; native mutex/barrier threading is unverified.
    bInitStarted = true;
    UnoType.get(runtimeExceptionType);
    const pMethod: [M | null] = [null];
    {
      const the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType = new OUString(new Uint8Array([116, 121, 112, 101, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105,
            110, 101, 114, 46, 88, 69, 108, 101, 109, 101, 110, 116, 65, 99, 99, 101, 115, 115, 58,
            58, 103, 101, 116, 69, 108, 101, 109, 101, 110, 116, 84, 121, 112, 101, 0,
          ]),
        );
      try {
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          3,
          false,
          sMethodName.pData,
          C.TYPE,
          sReturnType.pData,
          0,
          null,
          1,
          [the_ExceptionName0.pData],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName.dispose();
        sReturnType.dispose();
        the_ExceptionName0.dispose();
      }
    }
    {
      const the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType = new OUString(new Uint8Array([98, 111, 111, 108, 101, 97, 110, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105,
            110, 101, 114, 46, 88, 69, 108, 101, 109, 101, 110, 116, 65, 99, 99, 101, 115, 115, 58,
            58, 104, 97, 115, 69, 108, 101, 109, 101, 110, 116, 115, 0,
          ]),
        );
      try {
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          4,
          false,
          sMethodName.pData,
          C.BOOLEAN,
          sReturnType.pData,
          0,
          null,
          1,
          [the_ExceptionName0.pData],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName.dispose();
        sReturnType.dispose();
        the_ExceptionName0.dispose();
      }
    }
    typelib_typedescription_release((pMethod[0] as M).aBase.aBase);
  }
  return rRet;
}
/** Original deprecated generated Reference-pointer type overload. @param _reference - Ignored declared native pointer. @returns Borrowed original type. */
export function getCppuType(_reference?: Reference | null): Type {
  void _reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Actual generated abstract interface static API; no virtual implementation. */
export const XElementAccess = Object.freeze({
  /** Original generated static_type delegates through UnoType ADL. @param _unused - Ignored pointer. @returns Borrowed Type. */
  static_type(_unused?: unknown): Type {
    void _unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
