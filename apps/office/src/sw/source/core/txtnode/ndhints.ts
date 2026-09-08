/**
 * @fileoverview Implements the ordered Writer text-attribute container from the pinned LibreOffice `sw/source/core/txtnode/ndhints.cxx` boundary.
 */

import {
  createSwFormatAutoFormat,
  RES_TXTATR_AUTOFMT,
  SwTextAttr,
  type SwTextAttrSnapshot,
  type WriterCharacterAttributes,
} from "./txatbase";

/** Stores direct-format text portions in deterministic start/end/which order. */
export class SwpHints {
  private hintsByStart: SwTextAttr[] = [];

  /** Creates a hint container from optional persisted attributes. @param hints - Initial ranged attributes. @returns Nothing. */
  public constructor(hints: readonly SwTextAttr[] = []) {
    this.replace(hints);
  }

  /** Returns the number of ranged attributes. @returns Hint count. */
  public Count(): number {
    return this.hintsByStart.length;
  }

  /** Returns one attribute in start-sorted order. @param position - Sorted hint position. @returns Hint at position. */
  public Get(position: number): SwTextAttr {
    const hint = this.hintsByStart[position];
    if (hint === undefined) throw new Error(`Unknown SwpHints position: ${position}`);
    return hint;
  }

  /** Returns all attributes as an immutable start-sorted view. @returns Ordered hints. */
  public entries(): readonly SwTextAttr[] {
    return this.hintsByStart;
  }

  /** Replaces all hints, removing empty/default spans and merging adjacent equal auto formats. @param hints - Replacement hints. @returns Nothing. */
  public replace(hints: readonly SwTextAttr[]): void {
    const sorted = hints
      .filter(
        /** Keeps only non-empty supported hints. @param hint - Candidate Writer attribute. @returns True for a meaningful auto-format range. */
        function isMeaningfulHint(hint): boolean {
          return (
            hint.Which() === RES_TXTATR_AUTOFMT &&
            hint.end > hint.start &&
            !isDefaultWriterCharacterAttributes(hint.format.items)
          );
        },
      )
      .map(
        /** Clones caller-owned hints before normalization. @param hint - Supported source hint. @returns Independent hint. */
        function cloneHint(hint): SwTextAttr {
          return hint.clone();
        },
      )
      .sort(compareHints);
    const normalized: SwTextAttr[] = [];
    sorted.forEach(
      /** Appends or merges one ordered non-overlapping hint. @param hint - Sorted source hint. @returns Nothing. */
      function appendHint(hint): void {
        const previous = normalized[normalized.length - 1];
        if (previous !== undefined && hint.start < previous.end)
          throw new Error("Overlapping Writer auto-format hints are not normalized.");
        if (
          previous !== undefined &&
          previous.end === hint.start &&
          areWriterCharacterAttributesEqual(previous.format.items, hint.format.items)
        ) {
          previous.SetEnd(hint.end);
        } else {
          normalized.push(hint);
        }
      },
    );
    this.hintsByStart = normalized;
  }

  /** Rebuilds auto-format hints from complete view text runs. @param runs - Complete view projection. @returns Nothing. */
  public setTextRuns(runs: readonly WriterTextRunLike[]): void {
    let offset = 0;
    const hints: SwTextAttr[] = [];
    runs.forEach(
      /** Converts one non-default run to a ranged auto-format hint. @param run - Complete text portion. @returns Nothing. */
      function appendRun(run): void {
        const start = offset;
        offset += run.text.length;
        if (run.text.length > 0 && !isDefaultWriterCharacterAttributes(run.attributes)) {
          hints.push(new SwTextAttr(createSwFormatAutoFormat(run.attributes), start, offset));
        }
      },
    );
    this.replace(hints);
  }

  /** Projects stored hints into complete text runs, including default-format gaps. @param text - Canonical node text. @returns Complete rendering runs. */
  public toTextRuns(text: string): readonly WriterTextRunLike[] {
    if (text.length === 0) return [];
    const runs: WriterTextRunLike[] = [];
    let offset = 0;
    this.hintsByStart.forEach(
      /** Emits default gaps and one hinted portion. @param hint - Ordered non-overlapping hint. @returns Nothing. */
      function appendHintRun(hint): void {
        const start = Math.min(text.length, hint.start);
        const end = Math.min(text.length, hint.end);
        if (start > offset)
          runs.push({ attributes: DEFAULT_CHARACTER_ATTRIBUTES, text: text.slice(offset, start) });
        if (end > start) runs.push({ attributes: hint.format.items, text: text.slice(start, end) });
        offset = Math.max(offset, end);
      },
    );
    if (offset < text.length)
      runs.push({ attributes: DEFAULT_CHARACTER_ATTRIBUTES, text: text.slice(offset) });
    return mergeTextRuns(runs);
  }

