/** @fileoverview Original initialized dirty/copy-reference contexts and updated-name value owners from refupdatecontext.cxx. */
import { ScAddress, ScRange } from "../../../inc/address";
import { UpdateRefMode } from "../../../inc/global";
import { ColumnSet } from "../../../inc/columnset";
import type { ColumnBlockPositionSet, ColumnBlockPosition } from "../../../inc/mtvelements";
import type { ScDocument } from "../../../inc/document";
/** Original dirty traversal flags. */
export class SetFormulaDirtyContext {
  mnTabDeletedStart = -1;
  mnTabDeletedEnd = -1;
  mbClearTabDeletedFlag = false;
}

/** Original named-expression update index;only insertion normalizes tabs below -1. */
export class UpdatedRangeNames {
  private readonly maUpdatedNames = new Map<number, Set<number>>();
  /** Original insertion normalizes global-name sheet indexes and narrows UInt16 IDs. @param tab - Sheet. @param index - Name index. @returns Nothing. */
  setUpdatedName(tab: number, index: number): void {
    if (tab < -1) tab = -1;
    let indices = this.maUpdatedNames.get(tab);
    if (!indices) {
      indices = new Set();
      this.maUpdatedNames.set(tab, indices);
    }
    indices.add(index & 0xffff);
  }
  /** Original lookup deliberately does not normalize the sheet. @param tab - Sheet. @param index - Name index. @returns Updated flag. */
  isNameUpdated(tab: number, index: number): boolean {
    return this.maUpdatedNames.get(tab)?.has(index & 0xffff) ?? false;
  }
  /** Original value-return copies the native set. @param tab - Sheet. @returns Independent indexes. */
  getUpdatedNames(tab: number): Set<number> {
    return new Set(this.maUpdatedNames.get(tab));
  }
  /** Original emptiness means absence of the sheet key. @param tab - Sheet. @returns Absent flag. */
  isEmpty(tab: number): boolean {
    return !this.maUpdatedNames.has(tab);
  }
}
/** Original default first-reference-error accumulator. */
export class RefErrorContext {
  mbErrorCreated = false;
  readonly maFormulaCell = new ScAddress();
}
/** Original insert/delete/copy/move operation values and borrowed position cache;unported modes are rejected by their actual consumers. */
export class RefUpdateContext {
  meMode = UpdateRefMode.URM_INSDEL;
  readonly maRange = new ScRange();
  readonly mbTransposed: boolean;
  mnColDelta = 0;
  mnRowDelta = 0;
  mnTabDelta = 0;
  readonly maUpdatedNames = new UpdatedRangeNames();
  readonly maRegroupCols = new ColumnSet();
  private mpBlockPos: ColumnBlockPositionSet | null = null;
  readonly maRefErrors = new RefErrorContext();
  /** Original default and actual clipboard constructors. @param mrDoc - Actual destination. @param clip - Optional actual clipboard. @returns Context. */
  constructor(
    readonly mrDoc: ScDocument,
    clip: ScDocument | null = null,
  ) {
    if (clip && !clip.IsClipboard())
      throw new Error("RefUpdateContext requires a clipboard document");
    this.mbTransposed = clip !== null && clip.GetClipParam().isTransposed();
  }
  /** Original insertion sign/mode test. @returns Inserted flag. */
  isInserted(): boolean {
    return (
      this.meMode === UpdateRefMode.URM_INSDEL &&
      (this.mnColDelta > 0 || this.mnRowDelta > 0 || this.mnTabDelta > 0)
    );
  }
  /** Original deletion sign/mode test. @returns Deleted flag. */
  isDeleted(): boolean {
    return (
      this.meMode === UpdateRefMode.URM_INSDEL &&
      (this.mnColDelta < 0 || this.mnRowDelta < 0 || this.mnTabDelta < 0)
    );
  }
  /** Original nonowning cursor-cache binding. @param positions - Native cache or null. @returns Nothing. */
  setBlockPositionReference(positions: ColumnBlockPositionSet | null): void {
    this.mpBlockPos = positions;
  }
  /** Original optional actual cursor lookup. @param tab - Sheet. @param col - Column. @returns Borrowed cursor or null. */
  getBlockPosition(tab: number, col: number): ColumnBlockPosition | null {
    return this.mpBlockPos?.getBlockPosition(tab, col) ?? null;
  }
}
