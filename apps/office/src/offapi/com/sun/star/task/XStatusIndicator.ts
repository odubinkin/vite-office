/** @fileoverview Original XStatusIndicator IDL contract and normal generated UNO type binding; concrete progress presentation belongs to component implementations. */
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Complete original five-method progress interface with inherited UNO identity and reference operations. */
export interface XStatusIndicator extends XInterface {
  /** Starts or reactivates a finished indicator. @param text - Initial progress description. @param range - Maximum progress value. @returns Nothing. */
  start(text: OUStringConstReference, range: number): void;
  /** Stops progress; only start can reactivate the indicator. @returns Nothing. */
  end(): void;
  /** Updates an active indicator description. @param text - Progress description. @returns Nothing. */
  setText(text: OUStringConstReference): void;
  /** Updates active progress within the start range. @param value - Progress value. @returns Nothing. */
  setValue(value: number): void;
  /** Clears active progress and description. @returns Nothing. */
  reset(): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.task.XStatusIndicator\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XStatusIndicator> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XStatusIndicator = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
