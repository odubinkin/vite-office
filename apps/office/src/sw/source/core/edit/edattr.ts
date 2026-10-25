/** @fileoverview Ports the supported SwEditShell::IsMoveLeftMargin and MoveLeftMargin selection traversal from pinned `sw/source/core/edit/edattr.cxx`. */

import { SwEditShell as SwNumberingEditShell } from "./ednumber";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import type { SwFormatINetFormat } from "../txtnode/fmtatr2";
import type { SwDoc } from "../doc/doc";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { getMoveLeftMarginDistance } from "../doc/docfmt";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { RES_TXTATR_INETFMT, RES_LR_SPACE } from "../../../inc/hintids";
import type { SwPaM } from "../crsr/pam";
import type { SwUndoCursorState } from "../undo/undobj";
import { getSwItemWithPaM, type SwItemWithPaM } from "./edattr-items";
import { getSwSelectionScriptType } from "./edattr-script";
import type { SvtScriptType } from "../../../../svl/inc/languageoptions";

/** Reads native edit-shell admission across the actual cursor ring; current page-body frame geometry remains a browser layout accommodation. @param document - Original document. @param cursor - Native cursor ring. @param right - Increase direction. @param modulus - Native snapping policy. @returns Original represented admission. */
export function isMoveLeftMargin(
  document: SwDoc,
  cursor: SwPaM,
  right: boolean,
  modulus = true,
): boolean {
  const distance = getMoveLeftMarginDistance(document) & 0xffff;
  if (distance === 0) return false;
  if (!right) return true;
  const page = document.GetPageDesc().GetValue();
  const frameWidth = page.width - page.leftMargin - page.rightMargin;
  const fiveMillimeters = Math.round((5 * 1440) / 25.4);
  for (const range of cursor.GetRingContainer()) {
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      const margin = node.GetAttr(RES_LR_SPACE) as SvxLRSpaceItem;
      let next = margin.ResolveTextLeft() + distance;
      if (modulus) next = Math.trunc(next / distance) * distance;
      if (!(frameWidth > next + fiveMillimeters)) return false;
    }
  }
  return true;
}

/** Runs the native edit-shell model bracket without building a scalar action or group. @param target - Original editing shell methods. @param right - Increase direction. @param modulus - Native tab snapping. @returns Nothing. */
export function moveLeftMarginAtShell(
  target: { GetDoc(): SwDoc; getShellCursor(): SwPaM; CaptureCursorState(): SwUndoCursorState },
  right: boolean,
  modulus: boolean,
): void {
  const document = target.GetDoc(),
    cursor = target.getShellCursor(),
    state = target.CaptureCursorState();
  document.RunModelTransaction(
    /** Executes the document-owned range history once. @returns Nothing. */ () =>
      document.MoveLeftMargin(cursor, right, modulus, state),
  );
}

/** Reads represented INET state through original native node/ring rules; generic GetCurAttr/style expansion and merged redlines remain unverified. @param document - Active Writer document. @param cursor - Actual native selection ring. @returns Original SET/default/INVALID item state with limit failures clearing prior state. */
export function getWriterINetFormatStateAtCursor(document: SwDoc, cursor: SwPaM): SfxItemSet {
  const state = new SfxItemSet(document.GetAttrPool(), [[RES_TXTATR_INETFMT, RES_TXTATR_INETFMT]]);
  const cursors = [...cursor.GetRingContainer()];
  if (cursors.length > 10000) return state;
  let first = true;
  for (const current of cursors) {
    if (current.GetPoint().GetNode().GetDoc() !== document) {
      state.ClearItem();
      return state;
    }
    if (current.IsInFrontOfLabel()) continue;
    const start = current.Start(),
      end = current.End();
    if (end.GetNodeIndex() - start.GetNodeIndex() >= 10000) {
      state.ClearItem();
      return state;
    }
    for (let index = start.GetNodeIndex(); index <= end.GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (node.IsTextNode()) {
        const paragraph = node as SwTextNode,
          local = getINetFormatState(
            paragraph,
            index === start.GetNodeIndex() ? start.GetContentIndex() : 0,
            index === end.GetNodeIndex() ? end.GetContentIndex() : paragraph.Len(),
          );
        if (first) state.PutSet(local, false);
        else mergeINetFormatState(state, local);
      }
      first = false;
    }
  }
  return state;
}

