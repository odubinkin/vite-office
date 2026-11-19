/** @fileoverview Original PostCommandArgument2.idl native derived string fields and CPPUMaker type/base metadata. */
import { PostCommandArgument, cppu_detail_getUnoType as baseType } from "./PostCommandArgument";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XInputStream } from "../../../../../udkapi/com/sun/star/io/XInputStream";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original cached two-string derived metadata. @returns Borrowed type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.PostCommandArgument2\0"),
      baseType().getTypeLibType() as R,
      2,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated derived value. */
export class PostCommandArgument2 extends PostCommandArgument {
  private mediaType = new OUString();
  private referer = new OUString();
  /** Original default/copy/member construction, base before derived members. @param args - Declared constructor operands. @returns Native value. */
  constructor(
    ...args:
      | []
      | [Readonly<PostCommandArgument2>]
      | [
          Reference<XInputStream>,
          Reference<XInterface>,
          OUStringConstReference,
          OUStringConstReference,
        ]
  ) {
    if (args.length === 0) super();
    else if (args.length === 1) super(args[0]);
    else super(args[0], args[1]);
    if (args.length === 1) {
      this.MediaType = args[0].MediaType;
      this.Referer = args[0].Referer;
    } else if (args.length === 4) {
      this.MediaType = args[2];
      this.Referer = args[3];
    }
  }
  /** Original MediaType member. @returns Borrowed native string. */
  get MediaType(): OUString {
    return this.mediaType;
  }
  /** Original MediaType assignment. @param value - Native string. @returns Nothing. */
  set MediaType(value: OUStringConstReference) {
    this.mediaType.assign(value);
  }
  /** Original Referer member. @returns Borrowed native string. */
  get Referer(): OUString {
    return this.referer;
  }
  /** Original Referer assignment. @param value - Native string. @returns Nothing. */
  set Referer(value: OUStringConstReference) {
    this.referer.assign(value);
  }
  /** Original base-first copy assignment. @param value - Actual source. @returns This owner. */
  override assign(value: Readonly<PostCommandArgument2>): this {
    super.assign(value);
    this.MediaType = value.MediaType;
    this.Referer = value.Referer;
    return this;
  }
  /** Original base-first comparison. @param value - Compared value. @returns Equality. */
  override equals(value: Readonly<PostCommandArgument2>): boolean {
    return (
      super.equals(value) &&
      this.MediaType.equals(value.MediaType) &&
      this.Referer.equals(value.Referer)
    );
  }
  /** Original generated inequality. @param value - Compared value. @returns Inequality. */
  override notEquals(value: Readonly<PostCommandArgument2>): boolean {
    return !this.equals(value);
  }
  /** Original base-first compiler move. @param value - Native rvalue. @returns Moved owner. */
  static override move(value: PostCommandArgument2): PostCommandArgument2 {
    const result = super.move(value) as PostCommandArgument2;
    result.mediaType = OUString.move(value.mediaType);
    result.referer = OUString.move(value.referer);
    return result;
  }
  /** Original base-first move assignment. @param value - Native rvalue. @returns This owner. */
  override moveAssign(value: PostCommandArgument2): this {
    super.moveAssign(value);
    this.mediaType.moveAssign(value.mediaType);
    this.referer.moveAssign(value.referer);
    return this;
  }
  /** Original logical LP64 derived member addresses. @param offset - Declared offset. @returns Actual native field cell. */
  override get(offset: number): unknown {
    return offset === 16
      ? this.mediaType.getDataAddress()
      : offset === 24
        ? this.referer.getDataAddress()
        : super.get(offset);
  }
  /** Original reverse derived/base destruction. @returns Nothing. */
  override dispose(): void {
    this.referer.dispose();
    this.mediaType.dispose();
    super.dispose();
  }
}
/** Original global generated type getter. @returns Cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
