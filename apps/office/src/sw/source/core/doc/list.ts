/**
 * @fileoverview Defines the serializable first-layer Writer list format and legacy normalization, corresponding to LibreOffice Writer's `sw/source/core/doc/list.cxx` ownership boundary.
 */

/** Enumerates list variants currently mapped to LibreOffice Writer's default bullet and numbering commands. */
export const WRITER_PARAGRAPH_LIST_KINDS = ["none", "bullet", "numbered"] as const;

/** Defines the deepest bounded list nesting level currently supported by the browser Writer document model. */
export const WRITER_MAX_LIST_LEVEL = 9;

/** Identifies the list presentation currently applied to one Writer paragraph. */
export type WriterParagraphListKind = (typeof WRITER_PARAGRAPH_LIST_KINDS)[number];

/** Describes a list-capable paragraph subset consumed by marker calculation without importing the complete Writer document model. */
/** Describes serializable list metadata that can grow toward Writer levels and named list styles. */
export interface WriterParagraphList {
  /** Default list presentation applied by the current Writer command slice. */
  readonly kind: WriterParagraphListKind;
  /** Zero-based nesting level bounded by WRITER_MAX_LIST_LEVEL. */
  readonly level: number;
  /** SwNumRule name projected from the paragraph item set, when one is retained or applied. */
  readonly styleId?: string;
}

/**
 * Creates the ordinary non-list state assigned to new Writer paragraphs and legacy snapshots.
 *
 * @returns Immutable default list metadata with no marker and the root list level.
 */
export function createDefaultWriterParagraphList(): WriterParagraphList {
  return { kind: "none", level: 0 };
}

/**
 * Checks whether an unknown runtime value is one of the currently supported Writer paragraph list variants.
 *
 * @param value - Runtime candidate supplied by storage or a UI boundary.
 * @returns True only when value exactly matches a supported list kind.
 */
export function isWriterParagraphListKind(value: unknown): value is WriterParagraphListKind {
  return WRITER_PARAGRAPH_LIST_KINDS.some(
    /** Compares one supported list kind with the runtime candidate. @param kind - Supported list kind. @returns True when kind matches value. */
    function matchesListKind(kind): boolean {
      return kind === value;
    },
  );
}

/**
 * Normalizes an unknown stored list value without changing valid current list metadata.
 *
 * @param value - Stored candidate from a legacy or malformed browser-local Writer snapshot.
 * @returns Valid current list metadata, defaulting malformed data to a non-list root state.
 */
export function normalizeWriterParagraphList(value: unknown): WriterParagraphList {
  if (typeof value !== "object" || value === null) return createDefaultWriterParagraphList();
  const candidate = value as Partial<WriterParagraphList>;
  const kind = isWriterParagraphListKind(candidate.kind) ? candidate.kind : "none";
  const level =
    Number.isInteger(candidate.level) && (candidate.level as number) >= 0
      ? Math.min(candidate.level as number, WRITER_MAX_LIST_LEVEL)
      : 0;
  const styleId =
    typeof candidate.styleId === "string" && candidate.styleId.trim().length > 0
      ? candidate.styleId
      : undefined;
  return styleId === undefined ? { kind, level } : { kind, level, styleId };
}
