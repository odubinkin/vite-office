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
/** The actual generated property value owns copies of its string and Type. */
export class Property {
  private readonly name = new OUString();
  private readonly handle: [number] = [0];
  private readonly type = new Type();
  private readonly typeSlot: [R | null] = Object.defineProperty([null], 0, {
    /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
    get: () => this.type.getTypeLibType(),
    /** Processes one ordered native value at this boundary. @param value - Declared native value. @returns The represented native operation result. */
    set: (value: R | null) => {
      this.type["_pType"] = value;
    },
  }) as [R | null];
  private readonly attributes: [number] = [0];
  /** Binds the represented native owner and its declared inputs. @param args - Original args input. @returns Nothing. */
  constructor(
    ...args:
      | []
      | [source: Readonly<Property>]
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
  assign(source: Readonly<Property>): this {
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
}
