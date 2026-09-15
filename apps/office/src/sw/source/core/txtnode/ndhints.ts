/**
 * @fileoverview Implements Writer's ordered auto-format hint container from pinned `sw/source/core/txtnode/ndhints.cxx`.
 */

import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import type { SwAttrPool } from "../attr/swatrset";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
  restoreSwFormatAutoFormat,
  SwFormatAutoFormat,
  SwTextAttr,
  type SwTextAttrSnapshot,
  type WriterCharacterAttributes,
} from "./txatbase";
import {
  equalWriterHyperlinks,
  normalizeWriterHyperlink,
  restoreSwFormatINetFormat,
  SwFormatINetFormat,
  type WriterHyperlink,
} from "./fmtinfmt";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";

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

  /** Converts the hint vector to cycle-free persisted records. @returns Ordered snapshots. */
  public toSnapshot(): readonly SwTextAttrSnapshot[] {
    return this.hintsByStart.map(
      /** Serializes one hint. @param hint - Writer text attribute. @returns Snapshot. */
      (hint) => hint.toSnapshot(),
    );
  }

  /** Projects inherited character defaults through the item model. @param inherited - Node/style set. @returns Browser properties. */
  private projectInherited(inherited: SfxItemSet): WriterCharacterAttributes {
    return projectWriterCharacterAttributes(
      new SfxItemSet(this.pool, WRITER_CHARACTER_WHICH_RANGES),
      inherited,
    );
  }
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

/** Restores the current canonical nested pooled-item snapshots. @param pool - Destination pool. @param snapshots - Persisted hints. @returns Restored hints. */
export function createSwpHintsFromSnapshot(
  pool: SwAttrPool,
  snapshots: readonly SwTextAttrSnapshot[],
): SwpHints {
  const hints = snapshots.map(
    /** Restores one current auto-format hint. @param snapshot - Persisted hint. @returns Restored hint. */
    (snapshot) =>
      new SwTextAttr(
        snapshot.format.which === RES_TXTATR_INETFMT
          ? restoreSwFormatINetFormat(snapshot.format)
          : restoreSwFormatAutoFormat(pool, snapshot.format),
        snapshot.start,
        snapshot.end,
      ),
  );
  return new SwpHints(pool, hints);
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
    left.italic === right.italic &&
    left.underline === right.underline
  );
}
