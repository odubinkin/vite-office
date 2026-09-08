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
      if (paragraph.alignment !== undefined) {
        const key = paragraphStyleKey(paragraph.style, paragraph.alignment);
        if (!paragraphStyleNames.has(key))
          paragraphStyleNames.set(key, `P${paragraphStyleNames.size + 1}`);
      }
      paragraph.runs.forEach(
        /** Collects one non-default character style. @param run - Neutral text run. @returns Nothing. */
        (run) => {
          if (run.text.length === 0) throw new Error("ODF text runs must not be empty.");
          if (!isDefaultCharacterProperties(run.properties)) {
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
      const [style, alignment] = key.split(":") as [OdfParagraphStyle, OdfParagraphAlignment];
      const parent = style === "heading-1" ? "Heading_20_1" : "Standard";
      return `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${parent}"><style:paragraph-properties fo:text-align="${exportAlignment(alignment)}"/></style:style>`;
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
          paragraph.alignment === undefined
            ? baseStyleName
            : (paragraphStyleNames.get(
                paragraphStyleKey(paragraph.style, paragraph.alignment),
              ) as string);
        const content = paragraph.runs
          .map(
            /** Emits one plain or styled text fragment. @param run - Neutral run. @returns Inline XML. */
            (run) => {
              const encoded = exportText(run.text);
              if (isDefaultCharacterProperties(run.properties)) return encoded;
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

/** Creates an automatic paragraph style deduplication key. @param style - Parent style. @param alignment - Direct alignment. @returns Key. */
function paragraphStyleKey(style: OdfParagraphStyle, alignment: OdfParagraphAlignment): string {
  return `${style}:${alignment}`;
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

/** Reports whether no direct character property is set. @param properties - Candidate properties. @returns True for defaults. */
function isDefaultCharacterProperties(properties: OdfCharacterProperties): boolean {
  return !properties.bold && !properties.italic && !properties.underline;
}

/** Creates a stable style-deduplication key. @param properties - Character properties. @returns Key. */
function characterPropertiesKey(properties: OdfCharacterProperties): string {
  return `${Number(properties.bold)}${Number(properties.italic)}${Number(properties.underline)}`;
}

/** Restores properties from an internal key. @param key - Three-bit key. @returns Character properties. */
function parseCharacterPropertiesKey(key: string): OdfCharacterProperties {
  return { bold: key[0] === "1", italic: key[1] === "1", underline: key[2] === "1" };
}

/** Emits supported ODF text-property attributes. @param properties - Direct properties. @returns Attribute fragment. */
function exportCharacterAttributes(properties: OdfCharacterProperties): string {
  return [
    properties.bold ? ' fo:font-weight="bold"' : "",
    properties.italic ? ' fo:font-style="italic"' : "",
    properties.underline
      ? ' style:text-underline-style="solid" style:text-underline-width="auto"'
      : "",
  ].join("");
}
