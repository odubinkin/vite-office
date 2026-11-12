/** @fileoverview Property.idl generated value/type contract over existing OUString, Type and typelib owners. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const theType: [R | null] = [null];
/** Original member types in IDL order. @returns The represented native operation result. */
export function cppu_detail_getUnoType_Property(): Type {
  if (theType[0] === null)
    typelib_static_struct_type_init(
      theType,
      new TextEncoder().encode("com.sun.star.beans.Property\0"),
      null,
      4,
      [
        UnoType.get("OUString").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
        UnoType.get("Type").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(theType);
}
/** Native const struct reference: each field is borrowed from its declared actual storage. */
export interface PropertyConstReference {
  readonly Name: OUStringConstReference;
  readonly Handle: number;
  readonly Type: Type;
  readonly Attributes: number;
}
/** Compiler pointer-to-Property field protocol, used by the existing UNO sequence storage. */
interface PropertyAddress {
  get(offset: number): unknown;
}
/** The actual generated property value owns copies of its string and Type. */
export class Property {
  private readonly name = new OUString();
  private readonly handle: [number] = [0];
  private readonly type = new Type();
  private readonly typeSlot = this.type.getAddress();
  private readonly attributes: [number] = [0];
  /** Compiler const lvalue projection of an existing initialized Property. It allocates no UNO value or reference owner and never changes the storage lifetime. @param address - Actual native field addresses. @returns Borrowed declared fields. */
  static unacquired(address: PropertyAddress): PropertyConstReference {
    return {
      /** Original borrowed Name field. @returns Native string view. */ get Name() {
        return OUString.unacquired(address.get(0) as Parameters<typeof OUString.unacquired>[0]);
      },
      /** Original signed32 field. @returns Native scalar. */ get Handle() {
        return (address.get(8) as [number])[0];
      },
      /** Original borrowed Type field. @returns Native const type view. */ get Type() {
        return getTypeFromTypeDescriptionReference(address.get(16) as [R | null]);
      },
      /** Original signed16 field. @returns Native scalar. */ get Attributes() {
        return (address.get(24) as [number])[0];
      },
    };
  }
  /** Binds the represented native owner and its declared inputs. @param args - Original args input. @returns Nothing. */
  constructor(
    ...args:
      | []
      | [source: PropertyConstReference]
      | [name: OUStringConstReference, handle: number, type: Type, attributes: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 4) {
      this.Name = args[0];
      this.Handle = args[1];
      this.Type = args[2];
      this.Attributes = args[3];
    }
  }
  /** Implements the represented native Name operation. @returns The represented native operation result. */
  get Name(): OUString {
    return this.name;
  }
  /** Implements the represented native Name operation. @param value - Declared native value. @returns The represented native operation result. */
  set Name(value: OUStringConstReference) {
    this.name.assign(value);
  }
  /** Implements the represented native Handle operation. @returns The represented native operation result. */
  get Handle(): number {
    return this.handle[0];
  }
  /** Implements the represented native Handle operation. @param value - Declared native value. @returns The represented native operation result. */
  set Handle(value: number) {
    this.handle[0] = value | 0;
  }
  /** Implements the represented native Type operation. @returns The represented native operation result. */
  get Type(): Type {
    return this.type;
  }
  /** Implements the represented native Type operation. @param value - Declared native value. @returns The represented native operation result. */
  set Type(value: Type) {
    this.Type.assign(value);
  }
  /** Implements the represented native Attributes operation. @returns The represented native operation result. */
  get Attributes(): number {
    return this.attributes[0];
  }
  /** Implements the represented native Attributes operation. @param value - Declared native value. @returns The represented native operation result. */
  set Attributes(value: number) {
    this.attributes[0] = (value << 16) >> 16;
  }
  /** Implements the represented native assign operation. @param source - Original source input. @returns The represented native operation result. */
  assign(source: PropertyConstReference): this {
    this.Name = source.Name;
    this.Handle = source.Handle;
    this.Type = source.Type;
    this.Attributes = source.Attributes;
    return this;
  }
  /** Implements the represented native get operation. @param offset - Original offset input. @returns The represented native operation result. */
  get(offset: number): unknown {
    return offset === 0
      ? this.name.getDataAddress()
      : offset === 8
        ? this.handle
        : offset === 16
          ? this.typeSlot
          : this.attributes;
  }
  /** Original member destruction releases the owned type and name. @returns Nothing. */
  dispose(): void {
    this.type.dispose();
    this.name.dispose();
  }
}
