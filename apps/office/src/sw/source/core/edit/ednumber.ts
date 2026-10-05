/** @fileoverview Owns native Writer numbering state, range traversal and editing commands from ednumber.cxx. */
import { SwModify } from "../../../inc/calbck";
import { SwUndoNumUpDown, SwUndoInsNum, SwUndoDelNum, SwUndoNumRuleStart } from "../undo/unnum";
import { SwUndoOutlineLeftRight } from "../undo/unoutl";
import type { SwUndoCursorState, SwUndoRedoContext } from "../undo/undobj";
import { SetNumRuleMode, type SwDoc } from "../doc/doc";
import { SwNumRule } from "../doc/number";
import { SwPaM } from "../crsr/pam";
import type { SwNode } from "../docnode/node";
import { SwTextNode } from "../txtnode/ndtxt";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  WRITER_TEXT_NODE_WHICH_RANGES,
} from "../../../inc/hintids";
/** Supported direction at the existing browser command boundary. */
export type WriterListLevelCommand = "demote" | "promote";
/** Native ordered paragraph node interval from edimp.hxx. */
interface SwPamRange {
  nStart: number;
  nEnd: number;
}
/** Native numeric ring range normalization; exact same-start and containment policy is preserved. */
export class SwPamRanges {
  private readonly maVector: SwPamRange[] = [];
  /** Captures ring node endpoints without retaining paragraph objects. @param ring - Actual native ring. @returns Nothing. */
  public constructor(ring: SwPaM) {
    for (const range of ring.GetRingContainer())
      this.Insert(range.GetMark().GetNode(), range.GetPoint().GetNode());
  }
  /** Inserts an interval using native sorted-vector adjacency and containment rules. @param first - First endpoint. @param second - Second endpoint. @returns Nothing. */
  public Insert(first: SwNode, second: SwNode): void {
    const interval = { nStart: first.GetIndex(), nEnd: second.GetIndex() };
    if (interval.nEnd < interval.nStart) {
      interval.nStart = interval.nEnd;
      interval.nEnd = first.GetIndex();
    }
    let position = 0;
    while (
      position < this.maVector.length &&
      (this.maVector[position] as SwPamRange).nStart < interval.nStart
    )
      position++;
    if (
      position < this.maVector.length &&
      (this.maVector[position] as SwPamRange).nStart === interval.nStart
    ) {
      const found = this.maVector[position] as SwPamRange;
      if (found.nEnd < interval.nEnd) {
        interval.nEnd = found.nEnd;
        this.maVector.splice(position, 1);
      } else return;
    }
    let end: boolean;
    do {
      end = true;
      if (position > 0) {
        const found = this.maVector[position - 1] as SwPamRange;
        if (found.nEnd === interval.nStart || found.nEnd + 1 === interval.nStart) {
          interval.nStart = found.nStart;
          end = false;
          this.maVector.splice(--position, 1);
        } else if (found.nStart <= interval.nStart && interval.nEnd <= found.nEnd) return;
      }
      if (position < this.maVector.length) {
        const found = this.maVector[position] as SwPamRange;
        if (found.nStart === interval.nEnd || found.nStart === interval.nEnd + 1) {
          interval.nEnd = found.nEnd;
          end = false;
          this.maVector.splice(position, 1);
        }
        // lower_bound and predecessor merging keep this successor's start strictly greater;
        // the native repeated containment check cannot succeed for a sorted native vector.
      }
    } while (!end);
    this.maVector.splice(position, 0, interval);
  }
  /** Returns normalized interval count. @returns Count. */
  public Count(): number {
    return this.maVector.length;
  }
  /** Assigns native zero-content point and mark endpoints. @param index - Sorted interval. @param range - Borrowed destination. @returns Destination. */
  public SetPam(index: number, range: SwPaM): SwPaM {
    const interval = this.maVector[index];
    if (interval === undefined)
      throw new Error("Writer normalized numbering range index is invalid.");
    const nodes = range.GetPoint().GetNode().GetNodes();
    range.GetPoint().Assign(nodes.at(interval.nStart) as SwTextNode, 0);
    range.SetMark();
    range.GetPoint().Assign(nodes.at(interval.nEnd) as SwTextNode, 0);
    return range;
  }
}
/** Core editing shell owns numbering commands; the represented broadcaster base preserves existing subscriptions. */
export abstract class SwEditShell extends SwModify {
  /** Returns the native document owner. @returns Document. */
  public abstract GetDoc(): SwDoc;
  /** Returns the actual editing selection ring. @returns Native cursor. */
  public abstract GetCursor(): SwPaM;
  /** Captures displayed command cursor and pending item ownership. @returns Command boundary. */
  public abstract CaptureCursorState(): SwUndoCursorState;
  /** Executes existing native action orchestration. @param action - History. @param tryMerge - Grouping policy. @param execute - Initial native mutation. @returns Whether changed. */
  public abstract ApplyAction(
    action: SfxUndoAction<SwUndoRedoContext>,
    tryMerge?: boolean,
    execute?: () => void,
  ): boolean;
  /** Queries numbering on the actual point node with native outline counted policy. @returns Numbering presence. */
  public HasNumber(): boolean {
    const node = this.GetCursor().GetPoint().GetNode();
    return (
      node instanceof SwTextNode &&
      node.HasNumber() &&
      !(
        node.GetNumRule() === this.GetDoc().FindNumRulePtr(SwNumRule.GetOutlineRuleName()) &&
        !node.IsCountedInList()
      )
    );
  }
  /** Queries itemization on the actual point node. @returns Bullet presence. */
  public HasBullet(): boolean {
    const node = this.GetCursor().GetPoint().GetNode();
    return node instanceof SwTextNode && node.HasBullet();
  }
  /** Queries every ring range, preserving native empty-paragraph and per-ring break order. @returns Numbering state. */
  public SelectionHasNumber(): boolean {
    let result = false;
    for (const range of this.GetCursor().GetRingContainer()) {
      for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
        const node = this.GetDoc().GetNodes().at(index);
        if (node instanceof SwTextNode && (!result || node.Len() !== 0)) {
          result = node.HasNumber();
          if (
            result &&
            node.GetNumRule() === this.GetDoc().FindNumRulePtr(SwNumRule.GetOutlineRuleName()) &&
            !node.IsCountedInList()
          )
            result = false;
          if (!result && node.Len() !== 0) break;
        }
      }
    }
    return result;
  }
  /** Queries native bullet state over the ring, independently of numbering. @returns Itemization state. */
  public SelectionHasBullet(): boolean {
    let result = false;
    for (const range of this.GetCursor().GetRingContainer()) {
      for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
        const node = this.GetDoc().GetNodes().at(index);
        if (node instanceof SwTextNode && (!result || node.Len() !== 0)) {
          result = node.HasBullet();
          if (!result && node.Len() !== 0) break;
        }
      }
    }
    return result;
  }

  /** Searches before the first actual cursor start using native family and section policy. @param numbered - Enumeration rather than itemization. @param listId - Output list identity. @returns Nearest eligible rule. */
  public SearchNumRule(numbered: boolean, listId: { value: string }): SwNumRule | undefined {
    return this.GetDoc().SearchNumRule(
      this.GetCursor().Start(),
      false,
      numbered,
      false,
      -1,
      listId,
    );
  }
  /** Reads restart on an optional actual native range. @param range - Borrowed selection, otherwise current cursor. @returns Restart flag. */
  public IsNumRuleStart(range = this.GetCursor()): boolean {
    const node = range.GetPoint().GetNode();
    return node instanceof SwTextNode && node.IsListRestart();
  }
  /** Changes only restart flags at native normalized range end points. @param flag - Requested restart flag. @param cursor - Optional borrowed actual range. @returns Whether an eligible flag changed. */
  public SetNumRuleStart(flag: boolean, cursor = this.GetCursor()): boolean {
    const state = this.CaptureCursorState();
    if (!cursor.IsMultiSelection()) {
      const node = cursor.GetPoint().GetNode();
      if (
        !(node instanceof SwTextNode) ||
        node.GetNumRule() === undefined ||
        node.IsListRestart() === flag
      )
        return false;
      return this.ApplyAction(
        new SwUndoNumRuleStart(cursor.GetPoint(), flag, state),
        false,
        /** Applies the initial flag without restoring or destroying the live cursor ring. @returns Nothing. */ () => {
          this.GetDoc().SetNumRuleStart(cursor.GetPoint(), flag);
        },
      );
    }
    const normalized = new SwPamRanges(cursor),
      range = new SwPaM(cursor.GetPoint()),
      action = new SfxListUndoAction<SwUndoRedoContext>("Set numbering start");
    try {
      for (let index = 0; index < normalized.Count(); index++) {
        const node = normalized.SetPam(index, range).GetPoint().GetNode();
        if (
          node instanceof SwTextNode &&
          node.GetNumRule() !== undefined &&
          node.IsListRestart() !== flag
        )
          action.AddAction(new SwUndoNumRuleStart(range.GetPoint(), flag, state));
      }
      return action.GetActionCount() === 0
        ? false
        : this.ApplyAction(
            action,
            false,
            /** Executes the source document primitive at each normalized endpoint while retaining the live cursor. @returns Nothing. */ () => {
              for (let index = 0; index < normalized.Count(); index++)
                this.GetDoc().SetNumRuleStart(normalized.SetPam(index, range).GetPoint(), flag);
            },
          );
    } finally {
      range.Dispose();
    }
  }
  /** Applies one rule to every native ring range, reusing the first newly created list identity. @param rule - Rule value. @param createNewList - Native new-list mode. @param continuedListId - Existing list identity. @param resetIndentAttrs - Native reset-indent flag. @returns Whether text nodes were represented. */
  public SetCurNumRule(
    rule: SwNumRule,
    createNewList = false,
    continuedListId = "",
    resetIndentAttrs = false,
  ): boolean {
    const doc = this.GetDoc(),
      ranges = [...this.GetCursor().GetRingContainer()],
      cursor = this.CaptureCursorState(),
      before: { node: SwTextNode; items: SfxItemSet }[] = [];
    for (const range of ranges)
      for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
        const node = doc.GetNodes().at(index);
        if (node instanceof SwTextNode)
          before.push({ node, items: this.CaptureNumRuleItems(node, resetIndentAttrs) });
      }
    if (before.length === 0) return false;
    const action = new SfxListUndoAction<SwUndoRedoContext>("Numbering");
    return this.ApplyAction(
      action,
      false,
      /** Executes source-owned list/rule/count policy before capturing actual final values. @returns Nothing. */ () => {
        let create = createNewList,
          listId = continuedListId;
        for (const range of ranges) {
          const applied = doc.SetNumRule(
            range,
            rule,
            (create ? SetNumRuleMode.CreateNewList : SetNumRuleMode.Default) |
              (resetIndentAttrs ? SetNumRuleMode.ResetIndentAttrs : SetNumRuleMode.Default),
            listId,
          );
          if (create) {
            listId = applied;
            create = false;
          }
          doc.SetCounted(range, true);
        }
        for (const entry of before)
          action.AddAction(
            new SwUndoInsNum(
              entry.node,
              entry.items,
              this.CaptureNumRuleItems(entry.node, resetIndentAttrs),
              cursor,
              cursor,
            ),
          );
      },
    );
  }
  /** Deletes numbering over all actual editing ranges while retaining the displayed cursor boundary. @returns Whether numbering existed. */
  public DelNumRules(): boolean {
    const doc = this.GetDoc(),
      ranges = [...this.GetCursor().GetRingContainer()],
      cursor = this.CaptureCursorState();
    let changed = false;
    for (const range of ranges)
      for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
        const node = doc.GetNodes().at(index);
        if (node instanceof SwTextNode && node.GetNumRule() !== undefined) changed = true;
      }
    if (!changed) return false;
    if (ranges.length === 1) return this.ApplyAction(new SwUndoDelNum(doc, cursor, ranges[0]));
    const action = new SfxListUndoAction<SwUndoRedoContext>("Delete numbering");
    for (const range of ranges) action.AddAction(new SwUndoDelNum(doc, cursor, range));
    return this.ApplyAction(action);
  }
  /** Reports represented level availability over the same native normalized ranges as execution. @param down - Demote direction. @returns Whether any range can change. */
  public CanNumUpDown(down: boolean): boolean {
    const cursor = this.GetCursor();
    if (!cursor.IsMultiSelection()) return this.GetDoc().CanNumUpDown(cursor, down);
    const normalized = new SwPamRanges(cursor),
      range = new SwPaM(cursor.GetPoint());
    try {
      for (let index = 0; index < normalized.Count(); index++)
        if (this.GetDoc().CanNumUpDown(normalized.SetPam(index, range), down)) return true;
      return false;
    } finally {
      range.Dispose();
    }
  }
  /** Changes numbering levels using native multi-range normalization and range-specific delta history. @param down - Demote direction. @returns Whether a represented range changed. */
  public NumUpDown(down: boolean): boolean {
    if (!this.CanNumUpDown(down)) return false;
    const cursor = this.GetCursor(),
      before = this.CaptureCursorState();
    if (!cursor.IsMultiSelection())
      return this.ApplyAction(new SwUndoNumUpDown(before, down ? 1 : -1, cursor));
    const normalized = new SwPamRanges(cursor),
      range = new SwPaM(cursor.GetPoint()),
      action = new SfxListUndoAction<SwUndoRedoContext>(
        down ? "Demote list level" : "Promote list level",
      );
    try {
      for (let index = 0; index < normalized.Count(); index++) {
        normalized.SetPam(index, range);
        if (this.GetDoc().CanNumUpDown(range, down))
          action.AddAction(new SwUndoNumUpDown(before, down ? 1 : -1, range));
      }
    } finally {
      range.Dispose();
    }
    return this.ApplyAction(action);
  }
  /** Moves outline levels with native normalized range short-circuit and inverse-delta history. @param offset - Signed displacement, default one. @returns Whether every normalized range succeeded, retaining earlier successful ranges on later failure. */
  public OutlineUpDown(offset = 1): boolean {
    const doc = this.GetDoc(),
      cursor = this.GetCursor(),
      before = this.CaptureCursorState(),
      manager = doc.GetUndoManager();
    return this.RunNotificationTransaction(
      /** Batches actual shell and model notifications. @returns Native range result. */ () =>
        doc.RunModelTransaction(
          /** Records successful native range deltas in one command group. @returns Whole command result. */ () => {
            manager.StartUndo("Outline level");
            let result = true;
            const range = new SwPaM(cursor.GetPoint());
            try {
              if (!cursor.IsMultiSelection()) {
                result = doc.OutlineUpDown(cursor, offset);
                if (result)
                  manager.AddUndoAction(new SwUndoOutlineLeftRight(cursor, offset, before));
              } else {
                const normalized = new SwPamRanges(cursor);
                for (let index = 0; index < normalized.Count(); index++) {
                  if (result) {
                    normalized.SetPam(index, range);
                    result = doc.OutlineUpDown(range, offset);
                    if (result)
                      manager.AddUndoAction(new SwUndoOutlineLeftRight(range, offset, before));
                  }
                }
              }
              return result;
            } finally {
              range.Dispose();
              manager.EndUndo();
            }
          },
        ),
    );
  }
  /** Captures represented numbering and optionally reset indentation as independently owned native items. @param node - Actual text node. @param includeIndents - Whether command owns reset-indent payload. @returns Owned items. */
  private CaptureNumRuleItems(node: SwTextNode, includeIndents: boolean): SfxItemSet {
    if (!includeIndents) return node.CaptureListItems();
    const items = new SfxItemSet(this.GetDoc().GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
    items.PutSet(node.CaptureListItems());
    for (const which of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT]) {
      const item = node.GetpSwAttrSet()?.GetItemIfSet(which, false);
      if (item !== undefined) items.Put(item);
    }
    return items;
  }
}