/** Ports the represented single-INET GetParaAttr state branch from thints.cxx without text projection or ownership mutation. Node attribute ranges currently exclude INET and automatic character styles cannot supply it. @param node - Original native text owner. @param start - Sorted native start. @param end - Sorted native end. @returns SET/default/INVALID native item state. */
function getINetFormatState(node: SwTextNode, start: number, end: number): SfxItemSet {
  const state = new SfxItemSet(node.GetDoc().GetAttrPool(), [
      [RES_TXTATR_INETFMT, RES_TXTATR_INETFMT],
    ]),
    format = new SfxItemSet(state.GetPool(), state.GetRanges());
  let previous: SwFormatINetFormat | undefined,
    previousEnd = 0,
    invalid = false;
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    const hintStart = hint.GetStart(),
      hintEnd = hint.GetEnd();
    if (hintStart > end) break;
    if (hint.Which() !== RES_TXTATR_INETFMT) continue;
    const item = hint.GetAttr() as SwFormatINetFormat;
    if (start === end) {
      if (
        (hintStart < start && (hint.DontExpand() ? start < hintEnd : start <= hintEnd)) ||
        (start === hintStart && (hintStart === hintEnd || start === 0))
      )
        state.Put(item);
      continue;
    }
    let partial = false;
    if (hintStart <= start) {
      if (hintEnd <= start) continue;
      if (end <= hintEnd) format.Put(item);
      else partial = true;
    } else if (hintStart < end) partial = true;
    if (partial) {
      if (previous === undefined && !invalid) {
        if (!item.equals(format.Get(RES_TXTATR_INETFMT))) {
          if (hintStart > start) {
            state.InvalidateItem(RES_TXTATR_INETFMT);
            invalid = true;
          } else {
            previous = item;
            previousEnd = hintEnd;
          }
        }
      } else if (!invalid) {
        if (previousEnd === hintStart && (previous as SwFormatINetFormat).equals(item)) {
          previous = item;
          previousEnd = hintEnd;
        } else {
          state.InvalidateItem(RES_TXTATR_INETFMT);
          invalid = true;
        }
      }
    }
  }
  if (previous !== undefined && !invalid) {
    if (end <= previousEnd) {
      if (!previous.equals(format.Get(RES_TXTATR_INETFMT))) state.Put(previous);
    } else state.InvalidateItem(RES_TXTATR_INETFMT);
  }
  if (format.Count() > 0 && state.Count() === 0) state.PutSet(format);
  return state;
}

/** Applies the single represented INET MergeValues decision table from native itemset.cxx with defaults participating. @param target - Accumulated native state. @param source - Next original node state. @returns Nothing. */
function mergeINetFormatState(target: SfxItemSet, source: SfxItemSet): void {
  if (target.GetItemState(RES_TXTATR_INETFMT, false) === SfxItemState.INVALID) return;
  if (source.GetItemState(RES_TXTATR_INETFMT, false) === SfxItemState.INVALID) {
    target.InvalidateItem(RES_TXTATR_INETFMT);
    return;
  }
  const first = target.GetItemIfSet(RES_TXTATR_INETFMT, false),
    second = source.GetItemIfSet(RES_TXTATR_INETFMT, false),
    defaults = target.GetPool().GetUserOrPoolDefaultItem(RES_TXTATR_INETFMT);
  if (first === undefined) {
    if (second !== undefined && !defaults.equals(second)) target.InvalidateItem(RES_TXTATR_INETFMT);
  } else if (!first.equals(second ?? defaults)) target.InvalidateItem(RES_TXTATR_INETFMT);
}

