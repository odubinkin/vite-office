/** @fileoverview Consumed SfxItemPropertySetInfo from pinned svl/source/items/itemprop.cxx; immutable metadata is independent of document values. */
import { Property } from "../../../udkapi/com/sun/star/beans/Property";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
/** Native property info reads copied descriptors rather than another property-value store. */
export class SfxItemPropertySetInfo {
  /** Binds the represented native owner and its declared inputs. @param properties - Ordered native property values. @returns Nothing. */
  private readonly properties: readonly Property[];
  /** Copies the native descriptor map at construction. @param properties - Native map entries. @returns Metadata owner. */
  constructor(properties: readonly Property[]) {
    this.properties = properties.map(
      /** Executes this bounded native contract operation. @param property - Native operation input. @returns Native operation result. */ (
        property,
      ) => new Property(property),
    );
  }
  /** Implements the represented native getProperties operation. @returns The represented native operation result. */
  getProperties(): Property[] {
    return this.properties.map(
      /** Processes one ordered native value at this boundary. @param property - Original property input. @returns The represented native operation result. */
      (property) => new Property(property),
    );
  }
  /** Implements the represented native getPropertyByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyByName(name: OUStringConstReference): Property {
    const property = this.properties.find(
      /** Processes one ordered native value at this boundary. @param p - Original p input. @returns The represented native operation result. */
      (p) => text(p.Name) === text(name),
    );
    if (!property) throw new UnknownPropertyException(name, new Reference());
    return new Property(property);
  }
  /** Implements the represented native hasPropertyByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  hasPropertyByName(name: OUStringConstReference): boolean {
    return this.properties.some(
      /** Processes one ordered native value at this boundary. @param p - Original p input. @returns The represented native operation result. */
      (p) => text(p.Name) === text(name),
    );
  }
}

/** Reads native property names without locale processing. @param value - Native string. @returns UTF16 name. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
