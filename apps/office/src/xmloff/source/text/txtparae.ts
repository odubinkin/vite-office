/**
 * @fileoverview Reimplements the bounded ODF text paragraph export boundary from pinned LibreOffice `xmloff/source/text/txtparae.cxx`.
 */
import { exportRedlineMarker, type XMLRedlineExportMarker } from "./XMLRedlineExport";
import { exportIndexMark, type XMLIndexMarkExportMarker } from "./XMLIndexMarkExport";
import {
  exportAnnotation,
  exportCountField,
  exportDateTimeField,
  exportDocInfoField,
  exportPageNumberField,
  exportChapterField,
  exportSequenceField,
  exportVariableField,
  exportPlaceholderField,
  exportDropDownField,
  exportHiddenTextField,
  exportHiddenParagraphField,
  exportReferenceField,
  type XMLAnnotationExportMarker,
  type XMLCountExportMarker,
  type XMLDateTimeExportMarker,
  type XMLDocInfoExportMarker,
  type XMLPageNumberExportMarker,
  type XMLChapterExportMarker,
  type XMLSequenceExportMarker,
  type XMLVariableExportMarker,
  type XMLPlaceholderExportMarker,
  type XMLDropDownExportMarker,
  type XMLHiddenTextExportMarker,
  type XMLHiddenParagraphExportMarker,
  type XMLReferenceFieldExportMarker,
} from "./txtflde";
import type { XMLTextFrameExportSource } from "./XMLTextFrameExport";
import {
  exportCharacterPropertyElement,
  exportParagraphAttributes,
  exportParagraphPropertyChildren,
  paragraphPropertiesKey,
  parseParagraphPropertiesKey,
} from "./txtparae-properties";
import { encodeStyleName, escapeXml, exportOdfLength } from "../core/xmluconv";
import type { OdfParagraphAlignment } from "../style/adjushdl";
import type { SvXMLGraphicHelper } from "../core/xmlgrhlp";
import { SvxXMLNumRuleExport, type XMLListLevelExport } from "../style/xmlnume";
import { exportRubyStyle } from "./txtprhdl";
import type { RubyAdjust } from "../../../offapi/com/sun/star/text/RubyAdjust";
import { exportTableBlocks, type XMLTextExportBlock } from "../table/XMLTableExport";
import type {
  FontFaceNameResolver,
  OdfCharacterProperties,
  OdfParagraphProperties,
} from "./txtparae.types";
import { XMLTextNumRuleInfo } from "./XMLTextNumRuleInfo";
export { ODF_NAMESPACES } from "../core/xmltoken";
export { escapeXml, exportOdfLength } from "../core/xmluconv";
export {
  exportCharacterAttributes,
  exportCharacterPropertyElement,
  exportParagraphAttributes,
  exportParagraphPropertyChildren,
} from "./txtparae-properties";

export type { OdfCharacterProperties, OdfParagraphProperties, OdfTabStop } from "./txtparae.types";

/** Hyperlink metadata supported by the bounded text importer and exporter. */
export interface OdfHyperlink {
  readonly name?: string;
  readonly styleName?: string;
  readonly targetFrame?: string;
  readonly url: string;
  readonly visitedStyleName?: string;
}

/** One model-owned text fragment exposed to the streaming exporter. */
export interface XMLTextRunSource {
  readonly characterStyles?: readonly string[];
  readonly hyperlink?: OdfHyperlink;
  readonly properties: OdfCharacterProperties;
  readonly text: string;
}

/** Writer paragraph styles supported by the bounded filter. */
export type XMLParagraphStyle = string;
/** Fixed fields in the structured automatic-style key. */
type StyleKey = [string, OdfParagraphAlignment | "", string, string, string, string, string];

/** Paragraph alignment values shared with the Writer model. */
export type { OdfParagraphAlignment } from "../style/adjushdl";

/** Marker family stored by one ODF list level style. */
export type OdfListLevelKind = "bullet" | "numbered";

/** Exported independent positioning properties of one ODF list level, in native UNO MM100. */
export interface OdfListLevelLayout {
  readonly absLSpace?: number;
  readonly firstLineOffset?: number;
  readonly charTextDistance?: number;
  readonly positionAndSpaceMode?: "label-width-and-position" | "label-alignment";
  readonly firstLineIndent?: number;
  readonly indentAt?: number;
  readonly labelFollowedBy?: "listtab" | "nothing" | "space";
  readonly listTabPosition?: number;
}

/** Neutral projection of one document-owned Writer numbering rule. */
export interface XMLTextListRuleSource {
  /** Per-level native property records in zero-based Writer order. */
  readonly levels: readonly XMLListLevelExport[];
  /** Canonical SwNumRule name. */
  readonly name: string;
  readonly isAutomatic?: boolean;
}

/** Neutral list attributes applied to one paragraph. */
export interface XMLTextListSource {
  /** Native NumberingIsNumber; false paragraphs continue an open item or start a header. */
  readonly counted?: boolean;
  /** Effective Writer list identity. */
  readonly listId: string;
  /** Zero-based Writer list level. */
  readonly level: number;
  /** Document numbering rule. */
  readonly rule: XMLTextListRuleSource;
  /** Native ParaIsNumberingRestart, independent of a direct start value. */
  readonly restart?: boolean;
  /** Native NumberingStartValue; absence remains distinct from the format start. */
  readonly startValue?: number;
}

