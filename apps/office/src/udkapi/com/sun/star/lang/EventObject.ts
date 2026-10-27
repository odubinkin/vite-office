/** @fileoverview Original EventObject IDL value and cppumaker-normal struct binding over the actual Reference pointer member and shared CPPU compound owner. */
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal generated struct initialization with its sole root-interface member. @returns Borrowed cached type. */
export function cppu_detail_getUnoType_EventObject(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.lang.EventObject\0"),
      null,
      1,
      [UnoType.get("XInterface").getTypeLibType() as R],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated value owns the actual single Source Reference, without an alternate interface/value provider. */
export class EventObject {
  private readonly source = new Reference<XInterface>();
  /** Original default/copy/all-member constructors. @param args - Selected original overload. @returns Event value. */
  constructor(...args: [] | [source: Readonly<EventObject>] | [source: Reference<XInterface>]) {
    if (args.length === 1)
      this.source.assign(
        args[0] instanceof EventObject ? args[0].Source : (args[0] as Reference<XInterface>),
      );
  }
  /** Original stable mutable Reference member. @returns Member owner. */
  get Source(): Reference<XInterface> {
    return this.source;
  }
  /** Original member assignment retains its field identity. @param value - Borrowed source. @returns Nothing. */
  set Source(value: Reference<XInterface>) {
    this.source.assign(value);
  }
  /** Original implicit copy assignment. @param value - Source event. @returns This event. */
  assign(value: Readonly<EventObject>): this {
    this.Source = value.Source;
    return this;
  }
  /** Original generated field equality uses actual interface root identity. @param value - Other event. @returns Equality. */
  equals(value: Readonly<EventObject>): boolean {
    return this.Source.operatorEquals(value.Source);
  }
  /** Original generated inequality. @param value - Other event. @returns Inequality. */
  notEquals(value: Readonly<EventObject>): boolean {
    return !this.equals(value);
  }
  /** Original compound reinterpretation of its sole member at byte0; valid declared metadata offsets are the caller precondition. @param offset - Original member offset. @returns Actual member pointer cell. */
  get(offset: number): [XInterface | null] {
    void offset;
    return this.source.getAddress();
  }
  /** Original actual member destruction at the host value-lifetime boundary. @returns Nothing. */
  dispose(): void {
    this.source.dispose();
  }
}
