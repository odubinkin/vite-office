/** @fileoverview Original XIndexContainer.idl with complete comprehensive cppumaker runtime type metadata; concrete services and native physical threading remain unported. */
import type { XIndexReplace } from "./XIndexReplace";
import type { Any } from "../uno/Any";
/** Original insertion/removal access inherits indexed replacement. */
export interface XIndexContainer extends XIndexReplace {
  /** Original insertion includes the append position. @param Index - Signed32 position. @param Element - Borrowed native Any. @returns Nothing. @throws Native IllegalArgumentException,IndexOutOfBoundsException or WrappedTargetException. */
  insertByIndex(Index: number, Element: Any): void;
  /** Original removal. @param Index - Signed32 position. @returns Nothing. @throws Native IndexOutOfBoundsException or WrappedTargetException. */
  removeByIndex(Index: number): void;
}

import { Type } from "../uno/Type";
import { cppu_detail_getUnoType as baseType } from "./XIndexReplace";
import { cppu_detail_getUnoType as initializeRuntimeException } from "../uno/RuntimeException";
import { cppu_detail_getUnoType as initializeIllegalArgumentException } from "../lang/IllegalArgumentException";
import { cppu_detail_getUnoType as initializeIndexOutOfBoundsException } from "../lang/IndexOutOfBoundsException";
import { cppu_detail_getUnoType as initializeWrappedTargetException } from "../lang/WrappedTargetException";
import type { Reference } from "../uno/Reference";
import { UnoType } from "../../../../unotype";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_Parameter_Init,
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
/** Original early ADL method initialization gate. */
let bInitStarted = false;
/** Original comprehensive generated ADL/StaticWithInit bodies over actual factories. @returns Borrowed original Type. */
export function cppu_detail_getUnoType(): Type {
  if (interfaceType === null) {
    const sTypeName = new OUString(
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105, 110,
        101, 114, 46, 88, 73, 110, 100, 101, 120, 67, 111, 110, 116, 97, 105, 110, 101, 114, 0,
      ]),
    );
    try {
      const pTD: [I | null] = [null],
        aSuperTypes = [UnoType.get(["Reference", baseType]).getTypeLibType() as R];
      const sMethodName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105,
            110, 101, 114, 46, 88, 73, 110, 100, 101, 120, 67, 111, 110, 116, 97, 105, 110, 101,
            114, 58, 58, 105, 110, 115, 101, 114, 116, 66, 121, 73, 110, 100, 101, 120, 0,
          ]),
        ),
        member0: [R | null] = [null];
      try {
        typelib_typedescriptionreference_new(member0, C.INTERFACE_METHOD, sMethodName0.pData);
        const sMethodName1 = new OUString(
            new Uint8Array([
              99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97,
              105, 110, 101, 114, 46, 88, 73, 110, 100, 101, 120, 67, 111, 110, 116, 97, 105, 110,
              101, 114, 58, 58, 114, 101, 109, 111, 118, 101, 66, 121, 73, 110, 100, 101, 120, 0,
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
    // Browser execution is synchronous; native mutex/barrier threading remains unverified.
    bInitStarted = true;
    UnoType.get(initializeRuntimeException);
    UnoType.get(initializeIllegalArgumentException);
    UnoType.get(initializeIndexOutOfBoundsException);
    UnoType.get(initializeWrappedTargetException);
    const pMethod: [M | null] = [null];
    {
      const sParamName0 = new OUString(new Uint8Array([73, 110, 100, 101, 120, 0])),
        sParamType0 = new OUString(new Uint8Array([108, 111, 110, 103, 0])),
        sParamName1 = new OUString(new Uint8Array([69, 108, 101, 109, 101, 110, 116, 0])),
        sParamType1 = new OUString(new Uint8Array([97, 110, 121, 0])),
        the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 73,
            108, 108, 101, 103, 97, 108, 65, 114, 103, 117, 109, 101, 110, 116, 69, 120, 99, 101,
            112, 116, 105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName1 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 73,
            110, 100, 101, 120, 79, 117, 116, 79, 102, 66, 111, 117, 110, 100, 115, 69, 120, 99,
            101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName2 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 87,
            114, 97, 112, 112, 101, 100, 84, 97, 114, 103, 101, 116, 69, 120, 99, 101, 112, 116,
            105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName3 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType0 = new OUString(new Uint8Array([118, 111, 105, 100, 0])),
        sMethodName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105,
            110, 101, 114, 46, 88, 73, 110, 100, 101, 120, 67, 111, 110, 116, 97, 105, 110, 101,
            114, 58, 58, 105, 110, 115, 101, 114, 116, 66, 121, 73, 110, 100, 101, 120, 0,
          ]),
        );
      try {
        const aParameters: typelib_Parameter_Init[] = [
          {
            pParamName: sParamName0.pData,
            eTypeClass: C.LONG,
            pTypeName: sParamType0.pData,
            bIn: true,
            bOut: false,
          },
          {
            pParamName: sParamName1.pData,
            eTypeClass: C.ANY,
            pTypeName: sParamType1.pData,
            bIn: true,
            bOut: false,
          },
        ];
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          8,
          false,
          sMethodName0.pData,
          C.VOID,
          sReturnType0.pData,
          2,
          aParameters,
          4,
          [
            the_ExceptionName0.pData,
            the_ExceptionName1.pData,
            the_ExceptionName2.pData,
            the_ExceptionName3.pData,
          ],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName0.dispose();
        sReturnType0.dispose();
        the_ExceptionName3.dispose();
        the_ExceptionName2.dispose();
        the_ExceptionName1.dispose();
        the_ExceptionName0.dispose();
        sParamType1.dispose();
        sParamName1.dispose();
        sParamType0.dispose();
        sParamName0.dispose();
      }
    }
    {
      const sParamName0 = new OUString(new Uint8Array([73, 110, 100, 101, 120, 0])),
        sParamType0 = new OUString(new Uint8Array([108, 111, 110, 103, 0])),
        the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 73,
            110, 100, 101, 120, 79, 117, 116, 79, 102, 66, 111, 117, 110, 100, 115, 69, 120, 99,
            101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName1 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 87,
            114, 97, 112, 112, 101, 100, 84, 97, 114, 103, 101, 116, 69, 120, 99, 101, 112, 116,
            105, 111, 110, 0,
          ]),
        ),
        the_ExceptionName2 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType1 = new OUString(new Uint8Array([118, 111, 105, 100, 0])),
        sMethodName1 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 99, 111, 110, 116, 97, 105,
            110, 101, 114, 46, 88, 73, 110, 100, 101, 120, 67, 111, 110, 116, 97, 105, 110, 101,
            114, 58, 58, 114, 101, 109, 111, 118, 101, 66, 121, 73, 110, 100, 101, 120, 0,
          ]),
        );
      try {
        const aParameters: typelib_Parameter_Init[] = [
          {
            pParamName: sParamName0.pData,
            eTypeClass: C.LONG,
            pTypeName: sParamType0.pData,
            bIn: true,
            bOut: false,
          },
        ];
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          9,
          false,
          sMethodName1.pData,
          C.VOID,
          sReturnType1.pData,
          1,
          aParameters,
          3,
          [the_ExceptionName0.pData, the_ExceptionName1.pData, the_ExceptionName2.pData],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName1.dispose();
        sReturnType1.dispose();
        the_ExceptionName2.dispose();
        the_ExceptionName1.dispose();
        the_ExceptionName0.dispose();
        sParamType0.dispose();
        sParamName0.dispose();
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
export const XIndexContainer = Object.freeze({
  /** Original generated static_type delegates through UnoType ADL. @param _unused - Ignored pointer. @returns Borrowed Type. */
  static_type(_unused?: unknown): Type {
    void _unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