/** Native ruby portion over a paragraph range. */
export interface XMLRubyRange {
  readonly start: number;
  readonly end: number;
  readonly reading: string;
  readonly readingStyleName: string;
  readonly adjustment: RubyAdjust;
  readonly position: number;
}

/** Returns the native automatic ruby style key. @param ruby - Original position and adjustment. @returns Key. */
function rubyStyleKey(ruby: XMLRubyRange): string {
  return `${ruby.adjustment}:${ruby.position}`;
}

/** Narrow live view of one canonical Writer paragraph. */
export interface XMLTextParagraphSource {
  readonly ruby?: readonly XMLRubyRange[];
  readonly alignment?: OdfParagraphAlignment;
  readonly outlineLevel?: number;
  readonly outlineListHeader?: boolean;
  readonly outlineRestart?: boolean;
  readonly outlineStartValue?: number;
  readonly inheritedProperties?: OdfCharacterProperties;
  /** Direct text-left margin in twips. */
  readonly leftMargin?: number;
  readonly list?: XMLTextListSource;
  readonly listGeometryWins?: boolean;
  /** Direct numbering item; common style ownership remains on the original named parent. */
  readonly directListRule?: string;
  /** Zero-width Writer marks and imported pagination hints in UTF-16 coordinates. */
  readonly markers?: readonly XMLTextParagraphMarker[];
  readonly paragraphProperties?: OdfParagraphProperties;
  readonly markerProperties?: Partial<OdfCharacterProperties>;
  readonly properties?: Partial<OdfCharacterProperties>;
  readonly runs: readonly XMLTextRunSource[];
  readonly style: XMLParagraphStyle;
  readonly styleName?: string;
}

/** Native zero-width paragraph contents in original text coordinates. */
export type XMLTextParagraphMarker =
  | Readonly<{
      kind: "bookmark" | "bookmark-start" | "bookmark-end" | "soft-page-break";
      name?: string;
      offset: number;
      hidden?: boolean;
      condition?: string;
      collapsedAroundFrame?: boolean;
    }>
  | XMLIndexMarkExportMarker
  | Readonly<{
      kind: "reference-mark" | "reference-mark-start" | "reference-mark-end";
      name: string;
      offset: number;
    }>
  | XMLAnnotationExportMarker
  | XMLReferenceFieldExportMarker
  | XMLDocInfoExportMarker
  | XMLPageNumberExportMarker
  | XMLChapterExportMarker
  | XMLSequenceExportMarker
  | XMLVariableExportMarker
  | XMLPlaceholderExportMarker
  | XMLDropDownExportMarker
  | XMLHiddenTextExportMarker
  | XMLHiddenParagraphExportMarker
  | XMLCountExportMarker
  | XMLDateTimeExportMarker
  | XMLRedlineExportMarker
  | Readonly<{ kind: "frame"; frame: XMLTextFrameExportSource; offset: number }>;

/** Reiterable model-facing source; definitions are collected before body references. */
export interface XMLTextExportSource {
  exportNumberStyle?(key: number): string | undefined;
  readonly commonCharacterStyleNames?: readonly string[];
  paragraphs(): Iterable<XMLTextParagraphSource>;
  blocks?(): Iterable<XMLTextExportBlock>;
  sections?(): Iterable<Iterable<XMLTextExportBlock>>;
  readonly redlineStyles?: readonly XMLRedlineStyleSource[];
}

/** Previous character formatting used by a specific tracked change. */
export interface XMLRedlineStyleSource {
  readonly key: string;
  readonly parent: string;
  readonly properties?: Partial<OdfCharacterProperties>;
}

/** Serialized automatic styles and paragraph body fragment. */
export interface OdfTextExport {
  readonly automaticStyles: string;
  readonly body: string;
  readonly namedStyles: string;
  readonly sections?: readonly string[];
  readonly redlineStyleNames: ReadonlyMap<string, string>;
}

/** Bounded xmloff export context owning one complete text export pass. */
export class XMLTextParagraphExport {
  /** Captures model source and operation ports. @param source - Model source. @param isCancelled - Cancellation probe. @param fontFaceName - Font registration. @param existingFontFaceName - Existing face lookup for numbering export. @param graphicHelper - Package graphic service. @returns Nothing. */
  public constructor(
    private readonly source: XMLTextExportSource,
    private readonly isCancelled: () => boolean,
    private readonly fontFaceName?: FontFaceNameResolver,
    private readonly existingFontFaceName?: (familyName: string) => string | undefined,
    private readonly graphicHelper?: SvXMLGraphicHelper,
  ) {}

