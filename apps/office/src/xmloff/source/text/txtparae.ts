/**
 * @fileoverview Reimplements the bounded ODF text paragraph export boundary from pinned LibreOffice `xmloff/source/text/txtparae.cxx`.
 */

/** ODF namespace URIs used by the Writer XML filters. */
export const ODF_NAMESPACES = {
  dc: "http://purl.org/dc/elements/1.1/",
  fo: "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
  manifest: "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
  meta: "urn:oasis:names:tc:opendocument:xmlns:meta:1.0",
  office: "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
  style: "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
  text: "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
} as const;

/** Direct character properties supported by the bounded text exporter. */
export interface OdfCharacterProperties {
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
}

/** One non-empty text fragment and its direct properties. */
export interface OdfTextRun {
  readonly properties: OdfCharacterProperties;
  readonly text: string;
}

/** Writer paragraph styles supported by the bounded filter. */
export type OdfParagraphStyle = "default" | "heading-1";

/** Paragraph alignment values shared with the Writer model. */
export type OdfParagraphAlignment = "left" | "center" | "right" | "justify";

/** Neutral paragraph record passed between Writer and xmloff. */
export interface OdfParagraph {
  readonly alignment?: OdfParagraphAlignment;
  readonly inheritedProperties?: OdfCharacterProperties;
  readonly properties?: Partial<OdfCharacterProperties>;
  readonly runs: readonly OdfTextRun[];
  readonly style: OdfParagraphStyle;
}

/** Serialized automatic styles and paragraph body fragment. */
export interface OdfTextExport {
  readonly automaticStyles: string;
  readonly body: string;
}

/** Exports Writer-neutral paragraphs into ODF automatic styles and text elements. @param paragraphs - Ordered paragraphs. @returns XML fragments. */
export function exportTextParagraphs(paragraphs: readonly OdfParagraph[]): OdfTextExport {
  const paragraphStyleNames = new Map<string, string>();
  const characterStyleNames = new Map<string, string>();
  paragraphs.forEach(
    /** Collects automatic styles used by one paragraph. @param paragraph - Neutral paragraph. @returns Nothing. */
    (paragraph) => {
      if (paragraph.alignment !== undefined || paragraph.properties !== undefined) {
        const key = paragraphStyleKey(paragraph.style, paragraph.alignment, paragraph.properties);
        if (!paragraphStyleNames.has(key))
          paragraphStyleNames.set(key, `P${paragraphStyleNames.size + 1}`);
      }
      paragraph.runs.forEach(
        /** Collects one non-default character style. @param run - Neutral text run. @returns Nothing. */
        (run) => {
          if (run.text.length === 0) throw new Error("ODF text runs must not be empty.");
          if (!equalCharacterProperties(run.properties, paragraphInheritedProperties(paragraph))) {
            const key = characterPropertiesKey(run.properties);
            if (!characterStyleNames.has(key))
              characterStyleNames.set(key, `T${characterStyleNames.size + 1}`);
          }
        },
      );
    },
  );
  const paragraphStyles = [...paragraphStyleNames].map(
    /** Emits one automatic paragraph style. @param entry - Internal key and ODF name. @returns Style XML. */
    (entry) => {
      const [key, name] = entry;
      const [style, alignment, propertiesKey] = key.split(":") as [
        OdfParagraphStyle,
        OdfParagraphAlignment | "",
        string,
      ];
      const parent = style === "heading-1" ? "Heading_20_1" : "Standard";
      const paragraphProperties =
        alignment === ""
          ? ""
          : `<style:paragraph-properties fo:text-align="${exportAlignment(alignment)}"/>`;
      const properties = parseCharacterPropertiesKey(propertiesKey);
      const textProperties =
        propertiesKey === "---"
          ? ""
          : `<style:text-properties${exportCharacterAttributes(properties)}/>`;
      return `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${parent}">${paragraphProperties}${textProperties}</style:style>`;
    },
  );
  const characterStyles = [...characterStyleNames].map(
    /** Emits one automatic character style. @param entry - Internal key and ODF name. @returns Style XML. */
    (entry) => {
      const [key, name] = entry;
      const properties = parseCharacterPropertiesKey(key);
      return `<style:style style:name="${name}" style:family="text"><style:text-properties${exportCharacterAttributes(properties)}/></style:style>`;
    },
  );
  const body = paragraphs
    .map(
      /** Emits one ODF paragraph or heading. @param paragraph - Neutral paragraph. @returns Text XML. */
      (paragraph) => {
        const baseStyleName = paragraph.style === "heading-1" ? "Heading_20_1" : "Standard";
        const styleName =
          paragraph.alignment === undefined && paragraph.properties === undefined
            ? baseStyleName
            : (paragraphStyleNames.get(
                paragraphStyleKey(paragraph.style, paragraph.alignment, paragraph.properties),
              ) as string);
        const content = paragraph.runs
          .map(
            /** Emits one plain or styled text fragment. @param run - Neutral run. @returns Inline XML. */
            (run) => {
              const encoded = exportText(run.text);
              if (equalCharacterProperties(run.properties, paragraphInheritedProperties(paragraph)))
                return encoded;
              const name = characterStyleNames.get(
                characterPropertiesKey(run.properties),
              ) as string;
              return `<text:span text:style-name="${name}">${encoded}</text:span>`;
            },
          )
          .join("");
        return paragraph.style === "heading-1"
          ? `<text:h text:outline-level="1" text:style-name="${styleName}">${content}</text:h>`
          : `<text:p text:style-name="${styleName}">${content}</text:p>`;
      },
    )
    .join("");
  return { automaticStyles: [...paragraphStyles, ...characterStyles].join(""), body };
}

