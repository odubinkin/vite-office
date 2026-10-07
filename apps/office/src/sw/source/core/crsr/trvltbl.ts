/** @fileoverview Owns native table-cell shell traversal from LibreOffice trvltbl.cxx. */
import { SwModify } from "../../../inc/calbck";
import { SwTableBoxStartNode, SwTableNode, type SwNode, type SwStartNode } from "../docnode/node";
import { SwCursor, SwTableCursor } from "./swcrsr";
import { SwTable, type SwTableBox } from "../table/swtable";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
import type { SwUndoCursorState } from "../undo/undobj";
import type { SwTableLine } from "../table/swtable";
import { SwRootFrame } from "../layout/newfrm";
import { SwViewOption } from "../../../inc/viewopt";

/** Native extended range retains the first structural node and trailing table owners. */
export type ExtendedSelection = readonly [SwNode, readonly SwTableNode[]];

/** Native cursor stack deletion modes from crsrsh.hxx. */
export enum PopMode {
  DeleteCurrent,
  DeleteStack,
}

/** Core cursor shell precedes editing/frame shells and owns actual table movement. */
export abstract class SwCursorShell extends SwModify {
  /** Creates a cursor shell using actual view options or standalone defaults. @param viewOptions - Existing view-option identity. @param cursorLayout - Shared native view layout, absent for standalone shells. @returns Nothing. */
  public constructor(
    private readonly viewOptions = new SwViewOption(
      /** Retains standalone options without a frame invalidation owner. @returns Nothing. */ () => {},
    ),
    private cursorLayout?: SwRootFrame,
  ) {
    super();
  }
  private m_sMarkedListId = "";
  private m_nMarkedListLevel = 0;
  /** Returns the native cursor's persistent layout owner. @returns Current document layout. */
  public GetLayout(): SwRootFrame {
    return (this.cursorLayout ??= new SwRootFrame(
      /** Resolves the actual cursor-shell document. @returns Native document. */ () =>
        this.GetDoc(),
    ));
  }
  /** Reads the ordinary native cursor's label affinity. @returns Label position state. */
  public IsInFrontOfLabel(): boolean {
    return this.cursor.IsInFrontOfLabel();
  }
  /** Updates label affinity only when changed. @param value - New label state. @returns Whether changed. */
  public SetInFrontOfLabel(value: boolean): boolean {
    if (value === this.IsInFrontOfLabel()) return false;
    this.cursor.SetInFrontOfLabel_(value);
    this.UpdateMarkedListLevel();
    return true;
  }
  /** Returns the existing native view-option owner. @returns Shared view options. */
  public GetViewOptions(): SwViewOption {
    return this.viewOptions;
  }
  /** Reconciles marked-list ownership only when the native identity/depth pair changes. @param listId - Existing list identity or empty. @param level - Native depth. @returns Nothing. */
  public MarkListLevel(listId: string, level: number): void {
    if (listId === this.m_sMarkedListId && level === this.m_nMarkedListLevel) return;
    if (this.GetViewOptions().IsFieldShadings()) {
      if (this.m_sMarkedListId.length !== 0)
        this.GetDoc().MarkListLevel(this.m_sMarkedListId, this.m_nMarkedListLevel, false);
      if (listId.length !== 0) this.GetDoc().MarkListLevel(listId, level, true);
    }
    this.m_sMarkedListId = listId;
    this.m_nMarkedListLevel = level;
  }
  /** Reads actual paragraph numbering and label affinity to update native marked depth. @returns Nothing. */
  public UpdateMarkedListLevel(): void {
    const node = this.cursor.GetPoint().GetNode();
    if (!(node instanceof SwTextNode)) return;
    if (!node.IsNumbered()) {
      this.cursor.SetInFrontOfLabel_(false);
      this.MarkListLevel("", 0);
    } else if (this.cursor.IsInFrontOfLabel()) {
      if (node.IsInList()) this.MarkListLevel(node.GetListId(), node.GetActualListLevel());
    } else this.MarkListLevel("", 0);
  }
  /** Executes native LRMargin including repeated Home label entry. @param left - Beginning direction. @param api - API end includes spaces. @returns Frame or label admission. */
  public LRMargin(left: boolean, api = false): boolean {
    const cursor = this.getShellCursor(),
      layout = this.GetLayout(),
      atLeft = this.cursor.IsAtLeftRightMargin(layout, true, api);
    let moved = cursor.LeftRightMargin(layout, left, api);
    if (left && !this.IsTableMode() && moved && atLeft && !this.cursor.HasMark()) {
      const node = this.cursor.GetPoint().GetNode() as SwTextNode;
      if (node.HasVisibleNumberingOrBullet()) this.SetInFrontOfLabel(true);
    } else if (!left) moved = this.SetInFrontOfLabel(false) || moved;
    if (moved) this.UpdateTableCursor();
    return moved;
  }
  protected cursor!: SwCursor;
  protected tableCursor: SwTableCursor | undefined;
  private stackCursor: SwCursor | undefined;
  /** Clears all native saved cursor positions before a user movement. @returns Nothing. */
  public ResetCursorStack(): void {
    while (this.stackCursor !== undefined) this.Pop(PopMode.DeleteStack);
  }
  /** Returns the actual saved native cursor head. @returns Registered stack cursor or no saved cursor. */
  protected GetStackCursor(): SwCursor | undefined {
    return this.stackCursor;
  }
  /** Saves actual displayed endpoints on a registered native cursor ring. @returns Nothing. */
  public Push(): void {
    const current = this.getShellCursor();
    this.stackCursor = new SwCursor(
      current.GetPoint(),
      current.HasMark() ? current.GetMark() : undefined,
      this.stackCursor,
    );
  }
  /** Deletes the top saved cursor or restores its endpoints into the persistent current owner. @param mode - Native deletion mode. @returns Whether a saved cursor existed. */
  public Pop(mode: PopMode): boolean {
    const saved = this.stackCursor;
    if (saved === undefined) return false;
    this.stackCursor = saved.IsMultiSelection() ? (saved.GetNext() as SwCursor) : undefined;
    if (mode === PopMode.DeleteCurrent) {
      this.cursor.Assign(saved.GetPoint(), saved.HasMark() ? saved.GetMark() : undefined);
      if (this.tableCursor !== undefined) {
        if (saved.HasMark()) {
          this.tableCursor.Assign(saved.GetPoint(), saved.GetMark());
          this.tableCursor.NewTableSelection();
        } else this.ClearTableCursor();
      }
    }
    saved.Dispose();
    if (mode === PopMode.DeleteCurrent) this.UpdateTableCursor(true);
    return true;
  }
  /** Clears native table-cell rings and marks while retaining the displayed point. @returns Nothing. */
  public ClearMark(): void {
    if (this.tableCursor !== undefined)
      this.cursor
        .GetPoint()
        .Assign(
          this.tableCursor.GetPoint().GetNode(),
          this.tableCursor.GetPoint().GetContentIndex(),
        );
    this.ClearTableCursor();
    this.cursor.DeleteMark();
    this.UpdateTableCursor();
  }
  /** Resolves the current table context from actual cursor owners. @returns Native table node. */
  public abstract IsCursorInTable(): SwTableNode | undefined;
  /** Expands actual selected boxes by native row or column search. @param search - Native selection search. @returns Original boxes. */
  public abstract GetTableSel(search?: 0 | 1 | 2): readonly SwTableBox[];
  /** Returns the owning document. @returns Native document. */
  public abstract GetDoc(): SwDoc;
  /** Captures pending attributes with the actual current cursor. @returns Command boundary. */
  public abstract CaptureCursorState(): SwUndoCursorState;
  /** Reconciles shell input and bindings after native movement or saved-position restoration. @param restored - Preserve caret input after a temporary selection. @returns Nothing. */
  protected abstract UpdateTableCursor(restored?: boolean): void;

