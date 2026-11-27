/** @fileoverview ODF export of regular Writer text sections and their automatic styles. */
import { encodeBase64 } from "../../../comphelper/source/misc/base64";
import type { XMLTextExportBlock } from "../table/XMLTableExport";
import { exportWritingDirection } from "../style/prhdlfac";
import { escapeXml, exportOdfLength } from "./txtparae";
import type { XMLSectionSource } from "./XMLSectionSourceImportContext";
import type { XMLSectionStyle } from "./XMLSectionStyleContext";

/** Native regular-section properties required by the XML section exporter. */
export interface XMLSectionExportSource {
  readonly name: string;
  readonly condition: string;
  readonly visible: boolean;
  readonly currentlyVisible: boolean;
  readonly protected: boolean;
  readonly protectionKey: Uint8Array;
  readonly source?: XMLSectionSource;
  readonly style: XMLSectionStyle;
  readonly content: readonly XMLTextExportBlock[];
}

/** Emits the direct section frame properties. @param properties - Section style properties. @returns XML attribute list. */
export function exportSectionStyleAttributes(properties: XMLSectionStyle): string {
  const direction =
    properties.writingMode === undefined ? "" : exportWritingDirection(properties.writingMode);
  return [
    properties.marginLeft === undefined
      ? ""
      : ` fo:margin-left="${exportOdfLength(properties.marginLeft)}"`,
    properties.marginRight === undefined
      ? ""
      : ` fo:margin-right="${exportOdfLength(properties.marginRight)}"`,
    properties.background === undefined
      ? ""
      : ` fo:background-color="${escapeXml(properties.background)}"`,
    direction ? ` style:writing-mode="${direction}"` : "",
  ].join("");
}

/** Serializes a regular text section in the Writer ODF 1.3 export. @param section - Original section properties. @param styleName - Assigned automatic style. @param content - Already serialized child blocks. @returns Section XML. */
export function exportRegularSection(
  section: XMLSectionExportSource,
  styleName: string,
  content: string,
): string {
  let attributes = ` text:name="${escapeXml(section.name)}"`;
  if (styleName) attributes += ` text:style-name="${escapeXml(styleName)}"`;
  if (section.condition) {
    attributes += ` text:condition="ooow:${escapeXml(section.condition)}"`;
    if (!section.currentlyVisible) attributes += ' text:is-hidden="true"';
  }
  if (!section.visible) attributes += ` text:display="${section.condition ? "condition" : "none"}"`;
  if (section.protected) attributes += ' text:protected="true"';
  if (section.protectionKey.length) {
    attributes += ` text:protection-key="${encodeBase64(section.protectionKey)}"`;
    if (section.protectionKey.length === 32)
      attributes +=
        ' text:protection-key-digest-algorithm="http://www.w3.org/2000/09/xmldsig#sha256"';
  }
  const source = section.source;
  const sourceAttributes = source
    ? [
        source.url ? ` xlink:href="${escapeXml(source.url)}"` : "",
        source.filter ? ` text:filter-name="${escapeXml(source.filter)}"` : "",
        source.region ? ` text:section-name="${escapeXml(source.region)}"` : "",
      ].join("")
    : "";
  const sourceElement = sourceAttributes ? `<text:section-source${sourceAttributes}/>` : "";
  return `<text:section${attributes}>${sourceElement}${content}</text:section>`;
}
