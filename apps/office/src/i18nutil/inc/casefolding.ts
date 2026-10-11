/** @fileoverview Original casefolding.hxx flags and initialized mapping value layouts used by the locale-aware scalar layer. */

/** Original mapping flags; comments in upstream swap the first two descriptions, while the numeric contracts are retained. */
export enum MappingType {
  NONE = 0x00,
  LowerToUpper = 0x01,
  UpperToLower = 0x02,
  ToUpper = 0x04,
  ToLower = 0x08,
  ToTitle = 0x10,
  SimpleFolding = 0x20,
  FullFolding = 0x40,
  // Original OR of all seven mapping bits, expressed as the compiled constant.
  CasedLetterMask = 0x7f,
  NotValue = 0x80,
}

/** Original fixed UTF16 mapping capacity. */
export const NMAPPINGMAX = 3;

/** Original table value; the type flag determines whether value is a unit or an extras address. */
export interface Value {
  readonly type: number;
  readonly value: number;
}

/** Original initialized mapping fields; the three-unit array preserves zeros beyond nmap. */
export interface Mapping {
  type: number;
  nmap: number;
  map: Uint16Array;
}

/** Original const Mapping reference, exposing initialized units without mutable array operations. */
export interface MappingConstReference {
  readonly type: number;
  readonly nmap: number;
  readonly map: Iterable<number> & { readonly length: number; readonly [index: number]: number };
}

/** Original iterator state. Only current/type/nmap have native default values; the native default map cells are uninitialized and have no promised value. */
export class MappingElement {
  private value: Mapping;
  current: number;
  /** Original default initializes current and the type/count fields; typed-array storage does not certify native indeterminate default units. @returns Original iterator state. */
  constructor() {
    this.value = { type: 0, nmap: 0, map: new Uint16Array(NMAPPINGMAX) };
    this.current = 0;
  }
  /** Original embedded Mapping field has stable identity. @returns Mutable embedded value. */
  get element(): Mapping {
    return this.value;
  }
  /** Original struct value assignment copies all initialized fields into the existing embedded storage. @param source - Original Mapping value. @returns Nothing. */
  set element(source: MappingConstReference) {
    this.value.type = source.type;
    this.value.nmap = source.nmap;
    for (let i = 0; i < NMAPPINGMAX; i++) this.value.map[i] = source.map[i] as number;
  }
  /** Adapts the original implicit iterator-state copy assignment used for termination reset. Native default map cells remain unverified. @param source - Original state value. @returns This stable state owner. */
  assign(source: MappingElement): this {
    this.element = source.element;
    this.current = source.current;
    return this;
  }
}

export { casefolding } from "../source/utility/casefolding";
