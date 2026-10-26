/** @fileoverview Implements Writer cell traversal over the actual SwPaM/SwNodes owners from swcrsr.cxx. */
import { SwPaM, SwPosition, GoNextPos, GoPreviousPos } from "./pam";
import { SwNodes } from "../docnode/nodes";
import { FindText } from "./findtxt";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import type { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import {
  SwEndNode,
  SwTableBoxStartNode,
  SwTableNode,
  type SwNode,
  type SwStartNode,
} from "../docnode/node";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFrame } from "../text/txtfrm";
import { SwTable, type SwTableBox } from "../table/swtable";
import type { SwRootFrame } from "../layout/newfrm";

/** Native strategy result flags from swcrsr.hxx. */
export const FIND_NOT_FOUND = 0;
export const FIND_FOUND = 1;
export const FIND_NO_RING = 2;
/** Native search-strategy virtual contract for represented model ranges. Drawing/LOK search-item state remains unported. */
export interface SwFindParas {
  /** Searches one model range. @param cursor - Result cursor. @param backward - Direction. @param region - Registered region. @param readOnly - Read-only permission. @returns Native find flag. */
  DoFind(cursor: SwPaM, backward: boolean, region: SwPaM, readOnly: boolean): number;
  /** Reports whether the strategy mutates document content. @returns Replace mode. */
  IsReplaceMode(): boolean;
}

/** Original selection-loop contract over live cursor and result rings; progress presentation and UNO/layout/readonly services remain unported. @param paras - Native strategy. @param cursor - Actual receiver. @param backward - Direction. @param found - Native result-head reference. @param region - Reused registered region. @param ranges - Search flags. @param cancel - Cancellation output. @returns Match count. */
function lcl_FindSelection(
  paras: SwFindParas,
  cursor: SwCursor,
  backward: boolean,
  found: [SwCursor | undefined],
  region: SwPaM,
  ranges: FindRanges,
  cancel: [boolean],
): number {
  const undo = cursor.GetPoint().GetNode().GetDoc().GetUndoManager(),
    enabled = undo.DoesUndo();
  let count = 0,
    current: SwPaM = cursor,
    saved: SwPaM = cursor,
    end = false;
  if ((ranges & FindRanges.InSel) === 0) saved = saved.GetPrev();
  do {
    region.SetMark();
    const lower = region.GetMark(),
      upper = region.GetPoint();
    lower.Assign(current.Start().GetNode(), current.Start().GetContentIndex());
    upper.Assign(current.End().GetNode(), current.End().GetContentIndex());
    if (backward) region.Exchange();
    while (lower.compare(upper) <= 0) {
      const result = paras.DoFind(cursor, backward, region, false),
        head = found[0];
      if (
        result === 0 ||
        (head !== undefined &&
          head.GetPoint().compare(cursor.GetPoint()) === 0 &&
          head.GetMark().compare(cursor.GetMark()) === 0)
      )
        break;
      if ((result & FIND_NO_RING) === 0) {
        const next = cursor.Create(head);
        if (head === undefined) found[0] = next;
        next.SetMark();
        next.GetMark().Assign(cursor.GetMark().GetNode(), cursor.GetMark().GetContentIndex());
      }
      count++;
      if ((ranges & FindRanges.InSelAll) === 0) {
        end = true;
        break;
      }
      if (count === 60000 && undo.DoesUndo() && paras.IsReplaceMode()) {
        const reply = cursor.MaxReplaceArived();
        if (reply === 2) {
          undo.DelAllUndoObj();
          undo.DoUndo(false);
        } else {
          end = true;
          if (reply === 0) cancel[0] = true;
          break;
        }
      }
      if (backward && upper.compare(cursor.Start()) === 0) GoPreviousPos(cursor.GetMark());
      else if (!backward && lower.compare(cursor.End()) === 0) GoNextPos(cursor.GetPoint());
      if (lower.compare(upper) === 0) break;
      if (backward) upper.Assign(cursor.Start().GetNode(), cursor.Start().GetContentIndex());
      else lower.Assign(cursor.End().GetNode(), cursor.End().GetContentIndex());
    }
    if (end || (ranges & (FindRanges.InSelAll | FindRanges.InSel)) === 0) break;
    current = current.GetNext();
  } while (current !== saved && current.GetNext() !== current);
  if (count !== 0 && found[0] === undefined) found[0] = cursor.Create();
  undo.DoUndo(enabled);
  return count;
}
/** Original forward section admission; preserves strict endpoints and first-entry mutation ordering. @param start - Lower sentinel. @param end - Upper sentinel. @param pam - Actual cursor. @param first - Continue from current point. @returns Valid nonempty region. */
function lcl_MakeSelFwrd(start: SwNode, end: SwNode, pam: SwPaM, first: boolean): boolean {
  if (start.GetIndex() + 1 === end.GetIndex()) return false;
  pam.DeleteMark();
  if (!first) {
    pam.GetPoint().Assign(start);
    const node = SwNodes.GoNext(pam.GetPoint());
    if (node === undefined) return false;
    pam.GetPoint().Assign(node, 0);
  } else if (
    start.GetIndex() > pam.GetPoint().GetNodeIndex() ||
    pam.GetPoint().GetNodeIndex() >= end.GetIndex()
  )
    return false;
  pam.SetMark();
  pam.GetPoint().Assign(end);
  const node = SwNodes.GoPrevious(pam.GetPoint(), true);
  if (node === undefined) return false;
  pam.GetPoint().Assign(node, node.Len());
  return pam.GetMark().compare(pam.GetPoint()) < 0;
}
/** Original backward section admission, using cross-boundary content movement. @param start - Upper sentinel. @param end - Lower sentinel. @param pam - Actual cursor. @param first - Continue from current point. @returns Valid nonempty region. */
function lcl_MakeSelBkwrd(start: SwNode, end: SwNode, pam: SwPaM, first: boolean): boolean {
  if (end.GetIndex() + 1 === start.GetIndex()) return false;
  pam.DeleteMark();
  if (!first) {
    pam.GetPoint().Assign(start);
    const node = SwNodes.GoPrevious(pam.GetPoint(), true);
    if (node === undefined) return false;
    pam.GetPoint().Assign(node, node.Len());
  } else if (
    end.GetIndex() > pam.GetPoint().GetNodeIndex() ||
    pam.GetPoint().GetNodeIndex() >= start.GetIndex()
  )
    return false;
  pam.SetMark();
  pam.GetPoint().Assign(end);
  const node = SwNodes.GoNext(pam.GetPoint());
  if (node === undefined) return false;
  pam.GetPoint().SetContent(0);
  return pam.GetPoint().compare(pam.GetMark()) < 0;
}