  /** Reads attributes inherited by a caret, preferring the preceding character like Writer. @param text - Canonical node text. @param offset - Caret offset. @returns Effective direct attributes. */
  public getCharacterAttributes(text: string, offset: number): WriterCharacterAttributes {
    if (!Number.isInteger(offset) || offset < 0 || offset > text.length)
      throw new Error("Writer character-format caret is outside the text node.");
    if (text.length === 0) return DEFAULT_CHARACTER_ATTRIBUTES;
    const characterOffset = offset === 0 ? 0 : offset - 1;
    const hint = this.hintsByStart.find(
      /** Finds the auto-format hint containing the inherited character. @param candidate - Ordered hint. @returns True when it covers characterOffset. */
      function containsCharacter(candidate): boolean {
        return candidate.start <= characterOffset && characterOffset < candidate.end;
      },
    );
    return hint?.format.items ?? DEFAULT_CHARACTER_ATTRIBUTES;
  }

  /** Creates a deep copy safe for another SwTextNode. @returns Independent hints. */
  public clone(): SwpHints {
    return new SwpHints(this.hintsByStart);
  }

  /** Converts the hint vector to cycle-free persisted records. @returns Ordered hint snapshots. */
  public toSnapshot(): readonly SwTextAttrSnapshot[] {
    return this.hintsByStart.map(
      /** Serializes one ranged hint. @param hint - Writer text attribute. @returns Persisted record. */
      function serializeHint(hint): SwTextAttrSnapshot {
        return hint.toSnapshot();
      },
    );
  }
}

/** Minimal complete run shape used only for rendering and boundary conversion. */
export interface WriterTextRunLike {
  /** Direct character attributes effective for this portion. */
  readonly attributes: WriterCharacterAttributes;
  /** Visible text in this portion. */
  readonly text: string;
}

const DEFAULT_CHARACTER_ATTRIBUTES: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};

/** Restores a hint collection from persisted records. @param candidate - Unknown persisted value. @returns Normalized hints. */
export function createSwpHintsFromSnapshot(candidate: unknown): SwpHints {
  if (!Array.isArray(candidate)) return new SwpHints();
  const hints = candidate.flatMap(
    /** Parses one persisted auto-format hint. @param value - Unknown stored record. @returns Zero or one valid hint. */
    function parseHint(value): readonly SwTextAttr[] {
      if (typeof value !== "object" || value === null) return [];
      const record = value as Partial<SwTextAttrSnapshot>;
      const items = record.format?.items;
      if (
        !Number.isInteger(record.start) ||
        !Number.isInteger(record.end) ||
        (record.start as number) < 0 ||
        (record.end as number) <= (record.start as number) ||
        typeof items !== "object" ||
        items === null
      )
        return [];
      return [
        new SwTextAttr(
          createSwFormatAutoFormat({
            bold: items.bold === true,
            italic: items.italic === true,
            underline: items.underline === true,
          }),
          record.start as number,
          record.end as number,
        ),
      ];
    },
  );
  return new SwpHints(hints);
}

/** Compares hints using LibreOffice's start, end, and item ordering requirements. @param left - First hint. @param right - Second hint. @returns Signed ordering result. */
function compareHints(left: SwTextAttr, right: SwTextAttr): number {
  return left.start - right.start || right.end - left.end;
}

/** Tests equality for the bounded auto-format item set. @param left - First item set. @param right - Second item set. @returns True when equal. */
function areWriterCharacterAttributesEqual(
  left: WriterCharacterAttributes,
  right: WriterCharacterAttributes,
): boolean {
  return (
    left.bold === right.bold && left.italic === right.italic && left.underline === right.underline
  );
}

/** Detects the default direct-format item set. @param attributes - Candidate item set. @returns True when every direct property is disabled. */
function isDefaultWriterCharacterAttributes(attributes: WriterCharacterAttributes): boolean {
  return !attributes.bold && !attributes.italic && !attributes.underline;
}

/** Copies generated view runs with independent attribute records. @param runs - Canonically generated runs. @returns Independent view projection. */
function mergeTextRuns(runs: readonly WriterTextRunLike[]): readonly WriterTextRunLike[] {
  return runs.map(
    /** Copies one non-empty projection run. @param run - Canonically generated view run. @returns Independent run. */
    function copyRun(run): WriterTextRunLike {
      return { attributes: { ...run.attributes }, text: run.text };
    },
  );
}
