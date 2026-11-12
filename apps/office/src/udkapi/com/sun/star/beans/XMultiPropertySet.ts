/** @fileoverview Complete original XMultiPropertySet.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { XPropertySetInfo } from "./XPropertySetInfo";
import type { XPropertiesChangeListener } from "./XPropertiesChangeListener";

import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
/** Complete original IDL declaration and root. */
export interface XMultiPropertySet extends XInterface {
  /** Original descriptor info query. @returns Acquired info. */ getPropertySetInfo(): Reference<XPropertySetInfo>;
  /** Original sorted unique name setter; unknown names are ignored. @param names - Sorted unique names. @param values - Corresponding values. @returns Nothing. */ setPropertyValues(
    names: Sequence<OUString>,
    values: Sequence<Any>,
  ): void;
  /** Original sorted name getter. @param names - Sorted names. @returns Owned values. */ getPropertyValues(
    names: Sequence<OUString>,
  ): Sequence<Any>;
  /** Original registration; concrete implementations may ignore names. @param names - Names. @param listener - Listener. @returns Nothing. */ addPropertiesChangeListener(
    names: Sequence<OUString>,
    listener: Reference<XPropertiesChangeListener>,
  ): void;
  /** Original removal of one registration. @param listener - Listener. @returns Nothing. */ removePropertiesChangeListener(
    listener: Reference<XPropertiesChangeListener>,
  ): void;
  /** Original current-value notification. @param names - Sorted names. @param listener - Target. @returns Nothing. */ firePropertiesChangeEvent(
    names: Sequence<OUString>,
    listener: Reference<XPropertiesChangeListener>,
  ): void;
}

const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct base. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.beans.XMultiPropertySet\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XMultiPropertySet> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XMultiPropertySet = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