  /** Exports automatic styles and text elements under this context's ownership. @returns XML fragments. */
  public Export(): OdfTextExport {
    const { fontFaceName, isCancelled, source } = this;
    const paragraphStyleNames = new Map<string, string>();
    const characterStyleNames = new Map<string, string>();
    const reservedCharacterStyleNames = new Set(source.commonCharacterStyleNames);
    const characterParents = new Map<string, string>();
    const redlineStyleNames = new Map<string, string>();
    let nextCharacterStyle = 0;
    /** Interns direct text properties in the text auto-style family. @param properties - Direct text properties. @param parent - Named parent style. @returns ODF name. */
    function addTextStyle(properties: Partial<OdfCharacterProperties>, parent = ""): string {
      const propertyKey = characterPropertiesKey(properties);
      const key = parent ? `${parent}\0${propertyKey}` : propertyKey;
      const existing = characterStyleNames.get(key);
      if (existing !== undefined) return existing;
      let name: string;
      do name = `T${++nextCharacterStyle}`;
      while (reservedCharacterStyleNames.has(name));
      characterStyleNames.set(key, name);
      if (parent) characterParents.set(name, parent);
      return name;
    }
    const listRules = new Map<string, XMLTextListRuleSource>();
    const rubyStyleNames = new Map<string, string>();
    const rubyStyles: string[] = [];
    const numRuleExport = new SvxXMLNumRuleExport(
      escapeXml,
      this.existingFontFaceName,
      this.graphicHelper,
    );
    for (const paragraph of paragraphsForAutoStyles(source.paragraphs())) {
      if (isCancelled()) throw new Error("ODT operation was cancelled.");
      for (const ruby of paragraph.ruby ?? []) {
        const key = rubyStyleKey(ruby);
        if (rubyStyleNames.has(key)) continue;
        const name = `Ru${rubyStyleNames.size + 1}`;
        rubyStyleNames.set(key, name);
        rubyStyles.push(exportRubyStyle(name, ruby.adjustment, ruby.position));
      }
      if (paragraph.list !== undefined) {
        const list = paragraph.list;
        assertList(list);
        const existing = listRules.get(list.rule.name);
        if (
          existing !== undefined &&
          existing.levels.some(
            /** Compares complete serialized level properties with native omission defaults. @param properties - Existing level. @param index - Level. @returns Whether conflicting. */
            (properties, index) =>
              numRuleExport.exportLevelStyle(index, properties) !==
              numRuleExport.exportLevelStyle(index, list.rule.levels[index] as XMLListLevelExport),
          )
        )
          throw new Error(`Conflicting ODF list rule: ${list.rule.name}`);
        listRules.set(list.rule.name, list.rule);
      }
      if (
        paragraph.alignment !== undefined ||
        paragraph.leftMargin !== undefined ||
        paragraph.paragraphProperties !== undefined ||
        paragraph.properties !== undefined ||
        paragraph.listGeometryWins === true ||
        paragraph.directListRule !== undefined
      ) {
        const key = paragraphStyleKey(
          getOdfStyleName(paragraph),
          paragraph.alignment,
          paragraph.leftMargin,
          paragraph.paragraphProperties,
          paragraph.properties,
          paragraph.listGeometryWins === true ? paragraph.list?.rule.name : undefined,
          paragraph.directListRule,
        );
        if (!paragraphStyleNames.has(key))
          paragraphStyleNames.set(key, `P${paragraphStyleNames.size + 1}`);
      }
      if (paragraph.markerProperties) addTextStyle(paragraph.markerProperties);
      paragraph.runs.forEach(
        /** Collects one used character style. @param run - Live text run. @returns Nothing. */
        (run) => {
          if (run.text.length === 0) throw new Error("ODF text runs must not be empty.");
          if (hasAutomaticTextStyle(run, paragraph)) addTextStyle(run.properties);
        },
      );
    }
    const listStyleNames = new Map(
      [...listRules.keys()].map(
        /** Names one automatic list style. @param ruleName - Canonical rule name. @param index - Rule order. @returns Name pair. */ (
          ruleName,
          index,
        ) =>
          [
            ruleName,
            listRules.get(ruleName)?.isAutomatic === false ? escapeXml(ruleName) : `L${index + 1}`,
          ] as const,
      ),
    );
    const namedStyles: string[] = [];
    const paragraphStyles = [...paragraphStyleNames].map(
      /** Emits one automatic paragraph style. @param entry - Internal key and ODF name. @returns Style XML. */
      (entry) => {
        const [key, name] = entry;
        const [style, alignment, leftMargin, paraKey, charKey, listRule, directRule] = JSON.parse(
          key,
        ) as StyleKey;
        const parent = style ? ` style:parent-style-name="${escapeXml(style)}"` : "";
        const paragraphAttributes = [
          ...(alignment === "" ? [] : [`fo:text-align="${alignment}"`]),
          ...(leftMargin === "" ? [] : [`fo:margin-left="${exportOdfLength(Number(leftMargin))}"`]),
          ...exportParagraphAttributes(parseParagraphPropertiesKey(paraKey)),
        ];
        const parsedParagraphProperties = parseParagraphPropertiesKey(paraKey);
        const masterPage =
          parsedParagraphProperties.pageStyleName === undefined
            ? ""
            : ` style:master-page-name="${escapeXml(encodeStyleName(parsedParagraphProperties.pageStyleName))}"`;
        const paragraphChildren = exportParagraphPropertyChildren(parsedParagraphProperties);
        const paragraphProperties =
          paragraphAttributes.length === 0 && paragraphChildren.length === 0
            ? ""
            : `<style:paragraph-properties${paragraphAttributes.length === 0 ? "" : ` ${paragraphAttributes.join(" ")}`}>${paragraphChildren}</style:paragraph-properties>`;
        const properties = parseCharacterPropertiesKey(charKey);
        const textProperties =
          Object.keys(properties).length === 0 &&
          parsedParagraphProperties.hyphenation === undefined
            ? ""
            : exportCharacterPropertyElement(properties, fontFaceName, parsedParagraphProperties);
        if (listRule !== "") {
          const listStyle = listStyleNames.get(listRule);
          /* istanbul ignore next -- The collected paragraph and list-rule maps share one source pass. */
          if (listStyle === undefined) throw new Error(`Missing ODF list style: ${listRule}`);
          const baseName = `${name}Base`;
          namedStyles.push(
            `<style:style style:name="${baseName}" style:family="paragraph"${parent}${masterPage}>${paragraphProperties}${textProperties}</style:style>`,
          );
          return `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${baseName}" style:list-style-name="${listStyle}"/>`;
        }
        const directNumbering = directRule === "" ? undefined : listStyleNames.get(directRule);
        if (directRule !== "" && directNumbering === undefined)
          throw new Error(`Missing ODF direct list style: ${directRule}`);
        const numbering =
          directNumbering === undefined ? "" : ` style:list-style-name="${directNumbering}"`;
        return `<style:style style:name="${name}" style:family="paragraph"${parent}${numbering}${masterPage}>${paragraphProperties}${textProperties}</style:style>`;
      },
    );
    for (const { key, parent, properties } of source.redlineStyles ?? [])
      redlineStyleNames.set(key, properties ? addTextStyle(properties, parent) : parent);
    const characterStyles = [...characterStyleNames].map(
      /** Emits one automatic character style. @param entry - Internal key and ODF name. @returns Style XML. */
      (entry) => {
        const [key, name] = entry;
        const parent = characterParents.get(name);
        const properties = parseCharacterPropertiesKey(parent ? key.slice(parent.length + 1) : key);
        const parentAttribute = parent ? ` style:parent-style-name="${escapeXml(parent)}"` : "";
        return `<style:style style:name="${name}" style:family="text"${parentAttribute}>${exportCharacterPropertyElement(properties, fontFaceName)}</style:style>`;
      },
    );
    const listStyles = [...listRules.values()]
      .filter(
        /** Applies this source-owned operation. @param rule - Native input. @returns Native result. */ (
          rule,
        ) => rule.isAutomatic !== false,
      )
      .map(
        /** Emits one automatic ODF list style. @param rule - Writer numbering rule. @param index - Stable style index. @returns Style XML. */
        (rule) => {
          const name = listStyleNames.get(rule.name) as string;
          const levels = rule.levels
            .map(
              /** Delegates each native property record to numbering export ownership. @param properties - Level properties. @param level - Zero-based level. @returns Level XML. */
              (properties, level) => numRuleExport.exportLevelStyle(level, properties),
            )
            .join("");
          return `<text:list-style style:name="${name}" style:display-name="${escapeXml(rule.name)}">${levels}</text:list-style>`;
        },
      );
    const listIdentities = new Map<string, { readonly rootId: string; segments: number }>();
    const usedXmlIds = new Set<string>();
    const renderParagraphs =
      /** Renders one text location while borrowing the full export-pass identity catalogue. @param paragraphs - Actual text location. @param renderFrame - Original nested frame exporter. @returns XML. */
      (
        paragraphs: Iterable<XMLTextParagraphSource>,
        renderFrame?: (frame: XMLTextFrameExportSource) => string,
      ): string =>
        exportParagraphBody(
          paragraphs,
          paragraphStyleNames,
          characterStyleNames,
          listStyleNames,
          rubyStyleNames,
          isCancelled,
          listIdentities,
          usedXmlIds,
          renderFrame,
        );
    const rendered =
      source.blocks === undefined
        ? { body: renderParagraphs(source.paragraphs()), automaticStyles: "" }
        : exportTableBlocks(
            source.blocks(),
            renderParagraphs,
            isCancelled,
            source.sections?.(),
            source.exportNumberStyle?.bind(source),
          );
    return {
      automaticStyles: [
        ...paragraphStyles,
        ...characterStyles,
        ...listStyles,
        ...rubyStyles,
        rendered.automaticStyles,
      ].join(""),
      body: rendered.body,
      namedStyles: namedStyles.join(""),
      redlineStyleNames,
      ...("sections" in rendered && rendered.sections !== undefined
        ? { sections: rendered.sections }
        : {}),
    };
  }
}

