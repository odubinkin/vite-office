/**
 * @fileoverview Declares the complete built-in Writer paragraph-style pool from the pinned
 * LibreOffice `sw/inc/poolfmt.hxx` and `SwStyleNameMapper.cxx` tables.
 */

/** Built-in paragraph-style groups encoded in the upper pool-id bits. */
export type WriterParagraphStyleGroup = "text" | "lists" | "extra" | "index" | "document" | "html";

/** Stable metadata for one built-in Writer paragraph style. */
export interface WriterParagraphStyleDefinition {
  readonly followId: string;
  readonly group: WriterParagraphStyleGroup;
  readonly id: string;
  readonly name: string;
  readonly parentId?: string;
  readonly poolId: number;
}

const groups = [
  {
    base: 1 << 11,
    group: "text",
    names: [
      "Standard",
      "Text body",
      "First line indent",
      "Hanging indent",
      "Text body indent",
      "Salutation",
      "Signature",
      "List Indent",
      "Marginalia",
    ],
  },
  {
    base: 2 << 11,
    group: "lists",
    names: [
      "List",
      ...Array.from(
        { length: 5 },
        /** Creates one numbering level quartet. @param _unused - Empty slot. @param index - Level. @returns Names. */ (
          _,
          index,
        ) => [
          `Numbering ${index + 1} Start`,
          `Numbering ${index + 1}`,
          `Numbering ${index + 1} End`,
          `Numbering ${index + 1} Cont.`,
        ],
      ).flat(),
      ...Array.from(
        { length: 5 },
        /** Creates one bullet level quartet. @param _unused - Empty slot. @param index - Level. @returns Names. */ (
          _,
          index,
        ) => [
          `List ${index + 1} Start`,
          `List ${index + 1}`,
          `List ${index + 1} End`,
          `List ${index + 1} Cont.`,
        ],
      ).flat(),
    ],
  },
  {
    base: 3 << 11,
    group: "extra",
    names: [
      "Header and Footer",
      "Header",
      "Header left",
      "Header right",
      "Footer",
      "Footer left",
      "Footer right",
      "Table Contents",
      "Table Heading",
      "Caption",
      "Illustration",
      "Table",
      "Text",
      "Figure",
      "Frame contents",
      "Footnote",
      "Addressee",
      "Sender",
      "Endnote",
      "Drawing",
      "Comment",
    ],
  },
  {
    base: 4 << 11,
    group: "index",
    names: [
      "Index",
      "Index Heading",
      "Index 1",
      "Index 2",
      "Index 3",
      "Index Separator",
      "Contents Heading",
      "Contents 1",
      "Contents 2",
      "Contents 3",
      "Contents 4",
      "Contents 5",
      "User Index Heading",
      "User Index 1",
      "User Index 2",
      "User Index 3",
      "User Index 4",
      "User Index 5",
      "Contents 6",
      "Contents 7",
      "Contents 8",
      "Contents 9",
      "Contents 10",
      "Figure Index Heading",
      "Figure Index 1",
      "Object index heading",
      "Object index 1",
      "Table index heading",
      "Table index 1",
      "Bibliography Heading",
      "Bibliography 1",
      "User Index 6",
      "User Index 7",
      "User Index 8",
      "User Index 9",
      "User Index 10",
    ],
  },
  {
    base: 5 << 11,
    group: "document",
    names: [
      "Title",
      "Subtitle",
      "Appendix",
      "Heading",
      ...Array.from(
        { length: 10 },
        /** Creates a heading name. @param _unused - Empty slot. @param index - Level. @returns Name. */ (
          _,
          index,
        ) => `Heading ${index + 1}`,
      ),
    ],
  },
  {
    base: 6 << 11,
    group: "html",
    names: ["Quotations", "Preformatted Text", "Horizontal Line", "List Contents", "List Heading"],
  },
] as const;

