/** @fileoverview Original OpenCommandArgument2.idl value, declared defaults and normal CPPUMaker compound metadata; all managed fields retain their real owners. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Property } from "../../../../../udkapi/com/sun/star/beans/Property";
import { NumberedSortingInfo, cppu_detail_getUnoType as sortingType } from "./NumberedSortingInfo";
import { OpenCommandArgument, cppu_detail_getUnoType as baseType } from "./OpenCommandArgument";
const the_type: [R | null] = [null];
/** Original cached struct type, preserving base and declared member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.OpenCommandArgument2\0"),
      baseType().getTypeLibType() as R,
      1,
      [UnoType.get(["Sequence", sortingType]).getTypeLibType() as R],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete original generated value with stable field owners. */
export class OpenCommandArgument2 extends OpenCommandArgument {
  private readonly fieldSortingInfo: Sequence<NumberedSortingInfo> =
    new (Sequence.specialize<NumberedSortingInfo>(sortingType, 8))();
  /** Original default/copy/all-member constructors in base-first order. @param args - Selected original arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<OpenCommandArgument2>]
      | [
          Mode: number,
          Priority: number,
          Sink: Reference<XInterface>,
          Properties: Sequence<Property>,
          SortingInfo: Sequence<NumberedSortingInfo>,
        ]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1], args[2], args[3]);
    if (args.length === 1) {
      this.SortingInfo = args[0].SortingInfo;
    } else if (args.length === 5) {
      this.SortingInfo = args[4];
    }
  }
  /** Original SortingInfo member. @returns Borrowed stable field owner. */
  get SortingInfo(): Sequence<NumberedSortingInfo> {
    return this.fieldSortingInfo;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set SortingInfo(value: Sequence<NumberedSortingInfo>) {
    this.fieldSortingInfo.assign(value);
  }
  /** Original implicit base/member copy assignment. @param source - Borrowed value. @returns This owner. */
  override assign(source: Readonly<OpenCommandArgument2>): this {
    super.assign(source);
    this.SortingInfo = source.SortingInfo;
    return this;
  }
  /** Original generated field equality in source order. @param other - Other value. @returns Equality. */
  override equals(other: Readonly<OpenCommandArgument2>): boolean {
    return super.equals(other) && this.SortingInfo.operatorEquals(other.SortingInfo);
  }
  /** Original generated inequality. @param other - Other value. @returns Inequality. */
  override notEquals(other: Readonly<OpenCommandArgument2>): boolean {
    return !this.equals(other);
  }
  /** Existing logical compound lvalue lowering, without serialized or physical WASM layout claims. @param offset - Declared logical member offset. @returns Existing field address. */
  override get(offset: number): unknown {
    if (offset === 24) return this.fieldSortingInfo.getAddress();
    return super.get(offset);
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  override dispose(): void {
    this.fieldSortingInfo.dispose();
    super.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
