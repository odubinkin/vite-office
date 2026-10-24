/** @fileoverview Consumed native ScViewFunc selection formatting,frame operations and explicit sheet geometry;device/rich-edit/alternate-view services remain unported. */
import type { ScModule } from "../../../inc/scmod";
import type { ScDocumentPool } from "../../core/data/docpool";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as Inner,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import { ScUndoSelectionAttr } from "../undo/undoblk3";
import {
  ApplyAttributesWithChangedRangeOperation,
  ApplyAttributesToCellOperation,
} from "../operation/ApplyAttributesOperation";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { AutoSum, GetAutoSumArea, GetAutoSumFormula, AdjustBlockHeight } from "./viewfun2";
import { ScViewUtil } from "./viewutil";
import { ScTabView } from "./tabview3";
import type { ScDocShell } from "../docshell/docsh";
import { InsertDeleteFlags, ScSizeMode } from "../../../inc/global";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange, ScAddress } from "../../../inc/address";
import { ScUndoWidthOrHeight } from "../undo/undoblk2";
import { ScRangeList } from "../../../inc/rangelst";
import { OpCode } from "../../../../formula/inc/opcode";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScFormulaCell } from "../../../inc/formulacell";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ColRowSpan } from "../../../inc/columnspanset";
import type { ScViewData } from "../inc/viewdata";
/** Original ShowFilteredRows skips actual filter runs when manually resizing or hiding. @param doc - Actual document. @param tab - Sheet. @param first - First row. @param last - Last row. @param show - Visibility. @returns Nothing. */
function ShowFilteredRows(
  doc: ScDocument,
  tab: number,
  first: number,
  last: number,
  show: boolean,
): void {
  const end: [number] = [first];
  do {
    if (!doc.RowFiltered(first, tab, undefined, end))
      doc.ShowRows(first, Math.min(end[0], last), tab, show);
    first = end[0] + 1;
  } while (first <= last);
}
/** Restricts only an exact whole-sheet simple mark, preserving the source ignored clipping result. @param marks - Copied view marks. @param doc - Actual document. @returns Nothing. */
function ShrinkToDataArea(marks: ScMarkData, doc: ScDocument): void {
  if (!marks.IsMarked()) return;
  if (marks.IsMultiMarked()) return;
  const area = marks.GetMarkArea();
  if (area.aStart.Row() !== 0 || area.aStart.Col() !== 0) return;
  if (area.aEnd.Row() !== doc.MaxRow() || area.aEnd.Col() !== doc.MaxCol()) return;
  if (area.aStart.Tab() !== area.aEnd.Tab()) return;
  const firstCol: [number] = [area.aStart.Col()],
    firstRow: [number] = [area.aStart.Row()],
    lastCol: [number] = [area.aEnd.Col()],
    lastRow: [number] = [area.aEnd.Row()];
  doc.ShrinkToDataArea(area.aStart.Tab(), firstCol, firstRow, lastCol, lastRow);
  area.aStart.SetCol(firstCol[0]);
  area.aStart.SetRow(firstRow[0]);
  area.aEnd.SetCol(lastCol[0]);
  area.aEnd.SetRow(lastRow[0]);
  marks.ResetMark();
  marks.SetMarkArea(area);
}
/** Queries the source default-sheet-view selection without changing actual view marks. @param view - Actual view data. @returns Borrowed native merged pattern. */
export function GetSelectionPattern(view: ScViewData): ScPatternAttr {
  const marks = new ScMarkData(view.GetMarkData()),
    doc = view.GetDocument();
  ShrinkToDataArea(marks, doc);
  if (!marks.IsMarked() && !marks.IsMultiMarked())
    marks.SetMarkArea(
      new ScRange(
        view.GetCurX(),
        view.GetCurY(),
        view.GetTabNumber(),
        view.GetCurX(),
        view.GetCurY(),
        view.GetTabNumber(),
      ),
    );
  return doc.GetSelectionPattern(marks);
}

