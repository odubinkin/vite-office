/** @fileoverview Original CommandInfo.idl defaults, generated compound value and cached type binding; fields retain actual RTL/UNO owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original initialized compound address. */
interface Address {
  get(offset: number): unknown;
}
/** Original borrowed field projection. */
export interface CommandInfoConstReference {
  readonly Name: OUStringConstReference;
  readonly Handle: number;
  readonly ArgType: Type;
}
const the_type: [R | null] = [null];
/** Original normal cached generated struct type, with source base and member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.CommandInfo\0"),
      null,
      3,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("Type").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated compound value, with source field-copy and lifetime semantics. */
export class CommandInfo {
  /** Compiler field projection borrows initialized addresses without constructing new field owners. @param address - Existing compound address. @returns Borrowed fields. */
  static unacquired(address: Address): CommandInfoConstReference {
    return {
      /** Original Name field. @returns Borrowed declared value. */ get Name() {
        return OUString.unacquired(address.get(0) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original Handle field. @returns Borrowed declared value. */ get Handle() {
        return (address.get(8) as [number])[0];
      },
      /** Original ArgType field. @returns Borrowed declared value. */ get ArgType() {
        return getTypeFromTypeDescriptionReference(address.get(16) as [R | null]);
      },
    };
  }
  private readonly fieldName: OUString = new OUString();
  private readonly fieldHandle: [number] = [0];
  private readonly fieldArgType: Type = new Type();
  /** Original default/copy/all-member constructor overloads. @param args - Declared native arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: CommandInfoConstReference]
      | [Name: OUStringConstReference, Handle: number, ArgType: Type]
  ) {
    if (args.length === 1) CommandInfo.prototype.assign.call(this, args[0]);
    else if (args.length === 3) {
      this.Name = args[0];
      this.Handle = args[1];
      this.ArgType = args[2];
    }
  }
  /** Original Name member. @returns Stable field value or owner. */ get Name(): OUString {
    return this.fieldName;
  }
  /** Original Name assignment. @param value - Borrowed field input. @returns Nothing. */ set Name(
    value: OUStringConstReference,
  ) {
    this.fieldName.assign(value);
  }
  /** Original Handle member. @returns Stable field value or owner. */ get Handle(): number {
    return this.fieldHandle[0];
  }
  /** Original Handle assignment. @param value - Borrowed field input. @returns Nothing. */ set Handle(
    value: number,
  ) {
    this.fieldHandle[0] = value | 0;
  }
  /** Original ArgType member. @returns Stable field value or owner. */ get ArgType(): Type {
    return this.fieldArgType;
  }
  /** Original ArgType assignment. @param value - Borrowed field input. @returns Nothing. */ set ArgType(
    value: Type,
  ) {
    this.fieldArgType.assign(value);
  }
  /** Original memberwise assignment. @param source - Borrowed compound value. @returns This owner. */
  assign(source: CommandInfoConstReference): this {
    this.Name = source.Name;
    this.Handle = source.Handle;
    this.ArgType = source.ArgType;
    return this;
  }
  /** Original generated equality in declared field order. @param other - Compared compound. @returns Equality. */
  equals(other: CommandInfoConstReference): boolean {
    return (
      this.fieldName.equals(other.Name) &&
      this.Handle === other.Handle &&
      this.fieldArgType.equals(other.ArgType)
    );
  }
  /** Original generated inequality. @param other - Compared compound. @returns Inequality. */
  notEquals(other: CommandInfoConstReference): boolean {
    return !CommandInfo.prototype.equals.call(this, other);
  }
  /** Compiler address projection for declared logical member offsets; invalid offsets are outside the source producer contract. @param offset - Declared member offset. @returns Existing field address. */
  get(offset: number): unknown {
    if (offset === 0) return this.fieldName.getDataAddress();
    if (offset === 8) return this.fieldHandle;
    if (offset === 16) return this.fieldArgType.getAddress();
    return this.fieldArgType.getAddress();
  }
  /** Original reverse field and base destruction. @returns Nothing. */
  dispose(): void {
    this.fieldArgType.dispose();
    this.fieldName.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