/** Includes annotation text in the same automatic-style collection pass as its owning paragraph. @param paragraphs - Live text location. @returns Paragraphs in export order. */
function* paragraphsForAutoStyles(
  paragraphs: Iterable<XMLTextParagraphSource>,
): Iterable<XMLTextParagraphSource> {
  for (const paragraph of paragraphs) {
    yield paragraph;
    for (const marker of paragraph.markers ?? [])
      if (marker.kind === "annotation" && marker.paragraphs) yield* marker.paragraphs;
  }
}

/** Exports live Writer paragraphs through xmloff ownership. @param source - Model source. @param isCancelled - Cancellation probe. @param fontFaceName - Font registration. @param existingFontFaceName - Existing face lookup for numbering. @param graphicHelper - Package graphic lookup. @returns XML fragments. */
export function exportTextParagraphs(
  source: XMLTextExportSource,
  isCancelled: () => boolean = /** Never cancels. @returns False. */ () => false,
  fontFaceName?: FontFaceNameResolver,
  existingFontFaceName?: (familyName: string) => string | undefined,
  graphicHelper?: SvXMLGraphicHelper,
): OdfTextExport {
  return new XMLTextParagraphExport(
    source,
    isCancelled,
    fontFaceName,
    existingFontFaceName,
    graphicHelper,
  ).Export();
}

