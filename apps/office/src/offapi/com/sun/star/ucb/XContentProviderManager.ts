/** @fileoverview Complete original XContentProviderManager.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XContentProvider } from "./XContentProvider";
import type { ContentProviderInfo } from "./ContentProviderInfo";
/** Complete original interface, preserving all direct bases in IDL order. */
export interface XContentProviderManager extends XInterface {
  /** Original provider registration and DuplicateProviderException contract. @param provider - Borrowed provider. @param scheme - Original URL scheme or template. @param replaceExisting - Original replacement flag. @returns Acquired replaced provider. */
  registerContentProvider(
    provider: Reference<XContentProvider>,
    scheme: OUStringConstReference,
    replaceExisting: boolean,
  ): Reference<XContentProvider>;
  /** Original provider deregistration. @param provider - Borrowed provider. @param scheme - Original URL scheme or template. @returns Nothing. */
  deregisterContentProvider(
    provider: Reference<XContentProvider>,
    scheme: OUStringConstReference,
  ): void;
  /** Original complete provider-information sequence. @returns Owned sequence. */
  queryContentProviders(): Sequence<ContentProviderInfo>;
  /** Original active provider lookup. @param identifier - Borrowed content URI. @returns Acquired provider or empty reference. */
  queryContentProvider(identifier: OUStringConstReference): Reference<XContentProvider>;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct bases. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.XContentProviderManager\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XContentProviderManager> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XContentProviderManager = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
