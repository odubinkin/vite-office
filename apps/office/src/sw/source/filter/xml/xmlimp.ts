/**
 * @fileoverview Reimplements the bounded Writer ODF XML import bridge from pinned LibreOffice `sw/source/filter/xml/xmlimp.cxx`.
 */

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import type { OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import {
  ODF_NAMESPACES,
  type OdfCharacterProperties,
  type OdfParagraphAlignment,
} from "../../../../xmloff/source/text/txtparae";
import {
  importTextParagraphs,
  type OdfStyleDefinition,
} from "../../../../xmloff/source/text/txtparai";
import { SwDoc } from "../../core/doc/doc";

/** Imports styles.xml followed by content.xml into a canonical SwDoc. @param stylesXml - Named styles stream. @param contentXml - Body stream. @param metadata - Caller document identity. @param metaXml - Optional metadata stream. @returns Imported document. */
export function importWriterXml(
  stylesXml: string,
  contentXml: string,
  metadata: OfficeDocument,
  metaXml?: string,
): SwDoc {
  const stylesDocument = parseOdfXml(stylesXml, "document-styles");
  const contentDocument = parseOdfXml(contentXml, "document-content");
  const title = metaXml === undefined ? undefined : importMetaTitle(metaXml);
  const document = new SwDoc(title === undefined ? metadata : { ...metadata, title });
  const namedStyles = collectStyles(stylesDocument);
  applyNamedParagraphStyles(document, namedStyles);
  const allStyles = new Map([...namedStyles, ...collectStyles(contentDocument)]);
  const officeText = contentDocument.getElementsByTagNameNS(ODF_NAMESPACES.office, "text");
  if (officeText.length !== 1) throw new Error("ODF content must contain exactly one office:text.");
  const paragraphs = importTextParagraphs(officeText[0] as Element, allStyles);
  paragraphs.forEach(
    /** Restores one neutral paragraph as a canonical text node. @param paragraph - Imported paragraph. @param index - Body order. @returns Nothing. */
    (paragraph, index) => {
      const node = document.nodes.MakeTextNode(`paragraph-${index + 1}`);
      node.ChgFormatColl(document.GetTextFormatColl(paragraph.style));
      if (paragraph.alignment !== undefined) node.SetParagraphAlignment(paragraph.alignment);
      if (paragraph.runs.length > 0)
        node.ReplaceRange(
          0,
          0,
          paragraph.runs.map(
            /** Executes the enclosing deterministic test or transformation callback. @param run - Callback input. @returns Callback result. */
            (run) => ({ attributes: run.properties, text: run.text }),
          ),
        );
    },
  );
  return document;
}

/** Parses one ODF XML stream with a fixed root. @param xml - Source XML. @param expectedRoot - office root local name. @returns XML document. */
export function parseOdfXml(xml: string, expectedRoot: string): XMLDocument {
  if (/<!DOCTYPE/i.test(xml)) throw new Error("ODF document type declarations are unsupported.");
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (
    document.getElementsByTagName("parsererror").length > 0 ||
    document.documentElement.namespaceURI !== ODF_NAMESPACES.office ||
    document.documentElement.localName !== expectedRoot
  )
    throw new Error(`ODF ${expectedRoot} XML is invalid.`);
  return document;
}

/** Collects supported named or automatic style records. @param document - Parsed ODF stream. @returns Style table. */
function collectStyles(document: XMLDocument): ReadonlyMap<string, OdfStyleDefinition> {
  const styles = new Map<string, OdfStyleDefinition>();
  for (const element of document.getElementsByTagNameNS(ODF_NAMESPACES.style, "style")) {
    const name = requiredAttribute(element, ODF_NAMESPACES.style, "name");
    const family = requiredAttribute(element, ODF_NAMESPACES.style, "family");
    if (family !== "paragraph" && family !== "text")
      throw new Error(`Unsupported ODF style family: ${family}`);
    if (styles.has(name)) throw new Error(`Duplicate ODF style: ${name}`);
    const parentStyleName =
      element.getAttributeNS(ODF_NAMESPACES.style, "parent-style-name") ?? undefined;
    const displayName = element.getAttributeNS(ODF_NAMESPACES.style, "display-name") ?? undefined;
    const paragraphProperties = directChild(element, ODF_NAMESPACES.style, "paragraph-properties");
    const textProperties = directChild(element, ODF_NAMESPACES.style, "text-properties");
    if (family === "paragraph" && textProperties !== undefined)
      throw new Error(`Unsupported text properties on ODF paragraph style: ${name}`);
    if (family === "text" && paragraphProperties !== undefined)
      throw new Error(`Unsupported paragraph properties on ODF text style: ${name}`);
    const alignment =
      paragraphProperties === undefined ? undefined : importAlignment(paragraphProperties);
    const properties =
      textProperties === undefined ? undefined : importCharacterProperties(textProperties);
    styles.set(name, {
      ...(alignment === undefined ? {} : { alignment }),
      ...(displayName === undefined ? {} : { displayName }),
      family,
      ...(parentStyleName === undefined ? {} : { parentStyleName }),
      ...(properties === undefined ? {} : { properties }),
    });
  }
  return styles;
}

/** Applies direct properties of Standard and Heading 1 to SwTextFormatColl objects. @param document - Destination. @param styles - Named styles. @returns Nothing. */
function applyNamedParagraphStyles(
  document: SwDoc,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
): void {
  const standard = styles.get("Standard");
  const heading = styles.get("Heading_20_1");
  if (standard?.family !== "paragraph" || heading?.family !== "paragraph")
    throw new Error("ODF Writer named paragraph styles are missing.");
  if (heading.parentStyleName !== "Standard")
    throw new Error("ODF Heading 1 must derive from Standard.");
  if (standard.displayName !== undefined)
    document.GetDfltTextFormatColl().SetFormatName(standard.displayName);
  if (heading.displayName !== undefined)
    document.GetTextFormatColl("heading-1").SetFormatName(heading.displayName);
  if (standard.alignment !== undefined)
    document
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxAdjustItem(toSvxAdjust(standard.alignment)));
  if (heading.alignment !== undefined)
    document
      .GetTextFormatColl("heading-1")
      .SetFormatAttr(new SvxAdjustItem(toSvxAdjust(heading.alignment)));
}

