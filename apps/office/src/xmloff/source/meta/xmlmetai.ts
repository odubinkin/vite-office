/** @fileoverview Loads the ODF metadata DOM and extracts the native generator build identifiers. */

import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XDocumentProperties } from "../../../offapi/com/sun/star/document/XDocumentProperties";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { INetURLObject } from "../../../tools/source/fsys/urlobj.object";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { DocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/DocumentBuilder";
import type { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import {
  parseFastXmlStream,
  type FastXmlParseOptions,
} from "../../../sax/source/fastparser/fastparser";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { ODF_NAMESPACES } from "../core/xmltoken";

/** Implements SvXMLMetaDocumentContext::setBuildId's conversion. @param generator - Original generator text. @returns BuildId, or an empty string when absent. */
export function getBuildIdFromGenerator(generator: string): string {
  let buildId = "";
  const secondProduct = generator.indexOf(" ");
  if (secondProduct !== -1) {
    const slash = generator.indexOf("/", secondProduct);
    if (slash !== -1) {
      const milestone = generator.indexOf("m", slash);
      const prefix = "$Build-";
      const build = milestone === -1 ? -1 : generator.indexOf(prefix, milestone);
      if (build !== -1)
        buildId = `${generator.slice(slash + 1, milestone)}$${generator.slice(build + prefix.length)}`;
    }
  }
  if (buildId === "") {
    if (/^(?:StarOffice [67]|StarSuite [67]|OpenOffice\.org 1)/.test(generator))
      buildId = "645$8687";
    else if (generator.startsWith("NeoOffice/2")) buildId = "680$9134";
  }
  if (generator.includes("LibreOffice_project/")) {
    const version = /^[0-9.]+/.exec(generator.slice(generator.indexOf("/") + 1));
    if (version !== null) buildId += `;${version[0]}`;
  }
  return buildId;
}

/** Loads the bounded ODF metadata stream into the native DOM used by XInitialization. @param xml - Metadata stream. @param receive - Native metadata target. @param options - SAX resource and cancellation controls. @returns Nothing. */
export function importDocumentMetaXml(
  xml: string,
  receive: (document: Reference<XDocument>) => void,
  options: FastXmlParseOptions = {},
): void {
  let rootSeen = false;
  parseFastXmlStream(
    xml,
    {
      /** Validates the metadata document before giving UTF-8 bytes to the native DOM builder. @param tag - Namespace-resolved element. @returns Nothing. */
      open(tag): void {
        if (rootSeen) return;
        rootSeen = true;
        if (tag.uri !== ODF_NAMESPACES.office || tag.local !== "document-meta")
          throw new Error("ODF metadata root is invalid.");
      },
      /** Metadata text is consumed by the actual document properties owner. @returns Nothing. */
      characters(): void {},
      /** Element boundaries are handled by the native DOM builder after validation. @returns Nothing. */
      close(): void {},
    },
    options,
  );
  const bytes = new TextEncoder().encode(xml);
  const stream = new Reference<XInputStream>(
    new MemoryInputStream(
      new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength),
      bytes.length,
    ),
  );
  const context = new Reference<XComponentContext>(getProcessComponentContext().get());
  try {
    const builder = DocumentBuilder.create(context);
    try {
      const document = builder.operatorStar().parse(stream);
      try {
        receive(document);
      } finally {
        document.dispose();
      }
    } finally {
      builder.dispose();
    }
  } finally {
    context.dispose();
    stream.dispose();
  }
}

/** Projects the native metadata consulted by the Writer importer before constructing defaults. @param properties - Actual document properties. @returns Title, locale and source build identifier. */
export function getDocumentMetaImportInfo(properties: XDocumentProperties): {
  title?: string;
  locale?: string;
  buildId: string;
} {
  const title = properties.getTitle();
  const generator = properties.getGenerator();
  const locale = properties.getLanguage();
  const tag = new LanguageTag(locale);
  try {
    const name = text(title).trim();
    const language = text(tag.getBcp47(false));
    return {
      ...(name ? { title: name } : {}),
      ...(language ? { locale: language } : {}),
      buildId: getBuildIdFromGenerator(text(generator)),
    };
  } finally {
    tag.dispose();
    locale.dispose();
    generator.dispose();
    title.dispose();
  }
}

/** Resolves native metadata links when the medium supplies the package's original URL. @param properties - Imported document properties. @param baseUrl - Original package URL. @returns Nothing. */
export function resolveDocumentMetaLinks(properties: XDocumentProperties, baseUrl: string): void {
  const template = properties.getTemplateURL();
  const autoload = properties.getAutoloadURL();
  try {
    if (template.getLength() > 0) {
      const value = unicode(INetURLObject.GetAbsURL(baseUrl, text(template)));
      try {
        properties.setTemplateURL(value);
      } finally {
        value.dispose();
      }
    }
    if (autoload.getLength() > 0) {
      const value = unicode(INetURLObject.GetAbsURL(baseUrl, text(autoload)));
      try {
        properties.setAutoloadURL(value);
      } finally {
        value.dispose();
      }
    }
  } finally {
    autoload.dispose();
    template.dispose();
  }
}