/** Emits the ordered paragraph stream, nesting list paragraphs in text:list/text:list-item elements. @param paragraphs - Flat paragraph sequence. @param paragraphStyleNames - Automatic paragraph styles. @param characterStyleNames - Automatic text styles. @param listStyleNames - Automatic list styles. @param isCancelled - Cancellation probe. @param listIdentities - Shared export-pass list catalogue. @param usedXmlIds - Shared unique XML identities. @param renderFrame - Native frame body exporter. @param rubyStyleNames - Automatic ruby style names keyed by the projected properties. @returns ODF body fragment. */
function exportParagraphBody(
  paragraphs: Iterable<XMLTextParagraphSource>,
  paragraphStyleNames: ReadonlyMap<string, string>,
  characterStyleNames: ReadonlyMap<string, string>,
  listStyleNames: ReadonlyMap<string, string>,
  rubyStyleNames: ReadonlyMap<string, string>,
  isCancelled: () => boolean,
  listIdentities: Map<string, { readonly rootId: string; segments: number }>,
  usedXmlIds: Set<string>,
  renderFrame?: (frame: XMLTextFrameExportSource) => string,
): string {
  let body = "";
  let activeListId: string | undefined;
  const openRules: string[] = [];
  const openItems: Array<"list-item" | "list-header"> = [];
  const info = new XMLTextNumRuleInfo();

  /** Closes every currently open list item and list. @returns Nothing. */
  function closeAllLists(): void {
    while (openRules.length > 0) {
      body += `</text:${openItems.pop()}></text:list>`;
      openRules.pop();
    }
    activeListId = undefined;
  }

  /** Opens one list level and its first item. @param paragraphList - Source list metadata. @param root - Whether this is a root list block. @param includeStartValue - Whether the item represents the current restarting paragraph. @returns Nothing. */
  function openListLevel(
    paragraphList: XMLTextListSource,
    root: boolean,
    includeStartValue: boolean,
  ): void {
    const styleName = listStyleNames.get(paragraphList.rule.name) as string;
    let identityAttributes = "";
    let restartAtContinuedList = !root;
    if (root) {
      const prior = listIdentities.get(paragraphList.listId);
      if (prior === undefined) {
        const rootId = createXmlId(paragraphList.listId, usedXmlIds);
        listIdentities.set(paragraphList.listId, { rootId, segments: 1 });
        identityAttributes = ` xml:id="${rootId}"`;
      } else {
        restartAtContinuedList = true;
        prior.segments += 1;
        const segmentId = createXmlId(`${prior.rootId}-${prior.segments}`, usedXmlIds);
        identityAttributes = ` xml:id="${segmentId}" text:continue-list="${prior.rootId}"`;
      }
    }
    const startValue = includeStartValue
      ? info.HasStartValue()
        ? ` text:start-value="${info.GetStartValue()}"`
        : restartAtContinuedList && info.IsRestart()
          ? ` text:start-value="${info.GetListLevelStartValue()}"`
          : ""
      : "";
    const item = includeStartValue && !info.IsNumbered() ? "list-header" : "list-item";
    body += `<text:list text:style-name="${styleName}"${identityAttributes}><text:${item}${startValue}>`;
    openItems.push(item);
    openRules.push(paragraphList.rule.name);
  }

  for (const paragraph of paragraphs) {
    if (isCancelled()) throw new Error("ODT operation was cancelled.");
    const paragraphXml = exportParagraphElement(
      paragraph,
      paragraphStyleNames,
      characterStyleNames,
      rubyStyleNames,
      renderFrame,
    );
    info.Set(paragraph.list);
    if (paragraph.list === undefined) {
      closeAllLists();
      body += paragraphXml;
      continue;
    }
    const list = paragraph.list;
    if (
      activeListId !== undefined &&
      (activeListId !== info.GetListId() ||
        (activeListId === "" && openRules.at(-1) !== info.GetNumRulesName()))
    )
      closeAllLists();
    if (openRules.length === 0) {
      activeListId = info.GetListId();
      for (let level = 0; level <= list.level; level += 1)
        openListLevel(list, level === 0, level === list.level);
    } else if (list.level >= openRules.length) {
      while (openRules.length <= list.level)
        openListLevel(list, false, openRules.length === list.level);
    } else {
      while (openRules.length - 1 > list.level) {
        body += `</text:${openItems.pop()}></text:list>`;
        openRules.pop();
      }
      if (info.IsNumbered()) {
        body += `</text:${openItems.pop()}>`;
        if (info.IsRestart() && !info.HasStartValue() && info.GetLevel() !== 1)
          body += "</text:list><text:list>";
        const startValue = info.HasStartValue()
          ? ` text:start-value="${info.GetStartValue()}"`
          : info.IsRestart() && info.GetLevel() === 1
            ? ` text:start-value="${info.GetListLevelStartValue()}"`
            : "";
        const override =
          openRules.at(-1) === info.GetNumRulesName()
            ? ""
            : ` text:style-override="${listStyleNames.get(info.GetNumRulesName())}"`;
        body += `<text:list-item${startValue}${override}>`;
        openItems.push("list-item");
      }
    }
    body += paragraphXml;
  }
  closeAllLists();
  return body;
}

