/**
 * @fileoverview Implements Writer's ordered auto-format hint container from pinned `sw/source/core/txtnode/ndhints.cxx`.
 */

import { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  RES_TXTATR_AUTOFMT,
  RES_TXTATR_INETFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import type { SwTextNode } from "./ndtxt";
import type { SwAttrPool } from "../attr/swatrset";
import { MakeTextAttr } from "./thints";
import { SwTextINetFormat } from "./txtatr2";
import { UpdateTextHints } from "./ndtxt-hint-update";
import { GetTextAttrAt } from "./ndtxt-attribute-query";
import { GetTextAttrMode } from "../../../inc/swtypes";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
  SwFormatAutoFormat,
  SwTextAttrEnd,
  type WriterCharacterAttributes,
} from "./txatbase";
import {
  equalWriterHyperlinks,
  normalizeWriterHyperlink,
  SwFormatINetFormat,
  type WriterHyperlink,
} from "./fmtatr2";

/** Bounded implemented ranged item families held by the native maps. */
type RangedTextAttr = SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>;

/** Stores directly formatted text portions in three native ordered maps. */
export class SwpHints {
  private m_pTextNode: SwTextNode | undefined;

  /** Binds the portable map at a native node insertion boundary. @param node - Owning node or detached container. @returns Nothing. */
  public BindToTextNode(node: SwTextNode | undefined): void {
    if (node !== undefined && node.GetDoc().GetAttrPool() !== this.pool)
      throw new Error("Writer hints require the owning document pool.");
    this.m_pTextNode = node;
    for (const hint of this.m_HintsByStart)
      if (hint instanceof SwTextINetFormat) hint.ChgTextNode(node);
  }

  private m_HintsByStart: RangedTextAttr[] = [];
  private m_HintsByEnd: RangedTextAttr[] = [];
  private m_HintsByWhichAndStart: RangedTextAttr[] = [];
  private m_StartMapNeedsSortingRange: [number, number] = [0x7fffffff, -1];
  private m_EndMapNeedsSortingRange: [number, number] = [0x7fffffff, -1];
  private m_WhichMapNeedsSortingRange: [WhichStartPair, WhichStartPair] = [
    [0x7fffffff, -1],
    [-1, -1],
  ];

  /** Reads the current primary map after lazy native sorting. @returns Owned sorted attributes. */
  private get hintsByStart(): RangedTextAttr[] {
    this.ResortStartMap();
    return this.m_HintsByStart;
  }

  /** Releases old owner links and binds the replacement map without copying attributes. @param hints - Already normalized owned objects. @returns Nothing. */
  private set hintsByStart(hints: RangedTextAttr[]) {
    for (const hint of this.m_HintsByStart) {
      hint.m_pHints = undefined;
      if (hint instanceof SwTextINetFormat) hint.ChgTextNode(undefined);
    }
    this.m_HintsByStart = hints;
    this.m_HintsByEnd = [...hints].sort(compareHintsByEnd);
    this.m_HintsByWhichAndStart = [...hints].sort(compareHintsByWhichAndStart);
    for (const hint of hints) {
      hint.m_pHints = this;
      if (hint instanceof SwTextINetFormat) hint.ChgTextNode(this.m_pTextNode);
    }
    this.m_StartMapNeedsSortingRange = [0x7fffffff, -1];
    this.m_EndMapNeedsSortingRange = [0x7fffffff, -1];
    this.m_WhichMapNeedsSortingRange = [
      [0x7fffffff, -1],
      [-1, -1],
    ];
  }

  /** Marks all three maps dirty after a start change. @returns Nothing. */
  public StartPosChanged(): void {
    this.m_StartMapNeedsSortingRange = [-1, -1];
    this.m_EndMapNeedsSortingRange = [-1, -1];
    this.m_WhichMapNeedsSortingRange = [
      [-1, -1],
      [-1, -1],
    ];
  }