/** Converts a programmatic Writer style name to the browser-stable identity. @param name - Programmatic name. @returns Stable ID. */
export function getWriterParagraphStyleId(name: string): string {
  if (name === "Standard") return "default";
  return name
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

/** Resolves LibreOffice GetPoolParent semantics. @param group - Pool range. @param name - Programmatic name. @returns Parent identity. */
function getParentId(group: WriterParagraphStyleGroup, name: string): string | undefined {
  if (name === "Standard") return undefined;
  if (group === "text")
    return ["Text body", "Salutation", "Signature"].includes(name) ? "default" : "text-body";
  if (group === "lists") return name === "List" ? "text-body" : "list";
  if (group === "extra") {
    if (name === "Header and Footer") return "default";
    if (["Header", "Footer"].includes(name)) return "header-and-footer";
    if (name.startsWith("Header ")) return "header";
    if (name.startsWith("Footer ")) return "footer";
    if (name === "Table Heading") return "table-contents";
    if (["Illustration", "Table", "Text", "Figure", "Drawing"].includes(name)) return "caption";
    return "default";
  }
  if (group === "index") {
    if (name === "Index") return "default";
    if (name === "Index Heading") return "heading";
    if (name.endsWith("Heading") || name.endsWith("heading")) return "index-heading";
    return "index";
  }
  if (group === "document") return name === "Heading" ? "default" : "heading";
  return "default";
}

/** Complete ordered paragraph-style pool, preserving LibreOffice range and offset identities. */
export const WRITER_PARAGRAPH_STYLE_POOL: readonly WriterParagraphStyleDefinition[] =
  groups.flatMap(
    /** Expands one pool range. @param range - Group metadata. @returns Style definitions. */ ({
      base,
      group,
      names,
    }) =>
      names.map(
        /** Creates one pool entry. @param name - Programmatic name. @param offset - Range offset. @returns Definition. */ (
          name,
          offset,
        ) => {
          const id = getWriterParagraphStyleId(name);
          const followId =
            ["title", "subtitle", "appendix", "heading", "horizontal-line"].includes(id) ||
            /^heading-\d+$/.test(id)
              ? "text-body"
              : id === "list-heading"
                ? "list-contents"
                : id;
          const parentId = getParentId(group, name);
          return {
            followId,
            group,
            id,
            name,
            ...(parentId === undefined ? {} : { parentId }),
            poolId: base + offset,
          };
        },
      ),
  );

const implementedStyleIds = new Set([
  "default",
  "text-body",
  "first-line-indent",
  "hanging-indent",
  "text-body-indent",
  "marginalia",
  "heading",
  "caption",
  "footnote",
  "endnote",
  "comment",
  "header-right",
  "footer-right",
  "title",
  "subtitle",
  "appendix",
  "quotations",
  "preformatted-text",
  "table-heading",
]);

/** Styles whose current item-set construction has source-derived semantics rather than name-only metadata. */
export const WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL: readonly WriterParagraphStyleDefinition[] =
  WRITER_PARAGRAPH_STYLE_POOL.filter(
    /** Keeps only styles backed by implemented source-derived defaults. @param definition - Pool definition. @returns Whether the style is available. */
    (definition) =>
      implementedStyleIds.has(definition.id) ||
      /^heading-(10|[1-9])$/.test(definition.id) ||
      definition.id.endsWith("-heading"),
  );

/** Looks up immutable built-in metadata by programmatic identity. @param id - Stable ID. @returns Definition. */
export function getWriterParagraphStyleDefinition(
  id: string,
): WriterParagraphStyleDefinition | undefined {
  return WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Matches one ID. @param definition - Candidate. @returns Whether matching. */ (definition) =>
      definition.id === id,
  );
}

/** Encodes a Writer programmatic style name like SvXMLUnitConverter::encodeStyleName. @param name - Programmatic name. @returns XML style name. */
export function encodeWriterOdfStyleName(name: string): string {
  let encoded = "";
  for (let index = 0; index < name.length; index += 1) {
    const character = name[index] as string;
    const code = character.charCodeAt(0);
    const validAscii =
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a) ||
      (index > 0 && ((code >= 0x30 && code <= 0x39) || character === "-" || character === "."));
    const validLatin =
      (code >= 0x00c0 && code <= 0x00d6) ||
      (code >= 0x00d8 && code <= 0x00f6) ||
      (code >= 0x00f8 && code <= 0x00fe);
    const forbiddenUnicode =
      (code >= 0xf900 && code <= 0xfffe) || (code >= 0x20dd && code <= 0x20e0);
    const validUnicode =
      code >= 0x00ff &&
      !forbiddenUnicode &&
      (/^[\p{Lu}\p{Ll}\p{Lt}\p{Lo}\p{Nl}]$/u.test(character) ||
        (index > 0 && /^[\p{Mn}\p{Me}\p{Mc}\p{Lm}\p{Nd}]$/u.test(character)) ||
        (code >= 0x02bb && code <= 0x02c1) ||
        code === 0x0559 ||
        code === 0x06e5 ||
        code === 0x06e6 ||
        (index > 0 && code === 0x0387));
    if (validAscii || validLatin || validUnicode) {
      encoded += character;
      continue;
    }
    encoded += `_${code.toString(16)}_`;
  }
  return encoded.length <= 0x7fff ? encoded : name;
}

/** Maps a stable built-in identity to LibreOffice's encoded ODF style name. @param id - Stable ID. @returns ODF name. */
export function getWriterOdfStyleName(id: string): string {
  const definition = getWriterParagraphStyleDefinition(id);
  return definition === undefined ? id : encodeWriterOdfStyleName(definition.name);
}

/** Resolves an exported ODF name or a LibreOffice display name to a built-in identity. @param name - ODF name. @returns Stable ID. */
export function getWriterStyleIdFromOdfName(name: string): string | undefined {
  return WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Matches an ODF or programmatic name. @param definition - Candidate. @returns Whether matching. */ (
      definition,
    ) =>
      definition.id === name ||
      definition.name === name ||
      encodeWriterOdfStyleName(definition.name) === name,
  )?.id;
}
