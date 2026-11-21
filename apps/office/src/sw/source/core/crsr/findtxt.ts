/** @fileoverview Writer model-text FindTextImpl and inline fly/soft-hyphen cleanup from native findtxt.cxx; layout-merged text and fields/notes remain unported. */
import { fnMoveBackward, fnMoveForward, SwPaM } from "./pam";
import {
  FIND_FOUND,
  FIND_NOT_FOUND,
  FIND_NO_RING,
  type SwCursor,
  type SwFindParas,
  type SwSearchNodeFilter,
} from "./swcrsr";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { CH_TXTATR_INWORD, RES_TXTATR_ANNOTATION, RES_TXTATR_FLYCNT } from "../../../inc/hintids";
import { REG_NOT_BEGINOFLINE } from "../../../../offapi/com/sun/star/util/SearchFlags";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TextSearch, type RegexMatcherFactory } from "../../../../unotools/inc/textsearch";
import { processUnicodeEscapes } from "../../../../i18nutil/source/utility/unicodeescape";
import { SearchResult } from "../../../../offapi/com/sun/star/util/SearchResult";
import { OUString } from "../../../../sal/inc/rtl/ustring";

import { APPROXIMATE, REGEXP } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { SwScriptIterator } from "../txtnode/txatritr";
import { g_pBreakIt } from "../bastyp/breakit";

/** Native model-text lcl_CleanStr, retaining removal offsets in cleaned coordinates. @param node - Model text. @param start - Lower range bound. @param end - Upper range bound. @param removeSoftHyphens - Source DoSearch policy. @param removeCommentAnchors - Whether the marker is part of the search. @returns Clean text, adjusted end and removal offsets. */
function lcl_CleanStr(
  node: SwTextNode,
  start: number,
  end: number,
  removeSoftHyphens: boolean,
  removeCommentAnchors: boolean,
): { text: OUString; end: number; removed: readonly number[] } {
  const hints = node.GetpSwpHints(),
    flyAnchors = new Set<number>(),
    commentAnchors = new Set<number>();
  for (let i = 0; hints !== undefined && i < hints.Count(); i++) {
    const hint = hints.Get(i);
    const offset = hint.GetStart();
    if (offset >= end) break;
    if (offset < start || !hint.HasDummyChar()) continue;
    if (hint.Which() === RES_TXTATR_FLYCNT) flyAnchors.add(offset);
    else if (hint.Which() === RES_TXTATR_ANNOTATION) {
      if (removeCommentAnchors) commentAnchors.add(offset);
    } else throw new Error("Writer field/dummy-character search is not implemented.");
  }
  const original = node.GetText(),
    units: number[] = [],
    removed: number[] = [],
    replaced: number[] = [];
  for (let i = 0; i < original.length; i++) {
    const unit = original.charCodeAt(i);
    if (flyAnchors.has(i)) {
      if (units.length === start) {
        removed.push(units.length);
      } else {
        // Native uses DEL as a separator inside the text and removes it at the paragraph end.
        replaced.push(units.length);
        units.push(0x7f);
      }
    } else if (
      commentAnchors.has(i) ||
      (removeSoftHyphens && i >= start && i < end && unit === 0xad)
    ) {
      removed.push(units.length);
    } else {
      units.push(unit);
    }
  }
  for (let i = replaced.length - 1; i >= 0; i--) {
    const offset = replaced[i] as number;
    if (offset === units.length - 1) {
      units.pop();
      removed.push(offset);
    }
  }
  return {
    text: new OUString(Uint16Array.from(units), units.length),
    end: end - removed.length,
    removed,
  };
}
/** Searches a prepared paragraph in the native direction and chooses its locale per script run. @param node - Language-bearing text node. @param options - Native search options. @param engine - Shared wrapper. @param text - Cleaned text. @param start - Directional start and match output. @param end - Directional end and match output. @param backward - Direction. @returns Whether a nonempty match was found. */
function searchText(
  node: SwTextNode,
  options: SearchOptions2,
  engine: TextSearch,
  text: OUString,
  start: [number],
  end: [number],
  backward: boolean,
): boolean {
  /** Searches one prepared span. @returns Whether the native wrapper provided a nonempty match. */
  function find(): boolean {
    return (
      (backward
        ? engine.SearchBackward(text, start, end)
        : engine.SearchForward(text, start, end)) && start[0] !== end[0]
    );
  }
  if (options.AlgorithmType2 !== APPROXIMATE) return find();
  const originalEnd = end[0];
  const key = options.searchString.getStr().subarray(0, options.searchString.getLength());
  const script = g_pBreakIt.GetRealScriptOfText(key, 0);
  const scripts = new SwScriptIterator(
    text.getStr().subarray(0, text.getLength()),
    start[0],
    !backward,
  );
  while (backward ? originalEnd < start[0] : start[0] < originalEnd) {
    end[0] = scripts.GetScriptChgPos();
    const runEnd = end[0];
    if (script === scripts.GetCurrScript()) {
      engine.SetLocale(options, g_pBreakIt.GetLocale(node.GetLang(backward ? runEnd : start[0])));
      if (find()) return true;
    }
    scripts.Next();
    start[0] = runEnd;
  }
  return false;
}