  /** Expands each native map's affected interval after an end change. @param which - Changed family. @param start - Unchanged start. @param oldEnd - Previous end. @param newEnd - New end. @returns Nothing. */
  public EndPosChanged(which: number, start: number, oldEnd: number, newEnd: number): void {
    this.m_StartMapNeedsSortingRange = [
      Math.min(start, this.m_StartMapNeedsSortingRange[0]),
      Math.max(start, this.m_StartMapNeedsSortingRange[1]),
    ];
    this.m_EndMapNeedsSortingRange = [
      Math.min(oldEnd, newEnd, this.m_EndMapNeedsSortingRange[0]),
      Math.max(oldEnd, newEnd, this.m_EndMapNeedsSortingRange[1]),
    ];
    const pair: WhichStartPair = [which, start];
    this.m_WhichMapNeedsSortingRange = [
      compareWhichStartPairs(pair, this.m_WhichMapNeedsSortingRange[0]) < 0
        ? pair
        : this.m_WhichMapNeedsSortingRange[0],
      compareWhichStartPairs(pair, this.m_WhichMapNeedsSortingRange[1]) > 0
        ? pair
        : this.m_WhichMapNeedsSortingRange[1],
    ];
  }

  /** Restores native order for the whole dirty map or only its affected start interval. @returns Nothing. */
  public ResortStartMap(): void {
    const [first, last] = this.m_StartMapNeedsSortingRange;
    if (first === 0x7fffffff) return;
    if (first === -1) this.m_HintsByStart.sort(compareHints);
    else {
      const from = hintPositionBound(this.m_HintsByStart, first, false),
        to = hintPositionBound(this.m_HintsByStart, last, true);
      const ordered = this.m_HintsByStart.slice(from, to).sort(compareHints);
      this.m_HintsByStart.splice(from, to - from, ...ordered);
    }
    this.m_StartMapNeedsSortingRange = [0x7fffffff, -1];
  }

  /** Restores the full or affected end interval in native end order. @returns Nothing. */
  public ResortEndMap(): void {
    const [first, last] = this.m_EndMapNeedsSortingRange;
    if (first === 0x7fffffff) return;
    if (first === -1) this.m_HintsByEnd.sort(compareHintsByEnd);
    else {
      const from = hintPositionBound(this.m_HintsByEnd, first, false, true),
        to = hintPositionBound(this.m_HintsByEnd, last, true, true);
      this.m_HintsByEnd.splice(
        from,
        to - from,
        ...this.m_HintsByEnd.slice(from, to).sort(compareHintsByEnd),
      );
    }
    this.m_EndMapNeedsSortingRange = [0x7fffffff, -1];
  }

  /** Restores the full or affected lexicographic Which/start interval. @returns Nothing. */
  public ResortWhichMap(): void {
    const [first, last] = this.m_WhichMapNeedsSortingRange;
    if (first[0] === 0x7fffffff) return;
    if (first[0] === -1) this.m_HintsByWhichAndStart.sort(compareHintsByWhichAndStart);
    else {
      const from = hintWhichStartBound(this.m_HintsByWhichAndStart, first, false),
        to = hintWhichStartBound(this.m_HintsByWhichAndStart, last, true);
      this.m_HintsByWhichAndStart.splice(
        from,
        to - from,
        ...this.m_HintsByWhichAndStart.slice(from, to).sort(compareHintsByWhichAndStart),
      );
    }
    this.m_WhichMapNeedsSortingRange = [
      [0x7fffffff, -1],
      [-1, -1],
    ];
  }

  /** Sorts all three maps only when dirty. @returns Nothing. */
  public SortIfNeedBe(): void {
    this.ResortStartMap();
    this.ResortEndMap();
    this.ResortWhichMap();
  }

  /** Finds the last hint ending at or before an offset. @param end - Inclusive end boundary. @returns End-map index or -1. */
  public GetLastPosSortedByEnd(end: number): number {
    this.ResortEndMap();
    return hintPositionBound(this.m_HintsByEnd, end, true, true) - 1;
  }

  /** Reads an actual attribute in native end order. @param position - End-map index. @returns Owned attribute. */
  public GetSortedByEnd(position: number): RangedTextAttr {
    this.ResortEndMap();
    const hint = this.m_HintsByEnd[position];
    if (hint === undefined) throw new Error(`Unknown SwpHints end position: ${position}`);
    return hint;
  }

  /** Finds the lower Which bound, including the next family when the requested one is absent. @param which - Family boundary. @returns Which-map index or the portable number-index size sentinel. */
  public GetFirstPosSortedByWhichAndStart(which: number): number {
    this.ResortWhichMap();
    const position = hintWhichStartBound(this.m_HintsByWhichAndStart, [which, -Infinity], false);
    return position === this.Count() ? Number.MAX_SAFE_INTEGER : position;
  }

  /** Reads an actual attribute in native Which/start order. @param position - Which-map index. @returns Owned attribute. */
  public GetSortedByWhichAndStart(position: number): RangedTextAttr {
    this.ResortWhichMap();
    const hint = this.m_HintsByWhichAndStart[position];
    if (hint === undefined) throw new Error(`Unknown SwpHints Which position: ${position}`);
    return hint;
  }

