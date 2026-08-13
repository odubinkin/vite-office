/**
 * @fileoverview Defines immutable Writer text-node runs and direct character attributes at the LibreOffice `sw/source/core/txtnode/ndtxt.cxx` ownership boundary.
 */

/** Names the bounded direct character attributes currently supported by the browser Writer. */
export const WRITER_CHARACTER_FORMATS = ["bold", "italic", "underline"] as const;

/** Identifies one supported direct Writer character attribute. */
export type WriterCharacterFormat = (typeof WRITER_CHARACTER_FORMATS)[number];

/** Describes direct character attributes applied uniformly to one text run. */
export interface WriterCharacterAttributes {
  /** Whether the text run renders with a bold font weight. */
  readonly bold: boolean;
  /** Whether the text run renders with an italic font posture. */
  readonly italic: boolean;
  /** Whether the text run renders with a single underline. */
  readonly underline: boolean;
}

/** Describes one non-empty immutable Writer text fragment and its direct attributes. */
export interface WriterTextRun {
  /** Direct character attributes applied to every code unit in text. */
  readonly attributes: WriterCharacterAttributes;
  /** Non-empty UTF-16 text fragment. */
  readonly text: string;
}

/** Stores the empty direct-formatting state used for new Writer text. */
export const DEFAULT_WRITER_CHARACTER_ATTRIBUTES: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};

/**
 * Creates one unformatted text-run sequence from plain text.
 *
 * @param text - Complete Writer paragraph text to represent as runs.
 * @returns No runs for empty text, otherwise one default-attribute text run.
 */
export function createWriterTextRuns(text: string): readonly WriterTextRun[] {
  return text.length === 0 ? [] : [{ attributes: DEFAULT_WRITER_CHARACTER_ATTRIBUTES, text }];
}

/**
 * Converts a normalized or legacy run collection to its exact visible plain text.
 *
 * @param runs - Text runs read from a Writer paragraph or browser boundary.
 * @returns Concatenated visible UTF-16 text with invalid fragments omitted.
 */
export function getWriterTextFromRuns(runs: unknown): string {
  return normalizeWriterTextRuns(runs)
    .map(
      /** Extracts a normalized run body. @param run - Valid normalized text run. @returns Its visible text. */
      function selectRunText(run): string {
        return run.text;
      },
    )
    .join("");
}

/**
 * Normalizes untrusted Writer run data, removing empty fragments and merging adjacent equal attributes.
 *
 * @param candidate - Unknown persisted or caller-supplied run collection.
 * @returns Immutable normalized direct-format text runs.
 */
export function normalizeWriterTextRuns(candidate: unknown): readonly WriterTextRun[] {
  if (!Array.isArray(candidate)) return [];
  const runs: WriterTextRun[] = [];
  candidate.forEach(
    /** Parses and appends one valid non-empty persisted run. @param item - Unknown persisted run. @returns Nothing; valid normalized output is accumulated. */
    function appendNormalizedRun(item): void {
      if (!isRecord(item) || typeof item.text !== "string" || item.text.length === 0) return;
      const attributes = normalizeWriterCharacterAttributes(item.attributes);
      const previous = runs[runs.length - 1];
      if (
        previous !== undefined &&
        areWriterCharacterAttributesEqual(previous.attributes, attributes)
      ) {
        runs[runs.length - 1] = { ...previous, text: `${previous.text}${item.text}` };
      } else {
        runs.push({ attributes, text: item.text });
      }
    },
  );
  return runs;
}

/**
 * Normalizes unknown direct character attributes to the bounded Writer subset.
 *
 * @param candidate - Unknown attributes read from storage or a command boundary.
 * @returns Immutable attributes with unsupported or absent values treated as false.
 */
export function normalizeWriterCharacterAttributes(candidate: unknown): WriterCharacterAttributes {
  const attributes = isRecord(candidate) ? candidate : {};
  return {
    bold: attributes.bold === true,
    italic: attributes.italic === true,
    underline: attributes.underline === true,
  };
}

/**
 * Applies one direct format to a non-empty same-paragraph text range, toggling it off only when every selected character already has it.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param start - Inclusive UTF-16 paragraph offset where the selection begins.
 * @param end - Exclusive UTF-16 paragraph offset where the selection ends.
 * @param format - Direct character format selected by the Writer command.
 * @returns Original normalized runs for an empty range, otherwise a normalized formatted replacement.
 * @throws {Error} When range offsets are not integer bounds of the visible run text.
 */
export function toggleWriterTextRangeFormat(
  runs: readonly WriterTextRun[],
  start: number,
  end: number,
  format: WriterCharacterFormat,
): readonly WriterTextRun[] {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end > textLength ||
    start > end
  )
    throw new Error("Writer character-format range is outside the paragraph.");
  if (start === end) return normalized;
  let offset = 0;
  const selectedAlreadyFormatted = normalized
    .filter(
      /** Retains text runs intersected by the requested non-empty range. @param run - Normalized text run. @returns True only for range-intersecting runs. */
      function intersectsRange(run): boolean {
        const runEnd = offset + run.text.length;
        const intersects = offset < end && runEnd > start;
        offset = runEnd;
        return intersects;
      },
    )
    .every(
      /** Checks whether one intersected run already owns the requested format. @param run - Intersected normalized run. @returns True only when the requested format is enabled. */
      function hasFormat(run): boolean {
        return run.attributes[format];
      },
    );
  offset = 0;
  return normalizeWriterTextRuns(
    normalized.flatMap(
      /** Splits one intersected run at range boundaries and updates only its selected fragment. @param run - Normalized source text run. @returns One to three immutable replacement runs. */
      function formatIntersectedRun(run): readonly WriterTextRun[] {
        const runStart = offset;
        const runEnd = runStart + run.text.length;
        offset = runEnd;
        if (runStart >= end || runEnd <= start) return [run];
        const beforeLength = Math.max(0, start - runStart);
        const afterStart = Math.min(run.text.length, end - runStart);
        const before = run.text.slice(0, beforeLength);
        const selected = run.text.slice(beforeLength, afterStart);
        const after = run.text.slice(afterStart);
        const attributes = { ...run.attributes, [format]: !selectedAlreadyFormatted };
        return [
          ...(before.length === 0 ? [] : [{ attributes: run.attributes, text: before }]),
          { attributes, text: selected },
          ...(after.length === 0 ? [] : [{ attributes: run.attributes, text: after }]),
        ];
      },
    ),
  );
}