/** Emits one paragraph or heading element without list containers. @param paragraph - Neutral paragraph. @param paragraphStyleNames - Automatic paragraph styles. @param characterStyleNames - Automatic text styles. @param renderFrame - Native frame body exporter. @param rubyStyleNames - Automatic ruby style names keyed by the projected properties. @returns Element XML. */
function exportParagraphElement(
  paragraph: XMLTextParagraphSource,
  paragraphStyleNames: ReadonlyMap<string, string>,
  characterStyleNames: ReadonlyMap<string, string>,
  rubyStyleNames: ReadonlyMap<string, string>,
  renderFrame?: (frame: XMLTextFrameExportSource) => string,
): string {
  const baseStyleName = getOdfStyleName(paragraph);
  const styleName =
    paragraph.alignment === undefined &&
    paragraph.leftMargin === undefined &&
    paragraph.paragraphProperties === undefined &&
    paragraph.properties === undefined &&
    paragraph.listGeometryWins !== true &&
    paragraph.directListRule === undefined
      ? baseStyleName
      : (paragraphStyleNames.get(
          paragraphStyleKey(
            baseStyleName,
            paragraph.alignment,
            paragraph.leftMargin,
            paragraph.paragraphProperties,
            paragraph.properties,
            paragraph.listGeometryWins === true ? paragraph.list?.rule.name : undefined,
            paragraph.directListRule,
          ),
        ) as string);
  let content = "";
  let activeHyperlink: OdfHyperlink | undefined;
  const markers = paragraph.markers ?? [];
  const exportAnnotationParagraph =
    /** Renders a note paragraph using the same automatic-style families. @param note - Note paragraph. @returns XML paragraph. */
    (note: XMLTextParagraphSource): string =>
      exportParagraphElement(note, paragraphStyleNames, characterStyleNames, rubyStyleNames);
  let markerIndex = 0;
  let textOffset = 0;
  const encodeWithMarkers =
    /** Writes markers while preserving the surrounding run and hyperlink structure. @param text - Run text. @param start - Run start. @returns Escaped content. */
    (text: string, start: number): string => {
      let encoded = "";
      let localOffset = 0;
      while (
        markerIndex < markers.length &&
        (markers[markerIndex] as XMLTextParagraphMarker).offset < start + text.length
      ) {
        const marker = markers[markerIndex] as XMLTextParagraphMarker;
        if (marker.offset < start + localOffset) throw new Error("ODF marker order is invalid.");
        encoded += exportText(text.slice(localOffset, marker.offset - start));
        encoded += exportMarker(marker, renderFrame, exportAnnotationParagraph);
        localOffset =
          marker.offset -
          start +
          Number(
            (marker.kind === "frame" && marker.frame.anchor === "as-char") ||
              marker.kind === "annotation-end" ||
              marker.kind === "index-mark" ||
              marker.kind === "reference-mark" ||
              marker.kind === "reference-field" ||
              marker.kind === "doc-info-field" ||
              marker.kind === "count-field" ||
              marker.kind === "page-number-field" ||
              marker.kind === "chapter-field" ||
              marker.kind === "sequence-field" ||
              marker.kind === "variable-field" ||
              marker.kind === "placeholder-field" ||
              marker.kind === "drop-down-field" ||
              marker.kind === "hidden-text-field" ||
              marker.kind === "hidden-paragraph-field" ||
              marker.kind === "date-time-field" ||
              (marker.kind === "annotation" && marker.consumesMarker),
          );
        markerIndex += 1;
      }
      return encoded + exportText(text.slice(localOffset));
    };
  const rubyRanges = paragraph.ruby ?? [];
  let rubyIndex = 0;
  let activeRuby: XMLRubyRange | undefined;
  const closeHyperlink =
    /** Closes the active link at an outer text boundary. @returns Nothing. */ (): void => {
      if (activeHyperlink !== undefined) content += "</text:a>";
      activeHyperlink = undefined;
    };
  const updateRuby =
    /** Opens or closes the native ruby scope at the current text position. @returns Nothing. */ (): void => {
      if (activeRuby?.end === textOffset) {
        closeHyperlink();
        const name = activeRuby.readingStyleName;
        const style = name ? ` text:style-name="${escapeXml(name)}"` : "";
        content += `</text:ruby-base><text:ruby-text${style}>${escapeXml(activeRuby.reading)}</text:ruby-text></text:ruby>`;
        activeRuby = undefined;
        rubyIndex++;
      }
      const next = rubyRanges[rubyIndex];
      if (activeRuby === undefined && next?.start === textOffset) {
        closeHyperlink();
        const name = rubyStyleNames.get(rubyStyleKey(next));
        if (name === undefined) throw new Error("Missing automatic ruby style.");
        content += `<text:ruby text:style-name="${name}"><text:ruby-base>`;
        activeRuby = next;
      }
    };
  for (const run of paragraph.runs) {
    const runStart = textOffset;
    const runEnd = runStart + run.text.length;
    do {
      updateRuby();
      if (JSON.stringify(run.hyperlink) !== JSON.stringify(activeHyperlink)) {
        closeHyperlink();
        activeHyperlink = run.hyperlink;
        if (activeHyperlink !== undefined) content += exportHyperlinkStart(activeHyperlink);
      }
      const boundary = activeRuby?.end ?? rubyRanges[rubyIndex]?.start ?? runEnd;
      if (boundary < textOffset) throw new Error("ODF ruby range order is invalid.");
      const partEnd = Math.min(runEnd, boundary);
      const encoded = encodeWithMarkers(
        run.text.slice(textOffset - runStart, partEnd - runStart),
        textOffset,
      );
      textOffset = partEnd;
      for (const style of run.characterStyles ?? [])
        content += `<text:span text:style-name="${escapeXml(style)}">`;
      if (hasAutomaticTextStyle(run, paragraph)) {
        const name = characterStyleNames.get(characterPropertiesKey(run.properties)) as string;
        content += `<text:span text:style-name="${name}">${encoded}</text:span>`;
      } else content += encoded;
      content += "</text:span>".repeat(run.characterStyles?.length ?? 0);
    } while (textOffset < runEnd);
  }
  updateRuby();
  if (activeRuby !== undefined || rubyIndex !== rubyRanges.length)
    throw new Error("ODF ruby range is outside its paragraph.");
  closeHyperlink();
  while (markerIndex < markers.length) {
    const marker = markers[markerIndex] as XMLTextParagraphMarker;
    if (marker.offset !== textOffset) throw new Error("ODF marker is outside its paragraph.");
    content += exportMarker(marker, renderFrame, exportAnnotationParagraph);
    markerIndex += 1;
  }
  const markerStyle =
    paragraph.markerProperties &&
    characterStyleNames.get(characterPropertiesKey(paragraph.markerProperties));
  const marker = markerStyle ? ` loext:marker-style-name="${markerStyle}"` : "";
  const style = styleName ? ` text:style-name="${escapeXml(styleName)}"` : "";
  const outline = paragraph.outlineLevel ?? (paragraph.style === "heading-1" ? 1 : 0);
  const listHeader = paragraph.outlineListHeader ? ' text:is-list-header="true"' : "";
  const restart = paragraph.outlineRestart ? ' text:restart-numbering="true"' : "";
  const start =
    paragraph.outlineStartValue === undefined
      ? ""
      : ` text:start-value="${paragraph.outlineStartValue}"`;
  return outline > 0
    ? `<text:h text:outline-level="${outline}"${listHeader}${restart}${start}${style}${marker}>${content}</text:h>`
    : `<text:p${style}${marker}>${content}</text:p>`;
}

