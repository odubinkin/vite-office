/** @fileoverview Original inherited BorderLine2 IDL value and normal CPPU type binding; existing type metadata owns layout, no new allocator. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { BorderLine, cppu_detail_getUnoType_BorderLine as baseType } from "./BorderLine";
/** Original generated normal static type cell. */
const the_type: [R | null] = [null];
/** Original actual base reference and only the two direct member types. @returns Borrowed actual derived type. */
export function cppu_detail_getUnoType_BorderLine2(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.table.BorderLine2\0"),
      baseType().getTypeLibType() as R,
      2,
      [
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_uInt32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original inherited four fields plus signed style and unsigned total width. */
export class BorderLine2 extends BorderLine {
  private readonly direct: Record<12 | 16, [number]> = { 12: [0], 16: [0] };
  /** Original default/copy/all-field forms. Base scalar fields are initialized before direct fields. @param args - Selected native form. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<BorderLine2>]
      | [
          color: number,
          inner: number,
          outer: number,
          distance: number,
          style: number,
          width: number,
        ]
  ) {
    super();
    if (args.length === 1) {
      const source = args[0];
      super.assign(source);
      this.LineStyle = source.LineStyle;
      this.LineWidth = source.LineWidth;
    } else if (args.length === 6) {
      this.Color = args[0];
      this.InnerLineWidth = args[1];
      this.OuterLineWidth = args[2];
      this.LineDistance = args[3];
      this.LineStyle = args[4];
      this.LineWidth = args[5];
    }
  }
  /** Original signed short style. @returns Style. */
  get LineStyle(): number {
    return this.direct[12][0];
  }
  /** Original signed16 assignment. @param value - Style. @returns Nothing. */
  set LineStyle(value: number) {
    this.direct[12][0] = (value << 16) >> 16;
  }
  /** Original unsigned long width. @returns Width. */
  get LineWidth(): number {
    return this.direct[16][0];
  }
  /** Original unsigned32 assignment. @param value - Width. @returns Nothing. */
  set LineWidth(value: number) {
    this.direct[16][0] = value >>> 0;
  }
  /** Original inherited compound lvalues retain the actual base size/alignment from shared type metadata. @param offset - Native member offset. @returns Stable scalar cell. */
  override get(offset: number): [number] {
    if (offset === 12 || offset === 16) return this.direct[offset];
    return super.get(offset);
  }
  /** Original inherited member assignment followed by direct fields. @param source - Actual derived value. @returns Recipient. */
  override assign(source: Readonly<BorderLine2>): this {
    super.assign(source);
    this.LineStyle = source.LineStyle;
    this.LineWidth = source.LineWidth;
    return this;
  }
  /** Original generated equality of base and direct members. @param other - Actual derived value. @returns Equal value. */
  override equals(other: Readonly<BorderLine2>): boolean {
    return (
      super.equals(other) &&
      this.LineStyle === other.LineStyle &&
      this.LineWidth === other.LineWidth
    );
  }
  /** Original nonvirtual generated derived inequality. @param other - Actual derived value. @returns Different value. */
  override notEquals(other: Readonly<BorderLine2>): boolean {
    return !BorderLine2.prototype.equals.call(this, other);
  }
}