  /** Creates a hint container. @param pool - Owning document pool. @param hints - Initial ranged attributes. @returns Nothing. */
  public constructor(
    private readonly pool: SwAttrPool,
    hints: readonly RangedTextAttr[] = [],
  ) {
    this.replace(hints);
  }

  /** Returns the number of ranged attributes. @returns Hint count. */
  public Count(): number {
    return this.m_HintsByStart.length;
  }

  /** Returns one attribute in start-sorted order. @param position - Sorted hint position. @returns Hint at position. */
  public Get(position: number): RangedTextAttr {
    this.ResortStartMap();
    return this.GetWithoutResorting(position);
  }

  /** Reads the stable raw map while a caller changes several owned ranges. @param position - Raw map position. @returns The actual attribute without sorting. */
  public GetWithoutResorting(position: number): RangedTextAttr {
    const hint = this.m_HintsByStart[position];
    if (hint === undefined) throw new Error(`Unknown SwpHints position: ${position}`);
    return hint;
  }

  /** Returns all attributes as an immutable start-sorted view. @returns Ordered hints. */
  public entries(): readonly RangedTextAttr[] {
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
    return this.sliceRange(start, end, false);
  }

  /** Captures cut attributes with native split/equal-end reconstruction and strictly interior retained flags. @param start - Inclusive cut offset. @param end - Exclusive cut offset. @returns Rebased cut hints. */
  public sliceForCut(start: number, end: number): SwpHints {
    return this.sliceRange(start, end, true);
  }

  /** Clips snapshot or cut attributes without changing the source container. @param start - Inclusive offset. @param end - Exclusive offset. @param cut - Whether native CutImpl construction applies. @returns Independent rebased attributes. */
  private sliceRange(start: number, end: number, cut: boolean): SwpHints {
    assertHintSlice(start, end);
    return new SwpHints(
      this.pool,
      this.hintsByStart.flatMap(
        /** Clips one source hint. @param hint - Source hint. @returns Zero or one clipped hint. */ (
          hint,
        ) => {
          const clippedStart = Math.max(start, hint.start);
          const clippedEnd = Math.min(end, hint.end);
          if (clippedEnd <= clippedStart) return [];
          const copy =
            cut && (hint.start < start || hint.end >= end)
              ? MakeTextAttr(this.pool.GetDoc(), hint.format, clippedStart, clippedEnd)
              : hint.clone();
          copy.start = clippedStart - start;
          copy.SetEnd(clippedEnd - start);
          return [copy];
        },
      ),
    );
  }

  /** Removes a range, transferring strictly interior owned attributes and reconstructing split attributes. @param start - Inclusive cut offset. @param end - Exclusive cut offset. @returns Consumable same-pool hint fragment. */
  public Cut(start: number, end: number): SwpHints {
    assertHintSlice(start, end);
    const fragment = new SwpHints(this.pool);
    const length = end - start;
    if (length === 0) return fragment;
    const moved: RangedTextAttr[] = [];
    const remaining: RangedTextAttr[] = [];
    for (const hint of this.hintsByStart) {
      if (hint.start < end && hint.end > start) {
        if (hint.start >= start && hint.end < end) {
          hint.m_pHints = undefined;
          hint.start -= start;
          hint.SetEnd(hint.end - start);
          moved.push(hint);
          continue;
        }
        moved.push(
          MakeTextAttr(
            this.pool.GetDoc(),
            hint.format,
            Math.max(start, hint.start) - start,
            Math.min(end, hint.end) - start,
          ),
        );
      }
      if (hint.start > start) hint.start = Math.max(start, hint.start - length);
      if (hint.end > start) hint.SetEnd(Math.max(start, hint.end - length));
      remaining.push(hint);
    }
    this.assignOwned(remaining);
    fragment.assignOwned(moved);
    return fragment;
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
    return new SwpHints(this.pool, [
      ...this.entries(),
      ...other.clone(this.pool).shifted(leadingLength).entries(),
    ]);
  }

