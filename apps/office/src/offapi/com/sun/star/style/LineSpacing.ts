/** @fileoverview Original LineSpacing IDL value with the shared real CPPU struct binding, independent of document persistence. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original static type cell. */
const the_type: [R | null] = [null];
/** Original two short members in declaration order. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_LineSpacing(): Type {
  if (the_type[0] === null) {
    const short = UnoType.get("sal_Int16").getTypeLibType() as R;
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.style.LineSpacing\0"),
      null,
      2,
      [short, short],
      null,
    );
  }
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original two-short value; scalar cells are compound member lvalues, not a binary document representation. */
export class LineSpacing {
  private readonly members: Record<0 | 2, [number]> = { 0: [0], 2: [0] };
  /** Original default/copy/member constructors. @param args - Selected form. @returns Value. */
  constructor(...args: [] | [source: Readonly<LineSpacing>] | [mode: number, height: number]) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.Mode = args[0];
      this.Height = args[1];
    }
  }
  /** Original mode. @returns Signed short. */
  get Mode(): number {
    return this.members[0][0];
  }
  /** Original mode assignment. @param value - Mode. @returns Nothing. */
  set Mode(value: number) {
    this.members[0][0] = (value << 16) >> 16;
  }
  /** Original height. @returns Signed short. */
  get Height(): number {
    return this.members[2][0];
  }
  /** Original height assignment. @param value - Height. @returns Nothing. */
  set Height(value: number) {
    this.members[2][0] = (value << 16) >> 16;
  }
  /** Shared real struct member lvalue lookup. @param offset - Metadata member offset. @returns Stable scalar cell. */
  get(offset: number): [number] {
    return this.members[offset as 0 | 2];
  }
  /** Original memberwise assignment. @param source - Source. @returns Recipient. */
  assign(source: Readonly<LineSpacing>): this {
    this.Mode = source.Mode;
    this.Height = source.Height;
    return this;
  }
  /** Original value equality. @param other - Candidate. @returns Equal fields. */
  equals(other: Readonly<LineSpacing>): boolean {
    return this.Mode === other.Mode && this.Height === other.Height;
  }
  /** Original value inequality. @param other - Candidate. @returns Different fields. */
  notEquals(other: Readonly<LineSpacing>): boolean {
    return !this.equals(other);
  }
}