/** Emits one zero-width Writer marker. @param marker - Canonical position. @param renderFrame - Native frame body exporter. @param exportAnnotationParagraph - Shared annotation paragraph serializer. @returns ODF element. */
function exportMarker(
  marker: XMLTextParagraphMarker,
  renderFrame: ((frame: XMLTextFrameExportSource) => string) | undefined,
  exportAnnotationParagraph: (paragraph: XMLTextParagraphSource) => string,
): string {
  if (marker.kind === "frame") {
    if (!renderFrame) throw new Error("ODF anchored frame has no text export owner.");
    return renderFrame(marker.frame);
  }
  if (marker.kind === "annotation" || marker.kind === "annotation-end")
    return exportAnnotation(marker, escapeXml, exportText, exportAnnotationParagraph);
  if (marker.kind === "reference-field") return exportReferenceField(marker, escapeXml);
  if (marker.kind === "placeholder-field") return exportPlaceholderField(marker, escapeXml);
  if (marker.kind === "drop-down-field") return exportDropDownField(marker, escapeXml);
  if (marker.kind === "hidden-text-field") return exportHiddenTextField(marker, escapeXml);
  if (marker.kind === "hidden-paragraph-field")
    return exportHiddenParagraphField(marker, escapeXml);
  if (marker.kind === "sequence-field") return exportSequenceField(marker, escapeXml);
  if (marker.kind === "variable-field") return exportVariableField(marker, escapeXml);
  if (marker.kind === "chapter-field") return exportChapterField(marker, escapeXml);
  if (marker.kind === "page-number-field") return exportPageNumberField(marker, escapeXml);
  if (marker.kind === "count-field") return exportCountField(marker, escapeXml);
  if (marker.kind === "doc-info-field") return exportDocInfoField(marker, escapeXml);
  if (marker.kind === "date-time-field") return exportDateTimeField(marker, escapeXml);
  if (
    marker.kind === "index-mark" ||
    marker.kind === "index-mark-start" ||
    marker.kind === "index-mark-end"
  )
    return exportIndexMark(marker, escapeXml);
  if ("id" in marker) return exportRedlineMarker(marker, escapeXml);
  if (marker.kind === "soft-page-break") return "<text:soft-page-break/>";
  if (marker.name === undefined || marker.name.length === 0)
    throw new Error("ODF bookmark name is invalid.");
  const attributes =
    marker.kind === "bookmark-start" && marker.hidden
      ? ` loext:hidden="true" loext:condition="${escapeXml(marker.condition ?? "")}"`
      : "";
  return `<text:${marker.kind} text:name="${escapeXml(marker.name)}"${attributes}/>`;
}

/** Emits the supported upstream hyperlink attributes. @param hyperlink - Link metadata. @returns Opening text:a tag. */
function exportHyperlinkStart(hyperlink: OdfHyperlink): string {
  const target = hyperlink.targetFrame;
  return `<text:a xlink:type="simple" xlink:href="${escapeXml(hyperlink.url)}"${hyperlink.name === undefined ? "" : ` office:name="${escapeXml(hyperlink.name)}"`}${target === undefined ? "" : ` office:target-frame-name="${escapeXml(target)}" xlink:show="${target === "_blank" ? "new" : "replace"}"`}${hyperlink.styleName === undefined ? "" : ` text:style-name="${escapeXml(hyperlink.styleName)}"`}${hyperlink.visitedStyleName === undefined ? "" : ` text:visited-style-name="${escapeXml(hyperlink.visitedStyleName)}"`}>`;
}