/** Native view-function layer owns the cursor-versus-mark deletion decision. */
export class ScViewFunc extends ScTabView {
  /** Borrows actual source view/document owners. @param data - View. @param shell - Document shell. @param module - Actual active input reference receiver. @returns View functions. */
  constructor(
    private readonly data: ScViewData,
    private readonly shell: ScDocShell,
    module: ScModule | null = null,
  ) {
    super(data, true, module);
  }
  /** Original range inference delegates to the native viewfun2 implementation. @param ranges - Ordered output ranges. @returns Found data. */
  GetAutoSumArea(ranges: ScRangeList): boolean {
    return GetAutoSumArea(this.GetViewData(), ranges);
  }
  /** Original aggregate source construction through actual tokens and current document grammar. @param ranges - References. @param subtotal - Filtered request. @param address - Result position. @param code - Function opcode. @returns Formula source. */
  GetAutoSumFormula(
    ranges: ScRangeList,
    subtotal: boolean,
    address: ScAddress,
    code: OpCode,
  ): OUString {
    return GetAutoSumFormula(this.GetViewData(), ranges, subtotal, address, code);
  }
  /** Original selected-block aggregate placement. @param range - Selection. @param subtotal - Filtered request. @param setCursor - Cursor update. @param continueMarks - Previous blocks. @param code - Aggregate. @returns Placement possible. */
  AutoSum(
    range: ScRange,
    subtotal: boolean,
    setCursor: boolean,
    continueMarks: boolean,
    code: OpCode,
  ): boolean {
    return AutoSum(this, range, subtotal, setCursor, continueMarks, code);
  }
  /** Consumed ordinary-formula EnterData path,using native concrete formula operations and per-cell list history. Nonformula/rich-edit/matrix processing remains unported here. @param col - Column. @param row - Row. @param tab - Source sheet. @param source - Formula text. @returns Nothing. */
  EnterData(col: number, row: number, tab: number, source: OUStringConstReference): void {
    if (!text(source).startsWith("="))
      throw new Error("Nonformula EnterData processing is not implemented");
    const doc = this.data.GetDocument(),
      manager = this.shell.GetUndoManager();
    void tab;
    manager.EnterListAction("Input");
    try {
      for (const selected of this.data.GetMarkData().GetSelectedTabs()) {
        const position = new ScAddress(col, row, selected),
          cell = new ScFormulaCell(doc, position, source, doc.GetGrammar());
        this.shell.GetDocFunc().SetFormulaCell(position, cell, true);
      }
    } finally {
      manager.LeaveListAction();
    }
  }
  /** Original GetSelectionFrame consumes marked-frame query or cloned cursor items with non-table distance flags. @returns Actual outer and inner frame items. */
  GetSelectionFrame(): [SvxBoxItem, SvxBoxInfoItem] {
    const doc = this.data.GetDocument(),
      marks = this.data.GetMarkData();
    if (marks.IsMarked() || marks.IsMultiMarked()) {
      const outer = new SvxBoxItem(150),
        inner = new SvxBoxInfoItem(151);
      doc.GetSelectionFrame(marks, outer, inner);
      return [outer, inner];
    }
    const pattern = doc.GetPattern(
        new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
      ) as ScPatternAttr,
      outer = (pattern.GetItem(150) as SvxBoxItem).Clone(),
      inner = (pattern.GetItem(151) as SvxBoxInfoItem).Clone();
    inner.SetTable(false);
    inner.SetDist(true);
    inner.SetMinDist(false);
    return [outer, inner];
  }
  /** Original plain-cell ApplySelectionPattern dispatches marked versus cursor operations after removing filtered working marks. @param attr - Borrowed delta. @param cursorOnly - Restrict to cursor. @returns Native operation result. */
  ApplySelectionPattern(attr: ScPatternAttr, cursorOnly = false): boolean {
    const doc = this.data.GetDocument(),
      marks = new ScMarkData(this.data.GetMarkData());
    ScViewUtil.UnmarkFiltered(marks, doc);
    const multi = marks.IsMultiMarked();
    marks.MarkToMulti();
    const position = new ScAddress(
      this.data.GetCurX(),
      this.data.GetCurY(),
      this.data.GetTabNumber(),
    );
    if (!marks.IsMultiMarked() && !cursorOnly && marks.GetSelectCount() > 1) {
      marks.SetMarkArea(new ScRange(position));
      marks.MarkToMulti();
    }
    return marks.IsMultiMarked() && !cursorOnly
      ? new ApplyAttributesWithChangedRangeOperation(
          this.shell,
          marks,
          multi,
          attr,
          false,
          this.data,
        ).run()
      : new ApplyAttributesToCellOperation(this.shell, position, attr, false, this.data).run();
  }
  /** Original ApplyAttributes separates actual frame items from the remaining native delta. Number-format language/spell services are unported and are not synthesized. @param dialogSet - New actual attributes. @param oldSet - Prior source attributes. @param adjustHeight - Original height adjustment flag. @returns Nothing. */
  ApplyAttributes(dialogSet: SfxItemSet, oldSet: SfxItemSet, adjustHeight = true): void {
    const doc = this.data.GetDocument(),
      old = new ScPatternAttr(doc.getCellAttributeHelper(), oldSet),
      next = new ScPatternAttr(doc.getCellAttributeHelper(), dialogSet);
    try {
      next.DeleteUnchanged(old);
      const oldOuter = oldSet.Get(150) as SvxBoxItem,
        newOuter = dialogSet.Get(150) as SvxBoxItem,
        oldInner = oldSet.Get(151) as SvxBoxInfoItem,
        newInner = dialogSet.Get(151) as SvxBoxInfoItem;
      next.ItemSetClearItem(150);
      next.ItemSetClearItem(151);
      let frame =
        dialogSet.GetItemState(150) !== SfxItemState.DEFAULT ||
        dialogSet.GetItemState(151) !== SfxItemState.DEFAULT;
      if (SfxPoolItem.areSame(newOuter, oldOuter) && SfxPoolItem.areSame(newInner, oldInner))
        frame = false;
      frame =
        frame &&
        [Valid.LEFT, Valid.RIGHT, Valid.TOP, Valid.BOTTOM, Valid.HORI, Valid.VERT].some(
          /** Reads genuine inner validity. @param flag - Source edge flag. @returns Valid. */ (
            flag,
          ) => newInner.IsValid(flag),
        );
      if (frame)
        this.ApplyPatternLines(
          next,
          newOuter.isStaticDefault() ? oldOuter : newOuter,
          newInner.isStaticDefault() ? oldInner : newInner,
        );
      else this.ApplySelectionPattern(next);
      if (adjustHeight) {
        const marks = this.data.GetMarkData(),
          range = marks.IsMultiMarked()
            ? marks.GetMultiMarkArea()
            : marks.IsMarked()
              ? marks.GetMarkArea()
              : new ScRange(
                  new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
                );
        AdjustBlockHeight(doc, marks, range.aStart.Row(), range.aEnd.Row());
      }
    } finally {
      next.Dispose();
      old.Dispose();
    }
  }
  /** Original UpdateLineAttrs preserves destination geometry for color-only and destination color for style-only. @param line - Mutable output. @param dest - Existing edge. @param source - Requested style/color or absence. @param colorOnly - Color mode. @returns Nothing. */
  private UpdateLineAttrs(
    line: SvxBorderLine,
    dest: Readonly<SvxBorderLine> | undefined,
    source: SvxBorderLine | undefined,
    colorOnly: boolean,
  ): void {
    if (!source || !dest) return;
    line.SetColor(colorOnly ? source.GetColor() : dest.GetColor());
    line.SetBorderLineStyle(colorOnly ? dest.GetBorderLineStyle() : source.GetBorderLineStyle());
    line.SetWidth(colorOnly ? dest.GetWidth() : source.GetWidth());
  }
  /** Original uniform path uses ApplyAttributes;the mixed-item branch directly transforms marked existing lines without adding history. @param line - Requested style/color or absence. @param colorOnly - Color mode. @returns Nothing. */
  SetSelectionFrameLines(line: SvxBorderLine | undefined, colorOnly: boolean): void {
    const doc = this.data.GetDocument(),
      marks = new ScMarkData(this.data.GetMarkData());
    ScViewUtil.UnmarkFiltered(marks, doc);
    const selected = GetSelectionPattern(this.data).GetItemSet(),
      states = [150, 141, 142].map(
        /** Reads original selected item state. @param which - Native item id. @returns State. */ (
          which,
        ) => selected.GetItemState(which),
      );
    if (
      states.every(
        /** Tests native default. @param state - Item state. @returns Default. */ (state) =>
          state === SfxItemState.DEFAULT,
      )
    )
      return;
    if (
      states.every(
        /** Tests original mixed admission. @param state - Item state. @returns Uniform. */ (
          state,
        ) => state !== SfxItemState.INVALID,
      )
    ) {
      const oldSet = new SfxItemSet(doc.GetPool() as ScDocumentPool, [[100, 155]]),
        newSet = new SfxItemSet(doc.GetPool() as ScDocumentPool, [[100, 155]]),
        updated = new SvxBorderLine();
      try {
        const border = selected.Get(150) as SvxBoxItem,
          box = new SvxBoxItem(border),
          inner = new SvxBoxInfoItem(151);
        for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT]) {
          const existing = box.GetLine(edge);
          if (existing) {
            if (line) {
              this.UpdateLineAttrs(updated, existing, line, colorOnly);
              box.SetLine(updated, edge);
            } else box.SetLine(undefined, edge);
          }
        }
        inner.SetLine(box.GetTop(), Inner.HORI);
        inner.SetLine(box.GetLeft(), Inner.VERT);
        inner.ResetFlags();
        oldSet.Put(border);
        newSet.Put(box);
        newSet.Put(inner);
        for (const which of [141, 142]) {
          const original = selected.Get(which) as SvxLineItem;
          if (original.GetLine()) {
            const item = original.Clone();
            this.UpdateLineAttrs(updated, item.GetLine() ?? undefined, line, colorOnly);
            item.SetLine(updated);
            oldSet.Put(original);
            newSet.Put(item);
          }
        }
        this.ApplyAttributes(newSet, oldSet);
      } finally {
        newSet.ClearItem();
        oldSet.ClearItem();
      }
    } else {
      marks.MarkToMulti();
      doc.ApplySelectionLineStyle(marks, line, colorOnly);
    }
    this.shell.SetDocumentModified();
  }
  /** Original ApplyPatternLines records the full adjacent envelope and applies frames before pattern deltas. Device painting and rich-text services remain unported. @param attr - Borrowed pattern delta. @param outer - Actual outer frame. @param inner - Actual inner frame and validity. @returns Nothing. */
  ApplyPatternLines(attr: ScPatternAttr, outer: SvxBoxItem, inner: SvxBoxInfoItem): void {
    const doc = this.data.GetDocument(),
      marks = new ScMarkData(this.data.GetMarkData());
    ScViewUtil.UnmarkFiltered(marks, doc);
    marks.MarkToSimple();
    const multi = marks.IsMultiMarked();
    let range: ScRange;
    if (multi) range = new ScRange(marks.GetMultiMarkArea());
    else if (marks.IsMarked()) range = new ScRange(marks.GetMarkArea());
    else {
      range = new ScRange(
        new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
      );
      this.data.GetMarkData().SetMarkArea(range);
      marks.SetMarkArea(range);
    }
    const removeAdjacent = outer.IsRemoveAdjacentCellBorder(),
      cover = new ScRange(range);
    if (removeAdjacent) marks.GetSelectionCover(cover);
    const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
      tab = range.aStart.Tab();
    undo.InitUndo(doc, tab, tab);
    for (const selected of marks) if (selected !== tab) undo.AddUndoTab(selected, selected);
    const copy = new ScRange(cover),
      copyOnlyMarked = !removeAdjacent && multi;
    copy.aStart.SetTab(0);
    copy.aEnd.SetTab(doc.GetTableCount() - 1);
    doc.CopyToDocument(copy, InsertDeleteFlags.ATTRIB, copyOnlyMarked, undo, marks);
    this.shell
      .GetUndoManager()
      .AddUndoAction(
        new ScUndoSelectionAttr(
          this.shell,
          marks,
          range,
          undo,
          attr,
          copyOnlyMarked,
          outer,
          inner,
          cover,
        ),
      );
    doc.ApplySelectionFrame(marks, outer, inner);
    marks.MarkToMulti();
    doc.ApplySelectionPattern(attr, marks);
    this.shell.SetDocumentModified();
  }
  /** Original indentation works on copied marks with filtered rows removed. @param increment - Direction. @returns Operation result. */
  ChangeIndent(increment: boolean): boolean {
    const marks = new ScMarkData(this.data.GetMarkData());
    ScViewUtil.UnmarkFiltered(marks, this.data.GetDocument());
    marks.MarkToMulti();
    if (!marks.IsMultiMarked())
      marks.SetMultiMarkArea(
        new ScRange(
          new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
        ),
      );
    return this.shell.GetDocFunc().ChangeIndent(marks, increment, false);
  }
  /** Original marked width dispatch converts actual view marks to spans and back. @param width - Column axis. @param mode - Native size mode. @param twips - UInt16 size. @returns Nothing. */
  SetMarkedWidthOrHeight(width: boolean, mode: ScSizeMode, twips: number): void {
    const marks = this.data.GetMarkData();
    marks.MarkToMulti();
    if (!marks.IsMultiMarked())
      marks.SetMultiMarkArea(
        new ScRange(
          new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
        ),
      );
    this.SetWidthOrHeight(
      width,
      width ? marks.GetMarkedColSpans() : marks.GetMarkedRowSpans(),
      mode,
      twips,
    );
    marks.MarkToSimple();
  }
  /** Original explicit row/column geometry; device-dependent optimal sizing remains unported. @param width - Column axis. @param ranges - Inclusive source spans. @param mode - DIRECT,SHOW or ORIGINAL. @param twips - UInt16 size. @param record - Record actual geometry document. @param suppliedMarks - Original redo marks. @returns Nothing. */
  SetWidthOrHeight(
    width: boolean,
    ranges: readonly ColRowSpan[],
    mode: ScSizeMode,
    twips: number,
    record = true,
    suppliedMarks?: ScMarkData,
  ): void {
    if (ranges.length === 0) return;
    if (
      mode !== ScSizeMode.SC_SIZE_DIRECT &&
      mode !== ScSizeMode.SC_SIZE_SHOW &&
      mode !== ScSizeMode.SC_SIZE_ORIGINAL
    )
      throw new Error("Only explicit geometry is implemented");
    const marks = new ScMarkData(suppliedMarks ?? this.data.GetMarkData()),
      doc = this.shell.GetDocument(),
      first = (ranges[0] as ColRowSpan).mnStart,
      last = (ranges[ranges.length - 1] as ColRowSpan).mnEnd,
      currentTab = this.data.GetTabNumber();
    twips &= 0xffff;
    let undo: ScDocument | undefined;
    if (record) {
      undo = new ScDocument();
      const name = new OUString();
      for (let tab = 0; tab < doc.GetTableCount(); tab++) {
        doc.GetName(tab, name);
        undo.InsertTab(tab, name);
      }
      name.dispose();
      for (const tab of marks.GetSelectedTabs())
        doc.CopyToDocument(
          width
            ? new ScRange(first, 0, tab, last, doc.MaxRow(), tab)
            : new ScRange(0, first, tab, doc.MaxCol(), last, tab),
          InsertDeleteFlags.NONE,
          false,
          undo,
        );
    }
    const show = twips > 0 || mode !== ScSizeMode.SC_SIZE_DIRECT;
    let hiddenCursor = false;
    for (const tab of marks.GetSelectedTabs())
      for (const range of ranges) {
        if (width) {
          for (let column = range.mnStart; column <= range.mnEnd; column++) {
            if (twips) doc.SetColWidth(column, tab, twips);
            doc.ShowCol(column, tab, show);
            if (!show && column === this.data.GetCurX() && tab === currentTab) hiddenCursor = true;
          }
        } else if (mode === ScSizeMode.SC_SIZE_DIRECT) {
          if (twips) {
            doc.SetRowHeightRange(range.mnStart, range.mnEnd, tab, twips);
            doc.SetManualHeight(range.mnStart, range.mnEnd, tab, true);
          }
          ShowFilteredRows(doc, tab, range.mnStart, range.mnEnd, twips !== 0);
          if (
            !show &&
            range.mnStart <= this.data.GetCurY() &&
            this.data.GetCurY() <= range.mnEnd &&
            tab === currentTab
          )
            hiddenCursor = true;
        } else if (mode === ScSizeMode.SC_SIZE_SHOW)
          doc.ShowRows(range.mnStart, range.mnEnd, tab, true);
      }
    if (undo)
      this.shell
        .GetUndoManager()
        .AddUndoAction(
          new ScUndoWidthOrHeight(
            this.shell,
            marks,
            first,
            last,
            currentTab,
            undo,
            width,
            ranges,
            mode,
            twips,
            this,
          ),
        );
    if (hiddenCursor) {
      if (width) {
        const old = this.data.GetCurX();
        this.data.SetCurX(this.SkipCursorHorizontal(Math.min(old + 1, doc.MaxCol()), old, 1));
      } else {
        const old = this.data.GetCurY();
        this.data.SetCurY(this.SkipCursorVertical(Math.min(old + 1, doc.MaxRow()), old, 1));
      }
    }
    this.shell.SetDocumentModified();
  }
  /** Original plain-cell DeleteContents chooses DeleteCell for an unmarked cursor and DeleteContents for marked selections. @param flags - HARDATTR|EDITATTR for native Clear. @returns Operation result. */
  DeleteContents(flags: InsertDeleteFlags): boolean {
    const marks = new ScMarkData(this.data.GetMarkData()),
      docFunc = this.shell.GetDocFunc();
    if (!marks.IsMarked() && !marks.IsMultiMarked())
      return docFunc.DeleteCell(
        new ScAddress(this.data.GetCurX(), this.data.GetCurY(), this.data.GetTabNumber()),
        marks,
        flags,
        true,
        false,
      );
    return docFunc.DeleteContents(marks, flags, true, false);
  }
}
