/** @fileoverview Complete original XUniversalContentBroker.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import { XContentProvider } from "./XContentProvider";
import { XContentProviderManager } from "./XContentProviderManager";
import { XContentIdentifierFactory } from "./XContentIdentifierFactory";
import { XCommandProcessor2 } from "./XCommandProcessor2";
/** Complete original interface, preserving all direct bases in IDL order. */
export interface XUniversalContentBroker
  extends
    XComponent,
    XContentProvider,
    XContentProviderManager,
    XContentIdentifierFactory,
    XCommandProcessor2 {}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct bases. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.XUniversalContentBroker\0"),
      5,
      [
        XComponent.static_type().getTypeLibType() as R,
        XContentProvider.static_type().getTypeLibType() as R,
        XContentProviderManager.static_type().getTypeLibType() as R,
        XContentIdentifierFactory.static_type().getTypeLibType() as R,
        XCommandProcessor2.static_type().getTypeLibType() as R,
      ],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XUniversalContentBroker> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XUniversalContentBroker = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