/** Persistent Writer cursor; cell navigation never uses body ordinals or display paragraphs. */
export class SwCursor extends SwPaM {
  /** Native boundary resolution uses actual content nodes, including table text. @param position - Native boundary selector. @param target - Registered result position. @returns Nothing. */
  public FillFindPos(position: SwDocPositions, target: SwPosition): void {
    if (
      ![
        SwDocPositions.Start,
        SwDocPositions.End,
        SwDocPositions.OtherStart,
        SwDocPositions.OtherEnd,
      ].includes(position)
    ) {
      target.Assign(this.GetPoint().GetNode(), this.GetPoint().GetContentIndex());
      return;
    }
    const nodes = this.GetPoint().GetNode().GetNodes();
    const start = position === SwDocPositions.Start || position === SwDocPositions.OtherStart;
    const boundary =
      position === SwDocPositions.Start
        ? nodes.GetEndOfContent().StartOfSectionNode()
        : position === SwDocPositions.End
          ? nodes.GetEndOfContent()
          : position === SwDocPositions.OtherStart
            ? nodes.at(0)
            : nodes.GetEndOfContent().StartOfSectionNode();
    for (
      let i = boundary.GetIndex() + (start ? 1 : -1);
      i >= 0 && i < nodes.Count();
      i += start ? 1 : -1
    ) {
      const node = nodes.at(i);
      if (node.IsTextNode()) {
        target.Assign(node, start ? 0 : (node as SwTextNode).Len());
        return;
      }
      if (!start && i === 0) break;
    }
    target.Assign(boundary, 0);
  }
  /** Native Find_Text entry point for represented absolute model-text search. Notes and merged layout remain unported and reject explicitly. @param options - Native option value. @param searchInNotes - Search annotations. @param start - Start selector. @param end - End selector. @param cancel - Native cancellation output. @param ranges - Scope/all flags. @param replace - Native replace mode. @param layout - Optional layout owner for merged-text searching. @returns Number of matches. */
  public Find_Text(
    options: SearchOptions2,
    searchInNotes: boolean,
    start: SwDocPositions,
    end: SwDocPositions,
    cancel: [boolean],
    ranges: FindRanges,
    replace = false,
    layout?: SwRootFrame,
  ): number {
    if (searchInNotes || layout !== undefined)
      throw new Error("Writer notes and layout-text search are not implemented.");
    return FindText(this, options, start, end, cancel, ranges, replace);
  }
  /** Native default threshold response, RET_YES=2: continue after discarding undo. Shell/UNO overrides may return RET_CANCEL=0 or RET_NO=3. @returns Native VCL response identity. */
  public MaxReplaceArived(): number {
    return 2;
  }
  /** Native FindAll/lcl_FindSelection traversal, no-ring replacement, threshold and ring ownership. Readonly/layout services remain incomplete. @param paras - Native search strategy. @param start - Start selector. @param end - End selector. @param ranges - Scope/all flags. @param cancel - Cancellation output. @returns Match count. */
  public FindAll(
    paras: SwFindParas,
    start: SwDocPositions,
    end: SwDocPositions,
    ranges: FindRanges,
    cancel: [boolean],
  ): number {
    cancel[0] = false;
    const backward = !(
      start === SwDocPositions.Start ||
      start === SwDocPositions.OtherStart ||
      (start === SwDocPositions.Curr &&
        (end === SwDocPositions.End || end === SwDocPositions.OtherEnd))
    );
    const all = (ranges & FindRanges.InSelAll) !== 0;
    const inSelection = (ranges & FindRanges.InSel) !== 0;
    if (!all && !inSelection && (ranges & FindRanges.InOther) === 0) {
      const region = new SwPaM(this.GetPoint()),
        savedMark = this.GetMark().clone(),
        keepMark = this.HasMark() && ranges === FindRanges.InBody;
      try {
        region.SetMark();
        this.FillFindPos(start, region.GetMark());
        this.FillFindPos(end, region.GetPoint());
        const count = paras.DoFind(this, backward, region, false) !== 0 ? 1 : 0;
        // GetMark may alias GetPoint after the strategy removes the initial mark.
        if (count !== 0 && keepMark)
          this.GetMark().Assign(savedMark.GetNode(), savedMark.GetContentIndex());
        return count;
      } finally {
        savedMark.Dispose();
        region.Dispose();
      }
    }
    const region = new SwPaM(this.GetPoint()),
      found: [SwCursor | undefined] = [undefined];
    try {
      let count = 0;
      if (inSelection) {
        count = lcl_FindSelection(paras, this, backward, found, region, ranges, cancel);
        if (count === 0) return 0;
      } else {
        const saved = this.Create(this),
          nodes = this.GetPoint().GetNode().GetNodes(),
          other = (ranges & FindRanges.InOther) !== 0,
          first = other
            ? nodes.GetEndOfExtras().GetIndex() >= this.GetPoint().GetNodeIndex()
            : false,
          lower =
            other || (ranges & FindRanges.InBodyOnly) === 0
              ? nodes.GetEndOfPostIts().StartOfSectionNode()
              : nodes.GetEndOfContent().StartOfSectionNode(),
          upper = other ? nodes.GetEndOfExtras() : nodes.GetEndOfContent();
        if (
          backward
            ? lcl_MakeSelBkwrd(upper, lower, this, first)
            : lcl_MakeSelFwrd(lower, upper, this, first)
        )
          count = lcl_FindSelection(paras, this, backward, found, region, ranges, cancel);
        if (count === 0) {
          this.GetPoint().Assign(saved.GetPoint().GetNode(), saved.GetPoint().GetContentIndex());
          if (saved.HasMark()) {
            this.SetMark();
            this.GetMark().Assign(saved.GetMark().GetNode(), saved.GetMark().GetContentIndex());
          } else this.DeleteMark();
          // Source early return keeps the saved point-only cursor linked (WRITER-024).
          return 0;
        }
        if (other && !all) {
          const head = found[0] as SwCursor;
          this.GetPoint().Assign(head.GetPoint().GetNode(), head.GetPoint().GetContentIndex());
          this.SetMark();
          this.GetMark().Assign(head.GetMark().GetNode(), head.GetMark().GetContentIndex());
          head.Dispose();
          found[0] = undefined;
          return count;
        }
      }
      while (this.GetNext() !== this) this.GetNext().Dispose();
      const head = found[0] as SwCursor;
      this.GetPoint().Assign(head.GetPoint().GetNode(), head.GetPoint().GetContentIndex());
      this.SetMark();
      this.GetMark().Assign(head.GetMark().GetNode(), head.GetMark().GetContentIndex());
      head.GetRingContainer().merge(this.GetRingContainer());
      head.Dispose();
      found[0] = undefined;
      return count;
    } finally {
      region.Dispose();
    }
  }
  /** Queries the original node and native position for its registered frame; native geometric Calc/bidi/selection-overlap remain unported. @param layout - Owning layout. @param left - Beginning direction. @param api - API movement. @returns Native frame admission. */
  public LeftRightMargin(layout: SwRootFrame, left: boolean, api = false): boolean {
    const point = this.GetPoint(),
      node = point.GetNode() as SwTextNode;
    if (!layout.IsCursorTextGeometryCurrent(node)) return false;
    const frame = node.getLayoutFrame(layout, point) as SwTextFrame | undefined;
    return frame !== undefined && (left ? frame.LeftMargin(this) : frame.RightMargin(this, api));
  }
  /** Queries the original positioned frame and compares native mapped positions using a temporary PaM as upstream does. @param layout - Owning layout. @param left - Beginning direction. @param api - API movement. @returns Whether the point is at its margin. */
  public IsAtLeftRightMargin(layout: SwRootFrame, left: boolean, api = false): boolean {
    const point = this.GetPoint(),
      node = point.GetNode() as SwTextNode;
    if (!layout.IsCursorTextGeometryCurrent(node)) return false;
    const frame = node.getLayoutFrame(layout, point) as SwTextFrame | undefined;
    if (frame === undefined) return false;
    const pam = new SwPaM(this.GetPoint());
    try {
      if (!left && pam.GetPoint().GetContentIndex() > 0)
        pam.GetPoint().Assign(pam.GetPoint().GetNode(), pam.GetPoint().GetContentIndex() - 1);
      return (
        (left ? frame.LeftMargin(pam) : frame.RightMargin(pam, api)) &&
        frame.MapModelToViewPos(pam.GetPoint()) === frame.MapModelToViewPos(this.GetPoint())
      );
    } finally {
      pam.Dispose();
    }
  }
  /** Creates a native editing cursor attached to an existing selection ring. @param ring - Native ring owner. @returns New registered cursor. */
  public Create(ring?: SwPaM): SwCursor {
    return new SwCursor(this.GetPoint(), undefined, ring);
  }
  /** Moves to a current section endpoint, reporting false if already there. @param start - Beginning direction. @returns Whether the point changed. */
  public MoveSection(start: boolean): boolean {
    return this.MoveToBoundary(this.GetPoint().GetNode().StartOfSectionNode(), start);
  }
  /** Moves to a current flat table endpoint; ordinary marked cursors cannot move tables. @param start - Beginning direction. @returns Whether a table endpoint was accepted, even when unchanged. */
  public MoveTable(start: boolean): boolean {
    const section = this.GetPoint().GetNode().StartOfSectionNode();
    if (
      !(section instanceof SwTableBoxStartNode) ||
      (this.HasMark() && !(this instanceof SwTableCursor))
    )
      return false;
    this.MoveToBoundary(section.StartOfSectionNode(), start);
    return true;
  }
  /** Moves within the actual content section, including table text at document edges. @param start - Beginning direction. @returns Native accepted movement result. */
  public SttEndDoc(start: boolean): boolean {
    this.MoveToBoundary(
      this.GetPoint().GetNode().GetNodes().GetEndOfContent().StartOfSectionNode(),
      start,
    );
    return true;
  }
  /** Resolves a guaranteed content-bearing section through its sentinels. @param section - Containing native section. @param start - Beginning direction. @returns Whether point changed. */
  private MoveToBoundary(section: SwStartNode, start: boolean): boolean {
    const nodes = section.GetNodes();
    let index = start ? section.GetIndex() + 1 : section.EndOfSectionNode().GetIndex() - 1;
    while (!nodes.at(index).IsTextNode()) index += start ? 1 : -1;
    const node = nodes.at(index) as SwTextNode,
      offset = start ? 0 : node.Len(),
      point = this.GetPoint();
    if (point.GetNode() === node && point.GetContentIndex() === offset) return false;
    point.Assign(node, offset);
    return true;
  }
  /** Moves to the next cell's first content position. @param count - Native cell count. @returns Whether traversal succeeded. */
  public GoNextCell(count = 1): boolean {
    return this.GoPrevNextCell(true, count);
  }
  /** Moves to the previous cell's first content position. @param count - Native cell count. @returns Whether traversal succeeded. */
  public GoPrevCell(count = 1): boolean {
    return this.GoPrevNextCell(false, count);
  }
  /** Traverses flat cell sections while retaining the fixed mark. @param next - Forward direction. @param count - Unsigned native cell count. @returns Whether a destination exists in the same table. */
  public GoPrevNextCell(next: boolean, count: number): boolean {
    let section = this.GetPoint().GetNode().StartOfSectionNode();
    if (!(section instanceof SwTableBoxStartNode)) return false;
    // Implemented table cells have a flat SwTableNode parent and a first text node.
    const nodes = section.GetNodes();
    for (let remaining = count & 0xffff; remaining > 0; remaining--) {
      const adjacent = nodes.at(
        next ? section.EndOfSectionNode().GetIndex() + 1 : section.GetIndex() - 1,
      );
      const candidate = next
        ? adjacent
        : adjacent instanceof SwEndNode
          ? adjacent.StartOfSectionNode()
          : undefined;
      if (!(candidate instanceof SwTableBoxStartNode)) return false;
      section = candidate;
    }
    const node = nodes.at(section.GetIndex() + 1) as SwTextNode;
    this.GetPoint().Assign(node, 0);
    return true;
  }
}

