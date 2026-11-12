/** @fileoverview Original CellRangeAddress.idl and normal generated CPPU value/type contracts; scalar member cells are the existing compound lvalue binding. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const theType: [R | null] = [null];
/** Original member types in published declaration order. @returns Borrowed native type. */
export function cppu_detail_getUnoType_CellRangeAddress(): Type {
  if (theType[0] === null)
    typelib_static_struct_type_init(
      theType,
      new TextEncoder().encode("com.sun.star.table.CellRangeAddress\0"),
      null,
      5,
      [
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(theType);
}
/** Original published scalar value, without a binary-format or lifetime facade. */
export class CellRangeAddress {
  private readonly members: Record<0 | 4 | 8 | 12 | 16, [number]> = {
    0: [0],
    4: [0],
    8: [0],
    12: [0],
    16: [0],
  };
  /** Original generated default/copy/all-field construction. @param args - Native constructor selection. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<CellRangeAddress>]
      | [sheet: number, startColumn: number, startRow: number, endColumn: number, endRow: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 5) {
      this.Sheet = args[0];
      this.StartColumn = args[1];
      this.StartRow = args[2];
      this.EndColumn = args[3];
      this.EndRow = args[4];
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
  /** Original long field. @returns Stored StartColumn. */
  get StartColumn(): number {
    return this.members[4][0];
  }
  /** Original declared-width assignment. @param value - New StartColumn. @returns Nothing. */
  set StartColumn(value: number) {
    this.members[4][0] = value | 0;
  }
  /** Original long field. @returns Stored StartRow. */
  get StartRow(): number {
    return this.members[8][0];
  }
  /** Original declared-width assignment. @param value - New StartRow. @returns Nothing. */
  set StartRow(value: number) {
    this.members[8][0] = value | 0;
  }
  /** Original long field. @returns Stored EndColumn. */
  get EndColumn(): number {
    return this.members[12][0];
  }
  /** Original declared-width assignment. @param value - New EndColumn. @returns Nothing. */
  set EndColumn(value: number) {
    this.members[12][0] = value | 0;
  }
  /** Original long field. @returns Stored EndRow. */
  get EndRow(): number {
    return this.members[16][0];
  }
  /** Original declared-width assignment. @param value - New EndRow. @returns Nothing. */
  set EndRow(value: number) {
    this.members[16][0] = value | 0;
  }
  /** Original memberwise copy preserves destination field addresses. @param source - Copied value. @returns Recipient. */
  assign(source: Readonly<CellRangeAddress>): this {
    this.Sheet = source.Sheet;
    this.StartColumn = source.StartColumn;
    this.StartRow = source.StartRow;
    this.EndColumn = source.EndColumn;
    this.EndRow = source.EndRow;
    return this;
  }
  /** Original generated equality in IDL order. @param other - Compared value. @returns Equality. */
  equals(other: Readonly<CellRangeAddress>): boolean {
    return (
      this.Sheet === other.Sheet &&
      this.StartColumn === other.StartColumn &&
      this.StartRow === other.StartRow &&
      this.EndColumn === other.EndColumn &&
      this.EndRow === other.EndRow
    );
  }
  /** Original generated inequality. @param other - Compared value. @returns Inequality. */
  notEquals(other: Readonly<CellRangeAddress>): boolean {
    return !this.equals(other);
  }
  /** Borrows the existing logical member lvalue; declared offsets are a producer precondition. @param offset - Metadata offset. @returns Stable scalar address. */
  get(offset: number): [number] {
    return this.members[offset as 0 | 4 | 8 | 12 | 16];
  }
}
