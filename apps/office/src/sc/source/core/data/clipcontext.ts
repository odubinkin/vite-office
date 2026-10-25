/** @fileoverview Original clipboard contexts over real column cursors,cell values and listening spans;default content-only profile. */
import { ColumnBlockPositionSet } from "../../../inc/mtvelements";
import type { ScDocument } from "../../../inc/document";
import type { ScColumn } from "../../../inc/column";
import type { ScPatternAttr } from "../../../inc/patattr";
import type { ScAddress } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import { CellTextAttr } from "../../../inc/celltextattr";
import { ColumnSpanSet, type SpanAction } from "../../../inc/columnspanset";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { InsertDeleteFlags } from "../../../inc/global";
/** Original shared cursor cache belongs to this operation,not to an alternate workbook. */
export class ClipContextBase {
  private readonly mpSet: ColumnBlockPositionSet;
  /** Constructs actual column cursors. @param doc - Destination document. @returns Context. */
  constructor(doc: ScDocument) {
    this.mpSet = new ColumnBlockPositionSet(doc);
  }
  /** Borrows the original cached cursor. @param tab - Sheet. @param col - Column. @returns Cursor or null. */
  getBlockPosition(tab: number, col: number) {
    return this.mpSet.getBlockPosition(tab, col);
  }
  /** Borrows the operation-owned cache. @returns Cache. */
  getBlockPositionSet(): ColumnBlockPositionSet {
    return this.mpSet;
  }
}
/** Original operation context for default internal content paste. */
export class CopyFromClipContext extends ClipContextBase {
  private readonly maListeningFormulaSpans = new ColumnSpanSet();
  private mnDestCol1 = -1;
  private mnDestCol2 = -1;
  private mnDestRow1 = -1;
  private mnDestRow2 = -1;
  private mnTabStart = -1;
  private mnTabEnd = -1;
  private mnDeleteFlag = InsertDeleteFlags.NONE;
  private readonly maSingleCells: ScCellValue[] = [];
  private readonly maSingleCellAttrs: CellTextAttr[] = [];
  private readonly maSinglePatterns: (ScPatternAttr | null)[] = [];
  /** Captures actual native owners and defaults;nondefault paste services remain an explicit boundary. @param mrDestDoc - Destination. @param mpRefUndoDoc - Reference undo document. @param mpClipDoc - Clipboard. @param mnInsertFlag - Insert flags. @param mbAsLink - Link mode. @param mbSkipEmptyCells - Skip-empty mode. @returns Context. */
  constructor(
    private readonly mrDestDoc: ScDocument,
    private readonly mpRefUndoDoc: ScDocument | null,
    private readonly mpClipDoc: ScDocument,
    private readonly mnInsertFlag: InsertDeleteFlags,
    private readonly mbAsLink: boolean,
    private readonly mbSkipEmptyCells: boolean,
  ) {
    super(mrDestDoc);
    if (mnInsertFlag !== InsertDeleteFlags.CONTENTS || mbAsLink || mbSkipEmptyCells)
      throw new Error("Nondefault clipboard paste context is not implemented");
  }
  /** Original sheet span setter. @param first - First sheet. @param last - Last sheet. @returns Nothing. */
  setTabRange(first: number, last: number): void {
    this.mnTabStart = first;
    this.mnTabEnd = last;
  }
  /** Original first sheet query. @returns Sheet. */ getTabStart(): number {
    return this.mnTabStart;
  }
  /** Original last sheet query. @returns Sheet. */ getTabEnd(): number {
    return this.mnTabEnd;
  }
  /** Original destination coordinate setter. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
  setDestRange(col1: number, row1: number, col2: number, row2: number): void {
    this.mnDestCol1 = col1;
    this.mnDestRow1 = row1;
    this.mnDestCol2 = col2;
    this.mnDestRow2 = row2;
  }
  /** Original copied destination range value. @returns Endpoints. */
  getDestRange() {
    return {
      mnCol1: this.mnDestCol1,
      mnCol2: this.mnDestCol2,
      mnRow1: this.mnDestRow1,
      mnRow2: this.mnDestRow2,
    };
  }
  /** Original reference undo borrow. @returns Undo document. */ getUndoDoc(): ScDocument | null {
    return this.mpRefUndoDoc;
  }
  /** Original clipboard borrow. @returns Clipboard. */ getClipDoc(): ScDocument {
    return this.mpClipDoc;
  }
  /** Original destination borrow. @returns Document. */ getDestDoc(): ScDocument {
    return this.mrDestDoc;
  }
  /** Original insert flags. @returns Flags. */ getInsertFlag(): InsertDeleteFlags {
    return this.mnInsertFlag;
  }
  /** Original delete flags setter. @param flags - Flags. @returns Nothing. */ setDeleteFlag(
    flags: InsertDeleteFlags,
  ): void {
    this.mnDeleteFlag = flags;
  }
  /** Original delete flags. @returns Flags. */ getDeleteFlag(): InsertDeleteFlags {
    return this.mnDeleteFlag;
  }
  /** Original link flag. @returns Flag. */ isAsLink(): boolean {
    return this.mbAsLink;
  }
  /** Original skip-empty flag. @returns Flag. */ isSkipEmptyCells(): boolean {
    return this.mbSkipEmptyCells;
  }
  /** Records real formula ranges for deferred subscriptions. @param tab - Sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
  setListeningFormulaSpans(
    tab: number,
    col1: number,
    row1: number,
    col2: number,
    row2: number,
  ): void {
    for (let col = col1; col <= col2; ++col)
      this.maListeningFormulaSpans.set(this.mrDestDoc, tab, col, row1, row2, true);
  }
  /** Starts actual group subscriptions using shared native cursor contexts. @returns Nothing. */
  startListeningFormulas(): void {
    const positions = new ColumnBlockPositionSet(this.mrDestDoc),
      start = new StartListeningContext(this.mrDestDoc, positions),
      end = new EndListeningContext(this.mrDestDoc, positions);
    const action: SpanAction = {
      /** Native base default has no per-column action. @returns Nothing. */ startColumn() {},
      /** Only changed spans subscribe. @param position - Span start. @param length - Row count. @param value - Changed. @returns Nothing. */
      execute: (position, length, value) => {
        if (value)
          this.mrDestDoc.StartListeningFromClip(
            start,
            end,
            position.Tab(),
            position.Col(),
            position.Row(),
            position.Col(),
            position.Row() + length - 1,
          );
      },
    };
    this.maListeningFormulaSpans.executeAction(this.mrDestDoc, action);
  }
  /** Resizes the actual cell/attribute vector members with native value defaults. @param size - Row width. @returns Nothing. */
  setSingleCellColumnSize(size: number): void {
    for (let index = size; index < this.maSingleCells.length; ++index)
      (this.maSingleCells[index] as ScCellValue).clear();
    while (this.maSingleCells.length < size) this.maSingleCells.push(new ScCellValue());
    while (this.maSingleCellAttrs.length < size) this.maSingleCellAttrs.push(new CellTextAttr());
    while (this.maSinglePatterns.length < size) this.maSinglePatterns.push(null);
    this.maSingleCells.length = size;
    this.maSingleCellAttrs.length = size;
    this.maSinglePatterns.length = size;
  }
  /** Borrows the actual owned cell value. @param offset - Source column offset. @returns Cell. */
  getSingleCell(offset: number): ScCellValue {
    if (offset >= this.maSingleCells.length) throw new Error("Clipboard cell offset out of range");
    return this.maSingleCells[offset] as ScCellValue;
  }
  /** Borrows actual text metadata. @param offset - Source column offset. @returns Metadata. */
  getSingleCellAttr(offset: number): CellTextAttr {
    if (offset >= this.maSingleCellAttrs.length)
      throw new Error("Clipboard attribute offset out of range");
    return this.maSingleCellAttrs[offset] as CellTextAttr;
  }
  /** Borrows the original single-row source pattern without taking holder ownership. @param offset - Source column offset. @returns Borrowed pattern or native null default. */
  getSingleCellPattern(offset: number): ScPatternAttr | null {
    if (offset >= this.maSinglePatterns.length)
      throw new Error("Clipboard pattern offset out of range");
    return this.maSinglePatterns[offset] as ScPatternAttr | null;
  }
  /** Stores the original borrowed source pattern pointer. @param offset - Source column offset. @param pattern - Borrowed pattern or null. @returns Nothing. */
  setSingleCellPattern(offset: number, pattern: ScPatternAttr | null): void {
    if (offset >= this.maSinglePatterns.length)
      throw new Error("Clipboard pattern offset out of range");
    this.maSinglePatterns[offset] = pattern;
  }
  /** Copies a source cell and metadata through original ScCellValue assignment. Default CONTENTS admits all represented cell alternatives. @param position - Source cell. @param column - Actual source column. @returns Nothing. */
  setSingleCell(position: ScAddress, column: ScColumn): void {
    const offset = position.Col() - this.mpClipDoc.GetClipParam().getWholeRange().aStart.Col(),
      attr = column.GetCellTextAttr(position.Row());
    if (attr) this.getSingleCellAttr(offset).assign(attr);
    this.getSingleCell(offset).assign(this.mpClipDoc, position);
  }
  /** Releases native owned copied cell alternatives at operation end. @returns Nothing. */
  Dispose(): void {
    for (const cell of this.maSingleCells) cell.clear();
  }
}

/** Original CopyToDocContext owns the genuine destination cursor cache and listening policy. */
export class CopyToDocContext extends ClipContextBase {
  private mbStartListening: boolean;
  /** Binds the actual destination with original immediate-listening default. @param doc - Destination owner. @returns Context. */
  constructor(doc: ScDocument) {
    super(doc);
    this.mbStartListening = true;
  }
  /** Original policy setter. @param value - Start listening during copy. @returns Nothing. */
  setStartListening(value: boolean): void {
    this.mbStartListening = value;
  }
  /** Original policy query. @returns Start listening during copy. */
  isStartListening(): boolean {
    return this.mbStartListening;
  }
}
