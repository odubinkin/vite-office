/** @fileoverview Original public uno::Mapping pointer/value ownership and interface-map overloads from mapping.hxx. Environment/name lookup constructors and deprecated bridge helpers remain separate; no mapping provider is supplied. */
import type { uno_Mapping } from "./mapping";
import { Type } from "../com/sun/star/uno/Type";
import {
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
  type typelib_TypeDescription as D,
  type typelib_TypeDescriptionReference as R,
  type typelib_InterfaceTypeDescription as I,
} from "../typelib/typedescription";

/** Original public wrapper is distinct from cppu-private Mapping in lbmap.cxx. Only the source's already-resolved pointer/value constructor family is bound here. */
export class Mapping {
  private _pMapping: uno_Mapping | null;
  /** Original pointer/default and copy constructors acquire a set mapping. @param source - Existing mapping pointer or value. @returns Acquired owner. */
  constructor(source: uno_Mapping | Mapping | null = null) {
    this._pMapping = source instanceof Mapping ? source._pMapping : source;
    if (this._pMapping)
      (this._pMapping.acquire as NonNullable<uno_Mapping["acquire"]>)(this._pMapping);
  }
  /** Original internal move constructor transfers without acquisition. @param other - Original rvalue. @returns Transferred owner. */
  static move(other: Mapping): Mapping {
    const result = Object.create(Mapping.prototype) as Mapping;
    result._pMapping = other._pMapping;
    other._pMapping = null;
    return result;
  }
  /** Original destructor leaves the field published while invoking release. @returns Nothing. */
  dispose(): void {
    if (this._pMapping)
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
  }
  /** Original pointer/copy assignment acquires new before releasing current, including pointer self-assignment. @param source - Borrowed pointer or value. @returns This same owner. */
  assign(source: uno_Mapping | Mapping | null): this {
    const pointer = source instanceof Mapping ? source._pMapping : source;
    if (pointer) (pointer.acquire as NonNullable<uno_Mapping["acquire"]>)(pointer);
    if (this._pMapping)
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
    this._pMapping = pointer;
    return this;
  }
  /** Original internal move assignment releases current before transferring; self-move clears. @param other - Original rvalue. @returns This same owner. */
  moveAssign(other: Mapping): this {
    if (this._pMapping)
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
    this._pMapping = other._pMapping;
    other._pMapping = null;
    return this;
  }
  /** Original unacquired C pointer accessor. @returns Borrowed pointer. */
  get(): uno_Mapping | null {
    return this._pMapping;
  }
  /** Original pointer-presence predicate. @returns Whether set. */
  is(): boolean {
    return this._pMapping !== null;
  }
  /** Original clear releases before null publication, unlike Reference::clear. @returns Nothing. */
  clear(): void {
    if (this._pMapping) {
      (this._pMapping.release as NonNullable<uno_Mapping["release"]>)(this._pMapping);
      this._pMapping = null;
    }
  }
  /** Original return-pointer overloads initialize a null output before forwarding. @param pointer - Borrowed input. @param type - Actual interface description or declared Type. @returns Acquired mapped pointer or null. */
  mapInterface(pointer: unknown, type: I | D | Type): unknown;
  /** Original inout overloads preserve the actual caller field. @param output - Existing output pointer field. @param pointer - Borrowed input. @param type - Actual interface description or declared Type. @returns Nothing. */
  mapInterface(output: [unknown], pointer: unknown, type: I | D | Type): void;
  /** Original overload selection uses arity and the declared Type class; descriptor pointers are already their native interface view. @param first - Input or output field. @param second - Type or input pointer. @param third - Inout overload type. @returns Original return value or void. */
  mapInterface(first: unknown, second: unknown, third?: I | D | Type): unknown {
    const returned = arguments.length === 2,
      output: [unknown] = returned ? [null] : (first as [unknown]),
      pointer = returned ? first : second,
      type = (returned ? second : third) as I | D | Type;
    const mapping = this._pMapping as uno_Mapping;
    if (type instanceof Type) {
      const description: [D | null] = [null];
      TYPELIB_DANGER_GET(description, type.getTypeLibType() as R);
      if (description[0]) {
        (mapping.mapInterface as NonNullable<uno_Mapping["mapInterface"]>)(
          mapping,
          output,
          pointer,
          description[0].pSelf as unknown as I,
        );
        TYPELIB_DANGER_RELEASE(description[0]);
      }
    } else {
      (mapping.mapInterface as NonNullable<uno_Mapping["mapInterface"]>)(
        mapping,
        output,
        pointer,
        type as I,
      );
    }
    return returned ? output[0] : undefined;
  }
}
