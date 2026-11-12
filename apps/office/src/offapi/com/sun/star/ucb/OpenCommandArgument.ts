/** @fileoverview Original OpenCommandArgument.idl value, declared defaults and normal CPPUMaker compound metadata; all managed fields retain their real owners. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../../../udkapi/com/sun/star/beans/Property";
const the_type: [R | null] = [null];
/** Original cached struct type, preserving base and declared member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.OpenCommandArgument\0"),
      null,
      4,
      [
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("XInterface").getTypeLibType() as R,
        UnoType.get(["Sequence", propertyType]).getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete original generated value with stable field owners. */
export class OpenCommandArgument {
  private readonly fieldMode: [number] = [0];
  private readonly fieldPriority: [number] = [0];
  private readonly fieldSink: Reference<XInterface> = new Reference<XInterface>();
  private readonly fieldProperties: Sequence<Property> = new (Sequence.specialize<Property>(
    propertyType,
    32,
  ))();
  /** Original default/copy/all-member constructors in base-first order. @param args - Selected original arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<OpenCommandArgument>]
      | [
          Mode: number,
          Priority: number,
          Sink: Reference<XInterface>,
          Properties: Sequence<Property>,
        ]
  ) {
    if (args.length === 1) {
      this.Mode = args[0].Mode;
      this.Priority = args[0].Priority;
      this.Sink = args[0].Sink;
      this.Properties = args[0].Properties;
    } else if (args.length === 4) {
      this.Mode = args[0];
      this.Priority = args[1];
      this.Sink = args[2];
      this.Properties = args[3];
    }
  }
  /** Original Mode member. @returns Declared scalar. */
  get Mode(): number {
    return this.fieldMode[0];
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Mode(value: number) {
    this.fieldMode[0] = value | 0;
  }
  /** Original Priority member. @returns Declared scalar. */
  get Priority(): number {
    return this.fieldPriority[0];
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Priority(value: number) {
    this.fieldPriority[0] = value | 0;
  }
  /** Original Sink member. @returns Borrowed stable field owner. */
  get Sink(): Reference<XInterface> {
    return this.fieldSink;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Sink(value: Reference<XInterface>) {
    this.fieldSink.assign(value);
  }
  /** Original Properties member. @returns Borrowed stable field owner. */
  get Properties(): Sequence<Property> {
    return this.fieldProperties;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Properties(value: Sequence<Property>) {
    this.fieldProperties.assign(value);
  }
  /** Original implicit base/member copy assignment. @param source - Borrowed value. @returns This owner. */
  assign(source: Readonly<OpenCommandArgument>): this {
    this.Mode = source.Mode;
    this.Priority = source.Priority;
    this.Sink = source.Sink;
    this.Properties = source.Properties;
    return this;
  }
  /** Original generated field equality in source order. @param other - Other value. @returns Equality. */
  equals(other: Readonly<OpenCommandArgument>): boolean {
    return (
      this.Mode === other.Mode &&
      this.Priority === other.Priority &&
      this.Sink.operatorEquals(other.Sink) &&
      this.Properties.operatorEquals(other.Properties)
    );
  }
  /** Original generated inequality. @param other - Other value. @returns Inequality. */
  notEquals(other: Readonly<OpenCommandArgument>): boolean {
    return !this.equals(other);
  }
  /** Existing logical compound lvalue lowering, without serialized or physical WASM layout claims. @param offset - Declared logical member offset. @returns Existing field address. */
  get(offset: number): unknown {
    if (offset === 0) return this.fieldMode;
    if (offset === 4) return this.fieldPriority;
    if (offset === 8) return this.fieldSink.getAddress();
    if (offset === 16) return this.fieldProperties.getAddress();
    return this.fieldProperties.getAddress();
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  dispose(): void {
    this.fieldProperties.dispose();
    this.fieldSink.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
