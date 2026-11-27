/** @fileoverview Serializes the native document metadata DOM with the ordinary ODF version. */
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import type { XDocumentProperties } from "../../../offapi/com/sun/star/document/XDocumentProperties";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ODF_NAMESPACES } from "../core/xmltoken";

/** Exact package metadata generator identifies the existing browser producer. */
export const ODF_META_GENERATOR = "vite-office LibreOffice TypeScript reimplementation";

/** Publishes the package's current ODF document version on its metadata root. @param document - Borrowed native metadata DOM. @returns Nothing. */
export function setDocumentMetaVersion(document: Reference<XDocument>): void {
  const root = document.operatorStar().getDocumentElement();
  const namespace = unicode(ODF_NAMESPACES.office);
  const attribute = unicode("office:version");
  const value = unicode("1.3");
  try {
    root.operatorStar().setAttributeNS(namespace, attribute, value);
  } finally {
    value.dispose();
    attribute.dispose();
    namespace.dispose();
    root.dispose();
  }
}

/** Updates the normal metadata export properties before invoking XSAXSerializable. @param properties - Original mutable document properties. @param document - Native DOM. @param title - Optional shell title. @param locale - Optional current document language. @returns Nothing. */
export function prepareDocumentMetaExport(
  properties: XDocumentProperties,
  document: Reference<XDocument>,
  title?: string,
  locale?: string,
): void {
  const generator = unicode(ODF_META_GENERATOR);
  const outputTitle = title === undefined ? undefined : unicode(title);
  const localeName = locale === undefined ? undefined : unicode(locale);
  try {
    properties.setGenerator(generator);
    if (outputTitle !== undefined) properties.setTitle(outputTitle);
    if (localeName !== undefined) {
      const tag = new LanguageTag(localeName);
      try {
        const value = new Locale(tag.getLocale(false));
        try {
          properties.setLanguage(value);
        } finally {
          value.dispose();
        }
      } finally {
        tag.dispose();
      }
    }
    setDocumentMetaVersion(document);
  } finally {
    localeName?.dispose();
    outputTitle?.dispose();
    generator.dispose();
  }
}
