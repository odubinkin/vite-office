/**
 * @fileoverview Reimplements the bounded ODF text paragraph export boundary from pinned LibreOffice `xmloff/source/text/txtparae.cxx`.
 */

export { ODF_NAMESPACES } from "../core/xmltoken";

/** Direct character properties supported by the bounded text exporter. */
export interface OdfCharacterProperties {
  readonly fontFamily?: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
}

/** One model-owned text fragment exposed to the streaming exporter. */
export interface XMLTextRunSource {
  readonly properties: OdfCharacterProperties;
  readonly text: string;
}

/** Writer paragraph styles supported by the bounded filter. */
export type XMLParagraphStyle = string;

/** Paragraph alignment values shared with the Writer model. */
export type OdfParagraphAlignment = "left" | "center" | "right" | "justify";

/** Marker family stored by one ODF list level style. */
export type OdfListLevelKind = "bullet" | "numbered";

/** Neutral projection of one document-owned Writer numbering rule. */
export interface XMLTextListRuleSource {
  /** Per-level character-special markers in zero-based Writer order. */
  readonly bulletChars?: readonly (string | undefined)[];
  /** Per-level marker families in zero-based Writer order. */
  readonly formats: readonly OdfListLevelKind[];
  /** Canonical SwNumRule name. */
  readonly name: string;
}

/** Neutral list attributes applied to one paragraph. */
export interface XMLTextListSource {
  /** Effective Writer list identity. */
  readonly listId: string;
  /** Zero-based Writer list level. */
  readonly level: number;
  /** Document numbering rule. */
  readonly rule: XMLTextListRuleSource;
}

/** Narrow live view of one canonical Writer paragraph. */
export interface XMLTextParagraphSource {
  readonly alignment?: OdfParagraphAlignment;
  readonly inheritedProperties?: OdfCharacterProperties;
  readonly list?: XMLTextListSource;
  readonly properties?: Partial<OdfCharacterProperties>;
  readonly runs: readonly XMLTextRunSource[];
  readonly style: XMLParagraphStyle;
  readonly styleName?: string;
}

/** Reiterable model-facing source; definitions are collected before body references. */
export interface XMLTextExportSource {
  paragraphs(): Iterable<XMLTextParagraphSource>;
}

/** Serialized automatic styles and paragraph body fragment. */
export interface OdfTextExport {
  readonly automaticStyles: string;
  readonly body: string;
}

