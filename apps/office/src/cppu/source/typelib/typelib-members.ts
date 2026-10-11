/** @fileoverview Original internal derived-interface member construction from typelib.cxx; split to honor the authored file-size limit, without adding a public C API. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_MethodParameter,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import {
  typelib_typedescription_newEmpty,
  typelib_typedescriptionreference_acquire,
} from "./typelib";
import { rtl_uString_acquire } from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Copies the original owned exception-pointer array, including an allocated empty array for zero count. @param count - Original signed count. @param source - Borrowed original exception array. @returns New acquired array. */
function copyExceptions(count: number, source: R[] | null): R[] {
  const result: R[] = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = (source as R[])[i] as R;
    typelib_typedescriptionreference_acquire(result[i] as R);
  }
  return result;
}

/** Constructs the complete original inherited method/attribute record. The base description is borrowed; interface/base-reference ownership is transferred by the original caller on success. This internal module export is not a public C header API. @param result - Inout description slot. @param name - Original borrowed const OUString reference. @param baseRef - Owned base reference to transfer. @param base - Borrowed original base member. @param iface - Owned original interface to transfer. @param index - Original base/interface member index. @param position - Original inherited position. @returns Whether the original member kind is supported and all required inputs exist. */
export function createDerivedInterfaceMemberDescription(
  result: [D | null],
  name: OUStringConstReference,
  baseRef: R | null,
  base: Readonly<D> | null,
  iface: D | null,
  index: number,
  position: number,
): boolean {
  if (baseRef === null || base === null || iface === null) return false;
  switch (base.eTypeClass) {
    case C.INTERFACE_METHOD: {
      typelib_typedescription_newEmpty(result, C.INTERFACE_METHOD, name.pData as rtl_uString);
      const baseMethod = base as unknown as Readonly<M>,
        newMethod = result[0] as unknown as M;
      newMethod.aBase.nPosition = position;
      newMethod.aBase.pMemberName = baseMethod.aBase.pMemberName;
      rtl_uString_acquire(newMethod.aBase.pMemberName as rtl_uString);
      newMethod.pReturnTypeRef = baseMethod.pReturnTypeRef;
      typelib_typedescriptionreference_acquire(newMethod.pReturnTypeRef as R);
      newMethod.nParams = baseMethod.nParams;
      newMethod.pParams = new Array<typelib_MethodParameter>(newMethod.nParams);
      for (let i = 0; i < newMethod.nParams; i++) {
        const source = (baseMethod.pParams as typelib_MethodParameter[])[
          i
        ] as typelib_MethodParameter;
        const parameter = {} as typelib_MethodParameter;
        newMethod.pParams[i] = parameter;
        parameter.pName = source.pName;
        rtl_uString_acquire(parameter.pName);
        parameter.pTypeRef = source.pTypeRef;
        typelib_typedescriptionreference_acquire(parameter.pTypeRef);
        parameter.bIn = source.bIn;
        parameter.bOut = source.bOut;
      }
      newMethod.nExceptions = baseMethod.nExceptions;
      newMethod.ppExceptions = copyExceptions(baseMethod.nExceptions, baseMethod.ppExceptions);
      newMethod.bOneWay = baseMethod.bOneWay;
      newMethod.pInterface = iface as unknown as I;
      newMethod.pBaseRef = baseRef;
      newMethod.nIndex = index;
      return true;
    }
    case C.INTERFACE_ATTRIBUTE: {
      typelib_typedescription_newEmpty(result, C.INTERFACE_ATTRIBUTE, name.pData as rtl_uString);
      const baseAttribute = base as unknown as Readonly<A>,
        newAttribute = result[0] as unknown as A;
      newAttribute.aBase.nPosition = position;
      newAttribute.aBase.pMemberName = baseAttribute.aBase.pMemberName;
      rtl_uString_acquire(newAttribute.aBase.pMemberName as rtl_uString);
      newAttribute.bReadOnly = baseAttribute.bReadOnly;
      newAttribute.pAttributeTypeRef = baseAttribute.pAttributeTypeRef;
      typelib_typedescriptionreference_acquire(newAttribute.pAttributeTypeRef as R);
      newAttribute.pInterface = iface as unknown as I;
      newAttribute.pBaseRef = baseRef;
      newAttribute.nIndex = index;
      newAttribute.nGetExceptions = baseAttribute.nGetExceptions;
      newAttribute.ppGetExceptions = copyExceptions(
        baseAttribute.nGetExceptions,
        baseAttribute.ppGetExceptions,
      );
      newAttribute.nSetExceptions = baseAttribute.nSetExceptions;
      newAttribute.ppSetExceptions = copyExceptions(
        baseAttribute.nSetExceptions,
        baseAttribute.ppSetExceptions,
      );
      return true;
    }
    default:
      break;
  }
  return false;
}
