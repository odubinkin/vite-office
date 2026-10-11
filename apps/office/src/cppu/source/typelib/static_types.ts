/** @fileoverview Original static_types.cxx static reference cells, UNO bootstrap and type initializers; synchronous realm-local ownership shares actual CPPU/SAL owners, without claiming native mutex/thread scheduling. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
  typelib_InterfaceMethodTypeDescription as M,
  typelib_CompoundTypeDescription as P,
  typelib_StructTypeDescription as S,
  typelib_EnumTypeDescription as E,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import {
  assert,
  referenceViewOf,
  typelib_typedescription_newEmpty,
  typelib_typedescription_new,
  typelib_typedescription_register,
  typelib_typedescription_acquire,
  typelib_typedescription_release,
  typelib_typedescriptionreference_getByName,
  typelib_typedescriptionreference_getDescription,
  typelib_typedescriptionreference_new,
  typelib_typedescriptionreference_acquire,
  typelib_typedescriptionreference_release,
} from "./typelib";
import { typelib_typedescription_getAlignedUnoSize } from "./typelib-lookup";
import { typelib_typedescription_newInterface } from "./typelib-interface-factories";
import { typelib_typedescription_newInterfaceMethod } from "./typelib-member-factories";
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

const nMaxAlignment = 8;
/** Original selected LP64 alignment clamp, distinct from the other original translation unit's private helper. @param requested - Native requested alignment. @returns Original capped alignment. */
function adjustAlignment(requested: number): number {
  return requested > nMaxAlignment ? nMaxAlignment : requested;
}
/** Original static-owner size/offset calculation. @param oldSize - Prior size. @param elementSize - Element bytes. @param neededAlignment - Required alignment. @returns Original end offset. */
function newAlignedSize(oldSize: number, elementSize: number, neededAlignment: number): number {
  const a = adjustAlignment(neededAlignment);
  return Math.trunc((oldSize + a - 1) / a) * a + elementSize;
}
/** Original nonweak initialized-name lookup; uninitialized acquired references are retained upstream. @param name - Original borrowed name. @returns Acquired initialized reference or null. */
function igetTypeByName(name: rtl_uString): R | null {
  const ref: [R | null] = [null];
  typelib_typedescriptionreference_getByName(ref, name);
  return ref[0] !== null && ref[0].pType !== null && ref[0].pType.pWeakRef !== null ? ref[0] : null;
}
const literals = new Map<string, OUStringLiteral>();
/** Adapts original constexpr _ustr template data through the actual literal owner. @param text - Source literal. @returns Original static value owner. */
function literal(text: string): OUString {
  let value = literals.get(text);
  if (value === undefined) {
    const units = new Uint16Array(text.length + 1);
    for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
    value = new OUStringLiteral(units);
    literals.set(text, value);
  }
  return new OUString(value);
}
const s_aTypes: [R | null][] = [];
for (let i = 0; i < 23; i++) s_aTypes.push([null]);
const s_aTypeNames = [
  "void",
  "char",
  "boolean",
  "byte",
  "short",
  "unsigned short",
  "long",
  "unsigned long",
  "hyper",
  "unsigned hyper",
  "float",
  "double",
  "string",
  "type",
  "any",
];
/** Original cache cell address and lazy basic/XInterface/exception bootstrap. The repeated mutex-protected guard reduces to the same first guard in the existing synchronous realm model; no native cross-thread state is modeled. @param typeClass - Original supported basic, interface or exception class. @returns Stable original mutable cache-cell view. */
export function typelib_static_type_getByTypeClass(typeClass: C): [R | null] {
  const cell = s_aTypes[typeClass] as [R | null];
  if (cell[0] === null) {
    switch (typeClass) {
      case C.EXCEPTION:
      case C.INTERFACE: {
        for (const [c, n] of [
          [C.TYPE, "type"],
          [C.ANY, "any"],
          [C.STRING, "string"],
        ] as const) {
          const value = s_aTypes[c] as [R | null];
          if (value[0] === null) {
            const name = literal(n);
            typelib_typedescriptionreference_new(value, c, name.pData);
            (value as [R])[0].nStaticRefCount++;
            name.dispose();
          }
        }
        const ifaceCell = s_aTypes[C.INTERFACE] as [R | null];
        if (ifaceCell[0] === null) {
          const name = literal("com.sun.star.uno.XInterface"),
            method0 = literal("com.sun.star.uno.XInterface::queryInterface"),
            method1 = literal("com.sun.star.uno.XInterface::acquire"),
            method2 = literal("com.sun.star.uno.XInterface::release"),
            members: R[] = [];
          for (const n of [method0, method1, method2]) {
            const member: [R | null] = [null];
            typelib_typedescriptionreference_new(member, C.INTERFACE_METHOD, n.pData);
            members.push(member[0] as R);
          }
          const iface: [I | null] = [null];
          typelib_typedescription_newInterface(iface, name.pData, 0, 0, 0, 0, 0, null, 3, members);
          const reg: [D | null] = [(iface[0] as I).aBase];
          typelib_typedescription_register(reg);
          ifaceCell[0] = (reg[0] as D).pWeakRef;
          typelib_typedescriptionreference_acquire(ifaceCell[0] as R);
          (ifaceCell[0] as R).nStaticRefCount++;
          typelib_typedescription_release(reg[0] as D);
          for (const member of members) typelib_typedescriptionreference_release(member);
          const exceptionCell = s_aTypes[C.EXCEPTION] as [R | null];
          assert(exceptionCell[0] === null, "! s_aTypes[typelib_TypeClass_EXCEPTION]");
          const en = literal("com.sun.star.uno.Exception"),
            sn = literal("string"),
            message = literal("Message"),
            xn = literal("com.sun.star.uno.XInterface"),
            context = literal("Context");
          const exception: [D | null] = [null];
          typelib_typedescription_new(exception, C.EXCEPTION, en.pData, null, 2, [
            { eTypeClass: C.STRING, pTypeName: sn.pData, pMemberName: message.pData },
            { eTypeClass: C.INTERFACE, pTypeName: xn.pData, pMemberName: context.pData },
          ]);
          typelib_typedescription_register(exception);
          exceptionCell[0] = (exception[0] as D).pWeakRef;
          typelib_typedescriptionreference_acquire(exceptionCell[0] as R);
          (exceptionCell[0] as R).nStaticRefCount++;
          const runtime = literal("com.sun.star.uno.RuntimeException");
          typelib_typedescription_new(
            exception,
            C.EXCEPTION,
            runtime.pData,
            exceptionCell[0],
            0,
            null,
          );
          typelib_typedescription_register(exception);
          typelib_typedescription_release(exception[0] as D);
          const pn = literal("aType"),
            tn = literal("type"),
            rn = literal("any"),
            vn = literal("void"),
            method: [M | null] = [null];
          typelib_typedescription_newInterfaceMethod(
            method,
            0,
            false,
            method0.pData,
            C.ANY,
            rn.pData,
            1,
            [
              {
                eTypeClass: C.TYPE,
                pTypeName: tn.pData,
                pParamName: pn.pData,
                bIn: true,
                bOut: false,
              },
            ],
            1,
            [runtime.pData],
          );
          const methodReg: [D | null] = [(method[0] as M).aBase.aBase];
          typelib_typedescription_register(methodReg);
          method[0] = methodReg[0] as unknown as M;
          typelib_typedescription_newInterfaceMethod(
            method,
            1,
            true,
            method1.pData,
            C.VOID,
            vn.pData,
            0,
            null,
            0,
            null,
          );
          methodReg[0] = (method[0] as M).aBase.aBase;
          typelib_typedescription_register(methodReg);
          method[0] = methodReg[0] as unknown as M;
          typelib_typedescription_newInterfaceMethod(
            method,
            2,
            true,
            method2.pData,
            C.VOID,
            vn.pData,
            0,
            null,
            0,
            null,
          );
          methodReg[0] = (method[0] as M).aBase.aBase;
          typelib_typedescription_register(methodReg);
          typelib_typedescription_release(methodReg[0] as D);
          for (const value of [
            name,
            method0,
            method1,
            method2,
            en,
            sn,
            message,
            xn,
            context,
            runtime,
            pn,
            tn,
            rn,
            vn,
          ])
            value.dispose();
        }
        break;
      }
      default: {
        const name = literal(s_aTypeNames[typeClass] as string);
        typelib_typedescriptionreference_new(cell, typeClass, name.pData);
        (cell as [R])[0].nStaticRefCount++;
        name.dispose();
      }
    }
  }
  return cell;
}
/** Original static reference initialization using actual terminated ASCII conversion. @param ref - Static cell. @param typeClass - Type class. @param name - Terminated original name bytes. @returns Nothing. */
export function typelib_static_type_init(
  ref: [R | null],
  typeClass: C,
  name: Uint8Array | null,
): void {
  if (ref[0] === null) {
    const value = OUString.createFromAscii(name);
    typelib_typedescriptionreference_new(ref, typeClass, value.pData);
    assert(ref[0] !== null, '*ppRef && "shouldn\'t be possible"');
    (ref as [R])[0].nStaticRefCount++;
    value.dispose();
  }
}
/** Original registered static sequence initialization with original lazy [] name construction. @param ref - Static cell. @param element - Borrowed element. @returns Nothing. */
export function typelib_static_sequence_type_init(ref: [R | null], element: R): void {
  if (ref[0] !== null) return;
  const name = new OUString(
    new StringConcat(new Uint8Array([91, 93, 0]), OUString.unacquired([element.pTypeName])),
  );
  ref[0] = igetTypeByName(name.pData);
  if (ref[0] === null) {
    const reg: [D | null] = [null];
    typelib_typedescription_new(reg, C.SEQUENCE, name.pData, element, 0, null);
    typelib_typedescription_register(reg);
    ref[0] = referenceViewOf(reg[0] as D);
    assert(ref[0] === (reg[0] as D).pWeakRef, "*ppRef == pReg->pWeakRef");
  }
  ref[0].nStaticRefCount++;
  name.dispose();
}
/** Original common compound/struct initializer. @param ref - Static cell. @param typeClass - Struct or exception. @param nameBytes - Borrowed original ASCII name. @param base - Borrowed base or null. @param count - Member count. @param members - Borrowed member references. @param parameterized - Original optional flags. @returns Nothing. */
function init(
  ref: [R | null],
  typeClass: C,
  nameBytes: Uint8Array | null,
  base: R | null,
  count: number,
  members: R[] | null,
  parameterized: readonly boolean[] | null,
): void {
  assert(
    typeClass === C.STRUCT || typeClass === C.EXCEPTION,
    "eTypeClass == typelib_TypeClass_STRUCT || eTypeClass == typelib_TypeClass_EXCEPTION",
  );
  if (ref[0] !== null) return;
  const name = OUString.createFromAscii(nameBytes);
  ref[0] = igetTypeByName(name.pData);
  if (ref[0] === null) {
    const slot: [D | null] = [null];
    typelib_typedescription_newEmpty(slot, typeClass, name.pData);
    const comp = slot[0] as unknown as P;
    let offset = 0;
    if (base !== null) {
      const b: [D | null] = [null];
      typelib_typedescriptionreference_getDescription(b, base);
      comp.pBaseTypeDescription = b[0] as unknown as P;
      assert(b[0] !== null, "pComp->pBaseTypeDescription");
      offset = b[0].nSize;
      assert(
        newAlignedSize(0, b[0].nSize, b[0].nAlignment) === b[0].nSize,
        "newAlignedSize( 0, pComp->pBaseTypeDescription->aBase.nSize, pComp->pBaseTypeDescription->aBase.nAlignment ) == pComp->pBaseTypeDescription->aBase.nSize",
      );
    }
    if (count !== 0) {
      comp.nMembers = count;
      comp.pMemberOffsets = new Int32Array(count);
      comp.ppTypeRefs = new Array<R>(count);
      if (parameterized !== null)
        (comp as unknown as S).pParameterizedTypes = new Array<boolean>(count);
      for (let i = 0; i < count; i++) {
        const member = (members as R[])[i] as R;
        comp.ppTypeRefs[i] = member;
        typelib_typedescriptionreference_acquire(member);
        const d: [D | null] = [null];
        TYPELIB_DANGER_GET(d, member);
        assert((d[0] as D).nSize !== 0, "pTD->nSize");
        offset = newAlignedSize(offset, (d[0] as D).nSize, (d[0] as D).nAlignment);
        comp.pMemberOffsets[i] = offset - (d[0] as D).nSize;
        TYPELIB_DANGER_RELEASE(d[0] as D);
        if (parameterized !== null)
          ((comp as unknown as S).pParameterizedTypes as boolean[])[i] = parameterized[
            i
          ] as boolean;
      }
    }
    const d = comp.aBase;
    d.pWeakRef = referenceViewOf(d);
    const alignment: [number] = [d.nAlignment];
    d.nSize = typelib_typedescription_getAlignedUnoSize(d, 0, alignment);
    d.nAlignment = adjustAlignment(alignment[0]);
    d.bComplete = false;
    slot[0] = d;
    typelib_typedescription_register(slot);
    ref[0] = referenceViewOf(slot[0] as D);
    assert(ref[0] === (slot[0] as D).pWeakRef, "*ppRef == pReg->pWeakRef");
  }
  (ref[0] as R).nStaticRefCount++;
  name.dispose();
}
/** Original plain compound wrapper. @param ref - Static cell. @param typeClass - Original struct/exception. @param name - Original name. @param base - Optional base. @param count - Member count. @param members - Member references. @returns Nothing. */
export function typelib_static_compound_type_init(
  ref: [R | null],
  typeClass: C,
  name: Uint8Array | null,
  base: R | null,
  count: number,
  members: R[] | null,
): void {
  init(ref, typeClass, name, base, count, members, null);
}
/** Original parameterized struct wrapper. @param ref - Static cell. @param name - Original name. @param base - Optional base. @param count - Member count. @param members - Member references. @param parameterized - Optional flags. @returns Nothing. */
export function typelib_static_struct_type_init(
  ref: [R | null],
  name: Uint8Array | null,
  base: R | null,
  count: number,
  members: R[] | null,
  parameterized: readonly boolean[] | null,
): void {
  init(ref, C.STRUCT, name, base, count, members, parameterized);
}
/** Original single-base wrapper. @param ref - Static cell. @param name - Original name. @param base - Optional base. @returns Nothing. */
export function typelib_static_interface_type_init(
  ref: [R | null],
  name: Uint8Array | null,
  base: R | null,
): void {
  typelib_static_mi_interface_type_init(ref, name, base === null ? 0 : 1, [base] as R[]);
}
/** Original static MI placeholder with auto-XInterface, acquired legacy base and absent lists/Uik. @param ref - Static cell. @param nameBytes - Original name. @param count - Explicit base count. @param bases - Borrowed bases. @returns Nothing. */
export function typelib_static_mi_interface_type_init(
  ref: [R | null],
  nameBytes: Uint8Array | null,
  count: number,
  bases: R[] | null,
): void {
  if (ref[0] !== null) return;
  const name = OUString.createFromAscii(nameBytes);
  ref[0] = igetTypeByName(name.pData);
  if (ref[0] === null) {
    const slot: [D | null] = [null];
    typelib_typedescription_newEmpty(slot, C.INTERFACE, name.pData);
    const iface = slot[0] as unknown as I;
    iface.nBaseTypes = Math.max(count, 1);
    iface.ppBaseTypes = new Array<I>(iface.nBaseTypes);
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const b: [D | null] = [null];
        typelib_typedescriptionreference_getDescription(b, (bases as R[])[i] as R);
        iface.ppBaseTypes[i] = b[0] as unknown as I;
        assert(b[0] !== null, "pIface->ppBaseTypes[i]");
      }
    } else {
      const b: [D | null] = [null];
      typelib_typedescriptionreference_getDescription(
        b,
        typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R,
      );
      iface.ppBaseTypes[0] = b[0] as unknown as I;
      assert(b[0] !== null, "pIface->ppBaseTypes[0]");
    }
    iface.pBaseTypeDescription = iface.ppBaseTypes[0] as I;
    typelib_typedescription_acquire(iface.pBaseTypeDescription.aBase);
    const d = iface.aBase;
    d.pWeakRef = referenceViewOf(d);
    const alignment: [number] = [d.nAlignment];
    d.nSize = typelib_typedescription_getAlignedUnoSize(d, 0, alignment);
    d.nAlignment = adjustAlignment(alignment[0]);
    d.bComplete = false;
    slot[0] = d;
    typelib_typedescription_register(slot);
    ref[0] = referenceViewOf(slot[0] as D);
    assert(ref[0] === (slot[0] as D).pWeakRef, "*ppRef == pReg->pWeakRef");
  }
  (ref[0] as R).nStaticRefCount++;
  name.dispose();
}
/** Original static enum placeholder initialization and default value. @param ref - Static cell. @param nameBytes - Original name. @param defaultValue - Signed32 default. @returns Nothing. */
export function typelib_static_enum_type_init(
  ref: [R | null],
  nameBytes: Uint8Array | null,
  defaultValue: number,
): void {
  if (ref[0] !== null) return;
  const name = OUString.createFromAscii(nameBytes);
  ref[0] = igetTypeByName(name.pData);
  if (ref[0] === null) {
    const slot: [D | null] = [null];
    typelib_typedescription_newEmpty(slot, C.ENUM, name.pData);
    const d = slot[0] as D;
    (d as unknown as E).nDefaultEnumValue = defaultValue;
    d.pWeakRef = referenceViewOf(d);
    const alignment: [number] = [d.nAlignment];
    d.nSize = typelib_typedescription_getAlignedUnoSize(d, 0, alignment);
    d.nAlignment = adjustAlignment(alignment[0]);
    d.bComplete = false;
    typelib_typedescription_register(slot);
    ref[0] = referenceViewOf(slot[0] as D);
    assert(ref[0] === (slot[0] as D).pWeakRef, "*ppRef == pReg->pWeakRef");
  }
  ref[0].nStaticRefCount++;
  name.dispose();
}