/** Exports live Writer paragraphs into ODF automatic styles and text elements. @param source - Reiterable model source. @param isCancelled - Cooperative cancellation probe. @param fontFaceName - Optional family-to-face resolver. @returns XML fragments. */
export function exportTextParagraphs(
  source: XMLTextExportSource,
  isCancelled: () => boolean = /** Never cancels. @returns False. */ () => false,
  fontFaceName?: (familyName: string) => string,
): OdfTextExport {
  const paragraphStyleNames = new Map<string, string>();
  const characterStyleNames = new Map<string, string>();
  const listRules = new Map<string, XMLTextListRuleSource>();
  for (const paragraph of source.paragraphs()) {
    if (isCancelled()) throw new Error("ODT operation was cancelled.");
    if (paragraph.list !== undefined) {
      const list = paragraph.list;
      assertList(list);
      const existing = listRules.get(list.rule.name);
      if (
        existing !== undefined &&
        (existing.formats.some(
          /** Detects a conflicting list level. @param kind - Existing kind. @param index - Level. @returns Whether conflicting. */
          (kind, index) => kind !== list.rule.formats[index],
        ) ||
          existing.formats.some(
            /** Detects a conflicting character-special marker. @param kind - Existing kind. @param index - Level. @returns Whether conflicting. */
            (kind, index) =>
              kind === "bullet" &&
              (existing.bulletChars?.[index] ?? "•") !== (list.rule.bulletChars?.[index] ?? "•"),
          ))
      )
        throw new Error(`Conflicting ODF list rule: ${list.rule.name}`);
      listRules.set(list.rule.name, list.rule);
    }
    if (paragraph.alignment !== undefined || paragraph.properties !== undefined) {
      const key = paragraphStyleKey(
        getOdfStyleName(paragraph),
        paragraph.alignment,
        paragraph.properties,
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
  const paragraphStyles = [...paragraphStyleNames].map(
    /** Emits one automatic paragraph style. @param entry - Internal key and ODF name. @returns Style XML. */
    (entry) => {
      const [key, name] = entry;
      const [style, alignment, propertiesKey] = key.split(":") as [
        XMLParagraphStyle,
        OdfParagraphAlignment | "",
        string,
      ];
      const parent = style;
      const paragraphProperties =
        alignment === ""
          ? ""
          : `<style:paragraph-properties fo:text-align="${exportAlignment(alignment)}"/>`;
      const properties = parseCharacterPropertiesKey(propertiesKey);
      const textProperties =
        propertiesKey === "---|"
          ? ""
          : `<style:text-properties${exportCharacterAttributes(properties, fontFaceName)}/>`;
      return `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${parent}">${paragraphProperties}${textProperties}</style:style>`;
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
  const listStyleNames = new Map<string, string>();
  const listStyles = [...listRules.values()].map(
    /** Emits one automatic ODF list style. @param rule - Writer numbering rule. @param index - Stable style index. @returns Style XML. */
    (rule, index) => {
      const name = `L${index + 1}`;
      listStyleNames.set(rule.name, name);
      const levels = rule.formats
        .map(
          /** Emits one list-level style. @param kind - Marker family. @param level - Zero-based Writer level. @returns Level XML. */
          (kind, level) =>
            kind === "bullet"
              ? `<text:list-level-style-bullet text:level="${level + 1}" text:bullet-char="${escapeXml(rule.bulletChars?.[level] ?? "•")}"/>`
              : `<text:list-level-style-number text:level="${level + 1}" style:num-format="1"/>`,
        )
        .join("");
      return `<text:list-style style:name="${name}" style:display-name="${escapeXml(rule.name)}">${levels}</text:list-style>`;
    },
  );
  const body = exportParagraphBody(
    source.paragraphs(),
    paragraphStyleNames,
    characterStyleNames,
    listStyleNames,
    isCancelled,
  );
  return {
    automaticStyles: [...paragraphStyles, ...characterStyles, ...listStyles].join(""),
    body,
  };
}

/** Emits the ordered paragraph stream, nesting list paragraphs in text:list/text:list-item elements. @param paragraphs - Flat paragraph sequence. @param paragraphStyleNames - Automatic paragraph styles. @param characterStyleNames - Automatic text styles. @param listStyleNames - Automatic list styles. @param isCancelled - Cancellation probe. @returns ODF body fragment. */
function exportParagraphBody(
  paragraphs: Iterable<XMLTextParagraphSource>,
  paragraphStyleNames: ReadonlyMap<string, string>,
  characterStyleNames: ReadonlyMap<string, string>,
  listStyleNames: ReadonlyMap<string, string>,
  isCancelled: () => boolean,
): string {
  let body = "";
  let activeListId: string | undefined;
  const openRules: string[] = [];
  const listIdentities = new Map<string, { readonly rootId: string; segments: number }>();
  const usedXmlIds = new Set<string>();

  /** Closes every currently open list item and list. @returns Nothing. */
  function closeAllLists(): void {
    while (openRules.length > 0) {
      body += "</text:list-item></text:list>";
      openRules.pop();
    }
    activeListId = undefined;
  }

  /** Opens one list level and its first item. @param paragraphList - Source list metadata. @param root - Whether this is a root list block. @returns Nothing. */
  function openListLevel(paragraphList: XMLTextListSource, root: boolean): void {
    const styleName = listStyleNames.get(paragraphList.rule.name) as string;
    let identityAttributes = "";
    if (root) {
      const prior = listIdentities.get(paragraphList.listId);
      if (prior === undefined) {
        const rootId = createXmlId(paragraphList.listId, usedXmlIds);
        listIdentities.set(paragraphList.listId, { rootId, segments: 1 });
        identityAttributes = ` xml:id="${rootId}"`;
      } else {
        prior.segments += 1;
        const segmentId = createXmlId(`${prior.rootId}-${prior.segments}`, usedXmlIds);
        identityAttributes = ` xml:id="${segmentId}" text:continue-list="${prior.rootId}"`;
      }
    }
    body += `<text:list text:style-name="${styleName}"${identityAttributes}><text:list-item>`;
    openRules.push(paragraphList.rule.name);
  }

  for (const paragraph of paragraphs) {
    if (isCancelled()) throw new Error("ODT operation was cancelled.");
    const paragraphXml = exportParagraphElement(
      paragraph,
      paragraphStyleNames,
      characterStyleNames,
    );
    if (paragraph.list === undefined) {
      closeAllLists();
      body += paragraphXml;
      continue;
    }
    const list = paragraph.list;
    const currentRuleAtLevel = openRules[list.level];
    if (
      activeListId !== undefined &&
      (activeListId !== list.listId ||
        (currentRuleAtLevel !== undefined && currentRuleAtLevel !== list.rule.name))
    )
      closeAllLists();
    if (openRules.length === 0) {
      activeListId = list.listId;
      for (let level = 0; level <= list.level; level += 1) openListLevel(list, level === 0);
    } else if (list.level >= openRules.length) {
      while (openRules.length <= list.level) openListLevel(list, false);
    } else {
      while (openRules.length - 1 > list.level) {
        body += "</text:list-item></text:list>";
        openRules.pop();
      }
      body += "</text:list-item><text:list-item>";
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
    paragraph.alignment === undefined && paragraph.properties === undefined
      ? baseStyleName
      : (paragraphStyleNames.get(
          paragraphStyleKey(baseStyleName, paragraph.alignment, paragraph.properties),
        ) as string);
  const content = paragraph.runs
    .map(
      /** Emits one plain or styled text fragment. @param run - Neutral run. @returns Inline XML. */
      (run) => {
        const encoded = exportText(run.text);
        if (equalCharacterProperties(run.properties, paragraphInheritedProperties(paragraph)))
          return encoded;
        const name = characterStyleNames.get(characterPropertiesKey(run.properties)) as string;
        return `<text:span text:style-name="${name}">${encoded}</text:span>`;
      },
    )
    .join("");
  return paragraph.style === "heading-1"
    ? `<text:h text:outline-level="1" text:style-name="${styleName}">${content}</text:h>`
    : `<text:p text:style-name="${styleName}">${content}</text:p>`;
}

/** Validates list metadata before XML generation. @param list - Neutral list state. @returns Nothing. */
function assertList(list: XMLTextListSource): void {
  if (!Number.isInteger(list.level) || list.level < 0 || list.level >= list.rule.formats.length)
    throw new Error("ODF list level is outside its numbering rule.");
  if (list.listId.length === 0 || list.rule.name.length === 0)
    throw new Error("ODF list identity and rule name must not be blank.");
  if (list.rule.formats.length !== 10)
    throw new Error("ODF list rule must define ten Writer levels.");
  if (list.rule.bulletChars !== undefined && list.rule.bulletChars.length !== 10)
    throw new Error("ODF list rule must define ten Writer bullet characters.");
  list.rule.bulletChars?.forEach(
    /** Validates one upstream-shaped character-special marker. @param bulletChar - Marker value. @returns Nothing. */
    (bulletChar) => {
      if (bulletChar !== undefined && [...bulletChar].length > 1)
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

/** Creates an automatic paragraph style deduplication key. @param style - Parent style. @param alignment - Direct alignment. @param properties - Direct character properties. @returns Key. */
function paragraphStyleKey(
  style: XMLParagraphStyle,
  alignment?: OdfParagraphAlignment,
  properties?: Partial<OdfCharacterProperties>,
): string {
  return `${style}:${alignment ?? ""}:${partialCharacterPropertiesKey(properties)}`;
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
function exportText(value: string): string {
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
  return paragraph.inheritedProperties ?? { bold: false, italic: false, underline: false };
}

/** Compares complete character properties. @param left - First properties. @param right - Second properties. @returns Whether equal. */
function equalCharacterProperties(
  left: OdfCharacterProperties,
  right: OdfCharacterProperties,
): boolean {
  return (
    left.bold === right.bold &&
    left.italic === right.italic &&
    left.underline === right.underline &&
    left.fontFamily === right.fontFamily
  );
}

/** Creates a stable style-deduplication key. @param properties - Character properties. @returns Key. */
function characterPropertiesKey(properties: OdfCharacterProperties): string {
  return `${Number(properties.bold)}${Number(properties.italic)}${Number(properties.underline)}|${encodeURIComponent(properties.fontFamily ?? "")}`;
}

/** Creates a three-state character key for automatic paragraph styles. @param properties - Optional direct deltas. @returns Stable key. */
function partialCharacterPropertiesKey(properties?: Partial<OdfCharacterProperties>): string {
  return `${[properties?.bold, properties?.italic, properties?.underline]
    .map(
      /** Encodes undefined, false, or true. @param value - Direct property. @returns One key character. */
      (value) => (value === undefined ? "-" : Number(value).toString()),
    )
    .join("")}|${encodeURIComponent(properties?.fontFamily ?? "")}`;
}

/** Restores properties from an internal key. @param key - Three-bit key. @returns Character properties. */
function parseCharacterPropertiesKey(key: string): Partial<OdfCharacterProperties> {
  const decode =
    /** Decodes one three-state property. @param value - Key character. @returns Direct property. */
    (value: string | undefined): boolean | undefined =>
      value === "-" || value === undefined ? undefined : value === "1";
  const [flags = "---", encodedFont = ""] = key.split("|");
  const bold = decode(flags[0]);
  const italic = decode(flags[1]);
  const underline = decode(flags[2]);
  const fontFamily = decodeURIComponent(encodedFont);
  return {
    ...(bold === undefined ? {} : { bold }),
    ...(italic === undefined ? {} : { italic }),
    ...(underline === undefined ? {} : { underline }),
    ...(fontFamily.length === 0 ? {} : { fontFamily }),
  };
}

/** Emits supported ODF text-property attributes. @param properties - Direct properties. @param fontFaceName - Optional family-to-face resolver. @returns Attribute fragment. */
export function exportCharacterAttributes(
  properties: Partial<OdfCharacterProperties>,
  fontFaceName?: (familyName: string) => string,
): string {
  return [
    properties.fontFamily === undefined
      ? ""
      : fontFaceName === undefined
        ? ` fo:font-family="${escapeXml(properties.fontFamily)}"`
        : ` style:font-name="${escapeXml(fontFaceName(properties.fontFamily))}" style:font-name-asian="${escapeXml(fontFaceName(properties.fontFamily))}" style:font-name-complex="${escapeXml(fontFaceName(properties.fontFamily))}"`,
    properties.bold === undefined
      ? ""
      : ` fo:font-weight="${properties.bold ? "bold" : "normal"}" style:font-weight-asian="${properties.bold ? "bold" : "normal"}" style:font-weight-complex="${properties.bold ? "bold" : "normal"}"`,
    properties.italic === undefined
      ? ""
      : ` fo:font-style="${properties.italic ? "italic" : "normal"}" style:font-style-asian="${properties.italic ? "italic" : "normal"}" style:font-style-complex="${properties.italic ? "italic" : "normal"}"`,
    properties.underline === undefined
      ? ""
      : ` style:text-underline-style="${properties.underline ? "solid" : "none"}"${properties.underline ? ' style:text-underline-width="auto"' : ""}`,
  ].join("");
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
