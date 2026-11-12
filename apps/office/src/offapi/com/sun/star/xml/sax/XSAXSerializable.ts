/** @fileoverview Original XSAXSerializable IDL and normal generated CPPUMaker type binding; actual component owners supply the declared methods. */
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XDocumentHandler } from "./XDocumentHandler";
import type { Sequence } from "../../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { StringPair } from "../../../../../../udkapi/com/sun/star/beans/StringPair";
/** Complete original declared interface. */
export interface XSAXSerializable extends XInterface {
  /** Original SAX serialization with namespace additions. @param handler - Handler. @param namespaces - Prefix/URI declarations added to the root. @returns Nothing. */ serialize(
    handler: Reference<XDocumentHandler>,
    namespaces: Sequence<StringPair>,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XSAXSerializable\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XSAXSerializable> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XSAXSerializable = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
