/** @fileoverview Complete original XWeak.idl contract and pinned cppumaker comprehensive type owner; shared C typelib/Type/string owners retain original registration, cache and method initialization order. Physical ABI/thread synchronization is not claimed. */
import type { XInterface } from "./XInterface";
import { Type } from "./Type";
import type { Reference } from "./Reference";
import { cppu_detail_getUnoType as runtimeExceptionType } from "./RuntimeException";
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

/** Original generated abstract interface declaration; no virtual implementation or alternate type/provider. */
export interface XWeak extends XInterface {
  /** Original owned adapter result. @returns Actual weak adapter reference. */
  queryAdapter(): Reference;
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
        99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 88, 87, 101,
        97, 107, 0,
      ]),
    );
    try {
      const pTD: [I | null] = [null],
        aSuperTypes = [UnoType.get(["Reference", "XInterface"]).getTypeLibType() as R];
      const sMethodName0 = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 88, 87,
            101, 97, 107, 58, 58, 113, 117, 101, 114, 121, 65, 100, 97, 112, 116, 101, 114, 0,
          ]),
        ),
        member0: [R | null] = [null];
      try {
        typelib_typedescriptionreference_new(member0, C.INTERFACE_METHOD, sMethodName0.pData);
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
          1,
          [member0[0] as R],
        );
        typelib_typedescription_register(pTD as unknown as [D | null]);
        typelib_typedescriptionreference_release(member0[0] as R);
        typelib_typedescription_release((pTD[0] as I).aBase);
        interfaceType = new Type(C.INTERFACE as unknown as TypeClass, sTypeName);
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
        sReturnType = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 88, 65,
            100, 97, 112, 116, 101, 114, 0,
          ]),
        ),
        sMethodName = new OUString(
          new Uint8Array([
            99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 88, 87,
            101, 97, 107, 58, 58, 113, 117, 101, 114, 121, 65, 100, 97, 112, 116, 101, 114, 0,
          ]),
        );
      try {
        typelib_typedescription_newInterfaceMethod(
          pMethod,
          3,
          false,
          sMethodName.pData,
          C.INTERFACE,
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
export const XWeak = Object.freeze({
  /** Original static_type ignores its native void pointer and delegates through real UnoType ADL. @param _unused - Original ignored pointer. @returns Borrowed original type. */
  static_type(_unused?: unknown): Type {
    void _unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
