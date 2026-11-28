/**
 * @fileoverview Implements Writer's ordered auto-format hint container from pinned `sw/source/core/txtnode/ndhints.cxx`.
 */

import type { SwFormatRuby } from "./fmtatr2";
import { SwTextTOXMark } from "./atrtox";
import { SwTextRefMark } from "./atrref";
import { RES_TXTATR_REFMARK, RES_TXTATR_TOXMARK } from "../../../inc/hintids";
import {
  SwTextField,
  type SwTextDateTimeField,
  type SwTextDocInfoField,
  type SwTextDocStatField,
  type SwTextPageNumberField,
  type SwTextChapterField,
  type SwTextOrdinaryField,
  type SwTextReferenceField,
} from "../../../inc/txtfld";
import { SwChapterField } from "../fields/chpfld";
import { SwGetRefField } from "../fields/reffld";
import { SwPageNumberField } from "../fields/docufld.pagenumber";
import { SwDocInfoField, SwDocStatField } from "../fields/docufld";
import { SwDateTimeField } from "../fields/flddat";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
import { TryInsertTextNodeHint, DestroyTextNodeAttribute } from "./thints-insert";
import { TryInsertNesting, type NestingAttribute } from "./thints-nesting";
import type { SwRegHistory } from "../undo/rolbck";
import { CheckCharacterHintSortNumber } from "./thints-portions";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  mergeTextRuns,
  setFontItem,
  projectCharacterHintAttributes,
  setCharacterItems,
  createCharacterFormatItems,
  createFontHeightItems,
  createCharacterColorItems,
  collectCharacterSegments,
} from "./ndhints-font";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  RES_CHRATR_FONT,
  RES_TXTATR_ANNOTATION,
  RES_TXTATR_FIELD,
  RES_TXTATR_AUTOFMT,
  RES_TXTATR_FLYCNT,
  RES_TXTATR_INETFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import type { SwTextNode } from "./ndtxt";
import type { SwAttrPool } from "../attr/swatrset";
import { MakeTextAttr, MergeTextNodePortions } from "./thints";
import { SwTextCharFormat, SwTextINetFormat, SwTextRuby } from "./txtatr2";
import { AdjustInsertTextHints, EraseTextHints, UpdateTextHints } from "./ndtxt-hint-update";
import {
  NormalizeOwnedTextHints,
  hintWhichStartBound,
  hintPositionBound,
  assertTextRange,
  clipHintOutsideRange,
  compareHints,
  compareHintsByEnd,
  compareHintsByWhichAndStart,
  compareWhichStartPairs,
} from "./ndhints-range";
import { GetTextAttrAt } from "./ndtxt-attribute-query";
import { GetTextAttrMode, SetAttrMode } from "../../../inc/swtypes";
import {
  createSwFormatAutoFormat,
  isTextFormatHint,
  projectWriterCharacterAttributes,
  SwFormatAutoFormat,
  SwTextAttrEnd,
  type WriterCharacterAttributes,
} from "./txatbase";
import {
  normalizeWriterHyperlink,
  SwFormatINetFormat,
  SwFormatCharFormat,
  type WriterHyperlink,
} from "./fmtatr2";

/** Bounded implemented ranged item families held by the native maps. */
type RangedTextAttr = SwTextAttrEnd<
  SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat | SwFormatRuby
>;
/** Point and ranged attributes share the three native indexes. */
export type TextNodeAttribute =
  RangedTextAttr | SwTextFlyCnt | SwTextField | SwTextOrdinaryField | SwTextTOXMark | SwTextRefMark;

/** Stores directly formatted text portions in three native ordered maps. */
export class SwpHints {
  private m_pTextNode: SwTextNode | undefined;
  private m_pHistory: SwRegHistory | undefined;
  /** Original single borrowed history receiver; registration replaces the prior receiver. @param history - Native recorder or absent. @returns Nothing. */
  public Register(history: SwRegHistory | undefined): void {
    this.m_pHistory = history;
  }
  /** Original registration reset. @returns Nothing. */
  public DeRegister(): void {
    this.Register(undefined);
  }
  /** Original borrowed recorder query. @returns Native recorder or absent. */
  public GetHistory(): SwRegHistory | undefined {
    return this.m_pHistory;
  }
  /** Original explicit old/new capture, called only at native mutation sites. @param hint - Actual attribute. @param isNew - Whether record its reset instead of its old value. @returns Nothing. */
  public NoteInHistory(hint: RangedTextAttr, isNew = false): void {
    this.m_pHistory?.AddHint(hint, isNew);
  }