  /** Replaces a text range's hints with a native hint fragment. @param textLength - Original text length. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @param replacement - Replacement hints. @param replacementLength - Replacement text length. @param transferHints - Whether to consume owned same-pool hints. @returns Rebased combined hints. */
  public replaceRange(
    textLength: number,
    start: number,
    end: number,
    replacement: SwpHints,
    replacementLength: number,
    transferHints = false,
  ): SwpHints {
    if (transferHints && replacement.pool !== this.pool)
      throw new Error("Writer hint transfer requires the same document pool.");
    const trailing = this.slice(end, textLength).shifted(start + replacementLength);
    const prefix = this.slice(0, start);
    const middle = transferHints
      ? replacement.takeOwned(start)
      : replacement.clone(this.pool).shifted(start).entries();
    const hints = [
      ...(transferHints ? prefix.takeOwned(0) : prefix.entries()),
      ...middle,
      ...(transferHints ? trailing.takeOwned(0) : trailing.entries()),
    ];
    const result = new SwpHints(this.pool);
    if (transferHints) result.assignOwned(hints);
    else result.replace(hints);
    return result;
  }

  /** Consumes an owned fragment while rebasing its actual attributes. @param offset - Destination offset. @returns Transferred owned objects. */
  private takeOwned(offset: number): RangedTextAttr[] {
    const owned = this.hintsByStart;
    this.hintsByStart = [];
    for (const hint of owned) {
      hint.start += offset;
      hint.SetEnd(hint.end + offset);
    }
    return owned;
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
    const hints: RangedTextAttr[] = [];
    const format = createSwFormatAutoFormat(
      this.pool,
      attributes,
      this.projectInherited(inherited),
    );
    if (format.GetStyleHandle().Count() > 0) hints.push(new SwTextAttrEnd(format, 0, length));
    const normalizedHyperlink = normalizeWriterHyperlink(hyperlink);
    if (normalizedHyperlink !== undefined)
      hints.push(new SwTextINetFormat(new SwFormatINetFormat(normalizedHyperlink), 0, length));
    return new SwpHints(this.pool, hints);
  }

  /** Inserts ordinary text through owned native coordinates or an explicitly formatted fragment. @param textLength - Original text length. @param offset - Insertion offset. @param insertedLength - Inserted text length. @param attributes - Optional explicit character state. @param inherited - Node/style items. @param hyperlink - Optional explicit inserted hyperlink. @returns Updated owned or explicit-fragment hints. */
  public insertText(
    textLength: number,
    offset: number,
    insertedLength: number,
    attributes: WriterCharacterAttributes | undefined,
    inherited: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): SwpHints {
    assertTextRange(textLength, offset, offset);
    if (attributes === undefined && hyperlink === undefined)
      return this.Update(textLength, offset, insertedLength);
    return this.replaceRange(
      textLength,
      offset,
      offset,
      this.createTextHints(
        insertedLength,
        attributes ?? this.projectInherited(inherited),
        inherited,
        hyperlink,
      ),
      insertedLength,
    );
  }

