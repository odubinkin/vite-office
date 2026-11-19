/** @fileoverview Original PostCommandArgument.idl native reference fields and CPPUMaker value/type operations. */
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { XInputStream } from "../../../../../udkapi/com/sun/star/io/XInputStream";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original cached two-reference struct metadata. @returns Borrowed type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.PostCommandArgument\0"),
      null,
      2,
      [
        UnoType.get(["Reference", XInputStream.static_type]).getTypeLibType() as R,
        UnoType.get("XInterface").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated base value with actual stable Reference owners. */
export class PostCommandArgument {
  private source = new Reference<XInputStream>();
  private sink = new Reference<XInterface>();
  /** Original default/copy/member construction. @param args - Declared constructor operands. @returns Native value. */
  constructor(
    ...args: [] | [Readonly<PostCommandArgument>] | [Reference<XInputStream>, Reference<XInterface>]
  ) {
    if (args.length === 1) {
      this.Source = args[0].Source;
      this.Sink = args[0].Sink;
    } else if (args.length === 2) {
      this.Source = args[0];
      this.Sink = args[1];
    }
  }
  /** Original Source member. @returns Borrowed stable reference. */
  get Source(): Reference<XInputStream> {
    return this.source;
  }
  /** Original Source assignment. @param value - Borrowed source. @returns Nothing. */
  set Source(value: Reference<XInputStream>) {
    this.source.assign(value);
  }
  /** Original Sink member. @returns Borrowed stable reference. */
  get Sink(): Reference<XInterface> {
    return this.sink;
  }
  /** Original Sink assignment. @param value - Borrowed sink. @returns Nothing. */
  set Sink(value: Reference<XInterface>) {
    this.sink.assign(value);
  }
  /** Original declaration-order assignment. @param value - Actual source. @returns This owner. */
  assign(value: Readonly<PostCommandArgument>): this {
    this.Source = value.Source;
    this.Sink = value.Sink;
    return this;
  }
  /** Original declaration-order equality. @param value - Compared value. @returns Equality. */
  equals(value: Readonly<PostCommandArgument>): boolean {
    return this.Source.operatorEquals(value.Source) && this.Sink.operatorEquals(value.Sink);
  }
  /** Original generated inequality. @param value - Compared value. @returns Inequality. */
  notEquals(value: Readonly<PostCommandArgument>): boolean {
    return !this.equals(value);
  }
  /** Original compiler memberwise move construction. @param value - Native rvalue. @returns Moved owner. */
  static move(value: PostCommandArgument): PostCommandArgument {
    const result = Object.create(this.prototype) as PostCommandArgument;
    result.source = Reference.move(value.source);
    result.sink = Reference.move(value.sink);
    return result;
  }
  /** Original declaration-order move assignment. @param value - Native rvalue. @returns This owner. */
  moveAssign(value: PostCommandArgument): this {
    this.source.moveAssign(value.source);
    this.sink.moveAssign(value.sink);
    return this;
  }
  /** Original logical LP64 field addresses. @param offset - Declared offset. @returns Actual native reference cell. */
  get(offset: number): unknown {
    return offset === 0 ? this.source.getAddress() : this.sink.getAddress();
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.sink.dispose();
    this.source.dispose();
  }
}
/** Original global generated type getter. @returns Cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