  /** Binds the portable map at a native node insertion boundary. @param node - Owning node or detached container. @returns Nothing. */
  public BindToTextNode(node: SwTextNode | undefined): void {
    if (node !== undefined && node.GetDoc().GetAttrPool() !== this.pool)
      throw new Error("Writer hints require the owning document pool.");
    this.m_pTextNode = node;
    for (const hint of this.m_HintsByStart)
      if (
        hint instanceof SwTextINetFormat ||
        hint instanceof SwTextRuby ||
        hint instanceof SwTextCharFormat ||
        hint instanceof SwTextField ||
        hint instanceof SwTextTOXMark ||
        hint instanceof SwTextRefMark
      )
        hint.ChgTextNode(node);
  }

  private m_HintsByStart: TextNodeAttribute[] = [];
  private m_HintsByEnd: TextNodeAttribute[] = [];
  private m_HintsByWhichAndStart: TextNodeAttribute[] = [];
  private m_StartMapNeedsSortingRange: [number, number] = [0x7fffffff, -1];
  private m_EndMapNeedsSortingRange: [number, number] = [0x7fffffff, -1];
  private m_WhichMapNeedsSortingRange: [WhichStartPair, WhichStartPair] = [
    [0x7fffffff, -1],
    [-1, -1],
  ];

  /** Reads the current primary map after lazy native sorting. @returns Owned sorted attributes. */
  private get hintsByStart(): TextNodeAttribute[] {
    this.ResortStartMap();
    return this.m_HintsByStart;
  }

