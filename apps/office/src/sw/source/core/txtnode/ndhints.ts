/**
 * @fileoverview Implements Writer's ordered auto-format hint container from pinned `sw/source/core/txtnode/ndhints.cxx`.
 */

import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import type { SwAttrPool } from "../attr/swatrset";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
  SwFormatAutoFormat,
  SwTextAttr,
  type WriterCharacterAttributes,
} from "./txatbase";
import {
  equalWriterHyperlinks,
  normalizeWriterHyperlink,
  SwFormatINetFormat,
  type WriterHyperlink,
} from "./fmtinfmt";

/** Stores direct-format text portions in deterministic start/end/which order. */
export class SwpHints {
  private hintsByStart: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[] = [];

  /** Creates a hint container. @param pool - Owning document pool. @param hints - Initial ranged attributes. @returns Nothing. */
  public constructor(
    private readonly pool: SwAttrPool,
    hints: readonly SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[] = [],
  ) {
    this.replace(hints);
  }

  /** Returns the number of ranged attributes. @returns Hint count. */
  public Count(): number {
    return this.hintsByStart.length;
  }

  /** Returns one attribute in start-sorted order. @param position - Sorted hint position. @returns Hint at position. */
  public Get(position: number): SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat> {
    const hint = this.hintsByStart[position];
    if (hint === undefined) throw new Error(`Unknown SwpHints position: ${position}`);
    return hint;
  }

  /** Returns all attributes as an immutable start-sorted view. @returns Ordered hints. */
  public entries(): readonly SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[] {
    return this.hintsByStart;
  }

  /** Compares ordered native hints, including ranges, flags, and pooled item values. @param other - Candidate hint container. @returns Whether both containers are structurally equal. */
  public equals(other: SwpHints): boolean {
    if (this.Count() !== other.Count()) return false;
    return this.hintsByStart.every(
      /** Compares one ordered hint. @param hint - Source hint. @param index - Ordered position. @returns Whether the corresponding hint is equal. */ (
        hint,
        index,
      ) => {
        const candidate = other.hintsByStart[index];
        return (
          candidate !== undefined &&
          hint.start === candidate.start &&
          hint.end === candidate.end &&
          hint.dontExpand === candidate.dontExpand &&
          hint.dontExpandStart === candidate.dontExpandStart &&
          hint.dontMoveAttr === candidate.dontMoveAttr &&
          hint.format.equals(candidate.format)
        );
      },
    );
  }

