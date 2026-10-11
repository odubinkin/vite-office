/** @fileoverview Complete original constr.hxx default construction uses real shared owners and addressed caller storage; compound members keep source offsets and base-first/reverse-member order without a binary JS ABI. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_EnumTypeDescription as E,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_new } from "../../../sal/inc/rtl/ustring.h";
import type { uno_Any } from "../../inc/uno/any2";
import { _getVoidType, CONSTRUCT_EMPTY_ANY, createEmptySequence } from "./prim";
import { defaultConstructStruct, uno_type_constructData } from "./data";
/** Original caller storage: compound source member offsets denote existing field addresses; no field allocation/default occurs during address adaptation. @param pMem - Original addressed compound storage. @param pTypeDescr - Real compound description. @returns Nothing. */
export function _defaultConstructStruct(pMem: unknown, pTypeDescr: P): void {
  if (pTypeDescr.pBaseTypeDescription)
    defaultConstructStruct(pMem, pTypeDescr.pBaseTypeDescription);
  const ppTypeRefs = pTypeDescr.ppTypeRefs as R[],
    pMemberOffsets = pTypeDescr.pMemberOffsets as Int32Array;
  let nDescr = pTypeDescr.nMembers;
  while (nDescr--)
    uno_type_constructData(
      (pMem as ReadonlyMap<number, unknown>).get(pMemberOffsets[nDescr] as number),
      ppTypeRefs[nDescr] as R,
    );
}
/** Original complete default construction; scalar/pointer addresses use caller-owned cells, Any/compound addresses keep the original record storage. Only source-initialized logical values are exposed. @param pMem - Actual caller field address. @param pType - Original borrowed reference. @param pTypeDescr - Optional actual borrowed description. @returns Nothing. */
export function _defaultConstructData(pMem: unknown, pType: R, pTypeDescr: D | null): void {
  switch (pType.eTypeClass) {
    case C.CHAR:
    case C.BYTE:
    case C.SHORT:
    case C.UNSIGNED_SHORT:
    case C.LONG:
    case C.UNSIGNED_LONG:
    case C.FLOAT:
    case C.DOUBLE:
      (pMem as [number])[0] = 0;
      break;
    case C.BOOLEAN:
      (pMem as [boolean])[0] = false;
      break;
    case C.HYPER:
    case C.UNSIGNED_HYPER:
      (pMem as [bigint])[0] = 0n;
      break;
    case C.STRING: {
      const slot = pMem as [rtl_uString | null];
      slot[0] = null;
      rtl_uString_new(slot);
      break;
    }
    case C.TYPE:
      (pMem as [R])[0] = _getVoidType();
      break;
    case C.ANY:
      CONSTRUCT_EMPTY_ANY(pMem as uno_Any);
      break;
    case C.ENUM:
      if (pTypeDescr) (pMem as [number])[0] = (pTypeDescr as unknown as E).nDefaultEnumValue;
      else {
        const slot: [D | null] = [pTypeDescr];
        TYPELIB_DANGER_GET(slot, pType);
        (pMem as [number])[0] = (slot[0] as unknown as E).nDefaultEnumValue;
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      break;
    case C.STRUCT:
    case C.EXCEPTION:
      if (pTypeDescr) _defaultConstructStruct(pMem, pTypeDescr as unknown as P);
      else {
        const slot: [D | null] = [pTypeDescr];
        TYPELIB_DANGER_GET(slot, pType);
        _defaultConstructStruct(pMem, slot[0] as unknown as P);
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      break;
    case C.SEQUENCE:
      (pMem as [unknown])[0] = createEmptySequence();
      break;
    case C.INTERFACE:
      (pMem as [unknown])[0] = null;
      break;
    default:
      break; // Original normal-build OSL_ASSERT(false) has no runtime effect.
  }
}
