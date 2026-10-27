/** @fileoverview Original XTextCursor IDL contract and cppumaker-normal static interface binding; concrete behavior is supplied by actual component owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XTextRange } from "./XTextRange";

/** Original declared methods and direct base; no component implementation is manufactured. */
export interface XTextCursor extends XTextRange {
  /** Original collapseToStart contract. @returns Original void result. */
  collapseToStart(): void;
  /** Original collapseToEnd contract. @returns Original void result. */
  collapseToEnd(): void;
  /** Original isCollapsed contract. @returns Original boolean result. */
  isCollapsed(): boolean;
  /** Original goLeft contract. @param nCount - Original declared argument. @param bExpand - Original declared argument. @returns Original boolean result. */
  goLeft(nCount: number, bExpand: boolean): boolean;
  /** Original goRight contract. @param nCount - Original declared argument. @param bExpand - Original declared argument. @returns Original boolean result. */
  goRight(nCount: number, bExpand: boolean): boolean;
  /** Original gotoStart contract. @param bExpand - Original declared argument. @returns Original void result. */
  gotoStart(bExpand: boolean): void;
  /** Original gotoEnd contract. @param bExpand - Original declared argument. @returns Original void result. */
  gotoEnd(bExpand: boolean): void;
  /** Original gotoRange contract. @param xRange - Original declared argument. @param bExpand - Original declared argument. @returns Original void result. */
  gotoRange(xRange: Reference<XTextRange>, bExpand: boolean): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.text.XTextCursor\0"),
      1,
      [XTextRange.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XTextCursor> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XTextCursor = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
