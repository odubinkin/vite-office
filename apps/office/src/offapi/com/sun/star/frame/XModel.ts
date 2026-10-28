/** @fileoverview Original XModel IDL declarations and cppumaker-normal interface binding; full component, event value and UI implementations are not supplied here. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XController } from "./XController";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../../../udkapi/com/sun/star/beans/PropertyValue";
import { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original IDL method declarations; concrete component behavior is supplied by its native owner. */
export interface XModel extends XComponent {
  /** Original attachResource contract. @param URL - Original declared input. @param Arguments - Original declared input. @returns Original declared result. */
  attachResource(URL: OUStringConstReference, Arguments: Sequence<PropertyValue>): boolean;
  /** Original getURL contract.  @returns Original declared result. */
  getURL(): OUString;
  /** Original getArgs contract.  @returns Original declared result. */
  getArgs(): Sequence<PropertyValue>;
  /** Original connectController contract. @param Controller - Original declared input. @returns Original declared result. */
  connectController(Controller: Reference<XController>): void;
  /** Original disconnectController contract. @param Controller - Original declared input. @returns Original declared result. */
  disconnectController(Controller: Reference<XController>): void;
  /** Original lockControllers contract.  @returns Original declared result. */
  lockControllers(): void;
  /** Original unlockControllers contract.  @returns Original declared result. */
  unlockControllers(): void;
  /** Original hasControllersLocked contract.  @returns Original declared result. */
  hasControllersLocked(): boolean;
  /** Original getCurrentController contract.  @returns Original declared result. */
  getCurrentController(): Reference<XController>;
  /** Original setCurrentController contract. @throws Original com.sun.star.container.NoSuchElementException for an unconnected controller. @param Controller - Original declared input. @returns Original declared result. */
  setCurrentController(Controller: Reference<XController>): void;
  /** Original getCurrentSelection contract.  @returns Original declared result. */
  getCurrentSelection(): Reference<XInterface>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.frame.XModel\0"),
      1,
      [XComponent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XModel> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XModel = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
