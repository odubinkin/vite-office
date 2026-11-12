/** @fileoverview Original CellAddress.idl and normal generated CPPU value/type contracts; scalar member cells are the existing compound lvalue binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const theType: [R | null] = [null];
/** Original member types in published declaration order. @returns Borrowed native type. */
export function cppu_detail_getUnoType_CellAddress(): Type {
  if (theType[0] === null)
    typelib_static_struct_type_init(
      theType,
      new TextEncoder().encode("com.sun.star.table.CellAddress\0"),
      null,
      3,
      [
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(theType);
}
/** Original published scalar value, without a binary-format or lifetime facade. */
export class CellAddress {
  private readonly members: Record<0 | 4 | 8, [number]> = { 0: [0], 4: [0], 8: [0] };
  /** Original generated default/copy/all-field construction. @param args - Native constructor selection. @returns Value. */
  constructor(
    ...args: [] | [source: Readonly<CellAddress>] | [sheet: number, column: number, row: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 3) {
      this.Sheet = args[0];
      this.Column = args[1];
      this.Row = args[2];
    }
  }
  /** Original short field. @returns Stored Sheet. */
  get Sheet(): number {
    return this.members[0][0];
  }
  /** Original declared-width assignment. @param value - New Sheet. @returns Nothing. */
  set Sheet(value: number) {
    this.members[0][0] = (value << 16) >> 16;
  }
  /** Original long field. @returns Stored Column. */
  get Column(): number {
    return this.members[4][0];
  }
  /** Original declared-width assignment. @param value - New Column. @returns Nothing. */
  set Column(value: number) {
    this.members[4][0] = value | 0;
  }
  /** Original long field. @returns Stored Row. */
  get Row(): number {
    return this.members[8][0];
  }
  /** Original declared-width assignment. @param value - New Row. @returns Nothing. */
  set Row(value: number) {
    this.members[8][0] = value | 0;
  }
  /** Original memberwise copy preserves destination field addresses. @param source - Copied value. @returns Recipient. */
  assign(source: Readonly<CellAddress>): this {
    this.Sheet = source.Sheet;
    this.Column = source.Column;
    this.Row = source.Row;
    return this;
  }
  /** Original generated equality in IDL order. @param other - Compared value. @returns Equality. */
  equals(other: Readonly<CellAddress>): boolean {
    return this.Sheet === other.Sheet && this.Column === other.Column && this.Row === other.Row;
  }
  /** Original generated inequality. @param other - Compared value. @returns Inequality. */
  notEquals(other: Readonly<CellAddress>): boolean {
    return !this.equals(other);
  }
  /** Borrows the existing logical member lvalue; declared offsets are a producer precondition. @param offset - Metadata offset. @returns Stable scalar address. */
  get(offset: number): [number] {
    return this.members[offset as 0 | 4 | 8];
  }
}
