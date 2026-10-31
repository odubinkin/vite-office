/** @fileoverview Original lbenv.cxx ObjectEntry and EnvironmentsData registration owners, type equality and public environment enumeration. Actual shared strings/typelib/C callback records are reused. Default environment creation, purpose/bridge engines and physical vector/hash/ABI/thread behavior remain separate. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_ustr_compare } from "../../../sal/rtl/ustring";
import type {
  uno_ExtEnvironment,
  uno_freeProxyFunc,
  uno_Environment,
  uno_memAlloc,
} from "../../inc/uno/environment";
import type { typelib_InterfaceTypeDescription as I } from "../../inc/typelib/typedescription";
import {
  typelib_typedescription_acquire,
  typelib_typedescription_release,
} from "../../inc/typelib/typedescription";
import {
  rtl_uString_acquire,
  rtl_uString_release,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../../../sal/inc/rtl/ustring.h";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
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

/** Borrowed compiler view of the original DefaultEnvironment registration maps. It supplies no constructor, environment factory, thread stack or language-binding callbacks. */
export type DefaultEnvironmentRegistration = ObjectEntryEnvironment & {
  aOId2ObjectMap: Map<OUString, ObjectEntry | null>;
};
/** Original unordered-map lookup over the actual owned Unicode keys. Native bucket order/capacity are not represented. @param map - Actual source OID map. @param oid - Borrowed exact identifier. @returns Matching owned key or undefined. */
function objectKey(
  map: ReadonlyMap<OUString, ObjectEntry | null>,
  oid: OUStringConstReference,
): OUString | undefined {
  for (const candidate of map.keys()) if (candidate.equals(oid)) return candidate;
  return undefined;
}
/** Original registerInterface body keeps the dummy insertion, object/interface counts and acquire-release-publish replacement order. @param env - Actual borrowed extended environment with original maps. @param output - Original inout pointer. @param oid - Borrowed identifier. @param type - Actual description. @returns Nothing. */
export function defenv_registerInterface(
  env: uno_ExtEnvironment,
  output: [unknown],
  oid: rtl_uString,
  type: I,
): void {
  const that = env as DefaultEnvironmentRegistration,
    name = OUString.unacquired([oid]);
  const key = objectKey(that.aOId2ObjectMap, name);
  if (key === undefined) {
    const owned = new OUString(name);
    that.aOId2ObjectMap.set(owned, null);
    const entry = new ObjectEntry(name);
    that.aOId2ObjectMap.set(owned, entry);
    ++entry.nRef;
    entry.append(that, output[0], type, null);
  } else {
    const entry = that.aOId2ObjectMap.get(key) as ObjectEntry;
    ++entry.nRef;
    const found = entry.find(type);
    if (found) {
      found.refCount = (found.refCount + 1) | 0;
      if (found.pInterface !== output[0]) {
        const pointer = found.pInterface;
        (env.acquireInterface as NonNullable<uno_ExtEnvironment["acquireInterface"]>)(env, pointer);
        (env.releaseInterface as NonNullable<uno_ExtEnvironment["releaseInterface"]>)(
          env,
          output[0],
        );
        output[0] = pointer;
      }
    } else entry.append(that, output[0], type, null);
  }
}
/** Original proxy registration distinguishes re-registration of the same proxy from exchanging a different pointer, and marks mixed objects only from the original first entry. @param env - Actual borrowed environment. @param output - Original inout proxy. @param free - Original proxy destruction callback. @param oid - Borrowed identifier. @param type - Actual description. @returns Nothing. */
export function defenv_registerProxyInterface(
  env: uno_ExtEnvironment,
  output: [unknown],
  free: uno_freeProxyFunc,
  oid: rtl_uString,
  type: I,
): void {
  const that = env as DefaultEnvironmentRegistration,
    name = OUString.unacquired([oid]);
  const key = objectKey(that.aOId2ObjectMap, name);
  if (key === undefined) {
    const owned = new OUString(name);
    that.aOId2ObjectMap.set(owned, null);
    const entry = new ObjectEntry(name);
    that.aOId2ObjectMap.set(owned, entry);
    ++entry.nRef;
    entry.append(that, output[0], type, free);
  } else {
    const entry = that.aOId2ObjectMap.get(key) as ObjectEntry;
    entry.mixedObject = Boolean(
      Number(entry.mixedObject) |
      Number(
        entry.aInterfaces.length !== 0 &&
          (entry.aInterfaces[0] as InterfaceEntry).fpFreeProxy === null,
      ),
    );
    ++entry.nRef;
    const found = entry.find(type);
    if (found) {
      if (found.pInterface === output[0]) found.refCount = (found.refCount + 1) | 0;
      else {
        const pointer = found.pInterface;
        (env.acquireInterface as NonNullable<uno_ExtEnvironment["acquireInterface"]>)(env, pointer);
        --entry.nRef;
        free(env, output[0]);
        output[0] = pointer;
      }
    } else entry.append(that, output[0], type, free);
  }
}
/** Complete original revoke callee. The outer defenv_revokeInterface must still invoke it through the actual environment stack; this function does not substitute direct invocation for that missing public orchestration. @param args - Original valid advancing va_list cursor with environment and interface. @returns Nothing. */
export function s_stub_defenv_revokeInterface(args: Iterator<unknown>): void {
  const env = args.next().value as uno_ExtEnvironment,
    pointer = args.next().value,
    that = env as DefaultEnvironmentRegistration;
  const object = that.aPtr2ObjectMap.get(pointer) as ObjectEntry;
  --object.nRef;
  if (object.nRef === 0) {
    const key = objectKey(that.aOId2ObjectMap, object.oid);
    if (key !== undefined) {
      that.aOId2ObjectMap.delete(key);
      key.dispose();
    }
    for (let index = object.aInterfaces.length; index--;)
      that.aPtr2ObjectMap.delete((object.aInterfaces[index] as InterfaceEntry).pInterface);
    for (let index = object.aInterfaces.length; index--;) {
      const entry = object.aInterfaces[index] as InterfaceEntry;
      typelib_typedescription_release(entry.pTypeDescr.aBase);
      if (entry.fpFreeProxy) entry.fpFreeProxy(env, entry.pInterface);
      else
        (env.releaseInterface as NonNullable<uno_ExtEnvironment["releaseInterface"]>)(
          env,
          entry.pInterface,
        );
    }
    object.dispose();
  } else if (object.mixedObject) {
    const index = object.find(pointer, 1);
    if (index > 0) {
      const entry = object.aInterfaces[index] as InterfaceEntry;
      if (entry.fpFreeProxy !== null) {
        entry.refCount = (entry.refCount - 1) | 0;
        if (entry.refCount === 0) {
          const free = entry.fpFreeProxy,
            description = entry.pTypeDescr.aBase;
          object.aInterfaces.splice(index, 1);
          if (object.find(pointer, index) < 0) that.aPtr2ObjectMap.delete(pointer);
          typelib_typedescription_release(description);
          free(env, pointer);
        }
      }
    }
  }
}
/** Original identifier query releases/nulls the output before map lookup and invokes the actual installed computation callback only for an absent pointer. @param env - Actual borrowed environment. @param output - Original string pointer field. @param pointer - Non-null source interface. @returns Nothing. */
export function defenv_getObjectIdentifier(
  env: uno_ExtEnvironment,
  output: rtl_uStringSlot,
  pointer: unknown,
): void {
  if (output[0]) {
    rtl_uString_release(output[0]);
    output[0] = null;
  }
  const object = (env as DefaultEnvironmentRegistration).aPtr2ObjectMap.get(pointer);
  if (object === undefined)
    (env.computeObjectIdentifier as NonNullable<uno_ExtEnvironment["computeObjectIdentifier"]>)(
      env,
      output,
      pointer,
    );
  else {
    rtl_uString_acquire(object.oid.pData);
    output[0] = object.oid.pData;
  }
}
/** Original registered-interface query releases/nulls its previous result before exact OID and original type/base lookup. @param env - Actual borrowed environment. @param output - Original inout pointer. @param oid - Borrowed exact identifier. @param type - Actual demanded description. @returns Nothing. */
export function defenv_getRegisteredInterface(
  env: uno_ExtEnvironment,
  output: [unknown],
  oid: rtl_uString,
  type: I,
): void {
  if (output[0]) {
    (env.releaseInterface as NonNullable<uno_ExtEnvironment["releaseInterface"]>)(env, output[0]);
    output[0] = null;
  }
  const that = env as DefaultEnvironmentRegistration,
    name = OUString.unacquired([oid]),
    key = objectKey(that.aOId2ObjectMap, name);
  if (key !== undefined) {
    const entry = (that.aOId2ObjectMap.get(key) as ObjectEntry).find(type);
    if (entry) {
      (env.acquireInterface as NonNullable<uno_ExtEnvironment["acquireInterface"]>)(
        env,
        entry.pInterface,
      );
      output[0] = entry.pInterface;
    }
  }
}
/** Original complete-vector query allocates even for zero entries, acquires every distinct pointer and publishes array/count only after iteration. @param env - Actual borrowed environment. @param output - Original output array pointer. @param length - Original signed32 count. @param allocate - Actual caller allocation callback. @returns Nothing. */
export function defenv_getRegisteredInterfaces(
  env: uno_ExtEnvironment,
  output: [unknown[] | null],
  length: [number],
  allocate: uno_memAlloc,
): void {
  const that = env as DefaultEnvironmentRegistration,
    count = that.aPtr2ObjectMap.size | 0,
    pointers = allocate(count * 8) as unknown[];
  let index = 0;
  for (const pointer of that.aPtr2ObjectMap.keys()) {
    pointers[index] = pointer;
    (env.acquireInterface as NonNullable<uno_ExtEnvironment["acquireInterface"]>)(
      env,
      pointers[index],
    );
    ++index;
  }
  output[0] = pointers;
  length[0] = count;
}

