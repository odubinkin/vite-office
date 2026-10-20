/** @fileoverview Writer model-text FindTextImpl and soft-hyphen cleanup from native findtxt.cxx; layout-merged text, fields/notes and regex modes remain unported. */
import { SwPaM, SwPosition } from "./pam";
import { FIND_FOUND, FIND_NOT_FOUND, type SwCursor, type SwFindParas } from "./swcrsr";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { REG_NOT_BEGINOFLINE } from "../../../../offapi/com/sun/star/util/SearchFlags";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TextSearch } from "../../../../unotools/inc/textsearch";
import { OUString } from "../../../../sal/inc/rtl/ustring";

/** Native lcl_CleanStr's represented plain-text branch, retaining removal offsets in cleaned coordinates. @param node - Model text. @param start - Lower range bound. @param end - Upper range bound. @param removeSoftHyphens - Source DoSearch policy. @returns Clean text, adjusted end and removal offsets. */
function lcl_CleanStr(
  node: SwTextNode,
  start: number,
  end: number,
  removeSoftHyphens: boolean,
): { text: OUString; end: number; removed: readonly number[] } {
  const hints = node.GetpSwpHints();
  if (hints !== undefined)
    for (let i = 0; i < hints.Count(); i++) {
      if (hints.Get(i).HasDummyChar())
        throw new Error("Writer field/dummy-character search is not implemented.");
    }
  const original = node.GetText(),
    units: number[] = [],
    removed: number[] = [];
  for (let i = 0; i < original.length; i++) {
    if (removeSoftHyphens && i >= start && i < end && original.charCodeAt(i) === 0xad)
      removed.push(units.length);
    else units.push(original.charCodeAt(i));
  }
  return {
    text: new OUString(Uint16Array.from(units), units.length),
    end: end - removed.length,
    removed,
  };
}
/** Native DoSearch model-text branch recovers point/mark using its directional removal predicates. @param target - Result PaM. @param node - Current node. @param options - Original options. @param engine - Shared wrapper. @param low - Lower content bound. @param high - Upper content bound. @param backward - Search direction. @returns Whether a nonempty match was selected. */
function DoSearch(
  target: SwPaM,
  node: SwTextNode,
  options: SearchOptions2,
  engine: TextSearch,
  low: number,
  high: number,
  backward: boolean,
): boolean {
  const keepSoftHyphens =
    options.searchString.getLength() === 1 && options.searchString.getStr()[0] === 0xad;
  const clean = lcl_CleanStr(node, low, high, !keepSoftHyphens);
  if (low >= clean.end) return false;
  const start: [number] = [backward ? clean.end : low],
    end: [number] = [backward ? low : clean.end];
  if (
    !(backward
      ? engine.SearchBackward(clean.text, start, end)
      : engine.SearchForward(clean.text, start, end)) ||
    start[0] === end[0]
  )
    return false;
  // Wrapper offsets are increasing in either direction. Native DoSearch temporarily swaps
  // them backward when recovering removals, then exchanges point and mark afterward.
  const startLimit = backward ? end[0] : start[0],
    endLimit = backward ? start[0] : end[0];
  const restoredStart =
    startLimit +
    clean.removed.filter(
      /** Native first boundary uses <=. @param index - Cleaned removal offset. @returns Whether before/at boundary. */ (
        index,
      ) => index <= startLimit,
    ).length;
  const restoredEnd =
    endLimit +
    clean.removed.filter(
      /** Native second boundary uses <. @param index - Cleaned removal offset. @returns Whether before boundary. */ (
        index,
      ) => index < endLimit,
    ).length;
  const mark = new SwPosition(node, backward ? restoredEnd : restoredStart);
  const point = new SwPosition(node, backward ? restoredStart : restoredEnd);
  try {
    target.Assign(point, mark);
    if (backward) target.Exchange();
  } finally {
    point.Dispose();
    mark.Dispose();
  }
  return true;
}
/** Native represented model-text traversal through actual SwNodes, including table content. No projection IDs or concatenated document string are used. @param searchPam - Result cursor; the region owns traversal bounds. @param options - Native search options. @param engine - Prepared shared engine. @param backward - Direction. @param region - Registered model bounds. @returns Whether one match was found; failure preserves the caller cursor. */
export function FindTextImpl(
  searchPam: SwPaM,
  options: SearchOptions2,
  engine: TextSearch,
  backward: boolean,
  region: SwPaM,
): boolean {
  if (options.searchString.getLength() === 0) return false;
  const first = region.Start(),
    last = region.End(),
    nodes = first.GetNode().GetNodes();
  if (searchPam.GetPoint().GetNode().GetNodes() !== nodes)
    throw new Error("Writer search cursor belongs to another document.");
  if (first.compare(last) === 0) return false;
  // Native MakeRegion chooses the traversal start from the region, not the result cursor.
  for (
    let index = backward ? last.GetNodeIndex() : first.GetNodeIndex();
    index >= first.GetNodeIndex() && index <= last.GetNodeIndex();
    index += backward ? -1 : 1
  ) {
    const node = nodes.at(index);
    if (!(node instanceof SwTextNode)) continue;
    const low = node === first.GetNode() ? first.GetContentIndex() : 0;
    const high = node === last.GetNode() ? last.GetContentIndex() : node.Len();
    if (low < high && DoSearch(searchPam, node, options, engine, low, high, backward)) return true;
  }
  return false;
}

/** Native SwFindParaText find-only strategy over the actual shared TextSearch owner. Replacement mode is rejected at the public cursor boundary until its native document/history contracts are implemented. */
class SwFindParaText implements SwFindParas {
  private readonly m_aSText: TextSearch;
  /** Initializes actual search state, once for all visited ranges. @param m_rSearchOpt - Native options. @returns Search strategy. */
  public constructor(private readonly m_rSearchOpt: SearchOptions2) {
    this.m_aSText = new TextSearch(m_rSearchOpt);
  }
  /** Calls the native represented model-text search. @param cursor - Result PaM. @param backward - Direction. @param region - Current native region. @returns Native find result flag. */
  public DoFind(cursor: SwPaM, backward: boolean, region: SwPaM): number {
    return FindTextImpl(cursor, this.m_rSearchOpt, this.m_aSText, backward, region)
      ? FIND_FOUND
      : FIND_NOT_FOUND;
  }
  /** Reports the supported strategy's actual mode. @returns False for this find-only strategy. */
  public IsReplaceMode(): boolean {
    return false;
  }
}
/** Native Find_Text prepares the strategy and applies the selection flag before generic cursor traversal. @param cursor - Actual cursor. @param options - Search value. @param start - First boundary. @param end - Last boundary. @param cancel - Cancellation output. @param ranges - Scope flags. @returns Match count. */
export function FindText(
  cursor: SwCursor,
  options: SearchOptions2,
  start: SwDocPositions,
  end: SwDocPositions,
  cancel: [boolean],
  ranges: FindRanges,
): number {
  if ((options.searchFlag & REG_NOT_BEGINOFLINE) !== 0) ranges |= FindRanges.InSel;
  return cursor.FindAll(new SwFindParaText(options), start, end, ranges, cancel);
}
