/** @fileoverview Complete original XDocumentProperties.idl declarations and normal CPPUMaker type binding; document behavior belongs to the actual Sfx/model owners. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString, OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { DateTime } from "../util/DateTime";
import type { Locale } from "../../../../../udkapi/com/sun/star/lang/Locale";
import type { NamedValue } from "../../../../../udkapi/com/sun/star/beans/NamedValue";
import type { PropertyValue } from "../../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { XPropertyContainer } from "../../../../../udkapi/com/sun/star/beans/XPropertyContainer";
import type { XStorage } from "../embed/XStorage";
/** Complete original declared contract and direct base. */
export interface XDocumentProperties extends XInterface {
  /** Original Author getter. @returns Owned declared value. */ getAuthor(): OUString;
  /** Original Author setter. @param value - Borrowed declared value. @returns Nothing. */ setAuthor(
    value: OUStringConstReference,
  ): void;
  /** Original Generator getter. @returns Owned declared value. */ getGenerator(): OUString;
  /** Original Generator setter. @param value - Borrowed declared value. @returns Nothing. */ setGenerator(
    value: OUStringConstReference,
  ): void;
  /** Original CreationDate getter. @returns Owned declared value. */ getCreationDate(): DateTime;
  /** Original CreationDate setter. @param value - Borrowed declared value. @returns Nothing. */ setCreationDate(
    value: Readonly<DateTime>,
  ): void;
  /** Original Title getter. @returns Owned declared value. */ getTitle(): OUString;
  /** Original Title setter. @param value - Borrowed declared value. @returns Nothing. */ setTitle(
    value: OUStringConstReference,
  ): void;
  /** Original Subject getter. @returns Owned declared value. */ getSubject(): OUString;
  /** Original Subject setter. @param value - Borrowed declared value. @returns Nothing. */ setSubject(
    value: OUStringConstReference,
  ): void;
  /** Original Description getter. @returns Owned declared value. */ getDescription(): OUString;
  /** Original Description setter. @param value - Borrowed declared value. @returns Nothing. */ setDescription(
    value: OUStringConstReference,
  ): void;
  /** Original Keywords getter. @returns Owned declared value. */ getKeywords(): Sequence<OUString>;
  /** Original Keywords setter. @param value - Borrowed declared value. @returns Nothing. */ setKeywords(
    value: Readonly<Sequence<OUString>>,
  ): void;
  /** Original Language getter. @returns Owned declared value. */ getLanguage(): Locale;
  /** Original Language setter. @param value - Borrowed declared value. @returns Nothing. */ setLanguage(
    value: Readonly<Locale>,
  ): void;
  /** Original ModifiedBy getter. @returns Owned declared value. */ getModifiedBy(): OUString;
  /** Original ModifiedBy setter. @param value - Borrowed declared value. @returns Nothing. */ setModifiedBy(
    value: OUStringConstReference,
  ): void;
  /** Original ModificationDate getter. @returns Owned declared value. */ getModificationDate(): DateTime;
  /** Original ModificationDate setter. @param value - Borrowed declared value. @returns Nothing. */ setModificationDate(
    value: Readonly<DateTime>,
  ): void;
  /** Original PrintedBy getter. @returns Owned declared value. */ getPrintedBy(): OUString;
  /** Original PrintedBy setter. @param value - Borrowed declared value. @returns Nothing. */ setPrintedBy(
    value: OUStringConstReference,
  ): void;
  /** Original PrintDate getter. @returns Owned declared value. */ getPrintDate(): DateTime;
  /** Original PrintDate setter. @param value - Borrowed declared value. @returns Nothing. */ setPrintDate(
    value: Readonly<DateTime>,
  ): void;
  /** Original TemplateName getter. @returns Owned declared value. */ getTemplateName(): OUString;
  /** Original TemplateName setter. @param value - Borrowed declared value. @returns Nothing. */ setTemplateName(
    value: OUStringConstReference,
  ): void;
  /** Original TemplateURL getter. @returns Owned declared value. */ getTemplateURL(): OUString;
  /** Original TemplateURL setter. @param value - Borrowed declared value. @returns Nothing. */ setTemplateURL(
    value: OUStringConstReference,
  ): void;
  /** Original TemplateDate getter. @returns Owned declared value. */ getTemplateDate(): DateTime;
  /** Original TemplateDate setter. @param value - Borrowed declared value. @returns Nothing. */ setTemplateDate(
    value: Readonly<DateTime>,
  ): void;
  /** Original AutoloadURL getter. @returns Owned declared value. */ getAutoloadURL(): OUString;
  /** Original AutoloadURL setter. @param value - Borrowed declared value. @returns Nothing. */ setAutoloadURL(
    value: OUStringConstReference,
  ): void;
  /** Original AutoloadSecs getter. @returns Owned declared value. */ getAutoloadSecs(): number;
  /** Original AutoloadSecs setter. @param value - Borrowed declared value. @returns Nothing. @throws Original IllegalArgumentException for negative values. */ setAutoloadSecs(
    value: number,
  ): void;
  /** Original DefaultTarget getter. @returns Owned declared value. */ getDefaultTarget(): OUString;
  /** Original DefaultTarget setter. @param value - Borrowed declared value. @returns Nothing. */ setDefaultTarget(
    value: OUStringConstReference,
  ): void;
  /** Original DocumentStatistics getter. @returns Owned declared value. */ getDocumentStatistics(): Sequence<NamedValue>;
  /** Original DocumentStatistics setter. @param value - Borrowed declared value. @returns Nothing. */ setDocumentStatistics(
    value: Readonly<Sequence<NamedValue>>,
  ): void;
  /** Original EditingCycles getter. @returns Owned declared value. */ getEditingCycles(): number;
  /** Original EditingCycles setter. @param value - Borrowed declared value. @returns Nothing. @throws Original IllegalArgumentException for negative values. */ setEditingCycles(
    value: number,
  ): void;
  /** Original EditingDuration getter. @returns Owned declared value. */ getEditingDuration(): number;
  /** Original EditingDuration setter. @param value - Borrowed declared value. @returns Nothing. @throws Original IllegalArgumentException for negative values. */ setEditingDuration(
    value: number,
  ): void;
  /** Original personal-data reset. @param author - Replacement author. @returns Nothing. */ resetUserData(
    author: OUStringConstReference,
  ): void;
  /** Original user-defined property container. @returns Acquired container. */ getUserDefinedProperties(): Reference<XPropertyContainer>;
  /** Original loadFrom/ToStorage entry point. @param storage - Actual package storage. @param medium - Original descriptor sequence. @returns Nothing. @throws Original declared IO, argument and wrapped target exceptions. */ loadFromStorage(
    storage: Reference<XStorage>,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void;
  /** Original loadFrom/ToMedium entry point. @param url - Source URL. @param medium - Original descriptor sequence. @returns Nothing. @throws Original declared IO, argument and wrapped target exceptions. */ loadFromMedium(
    url: OUStringConstReference,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void;
  /** Original storeFrom/ToStorage entry point. @param storage - Actual package storage. @param medium - Original descriptor sequence. @returns Nothing. @throws Original declared IO, argument and wrapped target exceptions. */ storeToStorage(
    storage: Reference<XStorage>,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void;
  /** Original storeFrom/ToMedium entry point. @param url - Source URL. @param medium - Original descriptor sequence. @returns Nothing. @throws Original declared IO, argument and wrapped target exceptions. */ storeToMedium(
    url: OUStringConstReference,
    medium: Readonly<Sequence<PropertyValue>>,
  ): void;
}
const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct base. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.document.XDocumentProperties\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XDocumentProperties> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XDocumentProperties = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
