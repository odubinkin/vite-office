/** @fileoverview Original StringPair IDL value and normal generated struct metadata over actual OUString owners; borrowed aggregate views lower native const references without constructing another value. */
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
export function cppu_detail_getUnoType_StringPair(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.StringPair\0"),
      null,
      2,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original borrowed const StringPair fields. */
export interface StringPairConstReference {
  readonly First: OUStringConstReference;
  readonly Second: OUStringConstReference;
}
/** Actual native aggregate address used by existing CPPU field dispatch. */
type PairAddress = Pick<ReadonlyMap<number, unknown>, "get">;
const borrowed = new WeakMap<PairAddress, StringPairConstReference>();
/** Complete original generated StringPair value operations; physical LP64 layout is not a JS object ABI. */
export class StringPair implements StringPairConstReference {
  private first = new OUString();
  private second = new OUString();
  /** Original default/copy/all-field constructors. @param args - Native selected inputs. @returns Actual value. */
  constructor(
    ...args: [] | [StringPairConstReference] | [OUStringConstReference, OUStringConstReference]
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
    other: StringPairConstReference,
  ): boolean {
    return this.First.equals(other.First) && this.Second.equals(other.Second);
  }
  /** Original generated inequality. @param other - Const value. @returns Different. */ notEquals(
    other: StringPairConstReference,
  ): boolean {
    return !this.equals(other);
  }
  /** Original implicit assignment. @param other - Const value. @returns This owner. */ assign(
    other: StringPairConstReference,
  ): this {
    this.First = other.First;
    this.Second = other.Second;
    return this;
  }
  /** Original implicit memberwise move construction. @param source - Native rvalue. @returns Moved value. */ static move(
    source: StringPair,
  ): StringPair {
    const result = Object.create(StringPair.prototype) as StringPair;
    result.first = OUString.move(source.first);
    result.second = OUString.move(source.second);
    return result;
  }
  /** Original implicit memberwise move assignment. @param source - Native rvalue. @returns This owner. */ moveAssign(
    source: StringPair,
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
  ): StringPairConstReference {
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
