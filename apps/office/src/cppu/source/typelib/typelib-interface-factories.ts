/** @fileoverview Original typelib.cxx single/multiple-inheritance interface factories and BaseList; shared pointer-array views adapt the native interior ppMembers pointer. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import {
  referenceViewOf,
  typelib_typedescription_newEmpty,
  typelib_typedescription_release,
  typelib_typedescriptionreference_acquire,
  typelib_typedescriptionreference_new,
  typelib_typedescriptionreference_getDescription,
} from "./typelib";
import { complete } from "./typelib-complete";
import { adjustAlignment, typelib_typedescription_getAlignedUnoSize } from "./typelib-lookup";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Original BaseList entry. */
interface Entry {
  /** Original accumulated inherited offset. */
  readonly memberOffset: number;
  /** Original direct-base index. */
  readonly directBaseIndex: number;
  /** Original offset in that direct base's complete member array. */
  readonly directBaseMemberOffset: number;
  /** Original borrowed unique base. */
  readonly base: Readonly<I>;
}
/** Original insertion equivalence using the actual full-length OUString comparison, with original owned set values. Ordered iteration is unused by BaseList. @param set - Original owned set values. @param desc - Borrowed interface. @returns Whether the name was newly inserted. */
function insert(set: OUString[], desc: Readonly<I>): boolean {
  const name = OUString.unacquired([desc.aBase.pTypeName]);
  if (
    set.some(
      /** Uses the original full-length comparator for set equivalence. @param value - Owned stored name. @returns Original name equality. */
      (value) => value.compareTo(name) === 0,
    )
  )
    return false;
  set.push(new OUString(name));
  return true;
}
/** Original base-first depth traversal with global and per-direct-base uniqueness. */
export class BaseList {
  private readonly list: Entry[] = [];
  private members = 0;
  /** Original constructor owns each temporary name set for its actual scope. @param desc - New interface with acquired direct bases. @returns Original inherited member order. */
  constructor(desc: Readonly<I>) {
    const allSet: OUString[] = [];
    for (let i = 0; i < desc.nBaseTypes; i++) {
      const directBaseSet: OUString[] = [];
      this.calculate(allSet, i, directBaseSet, [0], (desc.ppBaseTypes as I[])[i] as I);
      for (const name of directBaseSet) name.dispose();
    }
    for (const name of allSet) name.dispose();
  }
  /** Original borrowed traversal result. @returns Original list. */
  getList(): readonly Entry[] {
    return this.list;
  }
  /** Original accumulated inherited member count. @returns Count. */
  getBaseMembers(): number {
    return this.members;
  }
  /** Original recursive global/per-direct-base insertion and offset accumulation. @param allSet - Global owned names. @param directBaseIndex - Direct base index. @param directBaseSet - Per-base owned names. @param directBaseMembers - Shared original accumulated counter. @param desc - Borrowed base. @returns Nothing. */
  private calculate(
    allSet: OUString[],
    directBaseIndex: number,
    directBaseSet: OUString[],
    directBaseMembers: [number],
    desc: Readonly<I>,
  ): void {
    for (let i = 0; i < desc.nBaseTypes; i++)
      this.calculate(
        allSet,
        directBaseIndex,
        directBaseSet,
        directBaseMembers,
        (desc.ppBaseTypes as I[])[i] as I,
      );
    if (insert(allSet, desc)) {
      this.list.push({
        memberOffset: this.members,
        directBaseIndex,
        directBaseMemberOffset: directBaseMembers[0],
        base: desc,
      });
      this.members += desc.nMembers;
    }
    if (insert(directBaseSet, desc)) directBaseMembers[0] += desc.nMembers;
  }
}
/** Adapts the original interior pointer over fixed-size native member storage; all in-bounds reads/writes share the same array. @param all - Original complete member array. @param offset - Original pointer offset. @param count - Own member count. @returns Same array at zero offset or a live interior view. */
function memberView(all: R[], offset: number, count: number): R[] {
  if (offset === 0) return all;
  const view = new Array<R>(count);
  for (let i = 0; i < count; i++)
    Object.defineProperty(view, i, {
      enumerable: true,
      /** Reads original shared pointer storage. @returns Member reference. */
      get(): R {
        return all[offset + i] as R;
      },
      /** Writes original shared pointer storage. @param value - New reference. @returns Nothing. */
      set(value: R): void {
        all[offset + i] = value;
      },
    });
  return view;
}
/** Original multiple-inheritance interface factory, including late weak-prefix initialization and failure retention. Deprecated Uik arguments are unused upstream. @param result - Inout owned interface slot. @param name - Original borrowed name. @param _data1 - Unused Uik. @param _data2 - Unused Uik. @param _data3 - Unused Uik. @param _data4 - Unused Uik. @param _data5 - Unused Uik. @param baseCount - Direct-base count. @param bases - Borrowed direct-base references. @param count - Own member count. @param members - Borrowed own references. @returns Nothing. */
export function typelib_typedescription_newMIInterface(
  result: [I | null],
  name: rtl_uString,
  _data1: number,
  _data2: number,
  _data3: number,
  _data4: number,
  _data5: number,
  baseCount: number,
  bases: R[] | null,
  count: number,
  members: R[] | null,
): void {
  if (result[0] !== null) {
    typelib_typedescription_release(result[0].aBase);
    result[0] = null;
  }
  const slot: [D | null] = [null];
  typelib_typedescription_newEmpty(slot, C.INTERFACE, name);
  const iface = slot[0] as unknown as I;
  iface.nBaseTypes = baseCount;
  iface.ppBaseTypes = new Array<I>(baseCount);
  for (let i = 0; i < baseCount; i++) {
    const base: [D | null] = [null];
    typelib_typedescriptionreference_getDescription(base, (bases as R[])[i] as R);
    iface.ppBaseTypes[i] = base[0] as unknown as I;
    if (base[0] === null) return;
    const ready = complete(base, false);
    iface.ppBaseTypes[i] = base[0] as unknown as I;
    if (!ready) return;
  }
  if (baseCount > 0) iface.pBaseTypeDescription = iface.ppBaseTypes[0] as I;
  iface.aUik = { m_Data1: 0, m_Data2: 0, m_Data3: 0, m_Data4: 0, m_Data5: 0 };
  const list = new BaseList(iface);
  iface.nAllMembers = count + list.getBaseMembers();
  iface.nMembers = count;
  if (iface.nAllMembers !== 0) {
    iface.ppAllMembers = new Array<R>(iface.nAllMembers);
    let n = 0;
    for (const entry of list.getList()) {
      const direct = iface.ppBaseTypes[entry.directBaseIndex] as I;
      for (let j = 0; j < entry.base.nMembers; j++) {
        const member = (direct.ppAllMembers as R[])[entry.directBaseMemberOffset + j] as R;
        const expression = new StringConcat(
          new StringConcat(
            new StringConcat(
              new StringConcat(
                new StringConcat(
                  new StringConcat(
                    OUString.unacquired([member.pTypeName]),
                    new Uint8Array([58, 64, 0]),
                  ),
                  OUString.number(entry.directBaseIndex),
                ),
                new Uint8Array([44, 0]),
              ),
              OUString.number(entry.memberOffset + j),
            ),
            new Uint8Array([58, 0]),
          ),
          OUString.unacquired([iface.aBase.pTypeName]),
        );
        const derivedName = new OUString(expression),
          ref: [R | null] = [null];
        typelib_typedescriptionreference_new(ref, member.eTypeClass, derivedName.pData);
        iface.ppAllMembers[n++] = ref[0] as R;
        derivedName.dispose();
      }
    }
    if (count !== 0) iface.ppMembers = memberView(iface.ppAllMembers, list.getBaseMembers(), count);
    for (let i = 0; i < count; i++) {
      const member = (members as R[])[i] as R;
      typelib_typedescriptionreference_acquire(member);
      iface.ppAllMembers[n++] = member;
    }
  }
  const desc = iface.aBase;
  desc.pWeakRef = referenceViewOf(desc);
  const alignment: [number] = [desc.nAlignment];
  desc.nSize = typelib_typedescription_getAlignedUnoSize(desc, 0, alignment);
  desc.nAlignment = adjustAlignment(alignment[0]);
  desc.bComplete = false;
  result[0] = iface;
}
/** Original single-base wrapper delegates with all deprecated Uik arguments zero. @param result - Inout interface slot. @param name - Borrowed name. @param _data1 - Unused Uik. @param _data2 - Unused Uik. @param _data3 - Unused Uik. @param _data4 - Unused Uik. @param _data5 - Unused Uik. @param base - Borrowed base or null. @param count - Own member count. @param members - Borrowed own references. @returns Nothing. */
export function typelib_typedescription_newInterface(
  result: [I | null],
  name: rtl_uString,
  _data1: number,
  _data2: number,
  _data3: number,
  _data4: number,
  _data5: number,
  base: R | null,
  count: number,
  members: R[] | null,
): void {
  typelib_typedescription_newMIInterface(
    result,
    name,
    0,
    0,
    0,
    0,
    0,
    base === null ? 0 : 1,
    [base] as R[],
    count,
    members,
  );
}
