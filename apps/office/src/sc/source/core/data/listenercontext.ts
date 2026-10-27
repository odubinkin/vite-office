/** @fileoverview Original start/end listening contexts, optional shared ColumnSet selection and deferred purge action. */
import type { ScDocument } from "../../../inc/document";
import type { ScTokenArray } from "../../../inc/tokenarray";
import { ScAddress } from "../../../inc/address";
import { ColumnBlockPosition, ColumnBlockPositionSet } from "../../../inc/mtvelements";
import { ColumnSpanSet, type SpanAction } from "../../../inc/columnspanset";
import type { ColumnSet } from "../../../inc/columnset";
/** Original default/shared cursor constructors borrow the same actual document and cache. */
export class StartListeningContext {
  private readonly mpSet: ColumnBlockPositionSet;
  private mpColSet: ColumnSet | null = null;
  /** Retains the source shared column selection. @param columns - Optional selection. @returns Nothing. */
  setColumnSet(columns: ColumnSet | null): void {
    this.mpColSet = columns;
  }
  /** Borrows the shared source column selection. @returns Selection or null. */
  getColumnSet(): Pick<ColumnSet, "getColumns" | "hasTab" | "empty"> | null {
    return this.mpColSet;
  }
  /** Creates or borrows native column positions. @param mrDoc - Actual document. @param positions - Optional shared owner. @returns Context. */
  constructor(
    private readonly mrDoc: ScDocument,
    positions?: ColumnBlockPositionSet,
  ) {
    this.mpSet = positions ?? new ColumnBlockPositionSet(mrDoc);
  }
  /** Original document reference. @returns Actual document. */
  getDoc(): ScDocument {
    return this.mrDoc;
  }
  /** Original cached cursor lookup. @param tab - Sheet. @param col - Column. @returns Cursor or null. */
  getBlockPosition(tab: number, col: number): ColumnBlockPosition | null {
    return this.mpSet.getBlockPosition(tab, col);
  }
}
/** Original end context retains previous code/position and real segmented empty-broadcaster positions. */
export class EndListeningContext {
  private readonly maSet = new ColumnSpanSet();
  private readonly mpPosSet: ColumnBlockPositionSet;
  private readonly mpOldCode: ScTokenArray | null;
  private readonly maPosDelta = new ScAddress();
  /** Original document/optional-old-code and shared-cursor constructor families. @param mrDoc - Actual document. @param positionsOrCode - Shared cursors or old code. @param oldCode - Old code when shared cursors are supplied. @returns Context. */
  constructor(
    private readonly mrDoc: ScDocument,
    positionsOrCode: ColumnBlockPositionSet | ScTokenArray | null = null,
    oldCode: ScTokenArray | null = null,
  ) {
    this.mpPosSet =
      positionsOrCode instanceof ColumnBlockPositionSet
        ? positionsOrCode
        : new ColumnBlockPositionSet(mrDoc);
    this.mpOldCode = positionsOrCode instanceof ColumnBlockPositionSet ? oldCode : positionsOrCode;
  }
  /** Original copied position delta. @param delta - Source delta. @returns Nothing. */
  setPositionDelta(delta: ScAddress): void {
    this.maPosDelta.assign(delta);
  }
  /** Original borrowed document. @returns Actual document. */
  getDoc(): ScDocument {
    return this.mrDoc;
  }
  /** Original borrowed old code. @returns Code or null. */
  getOldCode(): ScTokenArray | null {
    return this.mpOldCode;
  }
  /** Original old position adds the stored delta with native address widths. @param position - Current position. @returns Independent old position. */
  getOldPosition(position: ScAddress): ScAddress {
    const old = new ScAddress(position);
    old.IncCol(this.maPosDelta.Col());
    old.IncRow(this.maPosDelta.Row());
    old.IncTab(this.maPosDelta.Tab());
    return old;
  }
  /** Original shared cursor lookup. @param tab - Sheet. @param col - Column. @returns Cursor or null. */
  getBlockPosition(tab: number, col: number): ColumnBlockPosition | null {
    return this.mpPosSet.getBlockPosition(tab, col);
  }
  /** Original deferred empty position tag. @param tab - Sheet. @param col - Column. @param row - Row. @returns Nothing. */
  addEmptyBroadcasterPosition(tab: number, col: number, row: number): void {
    this.maSet.set(this.mrDoc, tab, col, row, true);
  }
  /** Original explicit purge does not clear the span set or run automatically at destruction. @returns Nothing. */
  purgeEmptyBroadcasters(): void {
    this.maSet.executeAction(this.mrDoc, new PurgeListenerAction(this.mrDoc));
  }
}
/** Original purge action owns one real mutable cursor value reused per column. */
export class PurgeListenerAction implements SpanAction {
  private readonly mpBlockPos = new ColumnBlockPosition();
  /** Borrows the actual document. @param mrDoc - Document. @returns Action. */
  constructor(private readonly mrDoc: ScDocument) {}
  /** Original per-column initialization. @param tab - Sheet. @param col - Column. @returns Nothing. */
  startColumn(tab: number, col: number): void {
    this.mrDoc.InitColumnBlockPosition(this.mpBlockPos, tab, col);
  }
  /** Original false runs are skipped;true runs delete original broadcaster spans. @param position - Top cell. @param length - Count. @param value - Flag. @returns Nothing. */
  execute(position: ScAddress, length: number, value: boolean): void {
    if (value) this.mrDoc.DeleteBroadcasters(this.mpBlockPos, position, length);
  }
}
