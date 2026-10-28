/** @fileoverview Native deferred HTML attribute owners from swhtml.hxx and swhtml.cxx. */
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SwNodeIndex,
  type SwPosition,
  type SwPaM,
  GoNextPos,
  GoPreviousPos,
} from "../../core/crsr/pam";
import type { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { LATIN, ASIAN, COMPLEX } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import * as H from "../../../inc/hintids";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwNode } from "../../core/docnode/node";

/** A stable borrowed HTMLAttr** slot; the tuple owns no attribute copy. */
export type HTMLAttrHead = [HTMLAttr | null];
/** Native table order, which determines EndAllAttrs processing priority. */
export class HTMLAttrTable {
  /** Original pKeep head, initially null. */
  public readonly pKeep: HTMLAttrHead = [null];
  /** Original pBox head, initially null. */
  public readonly pBox: HTMLAttrHead = [null];
  /** Original pBrush head, initially null. */
  public readonly pBrush: HTMLAttrHead = [null];
  /** Original pBreak head, initially null. */
  public readonly pBreak: HTMLAttrHead = [null];
  /** Original pPageDesc head, initially null. */
  public readonly pPageDesc: HTMLAttrHead = [null];
  /** Original pFirstLineIndent head, initially null. */
  public readonly pFirstLineIndent: HTMLAttrHead = [null];
  /** Original pTextLeftMargin head, initially null. */
  public readonly pTextLeftMargin: HTMLAttrHead = [null];
  /** Original pRightMargin head, initially null. */
  public readonly pRightMargin: HTMLAttrHead = [null];
  /** Original pULSpace head, initially null. */
  public readonly pULSpace: HTMLAttrHead = [null];
  /** Original pLineSpacing head, initially null. */
  public readonly pLineSpacing: HTMLAttrHead = [null];
  /** Original pAdjust head, initially null. */
  public readonly pAdjust: HTMLAttrHead = [null];
  /** Original pDropCap head, initially null. */
  public readonly pDropCap: HTMLAttrHead = [null];
  /** Original pSplit head, initially null. */
  public readonly pSplit: HTMLAttrHead = [null];
  /** Original pWidows head, initially null. */
  public readonly pWidows: HTMLAttrHead = [null];
  /** Original pOrphans head, initially null. */
  public readonly pOrphans: HTMLAttrHead = [null];
  /** Original pDirection head, initially null. */
  public readonly pDirection: HTMLAttrHead = [null];
  /** Original pCharFormats head, initially null. */
  public readonly pCharFormats: HTMLAttrHead = [null];
  /** Original pINetFormat head, initially null. */
  public readonly pINetFormat: HTMLAttrHead = [null];
  /** Original pBold head, initially null. */
  public readonly pBold: HTMLAttrHead = [null];
  /** Original pBoldCJK head, initially null. */
  public readonly pBoldCJK: HTMLAttrHead = [null];
  /** Original pBoldCTL head, initially null. */
  public readonly pBoldCTL: HTMLAttrHead = [null];
  /** Original pItalic head, initially null. */
  public readonly pItalic: HTMLAttrHead = [null];
  /** Original pItalicCJK head, initially null. */
  public readonly pItalicCJK: HTMLAttrHead = [null];
  /** Original pItalicCTL head, initially null. */
  public readonly pItalicCTL: HTMLAttrHead = [null];
  /** Original pStrike head, initially null. */
  public readonly pStrike: HTMLAttrHead = [null];
  /** Original pUnderline head, initially null. */
  public readonly pUnderline: HTMLAttrHead = [null];
  /** Original pBlink head, initially null. */
  public readonly pBlink: HTMLAttrHead = [null];
  /** Original pFont head, initially null. */
  public readonly pFont: HTMLAttrHead = [null];
  /** Original pFontCJK head, initially null. */
  public readonly pFontCJK: HTMLAttrHead = [null];
  /** Original pFontCTL head, initially null. */
  public readonly pFontCTL: HTMLAttrHead = [null];
  /** Original pFontHeight head, initially null. */
  public readonly pFontHeight: HTMLAttrHead = [null];
  /** Original pFontHeightCJK head, initially null. */
  public readonly pFontHeightCJK: HTMLAttrHead = [null];
  /** Original pFontHeightCTL head, initially null. */
  public readonly pFontHeightCTL: HTMLAttrHead = [null];
  /** Original pFontColor head, initially null. */
  public readonly pFontColor: HTMLAttrHead = [null];
  /** Original pEscapement head, initially null. */
  public readonly pEscapement: HTMLAttrHead = [null];
  /** Original pCaseMap head, initially null. */
  public readonly pCaseMap: HTMLAttrHead = [null];
  /** Original pKerning head, initially null. */
  public readonly pKerning: HTMLAttrHead = [null];
  /** Original pCharBrush head, initially null. */
  public readonly pCharBrush: HTMLAttrHead = [null];
  /** Original pLanguage head, initially null. */
  public readonly pLanguage: HTMLAttrHead = [null];
  /** Original pLanguageCJK head, initially null. */
  public readonly pLanguageCJK: HTMLAttrHead = [null];
  /** Original pLanguageCTL head, initially null. */
  public readonly pLanguageCTL: HTMLAttrHead = [null];
  /** Original pCharBox head, initially null. */
  public readonly pCharBox: HTMLAttrHead = [null];
  /** Original pOpticalSizing head, initially null. */
  public readonly pOpticalSizing: HTMLAttrHead = [null];
  /** Original pFontVariations head, initially null. */
  public readonly pFontVariations: HTMLAttrHead = [null];
}

