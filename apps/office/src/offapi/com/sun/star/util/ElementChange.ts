/** @fileoverview Original ElementChange compound binding with three owned Any fields. */
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const type: [R | null] = [null];
/** Original generated struct type. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (type[0] === null) {
    const any = UnoType.get("Any").getTypeLibType() as R;
    typelib_static_struct_type_init(
      type,
      new TextEncoder().encode("com.sun.star.util.ElementChange\0"),
      null,
      3,
      [any, any, any],
      null,
    );
  }
  return getTypeFromTypeDescriptionReference(type);
}
/** Original struct with memberwise value ownership. */
export class ElementChange {
  readonly Accessor: Any;
  readonly Element: Any;
  readonly ReplacedElement: Any;
  /** Copies the three original members, defaulting each to void. @param accessor - Original accessor. @param element - Changed element. @param replaced - Original element. @returns Owned change. */
  constructor(accessor?: Any, element?: Any, replaced?: Any) {
    this.Accessor = accessor ? new Any(accessor) : new Any();
    this.Element = element ? new Any(element) : new Any();
    this.ReplacedElement = replaced ? new Any(replaced) : new Any();
  }
  /** Original member address. @param offset - Logical compound offset. @returns Borrowed field. */
  get(offset: number): Any {
    if (offset === 0) return this.Accessor;
    if (offset === 24) return this.Element;
    return this.ReplacedElement;
  }
  /** Releases the original value members. @returns Nothing. */
  dispose(): void {
    this.ReplacedElement.dispose();
    this.Element.dispose();
    this.Accessor.dispose();
  }
}