/** Reads dc:title from meta.xml. @param xml - Metadata stream. @returns Title when present. */
function importMetaTitle(xml: string): string | undefined {
  const document = parseOdfXml(xml, "document-meta");
  const titles = document.getElementsByTagNameNS(ODF_NAMESPACES.dc, "title");
  if (titles.length > 1) throw new Error("ODF metadata contains duplicate titles.");
  const title = titles[0]?.textContent ?? "";
  return title.trim().length === 0 ? undefined : title;
}

/** Reads a required namespaced attribute. @param element - Source. @param namespace - Namespace. @param name - Local name. @returns Value. */
function requiredAttribute(element: Element, namespace: string, name: string): string {
  const value = element.getAttributeNS(namespace, name);
  if (value === null || value.length === 0) throw new Error(`ODF style ${name} is missing.`);
  return value;
}

/** Finds at most one direct child. @param element - Parent. @param namespace - Namespace. @param name - Local name. @returns Child. */
function directChild(element: Element, namespace: string, name: string): Element | undefined {
  const children = [...element.children].filter(
    /** Matches one direct property child. @param child - Candidate element. @returns Whether names match. */
    (child) => child.namespaceURI === namespace && child.localName === name,
  );
  if (children.length > 1) throw new Error(`ODF style has duplicate ${name}.`);
  return children[0];
}

/** Imports one supported fo:text-align. @param element - Paragraph properties. @returns Model alignment when present. */
function importAlignment(element: Element): OdfParagraphAlignment | undefined {
  assertPropertyAttributes(element, [[ODF_NAMESPACES.fo, "text-align"]]);
  const value = element.getAttributeNS(ODF_NAMESPACES.fo, "text-align");
  if (value === null) return undefined;
  if (value === "start" || value === "left") return "left";
  if (value === "end" || value === "right") return "right";
  if (value === "center" || value === "justify") return value;
  throw new Error(`Unsupported ODF paragraph alignment: ${value}`);
}

/** Imports the three supported character properties. @param element - Text properties. @returns Direct properties. */
function importCharacterProperties(element: Element): Partial<OdfCharacterProperties> {
  assertPropertyAttributes(element, [
    [ODF_NAMESPACES.fo, "font-weight"],
    [ODF_NAMESPACES.fo, "font-style"],
    [ODF_NAMESPACES.style, "text-underline-style"],
    [ODF_NAMESPACES.style, "text-underline-width"],
  ]);
  const weight = element.getAttributeNS(ODF_NAMESPACES.fo, "font-weight");
  const posture = element.getAttributeNS(ODF_NAMESPACES.fo, "font-style");
  const underline = element.getAttributeNS(ODF_NAMESPACES.style, "text-underline-style");
  const underlineWidth = element.getAttributeNS(ODF_NAMESPACES.style, "text-underline-width");
  if (weight !== null && weight !== "normal" && weight !== "bold")
    throw new Error(`Unsupported ODF font weight: ${weight}`);
  if (posture !== null && posture !== "normal" && posture !== "italic")
    throw new Error(`Unsupported ODF font style: ${posture}`);
  if (underline !== null && underline !== "none" && underline !== "solid")
    throw new Error(`Unsupported ODF underline style: ${underline}`);
  if (underlineWidth !== null && underlineWidth !== "auto")
    throw new Error(`Unsupported ODF underline width: ${underlineWidth}`);
  return {
    ...(weight === null ? {} : { bold: weight === "bold" }),
    ...(posture === null ? {} : { italic: posture === "italic" }),
    ...(underline === null ? {} : { underline: underline === "solid" }),
  };
}

/** Rejects silently lossy style-property attributes. @param element - Property element. @param allowed - Supported namespace/name pairs. @returns Nothing. */
function assertPropertyAttributes(
  element: Element,
  allowed: readonly (readonly [namespace: string, name: string])[],
): void {
  for (const attribute of element.attributes)
    if (
      !allowed.some(
        /** Matches one supported property attribute. @param entry - Namespace and local name. @returns Whether allowed. */
        (entry) => {
          const [namespace, name] = entry;
          return attribute.namespaceURI === namespace && attribute.localName === name;
        },
      )
    )
      throw new Error(`Unsupported ODF style property: ${attribute.name}`);
}

/** Maps model alignment into SvxAdjust. @param alignment - Model value. @returns Pool enum. */
function toSvxAdjust(alignment: OdfParagraphAlignment): SvxAdjust {
  if (alignment === "left") return SvxAdjust.ParaStart;
  if (alignment === "right") return SvxAdjust.ParaEnd;
  if (alignment === "center") return SvxAdjust.Center;
  return SvxAdjust.Block;
}