/** Original deferred HTML attribute with raw content offsets and identity-bearing node indices. */
export class HTMLAttr {
  public static readonly MAX_CHAIN_DEPTH = 1024;
  public readonly m_nStartPara: SwNodeIndex;
  public readonly m_nEndPara: SwNodeIndex;
  public m_nStartContent: number;
  public m_nEndContent: number;
  public m_bInsAtStart = true;
  public m_bLikePara = false;
  public m_bValid = true;
  public readonly m_pItem: SfxPoolItem;
  public m_xAttrTab: HTMLAttrTable;
  public m_pNext: HTMLAttr | null = null;
  public m_pPrev: HTMLAttr | null = null;
  public m_ppHead: HTMLAttrHead | null;
  public m_nChainDepth = 0;

  /** Clones the item at an actual cursor position. @param position - Original start/end position. @param item - Borrowed source item. @param head - Stable table slot. @param table - Retained native table. @returns New owner. */
  public constructor(
    position: SwPosition,
    item: SfxPoolItem,
    head: HTMLAttrHead | null,
    table: HTMLAttrTable,
  );
  /** Original copy constructor starts a fresh chain at the supplied end. @param source - Source attribute. @param endNode - End paragraph. @param endContent - Raw end offset. @param head - Stable table slot. @param table - Retained native table. @returns New owner. */
  public constructor(
    source: HTMLAttr,
    endNode: SwNode,
    endContent: number,
    head: HTMLAttrHead | null,
    table: HTMLAttrTable,
  );
  /** Implements the original position and copy construction overloads. @param source - Cursor or attribute. @param itemOrEnd - Item or end node. @param headOrEnd - Head or end offset. @param tableOrHead - Table or head. @param copiedTable - Copy table. @returns New owner. */
  public constructor(
    source: SwPosition | HTMLAttr,
    itemOrEnd: SfxPoolItem | SwNode,
    headOrEnd: HTMLAttrHead | null | number,
    tableOrHead: HTMLAttrTable | HTMLAttrHead | null,
    copiedTable?: HTMLAttrTable,
  ) {
    if (source instanceof HTMLAttr) {
      this.m_nStartPara = new SwNodeIndex(source.m_nStartPara.GetNode());
      this.m_nEndPara = new SwNodeIndex(itemOrEnd as SwNode);
      this.m_nStartContent = source.m_nStartContent;
      this.m_nEndContent = (headOrEnd as number) | 0;
      this.m_bInsAtStart = source.m_bInsAtStart;
      this.m_bLikePara = source.m_bLikePara;
      this.m_bValid = source.m_bValid;
      this.m_pItem = source.m_pItem.Clone() as SfxPoolItem;
      this.m_xAttrTab = copiedTable as HTMLAttrTable;
      this.m_ppHead = tableOrHead as HTMLAttrHead | null;
    } else {
      this.m_nStartPara = new SwNodeIndex(source.GetNode());
      this.m_nEndPara = new SwNodeIndex(source.GetNode());
      this.m_nStartContent = source.GetContentIndex();
      this.m_nEndContent = source.GetContentIndex();
      this.m_pItem = (itemOrEnd as SfxPoolItem).Clone() as SfxPoolItem;
      this.m_xAttrTab = tableOrHead as HTMLAttrTable;
      this.m_ppHead = headOrEnd as HTMLAttrHead | null;
    }
  }
  /** Copies the original previous list but never the open next list. @param endNode - End paragraph. @param endContent - Raw end offset. @returns Independent item owner with borrowed previous chain. */
  public Clone(endNode: SwNode, endContent: number): HTMLAttr {
    const copy = new HTMLAttr(this, endNode, endContent, this.m_ppHead, this.m_xAttrTab);
    copy.m_pPrev = this.m_pPrev;
    return copy;
  }
  /** Restarts the raw range and clears links, preserving item, flags and chain depth. @param start - New paragraph. @param content - Raw start offset. @param head - New head slot. @param table - Retained table. @returns Nothing. */
  public Reset(
    start: SwNode,
    content: number,
    head: HTMLAttrHead | null,
    table: HTMLAttrTable,
  ): void {
    this.m_nStartPara.Assign(start);
    this.m_nEndPara.Assign(start);
    this.m_nStartContent = content | 0;
    this.m_nEndContent = content | 0;
    this.m_pNext = null;
    this.m_pPrev = null;
    this.m_ppHead = head;
    this.m_xAttrTab = table;
  }
  /** Replaces both raw endpoints from the cursor without registering a content index. @param position - Cursor. @returns Nothing. */
  public SetStart(position: SwPosition): void {
    this.m_nStartPara.Assign(position.GetNode());
    this.m_nStartContent = position.GetContentIndex();
    this.m_nEndPara.Assign(this.m_nStartPara.GetNode());
    this.m_nEndContent = this.m_nStartContent;
  }
  /** Returns the start node index. @returns Current node offset. */
  public GetStartParagraphIdx(): number {
    return this.m_nStartPara.GetIndex();
  }
  /** Returns the end node index. @returns Current node offset. */
  public GetEndParagraphIdx(): number {
    return this.m_nEndPara.GetIndex();
  }
  /** Returns the actual start index. @returns Borrowed node index. */
  public GetStartParagraph(): SwNodeIndex {
    return this.m_nStartPara;
  }
  /** Returns the actual end index. @returns Borrowed node index. */
  public GetEndParagraph(): SwNodeIndex {
    return this.m_nEndPara;
  }
  /** Returns the raw start offset. @returns UTF-16 offset. */
  public GetStartContent(): number {
    return this.m_nStartContent;
  }
  /** Returns the raw end offset. @returns UTF-16 offset. */
  public GetEndContent(): number {
    return this.m_nEndContent;
  }
  /** Queries whole-paragraph semantics. @returns Source flag. */
  public IsLikePara(): boolean {
    return this.m_bLikePara;
  }
  /** Enables whole-paragraph semantics. @returns Nothing. */
  public SetLikePara(): void {
    this.m_bLikePara = true;
  }
  /** Returns the owned item. @returns Mutable source item. */
  public GetItem(): SfxPoolItem {
    return this.m_pItem;
  }
  /** Returns the open chain successor. @returns Borrowed owner or null. */
  public GetNext(): HTMLAttr | null {
    return this.m_pNext;
  }
  /** Assigns the source next link without changing depth. @param next - Successor. @returns Nothing. */
  public InsertNext(next: HTMLAttr | null): void {
    this.m_pNext = next;
  }
  /** Returns the pending closed chain. @returns Borrowed owner or null. */
  public GetPrev(): HTMLAttr | null {
    return this.m_pPrev;
  }
  /** Appends a pending chain, detaching its open link and head as in the source. @param previous - Pending chain root. @returns Nothing. */
  public InsertPrev(previous: HTMLAttr): void {
    // Native OSL_ENSURE calls only diagnose; they do not stop these assignments.
    previous.m_pNext = null;
    previous.m_ppHead = null;
    // The source traverses from this root; initialize from its first pending link
    // to avoid a JavaScript this-alias while preserving the same tail selection.
    const first = this.m_pPrev;
    if (first === null) {
      this.m_pPrev = previous;
      return;
    }
    let tail: HTMLAttr = first;
    for (;;) {
      const next: HTMLAttr | null = tail.GetPrev();
      if (next === null) break;
      tail = next;
    }
    tail.m_pPrev = previous;
  }
  /** Original destructor releases this cloned item, never borrowed chain links; node indices use existing identity wrappers. @returns Nothing. */
  public SourceDispose(): void {
    this.m_pItem.Dispose();
  }
  /** Clears the pending chain without touching its owners. @returns Nothing. */
  public ClearPrev(): void {
    this.m_pPrev = null;
  }
  /** Rebinds the borrowed head while retaining its table. @param head - Head slot. @param table - Retained table. @returns Nothing. */
  public SetHead(head: HTMLAttrHead | null, table: HTMLAttrTable): void {
    this.m_ppHead = head;
    this.m_xAttrTab = table;
  }
  /** Defers removal until SetAttr_ processes this owner. @returns Nothing. */
  public Invalidate(): void {
    this.m_bValid = false;
  }
}

