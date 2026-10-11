/** @fileoverview Original typelib.cxx interface call tables and two-stage description completion, sharing the actual registry and acquired cache. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceAttributeTypeDescription as A,
  typelib_IndirectTypeDescription as Indirect,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import {
  Init,
  typelib_typedescription_acquire,
  typelib_typedescription_release,
  typelib_typedescription_register,
  typelib_typedescriptionreference_getDescription,
} from "./typelib";

/** Original reverse attribute lookup followed by member/function table construction; attribute resolution precedes even the already-complete guard. @param desc - Original interface allocation. @returns Nothing. */
export function typelib_typedescription_initTables(desc: D): void {
  const iface = desc as unknown as I;
  const readWrite = new Array<boolean>(iface.nAllMembers);
  for (let i = iface.nAllMembers; i--;) {
    readWrite[i] = false;
    const ref = (iface.ppAllMembers as R[])[i] as R;
    if (ref.eTypeClass === C.INTERFACE_ATTRIBUTE) {
      const member: [D | null] = [null];
      TYPELIB_DANGER_GET(member, ref);
      if (member[0] !== null) {
        readWrite[i] = !(member[0] as unknown as A).bReadOnly;
        TYPELIB_DANGER_RELEASE(member[0]);
      }
    }
  }
  if (desc.bComplete) return;
  iface.pMapMemberIndexToFunctionIndex = new Int32Array(iface.nAllMembers);
  let additional = 0;
  for (let i = 0; i < iface.nAllMembers; i++) {
    iface.pMapMemberIndexToFunctionIndex[i] = i + additional;
    if (readWrite[i]) additional++;
  }
  iface.pMapFunctionIndexToMemberIndex = new Int32Array(iface.nAllMembers + additional);
  additional = 0;
  for (let i = 0; i < iface.nAllMembers; i++) {
    iface.pMapFunctionIndexToMemberIndex[i + additional] = i;
    if (readWrite[i]) iface.pMapFunctionIndexToMemberIndex[i + ++additional] = i;
  }
  iface.nMapFunctionIndexToMemberIndex = iface.nAllMembers + additional;
  desc.bComplete = true;
}

/** Original internal completion; member construction requests lists without recursively initializing call tables. Debug-only OSL assertions and native mutex scheduling are not browser runtime guards. @param result - Inout owned description pointer. @param initTables - Whether to initialize interface call tables. @returns Original completion result. */
export function complete(result: [D | null], initTables: boolean): boolean {
  const old = result[0] as D;
  if (old.bComplete) return true;
  if (old.eTypeClass === C.INTERFACE && (old as unknown as I).ppAllMembers !== null) {
    if (initTables) typelib_typedescription_initTables(old);
    return true;
  }
  const incoming: [D | null] = [null];
  const init = Init();
  init.callChain(incoming, old.pTypeName);
  if (incoming[0] === null) return false;
  if (incoming[0].eTypeClass === C.TYPEDEF) {
    typelib_typedescriptionreference_getDescription(
      incoming,
      (incoming[0] as unknown as Indirect).pType as R,
    );
    if (incoming[0] === null) return false;
  }
  let desc = incoming[0] as D;
  desc.bOnDemand = true;
  if (desc.eTypeClass === C.INTERFACE && !desc.bComplete && initTables) {
    typelib_typedescription_initTables(desc);
    desc.bComplete = true;
  }
  typelib_typedescription_register(incoming);
  desc = incoming[0] as D;
  if (init.maCache.length >= 256) {
    typelib_typedescription_release(init.maCache[0] as D);
    init.maCache.shift();
  }
  typelib_typedescription_acquire(desc);
  init.maCache.push(desc);
  typelib_typedescription_release(old);
  result[0] = desc;
  return true;
}

/** Original public completion wrapper, always requesting interface call tables. @param result - Inout owned description pointer. @returns Original completion result. */
export function typelib_typedescription_complete(result: [D | null]): boolean {
  return complete(result, true);
}
