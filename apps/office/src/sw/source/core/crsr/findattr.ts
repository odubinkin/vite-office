/** @fileoverview Native Writer character and paragraph attribute search over SwPaM. */
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxColorItem } from "../../../../editeng/source/items/textitem.color";
import { SvxFontItem } from "../../../../editeng/source/items/textitem.font";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import {
  REG_NOT_BEGINOFLINE,
  REG_NOT_ENDOFLINE,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import { SfxItemIter } from "../../../../svl/inc/itemiter";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { IsInvalidItem, SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { TextSearch } from "../../../../unotools/inc/textsearch";
import type { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import {
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
  RES_CHRATR_FONT,
  RES_TXTATR_END,
} from "../../../inc/hintids";
import { SwAttrIter } from "../text/itratr";
import { SwTextNode } from "../txtnode/ndtxt";
import { FindTextImpl } from "./findtxt";
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
  const attributes = node.GetSwAttrSet();
  const hasNodeAttributes = includeCollections || node.HasSwAttrSet();
  let start: number | undefined;
  let offset = low;
  while (offset < high) {
    iterator.Seek(offset);
    const matches = criteria.every(
      /** Checks the value at the current boundary. @param criterion - Required value. @returns Whether the criterion matches. */ (
        criterion,
      ) => {
        const { which, value, anyValue } = criterion;
        const actual = which < RES_TXTATR_END ? handler.ReadHintItem(which) : undefined;
        const item =
          actual ??
          (hasNodeAttributes
            ? anyValue
              ? attributes.GetItemIfSet(which, includeCollections)
              : attributes.Get(which, includeCollections)
            : undefined);
        return item !== undefined && CmpAttr(value, item) !== anyValue;
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
  private readonly criteria: SearchAttribute[] = [];
  private readonly engine: TextSearch | undefined;

  /** Prepares native matching criteria. @param set - Search items. @param includeCollections - Whether named styles participate. @param options - Optional text criteria. @param acceptsNode - View node admission. @returns Strategy. */
  public constructor(
    set: SfxItemSet,
    private readonly includeCollections: boolean,
    private readonly options: SearchOptions2 | undefined,
    private readonly acceptsNode?: SwSearchNodeFilter,
  ) {
    for (const iter = new SfxItemIter(set); !iter.IsAtEnd(); iter.Next()) {
      const which = iter.GetCurWhich();
      const item = iter.GetCurItem();
      const anyValue = IsInvalidItem(item);
      this.criteria.push({
        which,
        value: anyValue ? set.GetPool().GetUserOrPoolDefaultItem(which) : item,
        anyValue,
      });
    }
    if (options !== undefined) {
      const scoped = new SearchOptions2(options);
      scoped.searchFlag |= REG_NOT_BEGINOFLINE | REG_NOT_ENDOFLINE;
      this.engine = new TextSearch(scoped);
    }
  }

  /** Finds the first directional match inside the supplied region. @param cursor - Result. @param backward - Direction. @param region - Search range. @returns Native result flag. */
  public DoFind(cursor: SwPaM, backward: boolean, region: SwPaM): number {
    if (this.criteria.length === 0 && this.options === undefined) return FIND_NOT_FOUND;
    const first = region.Start();
    const last = region.End();
    const nodes = first.GetNode().GetNodes();
    const bounded = new SwPaM(first);
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
        const spans = FindAttrsImpl(node, this.criteria, this.includeCollections, low, high);
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

/** Applies native text and character formatting replacement to a selected result. @param cursor - Matching range. @param text - Replacement text if requested. @param attributes - Items to apply. @returns Nothing. */
export function ReplaceAttrs(
  cursor: SwPaM,
  text: string | undefined,
  attributes: SfxItemSet,
): void {
  const items = attributes.entries();
  if (
    items.length !== attributes.Count() ||
    items.some(
      /** Admits the represented character editing families. @param item - Replacement attribute. @returns Whether outside the supported range. */ (
        item,
      ) => item.Which() < RES_CHRATR_BEGIN || item.Which() >= RES_CHRATR_END,
    )
  )
    throw new Error("Writer search replacement requires character attributes.");
  const operations = cursor.GetPoint().GetNode().GetDoc().GetDocumentContentOperationsManager();
  if (text !== undefined) {
    const start = cursor.Start().GetContentIndex();
    operations.ReplaceRange(cursor, text, false);
    cursor.Start().SetContent(start);
  }
  if (attributes.Count() > 0) operations.InsertItemSet(cursor, attributes);
}

/** Runs attribute search on the native cursor ring. @param cursor - Search cursor. @param set - Search formatting. @param includeCollections - Whether named styles participate. @param start - Initial document boundary. @param end - Final document boundary. @param ranges - Search scope. @param options - Optional text criteria. @param acceptsNode - View node admission. @param replacement - Optional bulk-edit arguments. @returns Number of matches. */
export function FindAttrs(
  cursor: SwCursor,
  set: SfxItemSet,
  includeCollections: boolean,
  start: SwDocPositions,
  end: SwDocPositions,
  ranges: FindRanges,
  options: SearchOptions2 | undefined,
  acceptsNode: SwSearchNodeFilter,
  replacement?: { readonly text: string | undefined; readonly set: SfxItemSet },
): number {
  const strategy = new SwFindParaAttr(set, includeCollections, options, acceptsNode);
  if (replacement === undefined) return cursor.FindAll(strategy, start, end, ranges, [false]);
  const applied = PrepareReplacement(set, replacement.set);
  const text = replacement.text === "" && applied.Count() !== 0 ? undefined : replacement.text;
  const undo = cursor.GetPoint().GetNode().GetDoc().GetUndoManager();
  const record = undo.DoesUndo();
  if (record) undo.StartUndo("Replace");
  try {
    return cursor.FindAll(
      {
        /** Replaces the next match through the native content operations. @param match - Result cursor. @param backward - Direction. @param region - Bounds. @returns Native find result flag. */
        DoFind(match, backward, region) {
          if (strategy.DoFind(match, backward, region) === FIND_NOT_FOUND) return FIND_NOT_FOUND;
          ReplaceAttrs(match, text, applied);
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