/** Borrowed fields of SwHTMLParser used by its split attribute operations. */
export interface SwHTMLAttributeState {
  readonly m_pPam: SwPaM;
  readonly m_xAttrTab: HTMLAttrTable;
  readonly m_aParaAttrs: HTMLAttr[];
  readonly m_aSetAttrTab: HTMLAttr[];
}
/** Opens a native attribute, preserving the original 1024-link depth guard.
 * @param parser - Borrowed native parser fields.
 * @param table - Retained attribute table.
 * @param head - Original stable table slot.
 * @param item - Borrowed item cloned by the new owner.
 * @returns Whether the native chain admitted the attribute.
 */
export function NewAttr(
  parser: SwHTMLAttributeState,
  table: HTMLAttrTable,
  head: HTMLAttrHead,
  item: SfxPoolItem,
): boolean {
  const old = head[0];
  if (old !== null) {
    if (old.m_nChainDepth >= HTMLAttr.MAX_CHAIN_DEPTH) return false;
    const attr = new HTMLAttr(parser.m_pPam.GetPoint(), item, head, table);
    attr.m_nChainDepth = old.m_nChainDepth + 1;
    attr.InsertNext(old);
    head[0] = attr;
  } else head[0] = new HTMLAttr(parser.m_pPam.GetPoint(), item, head, table);
  return true;
}
/** Deregisters the original open owner while retaining any pending closed chain.
 * @param parser - Borrowed native parser fields.
 * @param attr - Open attribute to remove.
 * @returns Nothing.
 */
