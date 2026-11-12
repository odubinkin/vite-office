/** @fileoverview Complete original XDocumentProperties2.idl declarations and normal CPPUMaker type binding; document behavior belongs to the actual Sfx/model owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { XDocumentProperties } from "./XDocumentProperties";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
/** Complete original declared contract and direct base. */
export interface XDocumentProperties2 extends XDocumentProperties {
  /** Original Contributor getter. @returns Owned declared value. */ getContributor(): Sequence<OUString>;
  /** Original Contributor setter. @param value - Borrowed declared value. @returns Nothing. */ setContributor(
    value: Readonly<Sequence<OUString>>,
  ): void;
  /** Original Coverage getter. @returns Owned declared value. */ getCoverage(): OUString;
  /** Original Coverage setter. @param value - Borrowed declared value. @returns Nothing. */ setCoverage(
    value: OUStringConstReference,
  ): void;
  /** Original Identifier getter. @returns Owned declared value. */ getIdentifier(): OUString;
  /** Original Identifier setter. @param value - Borrowed declared value. @returns Nothing. */ setIdentifier(
    value: OUStringConstReference,
  ): void;
  /** Original Publisher getter. @returns Owned declared value. */ getPublisher(): Sequence<OUString>;
  /** Original Publisher setter. @param value - Borrowed declared value. @returns Nothing. */ setPublisher(
    value: Readonly<Sequence<OUString>>,
  ): void;
  /** Original Relation getter. @returns Owned declared value. */ getRelation(): Sequence<OUString>;
  /** Original Relation setter. @param value - Borrowed declared value. @returns Nothing. */ setRelation(
    value: Readonly<Sequence<OUString>>,
  ): void;
  /** Original Rights getter. @returns Owned declared value. */ getRights(): OUString;
  /** Original Rights setter. @param value - Borrowed declared value. @returns Nothing. */ setRights(
    value: OUStringConstReference,
  ): void;
  /** Original Source getter. @returns Owned declared value. */ getSource(): OUString;
  /** Original Source setter. @param value - Borrowed declared value. @returns Nothing. */ setSource(
    value: OUStringConstReference,
  ): void;
  /** Original Type getter. @returns Owned declared value. */ getType(): OUString;
  /** Original Type setter. @param value - Borrowed declared value. @returns Nothing. */ setType(
    value: OUStringConstReference,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct base. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.document.XDocumentProperties2\0"),
      1,
      [XDocumentProperties.static_type().getTypeLibType() as R],
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDocumentProperties2> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDocumentProperties2 = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
