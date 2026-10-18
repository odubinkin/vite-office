/** @fileoverview Original FontHeight IDL value and normal cppumaker static type binding over existing CPPU. */
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
/** Original normal static type cell; no instance registry or native allocation manager. */
const the_type: [R | null] = [null];
/** Original normal struct getter and actual member types in IDL order. @returns Borrowed actual type. */
export function cppu_detail_getUnoType_FontHeight(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.frame.status.FontHeight\0"),
      null,
      3,
      [
        UnoType.get("float").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("float").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Three original primitive members; ordinary scalar cells only adapt the existing Any compound lvalue contract. No custom heap or allocator. */
export class FontHeight {
  private readonly members: Record<0 | 4 | 8, [number]> = { 0: [0], 4: [0], 8: [0] };
  /** Original default, copy and field-value forms. @param args - Original selected form. @returns Struct value. */
  constructor(
    ...args: [] | [source: Readonly<FontHeight>] | [height: number, prop: number, diff: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 3) {
      this.Height = args[0];
      this.Prop = args[1];
      this.Diff = args[2];
    }
  }
  /** Original float Height. @returns Height. */
  public get Height(): number {
    return this.members[0][0];
  }
  /** Original float assignment. @param value - Height. @returns Nothing. */
  public set Height(value: number) {
    this.members[0][0] = Math.fround(value);
  }
  /** Original signed16 Prop. @returns Property. */
  public get Prop(): number {
    return this.members[4][0];
  }
  /** Original signed16 assignment. @param value - Property. @returns Nothing. */
  public set Prop(value: number) {
    this.members[4][0] = (value << 16) >> 16;
  }
  /** Original float Diff. @returns Difference. */
  public get Diff(): number {
    return this.members[8][0];
  }
  /** Original float assignment. @param value - Difference. @returns Nothing. */
  public set Diff(value: number) {
    this.members[8][0] = Math.fround(value);
  }
  /** Stable live primitive lvalues for the existing compound transport, not a byte buffer or binary data format. Valid offsets come from the real shared type description. @param offset - Original member offset. @returns Actual scalar cell. */
  public get(offset: number): [number] {
    return this.members[offset as 0 | 4 | 8];
  }
  /** Original implicit memberwise copy assignment. @param source - Actual source value. @returns Recipient. */
  public assign(source: Readonly<FontHeight>): this {
    this.Height = source.Height;
    this.Prop = source.Prop;
    this.Diff = source.Diff;
    return this;
  }
  /** Original generated equality in field declaration order. @param other - Actual value. @returns Equality. */
  public equals(other: Readonly<FontHeight>): boolean {
    return this.Height === other.Height && this.Prop === other.Prop && this.Diff === other.Diff;
  }
  /** Original generated inequality. @param other - Actual value. @returns Inequality. */
  public notEquals(other: Readonly<FontHeight>): boolean {
    return !this.equals(other);
  }
}
