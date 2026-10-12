/** @fileoverview Original lbenv.cxx ObjectEntry registration owner and type equality; actual shared strings/typelib/environment records are reused. Full environment engine and physical vector/hash/ABI/thread behavior remain separate. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_ustr_compare } from "../../../sal/rtl/ustring";
import type { uno_ExtEnvironment, uno_freeProxyFunc } from "../../inc/uno/environment";
import type { typelib_InterfaceTypeDescription as I } from "../../inc/typelib/typedescription";
import { typelib_typedescription_acquire } from "../../inc/typelib/typedescription";
/** Original pointer-or-length-and-terminated-name equality. @param first - Borrowed description. @param second - Borrowed description. @returns Original equality. */
export function td_equals(first: I, second: I): boolean {
  return (
    first === second ||
    (first.aBase.pTypeName.length === second.aBase.pTypeName.length &&
      rtl_ustr_compare(first.aBase.pTypeName.buffer, second.aBase.pTypeName.buffer) === 0)
  );
}
/** Original trivial interface record; pointers are acquired explicitly by append and released by the surrounding environment, not this record's destructor. */
export interface InterfaceEntry {
  /** Original signed registration count. */ refCount: number;
  /** Original interface pointer. */ pInterface: unknown;
  /** Original nullable proxy cleanup callback. */ fpFreeProxy: uno_freeProxyFunc | null;
  /** Original acquired interface description. */ pTypeDescr: I;
}
/** Borrowed structural compiler view of the original DefaultEnvironment fields accessed by ObjectEntry; no environment constructor/default/provider. */
export type ObjectEntryEnvironment = uno_ExtEnvironment & {
  aPtr2ObjectMap: Map<unknown, ObjectEntry>;
};
/** Original object registration entry, including native value/lifetime compiler bindings; native arrays represent accessed vector elements and Map represents key identity/insertion without ordering or capacity claims. */
export class ObjectEntry {
  /** Original owned identifier. */ oid: OUString;
  /** Original element records in declaration order. */ aInterfaces: InterfaceEntry[];
  private _nRef: number;
  private _mixedObject: boolean;
  /** Original signed32 object registration count. @returns Current native-width count. */
  get nRef(): number {
    return this._nRef;
  }
  /** Native scalar assignment binding. @param value - Original finite integer. @returns Nothing. */
  set nRef(value: number) {
    this._nRef = value | 0;
  }
  /** Original Boolean mixed flag. @returns Current flag. */
  get mixedObject(): boolean {
    return this._mixedObject;
  }
  /** Native Boolean assignment binding. @param value - Original Boolean. @returns Nothing. */
  set mixedObject(value: boolean) {
    this._mixedObject = Boolean(value);
  }
  /** Original by-value identifier construction or compiler-generated value copy. @param source - Borrowed identifier or entry value. @returns Original entry. */
  constructor(source: OUStringConstReference | ObjectEntry) {
    if (source instanceof ObjectEntry) {
      this.oid = new OUString(source.oid);
      this.aInterfaces = source.aInterfaces.map(
        /** Original trivial InterfaceEntry copy. @param entry - Original record. @returns Copied record with identical pointers. */ (
          entry,
        ) => ({ ...entry }),
      );
      this._nRef = source.nRef;
      this._mixedObject = source.mixedObject;
    } else {
      const parameter = new OUString(source);
      this.oid = OUString.move(parameter);
      parameter.dispose();
      this.aInterfaces = [];
      this._nRef = 0;
      this._mixedObject = false;
    }
  }
  /** Original by-value rvalue argument binding, without an extra string owner. @param source - Rvalue identifier. @returns Initialized entry. */
  static fromMovedString(source: OUString): ObjectEntry {
    const parameter = OUString.move(source),
      result = Object.create(ObjectEntry.prototype) as ObjectEntry;
    result.oid = OUString.move(parameter);
    parameter.dispose();
    result.aInterfaces = [];
    result.nRef = 0;
    result.mixedObject = false;
    return result;
  }
  /** Original implicit memberwise move transfers identifier/vector and copies scalars. @param source - Rvalue entry. @returns Moved entry. */
  static move(source: ObjectEntry): ObjectEntry {
    const result = Object.create(ObjectEntry.prototype) as ObjectEntry;
    result.oid = OUString.move(source.oid);
    result.aInterfaces = source.aInterfaces;
    source.aInterfaces = [];
    result.nRef = source.nRef;
    result.mixedObject = source.mixedObject;
    return result;
  }
  /** Original implicit memberwise copy assignment; existing live vector slots are assigned in place when retained. @param source - Borrowed entry. @returns This same entry. */
  assign(source: ObjectEntry): this {
    this.oid.assign(source.oid);
    for (let i = 0; i < source.aInterfaces.length; i++) {
      const entry = source.aInterfaces[i] as InterfaceEntry;
      if (i < this.aInterfaces.length) Object.assign(this.aInterfaces[i] as InterfaceEntry, entry);
      else this.aInterfaces.push({ ...entry });
    }
    this.aInterfaces.length = source.aInterfaces.length;
    this.nRef = source.nRef;
    this.mixedObject = source.mixedObject;
    return this;
  }
  /** Original implicit move assignment follows identifier, vector and scalar order; vector self-move clears its logical elements on the selected native implementation. @param source - Rvalue entry. @returns This same entry. */
  moveAssign(source: ObjectEntry): this {
    this.oid.moveAssign(source.oid);
    this.aInterfaces = source.aInterfaces;
    source.aInterfaces = [];
    this.nRef = source.nRef;
    this.mixedObject = source.mixedObject;
    return this;
  }
  /** Original implicit destructor destroys the vector's trivial records and identifier; no interface/type release belongs here. @returns Nothing. */
  dispose(): void {
    this.oid.dispose();
  }
  /** Complete original append order: acquire nonproxy interface, initialize record, acquire type, emplace pointer identity, then append. @param env - Borrowed original environment view. @param pointer - Borrowed interface pointer. @param type - Actual description. @param freeProxy - Original nullable cleanup callback. @returns Nothing. */
  append(
    env: ObjectEntryEnvironment,
    pointer: unknown,
    type: I,
    freeProxy: uno_freeProxyFunc | null,
  ): void {
    if (freeProxy === null)
      (env.acquireInterface as NonNullable<uno_ExtEnvironment["acquireInterface"]>)(env, pointer);
    const entry: InterfaceEntry = {
      refCount: 1,
      pInterface: pointer,
      fpFreeProxy: freeProxy,
      pTypeDescr: type,
    };
    typelib_typedescription_acquire(type.aBase);
    // Native unordered_map emplace does not overwrite an existing pointer key. SAL_WARN_IF is diagnostic in the selected debug0 build.
    if (!env.aPtr2ObjectMap.has(pointer)) env.aPtr2ObjectMap.set(pointer, this);
    this.aInterfaces.push(entry);
  }
  /** Original type lookup overload. @param type - Borrowed queried description. @returns Borrowed live entry or null. */
  find(type: I): InterfaceEntry | null;
  /** Original pointer lookup overload. @param pointer - Original pointer identity. @param pos - Original size_t starting index. @returns Signed32 index or -1. */
  find(pointer: unknown, pos: number | bigint): number;
  /** Complete original overload bodies; erased signatures select by the declared second argument. @param value - Original pointer/type argument. @param pos - Original size_t index, if present. @returns Original borrowed entry/index/null. */
  find(value: unknown, pos?: number | bigint): InterfaceEntry | null | number {
    if (pos !== undefined) {
      for (
        let index = BigInt.asUintN(64, BigInt(pos));
        index < BigInt(this.aInterfaces.length);
        index++
      )
        if ((this.aInterfaces[Number(index)] as InterfaceEntry).pInterface === value)
          return Number(index) | 0;
      return -1;
    }
    if (this.aInterfaces.length === 0) return null;
    const type = value as I,
      typeName = OUString.unacquired([type.aBase.pTypeName]);
    if (
      typeName.equalsAsciiL(
        new Uint8Array([
          99, 111, 109, 46, 115, 117, 110, 46, 115, 116, 97, 114, 46, 117, 110, 111, 46, 88, 73,
          110, 116, 101, 114, 102, 97, 99, 101,
        ]),
        27,
      )
    )
      return this.aInterfaces[0] as InterfaceEntry;
    for (const entry of this.aInterfaces) {
      for (
        let current: I | null = entry.pTypeDescr;
        current !== null;
        current = current.pBaseTypeDescription
      )
        if (td_equals(current, type)) return entry;
    }
    return null;
  }
}
