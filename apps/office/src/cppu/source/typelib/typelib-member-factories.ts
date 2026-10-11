/** @fileoverview Original typelib.cxx method and attribute factories; complete interface lists are requested without recursively initializing call tables. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_MethodParameter,
  typelib_Parameter_Init,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import {
  assert,
  typelib_typedescription_newEmpty,
  typelib_typedescription_release,
  typelib_typedescriptionreference_new,
} from "./typelib";
import { typelib_typedescription_getByName } from "./typelib-lookup";
import { complete } from "./typelib-complete";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  rtl_ustr_lastIndexOfChar_WithLength,
  rtl_uString_acquire,
  rtl_uString_newFromStr_WithLength,
} from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Original owned exception-reference array factory; zero count yields null, unlike the derived-member array copy. @param count - Original count. @param names - Original borrowed names. @returns Acquired references or original null output. */
function copyExceptions(count: number, names: rtl_uString[] | null): R[] | null {
  if (count === 0) return null;
  const result = new Array<R>(count);
  for (let i = 0; i < count; i++) {
    const ref: [R | null] = [null];
    typelib_typedescriptionreference_new(
      ref,
      C.EXCEPTION,
      (names as rtl_uString[])[i] as rtl_uString,
    );
    result[i] = ref[0] as R;
  }
  return result;
}

/** Original method factory with source-defined name parsing, parameter/exception ownership and early-return behavior. Debug-only OSL guards are not fatal browser assertions. @param result - Inout owned method slot. @param position - Absolute member position. @param oneWay - Original oneway flag. @param name - Original full member name. @param returnClass - Return type class. @param returnName - Return type name. @param count - Parameter count. @param params - Borrowed initialized parameters. @param exceptionCount - Exception count. @param exceptionNames - Borrowed exception names. @returns Nothing. */
export function typelib_typedescription_newInterfaceMethod(
  result: [M | null],
  position: number,
  oneWay: boolean,
  name: rtl_uString,
  returnClass: C,
  returnName: rtl_uString,
  count: number,
  params: typelib_Parameter_Init[] | null,
  exceptionCount: number,
  exceptionNames: rtl_uString[] | null,
): void {
  if (result[0] !== null) {
    typelib_typedescription_release(result[0].aBase.aBase);
    result[0] = null;
  }
  const offset = rtl_ustr_lastIndexOfChar_WithLength(name.buffer, name.length, 58);
  if (offset <= 0 || name.buffer[offset - 1] !== 58) return;
  const interfaceName = new OUString(name.buffer, offset - 1);
  const iface: [D | null] = [null];
  typelib_typedescription_getByName(iface, interfaceName.pData);
  if (iface[0] === null || iface[0].eTypeClass !== C.INTERFACE || !complete(iface, false)) {
    interfaceName.dispose();
    return;
  }
  typelib_typedescription_newEmpty(result as unknown as [D | null], C.INTERFACE_METHOD, name);
  const method = result[0] as unknown as M;
  const memberName: [rtl_uString | null] = [method.aBase.pMemberName];
  rtl_uString_newFromStr_WithLength(
    memberName,
    name.buffer.subarray(offset + 1),
    name.length - offset - 1,
  );
  method.aBase.pMemberName = memberName[0];
  method.aBase.nPosition = position;
  method.bOneWay = oneWay;
  const returnRef: [R | null] = [method.pReturnTypeRef];
  typelib_typedescriptionreference_new(returnRef, returnClass, returnName);
  method.pReturnTypeRef = returnRef[0];
  method.nParams = count;
  if (count) {
    method.pParams = new Array<typelib_MethodParameter>(count);
    for (let i = 0; i < count; i++) {
      const source = (params as typelib_Parameter_Init[])[i] as typelib_Parameter_Init;
      const parameter = {} as typelib_MethodParameter;
      method.pParams[i] = parameter;
      parameter.pName = source.pParamName;
      rtl_uString_acquire(parameter.pName);
      parameter.pTypeRef = null as unknown as R;
      const ref: [R | null] = [null];
      typelib_typedescriptionreference_new(ref, source.eTypeClass, source.pTypeName);
      parameter.pTypeRef = ref[0] as R;
      parameter.bIn = source.bIn;
      parameter.bOut = source.bOut;
    }
  }
  method.nExceptions = exceptionCount;
  method.ppExceptions = copyExceptions(exceptionCount, exceptionNames);
  method.pInterface = iface[0] as unknown as I;
  method.pBaseRef = null;
  method.nIndex = position - (method.pInterface.nAllMembers - method.pInterface.nMembers);
  assert(
    method.aBase.aBase.pWeakRef === null,
    "reinterpret_cast<typelib_TypeDescription *>(*ppRet)->pWeakRef == nullptr",
  );
  interfaceName.dispose();
}

