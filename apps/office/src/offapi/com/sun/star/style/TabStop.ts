/** @fileoverview Original TabStop IDL value and normal generated CPPU struct binding; numeric char fields preserve UTF16 units independently of text locale resolution. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { TabAlign, cppu_detail_getUnoType_TabAlign as alignType } from "./TabAlign";
/** Original normal static type cell. */
const the_type: [R | null] = [null];
/** Original member types in declaration order, sharing actual enum and char type owners. @returns Borrowed native type. */
export function cppu_detail_getUnoType_TabStop(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.style.TabStop\0"),
      null,
      4,
      [
        UnoType.get("sal_Int32").getTypeLibType() as R,
        alignType().getTypeLibType() as R,
        UnoType.get("UnoCharType").getTypeLibType() as R,
        UnoType.get("UnoCharType").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original four-field IDL value. Unlike SvxTabStop, the generated default chars are both zero and do not consult a locale. */
export class TabStop {
  private readonly members: Record<0 | 4 | 8 | 10, [number]> = {
    0: [0],
    4: [TabAlign.LEFT],
    8: [0],
    10: [0],
  };
  /** Original generated default/copy/member constructors. @param args - Selected native form. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<TabStop>]
      | [position: number, alignment: TabAlign, decimal: number, fill: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 4) {
      this.Position = args[0];
      this.Alignment = args[1];
      this.DecimalChar = args[2];
      this.FillChar = args[3];
    }
  }
  /** Original position. @returns Signed32 position. */
  get Position(): number {
    return this.members[0][0];
  }
  /** Original long assignment. @param value - Position. @returns Nothing. */
  set Position(value: number) {
    this.members[0][0] = value | 0;
  }
  /** Original enum. @returns Alignment. */
  get Alignment(): TabAlign {
    return this.members[4][0];
  }
  /** Original enum assignment without an invented valid-enumerator restriction. @param value - Alignment. @returns Nothing. */
  set Alignment(value: TabAlign) {
    this.members[4][0] = value | 0;
  }
  /** Original UTF16 decimal unit. @returns Unsigned16 char. */
  get DecimalChar(): number {
    return this.members[8][0];
  }
  /** Original char assignment. @param value - UTF16 unit. @returns Nothing. */
  set DecimalChar(value: number) {
    this.members[8][0] = value & 0xffff;
  }
  /** Original UTF16 fill unit. @returns Unsigned16 char. */
  get FillChar(): number {
    return this.members[10][0];
  }
  /** Original char assignment. @param value - UTF16 unit. @returns Nothing. */
  set FillChar(value: number) {
    this.members[10][0] = value & 0xffff;
  }
  /** Actual member lvalues for existing shared compound transport, not document binary bytes. @param offset - Shared metadata member offset. @returns Stable scalar cell. */
  get(offset: number): [number] {
    return this.members[offset as 0 | 4 | 8 | 10];
  }
  /** Original memberwise copy assignment. @param source - Source. @returns Recipient. */
  assign(source: Readonly<TabStop>): this {
    this.Position = source.Position;
    this.Alignment = source.Alignment;
    this.DecimalChar = source.DecimalChar;
    this.FillChar = source.FillChar;
    return this;
  }
  /** Original generated comparison. @param other - Candidate. @returns Field equality. */
  equals(other: Readonly<TabStop>): boolean {
    return (
      this.Position === other.Position &&
      this.Alignment === other.Alignment &&
      this.DecimalChar === other.DecimalChar &&
      this.FillChar === other.FillChar
    );
  }
  /** Original generated inequality. @param other - Candidate. @returns Different fields. */
  notEquals(other: Readonly<TabStop>): boolean {
    return !this.equals(other);
  }
}