/** Validates list metadata before XML generation. @param list - Neutral list state. @returns Nothing. */
function assertList(list: XMLTextListSource): void {
  if (!Number.isInteger(list.level) || list.level < 0 || list.level >= list.rule.levels.length)
    throw new Error("ODF list level is outside its numbering rule.");
  if (list.listId.length === 0 || list.rule.name.length === 0)
    throw new Error("ODF list identity and rule name must not be blank.");
  if (
    list.counted !== false &&
    list.startValue !== undefined &&
    list.startValue !== -1 &&
    (!Number.isInteger(list.startValue) || list.startValue < 0 || list.startValue > 32_767)
  )
    throw new Error("ODF list start value is outside the supported range.");
  if (list.rule.levels.length !== 10)
    throw new Error("ODF list rule must define ten Writer levels.");
  list.rule.levels.forEach(
    /** Validates one upstream-shaped character-special marker. @param properties - Level properties. @returns Nothing. */
    (properties) => {
      if (properties.bulletChar !== undefined && [...properties.bulletChar].length > 1)
        throw new Error("ODF bullet character must contain at most one Unicode code point.");
    },
  );
}

/** Creates a unique XML ID while preserving already-valid Writer list ids. @param value - Canonical list identity. @param used - IDs already emitted. @returns Unique XML ID. */
function createXmlId(value: string, used: Set<string>): string {
  const base = /^[A-Za-z_][A-Za-z0-9._-]*$/.test(value)
    ? value
    : `list-${[...value]
        .map(
          /** Encodes one invalid-ID character. @param character - Source character. @returns Hexadecimal code point. */
          (character) => (character.codePointAt(0) as number).toString(16),
        )
        .join("-")}`;
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

/** Creates a structured automatic paragraph style deduplication key. @param style - Parent style. @param alignment - Direct alignment. @param leftMargin - Direct text-left margin. @param paragraphProperties - Direct paragraph properties. @param properties - Direct character properties. @param listGeometryRule - Legacy adapter priority. @param directListRule - Actual direct rule item. @returns Key. */
function paragraphStyleKey(
  style: XMLParagraphStyle,
  alignment?: OdfParagraphAlignment,
  leftMargin?: number,
  paragraphProperties?: OdfParagraphProperties,
  properties?: Partial<OdfCharacterProperties>,
  listGeometryRule?: string,
  directListRule?: string,
): string {
  return JSON.stringify([
    style,
    alignment ?? "",
    leftMargin === undefined ? "" : String(leftMargin),
    paragraphPropertiesKey(paragraphProperties),
    partialCharacterPropertiesKey(properties),
    listGeometryRule ?? "",
    directListRule ?? "",
  ]);
}

/** Serializes ODF significant spaces, tabs, and line breaks. @param value - Raw run text. @returns ODF inline XML. */
export function exportText(value: string): string {
  let output = "";
  let plain = "";
  const flush = /** Flushes accumulated ordinary XML characters. @returns Nothing. */ (): void => {
    output += escapeXml(plain);
    plain = "";
  };
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index] as string;
    if (character === " ") {
      flush();
      let count = 1;
      while (value[index + 1] === " ") {
        count += 1;
        index += 1;
      }
      output += count === 1 ? "<text:s/>" : `<text:s text:c="${count}"/>`;
    } else if (character === "\t") {
      flush();
      output += "<text:tab/>";
    } else if (character === "\n") {
      flush();
      output += "<text:line-break/>";
    } else {
      plain += character;
    }
  }
  flush();
  return output;
}

/** Returns the effective paragraph character baseline. @param paragraph - Neutral paragraph. @returns Complete inherited properties. */
function paragraphInheritedProperties(paragraph: XMLTextParagraphSource): OdfCharacterProperties {
  return paragraph.inheritedProperties ?? {};
}

/** Determines whether FindTextStyle needs a direct automatic span inside common named spans. @param run - Native run. @param paragraph - Native paragraph. @returns Whether direct properties must be serialized. */
function hasAutomaticTextStyle(run: XMLTextRunSource, paragraph: XMLTextParagraphSource): boolean {
  return run.characterStyles?.length
    ? Object.keys(run.properties).length > 0
    : !equalCharacterProperties(run.properties, paragraphInheritedProperties(paragraph));
}

/** Compares complete character properties. @param left - First properties. @param right - Second properties. @returns Whether equal. */
function equalCharacterProperties(
  left: OdfCharacterProperties,
  right: OdfCharacterProperties,
): boolean {
  return characterPropertiesKey(left) === characterPropertiesKey(right);
}

/** Creates a stable key from all represented native property values. @param properties - Properties. @returns Internal key. */
function characterPropertiesKey(properties: OdfCharacterProperties): string {
  return partialCharacterPropertiesKey(properties);
}
/** Preserves absent properties and every independent script/font/color field. @param properties - Direct properties. @returns Internal key. */
function partialCharacterPropertiesKey(properties?: Partial<OdfCharacterProperties>): string {
  const value = properties ?? {};
  return JSON.stringify(
    Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(
          /** Reads a represented property in stable order. @param key - Property name. @returns Entry. */
          (key) => [key, value[key as keyof OdfCharacterProperties]],
        ),
    ),
  );
}
/** Reads only keys produced internally by this export pass. @param key - Internal key. @returns Properties. */
function parseCharacterPropertiesKey(key: string): Partial<OdfCharacterProperties> {
  return JSON.parse(key) as Partial<OdfCharacterProperties>;
}

/** Selects the Writer-projected ODF name while retaining the neutral legacy fallback. @param paragraph - Model paragraph projection. @returns ODF name. */
function getOdfStyleName(paragraph: XMLTextParagraphSource): string {
  return (
    paragraph.styleName ??
    (paragraph.style === "default"
      ? "Standard"
      : paragraph.style === "heading-1"
        ? "Heading_20_1"
        : paragraph.style)
  );
}