/** Original short attribute factory delegates with no getter/setter exception arrays. @param result - Inout owned attribute. @param position - Absolute position. @param name - Full member name. @param typeClass - Attribute type class. @param typeName - Attribute type name. @param readOnly - Original readonly flag. @returns Nothing. */
export function typelib_typedescription_newInterfaceAttribute(
  result: [A | null],
  position: number,
  name: rtl_uString,
  typeClass: C,
  typeName: rtl_uString,
  readOnly: boolean,
): void {
  typelib_typedescription_newExtendedInterfaceAttribute(
    result,
    position,
    name,
    typeClass,
    typeName,
    readOnly,
    0,
    null,
    0,
    null,
  );
}

/** Original extended attribute factory retains separate getter/setter exception ownership and source-defined early returns. @param result - Inout owned attribute. @param position - Absolute position. @param name - Full member name. @param typeClass - Attribute type class. @param typeName - Attribute type name. @param readOnly - Original readonly flag. @param getCount - Getter exception count. @param getNames - Getter exception names. @param setCount - Setter exception count. @param setNames - Setter exception names. @returns Nothing. */
export function typelib_typedescription_newExtendedInterfaceAttribute(
  result: [A | null],
  position: number,
  name: rtl_uString,
  typeClass: C,
  typeName: rtl_uString,
  readOnly: boolean,
  getCount: number,
  getNames: rtl_uString[] | null,
  setCount: number,
  setNames: rtl_uString[] | null,
): void {
  if (result[0] !== null) {
    typelib_typedescription_release(result[0].aBase.aBase);
    result[0] = null;
  }
  const offset = rtl_ustr_lastIndexOfChar_WithLength(name.buffer, name.length, 58);
  if (offset <= 0 || name.buffer[offset - 1] !== 58) return;
  const interfaceName = new OUString(name.buffer, offset - 1);
  const iface: [D | null] = [null];
  typelib_typedescription_getByName(iface, interfaceName.pData);
  if (iface[0] === null || iface[0].eTypeClass !== C.INTERFACE || !complete(iface, false)) {
    interfaceName.dispose();
    return;
  }
  typelib_typedescription_newEmpty(result as unknown as [D | null], C.INTERFACE_ATTRIBUTE, name);
  const attr = result[0] as unknown as A;
  const memberName: [rtl_uString | null] = [attr.aBase.pMemberName];
  rtl_uString_newFromStr_WithLength(
    memberName,
    name.buffer.subarray(offset + 1),
    name.length - offset - 1,
  );
  attr.aBase.pMemberName = memberName[0];
  attr.aBase.nPosition = position;
  const ref: [R | null] = [attr.pAttributeTypeRef];
  typelib_typedescriptionreference_new(ref, typeClass, typeName);
  attr.pAttributeTypeRef = ref[0];
  attr.bReadOnly = readOnly;
  attr.pInterface = iface[0] as unknown as I;
  attr.pBaseRef = null;
  attr.nIndex = position - (attr.pInterface.nAllMembers - attr.pInterface.nMembers);
  attr.nGetExceptions = getCount;
  attr.ppGetExceptions = copyExceptions(getCount, getNames);
  attr.nSetExceptions = setCount;
  attr.ppSetExceptions = copyExceptions(setCount, setNames);
  assert(
    attr.aBase.aBase.pWeakRef === null,
    "reinterpret_cast<typelib_TypeDescription *>(*ppRet)->pWeakRef == nullptr",
  );
  interfaceName.dispose();
}
