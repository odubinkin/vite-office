/** @fileoverview Original XController IDL declarations and cppumaker-normal interface binding; full component, event value and UI implementations are not supplied here. */
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XFrame } from "./XFrame";
import type { XModel } from "./XModel";
import { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original IDL method declarations; concrete component behavior is supplied by its native owner. */
export interface XController extends XComponent {
  /** Original attachFrame contract. @param Frame - Original declared input. @returns Original declared result. */
  attachFrame(Frame: Reference<XFrame>): void;
  /** Original attachModel contract. @param Model - Original declared input. @returns Original declared result. */
  attachModel(Model: Reference<XModel>): boolean;
  /** Original suspend contract. @param Suspend - Original declared input. @returns Original declared result. */
  suspend(Suspend: boolean): boolean;
  /** Original getViewData contract.  @returns Original declared result. */
  getViewData(): Any;
  /** Original restoreViewData contract. @param Data - Original declared input. @returns Original declared result. */
  restoreViewData(Data: Any): void;
  /** Original getModel contract.  @returns Original declared result. */
  getModel(): Reference<XModel>;
  /** Original getFrame contract.  @returns Original declared result. */
  getFrame(): Reference<XFrame>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.frame.XController\0"),
      1,
      [XComponent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XController> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XController = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
