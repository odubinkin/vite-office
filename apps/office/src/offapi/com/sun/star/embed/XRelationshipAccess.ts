/** @fileoverview Complete original XRelationshipAccess IDL and cppumaker-normal cached interface binding; no storage component or replacement relationship provider is instantiated. */
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { StringPair } from "../../../../../udkapi/com/sun/star/beans/StringPair";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original complete IDL method contract; actual owners supply IO and declared container-exception behavior. */
export interface XRelationshipAccess extends XInterface {
  /** Original ID presence query. @param id - Original Id tag value. @returns Present. */ hasByID(
    id: OUStringConstReference,
  ): boolean;
  /** Original target getter, empty when its existing entry lacks Target. @param id - ID. @returns Owned string. */ getTargetByID(
    id: OUStringConstReference,
  ): OUString;
  /** Original type getter, empty when its existing entry lacks Type. @param id - ID. @returns Owned string. */ getTypeByID(
    id: OUStringConstReference,
  ): OUString;
  /** Original ordered entry value copy. @param id - ID. @returns Owned actual Sequence. */ getRelationshipByID(
    id: OUStringConstReference,
  ): Sequence<StringPair>;
  /** Original entries with a matching Type. @param type - Type value, including empty. @returns Owned nested Sequence. */ getRelationshipsByType(
    type: OUStringConstReference,
  ): Sequence<Sequence<StringPair>>;
  /** Original all-entry value copy. @returns Owned nested Sequence. */ getAllRelationships(): Sequence<
    Sequence<StringPair>
  >;
  /** Original ID insertion/replacement contract. @param id - ID. @param entry - Borrowed ordered tags. @param replace - Permit replacement. @returns Nothing. */ insertRelationshipByID(
    id: OUStringConstReference,
    entry: Sequence<StringPair>,
    replace: boolean,
  ): void;
  /** Original removal, raising NoSuchElementException for absence. @param id - ID. @returns Nothing. */ removeRelationshipByID(
    id: OUStringConstReference,
  ): void;
  /** Original batch insertion/replacement. @param entries - Borrowed entries containing Id tags. @param replace - Permit replacement. @returns Nothing. */ insertRelationships(
    entries: Sequence<Sequence<StringPair>>,
    replace: boolean,
  ): void;
  /** Original entry removal. @returns Nothing. */ clearRelationships(): void;
}
const the_type: [R | null] = [null];
/** Original normal generated cached interface getter with implicit XInterface root. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.embed.XRelationshipAccess\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated ignored Reference pointer overload. @param reference - Unused declared pointer. @returns Shared type. */
export function getCppuType(reference?: Reference<XRelationshipAccess> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated static API. */
export const XRelationshipAccess = Object.freeze({
  /** Original ignored void-pointer overload. @param unused - Unused pointer. @returns Shared type. */ static_type(
    unused?: unknown,
  ): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