  /** Finds the common represented XText owner, retaining cells and skipping table sections. @returns Containing text section. */
  private FindParentText(): SwStartNode {
    const cursor = this.getShellCursor();
    let parent = cursor.Start().GetNode().StartOfSectionNode();
    while (parent.EndOfSectionNode().GetIndex() < cursor.End().GetNodeIndex())
      parent = parent.StartOfSectionNode();
    while (parent instanceof SwTableNode) parent = parent.StartOfSectionNode();
    return parent;
  }
  /** Moves to current text start, leaving leading tables for the first outer paragraph. @returns Whether the actual point changed. */
  protected MoveStartText(): boolean {
    const cursor = this.getShellCursor(),
      point = cursor.GetPoint(),
      oldNode = point.GetNode(),
      oldOffset = point.GetContentIndex(),
      parent = this.FindParentText(),
      nodes = parent.GetNodes(),
      ownTable = parent instanceof SwTableBoxStartNode ? parent.StartOfSectionNode() : undefined;
    let index = parent.GetIndex() + 1;
    while (!nodes.at(index).IsTextNode()) index++;
    point.Assign(nodes.at(index), 0);
    while (point.GetNode().StartOfSectionNode() instanceof SwTableBoxStartNode) {
      if (
        point.GetNode().StartOfSectionNode().StartOfSectionNode() === ownTable ||
        !this.MoveOutOfTable()
      )
        break;
    }
    this.UpdateTableCursor();
    return oldNode !== point.GetNode() || oldOffset !== point.GetContentIndex();
  }
  /** Reports a table at either edge of the current text, excluding ranges spanning extras. @returns Represented native boundary kind. */
  public StartsWith_(): "none" | "table" {
    const cursor = this.getShellCursor(),
      extras = this.GetDoc().nodes.GetEndOfExtras().GetIndex();
    if (cursor.Start().GetNodeIndex() <= extras && extras < cursor.End().GetNodeIndex())
      return "none";
    const parent = this.FindParentText(),
      nodes = parent.GetNodes(),
      first = nodes.at(parent.GetIndex() + 1),
      last = nodes.at(parent.EndOfSectionNode().GetIndex() - 1);
    return first instanceof SwTableNode ||
      (last.IsEndNode() && last.StartOfSectionNode() instanceof SwTableNode)
      ? "table"
      : "none";
  }
  /** Selects real content boundaries of the current text, optionally including native extra sections. @param footnotes - Include extras by native default. @returns Nothing. */
  public ExtendedSelectAll(footnotes = true): void {
    const parent = this.FindParentText(),
      nodes = this.GetDoc().nodes,
      start = footnotes ? nodes.GetEndOfPostIts().GetIndex() : parent.GetIndex(),
      end = footnotes ? nodes.GetEndOfContent().GetIndex() : parent.EndOfSectionNode().GetIndex(),
      contents = nodes
        .entries()
        .slice(start + 1, end)
        .filter(
          /** Keeps native content owners. @param node - Native node. @returns Whether text. */
          (node): node is SwTextNode => node instanceof SwTextNode,
        ),
      first = contents[0] as SwTextNode,
      last = contents.at(-1) as SwTextNode;
    this.ClearTableCursor();
    this.cursor.GetPoint().Assign(first, 0);
    this.cursor.SetMark();
    this.cursor.GetMark().Assign(last, last.Len());
    this.UpdateTableCursor();
  }
  /** Recognizes a full extended ordinary range and retains structural boundary owners. @returns Native extended selection or undefined. */
  public ExtendedSelectedAll(): ExtendedSelection | undefined {
    if (this.HasBoxSelection()) return undefined;
    const parent = this.FindParentText(),
      nodes = parent.GetNodes(),
      contents = nodes
        .entries()
        .slice(parent.GetIndex() + 1, parent.EndOfSectionNode().GetIndex())
        .filter(
          /** Keeps actual content endpoints. @param node - Native node. @returns Whether text. */
          (node): node is SwTextNode => node instanceof SwTextNode,
        ),
      first = contents[0] as SwTextNode,
      last = contents.at(-1) as SwTextNode,
      cursor = this.getShellCursor();
    if (
      cursor.Start().GetNode() !== first ||
      cursor.Start().GetContentIndex() !== 0 ||
      cursor.End().GetNode() !== last ||
      cursor.End().GetContentIndex() !== last.Len() ||
      this.StartsWith_() === "none"
    )
      return undefined;
    const tables: SwTableNode[] = [];
    let node = nodes.at(parent.EndOfSectionNode().GetIndex() - 1);
    while (node.IsEndNode() && node.StartOfSectionNode() instanceof SwTableNode) {
      const table = node.StartOfSectionNode() as SwTableNode;
      tables.push(table);
      node = nodes.at(table.GetIndex() - 1);
    }
    return [nodes.at(parent.GetIndex() + 1), tables];
  }
  /** Leaves a flat table toward previous outer text, then tries following text, preserving failed selection. @returns Whether outer text exists. */
  public MoveOutOfTable(): boolean {
    const table = this.IsCursorInTable();
    if (table === undefined) return false;
    const parent = table.StartOfSectionNode(),
      nodes = parent.GetNodes();
    for (const direction of [-1, 1]) {
      let index = direction < 0 ? table.GetIndex() - 1 : table.EndOfSectionNode().GetIndex() + 1;
      while (parent.GetIndex() < index && index < parent.EndOfSectionNode().GetIndex()) {
        const node = nodes.at(index);
        if (node instanceof SwTextNode && node.StartOfSectionNode() === parent) {
          const cursor = this.getShellCursor();
          cursor.DeleteMark();
          cursor.GetPoint().Assign(node, direction < 0 ? node.Len() : 0);
          return true;
        }
        index += direction;
      }
    }
    return false;
  }

