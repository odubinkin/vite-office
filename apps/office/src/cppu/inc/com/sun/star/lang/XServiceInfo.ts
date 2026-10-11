/** @fileoverview Complete original XServiceInfo.idl contract and pinned cppumaker comprehensive type owner; shared C typelib/Type/string owners retain original registration, cache and method initialization order. Physical ABI/thread synchronization is not claimed. */
import type { XInterface } from "../uno/XInterface";
import { Type } from "../uno/Type";
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
import type { Sequence } from "../uno/Sequence";
import type { rtl_uStringSlot } from "../../../../../../sal/inc/rtl/ustring.h";

/** Original generated abstract interface declaration; no virtual implementation or alternate type/provider. */
export interface XServiceInfo extends XInterface {
  /** Original owned implementation name. @returns Actual unique name. */
  getImplementationName(): OUString;
  /** Original case-sensitive service predicate. @param ServiceName - Borrowed name. @returns Actual implementation result. */
  supportsService(ServiceName: OUString): boolean;
  /** Original owned sequence of actual addressed OUString fields. @returns Actual service names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot>;
}
/** Original StaticWithInit leaked Type owner; native JS initialization is synchronous. */
let interfaceType: Type | null = null;
/** Original ADL method initialization gate, set before RuntimeException/member initialization to retain reentrant source order. */
let bInitStarted = false;

/** Original generated ADL getter and StaticWithInit body over actual shared factories. @returns Same borrowed leaked Type owner. */
export function cppu_detail_getUnoType(): Type {
  if (interfaceType === null) {
    const sTypeName = new OUString(
      new Uint8Array([
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 88, 83,
        101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 0,
      ]),
    );
    try {
      const pTD: [I | null] = [null],
        aSuperTypes = [UnoType.get(["Reference", "XInterface"]).getTypeLibType() as R];
      const sMethodName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 88,
            83, 101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 58, 58, 103, 101, 116, 73, 109, 112,
            108, 101, 109, 101, 110, 116, 97, 116, 105, 111, 110, 78, 97, 109, 101, 0,
          ]),
        ),
        member0: [R | null] = [null];
      try {
        typelib_typedescriptionreference_new(member0, C.INTERFACE_METHOD, sMethodName0.pData);
        const sMethodName1 = new OUString(
            new Uint8Array([
              99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 88,
              83, 101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 58, 58, 115, 117, 112, 112, 111,
              114, 116, 115, 83, 101, 114, 118, 105, 99, 101, 0,
            ]),
          ),
          member1: [R | null] = [null];
        try {
          typelib_typedescriptionreference_new(member1, C.INTERFACE_METHOD, sMethodName1.pData);
          const sMethodName2 = new OUString(
              new Uint8Array([
                99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46,
                88, 83, 101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 58, 58, 103, 101, 116, 83,
                117, 112, 112, 111, 114, 116, 101, 100, 83, 101, 114, 118, 105, 99, 101, 78, 97,
                109, 101, 115, 0,
              ]),
            ),
            member2: [R | null] = [null];
          try {
            typelib_typedescriptionreference_new(member2, C.INTERFACE_METHOD, sMethodName2.pData);
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
              3,
              [member0[0] as R, member1[0] as R, member2[0] as R],
            );
            typelib_typedescription_register(pTD as unknown as [D | null]);
            typelib_typedescriptionreference_release(member0[0] as R);
            typelib_typedescriptionreference_release(member1[0] as R);
            typelib_typedescriptionreference_release(member2[0] as R);
            typelib_typedescription_release((pTD[0] as I).aBase);
            interfaceType = new Type(C.INTERFACE as unknown as TypeClass, sTypeName);
          } finally {
            sMethodName2.dispose();
          }
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
    // Original mutex/barrier protects this synchronous stage in native threads; no browser thread emulator.
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
        sReturnType = new OUString(new Uint8Array([115, 116, 114, 105, 110, 103, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 88,
            83, 101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 58, 58, 103, 101, 116, 73, 109, 112,
            108, 101, 109, 101, 110, 116, 97, 116, 105, 111, 110, 78, 97, 109, 101, 0,
          ]),
        );
      try {
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          3,
          false,
          sMethodName.pData,
          C.STRING,
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
      const sParamName0 = new OUString(
          new Uint8Array([83, 101, 114, 118, 105, 99, 101, 78, 97, 109, 101, 0]),
        ),
        sParamType0 = new OUString(new Uint8Array([115, 116, 114, 105, 110, 103, 0]));
      const the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType = new OUString(new Uint8Array([98, 111, 111, 108, 101, 97, 110, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 88,
            83, 101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 58, 58, 115, 117, 112, 112, 111,
            114, 116, 115, 83, 101, 114, 118, 105, 99, 101, 0,
          ]),
        );
      try {
        const aParameters: typelib_Parameter_Init[] = [
          {
            pParamName: sParamName0.pData,
            eTypeClass: C.STRING,
            pTypeName: sParamType0.pData,
            bIn: true,
            bOut: false,
          },
        ];
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          4,
          false,
          sMethodName.pData,
          C.BOOLEAN,
          sReturnType.pData,
          1,
          aParameters,
          1,
          [the_ExceptionName0.pData],
        );
        typelib_typedescription_register(pMethod as unknown as [D | null]);
      } finally {
        sMethodName.dispose();
        sReturnType.dispose();
        the_ExceptionName0.dispose();
        sParamType0.dispose();
        sParamName0.dispose();
      }
    }
    {
      const the_ExceptionName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 82, 117,
            110, 116, 105, 109, 101, 69, 120, 99, 101, 112, 116, 105, 111, 110, 0,
          ]),
        ),
        sReturnType = new OUString(new Uint8Array([91, 93, 115, 116, 114, 105, 110, 103, 0])),
        sMethodName = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 108, 97, 110, 103, 46, 88,
            83, 101, 114, 118, 105, 99, 101, 73, 110, 102, 111, 58, 58, 103, 101, 116, 83, 117, 112,
            112, 111, 114, 116, 101, 100, 83, 101, 114, 118, 105, 99, 101, 78, 97, 109, 101, 115, 0,
          ]),
        );
      try {
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          5,
          false,
          sMethodName.pData,
          C.SEQUENCE,
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

/** Original deprecated generated Reference pointer overload; the unused pointer expresses its declared C++ type only. @param _reference - Original unused declared Reference pointer. @returns Borrowed original type. */
export function getCppuType(_reference?: Reference | null): Type {
  void _reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated abstract class static API, separate from its structural method declaration. */
export const XServiceInfo = Object.freeze({
  /** Original static_type ignores its native void pointer and delegates through real UnoType ADL. @param _unused - Original ignored pointer. @returns Borrowed original type. */
  static_type(_unused?: unknown): Type {
    void _unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
