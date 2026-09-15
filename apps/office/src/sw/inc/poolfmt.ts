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

/** Looks up immutable built-in metadata by programmatic identity. @param id - Stable ID. @returns Definition. */
export function getWriterParagraphStyleDefinition(
  id: string,
): WriterParagraphStyleDefinition | undefined {
  return WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Matches one ID. @param definition - Candidate. @returns Whether matching. */ (definition) =>
      definition.id === id,
  );
}

/** Maps the two legacy names exactly and uses stable IDs for the remaining built-ins. @param id - Stable ID. @returns ODF name. */
export function getWriterOdfStyleName(id: string): string {
  return id === "default" ? "Standard" : id === "heading-1" ? "Heading_20_1" : id;
}

/** Resolves an exported ODF name or a LibreOffice display name to a built-in identity. @param name - ODF name. @returns Stable ID. */
export function getWriterStyleIdFromOdfName(name: string): string | undefined {
  if (name === "Standard") return "default";
  if (name === "Heading_20_1") return "heading-1";
  return WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Matches an ODF or programmatic name. @param definition - Candidate. @returns Whether matching. */ (
      definition,
    ) => definition.id === name || definition.name === name,
  )?.id;
}
