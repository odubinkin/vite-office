/** @fileoverview Original awt Size IDL value and normal CPPU struct type binding;ordinary scalar cells reuse existing Any compound access. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original generated static type cell. */ const the_type: [R | null] = [null];
/** Original two signed-long members in declared order. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_Size(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.awt.Size\0"),
      null,
      2,
      [
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Actual generated Size value;no binary serialization or separate allocator. */
export class Size {
  private readonly members: Record<0 | 4, [number]> = { 0: [0], 4: [0] };
  /** Original default,copy and all-field constructors. @param args - Selected native form. @returns Value. */
  constructor(...args: [] | [source: Readonly<Size>] | [width: number, height: number]) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.Width = args[0];
      this.Height = args[1];
    }
  }
  /** Original signed32 width. @returns Width. */ get Width(): number {
    return this.members[0][0];
  }
  /** Original signed32 assignment. @param value - Width. @returns Nothing. */ set Width(
    value: number,
  ) {
    this.members[0][0] = value | 0;
  }
  /** Original signed32 height. @returns Height. */ get Height(): number {
    return this.members[4][0];
  }
  /** Original signed32 assignment. @param value - Height. @returns Nothing. */ set Height(
    value: number,
  ) {
    this.members[4][0] = value | 0;
  }
  /** Member cells addressed by existing compound metadata. @param offset - Real member offset. @returns Borrowed scalar cell. */ get(
    offset: number,
  ): [number] {
    return this.members[offset as 0 | 4];
  }
  /** Original generated memberwise assignment. @param source - Actual source. @returns Recipient. */ assign(
    source: Readonly<Size>,
  ): this {
    this.Width = source.Width;
    this.Height = source.Height;
    return this;
  }
  /** Original generated equality. @param other - Actual candidate. @returns Equal fields. */ equals(
    other: Readonly<Size>,
  ): boolean {
    return this.Width === other.Width && this.Height === other.Height;
  }
  /** Original generated nonvirtual inequality. @param other - Candidate. @returns Different fields. */ notEquals(
    other: Readonly<Size>,
  ): boolean {
    return !Size.prototype.equals.call(this, other);
  }
}
