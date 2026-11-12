/** @fileoverview Complete original XXPathAPI.idl declarations and normal CPPUMaker type binding; DOM/parser behavior belongs to actual native component owners. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XNode } from "../dom/XNode";
import type { XNodeList } from "../dom/XNodeList";
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XXPathObject } from "./XXPathObject";
import type { XXPathExtension } from "./XXPathExtension";
/** Original complete declared interface. */
export interface XXPathAPI extends XInterface {
  /** Original XXPathAPI::registerNS. @param prefix - Original borrowed argument. @param url - Original borrowed argument. @returns Original result. */
  registerNS(prefix: OUStringConstReference, url: OUStringConstReference): void;
  /** Original XXPathAPI::unregisterNS. @param prefix - Original borrowed argument. @param url - Original borrowed argument. @returns Original result. */
  unregisterNS(prefix: OUStringConstReference, url: OUStringConstReference): void;
  /** Original XXPathAPI::registerExtension. @param serviceName - Original borrowed argument. @returns Original result. */
  registerExtension(serviceName: OUStringConstReference): void;
  /** Original XXPathAPI::registerExtensionInstance. @param extension - Original borrowed argument. @returns Original result. */
  registerExtensionInstance(extension: Reference<XXPathExtension>): void;
  /** Original XXPathAPI::eval. @param contextNode - Original borrowed argument. @param expr - Original borrowed argument. @returns Original result. */
  eval(contextNode: Reference<XNode>, expr: OUStringConstReference): Reference<XXPathObject>;
  /** Original XXPathAPI::evalNS. @param contextNode - Original borrowed argument. @param expr - Original borrowed argument. @param namespaceNode - Original borrowed argument. @returns Original result. */
  evalNS(
    contextNode: Reference<XNode>,
    expr: OUStringConstReference,
    namespaceNode: Reference<XNode>,
  ): Reference<XXPathObject>;
  /** Original XXPathAPI::selectNodeList. @param contextNode - Original borrowed argument. @param expr - Original borrowed argument. @returns Original result. */
  selectNodeList(contextNode: Reference<XNode>, expr: OUStringConstReference): Reference<XNodeList>;
  /** Original XXPathAPI::selectNodeListNS. @param contextNode - Original borrowed argument. @param expr - Original borrowed argument. @param namespaceNode - Original borrowed argument. @returns Original result. */
  selectNodeListNS(
    contextNode: Reference<XNode>,
    expr: OUStringConstReference,
    namespaceNode: Reference<XNode>,
  ): Reference<XNodeList>;
  /** Original XXPathAPI::selectSingleNode. @param contextNode - Original borrowed argument. @param expr - Original borrowed argument. @returns Original result. */
  selectSingleNode(contextNode: Reference<XNode>, expr: OUStringConstReference): Reference<XNode>;
  /** Original XXPathAPI::selectSingleNodeNS. @param contextNode - Original borrowed argument. @param expr - Original borrowed argument. @param namespaceNode - Original borrowed argument. @returns Original result. */
  selectSingleNodeNS(
    contextNode: Reference<XNode>,
    expr: OUStringConstReference,
    namespaceNode: Reference<XNode>,
  ): Reference<XNode>;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.xpath.XXPathAPI\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XXPathAPI> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XXPathAPI = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
