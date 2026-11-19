/** @fileoverview Original Pair<T,U> IDL consumed Pair<OUString,OUString> instantiation and normal generated struct metadata over actual OUString owners; borrowed aggregate views lower native const references without constructing another value. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../../sal/inc/rtl/ustring.h";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original cached normal struct type in declaration order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType_PairStringString(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.Pair<string,string>\0"),
      null,
      2,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      [true, true],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original borrowed const PairStringString fields. */
export interface PairStringStringConstReference {
  readonly First: OUStringConstReference;
  readonly Second: OUStringConstReference;
}
/** Actual native aggregate address used by existing CPPU field dispatch. */
type PairAddress = Pick<ReadonlyMap<number, unknown>, "get">;
const borrowed = new WeakMap<PairAddress, PairStringStringConstReference>();
/** Complete generated consumed Pair<OUString,OUString> operations; other template instantiations remain unported; physical LP64 layout is not a JS object ABI. */
export class PairStringString implements PairStringStringConstReference {
  private first = new OUString();
  private second = new OUString();
  /** Original default/copy/all-field constructors. @param args - Native selected inputs. @returns Actual value. */
  constructor(
    ...args:
      [] | [PairStringStringConstReference] | [OUStringConstReference, OUStringConstReference]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.First = args[0];
      this.Second = args[1];
    }
  }
  /** Original first member. @returns Stable actual string. */ get First(): OUString {
    return this.first;
  }
  /** Original first assignment. @param value - Borrowed string. @returns Nothing. */ set First(
    value: OUStringConstReference,
  ) {
    this.first.assign(value);
  }
  /** Original second member. @returns Stable actual string. */ get Second(): OUString {
    return this.second;
  }
  /** Original second assignment. @param value - Borrowed string. @returns Nothing. */ set Second(
    value: OUStringConstReference,
  ) {
    this.second.assign(value);
  }
  /** Original generated equality retains field comparison order. @param other - Const value. @returns Equal. */ equals(
    other: PairStringStringConstReference,
  ): boolean {
    return this.First.equals(other.First) && this.Second.equals(other.Second);
  }
  /** Original generated inequality. @param other - Const value. @returns Different. */ notEquals(
    other: PairStringStringConstReference,
  ): boolean {
    return !this.equals(other);
  }
  /** Original implicit assignment. @param other - Const value. @returns This owner. */ assign(
    other: PairStringStringConstReference,
  ): this {
    this.First = other.First;
    this.Second = other.Second;
    return this;
  }
  /** Original implicit memberwise move construction. @param source - Native rvalue. @returns Moved value. */ static move(
    source: PairStringString,
  ): PairStringString {
    const result = Object.create(PairStringString.prototype) as PairStringString;
    result.first = OUString.move(source.first);
    result.second = OUString.move(source.second);
    return result;
  }
  /** Original implicit memberwise move assignment. @param source - Native rvalue. @returns This owner. */ moveAssign(
    source: PairStringString,
  ): this {
    this.first.moveAssign(source.first);
    this.second.moveAssign(source.second);
    return this;
  }
  /** Original compound field address lowering at valid declared offsets0/8. @param offset - Original logical field offset. @returns Actual field pointer cell. */ get(
    offset: number,
  ): rtl_uStringSlot {
    return offset === 0 ? this.first.getDataAddress() : this.second.getDataAddress();
  }
  /** Compiler const-reference binding over an existing initialized aggregate; no acquire/default/constructor/provider is used. @param address - Actual CPPU aggregate field address. @returns Stable borrowed view. */ static unacquired(
    address: PairAddress,
  ): PairStringStringConstReference {
    let view = borrowed.get(address);
    if (view === undefined) {
      view = Object.freeze({
        First: OUString.unacquired(address.get(0) as rtl_uStringSlot),
        Second: OUString.unacquired(address.get(8) as rtl_uStringSlot),
      });
      borrowed.set(address, view);
    }
    return view;
  }
  /** Original reverse member destruction. @returns Nothing. */ dispose(): void {
    this.second.dispose();
    this.first.dispose();
  }
}