export function DeleteAttr(parser: SwHTMLAttributeState, attr: HTMLAttr): void {
  // Native OSL_ENSURE diagnoses nonempty temporary attributes, then clears them.
  parser.m_aParaAttrs.length = 0;
  const head = attr.m_ppHead;
  let last: HTMLAttr | null = null;
  if (head !== null && attr !== head[0]) {
    last = head[0];
    while (last !== null && last.GetNext() !== attr) last = last.GetNext();
  }
  const next = attr.GetNext(),
    previous = attr.GetPrev();
  // The JS owner keeps the shared table alive across the same head correction.
  if (previous !== null) {
    if (next !== null) next.InsertPrev(previous);
    else if (previous.m_bInsAtStart) parser.m_aSetAttrTab.unshift(previous);
    else parser.m_aSetAttrTab.push(previous);
  }
  if (last !== null) last.m_pNext = next;
  else if (head !== null) head[0] = next;
  attr.SourceDispose();
}
/** Moves all open lists into the saved native table and rebinds every open head.
 * @param parser - Borrowed native parser fields.
 * @param saved - Original destination table.
 * @returns Nothing.
 */
export function SaveAttrTab(parser: SwHTMLAttributeState, saved: HTMLAttrTable): void {
  parser.m_aParaAttrs.length = 0;
  const currentHeads = Object.values(parser.m_xAttrTab),
    savedHeads = Object.values(saved);
  for (let i = 0; i < currentHeads.length; i++) {
    const current = currentHeads[i] as HTMLAttrHead,
      target = savedHeads[i] as HTMLAttrHead;
    target[0] = current[0];
    let attr = target[0];
    while (attr !== null) {
      attr.SetHead(target, saved);
      attr = attr.GetNext();
    }
    current[0] = null;
  }
}

/** Source script-dependent item classification; script type stays zero for unrelated items. @param attr - Native attribute. @returns Script dependency and native ScriptType. */
export function lcl_swhtml_getItemInfo(attr: HTMLAttr): readonly [boolean, number] {
  switch (attr.GetItem().Which()) {
    case H.RES_CHRATR_FONT:
    case H.RES_CHRATR_FONTSIZE:
    case H.RES_CHRATR_LANGUAGE:
    case H.RES_CHRATR_POSTURE:
    case H.RES_CHRATR_WEIGHT:
      return [true, LATIN];
    case H.RES_CHRATR_CJK_FONT:
    case H.RES_CHRATR_CJK_FONTSIZE:
    case H.RES_CHRATR_CJK_LANGUAGE:
    case H.RES_CHRATR_CJK_POSTURE:
    case H.RES_CHRATR_CJK_WEIGHT:
      return [true, ASIAN];
    case H.RES_CHRATR_CTL_FONT:
    case H.RES_CHRATR_CTL_FONTSIZE:
    case H.RES_CHRATR_CTL_LANGUAGE:
    case H.RES_CHRATR_CTL_POSTURE:
    case H.RES_CHRATR_CTL_WEIGHT:
      return [true, COMPLEX];
    default:
      return [false, 0];
  }
}
/** Native GoInContent boundary branch used only at zero/end offsets by EndAttr. @param parser - Borrowed parser fields. @param backward - Whether moving from paragraph start to preceding paragraph end. @returns Whether a native content neighbor was admitted. */
function moveAttributeBoundary(parser: SwHTMLAttributeState, backward: boolean): boolean {
  const point = parser.m_pPam.GetPoint();
  const node = backward ? GoPreviousPos(point, true) : GoNextPos(point, true);
  if (node === undefined) return false;
  point.SetContent(backward ? node.Len() : 0);
  return true;
}
/** Ends a native deferred attribute, preserving script splitting and delayed-list ordering.
 * @param parser - Borrowed actual parser fields.
 * @param attr - Open native owner.
 * @param checkEmpty - Original empty-range policy.
 * @param breakIterator - Borrowed native script service supplied by SwBreakIt in the original owner.
 * @returns Whether the original owner has a nonempty/admitted range.
 */
