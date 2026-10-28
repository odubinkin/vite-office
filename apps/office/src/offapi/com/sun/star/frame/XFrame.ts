/** @fileoverview Original XFrame IDL declarations and cppumaker-normal interface binding; full component, event value and UI implementations are not supplied here. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XWindow } from "../awt/XWindow";
import type { XController } from "./XController";
import type { XFrameActionListener } from "./XFrameActionListener";
import type { XFramesSupplier } from "./XFramesSupplier";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original IDL method declarations; concrete component behavior is supplied by its native owner. */
export interface XFrame extends XComponent {
  /** Original initialize contract. @param xWindow - Original declared input. @returns Original declared result. */
  initialize(xWindow: Reference<XWindow>): void;
  /** Original getContainerWindow contract.  @returns Original declared result. */
  getContainerWindow(): Reference<XWindow>;
  /** Original setCreator contract. @param Creator - Original declared input. @returns Original declared result. */
  setCreator(Creator: Reference<XFramesSupplier>): void;
  /** Original getCreator contract.  @returns Original declared result. */
  getCreator(): Reference<XFramesSupplier>;
  /** Original getName contract.  @returns Original declared result. */
  getName(): OUString;
  /** Original setName contract. @param aName - Original declared input. @returns Original declared result. */
  setName(aName: OUStringConstReference): void;
  /** Original findFrame contract. @param aTargetFrameName - Original declared input. @param nSearchFlags - Original declared input. @returns Original declared result. */
  findFrame(aTargetFrameName: OUStringConstReference, nSearchFlags: number): Reference<XFrame>;
  /** Original isTop contract.  @returns Original declared result. */
  isTop(): boolean;
  /** Original activate contract.  @returns Original declared result. */
  activate(): void;
  /** Original deactivate contract.  @returns Original declared result. */
  deactivate(): void;
  /** Original isActive contract.  @returns Original declared result. */
  isActive(): boolean;
  /** Original setComponent contract. @param xComponentWindow - Original declared input. @param xController - Original declared input. @returns Original declared result. */
  setComponent(xComponentWindow: Reference<XWindow>, xController: Reference<XController>): boolean;
  /** Original getComponentWindow contract.  @returns Original declared result. */
  getComponentWindow(): Reference<XWindow>;
  /** Original getController contract.  @returns Original declared result. */
  getController(): Reference<XController>;
  /** Original contextChanged contract.  @returns Original declared result. */
  contextChanged(): void;
  /** Original addFrameActionListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addFrameActionListener(xListener: Reference<XFrameActionListener>): void;
  /** Original removeFrameActionListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removeFrameActionListener(xListener: Reference<XFrameActionListener>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.frame.XFrame\0"),
      1,
      [XComponent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFrame> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFrame = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
