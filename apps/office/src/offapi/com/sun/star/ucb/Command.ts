/** @fileoverview Original Command.idl value, member defaults and normal CPPUMaker struct metadata over existing RTL/Any owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original generated struct getter, preserving member order and types. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.Command\0"),
      null,
      3,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("Any").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated value with a valid zero default handle; callers set -1 when they have no handle. */
export class Command {
  private readonly name = new OUString();
  private readonly handle: [number] = [0];
  private readonly argument = new Any();
  /** Original default, copy and member constructors. @param args - Original constructor arguments. @returns Actual owned value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<Command>]
      | [name: OUStringConstReference, handle: number, argument: Any]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 3) {
      this.Name = args[0];
      this.Handle = args[1];
      this.Argument = args[2];
    }
  }
  /** Original borrowed string member. @returns Stable owned field. */
  get Name(): OUString {
    return this.name;
  }
  /** Original string assignment. @param value - Borrowed new value. @returns Nothing. */
  set Name(value: OUStringConstReference) {
    this.name.assign(value);
  }
  /** Original signed32 member. @returns Handle. */
  get Handle(): number {
    return this.handle[0];
  }
  /** Original signed32 assignment. @param value - New handle. @returns Nothing. */
  set Handle(value: number) {
    this.handle[0] = value | 0;
  }
  /** Original borrowed Any member. @returns Stable owned field. */
  get Argument(): Any {
    return this.argument;
  }
  /** Original Any copy assignment. @param value - Borrowed new value. @returns Nothing. */
  set Argument(value: Any) {
    this.argument.assign(value);
  }
  /** Original implicit memberwise copy assignment. @param source - Borrowed source. @returns This value. */
  assign(source: Readonly<Command>): this {
    this.Name = source.Name;
    this.Handle = source.Handle;
    this.Argument = source.Argument;
    return this;
  }
  /** Existing logical compound-address lowering for UNO transport. @param offset - Logical LP64 member offset. @returns Existing member address. */
  get(offset: number): unknown {
    return offset === 0 ? this.name.getDataAddress() : offset === 8 ? this.handle : this.argument;
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.argument.dispose();
    this.name.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