  /** Copies hints intersecting a text range, clipping and rebasing them to zero. @param start - Inclusive text offset. @param end - Exclusive text offset. @returns Independent rebased hints. */
  public slice(start: number, end: number): SwpHints {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start)
      throw new Error("Writer hint slice is invalid.");
    return new SwpHints(
      this.pool,
      this.hintsByStart.flatMap(
        /** Clips one source hint. @param hint - Source hint. @returns Zero or one clipped hint. */ (
          hint,
        ) => {
          const clippedStart = Math.max(start, hint.start);
          const clippedEnd = Math.min(end, hint.end);
          if (clippedEnd <= clippedStart) return [];
          const copy = hint.clone();
          copy.start = clippedStart - start;
          copy.SetEnd(clippedEnd - start);
          return [copy];
        },
      ),
    );
  }

  /** Returns an independent copy with every range shifted by the supplied offset. @param offset - Signed range delta. @returns Shifted hints. */
  public shifted(offset: number): SwpHints {
    return new SwpHints(
      this.pool,
      this.hintsByStart.map(
        /** Shifts one hint. @param hint - Source hint. @returns Shifted clone. */ (hint) => {
          const copy = hint.clone();
          copy.start += offset;
          copy.SetEnd(copy.end + offset);
          return copy;
        },
      ),
    );
  }

  /** Concatenates another fragment's hints after a leading text length. @param other - Trailing hints. @param leadingLength - Leading text length. @returns Concatenated hints. */
  public concat(other: SwpHints, leadingLength: number): SwpHints {
    return new SwpHints(this.pool, [...this.entries(), ...other.shifted(leadingLength).entries()]);
  }

  /** Replaces a text range's hints with a native hint fragment. @param textLength - Original text length. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @param replacement - Replacement hints. @param replacementLength - Replacement text length. @returns Rebased combined hints. */
  public replaceRange(
    textLength: number,
    start: number,
    end: number,
    replacement: SwpHints,
    replacementLength: number,
  ): SwpHints {
    const trailing = this.slice(end, textLength).shifted(start + replacementLength);
    return new SwpHints(this.pool, [
      ...this.slice(0, start).entries(),
      ...replacement.shifted(start).entries(),
      ...trailing.entries(),
    ]);
  }

  /** Builds native hints for newly inserted text without constructing a run projection. @param length - Inserted text length. @param attributes - Effective inserted character state. @param inherited - Node/style items used to retain only direct deltas. @param hyperlink - Optional inserted hyperlink. @returns Independent native hint fragment. */
  public createTextHints(
    length: number,
    attributes: WriterCharacterAttributes,
    inherited: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): SwpHints {
    if (!Number.isInteger(length) || length < 0)
      throw new Error("Writer hint text length is invalid.");
    if (length === 0) return new SwpHints(this.pool);
    const hints: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[] = [];
    const format = createSwFormatAutoFormat(
      this.pool,
      attributes,
      this.projectInherited(inherited),
    );
    if (format.GetStyleHandle().Count() > 0) hints.push(new SwTextAttr(format, 0, length));
    const normalizedHyperlink = normalizeWriterHyperlink(hyperlink);
    if (normalizedHyperlink !== undefined)
      hints.push(new SwTextAttr(new SwFormatINetFormat(normalizedHyperlink), 0, length));
    return new SwpHints(this.pool, hints);
  }

  /** Inserts a native formatted range and rebases existing hints. @param textLength - Original text length. @param offset - Insertion offset. @param insertedLength - Inserted text length. @param attributes - Effective inserted character state. @param inherited - Node/style items. @param hyperlink - Optional inserted hyperlink. @returns Updated independent hints. */
  public insertText(
    textLength: number,
    offset: number,
    insertedLength: number,
    attributes: WriterCharacterAttributes,
    inherited: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): SwpHints {
    assertTextRange(textLength, offset, offset);
    return this.replaceRange(
      textLength,
      offset,
      offset,
      this.createTextHints(insertedLength, attributes, inherited, hyperlink),
      insertedLength,
    );
  }

  /** Toggles one supported character item over a native hint range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param format - Supported item group. @param inherited - Node/style items. @returns Updated independent hints. */
  public toggleCharacterFormat(
    textLength: number,
    start: number,
    end: number,
    format: "bold" | "italic" | "underline",
    inherited: SfxItemSet,
  ): SwpHints {
    const attributes = this.collectCharacterSegments(textLength, start, end, inherited);
    const nextValue = !attributes.every(
      /** Reads the requested effective format. @param segment - Effective native segment. @returns Whether the format is enabled. */ (
        segment,
      ) => segment.attributes[format],
    );
    return this.replaceCharacterRange(
      textLength,
      start,
      end,
      attributes.map(
        /** Applies the toggled property. @param segment - Effective native segment. @returns Updated segment. */ (
          segment,
        ) => ({
          ...segment,
          attributes: { ...segment.attributes, [format]: nextValue },
        }),
      ),
      inherited,
    );
  }

  /** Applies one font family over a native hint range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param family - Requested serialized family. @param inherited - Node/style items. @returns Updated independent hints. */
  public setFontFamily(
    textLength: number,
    start: number,
    end: number,
    family: string,
    inherited: SfxItemSet,
  ): SwpHints {
    return this.replaceCharacterRange(
      textLength,
      start,
      end,
      this.collectCharacterSegments(textLength, start, end, inherited).map(
        /** Applies the requested family. @param segment - Effective native segment. @returns Updated segment. */ (
          segment,
        ) => ({
          ...segment,
          attributes: { ...segment.attributes, fontFamily: family },
        }),
      ),
      inherited,
    );
  }

  /** Queries one supported character item over a native range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param format - Queried item group. @param inherited - Node/style items. @returns Uniform or mixed state. */
  public getCharacterFormatState(
    textLength: number,
    start: number,
    end: number,
    format: "bold" | "italic" | "underline",
    inherited: SfxItemSet,
  ): "mixed" | "off" | "on" {
    const values = new Set(
      this.collectCharacterSegments(textLength, start, end, inherited).map(
        /** Reads one effective property. @param segment - Effective native segment. @returns Property value. */ (
          segment,
        ) => segment.attributes[format],
      ),
    );
    return values.size > 1 ? "mixed" : values.has(true) ? "on" : "off";
  }

  /** Replaces hyperlink hints over one native range without projecting character runs. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param hyperlink - Replacement hyperlink or undefined. @returns Updated independent hints. */
  public setHyperlink(
    textLength: number,
    start: number,
    end: number,
    hyperlink: WriterHyperlink | undefined,
  ): SwpHints {
    assertTextRange(textLength, start, end);
    const retained = this.hintsByStart.flatMap(
      /** Retains non-hyperlink hints and hyperlink portions outside the range. @param hint - Existing native hint. @returns Retained clones. */ (
        hint,
      ) => {
        if (!(hint.format instanceof SwFormatINetFormat)) return [hint.clone()];
        return clipHintOutsideRange(hint, start, end);
      },
    );
    const normalized = normalizeWriterHyperlink(hyperlink);
    if (normalized !== undefined && end > start)
      retained.push(new SwTextAttr(new SwFormatINetFormat(normalized), start, end));
    return new SwpHints(this.pool, retained);
  }

  /** Replaces all hints, removing empty item sets and merging adjacent equal auto formats. @param hints - Replacement hints. @returns Nothing. */
  public replace(hints: readonly SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[]): void {
    const sorted = hints
      .filter(
        /** Keeps only non-empty supported hints. @param hint - Candidate attribute. @returns Whether meaningful. */
        (hint) =>
          hint.end > hint.start &&
          ((hint.format instanceof SwFormatAutoFormat &&
            hint.format.GetStyleHandle().Count() > 0) ||
            (hint.format instanceof SwFormatINetFormat && hint.format.GetValue().length > 0)),
      )
      .map(
        /** Clones caller-owned hints. @param hint - Source hint. @returns Independent hint. */
        (hint) => hint.clone(),
      )
      .sort(compareHints);
    const normalized: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[] = [];
    sorted.forEach(
      /** Appends or merges one ordered non-overlapping hint. @param hint - Sorted hint. @returns Nothing. */
      (hint) => {
        let previous: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat> | undefined;
        for (let index = normalized.length - 1; index >= 0; index -= 1) {
          const candidate = normalized[index];
          if (candidate?.Which() !== hint.Which()) continue;
          previous = candidate;
          break;
        }
        if (previous !== undefined && hint.start < previous.end)
          throw new Error("Overlapping Writer same-type hints are not normalized.");
        if (
          previous !== undefined &&
          previous.end === hint.start &&
          previous.format.equals(hint.format)
        )
          previous.SetEnd(hint.end);
        else normalized.push(hint);
      },
    );
    this.hintsByStart = normalized;
  }

  /** Rebuilds direct item-set hints from complete browser runs. @param runs - Complete text portions. @param inherited - Node/style item set. @returns Nothing. */
  public setTextRuns(runs: readonly WriterTextRunLike[], inherited: SfxItemSet): void {
    let offset = 0;
    const hints: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>[] = [];
    const inheritedAttributes = this.projectInherited(inherited);
    runs.forEach(
      /** Converts one run to a direct item-set delta. @param run - Complete run. @returns Nothing. */
      (run) => {
        const start = offset;
        offset += run.text.length;
        if (run.text.length === 0) return;
        const format = createSwFormatAutoFormat(this.pool, run.attributes, inheritedAttributes);
        if (format.GetStyleHandle().Count() > 0) hints.push(new SwTextAttr(format, start, offset));
        const hyperlink = normalizeWriterHyperlink(run.hyperlink);
        if (hyperlink !== undefined)
          hints.push(new SwTextAttr(new SwFormatINetFormat(hyperlink), start, offset));
      },
    );
    this.replace(hints);
  }

  /** Projects item-set hints into complete browser text runs. @param text - Canonical node text. @param inherited - Node/style item set. @returns Complete runs. */
  public toTextRuns(text: string, inherited: SfxItemSet): readonly WriterTextRunLike[] {
    if (text.length === 0) return [];
    const runs: WriterTextRunLike[] = [];
    const inheritedAttributes = this.projectInherited(inherited);
    const boundaries = new Set([0, text.length]);
    this.hintsByStart.forEach(
      /** Collects visible hint boundaries. @param hint - Ordered hint. @returns Nothing. */ (
        hint,
      ) => {
        boundaries.add(Math.min(text.length, hint.start));
        boundaries.add(Math.min(text.length, hint.end));
      },
    );
    const ordered = [...boundaries].sort(
      /** Orders text offsets ascending. @param left - First offset. @param right - Second offset. @returns Signed ordering. */
      (left, right) => left - right,
    );
    for (let index = 0; index < ordered.length - 1; index += 1) {
      const start = ordered[index] as number;
      const end = ordered[index + 1] as number;
      /* v8 ignore next -- Unique sorted hint boundaries always increase. */
      if (end <= start) continue;
      const auto = this.hintsByStart.find(
        /** Finds the auto-format covering a segment. @param hint - Candidate hint. @returns Whether it covers the segment. */
        (hint) =>
          hint.format instanceof SwFormatAutoFormat && hint.start <= start && end <= hint.end,
      );
      const inet = this.hintsByStart.find(
        /** Finds the hyperlink covering a segment. @param hint - Candidate hint. @returns Whether it covers the segment. */
        (hint) =>
          hint.format instanceof SwFormatINetFormat && hint.start <= start && end <= hint.end,
      );
      runs.push({
        attributes:
          auto?.format instanceof SwFormatAutoFormat
            ? projectWriterCharacterAttributes(auto.format.GetStyleHandle(), inherited)
            : inheritedAttributes,
        ...(inet?.format instanceof SwFormatINetFormat
          ? { hyperlink: inet.format.GetHyperlink() }
          : {}),
        text: text.slice(start, end),
      });
    }
    return mergeTextRuns(runs);
  }

  /** Reads effective attributes inherited by a caret. @param text - Canonical node text. @param offset - Caret offset. @param inherited - Node/style item set. @returns Effective properties. */
  public getCharacterAttributes(
    text: string,
    offset: number,
    inherited: SfxItemSet,
  ): WriterCharacterAttributes {
    if (!Number.isInteger(offset) || offset < 0 || offset > text.length)
      throw new Error("Writer character-format caret is outside the text node.");
    if (text.length === 0) return this.projectInherited(inherited);
    const characterOffset = offset === 0 ? 0 : offset - 1;
    const hint = this.hintsByStart.find(
      /** Finds the hint covering the inherited character. @param candidate - Ordered hint. @returns Whether it covers the offset. */
      (candidate) =>
        candidate.format instanceof SwFormatAutoFormat &&
        candidate.start <= characterOffset &&
        characterOffset < candidate.end,
    );
    return hint === undefined
      ? this.projectInherited(inherited)
      : projectWriterCharacterAttributes(
          (hint.format as SwFormatAutoFormat).GetStyleHandle(),
          inherited,
        );
  }

  /** Reads hyperlink metadata inherited by a caret. @param text - Canonical node text. @param offset - Caret offset. @returns Hyperlink or undefined. */
  public getHyperlink(text: string, offset: number): WriterHyperlink | undefined {
    if (!Number.isInteger(offset) || offset < 0 || offset > text.length)
      throw new Error("Writer hyperlink caret is outside the text node.");
    if (text.length === 0) return undefined;
    const characterOffset = offset === 0 ? 0 : offset - 1;
    const hint = this.hintsByStart.find(
      /** Finds the hyperlink covering the inherited character. @param candidate - Candidate hint. @returns Whether it covers the offset. */
      (candidate) =>
        candidate.format instanceof SwFormatINetFormat &&
        candidate.start <= characterOffset &&
        characterOffset < candidate.end,
    );
    return hint?.format instanceof SwFormatINetFormat ? hint.format.GetHyperlink() : undefined;
  }

  /** Creates a deep copy safe for another text node in the same document. @returns Independent hints. */
  public clone(): SwpHints {
    return new SwpHints(this.pool, this.hintsByStart);
  }

  /** Projects inherited character defaults through the item model. @param inherited - Node/style set. @returns Browser properties. */
  private projectInherited(inherited: SfxItemSet): WriterCharacterAttributes {
    return projectWriterCharacterAttributes(
      new SfxItemSet(this.pool, WRITER_CHARACTER_WHICH_RANGES),
      inherited,
    );
  }

  /** Collects effective character item segments over one native range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param inherited - Node/style items. @returns Ordered effective segments. */
  private collectCharacterSegments(
    textLength: number,
    start: number,
    end: number,
    inherited: SfxItemSet,
  ): readonly CharacterSegment[] {
    assertTextRange(textLength, start, end);
    if (start === end) return [];
    const boundaries = new Set([start, end]);
    for (const hint of this.hintsByStart) {
      if (!(hint.format instanceof SwFormatAutoFormat)) continue;
      if (hint.start > start && hint.start < end) boundaries.add(hint.start);
      if (hint.end > start && hint.end < end) boundaries.add(hint.end);
    }
    const ordered = [...boundaries].sort(
      /** Orders native offsets. @param left - First offset. @param right - Second offset. @returns Signed ordering. */ (
        left,
        right,
      ) => left - right,
    );
    return ordered.slice(0, -1).map(
      /** Projects one effective segment. @param segmentStart - Inclusive segment start. @param index - Boundary index. @returns Effective native segment. */ (
        segmentStart,
        index,
      ) => {
        const segmentEnd = ordered[index + 1] as number;
        const hint = this.hintsByStart.find(
          /** Finds an auto-format covering the segment. @param candidate - Candidate native hint. @returns Whether it covers the segment. */ (
            candidate,
          ) =>
            candidate.format instanceof SwFormatAutoFormat &&
            candidate.start <= segmentStart &&
            segmentEnd <= candidate.end,
        );
        return {
          attributes:
            hint?.format instanceof SwFormatAutoFormat
              ? projectWriterCharacterAttributes(hint.format.GetStyleHandle(), inherited)
              : this.projectInherited(inherited),
          end: segmentEnd,
          start: segmentStart,
        };
      },
    );
  }

  /** Replaces only auto-format hints over one range with native item segments. @param textLength - Complete text length. @param start - Inclusive start. @param end - Exclusive end. @param segments - Replacement effective item segments. @param inherited - Node/style items. @returns Updated independent hints. */
  private replaceCharacterRange(
    textLength: number,
    start: number,
    end: number,
    segments: readonly CharacterSegment[],
    inherited: SfxItemSet,
  ): SwpHints {
    assertTextRange(textLength, start, end);
    const retained = this.hintsByStart.flatMap(
      /** Retains non-format hints and auto-format portions outside the range. @param hint - Existing native hint. @returns Retained clones. */ (
        hint,
      ) => {
        if (!(hint.format instanceof SwFormatAutoFormat)) return [hint.clone()];
        return clipHintOutsideRange(hint, start, end);
      },
    );
    const inheritedAttributes = this.projectInherited(inherited);
    for (const segment of segments) {
      const format = createSwFormatAutoFormat(this.pool, segment.attributes, inheritedAttributes);
      if (format.GetStyleHandle().Count() > 0)
        retained.push(new SwTextAttr(format, segment.start, segment.end));
    }
    return new SwpHints(this.pool, retained);
  }
}