export function EndAttr(
  parser: SwHTMLAttributeState,
  attr: HTMLAttr,
  checkEmpty: boolean,
  breakIterator: BreakIteratorImpl,
): boolean {
  let result = true;
  const head = attr.m_ppHead;
  const endPosition = parser.m_pPam.GetPoint();
  let endContent = endPosition.GetContentIndex();
  let last: HTMLAttr | null = null;
  if (head !== null && attr !== head[0]) {
    last = head[0];
    while (last !== null && last.GetNext() !== attr) last = last.GetNext();
  }
  let movedBack = false;
  const which = attr.GetItem().Which();
  if (
    endContent === 0 &&
    H.RES_PARATR_BEGIN <= which &&
    endPosition.GetNodeIndex() !== attr.GetStartParagraphIdx()
  ) {
    movedBack = moveAttributeBoundary(parser, true);
    endContent = parser.m_pPam.GetPoint().GetContentIndex();
  }
  const next = attr.GetNext();
  let insert =
    !checkEmpty ||
    (H.RES_PARATR_BEGIN <= which && movedBack) ||
    H.RES_PAGEDESC === which ||
    H.RES_BREAK === which ||
    endPosition.GetNodeIndex() !== attr.GetStartParagraphIdx() ||
    endContent !== attr.GetStartContent();
  let scriptDependent = false,
    scriptItem = 0;
  if (insert && endPosition.GetNodeIndex() === attr.GetStartParagraphIdx())
    [scriptDependent, scriptItem] = lcl_swhtml_getItemInfo(attr);
  const startNode = attr.GetStartParagraph().GetNode();
  if (insert && scriptDependent && startNode instanceof SwTextNode) {
    const text = startNode.GetText(),
      units = new Uint16Array(text.length);
    for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
    let scriptText = breakIterator.getScriptType(units, attr.GetStartContent());
    let scriptEnd = breakIterator.endOfScript(units, attr.GetStartContent(), scriptText);
    while (scriptEnd < endContent && scriptEnd !== -1) {
      if (scriptItem === scriptText) {
        const pending = attr.Clone(endPosition.GetNode(), scriptEnd);
        pending.ClearPrev();
        if (next !== null) next.InsertPrev(pending);
        else if (pending.m_bInsAtStart) parser.m_aSetAttrTab.unshift(pending);
        else parser.m_aSetAttrTab.push(pending);
      }
      attr.m_nStartContent = scriptEnd;
      scriptText = breakIterator.getScriptType(units, scriptEnd);
      scriptEnd = breakIterator.endOfScript(units, scriptEnd, scriptText);
    }
    insert = scriptItem === scriptText;
  }
  if (insert) {
    attr.m_nEndPara.Assign(endPosition.GetNode());
    attr.m_nEndContent = endContent;
    attr.m_bInsAtStart = H.RES_TXTATR_INETFMT !== which && H.RES_TXTATR_CHARFMT !== which;
    if (next !== null) next.InsertPrev(attr);
    else if (attr.m_bInsAtStart) parser.m_aSetAttrTab.unshift(attr);
    else parser.m_aSetAttrTab.push(attr);
  } else {
    const previous = attr.GetPrev();
    result = false;
    if (previous !== null) {
      if (next !== null) next.InsertPrev(previous);
      else if (previous.m_bInsAtStart) parser.m_aSetAttrTab.unshift(previous);
      else parser.m_aSetAttrTab.push(previous);
    }
  }
  if (last !== null) last.m_pNext = next;
  else if (head !== null) head[0] = next;
  if (movedBack) moveAttributeBoundary(parser, false);
  if (!insert) attr.SourceDispose();
  return result;
}