  /** Releases old owner links and binds the replacement map without copying attributes. @param hints - Already normalized owned objects. @returns Nothing. */
  private set hintsByStart(hints: TextNodeAttribute[]) {
    for (const hint of this.m_HintsByStart) {
      hint.m_pHints = undefined;
      if (
        hint instanceof SwTextINetFormat ||
        hint instanceof SwTextRuby ||
        hint instanceof SwTextCharFormat ||
        hint instanceof SwTextField ||
        hint instanceof SwTextTOXMark ||
        hint instanceof SwTextRefMark
      )
        hint.ChgTextNode(undefined);
    }
    this.m_HintsByStart = hints;
    this.m_HintsByEnd = [...hints].sort(compareHintsByEnd);
    this.m_HintsByWhichAndStart = [...hints].sort(compareHintsByWhichAndStart);
    for (const hint of hints) {
      hint.m_pHints = this;
      if (
        hint instanceof SwTextINetFormat ||
        hint instanceof SwTextRuby ||
        hint instanceof SwTextCharFormat ||
        hint instanceof SwTextField ||
        hint instanceof SwTextTOXMark ||
        hint instanceof SwTextRefMark
      )
        hint.ChgTextNode(this.m_pTextNode);
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
  public GetSortedByEnd(position: number): TextNodeAttribute {
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
  public GetSortedByWhichAndStart(position: number): TextNodeAttribute {
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
  /** Owns one actual attribute in all native maps without merging portions. @param hint - Fresh detached attribute. @returns Nothing. */
  public Insert(hint: TextNodeAttribute): void {
    if (hint.m_pHints !== undefined) throw new Error("Writer hint is already owned.");
    this.hintsByStart = [...this.hintsByStart, hint].sort(compareHints);
  }
  /** Releases an actual attribute from the three owned maps. @param position - Native start-map offset. @returns Nothing. */
  public DeleteAtPos(position: number): void {
    const hint = this.Get(position);
    if (isTextFormatHint(hint)) this.NoteInHistory(hint);
    this.hintsByStart = this.hintsByStart.filter(
      /** Keeps the other actual attributes. @param entry - Map attribute. @returns Whether retained. */ (
        entry,
      ) => entry !== hint,
    );
  }
  /** Original TryInsertHint entrypoint at the actual map owner. @param hint - New attribute. @param node - Actual node. @param mode - Native flags. @returns Success. */
  public TryInsertHint(
    hint: RangedTextAttr,
    node: SwTextNode,
    mode = SetAttrMode.DEFAULT,
  ): boolean {
    return TryInsertTextNodeHint(this, hint, node, mode);
  }
  /** Original nesting entrypoint for the registered internet family. @param node - Actual node. @param hint - Initialized INET attribute. @returns Success. */
  public TryInsertNesting(node: SwTextNode, hint: NestingAttribute): boolean {
    return TryInsertNesting(this, node, hint);
  }

  /** Merges registered automatic-style portions and normalizes native format-ignore boundaries. @param node - Native owning paragraph. @returns Whether merged. */
  public MergePortions(node: SwTextNode): boolean {
    void node;
    return MergeTextNodePortions(this);
  }

  /** Returns the number of indexed text attributes. @returns Hint count. */
  public Count(): number {
    return this.m_HintsByStart.length;
  }

  /** Reports whether native ownership can release this empty map. @returns Whether no attributes remain. */
  public CanBeDeleted(): boolean {
    return this.Count() === 0;
  }

  /** Returns one attribute in start-sorted order. @param position - Sorted hint position. @returns Hint at position. */
  public Get(position: number): TextNodeAttribute {
    this.ResortStartMap();
    return this.GetWithoutResorting(position);
  }

  /** Reads the stable raw map while a caller changes several owned ranges. @param position - Raw map position. @returns The actual attribute without sorting. */
  public GetWithoutResorting(position: number): TextNodeAttribute {
    const hint = this.m_HintsByStart[position];
    if (hint === undefined) throw new Error(`Unknown SwpHints position: ${position}`);
    return hint;
  }
  /** Returns ranged attributes for character formatting and run projection. @returns Ordered ranged hints. */
  public entries(): readonly RangedTextAttr[] {
    return this.hintsByStart.filter(isTextFormatHint);
  }

  /** Looks up an owned point at its dummy character. @param offset - Text offset. @returns Actual point or undefined. */
  public GetTextAttrForCharAt(offset: number): SwTextFlyCnt | undefined;
  /** Queries a field at its point marker. @param offset - Text offset. @param which - Native field identity. @returns Owned field or undefined. */
  public GetTextAttrForCharAt(
    offset: number,
    which: typeof RES_TXTATR_ANNOTATION,
  ): SwTextField | undefined;
  /** Looks up an ordinary field at its point. @param offset - Text offset. @param which - Native field identity. @returns Original field. */
  public GetTextAttrForCharAt(
    offset: number,
    which: typeof RES_TXTATR_FIELD,
  ): SwTextOrdinaryField | undefined;
  /** Looks up the original single index mark at its marker. @param offset - Text offset. @param which - Index hint WhichId. @returns Native point hint. */
  public GetTextAttrForCharAt(
    offset: number,
    which: typeof RES_TXTATR_TOXMARK,
  ): SwTextTOXMark | undefined;
  /** Looks up a collapsed reference mark at its dummy character. @param offset - Text offset. @param which - Reference mark WhichId. @returns Native point hint. */
  public GetTextAttrForCharAt(
    offset: number,
    which: typeof RES_TXTATR_REFMARK,
  ): SwTextRefMark | undefined;
  /** Queries an owned point of the requested family. @param offset - Text offset. @param which - Requested family. @returns Point or undefined. */
  public GetTextAttrForCharAt(
    offset: number,
    which: number = RES_TXTATR_FLYCNT,
  ): SwTextFlyCnt | SwTextField | SwTextOrdinaryField | SwTextTOXMark | SwTextRefMark | undefined {
    const hints = this.hintsByStart;
    for (let i = hintPositionBound(hints, offset, false); hints[i]?.GetStart() === offset; ++i) {
      const hint = hints[i];
      if (hint && !isTextFormatHint(hint) && hint.HasDummyChar() && hint.Which() === which)
        return hint;
    }
    return undefined;
  }

  /** Returns native index marks in the same order as other text hints. @returns Borrowed index attributes. */
  public GetIndexMarks(): readonly SwTextTOXMark[] {
    return this.hintsByStart.filter(
      /** Selects the original index-mark family. @param hint - Owned attribute. @returns Whether index mark. */
      (hint): hint is SwTextTOXMark => hint instanceof SwTextTOXMark,
    );
  }

  /** Returns native reference marks in start order. @returns Borrowed references. */
  public GetReferenceMarks(): readonly SwTextRefMark[] {
    return this.hintsByStart.filter(
      /** Selects an owned reference mark. @param hint - Indexed hint. @returns Whether a reference. */
      (hint): hint is SwTextRefMark => hint instanceof SwTextRefMark,
    );
  }

  /** Returns actual ordinary reference field hints in start order. @returns Native field hints. */
  public GetReferenceFields(): readonly SwTextReferenceField[] {
    return this.hintsByStart.filter(
      /** Selects the represented ordinary field type. @param hint - Indexed hint. @returns Whether a reference field. */
      (hint): hint is SwTextReferenceField =>
        hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwGetRefField,
    );
  }

  /** Returns native Chapter fields at their original text anchors. @returns Ordered fields. */
  public GetChapterFields(): readonly SwTextChapterField[] {
    return this.hintsByStart.filter(
      /** Identifies a native Chapter field. @param hint - Text attribute. @returns Whether this is a chapter field. */
      (hint): hint is SwTextChapterField =>
        hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwChapterField,
    );
  }

  /** Returns native PageNumber fields at their original text anchors. @returns Ordered fields. */
  public GetPageNumberFields(): readonly SwTextPageNumberField[] {
    return this.hintsByStart.filter(
      /** Identifies the actual page number field. @param hint - Text attribute. @returns Whether this is a native page number. */
      (hint): hint is SwTextPageNumberField =>
        hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwPageNumberField,
    );
  }

  /** Returns native statistic fields in start order. @returns Native field hints. */
  public GetDocStatFields(): readonly SwTextDocStatField[] {
    return this.hintsByStart.filter(
      /** Identifies the actual statistic field type. @param hint - Native hint. @returns Whether a count field. */
      (hint): hint is SwTextDocStatField =>
        hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDocStatField,
    );
  }

  /** Finds the actual document information fields. @returns Ordered native hints. */
  public GetDocInfoFields(): readonly SwTextDocInfoField[] {
    return this.hintsByStart.filter(
      /** Selects the actual value class. @param hint - Text attribute. @returns Whether a DocInfo field. */
      (hint): hint is SwTextDocInfoField =>
        hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDocInfoField,
    );
  }

  /** Returns native date and time field hints in start order. @returns Native field hints. */
  public GetDateTimeFields(): readonly SwTextDateTimeField[] {
    return this.hintsByStart.filter(
      /** Selects the actual field value class. @param hint - Text attribute. @returns Whether a date/time field. */
      (hint): hint is SwTextDateTimeField =>
        hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDateTimeField,
    );
  }

  /** Obtains a position in the full start index. @param hint - Owned hint. @returns Index or -1. */
  public GetIndexOf(hint: TextNodeAttribute): number {
    return this.hintsByStart.indexOf(hint);
  }
  /** Tests whether native point-copy support is required. @param start - Inclusive bound. @param end - Exclusive bound. @returns Whether a point is in the range. */
  public HasFlyContent(start = 0, end = Infinity): boolean {
    for (const hint of this.hintsByStart) {
      if (hint.start >= end) break;
      if (hint instanceof SwTextFlyCnt && hint.start >= start) return true;
    }
    return false;
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
          hint.GetEnd() === candidate.GetEnd() &&
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
    if (this.HasFlyContent(start, end))
      throw new Error("Writer inline fly copy requires a layout format copy.");
    const result = this.sliceRanges(start, end, cut);
    for (const hint of this.hintsByStart)
      if (hint.start >= start && hint.start < end) {
        if (hint instanceof SwTextField) result.Insert(hint.Copy(hint.start - start));
        else if (
          (hint instanceof SwTextTOXMark || hint instanceof SwTextRefMark) &&
          hint.HasDummyChar()
        )
          result.Insert(hint.clone(-start));
      }
    return result;
  }

  /** Copies ranged attributes around a text replacement. @param start - First offset. @param end - End offset. @param cut - Native CutImpl flags. @param includeReferences - Whether to snapshot reference ranges. @returns Ranged fragments. */
  private sliceRanges(start: number, end: number, cut = false, includeReferences = true): SwpHints {
    const result = new SwpHints(this.pool);
    result.assignOwned(
      this.entries().flatMap(
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
    const markers = includeReferences
      ? [...this.GetIndexMarks(), ...this.GetReferenceMarks()]
      : this.GetIndexMarks();
    for (const hint of markers) {
      const endOfMark = hint.GetEnd();
      if (endOfMark === undefined || hint.start >= end || endOfMark <= start) continue;
      const copied = hint.clone();
      copied.SetStart(Math.max(start, hint.start) - start);
      copied.SetEnd(Math.min(end, endOfMark) - start);
      result.Insert(copied);
    }
    return result;
  }

  /** Removes a range, transferring strictly interior owned attributes and reconstructing split attributes. @param start - Inclusive cut offset. @param end - Exclusive cut offset. @param preservePortions - Retain native source portion boundaries until destination insertion. @returns Consumable same-pool hint fragment. */
  public Cut(start: number, end: number, preservePortions = false): SwpHints {
    assertHintSlice(start, end);
    const fragment = new SwpHints(this.pool);
    const length = end - start;
    if (length === 0) return fragment;
    const moved: TextNodeAttribute[] = [];
    const remaining: TextNodeAttribute[] = [];
    for (const hint of this.hintsByStart) {
      const hintEnd = hint.GetEnd();
      if (hintEnd === undefined) {
        if (hint.start >= start && hint.start < end) {
          hint.start -= start;
          moved.push(hint);
        } else {
          if (hint.start >= end) hint.start -= length;
          remaining.push(hint);
        }
        continue;
      }
      if (hint instanceof SwTextRefMark && hint.start >= start && hint.start < end) {
        hint.m_pHints = undefined;
        hint.SetStart(hint.start - start);
        hint.SetEnd(Math.min(hintEnd, end) - start);
        moved.push(hint);
        continue;
      }
      if (!(hint instanceof SwTextRefMark) && hint.start < end && hintEnd > start) {
        if (hint.start >= start && hintEnd < end) {
          hint.m_pHints = undefined;
          hint.start -= start;
          hint.SetEnd(hintEnd - start);
          moved.push(hint);
          continue;
        }
        const first = Math.max(start, hint.start) - start;
        const last = Math.min(end, hintEnd) - start;
        if (hint instanceof SwTextTOXMark)
          moved.push(new SwTextTOXMark(hint.format.Clone(), first, last));
        else moved.push(MakeTextAttr(this.pool.GetDoc(), hint.format, first, last));
      }
      if (hint.start > start) hint.start = Math.max(start, hint.start - length);
      if (hintEnd > start) hint.SetEnd(Math.max(start, hintEnd - length));
      remaining.push(hint);
    }
    this.assignOwned(remaining);
    if (preservePortions) fragment.hintsByStart = moved.sort(compareHints);
    else fragment.assignOwned(moved);
    return fragment;
  }

  /** Returns an independent copy with every range shifted by the supplied offset. @param offset - Signed range delta. @returns Shifted hints. */
  public shifted(offset: number): SwpHints {
    const result = this.clone();
    result.assignOwned(result.takeOwned(offset));
    return result;
  }

  /** Concatenates another fragment's hints after a leading text length. @param other - Trailing hints. @param leadingLength - Leading text length. @returns Concatenated hints. */
  public concat(other: SwpHints, leadingLength: number): SwpHints {
    const result = this.clone(),
      trailing = other.clone(this.pool);
    result.assignOwned([...result.takeOwned(0), ...trailing.takeOwned(leadingLength)]);
    return result;
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
    const trailing = this.sliceRanges(end, textLength, false, false),
      prefix = this.sliceRanges(0, start, false, false);
    const middle = transferHints ? replacement : replacement.clone(this.pool);
    const result = new SwpHints(this.pool);
    result.assignOwned([
      ...prefix.takeOwned(0),
      ...middle.takeOwned(start),
      ...trailing.takeOwned(start + replacementLength),
    ]);
    const references = this.GetReferenceMarks().filter(
      /** Selects the native reference ranges, excluding point dummies transferred below. @param hint - Reference. @returns Whether ranged. */
      (hint) => hint.GetEnd() !== undefined,
    );
    const retained =
      start === end
        ? references
        : EraseTextHints(this.pool.GetDoc(), references, start, end - start);
    for (const hint of retained) this.DeleteAtPos(this.GetIndexOf(hint));
    const shifted =
      replacementLength === 0
        ? retained
        : UpdateTextHints(this.pool.GetDoc(), retained, start, replacementLength, false);
    for (const hint of shifted) result.Insert(hint);
    this.TransferPointHints(result, start, end, replacementLength);
    return result;
  }
  /** Transfers surviving point hints after the new ranged coordinates are ready. @param destination - Replacement map. @param start - First removed offset. @param end - End of removal. @param length - Inserted text length. @returns Nothing. */
  public TransferPointHints(destination: SwpHints, start = 0, end = 0, length = 0): void {
    for (const hint of [...this.hintsByStart]) {
      if (hint.GetEnd() !== undefined) continue;
      this.DeleteAtPos(this.GetIndexOf(hint));
      if (hint.start >= start && hint.start < end) DestroyTextNodeAttribute(hint);
      else {
        if (hint.start >= end) hint.start += length - (end - start);
        destination.Insert(hint);
      }
    }
  }

  /** Splits ranged hints using the original snapshot boundaries and transfers owned point hints exactly once. @param offset - Split offset. @param length - Current node text length. @returns Leading and trailing maps. */
  public Split(offset: number, length: number): [SwpHints, SwpHints] {
    const leading = this.sliceRanges(0, offset);
    const trailing = this.sliceRanges(offset, length);
    this.TransferPointHints(leading);
    for (const hint of [...leading.hintsByStart]) {
      if (hint.GetEnd() !== undefined || hint.start < offset) continue;
      leading.DeleteAtPos(leading.GetIndexOf(hint));
      hint.start -= offset;
      trailing.Insert(hint);
    }
    return [leading, trailing];
  }

  /** Consumes an owned fragment while rebasing its actual attributes. @param offset - Destination offset. @returns Transferred owned objects. */
  private takeOwned(offset: number): TextNodeAttribute[] {
    const owned = this.hintsByStart;
    this.hintsByStart = [];
    for (const hint of owned) {
      hint.start += offset;
      const end = hint.GetEnd();
      if (end !== undefined) hint.SetEnd(end + offset);
    }
    return owned;
  }

  /** Inserts ordinary text through owned native coordinates or an explicitly formatted fragment. @param textLength - Original text length. @param offset - Insertion offset. @param insertedLength - Inserted text length. @param attributes - Optional explicit character state. @param inherited - Node/style items. @param hyperlink - Optional explicit inserted hyperlink. @param mode - Native insertion flags. @returns Updated owned or explicit-fragment hints. */
  public insertText(
    textLength: number,
    offset: number,
    insertedLength: number,
    attributes: SfxItemSet | undefined,
    inherited: SfxItemSet,
    hyperlink?: WriterHyperlink,
    mode = SwInsertFlags.DEFAULT,
  ): SwpHints {
    assertTextRange(textLength, offset, offset);
    if (attributes === undefined && hyperlink === undefined)
      return this.InsertUpdate(textLength, offset, insertedLength, mode);
    if (attributes !== undefined && hyperlink === undefined) {
      this.InsertUpdate(textLength, offset, insertedLength, mode);
      if (insertedLength === 0) return this;
      const end = offset + insertedLength;
      const retained = this.hintsByStart.flatMap<TextNodeAttribute>(
        /** Keeps actual internet and unrelated automatic attributes;only intersecting automatic portions are replaced. @param hint - Updated owned attribute. @returns Retained actual attributes or clipped automatic portions. */
        (hint) => {
          if (
            !isTextFormatHint(hint) ||
            hint.Which() !== RES_TXTATR_AUTOFMT ||
            hint.end <= offset ||
            hint.start >= end
          )
            return [hint];
          return clipHintOutsideRange(hint, offset, end);
        },
      );
      const inserted = this.createItemHints(insertedLength, attributes, inherited).takeOwned(
        offset,
      );
      this.assignOwned([...retained, ...inserted], true);
      return this;
    }
    const replacement = this.createItemHints(
      insertedLength,
      attributes ?? inherited,
      inherited,
      hyperlink,
    );
    try {
      return this.replaceRange(textLength, offset, offset, replacement, insertedLength);
    } finally {
      replacement.Dispose();
    }
  }

  /** Builds insertion hints from complete native items without a browser attribute projection. @param length - Inserted UTF16 length. @param attributes - Actual character items. @param inherited - Effective node/style items. @param hyperlink - Optional explicit link. @returns Independent native hints. */
  public createItemHints(
    length: number,
    attributes: SfxItemSet,
    inherited: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): SwpHints {
    if (!Number.isInteger(length) || length < 0)
      throw new Error("Writer hint text length is invalid.");
    const hints = new SwpHints(this.pool);
    if (length === 0) return hints;
    const direct = new SfxItemSet(this.pool, WRITER_CHARACTER_WHICH_RANGES);
    for (const item of attributes.entries())
      if (!item.equals(inherited.Get(item.Which()))) direct.Put(item);
    try {
      if (direct.Count() !== 0) hints.Insert(MakeTextAttr(this.pool.GetDoc(), direct, 0, length));
    } finally {
      direct.Dispose();
    }
    const link = normalizeWriterHyperlink(hyperlink);
    if (link !== undefined)
      hints.Insert(new SwTextINetFormat(new SwFormatINetFormat(link), 0, length));
    return hints;
  }

  /** Updates actual supported attributes after ordinary text insertion or erasure. @param textLength - Original node length. @param offset - Change position. @param length - Nonnegative change length. @param negative - Whether text is removed. @returns This owned container. */
  public Update(textLength: number, offset: number, length: number, negative = false): SwpHints {
    assertTextRange(textLength, offset, negative ? offset + length : offset);
    if (!Number.isInteger(length) || length < 0)
      throw new Error("Writer hint text length is invalid.");
    const doc = this.pool.GetDoc(),
      ignore = this.m_pTextNode?.IsIgnoreDontExpand() ?? false;
    if (length > 0)
      this.assignOwned(
        UpdateTextHints(doc, this.hintsByStart, offset, length, negative, ignore),
        true,
      );
    return this;
  }

  /** Coordinates insertion with temporary FORCE state before its mode postphase. @param size - Original len. @param pos - Position. @param len - Inserted len. @param mode - Native flags. @returns This container. */
  private InsertUpdate(size: number, pos: number, len: number, mode: SwInsertFlags): SwpHints {
    const node = this.m_pTextNode,
      oldIgnore = node?.IsIgnoreDontExpand() ?? false;
    if (mode & SwInsertFlags.FORCEHINTEXPAND) node?.SetIgnoreDontExpand(true);
    try {
      this.Update(size, pos, len);
    } finally {
      if (mode & SwInsertFlags.FORCEHINTEXPAND) node?.SetIgnoreDontExpand(oldIgnore);
    }
    if (len > 0) this.assignOwned(AdjustInsertTextHints(this.hintsByStart, pos, len, mode), true);
    return this;
  }

  /** Removes interior supported hints before native negative coordinate updating. @param textLength - Original text length. @param offset - Erase start. @param length - Erased length. @returns This owned container. */
  public EraseText(textLength: number, offset: number, length: number): SwpHints {
    assertTextRange(textLength, offset, offset + length);
    if (length > 0)
      this.assignOwned(EraseTextHints(this.pool.GetDoc(), this.hintsByStart, offset, length), true);
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
    const attributes = collectCharacterSegments(this, this.pool, textLength, start, end, inherited);
    const nextValue = !attributes.every(
      /** Reads the current effective state without changing its native items. @param segment - Original span. @returns Enabled state. */ (
        segment,
      ) => segment.attributes[format],
    );
    return setCharacterItems(
      this,
      this.pool,
      textLength,
      start,
      end,
      createCharacterFormatItems(format, nextValue),
      inherited,
    );
  }

  /** Applies one font family over a native hint range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param family - Requested serialized family. @param inherited - Node/style items. @returns Updated independent hints. */
  public setFontFamily(
    textLength: number,
    start: number,
    end: number,
    family: string | SvxFontItem,
    inherited: SfxItemSet,
  ): SwpHints {
    const item =
      family instanceof SvxFontItem
        ? family
        : new SvxFontItem(inherited.Get(RES_CHRATR_FONT) as SvxFontItem);
    if (typeof family === "string") item.SetFamilyName(family);
    return setFontItem(this, this.pool, textLength, start, end, item, inherited);
  }

  /** Applies one font height over a native hint range. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param fontSizeTwips - Requested height in twips. @param inherited - Node/style items. @returns Updated independent hints. */
  public setFontSize(
    textLength: number,
    start: number,
    end: number,
    fontSizeTwips: number,
    inherited: SfxItemSet,
  ): SwpHints {
    return setCharacterItems(
      this,
      this.pool,
      textLength,
      start,
      end,
      createFontHeightItems(fontSizeTwips),
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
    return setCharacterItems(
      this,
      this.pool,
      textLength,
      start,
      end,
      createCharacterColorItems(property, value),
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
      collectCharacterSegments(this, this.pool, textLength, start, end, inherited).map(
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
    const retained = this.entries().flatMap(
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
    const result = new SwpHints(this.pool);
    result.assignOwned(retained);
    return result;
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
    this.assignOwned(copies, true);
  }

  /** Normalizes already owned objects without replacing their identities. @param hints - Owned ranged attributes. @param disposePrevious - Release replaced owned hints. @returns Nothing. */
  private assignOwned(hints: readonly TextNodeAttribute[], disposePrevious = false): void {
    const old = disposePrevious
      ? this.hintsByStart.filter(
          /** Applies filter to hint. @param hint - hint value. @returns Callback result. */ (
            hint,
          ) => !hints.includes(hint),
        )
      : [];
    this.hintsByStart = [
      ...NormalizeOwnedTextHints(hints.filter(isTextFormatHint)),
      ...hints.filter(
        /** Retains other native hints independently of format portions. @param hint - Attribute. @returns Whether retained. */
        (hint) => !isTextFormatHint(hint),
      ),
    ].sort(compareHints);
    for (const hint of old) DestroyTextNodeAttribute(hint);
  }

  /** Native owned hint-map destruction after detaching node backlinks. @returns Nothing. */
  public Dispose(): void {
    const old = this.hintsByStart;
    this.hintsByStart = [];
    for (const hint of old) DestroyTextNodeAttribute(hint);
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
        else format.Dispose();
        const hyperlink = normalizeWriterHyperlink(run.hyperlink);
        if (hyperlink !== undefined)
          hints.push(new SwTextINetFormat(new SwFormatINetFormat(hyperlink), start, offset));
      },
    );
    this.assignOwned(hints, true);
  }

  /** Projects item-set hints into complete browser text runs. @param text - Canonical node text. @param inherited - Node/style item set. @returns Complete runs. */
  public toTextRuns(text: string, inherited: SfxItemSet): readonly WriterTextRunLike[] {
    if (text.length === 0) return [];
    const runs: WriterTextRunLike[] = [];
    const boundaries = new Set([0, text.length]);
    this.entries().forEach(
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
      /* istanbul ignore next -- Unique sorted hint boundaries always increase. */
      if (end <= start) continue;
      const inet = GetTextAttrAt(this, start, RES_TXTATR_INETFMT, GetTextAttrMode.Default);
      runs.push({
        attributes: projectCharacterHintAttributes(this.pool, this.entries(), start, inherited),
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
    return projectCharacterHintAttributes(this.pool, this.entries(), characterOffset, inherited);
  }

  /** Reads hyperlink metadata inherited by a caret. @param text - Canonical node text. @param offset - Caret offset. @returns Hyperlink or undefined. */
  public getHyperlink(text: string, offset: number): WriterHyperlink | undefined {
    if (!Number.isInteger(offset) || offset < 0 || offset > text.length)
      throw new Error("Writer hyperlink caret is outside the text node.");
    if (text.length === 0) return undefined;
    const characterOffset = offset === 0 ? 0 : offset - 1;
    const hint = GetTextAttrAt(this, characterOffset, RES_TXTATR_INETFMT, GetTextAttrMode.Default);
    return hint?.format instanceof SwFormatINetFormat ? hint.format.GetHyperlink() : undefined;
  }
  /** Captures same-pool state or converts a foreign container into copied attributes. @param pool - Requested owner, defaulting to the current pool. @returns Independent hints. */
  public clone(pool: SwAttrPool = this.pool): SwpHints {
    if (this.HasFlyContent())
      throw new Error("Writer inline fly copy requires a layout format copy.");
    if (pool !== this.pool) return this.CopyTo(pool);
    const result = new SwpHints(pool, this.entries());
    for (const hint of this.hintsByStart)
      if (hint instanceof SwTextField) result.Insert(hint.Copy(hint.start));
      else if (hint instanceof SwTextTOXMark || hint instanceof SwTextRefMark)
        result.Insert(hint.clone());
    return result;
  }

  /** Copies text attributes through native construction, including same-document copies. @param pool - Destination document pool. @returns Fresh hints with constructor flags and destination-owned automatic handles. */
  public CopyTo(pool: SwAttrPool): SwpHints {
    const result = new SwpHints(pool);
    if (this.HasFlyContent())
      throw new Error("Writer inline fly copy requires a layout format copy.");
    for (const hint of this.entries()) {
      const copied = MakeTextAttr(pool.GetDoc(), hint.format, hint.start, hint.end);
      if (copied instanceof SwTextCharFormat) CheckCharacterHintSortNumber(result, copied);
      result.Insert(copied);
    }
    result.assignOwned(result.entries());
    for (const hint of this.hintsByStart)
      if (hint instanceof SwTextField) result.Insert(hint.Copy(hint.start, pool.GetDoc()));
      else if (hint instanceof SwTextTOXMark) result.Insert(hint.CopyTOXMark(pool.GetDoc()));
      else if (hint instanceof SwTextRefMark) result.Insert(hint.clone());
    return result;
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

/** Native Which/start sorting boundary. */
type WhichStartPair = [number, number];

/** Validates bounded hint slice/cut offsets. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
function assertHintSlice(start: number, end: number): void {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start)
    throw new Error("Writer hint slice is invalid.");
}