const long_type: [R | null] = [null];
/** Original normal Pair<string,long> specialization metadata. @returns Borrowed native type. */
export function cppu_detail_getUnoType_PairStringLong(): Type {
  if (long_type[0] === null)
    typelib_static_struct_type_init(
      long_type,
      new TextEncoder().encode("com.sun.star.beans.Pair<string,long>\0"),
      null,
      2,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      [true, true],
    );
  return getTypeFromTypeDescriptionReference(long_type);
}
/** Original const Pair<OUString,sal_Int32> fields. */
export interface PairStringLongConstReference {
  readonly First: OUStringConstReference;
  readonly Second: number;
}
const borrowedLong = new WeakMap<PairAddress, PairStringLongConstReference>();
/** Generated consumed Pair<string,long> specialization uses the existing native string and signed32 cells. */
export class PairStringLong implements PairStringLongConstReference {
  private first = new OUString();
  private second: [number] = [0];
  /** Original default/copy/all-field constructors. @param args - Selected native operands. @returns Value. */
  constructor(...args: [] | [PairStringLongConstReference] | [OUStringConstReference, number]) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.First = args[0];
      this.Second = args[1];
    }
  }
  /** Original first member. @returns Borrowed string owner. */
  get First(): OUString {
    return this.first;
  }
  /** Original first assignment. @param value - Borrowed string. @returns Nothing. */
  set First(value: OUStringConstReference) {
    this.first.assign(value);
  }
  /** Original signed32 member. @returns Field value. */
  get Second(): number {
    return this.second[0];
  }
  /** Original signed32 assignment. @param value - Source scalar. @returns Nothing. */
  set Second(value: number) {
    this.second[0] = value | 0;
  }
  /** Original field-ordered equality. @param other - Native operand. @returns Equal. */
  equals(other: PairStringLongConstReference): boolean {
    return this.First.equals(other.First) && this.Second === other.Second;
  }
  /** Original inequality. @param other - Native operand. @returns Different. */
  notEquals(other: PairStringLongConstReference): boolean {
    return !this.equals(other);
  }
  /** Original memberwise copy assignment. @param other - Native operand. @returns This owner. */
  assign(other: PairStringLongConstReference): this {
    this.First = other.First;
    this.Second = other.Second;
    return this;
  }
  /** Original memberwise move construction; scalar source remains unchanged. @param source - Native rvalue. @returns Moved value. */
  static move(source: PairStringLong): PairStringLong {
    const result = Object.create(PairStringLong.prototype) as PairStringLong;
    result.first = OUString.move(source.first);
    result.second = [source.second[0]];
    return result;
  }
  /** Original memberwise move assignment; scalar source remains unchanged. @param source - Native rvalue. @returns This owner. */
  moveAssign(source: PairStringLong): this {
    this.first.moveAssign(source.first);
    this.Second = source.Second;
    return this;
  }
  /** Original addressed fields for CPPU native aggregate operations. @param offset - Declared field offset0/8. @returns Actual field cell. */
  get(offset: number): rtl_uStringSlot | [number] {
    return offset === 0 ? this.first.getDataAddress() : this.second;
  }
  /** Compiler const-reference binding over existing initialized field cells. @param address - Actual native aggregate. @returns Borrowed view. */
  static unacquired(address: PairAddress): PairStringLongConstReference {
    let view = borrowedLong.get(address);
    if (view === undefined) {
      view = Object.freeze({
        First: OUString.unacquired(address.get(0) as rtl_uStringSlot),
        /** Reads the original current scalar cell. @returns Signed32 value. */ get Second(): number {
          return (address.get(8) as [number])[0];
        },
      });
      borrowedLong.set(address, view);
    }
    return view;
  }
  /** Original member destruction. @returns Nothing. */
  dispose(): void {
    this.first.dispose();
  }
}