  /** Returns native editing cursors, materializing selected full-cell rings by default. @param makeTableCursor - Refresh boxes after displayed endpoint movement. @returns Current ordinary editing cursor. */
  public GetCursor(makeTableCursor = true): SwCursor {
    if (this.tableCursor !== undefined) {
      if (makeTableCursor && this.tableCursor.IsCursorMovedUpdate())
        this.tableCursor.NewTableSelection();
      if (this.tableCursor.IsChgd()) this.cursor = this.tableCursor.MakeBoxSels(this.cursor);
    }
    return this.cursor;
  }
  /** Returns the native cursor used to display point and mark. @returns Table or ordinary display owner. */
  public getShellCursor(): SwCursor {
    return this.tableCursor ?? this.cursor;
  }

  /** Reports the bounded shell table-selection mode. @returns Whether a native table cursor is active. */
  public HasBoxSelection(): boolean {
    return this.tableCursor !== undefined;
  }
  /** Reports native table mode from the actual table cursor. @returns Whether a table cursor exists. */
  public IsTableMode(): boolean {
    return this.tableCursor !== undefined;
  }
  /** Releases the table cursor without changing the persistent ordinary cursor. @returns Nothing. */
  protected ClearTableCursor(): void {
    while (this.cursor.IsMultiSelection()) this.cursor.GetNext().Dispose();
    this.tableCursor?.Dispose();
    this.tableCursor = undefined;
  }
  /** Selects native rows. @returns Whether selected. */
  public SelTableRow(): boolean {
    return this.SelTableRowOrCol(true);
  }
  /** Selects native columns. @returns Whether selected. */
  public SelTableCol(): boolean {
    return this.SelTableRowOrCol(false);
  }
  /** Expands native flat row/column endpoints and actual table cursor owners. @param row - Native row search. @param simple - New-model graph selection instead of layout selection. @returns Whether selected. */
  public SelTableRowOrCol(row: boolean, simple = false): boolean {
    const node = this.IsCursorInTable();
    if (node === undefined) return false;
    const current = this.getShellCursor(),
      point = current.GetPoint().GetNode().StartOfSectionNode(),
      mark = current.GetMark().GetNode().StartOfSectionNode();
    if (!(point instanceof SwTableBoxStartNode) || !(mark instanceof SwTableBoxStartNode))
      return false;
    if (point.StartOfSectionNode() !== node || mark.StartOfSectionNode() !== node) return false;
    const search = row ? SwTable.SEARCH_ROW : SwTable.SEARCH_COL,
      boxes: SwTableBox[] = [];
    if (simple) node.GetTable().CreateSelection(point, mark, boxes, search);
    else boxes.push(...this.GetTableSel(search));
    if (boxes.length === 0) return false;
    const cursor = this.CreateTableCursor(),
      first = (boxes[0] as SwTableBox).GetParagraphs().at(-1) as SwTextNode,
      last = (boxes.at(-1) as SwTableBox).GetParagraphs().at(-1) as SwTextNode;
    cursor.DeleteMark();
    cursor.GetPoint().Assign(last, last.Len());
    cursor.SetMark();
    cursor.GetPoint().Assign(first, first.Len());
    cursor.ActualizeSelection(boxes);
    this.UpdateTableCursor();
    return true;
  }
  /** Selects all native table contents from first to last content node. @returns Whether selected. */
  public SelTable(): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = table
      .GetTabLines()
      .flatMap(
        /** Returns actual row boxes. @param line - Native row. @returns Original owners. */ (
          line,
        ) => line.GetTabBoxes(),
      );
    if (boxes.length === 0) return false;
    const cursor = this.CreateTableCursor(),
      first = (boxes[0] as SwTableBox).GetParagraphs()[0] as SwTextNode,
      last = (boxes.at(-1) as SwTableBox).GetParagraphs().at(-1) as SwTextNode;
    cursor.DeleteMark();
    cursor.GetPoint().Assign(first, 0);
    cursor.SetMark();
    cursor.GetPoint().Assign(last, last.Len());
    cursor.ActualizeSelection(boxes);
    this.UpdateTableCursor();
    return true;
  }
  /** Selects the complete cell containing the ordinary native point. @returns Whether selected. */
  public SelTableBox(): boolean {
    const section = this.cursor.GetPoint().GetNode().StartOfSectionNode();
    if (!(section instanceof SwTableBoxStartNode)) return false;
    const table = (section.StartOfSectionNode() as SwTableNode).GetTable(),
      boxes: SwTableBox[] = [];
    table.CreateSelection(section, section, boxes, SwTable.SEARCH_NONE);
    if (boxes.length === 0) return false;
    const box = boxes[0] as SwTableBox,
      first = box.GetParagraphs()[0] as SwTextNode,
      last = box.GetParagraphs().at(-1) as SwTextNode,
      cursor = this.CreateTableCursor();
    cursor.DeleteMark();
    cursor.GetPoint().Assign(first, 0);
    cursor.SetMark();
    cursor.GetPoint().Assign(last, last.Len());
    cursor.Exchange();
    cursor.ActualizeSelection(boxes);
    this.UpdateTableCursor();
    return true;
  }
  /** Creates the source-owned table cursor only on first entry. @returns Actual table cursor. */
  private CreateTableCursor(): SwTableCursor {
    if (this.tableCursor === undefined) {
      this.tableCursor = new SwTableCursor(this.cursor.GetPoint());
      this.cursor.DeleteMark();
    }
    return this.tableCursor;
  }

  /** Traverses native cells, asking the document to insert a row at an unmarked final boundary. @param appendLine - Native append permission. @returns Whether cursor moved. */
  public GoNextCell(appendLine = true): boolean {
    return this.RunNotificationTransaction(
      /** Publishes row insertion and cursor movement together. @returns Whether moved. */ () => {
        const cursor = this.getShellCursor(),
          section = cursor.GetPoint().GetNode().StartOfSectionNode();
        if (!(section instanceof SwTableBoxStartNode)) return false;
        const following = this.GetDoc().nodes.at(section.EndOfSectionNode().GetIndex() + 1);
        if (!(following instanceof SwTableBoxStartNode)) {
          if (cursor.HasMark() || !appendLine) return false;
          const table = (section.StartOfSectionNode() as SwTableNode).GetTable(),
            boxes = (table.GetTabLines().at(-1) as SwTableLine).GetTabBoxes();
          if (!this.GetDoc().InsertRow(boxes, 1, true, true, this.CaptureCursorState()))
            return false;
        }
        const moved = cursor.GoNextCell();
        if (moved) this.UpdateTableCursor();
        return moved;
      },
    );
  }

  /** Traverses backward without inserting content. @returns Whether cursor moved. */
  public GoPrevCell(): boolean {
    if (!this.getShellCursor().GoPrevCell()) return false;
    this.UpdateTableCursor();
    return true;
  }
}