/**
 * Inserts text at one UTF-16 offset with the supplied direct attributes.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param offset - UTF-16 insertion offset from zero through visible text length.
 * @param text - Text to insert unchanged.
 * @param attributes - Direct attributes inherited by the inserted text.
 * @returns Normalized runs containing the inserted text, or the original normalized runs for empty text.
 * @throws {Error} When offset is outside visible text bounds.
 */
export function insertWriterTextRun(
  runs: readonly WriterTextRun[],
  offset: number,
  text: string,
  attributes: WriterCharacterAttributes,
): readonly WriterTextRun[] {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength)
    throw new Error("Writer text insertion offset is outside the paragraph.");
  if (text.length === 0) return normalized;
  const inserted = { attributes: normalizeWriterCharacterAttributes(attributes), text };
  let consumed = 0;
  let insertedRun = false;
  const nextRuns = normalized.flatMap(
    /** Inserts the run before, inside, or after exactly one source fragment. @param run - Normalized source run. @returns One or more replacement runs. */
    function insertIntoRun(run): readonly WriterTextRun[] {
      const runStart = consumed;
      const runEnd = runStart + run.text.length;
      consumed = runEnd;
      if (insertedRun || offset < runStart || offset > runEnd) return [run];
      insertedRun = true;
      const localOffset = offset - runStart;
      return [
        ...(localOffset === 0
          ? []
          : [{ attributes: run.attributes, text: run.text.slice(0, localOffset) }]),
        inserted,
        ...(localOffset === run.text.length
          ? []
          : [{ attributes: run.attributes, text: run.text.slice(localOffset) }]),
      ];
    },
  );
  return normalizeWriterTextRuns(insertedRun ? nextRuns : [...nextRuns, inserted]);
}

/**
 * Splits runs at one valid UTF-16 paragraph offset.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param offset - UTF-16 split offset from zero through visible text length.
 * @returns Immutable prefix and suffix run collections preserving direct attributes.
 * @throws {Error} When offset is outside visible text bounds.
 */
export function splitWriterTextRuns(
  runs: readonly WriterTextRun[],
  offset: number,
): Readonly<{ prefix: readonly WriterTextRun[]; suffix: readonly WriterTextRun[] }> {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength)
    throw new Error("Writer text split offset is outside the paragraph.");
  let consumed = 0;
  const prefix: WriterTextRun[] = [];
  const suffix: WriterTextRun[] = [];
  normalized.forEach(
    /** Splits one run only when it crosses offset. @param run - Normalized source run. @returns Nothing; prefix and suffix collections are accumulated. */
    function splitRun(run): void {
      const runStart = consumed;
      const runEnd = runStart + run.text.length;
      consumed = runEnd;
      if (runEnd <= offset) prefix.push(run);
      else if (runStart >= offset) suffix.push(run);
      else {
        const localOffset = offset - runStart;
        prefix.push({ attributes: run.attributes, text: run.text.slice(0, localOffset) });
        suffix.push({ attributes: run.attributes, text: run.text.slice(localOffset) });
      }
    },
  );
  return { prefix: normalizeWriterTextRuns(prefix), suffix: normalizeWriterTextRuns(suffix) };
}

/**
 * Reads direct attributes inherited by a collapsed Writer caret.
 *
 * @param runs - Existing normalized Writer text runs.
 * @param offset - UTF-16 caret offset from zero through visible text length.
 * @returns Attributes of the preceding character when present, otherwise following character, otherwise defaults.
 * @throws {Error} When offset is outside visible text bounds.
 */
export function getWriterTextAttributesAtOffset(
  runs: readonly WriterTextRun[],
  offset: number,
): WriterCharacterAttributes {
  const normalized = normalizeWriterTextRuns(runs);
  const textLength = getWriterTextFromRuns(normalized).length;
  if (!Number.isInteger(offset) || offset < 0 || offset > textLength)
    throw new Error("Writer character-format caret is outside the paragraph.");
  let consumed = 0;
  const run = normalized.find(
    /** Finds the run containing the character before the caret, or the following run at a paragraph start. @param candidate - Normalized source run. @returns True only for the inherited caret format run. */
    function containsCaret(candidate): boolean {
      const runStart = consumed;
      consumed += candidate.text.length;
      return (offset > runStart && offset <= consumed) || (offset === 0 && runStart === 0);
    },
  );
  return run?.attributes ?? DEFAULT_WRITER_CHARACTER_ATTRIBUTES;
}

/** Checks equality of two bounded Writer character attribute records. @param left - First attributes. @param right - Second attributes. @returns True only when every direct attribute matches. */
function areWriterCharacterAttributesEqual(
  left: WriterCharacterAttributes,
  right: WriterCharacterAttributes,
): boolean {
  return (
    left.bold === right.bold && left.italic === right.italic && left.underline === right.underline
  );
}

/** Checks whether an unknown value is a non-null record. @param value - Unknown runtime candidate. @returns True only for object records. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
