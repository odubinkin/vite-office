/** @fileoverview Complete original internal XExceptionThrower IDL and cppumaker comprehensive type owner over actual shared UNO/SAL dependencies; no exception/environment/mapping provider. */
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { cppu_detail_getUnoType as runtimeExceptionType } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { UnoType } from "../../../cppu/inc/unotype";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { typelib_TypeClass as C } from "../../../cppu/inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_Parameter_Init,
} from "../../../cppu/inc/typelib/typedescription";
import {
  typelib_typedescriptionreference_new,
  typelib_typedescriptionreference_release,
  typelib_typedescription_newMIInterface,
  typelib_typedescription_newInterfaceMethod,
  typelib_typedescription_register,
  typelib_typedescription_release,
} from "../../../cppu/inc/typelib/typedescription";
/** Original generated pure interface declaration; virtual bodies belong to the real exception mechanism. */
export interface XExceptionThrower extends XInterface {
  /** Original borrowed const Any input. @param exc - Caller-owned original exception Any. @returns Nothing. */
  throwException(exc: Readonly<Any>): void;
  /** Original rethrow virtual contract. @returns Nothing. */
  rethrowException(): void;
}
/** Original StaticWithInit leaked Type owner; synchronous JS initialization has no thread simulator. */
let interfaceType: Type | null = null;
/** Original method initialization gate, set before Exception/RuntimeException bootstrap. */
let bInitStarted = false;
/** Complete original generated ADL factory and method description initialization. @returns Borrowed original leaked type. */
export function cppu_detail_getUnoType(): Type {
  if (interfaceType === null) {
    const sTypeName = new OUString(
      new Uint8Array([
        99, 112, 112, 117, 104, 101, 108, 112, 101, 114, 46, 100, 101, 116, 97, 105, 108, 46, 88,
        69, 120, 99, 101, 112, 116, 105, 111, 110, 84, 104, 114, 111, 119, 101, 114, 0,
      ]),
    );
    try {
      const pTD: [I | null] = [null],
        aSuperTypes = [UnoType.get(["Reference", "XInterface"]).getTypeLibType() as R];
      const sMethodName0 = new OUString(
          new Uint8Array([
            99, 112, 112, 117, 104, 101, 108, 112, 101, 114, 46, 100, 101, 116, 97, 105, 108, 46,
            88, 69, 120, 99, 101, 112, 116, 105, 111, 110, 84, 104, 114, 111, 119, 101, 114, 58, 58,
            116, 104, 114, 111, 119, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        member0: [R | null] = [null];
      try {
        typelib_typedescriptionreference_new(member0, C.INTERFACE_METHOD, sMethodName0.pData);
        const sMethodName1 = new OUString(
            new Uint8Array([
              99, 112, 112, 117, 104, 101, 108, 112, 101, 114, 46, 100, 101, 116, 97, 105, 108, 46,
              88, 69, 120, 99, 101, 112, 116, 105, 111, 110, 84, 104, 114, 111, 119, 101, 114, 58,
              58, 114, 101, 116, 104, 114, 111, 119, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
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
          interfaceType = new Type(
            C.INTERFACE as unknown as ReturnType<Type["getTypeClass"]>,
            sTypeName,
          );
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
    bInitStarted = true;
    UnoType.get(runtimeExceptionType);
    UnoType.get("Exception");
    const pMethod: [M | null] = [null];
    {
      const sParamName0 = new OUString(new Uint8Array([101, 120, 99, 0])),
        sParamType0 = new OUString(new Uint8Array([97, 110, 121, 0]));
      const the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 69, 120,
            99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName1 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType = new OUString(new Uint8Array([118, 111, 105, 100, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 112, 112, 117, 104, 101, 108, 112, 101, 114, 46, 100, 101, 116, 97, 105, 108, 46,
            88, 69, 120, 99, 101, 112, 116, 105, 111, 110, 84, 104, 114, 111, 119, 101, 114, 58, 58,
            116, 104, 114, 111, 119, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        );
      try {
        const aParameters: typelib_Parameter_Init[] = [
          {
            pParamName: sParamName0.pData,
            eTypeClass: C.ANY,
            pTypeName: sParamType0.pData,
            bIn: true,
            bOut: false,
          },
        ];
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          3,
          false,
          sMethodName.pData,
          C.VOID,
          sReturnType.pData,
          1,
          aParameters,
          2,
          [the_ExceptionName0.pData, the_ExceptionName1.pData],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName.dispose();
        sReturnType.dispose();
        the_ExceptionName1.dispose();
        the_ExceptionName0.dispose();
        sParamType0.dispose();
        sParamName0.dispose();
      }
    }
    {
      const the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 69, 120,
            99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName1 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType = new OUString(new Uint8Array([118, 111, 105, 100, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 112, 112, 117, 104, 101, 108, 112, 101, 114, 46, 100, 101, 116, 97, 105, 108, 46,
            88, 69, 120, 99, 101, 112, 116, 105, 111, 110, 84, 104, 114, 111, 119, 101, 114, 58, 58,
            114, 101, 116, 104, 114, 111, 119, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        );
      try {
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          4,
          false,
          sMethodName.pData,
          C.VOID,
          sReturnType.pData,
          0,
          null,
          2,
          [the_ExceptionName0.pData, the_ExceptionName1.pData],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName.dispose();
        sReturnType.dispose();
        the_ExceptionName1.dispose();
        the_ExceptionName0.dispose();
      }
    }
    typelib_typedescription_release((pMethod[0] as M).aBase.aBase);
  }
  return rRet;
}
/** Original generated deprecated Reference pointer overload. @param _reference - Unused original declared pointer. @returns Borrowed real type. */
export function getCppuType(_reference?: Reference<XExceptionThrower> | null): Type {
  void _reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original static interface API accompanies the structural declaration. */
export const XExceptionThrower = Object.freeze({
  /** Original static_type ignores its native pointer and uses real UnoType ADL. @param _unused - Original ignored pointer. @returns Borrowed real type. */
  static_type(_unused?: unknown): Type {
    void _unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