/** Native DoSearch model-text branch recovers point/mark using its directional removal predicates. @param target - Result PaM. @param node - Current node. @param options - Original options. @param engine - Shared wrapper. @param low - Lower content bound. @param high - Upper content bound. @param backward - Search direction. @param pattern - Decoded regex pattern when applicable. @returns Whether a nonempty match was selected. */
function DoSearch(
  target: SwPaM,
  node: SwTextNode,
  options: SearchOptions2,
  engine: TextSearch,
  low: number,
  high: number,
  backward: boolean,
  pattern: string | undefined,
): boolean {
  if (high !== node.Len() && pattern?.endsWith("$")) {
    let alternative = pattern.indexOf("|");
    while (alternative > 0 && pattern[alternative - 1] === "$")
      alternative = pattern.indexOf("|", alternative + 1);
    if (alternative === -1) return false;
  }

  const keepSoftHyphens =
    pattern !== undefined
      ? /\\(?:xAD|x\{00AD\}|u00AD|u00ad|U000000AD|N\{SOFT HYPHEN\})/.test(pattern)
      : options.searchString.getLength() === 1 && options.searchString.getStr()[0] === 0xad;
  const key = options.searchString.getStr().subarray(0, options.searchString.getLength());
  const clean = lcl_CleanStr(
    node,
    low,
    high,
    !keepSoftHyphens,
    !key.includes(CH_TXTATR_INWORD.charCodeAt(0)),
  );
  const start: [number] = [backward ? clean.end : low],
    end: [number] = [backward ? low : clean.end];
  try {
    if (low >= clean.end || !searchText(node, options, engine, clean.text, start, end, backward))
      return false;
  } finally {
    clean.text.dispose();
  }
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
  target.GetPoint().Assign(node, backward ? high : low);
  target.SetMark();
  target.GetMark().SetContent(backward ? restoredEnd : restoredStart);
  target.GetPoint().SetContent(backward ? restoredStart : restoredEnd);
  if (backward) target.Exchange();
  return true;
}
/** Selects a native paragraph break as a range between consecutive text nodes. @param target - Result cursor. @param node - Current text node. @param backward - Search direction. @param empty - Whether the paragraph before the break must be empty. @param region - Registered search bounds. @param acceptsNode - Represented layout admission. @returns Whether the break was selected. */
function FindParagraphBreak(
  target: SwPaM,
  node: SwTextNode,
  backward: boolean,
  empty: boolean,
  region: SwPaM,
  acceptsNode?: SwSearchNodeFilter,
): boolean {
  if (empty && !backward && node.Len() !== 0) return false;
  const edge = new SwPaM(region.GetPoint());
  try {
    edge.GetPoint().Assign(node, backward ? 0 : node.Len());
    edge.SetMark();
    if (!edge.Move(backward ? fnMoveBackward : fnMoveForward)) return false;
    const next = edge.GetPoint();
    const nextNode = next.GetNode();
    if (
      !(nextNode instanceof SwTextNode) ||
      Math.abs(next.GetNodeIndex() - node.GetIndex()) !== 1 ||
      (empty && backward && next.GetContentIndex() !== 0) ||
      next.compare(region.Start()) < 0 ||
      next.compare(region.End()) > 0 ||
      acceptsNode?.(nextNode) === false
    )
      return false;
    target.GetPoint().Assign(next);
    target.SetMark();
    target.GetMark().Assign(edge.GetMark());
    return true;
  } finally {
    edge.Dispose();
  }
}