/** Effective character attributes over one canonical native text range. */
interface CharacterSegment {
  readonly attributes: WriterCharacterAttributes;
  readonly end: number;
  readonly start: number;
}

/** Retains the portions of one hint outside a replacement range. @param hint - Existing hint. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @returns Zero, one, or two clipped clones. */
function clipHintOutsideRange<T extends SwFormatAutoFormat | SwFormatINetFormat>(
  hint: SwTextAttr<T>,
  start: number,
  end: number,
): readonly SwTextAttr<T>[] {
  if (hint.end <= start || hint.start >= end) return [hint.clone()];
  const retained: SwTextAttr<T>[] = [];
  if (hint.start < start) {
    const prefix = hint.clone();
    prefix.SetEnd(start);
    retained.push(prefix);
  }
  if (hint.end > end) {
    const suffix = hint.clone();
    suffix.start = end;
    retained.push(suffix);
  }
  return retained;
}

/** Validates a bounded text range. @param textLength - Complete text length. @param start - Inclusive start. @param end - Exclusive end. @returns Nothing. */
function assertTextRange(textLength: number, start: number, end: number): void {
  if (
    !Number.isInteger(textLength) ||
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    textLength < 0 ||
    start < 0 ||
    end < start ||
    end > textLength
  )
    throw new Error("Writer hint range is outside the text node.");
}