/** Creates an automatic paragraph style deduplication key. @param style - Parent style. @param alignment - Direct alignment. @param properties - Direct character properties. @returns Key. */
function paragraphStyleKey(
  style: OdfParagraphStyle,
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
function paragraphInheritedProperties(paragraph: OdfParagraph): OdfCharacterProperties {
  return paragraph.inheritedProperties ?? { bold: false, italic: false, underline: false };
}

/** Compares complete character properties. @param left - First properties. @param right - Second properties. @returns Whether equal. */
function equalCharacterProperties(
  left: OdfCharacterProperties,
  right: OdfCharacterProperties,
): boolean {
  return (
    left.bold === right.bold && left.italic === right.italic && left.underline === right.underline
  );
}

/** Creates a stable style-deduplication key. @param properties - Character properties. @returns Key. */
function characterPropertiesKey(properties: OdfCharacterProperties): string {
  return `${Number(properties.bold)}${Number(properties.italic)}${Number(properties.underline)}`;
}

/** Creates a three-state character key for automatic paragraph styles. @param properties - Optional direct deltas. @returns Stable key. */
function partialCharacterPropertiesKey(properties?: Partial<OdfCharacterProperties>): string {
  return [properties?.bold, properties?.italic, properties?.underline]
    .map(
      /** Encodes undefined, false, or true. @param value - Direct property. @returns One key character. */
      (value) => (value === undefined ? "-" : Number(value).toString()),
    )
    .join("");
}

/** Restores properties from an internal key. @param key - Three-bit key. @returns Character properties. */
function parseCharacterPropertiesKey(key: string): Partial<OdfCharacterProperties> {
  const decode =
    /** Decodes one three-state property. @param value - Key character. @returns Direct property. */
    (value: string | undefined): boolean | undefined =>
      value === "-" || value === undefined ? undefined : value === "1";
  const bold = decode(key[0]);
  const italic = decode(key[1]);
  const underline = decode(key[2]);
  return {
    ...(bold === undefined ? {} : { bold }),
    ...(italic === undefined ? {} : { italic }),
    ...(underline === undefined ? {} : { underline }),
  };
}

/** Emits supported ODF text-property attributes. @param properties - Direct properties. @returns Attribute fragment. */
export function exportCharacterAttributes(properties: Partial<OdfCharacterProperties>): string {
  return [
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
