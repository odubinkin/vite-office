/** @fileoverview Complete original XXPathObject.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XNodeList } from "../dom/XNodeList";
import type { OUString } from "../../../../../../sal/inc/rtl/ustring";
import type { XPathObjectType } from "./XPathObjectType";
/** Original complete declared interface. */
export interface XXPathObject extends XInterface {
  /** Original XXPathObject::getObjectType.  @returns Original result. */
  getObjectType(): XPathObjectType;
  /** Original XXPathObject::getNodeList.  @returns Original result. */
  getNodeList(): Reference<XNodeList>;
  /** Original XXPathObject::getBoolean.  @returns Original result. */
  getBoolean(): boolean;
  /** Original XXPathObject::getByte.  @returns Original result. */
  getByte(): number;
  /** Original XXPathObject::getShort.  @returns Original result. */
  getShort(): number;
  /** Original XXPathObject::getLong.  @returns Original result. */
  getLong(): number;
  /** Original XXPathObject::getHyper.  @returns Original result. */
  getHyper(): bigint;
  /** Original XXPathObject::getFloat.  @returns Original result. */
  getFloat(): number;
  /** Original XXPathObject::getDouble.  @returns Original result. */
  getDouble(): number;
  /** Original XXPathObject::getString.  @returns Original result. */
  getString(): OUString;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.xpath.XXPathObject\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XXPathObject> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XXPathObject = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
