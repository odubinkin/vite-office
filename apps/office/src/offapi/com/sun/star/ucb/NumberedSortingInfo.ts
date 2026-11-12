/** @fileoverview Original NumberedSortingInfo.idl value, declared defaults and normal CPPUMaker compound metadata; all managed fields retain their real owners. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original cached struct type, preserving base and declared member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.NumberedSortingInfo\0"),
      null,
      2,
      [UnoType.get("sal_Int32").getTypeLibType() as R, UnoType.get("bool").getTypeLibType() as R],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete original generated value with stable field owners. */
export class NumberedSortingInfo {
  private readonly fieldColumnIndex: [number] = [0];
  private readonly fieldAscending: [boolean] = [false];
  /** Original default/copy/all-member constructors in base-first order. @param args - Selected original arguments. @returns Owned value. */
  constructor(
    ...args:
      [] | [source: Readonly<NumberedSortingInfo>] | [ColumnIndex: number, Ascending: boolean]
  ) {
    if (args.length === 1) {
      this.ColumnIndex = args[0].ColumnIndex;
      this.Ascending = args[0].Ascending;
    } else if (args.length === 2) {
      this.ColumnIndex = args[0];
      this.Ascending = args[1];
    }
  }
  /** Original ColumnIndex member. @returns Declared scalar. */
  get ColumnIndex(): number {
    return this.fieldColumnIndex[0];
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set ColumnIndex(value: number) {
    this.fieldColumnIndex[0] = value | 0;
  }
  /** Original Ascending member. @returns Declared scalar. */
  get Ascending(): boolean {
    return this.fieldAscending[0];
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Ascending(value: boolean) {
    this.fieldAscending[0] = value;
  }
  /** Original implicit base/member copy assignment. @param source - Borrowed value. @returns This owner. */
  assign(source: Readonly<NumberedSortingInfo>): this {
    this.ColumnIndex = source.ColumnIndex;
    this.Ascending = source.Ascending;
    return this;
  }
  /** Original generated field equality in source order. @param other - Other value. @returns Equality. */
  equals(other: Readonly<NumberedSortingInfo>): boolean {
    return this.ColumnIndex === other.ColumnIndex && this.Ascending === other.Ascending;
  }
  /** Original generated inequality. @param other - Other value. @returns Inequality. */
  notEquals(other: Readonly<NumberedSortingInfo>): boolean {
    return !this.equals(other);
  }
  /** Existing logical compound lvalue lowering, without serialized or physical WASM layout claims. @param offset - Declared logical member offset. @returns Existing field address. */
  get(offset: number): unknown {
    if (offset === 0) return this.fieldColumnIndex;
    if (offset === 4) return this.fieldAscending;
    return this.fieldAscending;
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  dispose(): void {}
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
