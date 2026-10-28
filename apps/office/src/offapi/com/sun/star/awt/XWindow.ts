/** @fileoverview Original XWindow IDL declarations and cppumaker-normal interface binding; full component, event value and UI implementations are not supplied here. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { Rectangle } from "./Rectangle";
import type { XFocusListener } from "./XFocusListener";
import type { XKeyListener } from "./XKeyListener";
import type { XMouseListener } from "./XMouseListener";
import type { XMouseMotionListener } from "./XMouseMotionListener";
import type { XPaintListener } from "./XPaintListener";
import type { XWindowListener } from "./XWindowListener";
import { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original IDL method declarations; concrete component behavior is supplied by its native owner. */
export interface XWindow extends XComponent {
  /** Original setPosSize contract. @param X - Original declared input. @param Y - Original declared input. @param Width - Original declared input. @param Height - Original declared input. @param Flags - Original declared input. @returns Original declared result. */
  setPosSize(X: number, Y: number, Width: number, Height: number, Flags: number): void;
  /** Original getPosSize contract.  @returns Original declared result. */
  getPosSize(): Rectangle;
  /** Original setVisible contract. @param Visible - Original declared input. @returns Original declared result. */
  setVisible(Visible: boolean): void;
  /** Original setEnable contract. @param Enable - Original declared input. @returns Original declared result. */
  setEnable(Enable: boolean): void;
  /** Original setFocus contract.  @returns Original declared result. */
  setFocus(): void;
  /** Original addWindowListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addWindowListener(xListener: Reference<XWindowListener>): void;
  /** Original removeWindowListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removeWindowListener(xListener: Reference<XWindowListener>): void;
  /** Original addFocusListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addFocusListener(xListener: Reference<XFocusListener>): void;
  /** Original removeFocusListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removeFocusListener(xListener: Reference<XFocusListener>): void;
  /** Original addKeyListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addKeyListener(xListener: Reference<XKeyListener>): void;
  /** Original removeKeyListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removeKeyListener(xListener: Reference<XKeyListener>): void;
  /** Original addMouseListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addMouseListener(xListener: Reference<XMouseListener>): void;
  /** Original removeMouseListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removeMouseListener(xListener: Reference<XMouseListener>): void;
  /** Original addMouseMotionListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addMouseMotionListener(xListener: Reference<XMouseMotionListener>): void;
  /** Original removeMouseMotionListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removeMouseMotionListener(xListener: Reference<XMouseMotionListener>): void;
  /** Original addPaintListener contract. @param xListener - Original declared input. @returns Original declared result. */
  addPaintListener(xListener: Reference<XPaintListener>): void;
  /** Original removePaintListener contract. @param xListener - Original declared input. @returns Original declared result. */
  removePaintListener(xListener: Reference<XPaintListener>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.awt.XWindow\0"),
      1,
      [XComponent.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XWindow> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XWindow = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
