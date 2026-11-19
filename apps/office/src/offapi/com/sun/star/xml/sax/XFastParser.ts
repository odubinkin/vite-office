/** @fileoverview Complete original XFastParser.idl methods and normal CPPUMaker static type binding; actual source components supply behavior. */
import type { Sequence } from "../../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
import type { InputSource } from "./InputSource";
import type { Locale } from "../../../../../../udkapi/com/sun/star/lang/Locale";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XEntityResolver } from "./XEntityResolver";
import type { XErrorHandler } from "./XErrorHandler";
import type { XFastDocumentHandler } from "./XFastDocumentHandler";
import type { XFastNamespaceHandler } from "./XFastNamespaceHandler";
import type { XFastTokenHandler } from "./XFastTokenHandler";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { PairStringString } from "../../../../../../udkapi/com/sun/star/beans/Pair";
/** Configures tokens, namespaces and input for fast SAX parsing. */ export interface XFastParser extends XInterface {
  /** Original parseStream contract. @param aInputSource - Original declared argument. @returns Original declared result. */
  parseStream(aInputSource: InputSource): void;
  /** Original setFastDocumentHandler contract. @param Handler - Original declared argument. @returns Original declared result. */
  setFastDocumentHandler(Handler: Reference<XFastDocumentHandler>): void;
  /** Original setTokenHandler contract. @param Handler - Original declared argument. @returns Original declared result. */
  setTokenHandler(Handler: Reference<XFastTokenHandler>): void;
  /** Original registerNamespace contract. @param NamespaceURL - Original declared argument. @param NamespaceToken - Original declared argument. @returns Original declared result. */
  registerNamespace(NamespaceURL: OUStringConstReference, NamespaceToken: number): void;
  /** Original setErrorHandler contract. @param Handler - Original declared argument. @returns Original declared result. */
  setErrorHandler(Handler: Reference<XErrorHandler>): void;
  /** Original setEntityResolver contract. @param Resolver - Original declared argument. @returns Original declared result. */
  setEntityResolver(Resolver: Reference<XEntityResolver>): void;
  /** Original setLocale contract. @param locale - Original declared argument. @returns Original declared result. */
  setLocale(locale: Locale): void;
  /** Original getNamespaceURL contract. @param prefix - Original declared argument. @returns Original declared result. */
  getNamespaceURL(prefix: OUStringConstReference): OUString;
  /** Original setNamespaceHandler contract. @param Handler - Original declared argument. @returns Original declared result. */
  setNamespaceHandler(Handler: Reference<XFastNamespaceHandler>): void;
  /** Original custom entity-name sequence. @param replacements - Actual native pairs. @returns Nothing. */
  setCustomEntityNames(replacements: Sequence<PairStringString>): void;
}
const the_type: [R | null] = [null];
/** Original normal generated getter retains its implicit root or explicit direct base through the existing CPPU factory. @returns Borrowed cached type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.sax.XFastParser\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored declared pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XFastParser> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XFastParser = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored source pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