  /** Updates actual supported attributes after ordinary text insertion or erasure. @param textLength - Original node length. @param offset - Change position. @param length - Nonnegative change length. @param negative - Whether text is removed. @returns This owned container. */
  public Update(textLength: number, offset: number, length: number, negative = false): SwpHints {
    assertTextRange(textLength, offset, negative ? offset + length : offset);
    if (!Number.isInteger(length) || length < 0)
      throw new Error("Writer hint text length is invalid.");
    if (length > 0)
      this.assignOwned(
        UpdateTextHints(this.pool.GetDoc(), this.hintsByStart, offset, length, negative),
      );
    return this;
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

  /** Applies one font height over a native hint range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param fontSizeTwips - Requested height in twips. @param inherited - Node/style items. @returns Updated independent hints. */
  public setFontSize(
    textLength: number,
    start: number,
    end: number,
    fontSizeTwips: number,
    inherited: SfxItemSet,
  ): SwpHints {
    return this.replaceCharacterRange(
      textLength,
      start,
      end,
      this.collectCharacterSegments(textLength, start, end, inherited).map(
        /** Applies the requested height. @param segment - Effective native segment. @returns Updated segment. */ (
          segment,
        ) => ({
          ...segment,
          attributes: { ...segment.attributes, fontSizeTwips },
        }),
      ),
      inherited,
    );
  }

  /** Applies a foreground or highlight color to every selected native character segment. */
  /** Handles Writer formatting state. @param textLength - Input value. @param start - Input value. @param end - Input value. @param property - Input value. @param value - Input value. @param inherited - Input value. @returns Callback result. */ public setCharacterColor(
    textLength: number,
    start: number,
    end: number,
    property: "color" | "highlight",
    value: string,
    inherited: SfxItemSet,
  ): SwpHints {
    return this.replaceCharacterRange(
      textLength,
      start,
      end,
      this.collectCharacterSegments(textLength, start, end, inherited).map(
        /** Handles Writer formatting state. @param segment - Input value. @returns Callback result. */ (
          segment,
        ) => ({
          ...segment,
          attributes: { ...segment.attributes, [property]: value },
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
      retained.push(new SwTextINetFormat(new SwFormatINetFormat(normalized), start, end));
    return new SwpHints(this.pool, retained);
  }

  /** Replaces all hints, removing empty item sets and merging adjacent equal auto formats. @param hints - Replacement hints. @returns Nothing. */
  public replace(hints: readonly RangedTextAttr[]): void {
    const copies = hints.map(
      /** Binds foreign automatic handles before testing their converted contents. @param hint - Caller-owned hint. @returns Destination-owned hint or same-pool snapshot. */
      (hint) =>
        hint.format instanceof SwFormatAutoFormat &&
        hint.format.GetStyleHandle().GetPool() !== this.pool
          ? MakeTextAttr(this.pool.GetDoc(), hint.format, hint.start, hint.end)
          : hint.clone(),
    );
    this.assignOwned(copies);
  }

  /** Normalizes already owned objects without replacing their identities. @param hints - Owned ranged attributes. @returns Nothing. */
  private assignOwned(hints: readonly RangedTextAttr[]): void {
    const sorted = hints
      .filter(
        /** Keeps only non-empty supported hints. @param hint - Candidate attribute. @returns Whether meaningful. */
        (hint) =>
          hint.end > hint.start &&
          ((hint.format instanceof SwFormatAutoFormat &&
            hint.format.GetStyleHandle().Count() > 0) ||
            (hint.format instanceof SwFormatINetFormat && hint.format.GetValue().length > 0)),
      )
      .sort(compareHints);
    const normalized: RangedTextAttr[] = [];
    sorted.forEach(
      /** Appends or merges one ordered non-overlapping hint. @param hint - Sorted hint. @returns Nothing. */
      (hint) => {
        let previous: RangedTextAttr | undefined;
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
          hint.Which() === RES_TXTATR_AUTOFMT &&
          previous.end === hint.start &&
          previous.format.equals(hint.format)
        )
          previous.SetEnd(hint.end);
        else normalized.push(hint);
      },
    );
    this.hintsByStart = normalized.sort(compareHints);
  }

  /** Rebuilds direct item-set hints from complete browser runs. @param runs - Complete text portions. @param inherited - Node/style item set. @returns Nothing. */
  public setTextRuns(runs: readonly WriterTextRunLike[], inherited: SfxItemSet): void {
    let offset = 0;
    const hints: RangedTextAttr[] = [];
    const inheritedAttributes = this.projectInherited(inherited);
    runs.forEach(
      /** Converts one run to a direct item-set delta. @param run - Complete run. @returns Nothing. */
      (run) => {
        const start = offset;
        offset += run.text.length;
        if (run.text.length === 0) return;
        const format = createSwFormatAutoFormat(this.pool, run.attributes, inheritedAttributes);
        if (format.GetStyleHandle().Count() > 0)
          hints.push(new SwTextAttrEnd(format, start, offset));
        const hyperlink = normalizeWriterHyperlink(run.hyperlink);
        if (hyperlink !== undefined)
          hints.push(new SwTextINetFormat(new SwFormatINetFormat(hyperlink), start, offset));
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
      const auto = this.findFamilyHint(RES_TXTATR_AUTOFMT, start, end);
      const inet = this.findFamilyHint(RES_TXTATR_INETFMT, start, end);
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
    const hint = this.findFamilyHint(RES_TXTATR_AUTOFMT, characterOffset, characterOffset + 1);
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
    const hint = this.findFamilyHint(RES_TXTATR_INETFMT, characterOffset, characterOffset + 1);
    return hint?.format instanceof SwFormatINetFormat ? hint.format.GetHyperlink() : undefined;
  }

  /** Captures same-pool state or converts a foreign container into copied attributes. @param pool - Requested owner, defaulting to the current pool. @returns Independent hints. */
  public clone(pool: SwAttrPool = this.pool): SwpHints {
    return pool === this.pool ? new SwpHints(pool, this.hintsByStart) : this.CopyTo(pool);
  }

  /** Copies text attributes through native construction, including same-document copies. @param pool - Destination document pool. @returns Fresh hints with constructor flags and destination-owned automatic handles. */
  public CopyTo(pool: SwAttrPool): SwpHints {
    return new SwpHints(
      pool,
      this.hintsByStart.map(
        /** Reconstructs one copied attribute. @param hint - Source attribute. @returns Fresh destination attribute. */
        (hint) => MakeTextAttr(pool.GetDoc(), hint.format, hint.start, hint.end),
      ),
    );
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
        const hint = this.findFamilyHint(RES_TXTATR_AUTOFMT, segmentStart, segmentEnd);
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

  /** Finds a covering hint using the native Which/start map. @param which - Existing supported family. @param start - Inclusive character boundary. @param end - Exclusive character boundary. @returns Covering actual attribute or undefined. */
  private findFamilyHint(which: number, start: number, end: number): RangedTextAttr | undefined {
    if (which === RES_TXTATR_INETFMT)
      return GetTextAttrAt(this, start, which, GetTextAttrMode.Default);
    for (let index = this.GetFirstPosSortedByWhichAndStart(which); index < this.Count(); index++) {
      const hint = this.GetSortedByWhichAndStart(index);
      if (hint.Which() !== which || hint.start > start) break;
      if (end <= hint.end) return hint;
    }
    return undefined;
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
        retained.push(new SwTextAttrEnd(format, segment.start, segment.end));
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
  hint: SwTextAttrEnd<T>,
  start: number,
  end: number,
): readonly SwTextAttrEnd<T>[] {
  if (hint.end <= start || hint.start >= end) return [hint.clone()];
  const retained: SwTextAttrEnd<T>[] = [];
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
function compareHints(left: RangedTextAttr, right: RangedTextAttr): number {
  return left.start - right.start || right.end - left.end || right.Which() - left.Which();
}

/** Native Which/start sorting boundary. */
type WhichStartPair = [number, number];

/** Compares native lexicographic boundaries. @param left - First boundary. @param right - Second boundary. @returns Signed order. */
function compareWhichStartPairs(left: WhichStartPair, right: WhichStartPair): number {
  return left[0] - right[0] || left[1] - right[1];
}

/** Compares supported ranges in native end/start-reverse/Which order. @param left - First attribute. @param right - Second attribute. @returns Signed order. */
function compareHintsByEnd(left: RangedTextAttr, right: RangedTextAttr): number {
  return left.end - right.end || right.start - left.start || left.Which() - right.Which();
}

/** Compares supported ranges in native Which/start/end-reverse order. @param left - First attribute. @param right - Second attribute. @returns Signed order. */
function compareHintsByWhichAndStart(left: RangedTextAttr, right: RangedTextAttr): number {
  return left.Which() - right.Which() || left.start - right.start || right.end - left.end;
}

/** Finds native lower/upper Which/start bounds without comparing ends. @param hints - Which map. @param position - Lexicographic boundary. @param upper - Include equals before the bound. @returns Insertion index. */
function hintWhichStartBound(
  hints: readonly RangedTextAttr[],
  position: WhichStartPair,
  upper: boolean,
): number {
  let first = 0,
    last = hints.length;
  while (first < last) {
    const middle = Math.floor((first + last) / 2),
      hint = hints[middle] as RangedTextAttr;
    const order = hint.Which() - position[0] || hint.start - position[1];
    if (order < 0 || (upper && order === 0)) first = middle + 1;
    else last = middle;
  }
  return first;
}

/** Finds native lower/upper position bounds in a map ordered by that coordinate. @param hints - Start or end map. @param position - Boundary. @param upper - Include equals before the bound. @param byEnd - Whether to compare ends instead of starts. @returns Insertion index. */
function hintPositionBound(
  hints: readonly RangedTextAttr[],
  position: number,
  upper: boolean,
  byEnd = false,
): number {
  let first = 0,
    last = hints.length;
  while (first < last) {
    const middle = Math.floor((first + last) / 2);
    const hint = hints[middle] as RangedTextAttr;
    const coordinate = byEnd ? hint.end : hint.start;
    if (coordinate < position || (upper && coordinate === position)) first = middle + 1;
    else last = middle;
  }
  return first;
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
    left.color === right.color &&
    left.fontFamily === right.fontFamily &&
    left.fontSizeTwips === right.fontSizeTwips &&
    left.highlight === right.highlight &&
    left.italic === right.italic &&
    left.underline === right.underline
  );
}

/** Validates bounded hint slice/cut offsets. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
function assertHintSlice(start: number, end: number): void {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start)
    throw new Error("Writer hint slice is invalid.");
}