/** Owns native table endpoints, sorted selected boxes and editing-ring synchronization. */
export class SwTableCursor extends SwCursor {
  private readonly selectedBoxes: SwTableBox[] = [];
  private changed = false;
  private tablePointNode = 0;
  private tableMarkNode = 0;
  private tablePointContent = 0;
  private tableMarkContent = 0;
  /** Reports selected-box differences pending editing-ring synchronization. @returns Change flag. */
  public IsChgd(): boolean {
    return this.changed;
  }
  /** Records endpoint movement independently of selected-box differences. @returns Whether moved. */
  public IsCursorMovedUpdate(): boolean {
    const point = this.GetPoint(),
      mark = this.GetMark();
    if (
      point.GetNodeIndex() === this.tablePointNode &&
      mark.GetNodeIndex() === this.tableMarkNode &&
      point.GetContentIndex() === this.tablePointContent &&
      mark.GetContentIndex() === this.tableMarkContent
    )
      return false;
    this.tablePointNode = point.GetNodeIndex();
    this.tableMarkNode = mark.GetNodeIndex();
    this.tablePointContent = point.GetContentIndex();
    this.tableMarkContent = mark.GetContentIndex();
    return true;
  }
  /** Reconciles persistent editing cursors with complete selected cell sections. @param current - Ordinary shell cursor ring. @returns Current retained editing cursor. */
  public MakeBoxSels(current: SwCursor): SwCursor {
    if (!this.changed) return current;
    this.changed = false;
    const remaining = [...this.selectedBoxes];
    for (const range of [...current.GetRingContainer()]) {
      const start = range.GetPoint().GetNode().StartOfSectionNode();
      const index =
        range.HasMark() && start === range.GetMark().GetNode().StartOfSectionNode()
          ? remaining.findIndex(
              /** Projects actual native table ownership. @param box - Current owner. @returns Operation result. */ (
                box,
              ) => box.GetStartNode() === start,
            )
          : -1;
      if (index >= 0) {
        const box = remaining[index] as SwTableBox,
          paragraphs = box.GetParagraphs(),
          first = paragraphs[0] as SwTextNode,
          last = paragraphs.at(-1) as SwTextNode;
        range.GetMark().Assign(first, 0);
        range.GetPoint().Assign(last, last.Len());
        remaining.splice(index, 1);
      } else if (!range.IsMultiSelection()) range.DeleteMark();
      else {
        if (range === current) current = range.GetPrev() as SwCursor;
        range.Dispose();
      }
    }
    for (const box of remaining) {
      const first = box.GetParagraphs()[0] as SwTextNode,
        last = box.GetParagraphs().at(-1) as SwTextNode;
      const range =
        !current.IsMultiSelection() && !current.HasMark() ? current : current.Create(current);
      range.GetPoint().Assign(first, 0);
      range.SetMark();
      range.GetPoint().Assign(last, last.Len());
    }
    return current;
  }
  /** Returns the native selected-box count. @returns Count. */
  public GetSelectedBoxesCount(): number {
    return this.selectedBoxes.length;
  }
  /** Returns selected native identities in node order. @returns Selected boxes. */
  public GetSelectedBoxes(): readonly SwTableBox[] {
    return this.selectedBoxes;
  }
  /** Inserts one identity into the native sorted set. @param box - Box owner. @returns Nothing. */
  public InsertBox(box: SwTableBox): void {
    this.changed = true;
    if (this.selectedBoxes.includes(box)) return;
    const index = this.selectedBoxes.findIndex(
      /** Projects actual native table ownership. @param existing - Current owner. @returns Operation result. */ (
        existing,
      ) => existing.GetStartNode().GetIndex() > box.GetStartNode().GetIndex(),
    );
    this.selectedBoxes.splice(index < 0 ? this.selectedBoxes.length : index, 0, box);
  }
  /** Removes one native selection entry. @param index - Sorted position. @returns Nothing. */
  public DeleteBox(index: number): void {
    this.selectedBoxes.splice(index, 1);
    this.changed = true;
  }
  /** Reconciles old and new sorted native identities using upstream's difference order. @param boxes - New sorted set. @returns Nothing. */
  public ActualizeSelection(boxes: readonly SwTableBox[]): void {
    let old = 0,
      next = 0;
    while (old < this.selectedBoxes.length && next < boxes.length) {
      const previous = this.selectedBoxes[old] as SwTableBox,
        candidate = boxes[next] as SwTableBox;
      if (previous === candidate) {
        old++;
        next++;
      } else if (previous.GetStartNode().GetIndex() < candidate.GetStartNode().GetIndex())
        this.DeleteBox(old);
      else {
        this.InsertBox(candidate);
        old++;
        next++;
      }
    }
    while (old < this.selectedBoxes.length) this.DeleteBox(old);
    for (; next < boxes.length; next++) this.InsertBox(boxes[next] as SwTableBox);
  }
  /** Rebuilds flat table selection from actual point and mark sections. @returns Whether both endpoints belong to one table. */
  public NewTableSelection(): boolean {
    const start = this.GetPoint().GetNode().StartOfSectionNode(),
      end = this.GetMark().GetNode().StartOfSectionNode();
    if (!(start instanceof SwTableBoxStartNode) || !(end instanceof SwTableBoxStartNode))
      return false;
    const table = start.StartOfSectionNode() as SwTableNode;
    if (table !== end.StartOfSectionNode()) return false;
    const boxes: SwTableBox[] = [];
    table.GetTable().CreateSelection(start, end, boxes, SwTable.SEARCH_NONE);
    this.ActualizeSelection(boxes);
    return true;
  }
}
