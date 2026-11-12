/** @fileoverview Original ContentEvent.idl value, declared defaults and normal CPPUMaker compound metadata; all managed fields retain their real owners. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { XContent } from "./XContent";
import { XContentIdentifier } from "./XContentIdentifier";
import {
  EventObject,
  cppu_detail_getUnoType_EventObject as baseType,
} from "../../../../../udkapi/com/sun/star/lang/EventObject";
const the_type: [R | null] = [null];
/** Original cached struct type, preserving base and declared member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.ContentEvent\0"),
      baseType().getTypeLibType() as R,
      3,
      [
        UnoType.get("sal_Int32").getTypeLibType() as R,
        XContent.static_type().getTypeLibType() as R,
        XContentIdentifier.static_type().getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete original generated value with stable field owners. */
export class ContentEvent extends EventObject {
  private readonly fieldAction: [number] = [0];
  private readonly fieldContent: Reference<XContent> = new Reference<XContent>();
  private readonly fieldId: Reference<XContentIdentifier> = new Reference<XContentIdentifier>();
  /** Original default/copy/all-member constructors in base-first order. @param args - Selected original arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<ContentEvent>]
      | [
          Source: Reference<XInterface>,
          Action: number,
          Content: Reference<XContent>,
          Id: Reference<XContentIdentifier>,
        ]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0]);
    if (args.length === 1) {
      this.Action = args[0].Action;
      this.Content = args[0].Content;
      this.Id = args[0].Id;
    } else if (args.length === 4) {
      this.Action = args[1];
      this.Content = args[2];
      this.Id = args[3];
    }
  }
  /** Original Action member. @returns Declared scalar. */
  get Action(): number {
    return this.fieldAction[0];
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Action(value: number) {
    this.fieldAction[0] = value | 0;
  }
  /** Original Content member. @returns Borrowed stable field owner. */
  get Content(): Reference<XContent> {
    return this.fieldContent;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Content(value: Reference<XContent>) {
    this.fieldContent.assign(value);
  }
  /** Original Id member. @returns Borrowed stable field owner. */
  get Id(): Reference<XContentIdentifier> {
    return this.fieldId;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Id(value: Reference<XContentIdentifier>) {
    this.fieldId.assign(value);
  }
  /** Original implicit base/member copy assignment. @param source - Borrowed value. @returns This owner. */
  override assign(source: Readonly<ContentEvent>): this {
    super.assign(source);
    this.Action = source.Action;
    this.Content = source.Content;
    this.Id = source.Id;
    return this;
  }
  /** Original generated field equality in source order. @param other - Other value. @returns Equality. */
  override equals(other: Readonly<ContentEvent>): boolean {
    return (
      super.equals(other) &&
      this.Action === other.Action &&
      this.Content.operatorEquals(other.Content) &&
      this.Id.operatorEquals(other.Id)
    );
  }
  /** Original generated inequality. @param other - Other value. @returns Inequality. */
  override notEquals(other: Readonly<ContentEvent>): boolean {
    return !this.equals(other);
  }
  /** Original inherited source-address overload. @param offset - Zero field offset. @returns Existing interface pointer cell. */
  override get(offset: 0): [XInterface | null];
  /** Original erased compound overload. @param offset - Logical member offset. @returns Existing member address. */
  override get(offset: number): unknown;
  /** Existing logical compound lvalue lowering, without serialized or physical WASM layout claims. @param offset - Declared logical member offset. @returns Existing field address. */
  override get(offset: number): unknown {
    if (offset === 8) return this.fieldAction;
    if (offset === 16) return this.fieldContent.getAddress();
    if (offset === 24) return this.fieldId.getAddress();
    return super.get(offset);
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  override dispose(): void {
    this.fieldId.dispose();
    this.fieldContent.dispose();
    super.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
