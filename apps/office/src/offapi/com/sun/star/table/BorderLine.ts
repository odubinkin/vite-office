/** @fileoverview Original BorderLine IDL value and normal CPPU static struct binding; ordinary scalar cells expose existing compound lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original generated normal static type cell. */
const the_type: [R | null] = [null];
/** Original declared member types and order. @returns Borrowed actual type. */
export function cppu_detail_getUnoType_BorderLine(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.table.BorderLine\0"),
      null,
      4,
      [
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original four fields, with JS GC owning values rather than native binary storage. */
export class BorderLine {
  protected readonly members: Record<0 | 4 | 6 | 8, [number]> = { 0: [0], 4: [0], 6: [0], 8: [0] };
  /** Original default/copy/all-field forms. @param args - Selected native form. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<BorderLine>]
      | [color: number, inner: number, outer: number, distance: number]
  ) {
    if (args.length === 1) {
      const source = args[0];
      this.Color = source.Color;
      this.InnerLineWidth = source.InnerLineWidth;
      this.OuterLineWidth = source.OuterLineWidth;
      this.LineDistance = source.LineDistance;
    } else if (args.length === 4) {
      this.Color = args[0];
      this.InnerLineWidth = args[1];
      this.OuterLineWidth = args[2];
      this.LineDistance = args[3];
    }
  }
  /** Original signed long color. @returns Color. */
  get Color(): number {
    return this.members[0][0];
  }
  /** Original long assignment. @param value - Color. @returns Nothing. */
  set Color(value: number) {
    this.members[0][0] = value | 0;
  }
  /** Original signed short inner width. @returns Inner width. */
  get InnerLineWidth(): number {
    return this.members[4][0];
  }
  /** Original short assignment. @param value - Inner width. @returns Nothing. */
  set InnerLineWidth(value: number) {
    this.members[4][0] = (value << 16) >> 16;
  }
  /** Original signed short outer width. @returns Outer width. */
  get OuterLineWidth(): number {
    return this.members[6][0];
  }
  /** Original short assignment. @param value - Outer width. @returns Nothing. */
  set OuterLineWidth(value: number) {
    this.members[6][0] = (value << 16) >> 16;
  }
  /** Original signed short gap. @returns Gap. */
  get LineDistance(): number {
    return this.members[8][0];
  }
  /** Original short assignment. @param value - Gap. @returns Nothing. */
  set LineDistance(value: number) {
    this.members[8][0] = (value << 16) >> 16;
  }
  /** Actual member lvalues at offsets provided by shared real type metadata, not a persisted byte format. @param offset - Member offset. @returns Stable scalar cell. */
  get(offset: number): [number] {
    return this.members[offset as 0 | 4 | 6 | 8];
  }
  /** Original nonvirtual memberwise copy. @param source - Source. @returns Recipient. */
  assign(source: Readonly<BorderLine>): this {
    this.Color = source.Color;
    this.InnerLineWidth = source.InnerLineWidth;
    this.OuterLineWidth = source.OuterLineWidth;
    this.LineDistance = source.LineDistance;
    return this;
  }
  /** Original equality of the four declared fields. @param other - Candidate. @returns Equal value. */
  equals(other: Readonly<BorderLine>): boolean {
    return (
      this.Color === other.Color &&
      this.InnerLineWidth === other.InnerLineWidth &&
      this.OuterLineWidth === other.OuterLineWidth &&
      this.LineDistance === other.LineDistance
    );
  }
  /** Original nonvirtual base inequality even on a derived value. @param other - Candidate. @returns Different base value. */
  notEquals(other: Readonly<BorderLine>): boolean {
    return !BorderLine.prototype.equals.call(this, other);
  }
}
