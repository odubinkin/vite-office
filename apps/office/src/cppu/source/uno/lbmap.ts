/** @fileoverview Complete original cppu-private Mapping and MappingEntry lifetime owners from lbmap.cxx; existing actual C mapping callbacks and OUString ownership are reused. Registry/mediation/environment engines remain separate. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { uno_Mapping, uno_freeMappingFunc } from "../../inc/uno/mapping";
/** Original cppu-private owner, distinct from the public uno::Mapping wrapper. Copy assignment is deleted upstream; only original pointer assignment and move assignment are exposed. */
export class Mapping {
  private _pMapping: uno_Mapping | null;
  /** Original default/pointer or copying constructor. @param source - Borrowed record or value owner. @returns Acquired owner. */
  constructor(source: uno_Mapping | Mapping | null = null) {
    this._pMapping = source instanceof Mapping ? source._pMapping : source;
    if (this._pMapping)
      (this._pMapping.acquire as NonNullable<uno_Mapping["acquire"]>)(this._pMapping);
  }
  /** Original move constructor transfers its pointer without acquisition. @param other - Rvalue owner. @returns Transferred owner. */
  static move(other: Mapping): Mapping {
    const result = Object.create(Mapping.prototype) as Mapping;
    result._pMapping = other._pMapping;
    other._pMapping = null;
    return result;
  }
  /** Original destructor releases a set record without publishing a cleared pointer. @returns Nothing. */
  dispose(): void {
    if (this._pMapping)
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
  }
  /** Original pointer assignment acquires new, releases current, then publishes new. @param mapping - Borrowed record or null. @returns This same owner. */
  assign(mapping: uno_Mapping | null): this {
    if (mapping) (mapping.acquire as NonNullable<uno_Mapping["acquire"]>)(mapping);
    if (this._pMapping)
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
    this._pMapping = mapping;
    return this;
  }
  /** Original move assignment releases current before transfer; self-move clears the pointer. @param other - Rvalue owner. @returns This same owner. */
  moveAssign(other: Mapping): this {
    if (this._pMapping)
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
    this._pMapping = other._pMapping;
    other._pMapping = null;
    return this;
  }
  /** Original borrowed pointer accessor. @returns Unacquired record or null. */
  get(): uno_Mapping | null {
    return this._pMapping;
  }
  /** Original pointer presence test. @returns Whether set. */
  is(): boolean {
    return this._pMapping !== null;
  }
}
/** Original mapping registry entry owns only its name; mapping/free-function fields are borrowed and no callbacks belong to compiler destruction. */
export class MappingEntry {
  private _nRef: number;
  /** Original mapping pointer. */ pMapping: uno_Mapping | null;
  /** Original free-function pointer. */ freeMapping: uno_freeMappingFunc | null;
  /** Original owned registry name. */ aMappingName: OUString;
  /** Original signed32 count. @returns Current count. */
  get nRef(): number {
    return this._nRef;
  }
  /** Original signed-width assignment binding. @param value - Finite integer. @returns Nothing. */
  set nRef(value: number) {
    this._nRef = value | 0;
  }
  /** Original compiler copy constructor. @param source - Original value. @returns Copied value. */
  constructor(source: MappingEntry);
  /** Original by-value name constructor. @param mapping - Borrowed pointer. @param free - Borrowed callback. @param name - Owned argument value. @returns Initialized value. */
  constructor(
    mapping: uno_Mapping | null,
    free: uno_freeMappingFunc | null,
    name: OUStringConstReference,
  );
  /** Original constructor bindings. @param source - Pointer/value. @param free - Original callback. @param name - By-value input. @returns Entry. */
  constructor(
    source: MappingEntry | uno_Mapping | null,
    free?: uno_freeMappingFunc | null,
    name?: OUStringConstReference,
  ) {
    if (source instanceof MappingEntry) {
      this._nRef = source.nRef;
      this.pMapping = source.pMapping;
      this.freeMapping = source.freeMapping;
      this.aMappingName = new OUString(source.aMappingName);
    } else {
      const parameter = new OUString(name as OUStringConstReference);
      this._nRef = 1;
      this.pMapping = source;
      this.freeMapping = free as uno_freeMappingFunc | null;
      this.aMappingName = OUString.move(parameter);
      parameter.dispose();
    }
  }
  /** Original rvalue name parameter binding. @param mapping - Borrowed pointer. @param free - Borrowed callback. @param name - Moved argument. @returns Original entry. */
  static fromMovedString(
    mapping: uno_Mapping | null,
    free: uno_freeMappingFunc | null,
    name: OUString,
  ): MappingEntry {
    const parameter = OUString.move(name),
      result = Object.create(MappingEntry.prototype) as MappingEntry;
    result.nRef = 1;
    result.pMapping = mapping;
    result.freeMapping = free;
    result.aMappingName = OUString.move(parameter);
    parameter.dispose();
    return result;
  }
  /** Original memberwise move copies scalars and transfers the name. @param source - Rvalue entry. @returns Moved value. */
  static move(source: MappingEntry): MappingEntry {
    const result = Object.create(MappingEntry.prototype) as MappingEntry;
    result.nRef = source.nRef;
    result.pMapping = source.pMapping;
    result.freeMapping = source.freeMapping;
    result.aMappingName = OUString.move(source.aMappingName);
    return result;
  }
  /** Original declaration-order memberwise copy assignment. @param source - Borrowed entry. @returns This value. */
  assign(source: MappingEntry): this {
    this.nRef = source.nRef;
    this.pMapping = source.pMapping;
    this.freeMapping = source.freeMapping;
    this.aMappingName.assign(source.aMappingName);
    return this;
  }
  /** Original declaration-order memberwise move assignment. @param source - Rvalue entry. @returns This value. */
  moveAssign(source: MappingEntry): this {
    this.nRef = source.nRef;
    this.pMapping = source.pMapping;
    this.freeMapping = source.freeMapping;
    this.aMappingName.moveAssign(source.aMappingName);
    return this;
  }
  /** Original compiler destructor releases only the name. @returns Nothing. */
  dispose(): void {
    this.aMappingName.dispose();
  }
}
