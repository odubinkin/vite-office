/** @fileoverview ODF export of regular Writer text sections and their automatic styles. */
import { encodeBase64 } from "../../../comphelper/source/misc/base64";
import type { XMLTextExportBlock } from "../table/XMLTableExport";
import { exportWritingDirection } from "../style/prhdlfac";
import { encodeStyleName } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLIndexTOCSource } from "./XMLIndexTOCSourceContext";
import type { XMLIndexEntry } from "./XMLIndexTemplateContext";
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
  readonly index?: XMLIndexTOCSource;
  readonly indexHeader?: boolean;
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
export function exportSection(
  section: XMLSectionExportSource,
  styleName: string,
  content: string,
): string {
  let attributes = ` text:name="${escapeXml(section.name)}"`;
  if (styleName) attributes += ` text:style-name="${escapeXml(styleName)}"`;
  if (section.index || section.indexHeader) {
    if (section.protected) attributes += ' text:protected="true"';
    if (section.index)
      return `<text:table-of-content${attributes}>${exportIndexSource(section.index)}<text:index-body>${content}</text:index-body></text:table-of-content>`;
    return `<text:index-title${attributes}>${content}</text:index-title>`;
  }
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

/** Exports the original source properties, title, templates and paragraph style lists. @param source - Native TOC properties. @returns TOC source XML. */
function exportIndexSource(source: XMLIndexTOCSource): string {
  let attributes = ` text:outline-level="${source.outlineLevel}"`;
  if (!source.useOutline) attributes += ' text:use-outline-level="false"';
  if (!source.useMarks) attributes += ' text:use-index-marks="false"';
  if (source.useStyles) attributes += ' text:use-index-source-styles="true"';
  if (source.fromChapter) attributes += ' text:index-scope="chapter"';
  if (!source.relativeTabs) attributes += ' text:relative-tab-stop-position="false"';
  const title = source.title
    ? `<text:index-title-template text:style-name="${escapeXml(encodeStyleName(source.title.styleName))}">${escapeXml(source.title.text)}</text:index-title-template>`
    : "";
  let templates = "";
  for (const template of source.templates) {
    templates += `<text:table-of-content-entry-template text:outline-level="${template.level}" text:style-name="${escapeXml(encodeStyleName(template.styleName ?? ""))}">${template.entries.map(exportIndexEntry).join("")}</text:table-of-content-entry-template>`;
  }
  let styles = "";
  for (const [level, names] of source.sourceStyles) {
    styles += `<text:index-source-styles text:outline-level="${level}">`;
    for (const name of names)
      styles += `<text:index-source-style text:style-name="${escapeXml(encodeStyleName(name))}"/>`;
    styles += "</text:index-source-styles>";
  }
  return `<text:table-of-content-source${attributes}>${title}${templates}${styles}</text:table-of-content-source>`;
}

/** Writes one native TOC entry template token. @param entry - Field properties. @returns Field XML. */
function exportIndexEntry(entry: XMLIndexEntry): string {
  const name = `text:index-entry-${entry.kind}`;
  let attributes = entry.styleName
    ? ` text:style-name="${escapeXml(encodeStyleName(entry.styleName))}"`
    : "";
  if (entry.kind === "span")
    return `<${name}${attributes}>${escapeXml(entry.text ?? "")}</${name}>`;
  if (entry.kind === "chapter") {
    if (entry.display) attributes += ` text:display="${escapeXml(entry.display)}"`;
    if (entry.chapterLevel !== undefined)
      attributes += ` text:outline-level="${entry.chapterLevel}"`;
  }
  if (entry.kind === "tab-stop") {
    attributes += ` style:type="${entry.tabRight ? "right" : "left"}"`;
    if (!entry.tabRight && entry.tabPosition !== undefined)
      attributes += ` style:position="${Converter.convertMeasureToXML(Math.max(0, entry.tabPosition), "mm100")}"`;
    if (entry.tabFill) attributes += ` style:leader-char="${escapeXml(entry.tabFill)}"`;
    if (entry.withTab === false) attributes += ' style:with-tab="false"';
  }
  return `<${name}${attributes}/>`;
}