/** Native represented model-text traversal through actual SwNodes, including table content. No projection IDs or concatenated document string are used. @param searchPam - Result cursor; the region owns traversal bounds. @param options - Native search options. @param engine - Prepared shared engine. @param backward - Direction. @param region - Registered model bounds. @param acceptsNode - Represented layout admission. @returns Whether one match was found; failure preserves the caller cursor. */
export function FindTextImpl(
  searchPam: SwPaM,
  options: SearchOptions2,
  engine: TextSearch,
  backward: boolean,
  region: SwPaM,
  acceptsNode?: SwSearchNodeFilter,
): boolean {
  if (options.searchString.getLength() === 0) return false;
  const first = region.Start(),
    last = region.End(),
    nodes = first.GetNode().GetNodes();
  if (searchPam.GetPoint().GetNode().GetNodes() !== nodes)
    throw new Error("Writer search cursor belongs to another document.");
  if (first.compare(last) === 0) return false;
  const pattern =
    options.AlgorithmType2 === REGEXP ? DecodeSearchText(options.searchString) : undefined;
  const emptyParagraph = pattern === "^$" || pattern === "$^";
  const paragraphBreak = pattern === "$" || emptyParagraph;
  // Native MakeRegion chooses the traversal start from the region, not the result cursor.
  for (
    let index = backward ? last.GetNodeIndex() : first.GetNodeIndex();
    index >= first.GetNodeIndex() && index <= last.GetNodeIndex();
    index += backward ? -1 : 1
  ) {
    const node = nodes.at(index);
    if (!(node instanceof SwTextNode) || acceptsNode?.(node) === false) continue;
    const low = node === first.GetNode() ? first.GetContentIndex() : 0;
    const high = node === last.GetNode() ? last.GetContentIndex() : node.Len();
    if (low < high && DoSearch(searchPam, node, options, engine, low, high, backward, pattern))
      return true;
    if (
      paragraphBreak &&
      (!pattern?.endsWith("$") || high === node.Len()) &&
      FindParagraphBreak(searchPam, node, backward, emptyParagraph, region, acceptsNode)
    )
      return true;
  }
  return false;
}

/** Resolves native Writer replacement references using the forward search of the selected model span. @param options - Source regex and replacement. @param cursor - Marked model selection. @param prepared - Already resolved search service. @returns Expanded replacement or no match. */
export function ReplaceBackReferences(
  options: SearchOptions2,
  cursor: SwPaM,
  prepared?: TextSearch,
): OUString | undefined {
  if (options.AlgorithmType2 !== REGEXP || !cursor.HasMark()) return undefined;
  const first = cursor.Start();
  const last = cursor.End();
  const node = first.GetNode();
  if (!(node instanceof SwTextNode) || !(last.GetNode() instanceof SwTextNode)) return undefined;
  const pattern = options.searchString.getStr().subarray(0, options.searchString.getLength());
  const paragraphEnd =
    (pattern[0] === 36 && (pattern.length === 1 || (pattern.length === 2 && pattern[1] === 94))) ||
    (pattern.length === 2 && pattern[0] === 94 && pattern[1] === 36);
  if (!paragraphEnd && node !== last.GetNode()) return undefined;

  const replacement = options.replaceString;
  const value = processUnicodeEscapes(replacement.getStr().subarray(0, replacement.getLength()));
  const result = { value: new SearchResult() };
  let transferred = false;
  try {
    if (paragraphEnd) {
      result.value.subRegExpressions = 1;
      result.value.startOffset.realloc(1);
      result.value.endOffset.realloc(1);
      result.value.startOffset.operatorIndex(0)[0] = 0;
      result.value.endOffset.operatorIndex(0)[0] = 1;
      TextSearch.ReplaceBackReferences(value, Uint16Array.of(10), result.value);
    } else {
      const low = first.GetContentIndex();
      const clean = lcl_CleanStr(node, low, last.GetContentIndex(), false, false);
      try {
        if (
          !(prepared ?? new TextSearch(options)).SearchForward(
            clean.text,
            [low],
            [clean.end],
            result,
          )
        )
          return undefined;
        TextSearch.ReplaceBackReferences(
          value,
          clean.text.getStr().subarray(0, clean.text.getLength()),
          result.value,
        );
      } finally {
        clean.text.dispose();
      }
    }
    transferred = true;
    return value;
  } finally {
    result.value.dispose();
    if (!transferred) value.dispose();
  }
}

/** Converts counted search text to a UTF-16 string. @param value - Native search text. @returns Model text. */
export function DecodeSearchText(value: OUString): string {
  const units = value.getStr();
  let replacement = "";
  for (let index = 0; index < value.getLength(); index++)
    replacement += String.fromCharCode(units[index] as number);
  return replacement;
}

