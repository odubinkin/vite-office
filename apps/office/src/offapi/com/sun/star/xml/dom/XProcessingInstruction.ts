/** @fileoverview Complete original XProcessingInstruction.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import { XNode } from "./XNode";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
/** Original direct base and complete declared methods; no replacement component is provided. */
export interface XProcessingInstruction extends XNode {
  /** Original XProcessingInstruction::getData.  @returns Original string result. */
  getData(): OUString;
  /** Original XProcessingInstruction::getTarget.  @returns Original string result. */
  getTarget(): OUString;
  /** Original XProcessingInstruction::setData. @param data - Original borrowed string input. @returns Original void result. @throws Original raises (DOMException). */
  setData(data: OUStringConstReference): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.dom.XProcessingInstruction\0"),
      1,
      [XNode.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XProcessingInstruction> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XProcessingInstruction = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
