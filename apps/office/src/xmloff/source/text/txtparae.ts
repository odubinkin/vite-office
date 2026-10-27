/**
 * @fileoverview Reimplements the bounded ODF text paragraph export boundary from pinned LibreOffice `xmloff/source/text/txtparae.cxx`.
 */
import { exportFillProperties, type OdfFillProperties } from "../draw/fill-properties";
import { paragraphPropertiesKey, parseParagraphPropertiesKey } from "./txtparae-properties";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { OdfBoxProperties } from "../style/bordrhdl";
import { XMLNumberWithAutoForVoidPropHdl } from "../style/xmlbahdl";
import { SvxXMLNumRuleExport, type XMLListLevelExport } from "../style/xmlnume";
import { exportTableBlocks, type XMLTextExportBlock } from "../table/XMLTableExport";
import type { FontFaceNameResolver, OdfCharacterProperties } from "./txtparae.types";
import { exportTextCharacterProperties } from "./txtprmap";
import { XMLTextNumRuleInfo } from "./XMLTextNumRuleInfo";
export { ODF_NAMESPACES } from "../core/xmltoken";

export type { OdfCharacterProperties } from "./txtparae.types";

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
  readonly hyperlink?: OdfHyperlink;
  readonly properties: OdfCharacterProperties;
  readonly text: string;
}

/** Writer paragraph styles supported by the bounded filter. */
export type XMLParagraphStyle = string;
/** Fixed fields in the structured automatic-style key. */
type StyleKey = [string, OdfParagraphAlignment | "", string, string, string, string, string];

/** Paragraph alignment values shared with the Writer model. */
export type OdfParagraphAlignment = "left" | "center" | "right" | "justify";

/** Direct paragraph properties represented by the bounded Writer model. */
export interface OdfTabStop {
  readonly position: number;
  readonly alignment: "left" | "right" | "center" | "char" | "default";
  readonly decimal: string;
  readonly fill: string;
}

/** Direct paragraph properties represented by the bounded Writer model. */
export interface OdfParagraphProperties extends OdfBoxProperties, OdfFillProperties {
  readonly joinBorder?: boolean;
  readonly countLineNumbers?: boolean;
  readonly contextualSpacing?: boolean;
  readonly firstLineIndent?: number;
  readonly autoTextIndent?: boolean;
  readonly pageStyleName?: string;
  readonly pageNumber?: number | "auto";
  readonly lineHeightPercent?: number;
  readonly lineHeightTwips?: number;
  readonly lineHeightAtLeastTwips?: number;
  readonly lineSpacingTwips?: number;
  readonly fontIndependentLineSpacing?: boolean;
  readonly keepWithNext?: boolean;
  readonly keepTogether?: boolean;
  readonly widows?: number;
  readonly orphans?: number;
  readonly breakBefore?: "auto" | "page";
  readonly breakAfter?: "auto" | "page";
  readonly lowerSpacing?: number;
  readonly rightMargin?: number;
  readonly tabStopDetails?: readonly OdfTabStop[];
  readonly upperSpacing?: number;
}

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

/** Narrow live view of one canonical Writer paragraph. */
export interface XMLTextParagraphSource {
  readonly alignment?: OdfParagraphAlignment;
  readonly inheritedProperties?: OdfCharacterProperties;
  /** Direct text-left margin in twips. */
  readonly leftMargin?: number;
  readonly list?: XMLTextListSource;
  readonly listGeometryWins?: boolean;
  /** Direct numbering item; common style ownership remains on the original named parent. */
  readonly directListRule?: string;
  /** Zero-width Writer marks and imported pagination hints in UTF-16 coordinates. */
  readonly markers?: readonly Readonly<{
    kind: "bookmark" | "soft-page-break";
    name?: string;
    offset: number;
  }>[];
  readonly paragraphProperties?: OdfParagraphProperties;
  readonly properties?: Partial<OdfCharacterProperties>;
  readonly runs: readonly XMLTextRunSource[];
  readonly style: XMLParagraphStyle;
  readonly styleName?: string;
}