/** Resolves captures, preserving the original replacement when the selected span cannot be matched. @param options - Native search and replacement. @param cursor - Selected span. @param engine - Search without attribute region flags. @returns Model replacement text. */
export function ResolveSearchReplacement(
  options: SearchOptions2,
  cursor: SwPaM,
  engine: TextSearch,
): string {
  const expanded = ReplaceBackReferences(options, cursor, engine);
  try {
    return DecodeSearchText(expanded ?? options.replaceString);
  } finally {
    expanded?.dispose();
  }
}

/** Native SwFindParaText normal strategy over the actual shared TextSearch owner. Replacement uses the native document and history owners. */
export class SwFindParaText implements SwFindParas {
  private readonly m_aSText: TextSearch;
  /** Initializes actual search state, once for all visited ranges. @param m_rSearchOpt - Native options. @param m_bReplace - Native replacement mode. @param acceptsNode - Represented layout admission. @param createRegex - ICU constructor in this realm. @returns Search strategy. */
  public constructor(
    private readonly m_rSearchOpt: SearchOptions2,
    private readonly m_bReplace: boolean,
    private readonly acceptsNode?: SwSearchNodeFilter,
    createRegex?: RegexMatcherFactory,
  ) {
    this.m_aSText = new TextSearch(m_rSearchOpt, createRegex);
  }
  /** Calls the native represented model-text search. @param cursor - Result PaM. @param backward - Direction. @param region - Current native region. @returns Native find result flag. */
  public DoFind(cursor: SwPaM, backward: boolean, region: SwPaM): number {
    if (!FindTextImpl(cursor, this.m_rSearchOpt, this.m_aSText, backward, region, this.acceptsNode))
      return FIND_NOT_FOUND;
    if (!this.m_bReplace) return FIND_FOUND;
    const start = cursor.Start().GetContentIndex();
    const regex = this.m_rSearchOpt.AlgorithmType2 === REGEXP;
    const original = this.m_rSearchOpt.replaceString;
    const expanded = regex
      ? (ReplaceBackReferences(this.m_rSearchOpt, cursor, this.m_aSText) ??
        processUnicodeEscapes(original.getStr().subarray(0, original.getLength())))
      : undefined;
    let replacement: string;
    try {
      replacement = DecodeSearchText(expanded ?? original);
    } finally {
      expanded?.dispose();
    }
    cursor
      .GetPoint()
      .GetNode()
      .GetDoc()
      .GetDocumentContentOperationsManager()
      .ReplaceRange(cursor, replacement, regex);
    cursor.Start().SetContent(start);
    return FIND_NO_RING;
  }
  /** Reports the supported strategy's actual mode. @returns Whether replacement is enabled. */
  public IsReplaceMode(): boolean {
    return this.m_bReplace;
  }
}
/** Native Find_Text prepares the strategy and applies the selection flag before generic cursor traversal. @param cursor - Actual cursor. @param options - Search value. @param start - First boundary. @param end - Last boundary. @param cancel - Cancellation output. @param ranges - Scope flags. @param replace - Native replacement mode. @param acceptsNode - Represented layout admission. @param createRegex - ICU constructor in this realm. @returns Match count. */
export function FindText(
  cursor: SwCursor,
  options: SearchOptions2,
  start: SwDocPositions,
  end: SwDocPositions,
  cancel: [boolean],
  ranges: FindRanges,
  replace = false,
  acceptsNode?: SwSearchNodeFilter,
  createRegex?: RegexMatcherFactory,
): number {
  if ((options.searchFlag & REG_NOT_BEGINOFLINE) !== 0) ranges |= FindRanges.InSel;
  const doc = cursor.GetPoint().GetNode().GetDoc(),
    undo = doc.GetUndoManager();
  // Prepare the actual backend before opening history, so unported engine modes do not mutate undo state.
  const strategy = new SwFindParaText(options, replace, acceptsNode, createRegex);
  return doc.RunModelTransaction(
    /** Completes native replacement history before publishing the model. @returns Match count. */ () => {
      const record = replace && undo.DoesUndo();
      if (record) undo.StartUndo("Replace");
      try {
        return cursor.FindAll(strategy, start, end, ranges, cancel);
      } finally {
        if (record) undo.EndUndo();
      }
    },
  );
}