/** Original void* context represented by its actual caller-provided address; physical object addresses are not synthesized. */
export type EnvironmentContextAddress = number | bigint | null;
/** Original context-decimal-plus-descriptor key, including its lack of a separator. @param descriptor - Borrowed exact descriptor. @param context - Actual native pointer address. @returns Owned key. */
function key(descriptor: OUStringConstReference, context: EnvironmentContextAddress): OUString {
  const number = new OUString(
    OUString.number(BigInt.asIntN(64, context === null ? 0n : BigInt(context))),
  );
  try {
    return new OUString(new StringConcat(number, descriptor));
  } finally {
    number.dispose();
  }
}
/** Original unordered-map find binding uses value equality of actual owned OUString keys; native bucket allocation/iteration order are not represented. @param map - Original map. @param name - Borrowed key. @returns Actual matching key or undefined. */
function find(
  map: ReadonlyMap<OUString, uno_Environment>,
  name: OUStringConstReference,
): OUString | undefined {
  for (const candidate of map.keys()) if (candidate.equals(name)) return candidate;
  return undefined;
}
/** Complete original weak environment registry owner. It does not manufacture environments or callbacks. */
export class EnvironmentsData {
  readonly aName2EnvMap = new Map<OUString, uno_Environment>();
  isDisposing = false;
  /** Original destructor marks shutdown, hardens before releasing the registry weak ref and disposes/releases each surviving environment. @returns Nothing. */
  dispose(): void {
    this.isDisposing = true;
    try {
      for (const weak of this.aName2EnvMap.values()) {
        const hard: [uno_Environment | null] = [null];
        (weak.harden as NonNullable<uno_Environment["harden"]>)(hard, weak);
        (weak.releaseWeak as NonNullable<uno_Environment["releaseWeak"]>)(weak);
        if (hard[0]) {
          (hard[0].dispose as NonNullable<uno_Environment["dispose"]>)(hard[0]);
          (hard[0].release as NonNullable<uno_Environment["release"]>)(hard[0]);
        }
      }
    } finally {
      for (const name of this.aName2EnvMap.keys()) name.dispose();
      this.aName2EnvMap.clear();
    }
  }
  /** Original releases and nulls the output before lookup/hardening. @param output - Actual inout environment. @param descriptor - Exact environment descriptor. @param context - Native pointer address. @returns Nothing. */
  getEnvironment(
    output: [uno_Environment | null],
    descriptor: OUStringConstReference,
    context: EnvironmentContextAddress,
  ): void {
    if (output[0]) {
      (output[0].release as NonNullable<uno_Environment["release"]>)(output[0]);
      output[0] = null;
    }
    const name = key(descriptor, context);
    try {
      const found = find(this.aName2EnvMap, name);
      if (found !== undefined) {
        const weak = this.aName2EnvMap.get(found) as uno_Environment;
        (weak.harden as NonNullable<uno_Environment["harden"]>)(output, weak);
      }
    } finally {
      name.dispose();
    }
  }
  /** Original insert/acquireWeak, live duplicate substitution or dead duplicate replacement order. @param output - Actual non-null inout environment. @returns Nothing. */
  registerEnvironment(output: [uno_Environment | null]): void {
    const env = output[0] as uno_Environment,
      name = key(
        OUString.unacquired([env.pTypeName as rtl_uString]),
        env.pContext as EnvironmentContextAddress,
      );
    try {
      const found = find(this.aName2EnvMap, name);
      if (found === undefined) {
        (env.acquireWeak as NonNullable<uno_Environment["acquireWeak"]>)(env);
        this.aName2EnvMap.set(new OUString(name), env);
      } else {
        const hard: [uno_Environment | null] = [null],
          weak = this.aName2EnvMap.get(found) as uno_Environment;
        (weak.harden as NonNullable<uno_Environment["harden"]>)(hard, weak);
        if (hard[0]) {
          (env.release as NonNullable<uno_Environment["release"]>)(env);
          output[0] = hard[0];
        } else {
          (weak.releaseWeak as NonNullable<uno_Environment["releaseWeak"]>)(weak);
          (env.acquireWeak as NonNullable<uno_Environment["acquireWeak"]>)(env);
          this.aName2EnvMap.set(found, env);
        }
      }
    } finally {
      name.dispose();
    }
  }
  /** Original exact descriptor filter, successful hardening count and caller allocation only for nonempty results. @param output - Actual output array. @param length - Original signed32 count. @param allocate - Original caller allocation function. @param descriptor - Exact descriptor;empty selects all. @returns Nothing. */
  getRegisteredEnvironments(
    output: [uno_Environment[] | null],
    length: [number],
    allocate: uno_memAlloc,
    descriptor: OUStringConstReference,
  ): void {
    const found = new Array<uno_Environment | null>(this.aName2EnvMap.size);
    let count = 0;
    for (const weak of this.aName2EnvMap.values()) {
      if (
        descriptor.getLength() === 0 ||
        descriptor.equals(OUString.unacquired([weak.pTypeName as rtl_uString]))
      ) {
        const slot: [uno_Environment | null] = [null];
        (weak.harden as NonNullable<uno_Environment["harden"]>)(slot, weak);
        found[count] = slot[0];
        if (found[count]) ++count;
      }
    }
    length[0] = count;
    if (count) {
      output[0] = allocate(8 * count) as uno_Environment[];
      while (count--) output[0][count] = found[count] as uno_Environment;
    } else output[0] = null;
  }
}
let singleton: EnvironmentsData | undefined;
/** Original function-static weak registry, initialized on first use. @returns Same actual registry. */
export function theEnvironmentsData(): EnvironmentsData {
  return (singleton ??= new EnvironmentsData());
}
/** Original public registry enumeration body; native mutex/noexcept ABI are erased, not replaced by an empty provider. @param output - Output array pointer. @param length - Output count. @param allocate - Actual caller allocator. @param descriptor - Optional exact descriptor;null selects all. @returns Nothing. */
export function uno_getRegisteredEnvironments(
  output: [uno_Environment[] | null],
  length: [number],
  allocate: uno_memAlloc,
  descriptor: rtl_uString | null,
): void {
  const name = descriptor === null ? new OUString() : new OUString(descriptor);
  try {
    theEnvironmentsData().getRegisteredEnvironments(output, length, allocate, name);
  } finally {
    name.dispose();
  }
}