/** Reiterable model-facing source; definitions are collected before body references. */
export interface XMLTextExportSource {
  paragraphs(): Iterable<XMLTextParagraphSource>;
  blocks?(): Iterable<XMLTextExportBlock>;
}

/** Serialized automatic styles and paragraph body fragment. */
export interface OdfTextExport {
  readonly automaticStyles: string;
  readonly body: string;
  readonly namedStyles: string;
}

/** Bounded xmloff export context owning one complete text export pass. */
export class XMLTextParagraphExport {
  /** Captures model source and operation ports. @param source - Model source. @param isCancelled - Cancellation probe. @param fontFaceName - Font registration. @param existingFontFaceName - Existing face lookup for numbering export. @returns Nothing. */
  public constructor(
    private readonly source: XMLTextExportSource,
    private readonly isCancelled: () => boolean,
    private readonly fontFaceName?: FontFaceNameResolver,
    private readonly existingFontFaceName?: (familyName: string) => string | undefined,
  ) {}

  /** Exports automatic styles and text elements under this context's ownership. @returns XML fragments. */
  public Export(): OdfTextExport {
    const { fontFaceName, isCancelled, source } = this;
    const paragraphStyleNames = new Map<string, string>();
    const characterStyleNames = new Map<string, string>();
    const listRules = new Map<string, XMLTextListRuleSource>();
    const numRuleExport = new SvxXMLNumRuleExport(escapeXml, this.existingFontFaceName);
    for (const paragraph of source.paragraphs()) {
      if (isCancelled()) throw new Error("ODT operation was cancelled.");
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
      paragraph.runs.forEach(
        /** Collects one used character style. @param run - Live text run. @returns Nothing. */
        (run) => {
          if (run.text.length === 0) throw new Error("ODF text runs must not be empty.");
          if (!equalCharacterProperties(run.properties, paragraphInheritedProperties(paragraph))) {
            const key = characterPropertiesKey(run.properties);
            if (!characterStyleNames.has(key))
              characterStyleNames.set(key, `T${characterStyleNames.size + 1}`);
          }
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
        const parent = escapeXml(style);
        const paragraphAttributes = [
          ...(alignment === "" ? [] : [`fo:text-align="${exportAlignment(alignment)}"`]),
          ...(leftMargin === "" ? [] : [`fo:margin-left="${exportOdfLength(Number(leftMargin))}"`]),
          ...exportParagraphAttributes(parseParagraphPropertiesKey(paraKey)),
        ];
        const parsedParagraphProperties = parseParagraphPropertiesKey(paraKey);
        const masterPage =
          parsedParagraphProperties.pageStyleName === undefined
            ? ""
            : ` style:master-page-name="${escapeXml(parsedParagraphProperties.pageStyleName)}"`;
        const paragraphChildren = exportParagraphPropertyChildren(parsedParagraphProperties);
        const paragraphProperties =
          paragraphAttributes.length === 0 && paragraphChildren.length === 0
            ? ""
            : `<style:paragraph-properties${paragraphAttributes.length === 0 ? "" : ` ${paragraphAttributes.join(" ")}`}>${paragraphChildren}</style:paragraph-properties>`;
        const properties = parseCharacterPropertiesKey(charKey);
        const textProperties =
          Object.keys(properties).length === 0
            ? ""
            : `<style:text-properties${exportCharacterAttributes(properties, fontFaceName)}/>`;
        if (listRule !== "") {
          const listStyle = listStyleNames.get(listRule);
          /* istanbul ignore next -- The collected paragraph and list-rule maps share one source pass. */
          if (listStyle === undefined) throw new Error(`Missing ODF list style: ${listRule}`);
          const baseName = `${name}Base`;
          namedStyles.push(
            `<style:style style:name="${baseName}" style:family="paragraph" style:parent-style-name="${parent}"${masterPage}>${paragraphProperties}${textProperties}</style:style>`,
          );
          return `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${baseName}" style:list-style-name="${listStyle}"/>`;
        }
        const directNumbering = directRule === "" ? undefined : listStyleNames.get(directRule);
        if (directRule !== "" && directNumbering === undefined)
          throw new Error(`Missing ODF direct list style: ${directRule}`);
        const numbering =
          directNumbering === undefined ? "" : ` style:list-style-name="${directNumbering}"`;
        return `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${parent}"${numbering}${masterPage}>${paragraphProperties}${textProperties}</style:style>`;
      },
    );
    const characterStyles = [...characterStyleNames].map(
      /** Emits one automatic character style. @param entry - Internal key and ODF name. @returns Style XML. */
      (entry) => {
        const [key, name] = entry;
        const properties = parseCharacterPropertiesKey(key);
        return `<style:style style:name="${name}" style:family="text"><style:text-properties${exportCharacterAttributes(properties, fontFaceName)}/></style:style>`;
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
      /** Renders one text location while borrowing the full export-pass identity catalogue. @param paragraphs - Actual text location. @returns XML. */
      (paragraphs: Iterable<XMLTextParagraphSource>): string =>
        exportParagraphBody(
          paragraphs,
          paragraphStyleNames,
          characterStyleNames,
          listStyleNames,
          isCancelled,
          listIdentities,
          usedXmlIds,
        );
    const rendered =
      source.blocks === undefined
        ? { body: renderParagraphs(source.paragraphs()), automaticStyles: "" }
        : exportTableBlocks(source.blocks(), renderParagraphs, isCancelled);
    return {
      automaticStyles: [
        ...paragraphStyles,
        ...characterStyles,
        ...listStyles,
        rendered.automaticStyles,
      ].join(""),
      body: rendered.body,
      namedStyles: namedStyles.join(""),
    };
  }
}

/** Exports live Writer paragraphs through xmloff ownership. @param source - Model source. @param isCancelled - Cancellation probe. @param fontFaceName - Font registration. @param existingFontFaceName - Existing face lookup for numbering. @returns XML fragments. */
export function exportTextParagraphs(
  source: XMLTextExportSource,
  isCancelled: () => boolean = /** Never cancels. @returns False. */ () => false,
  fontFaceName?: FontFaceNameResolver,
  existingFontFaceName?: (familyName: string) => string | undefined,
): OdfTextExport {
  return new XMLTextParagraphExport(
    source,
    isCancelled,
    fontFaceName,
    existingFontFaceName,
  ).Export();
}

/** Emits the ordered paragraph stream, nesting list paragraphs in text:list/text:list-item elements. @param paragraphs - Flat paragraph sequence. @param paragraphStyleNames - Automatic paragraph styles. @param characterStyleNames - Automatic text styles. @param listStyleNames - Automatic list styles. @param isCancelled - Cancellation probe. @param listIdentities - Shared export-pass list catalogue. @param usedXmlIds - Shared unique XML identities. @returns ODF body fragment. */
function exportParagraphBody(
  paragraphs: Iterable<XMLTextParagraphSource>,
  paragraphStyleNames: ReadonlyMap<string, string>,
  characterStyleNames: ReadonlyMap<string, string>,
  listStyleNames: ReadonlyMap<string, string>,
  isCancelled: () => boolean,
  listIdentities: Map<string, { readonly rootId: string; segments: number }>,
  usedXmlIds: Set<string>,
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
    body += `<text:list text:style-name="${escapeXml(styleName)}"${identityAttributes}><text:${item}${startValue}>`;
    openItems.push(item);
    openRules.push(paragraphList.rule.name);
  }

  for (const paragraph of paragraphs) {
    if (isCancelled()) throw new Error("ODT operation was cancelled.");
    const paragraphXml = exportParagraphElement(
      paragraph,
      paragraphStyleNames,
      characterStyleNames,
    );
    info.Set(paragraph.list);
    if (paragraph.list === undefined) {
      closeAllLists();
      body += paragraphXml;
      continue;
    }
    const list = paragraph.list;
    const currentRuleAtLevel = openRules[info.GetLevel() - 1];
    if (
      activeListId !== undefined &&
      (activeListId !== info.GetListId() ||
        (currentRuleAtLevel !== undefined && currentRuleAtLevel !== info.GetNumRulesName()))
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
        body += `<text:list-item${startValue}>`;
        openItems.push("list-item");
      }
    }
    body += paragraphXml;
  }
  closeAllLists();
  return body;
}

/** Emits one paragraph or heading element without list containers. @param paragraph - Neutral paragraph. @param paragraphStyleNames - Automatic paragraph styles. @param characterStyleNames - Automatic text styles. @returns Element XML. */
function exportParagraphElement(
  paragraph: XMLTextParagraphSource,
  paragraphStyleNames: ReadonlyMap<string, string>,
  characterStyleNames: ReadonlyMap<string, string>,
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
  let markerIndex = 0;
  let textOffset = 0;
  const encodeWithMarkers =
    /** Writes markers while preserving the surrounding run and hyperlink structure. @param text - Run text. @param start - Run start. @returns Escaped content. */
    (text: string, start: number): string => {
      let encoded = "";
      let localOffset = 0;
      while (
        markerIndex < markers.length &&
        (markers[markerIndex] as { offset: number }).offset < start + text.length
      ) {
        const marker = markers[markerIndex] as {
          kind: "bookmark" | "soft-page-break";
          name?: string;
          offset: number;
        };
        if (marker.offset < start + localOffset) throw new Error("ODF marker order is invalid.");
        encoded += exportText(text.slice(localOffset, marker.offset - start));
        encoded += exportMarker(marker);
        localOffset = marker.offset - start;
        markerIndex += 1;
      }
      return encoded + exportText(text.slice(localOffset));
    };
  for (const run of paragraph.runs) {
    if (JSON.stringify(run.hyperlink) !== JSON.stringify(activeHyperlink)) {
      if (activeHyperlink !== undefined) content += "</text:a>";
      activeHyperlink = run.hyperlink;
      if (activeHyperlink !== undefined) content += exportHyperlinkStart(activeHyperlink);
    }
    const encoded = encodeWithMarkers(run.text, textOffset);
    textOffset += run.text.length;
    if (equalCharacterProperties(run.properties, paragraphInheritedProperties(paragraph)))
      content += encoded;
    else {
      const name = characterStyleNames.get(characterPropertiesKey(run.properties)) as string;
      content += `<text:span text:style-name="${name}">${encoded}</text:span>`;
    }
  }
  if (activeHyperlink !== undefined) content += "</text:a>";
  while (markerIndex < markers.length) {
    const marker = markers[markerIndex] as {
      kind: "bookmark" | "soft-page-break";
      name?: string;
      offset: number;
    };
    if (marker.offset !== textOffset) throw new Error("ODF marker is outside its paragraph.");
    content += exportMarker(marker);
    markerIndex += 1;
  }
  return paragraph.style === "heading-1"
    ? `<text:h text:outline-level="1" text:style-name="${escapeXml(styleName)}">${content}</text:h>`
    : `<text:p text:style-name="${escapeXml(styleName)}">${content}</text:p>`;
}

/** Emits one zero-width Writer marker. @param marker - Canonical position. @returns ODF element. */
function exportMarker(
  marker: Readonly<{ kind: "bookmark" | "soft-page-break"; name?: string; offset: number }>,
): string {
  if (marker.kind === "soft-page-break") return "<text:soft-page-break/>";
  if (marker.name === undefined || marker.name.length === 0)
    throw new Error("ODF bookmark name is invalid.");
  return `<text:bookmark text:name="${escapeXml(marker.name)}"/>`;
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

/** Emits supported ODF paragraph-property attributes. @param properties - Direct properties. @returns Attributes. */
export function exportParagraphAttributes(properties: OdfParagraphProperties): string[] {
  return [
    ...exportFillProperties(properties),
    ...(properties.joinBorder === undefined
      ? []
      : [`style:join-border="${properties.joinBorder}"`]),
    ...(["Top", "Bottom", "Left", "Right"] as const).flatMap(
      /** Computes the side result. @param side - Side. @returns The computed result. */ (side) => {
        const suffix = side.toLowerCase();
        const border = properties[`border${side}`];
        const width = properties[`borderLineWidth${side}`];
        return [
          ...(border === undefined ? [] : [`fo:border-${suffix}="${escapeXml(border)}"`]),
          ...(width === undefined
            ? []
            : [`style:border-line-width-${suffix}="${escapeXml(width)}"`]),
        ];
      },
    ),
    ...(properties.firstLineIndent === undefined
      ? []
      : [`fo:text-indent="${exportOdfLength(properties.firstLineIndent)}"`]),
    ...(properties.autoTextIndent === undefined
      ? []
      : [`style:auto-text-indent="${properties.autoTextIndent}"`]),
    ...(properties.pageNumber === undefined
      ? []
      : [`style:page-number="${exportPageNumber(properties.pageNumber)}"`]),
    ...(properties.rightMargin === undefined
      ? []
      : [`fo:margin-right="${exportOdfLength(properties.rightMargin)}"`]),
    ...(properties.upperSpacing === undefined
      ? []
      : [`fo:margin-top="${exportOdfLength(properties.upperSpacing)}"`]),
    ...(properties.lowerSpacing === undefined
      ? []
      : [`fo:margin-bottom="${exportOdfLength(properties.lowerSpacing)}"`]),
    ...(properties.lineHeightPercent === undefined
      ? []
      : [`fo:line-height="${properties.lineHeightPercent}%"`]),
    ...(properties.lineHeightTwips === undefined
      ? []
      : [`fo:line-height="${exportOdfLength(properties.lineHeightTwips)}"`]),
    ...(properties.lineHeightAtLeastTwips === undefined
      ? []
      : [`style:line-height-at-least="${exportOdfLength(properties.lineHeightAtLeastTwips)}"`]),
    ...(properties.lineSpacingTwips === undefined
      ? []
      : [`style:line-spacing="${exportOdfLength(properties.lineSpacingTwips)}"`]),
    ...(properties.fontIndependentLineSpacing === undefined
      ? []
      : [`style:font-independent-line-spacing="${properties.fontIndependentLineSpacing}"`]),
    ...(properties.contextualSpacing === undefined
      ? []
      : [`style:contextual-spacing="${properties.contextualSpacing}"`]),
    ...(properties.keepWithNext === undefined
      ? []
      : [`fo:keep-with-next="${properties.keepWithNext ? "always" : "auto"}"`]),
    ...(properties.keepTogether === undefined
      ? []
      : [`fo:keep-together="${properties.keepTogether ? "always" : "auto"}"`]),
    ...(properties.widows === undefined ? [] : [`fo:widows="${properties.widows}"`]),
    ...(properties.orphans === undefined ? [] : [`fo:orphans="${properties.orphans}"`]),
    ...(properties.breakBefore === undefined
      ? []
      : [`fo:break-before="${properties.breakBefore}"`]),
    ...(properties.breakAfter === undefined ? [] : [`fo:break-after="${properties.breakAfter}"`]),
    ...(properties.countLineNumbers === undefined
      ? []
      : [`text:number-lines="${properties.countLineNumbers}"`]),
  ];
}

/** Emits child elements of supported ODF paragraph properties. @param properties - Direct properties. @returns XML fragment. */
export function exportParagraphPropertyChildren(properties: OdfParagraphProperties): string {
  if (properties.tabStopDetails !== undefined)
    return properties.tabStopDetails.length === 0
      ? "<style:tab-stops/>"
      : `<style:tab-stops>${properties.tabStopDetails
          .map(
            /** Serializes one ODF tab. @param stop - Tab properties. @returns XML. */
            (stop) =>
              `<style:tab-stop style:position="${exportOdfLength(stop.position)}" style:type="${stop.alignment}"${stop.alignment === "char" ? ` style:char="${escapeXml(stop.decimal)}"` : ""}${stop.fill === " " ? "" : ` style:leader-style="${stop.fill === "." ? "dotted" : "solid"}" style:leader-text="${escapeXml(stop.fill)}"`}/>`,
          )
          .join("")}</style:tab-stops>`;
  return "";
}

/** Serializes a bounded twip margin as an ODF centimetre length. @param twips - Margin in twips. @returns ODF length. */
export function exportOdfLength(twips: number): string {
  const centimetres = (twips * 2.54) / 1440;
  return `${Number(centimetres.toFixed(4))}cm`;
}

/** Escapes XML character data. @param value - Raw text. @returns XML-safe text. */
export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Serializes ODF significant spaces, tabs, and line breaks. @param value - Raw run text. @returns ODF inline XML. */
export function exportText(value: string): string {
  let output = "";
  let plain = "";
  /** Flushes accumulated ordinary XML characters. @returns Nothing. */
  const flush =
    /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
    (): void => {
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

/** Maps model alignment to ODF values. @param alignment - Model alignment. @returns ODF value. */
function exportAlignment(alignment: OdfParagraphAlignment): string {
  if (alignment === "left") return "start";
  if (alignment === "right") return "end";
  return alignment;
}

/** Returns the effective paragraph character baseline. @param paragraph - Neutral paragraph. @returns Complete inherited properties. */
function paragraphInheritedProperties(paragraph: XMLTextParagraphSource): OdfCharacterProperties {
  return paragraph.inheritedProperties ?? {};
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

/** Emits supported ODF text-property attributes. @param properties - Direct properties. @param fontFaceName - Optional family-to-face resolver. @returns Attribute fragment. */
export function exportCharacterAttributes(
  properties: Partial<OdfCharacterProperties>,
  fontFaceName?: FontFaceNameResolver,
): string {
  assertOdfColor(properties.color, "auto", "font color");
  assertOdfColor(properties.highlight, "transparent", "highlight color");
  return [
    properties.color === undefined
      ? ""
      : properties.color === "auto"
        ? ' style:use-window-font-color="true"'
        : ` fo:color="${escapeXml(properties.color)}"`,
    properties.fontFamily === undefined
      ? ""
      : fontFaceName === undefined
        ? ` fo:font-family="${escapeXml(properties.fontFamily)}"`
        : ` style:font-name="${escapeXml(fontFaceName(properties.fontFamily, properties.fontFamilyGeneric, properties.fontStyleName, properties.fontPitch, properties.fontCharSet))}"`,
    properties.fontFamilyAsian !== undefined && fontFaceName !== undefined
      ? ` style:font-name-asian="${escapeXml(fontFaceName(properties.fontFamilyAsian, properties.fontFamilyGenericAsian, properties.fontStyleNameAsian, properties.fontPitchAsian, properties.fontCharSetAsian))}"`
      : "",
    properties.fontFamilyComplex !== undefined && fontFaceName !== undefined
      ? ` style:font-name-complex="${escapeXml(fontFaceName(properties.fontFamilyComplex, properties.fontFamilyGenericComplex, properties.fontStyleNameComplex, properties.fontPitchComplex, properties.fontCharSetComplex))}"`
      : "",
    properties.fontSizeTwips === undefined
      ? ""
      : ` fo:font-size="${properties.fontSizeTwips / 20}pt"`,
    properties.highlight === undefined
      ? ""
      : ` fo:background-color="${escapeXml(properties.highlight)}"`,
    properties.fontSizeTwipsAsian === undefined
      ? ""
      : ` style:font-size-asian="${properties.fontSizeTwipsAsian / 20}pt"`,
    properties.fontSizeTwipsComplex === undefined
      ? ""
      : ` style:font-size-complex="${properties.fontSizeTwipsComplex / 20}pt"`,
    exportTextCharacterProperties(properties),
  ].join("");
}

/** Rejects character colors outside the bounded upstream color mapping. @param value - Color value. @param special - Allowed Writer special value. @param label - Diagnostic label. @returns Nothing. */
function assertOdfColor(
  value: string | undefined,
  special: "auto" | "transparent",
  label: string,
): void {
  if (value !== undefined && !/^#[0-9a-f]{6}$/iu.test(value) && value !== special)
    throw new Error(`Unsupported ODF ${label}: ${value}`);
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

/** Projects the represented Writer unsigned16 offset through the original signed UNO/XML property. @param offset - Offset or void sentinel. @returns Native XML lexeme. */
function exportPageNumber(offset: number | "auto"): string {
  const value = new Any(),
    output: [string] = [""];
  if (offset !== "auto") value.insert([(offset << 16) >> 16], "sal_Int16");
  new XMLNumberWithAutoForVoidPropHdl().exportXML(output, value, new SvXMLUnitConverter("twip"));
  return output[0];
}