/** Minimal complete run shape used by browser boundaries. */
export interface WriterTextRunLike {
  /** Effective character attributes for this portion. */
  readonly attributes: WriterCharacterAttributes;
  /** Optional Writer hyperlink range metadata. */
  readonly hyperlink?: WriterHyperlink;
  /** Visible text in this portion. */
  readonly text: string;
}

/** Compares hints using LibreOffice start, end, and item ordering. @param left - First. @param right - Second. @returns Signed ordering. */
function compareHints(
  left: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>,
  right: SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat>,
): number {
  return left.start - right.start || right.end - left.end;
}

/** Copies and merges adjacent equal browser runs. @param runs - Generated runs. @returns Independent normalized runs. */
function mergeTextRuns(runs: readonly WriterTextRunLike[]): readonly WriterTextRunLike[] {
  const merged: WriterTextRunLike[] = [];
  runs.forEach(
    /** Appends or merges one projection run. @param run - Source run. @returns Nothing. */
    (run) => {
      const copy = {
        attributes: { ...run.attributes },
        ...(run.hyperlink === undefined ? {} : { hyperlink: { ...run.hyperlink } }),
        text: run.text,
      };
      const previous = merged[merged.length - 1];
      if (
        previous !== undefined &&
        equalAttributes(previous.attributes, copy.attributes) &&
        equalWriterHyperlinks(previous.hyperlink, copy.hyperlink)
      )
        merged[merged.length - 1] = { ...previous, text: previous.text + copy.text };
      else merged.push(copy);
    },
  );
  return merged;
}

/** Compares browser character projections. @param left - First properties. @param right - Second properties. @returns Whether equal. */
function equalAttributes(
  left: WriterCharacterAttributes,
  right: WriterCharacterAttributes,
): boolean {
  return (
    left.bold === right.bold &&
    left.fontFamily === right.fontFamily &&
    left.fontSizeTwips === right.fontSizeTwips &&
    left.italic === right.italic &&
    left.underline === right.underline
  );
}
