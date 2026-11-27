/** @fileoverview ODF export of regular Writer text sections and their automatic styles. */
import { encodeBase64 } from "../../../comphelper/source/misc/base64";
import type { XMLTextExportBlock } from "../table/XMLTableExport";
import { exportWritingDirection } from "../style/prhdlfac";
import { encodeStyleName } from "../core/xmluconv";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLIndexSource } from "./XMLIndexTOCContext";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
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
  readonly index?: XMLIndexSource;
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
      return `<text:${section.index.family}${attributes}>${exportIndexSource(section.index)}<text:index-body>${content}</text:index-body></text:${section.index.family}>`;
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

/** Writes one original source boolean when it differs from the ODF default. @param name - Attribute name. @param value - Native option. @param initial - ODF default. @returns Optional attribute. */
function exportIndexBoolean(name: string, value: boolean, initial = false): string {
  return value === initial ? "" : ` text:${name}="${value}"`;
}

/** Writes the pinned exporter's ODF language attributes using the native locale. @param language - Writer language id. @returns ODF language attributes. */
function exportIndexLanguage(language: number): string {
  const tag = new LanguageTag(language);
  try {
    const locale = tag.getLocale(false);
    if (locale.Variant.isEmpty())
      return ` fo:language="${escapeXml(text(locale.Language))}" fo:country="${escapeXml(text(locale.Country))}"`;
    const iso = tag.isIsoODF();
    const languageName = new OUString();
    const script = new OUString();
    const country = new OUString();
    try {
      tag.getIsoLanguageScriptCountry(languageName, script, country);
      let attributes = iso ? "" : ` style:rfc-language-tag="${escapeXml(text(tag.getBcp47()))}"`;
      if (iso || !languageName.isEmpty())
        attributes += ` fo:language="${escapeXml(text(languageName))}"`;
      if (!script.isEmpty()) attributes += ` fo:script="${escapeXml(text(script))}"`;
      if (iso || !country.isEmpty()) attributes += ` fo:country="${escapeXml(text(country))}"`;
      return attributes;
    } finally {
      country.dispose();
      script.dispose();
      languageName.dispose();
    }
  } finally {
    tag.dispose();
  }
}

/** Exports the original source properties, title, templates and paragraph style lists. @param source - Native index source. @returns Index source XML. */
function exportIndexSource(source: XMLIndexSource): string {
  let attributes = "";
  if (source.family === "table-of-content") {
    attributes = ` text:outline-level="${source.outlineLevel}"`;
    attributes += exportIndexBoolean("use-outline-level", source.useOutline, true);
    attributes += exportIndexBoolean("use-index-marks", source.useMarks, true);
    attributes += exportIndexBoolean("use-index-source-styles", source.useStyles);
  } else if (source.family === "user-index") {
    attributes += exportIndexBoolean("use-objects", source.useObjects);
    attributes += exportIndexBoolean("use-graphics", source.useGraphics);
    attributes += exportIndexBoolean("use-index-marks", source.useMarks);
    attributes += exportIndexBoolean("use-tables", source.useTables);
    attributes += exportIndexBoolean("use-floating-frames", source.useFrames);
    attributes += exportIndexBoolean("copy-outline-levels", source.copyOutlineLevels);
    attributes += exportIndexBoolean("use-index-source-styles", source.useStyles);
    attributes += ` text:index-name="${escapeXml(source.indexName)}"`;
  } else {
    if (source.mainEntryStyle)
      attributes += ` text:main-entry-style-name="${escapeXml(encodeStyleName(source.mainEntryStyle))}"`;
    attributes += exportIndexBoolean("ignore-case", source.ignoreCase);
    attributes += exportIndexBoolean("alphabetical-separators", source.separators);
    attributes += exportIndexBoolean("combine-entries", source.combineEntries, true);
    attributes += exportIndexBoolean("combine-entries-with-dash", source.combineWithDash);
    attributes += exportIndexBoolean("use-keys-as-entries", source.useKeysAsEntries);
    attributes += exportIndexBoolean("combine-entries-with-pp", source.combineWithPP, true);
    attributes += exportIndexBoolean("capitalize-entries", source.capitalizeEntries);
    attributes += exportIndexBoolean("comma-separated", source.commaSeparated);
    if (source.sortAlgorithm)
      attributes += ` text:sort-algorithm="${escapeXml(source.sortAlgorithm)}"`;
    if (source.language !== undefined) attributes += exportIndexLanguage(source.language);
  }
  if (source.fromChapter) attributes += ' text:index-scope="chapter"';
  if (!source.relativeTabs) attributes += ' text:relative-tab-stop-position="false"';
  const title = source.title
    ? `<text:index-title-template text:style-name="${escapeXml(encodeStyleName(source.title.styleName))}">${escapeXml(source.title.text)}</text:index-title-template>`
    : "";
  let templates = "";
  for (const template of source.templates) {
    const level =
      source.family === "alphabetical-index"
        ? template.level === 1
          ? "separator"
          : template.level - 1
        : template.level;
    const name = `text:${source.family}-entry-template`;
    templates += `<${name} text:outline-level="${level}" text:style-name="${escapeXml(encodeStyleName(template.styleName ?? ""))}">${template.entries.map(exportIndexEntry).join("")}</${name}>`;
  }
  let styles = "";
  for (const [level, names] of source.sourceStyles) {
    styles += `<text:index-source-styles text:outline-level="${level}">`;
    for (const name of names)
      styles += `<text:index-source-style text:style-name="${escapeXml(encodeStyleName(name))}"/>`;
    styles += "</text:index-source-styles>";
  }
  return `<text:${source.family}-source${attributes}>${title}${templates}${styles}</text:${source.family}-source>`;
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