/** Consumed character-only GetCurAttr path. Native paragraph/merged/redline queries remain in their existing or unported owners. */
export abstract class SwEditShell extends SwNumberingEditShell {
  /** Returns the first selected text collection in native ring/node order. @returns Borrowed collection or no result at the lookup limit. */
  public GetCurTextFormatColl(): SwTextFormatColl | undefined {
    return this.GetPaMTextFormatColl(this.GetCursor());
  }
  /** Implements original first-text lookup with the pre-inspection ten-thousand limit. @param cursor - Original ring head. @returns Borrowed collection. */
  public GetPaMTextFormatColl(cursor: SwPaM): SwTextFormatColl | undefined {
    let lookedUp = 0;
    for (const range of cursor.GetRingContainer()) {
      for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
        const node = this.GetDoc().GetNodes().at(index);
        if (++lookedUp >= 10000) return undefined;
        if (node instanceof SwTextNode) return node.GetTextFormatColl();
      }
    }
    return undefined;
  }

  /** Original character contribution traversal without changing current cursor ownership. @param which - Character Which. @returns Borrowed source items and independent ranges. */
  public GetItemWithPaM(which: number): SwItemWithPaM[] {
    return getSwItemWithPaM(this.GetDoc(), this.GetCursor(), which);
  }
  /** Original represented layout-absent selection script query. @returns Native script flags. */
  public GetScriptType(): SvtScriptType {
    return getSwSelectionScriptType(this.GetDoc(), this.GetCursor());
  }
  /** Reads original caret typing items. @returns Current native items. */
  public abstract GetPendingCharacterItems(): SfxItemSet;
  /** Assigns native typing items. @param items - Independent set. @returns Nothing. */
  public abstract SetPendingCharacterItems(items: SfxItemSet): void;
  /** Publishes a native selection/typing state change. @returns Nothing. */
  public abstract NotifySelectionChanged(): void;
  /** Collects represented native character state from the current original cursor. @param state - Caller-owned requested set. @returns Whether source lookup limits admit it. */
  public GetCurAttr(state: SfxItemSet): boolean {
    return this.GetPaMAttr(this.GetCursor(), state);
  }
  /** Preserves source ring/node traversal, initial versus merged sets and10000 lookup limits for represented text nodes. Original character-style-at-label and merged/graphic/OLE branches remain unrepresented. @param cursor - Original ring head. @param state - Caller-owned character set. @returns Whether source limits admit lookup. */
  public GetPaMAttr(cursor: SwPaM, state: SfxItemSet): boolean {
    if ([...this.GetCursor().GetRingContainer()].length > 10000) {
      state.ClearItem();
      return false;
    }
    const local = new SfxItemSet(state.GetPool(), state.GetRanges());
    let target = state;
    for (const current of cursor.GetRingContainer()) {
      if (current.IsInFrontOfLabel()) continue;
      const start = current.Start(),
        end = current.End();
      if (end.GetNodeIndex() - start.GetNodeIndex() >= 10000) {
        state.ClearItem();
        return false;
      }
      for (let index = start.GetNodeIndex(); index <= end.GetNodeIndex(); index++) {
        const node = this.GetDoc().GetNodes().at(index);
        if (node instanceof SwTextNode) {
          node.GetParaAttr(
            target,
            index === start.GetNodeIndex() ? start.GetContentIndex() : 0,
            index === end.GetNodeIndex() ? end.GetContentIndex() : node.Len(),
          );
          if (target !== state) state.MergeValues(local);
          if (local.Count()) local.ClearItem();
        }
        target = local;
      }
    }
    // The browser's existing caret typing-owner replaces the native typing-attribute overlay.
    if (
      cursor === this.GetCursor() &&
      !cursor.IsMultiSelection() &&
      (!cursor.HasMark() || cursor.Start().compare(cursor.End()) === 0) &&
      !cursor.IsInFrontOfLabel()
    )
      state.PutSet(this.GetPendingCharacterItems());
    return true;
  }
}
