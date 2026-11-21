/** @fileoverview Native Writer character and paragraph attribute search over SwPaM. */
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxColorItem } from "../../../../editeng/source/items/textitem.color";
import { SvxFontItem } from "../../../../editeng/source/items/textitem.font";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import {
  REG_NOT_BEGINOFLINE,
  REG_NOT_ENDOFLINE,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import { REGEXP } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { SfxItemIter } from "../../../../svl/inc/itemiter";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { IsInvalidItem, SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { TextSearch, type RegexMatcherFactory } from "../../../../unotools/inc/textsearch";
import type { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import {
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
  RES_CHRATR_FONT,
  RES_TXTATR_END,
} from "../../../inc/hintids";
import { isParagraphEditItem } from "../doc/DocumentContentOperationsManager.attr";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SwAttrIter } from "../text/itratr";
import { SwTextNode } from "../txtnode/ndtxt";
import { DecodeSearchText, FindTextImpl, ResolveSearchReplacement } from "./findtxt";
import { SwPaM } from "./pam";
import {
  FIND_FOUND,
  FIND_NOT_FOUND,
  FIND_NO_RING,
  type SwCursor,
  type SwFindParas,
  type SwSearchNodeFilter,
} from "./swcrsr";

/** Compares formatting criteria using native search equality. @param left - Item or default. @param right - Matched item. @returns Whether the values match. */
function CmpAttr(left: SfxPoolItem, right: SfxPoolItem): boolean {
  if (
    left.Which() === RES_CHRATR_FONT &&
    left instanceof SvxFontItem &&
    right instanceof SvxFontItem
  )
    return left.GetFamilyName() === right.GetFamilyName();
  if (left instanceof SvxColorItem && right instanceof SvxColorItem)
    return left.GetValue().IsRGBEqual(right.GetValue());
  if (
    left.Which() === RES_CHRATR_BACKGROUND &&
    left instanceof SvxBrushItem &&
    right instanceof SvxBrushItem &&
    !(left.getComplexColor().isUsed() && right.getComplexColor().isUsed())
  )
    return left.GetColor().IsRGBEqual(right.GetColor());
  return SfxPoolItem.areSame(left, right);
}

/** Required item and its native presence-vs-value semantics. */
interface SearchAttribute {
  readonly which: number;
  readonly value: SfxPoolItem;
  readonly anyValue: boolean;
}

/** Half-open character offsets in one text node. */
type TextSpan = readonly [start: number, end: number];

/** Compares one stored or effective attribute using the source invalid-item convention. @param item - Attribute at the candidate. @param criterion - Expected formatting. @returns Whether it matches. */
function matchesAttribute(item: SfxPoolItem | undefined, criterion: SearchAttribute): boolean {
  return item !== undefined && CmpAttr(criterion.value, item) !== criterion.anyValue;
}

/** Looks up one item in the node or its collection, keeping presence distinct from defaults. @param node - Candidate paragraph. @param criterion - Required item. @param includeCollections - Whether collection items participate. @returns Candidate item. */
function readNodeAttribute(
  node: SwTextNode,
  criterion: SearchAttribute,
  includeCollections: boolean,
): SfxPoolItem | undefined {
  if (!includeCollections && !node.HasSwAttrSet()) return undefined;
  const set = node.GetSwAttrSet();
  return criterion.anyValue
    ? set.GetItemIfSet(criterion.which, includeCollections)
    : set.Get(criterion.which, includeCollections);
}

/** Finds contiguous spans in one text node using the native hint stacks. @param node - Candidate. @param criteria - Required attributes. @param includeCollections - Whether styles participate. @param low - Initial offset. @param high - Final offset. @returns Matching spans in model order. */
function* FindAttrsImpl(
  node: SwTextNode,
  criteria: readonly SearchAttribute[],
  includeCollections: boolean,
  low: number,
  high: number,
): Generator<TextSpan> {
  if (low >= high) return;
  const iterator = new SwAttrIter(node, includeCollections);
  const handler = iterator.GetAttrHandler();
  let start: number | undefined;
  let offset = low;
  while (offset < high) {
    iterator.Seek(offset);
    const matches = criteria.every(
      /** Checks the value at the current boundary. @param criterion - Required value. @returns Whether the criterion matches. */ (
        criterion,
      ) => {
        const item =
          handler.ReadHintItem(criterion.which) ??
          readNodeAttribute(node, criterion, includeCollections);
        return matchesAttribute(item, criterion);
      },
    );
    if (matches) start ??= offset;
    else if (start !== undefined) {
      yield [start, offset];
      start = undefined;
    }
    offset = Math.min(high, iterator.GetNextAttr());
  }
  if (start !== undefined) yield [start, high];
}

/** Native generic cursor strategy for combined text and formatting search. */
class SwFindParaAttr implements SwFindParas {
  private readonly characters: SearchAttribute[] = [];
  private readonly paragraphs: SearchAttribute[] = [];
  private readonly engine: TextSearch | undefined;

  /** Prepares native matching criteria. @param set - Search items. @param includeCollections - Whether named styles participate. @param options - Optional text criteria. @param acceptsNode - View node admission. @param createRegex - Native ICU constructor. @returns Strategy. */
  public constructor(
    set: SfxItemSet,
    private readonly includeCollections: boolean,
    private readonly options: SearchOptions2 | undefined,
    private readonly acceptsNode?: SwSearchNodeFilter,
    createRegex?: RegexMatcherFactory,
  ) {
    for (const iter = new SfxItemIter(set); !iter.IsAtEnd(); iter.Next()) {
      const which = iter.GetCurWhich();
      const item = iter.GetCurItem();
      const anyValue = IsInvalidItem(item);
      const target = which < RES_TXTATR_END ? this.characters : this.paragraphs;
      target.push({
        which,
        value: anyValue ? set.GetPool().GetUserOrPoolDefaultItem(which) : item,
        anyValue,
      });
    }
    if (options !== undefined) {
      const scoped = new SearchOptions2(options);
      scoped.searchFlag |= REG_NOT_BEGINOFLINE | REG_NOT_ENDOFLINE;
      this.engine = new TextSearch(scoped, createRegex);
    }
  }

  /** Finds the first directional match inside the supplied region. @param cursor - Result. @param backward - Direction. @param region - Search range. @returns Native result flag. */
  public DoFind(cursor: SwPaM, backward: boolean, region: SwPaM): number {
    if (this.characters.length === 0 && this.paragraphs.length === 0 && this.options === undefined)
      return FIND_NOT_FOUND;
    const first = region.Start();
    const last = region.End();
    const nodes = first.GetNode().GetNodes();
    const bounded = new SwPaM(first);
    const visitedCollections = new Set<SwTextFormatColl>();
    try {
      for (
        let index = backward ? last.GetNodeIndex() : first.GetNodeIndex();
        first.GetNodeIndex() <= index && index <= last.GetNodeIndex();
        index += backward ? -1 : 1
      ) {
        const node = nodes.at(index);
        if (!(node instanceof SwTextNode) || this.acceptsNode?.(node) === false) continue;
        const low = node === first.GetNode() ? first.GetContentIndex() : 0;
        const high = node === last.GetNode() ? last.GetContentIndex() : node.Len();
        const paragraphOnly = this.characters.length === 0 && this.paragraphs.length > 0;
        if (low >= high && (!paragraphOnly || node.Len() !== 0)) continue;
        if (paragraphOnly && !node.HasSwAttrSet()) {
          const collection = node.GetTextFormatColl();
          if (visitedCollections.has(collection)) continue;
          visitedCollections.add(collection);
        }
        if (
          !this.paragraphs.every(
            /** Checks the node-owned OtherSet before matching character ranges. @param criterion - Paragraph criterion. @returns Whether it matches. */ (
              criterion,
            ) =>
              matchesAttribute(
                readNodeAttribute(node, criterion, this.includeCollections),
                criterion,
              ),
          )
        )
          continue;
        // Paragraph-only FindAttrsImpl runs from the directional start to the paragraph edge.
        const spans: Iterable<TextSpan> = paragraphOnly
          ? [[backward ? 0 : low, backward ? high : node.Len()]]
          : FindAttrsImpl(node, this.characters, this.includeCollections, low, high);
        for (const [start, end] of backward ? [...spans].reverse() : spans) {
          if (this.options === undefined || this.engine === undefined) {
            cursor.GetPoint().Assign(node, backward ? start : end);
            cursor.SetMark();
            cursor.GetMark().SetContent(backward ? end : start);
            return FIND_FOUND;
          }
          bounded.GetPoint().Assign(node, end);
          bounded.SetMark();
          bounded.GetMark().SetContent(start);
          if (FindTextImpl(cursor, this.options, this.engine, backward, bounded)) return FIND_FOUND;
        }
      }
      return FIND_NOT_FOUND;
    } finally {
      bounded.Dispose();
    }
  }

  /** Reports the native strategy mode. @returns Whether this strategy edits matches. */
  public IsReplaceMode(): boolean {
    return false;
  }
}

/** Builds the native bulk-replacement set, resetting exact criteria absent from the replacement. @param searchSet - Exact and presence criteria. @param replaceSet - Replacement items. @returns Owned items to apply. */
function PrepareReplacement(searchSet: SfxItemSet, replaceSet: SfxItemSet): SfxItemSet {
  const pool = replaceSet.GetPool();
  const applied = new SfxItemSet(pool, replaceSet.GetRanges());
  try {
    if (replaceSet.Count() === 0) return applied;
    for (const iter = new SfxItemIter(searchSet); !iter.IsAtEnd(); iter.Next()) {
      const which = iter.GetCurWhich();
      if (
        !IsInvalidItem(iter.GetCurItem()) &&
        replaceSet.GetItemState(which, false) !== SfxItemState.SET
      )
        applied.Put(pool.GetUserOrPoolDefaultItem(which));
    }
    applied.PutSet(replaceSet);
    return applied;
  } catch (error) {
    applied.Dispose();
    throw error;
  }
}

/** Applies native text and character formatting replacement to a selected result. @param cursor - Matching range. @param text - Replacement text if requested. @param attributes - Items to apply. @param regex - Whether to interpret regex paragraph breaks. @returns Nothing. */
export function ReplaceAttrs(
  cursor: SwPaM,
  text: string | undefined,
  attributes: SfxItemSet,
  regex = false,
): void {
  const items = attributes.entries();
  if (
    items.length !== attributes.Count() ||
    items.some(
      /** Admits the represented character editing families. @param item - Replacement attribute. @returns Whether outside the supported range. */ (
        item,
      ) =>
        (item.Which() < RES_CHRATR_BEGIN || item.Which() >= RES_CHRATR_END) &&
        !isParagraphEditItem(item.Which()),
    )
  )
    throw new Error("Writer search replacement received an unsupported formatting item.");
  const operations = cursor.GetPoint().GetNode().GetDoc().GetDocumentContentOperationsManager();
  if (text !== undefined) {
    const start = cursor.Start().GetContentIndex();
    operations.ReplaceRange(cursor, text, regex);
    cursor.Start().SetContent(start);
  }
  if (attributes.Count() > 0) operations.InsertItemSet(cursor, attributes);
}

/** Runs attribute search on the native cursor ring. @param cursor - Search cursor. @param set - Search formatting. @param includeCollections - Whether named styles participate. @param start - Initial document boundary. @param end - Final document boundary. @param ranges - Search scope. @param options - Optional text criteria. @param acceptsNode - View node admission. @param replacement - Optional bulk replacement item set. @param createRegex - Native ICU constructor. @returns Number of matches. */
export function FindAttrs(
  cursor: SwCursor,
  set: SfxItemSet,
  includeCollections: boolean,
  start: SwDocPositions,
  end: SwDocPositions,
  ranges: FindRanges,
  options: SearchOptions2 | undefined,
  acceptsNode: SwSearchNodeFilter,
  replacement?: SfxItemSet,
  createRegex?: RegexMatcherFactory,
): number {
  const strategy = new SwFindParaAttr(set, includeCollections, options, acceptsNode, createRegex);
  if (replacement === undefined) return cursor.FindAll(strategy, start, end, ranges, [false]);
  const applied = PrepareReplacement(set, replacement);
  const replaceText =
    options !== undefined &&
    (options.replaceString.getLength() !== 0 || set.Count() === 0 || applied.Count() === 0);
  const regex = replaceText && options.AlgorithmType2 === REGEXP;
  const text = replaceText && !regex ? DecodeSearchText(options.replaceString) : undefined;
  const undo = cursor.GetPoint().GetNode().GetDoc().GetUndoManager();
  const record = undo.DoesUndo();
  if (record) undo.StartUndo("Replace");
  try {
    const captures = regex ? new TextSearch(options, createRegex) : undefined;
    return cursor.FindAll(
      {
        /** Replaces the next match through the native content operations. @param match - Result cursor. @param backward - Direction. @param region - Bounds. @returns Native find result flag. */
        DoFind(match, backward, region) {
          if (strategy.DoFind(match, backward, region) === FIND_NOT_FOUND) return FIND_NOT_FOUND;
          const resolved =
            regex && captures !== undefined
              ? ResolveSearchReplacement(options, match, captures)
              : text;
          ReplaceAttrs(match, resolved, applied, regex);
          return FIND_NO_RING;
        },
        /** Reports an editing strategy. @returns True. */
        IsReplaceMode: () => true,
      },
      start,
      end,
      ranges,
      [false],
    );
  } finally {
    if (record) undo.EndUndo();
    applied.Dispose();
  }
}
