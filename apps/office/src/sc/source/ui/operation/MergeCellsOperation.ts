/** @fileoverview Original MergeCellsOperation for the represented Calc cell stores. */
import { Operation, OperationType } from "./Operation";
import type { ScDocShell } from "../docshell/docsh";
import { ScCellMergeOption } from "../view/cellmergeoption";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScRange } from "../../../inc/address";
import { HasAttrFlags, InsertDeleteFlags } from "../../../inc/global";
import { scMergeResourcesEnglish } from "../../../inc/globstr";
import { ScEditableTester } from "../docshell/editable";
import { ScUndoMerge } from "../undo/undoblk3";
import { ApplyMergeAlignment } from "../../core/data/documen3";

/** Executes merge through native editability, document mutation and history owners. */
export class MergeCellsOperation extends Operation {
  private readonly option: ScCellMergeOption;
  /** Borrows the live shell and original option. @param shell - Workbook owner. @param option - Rectangle and tabs. @param contents - Move covered contents. @param record - Record history. @param api - Suppress interactive operation errors. @param empty - Remove covered contents. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    option: ScCellMergeOption,
    private readonly contents: boolean,
    record: boolean,
    api: boolean,
    private readonly empty: boolean,
  ) {
    super(OperationType.MergeCells, record, api);
    this.option = new ScCellMergeOption(option);
  }

  /** Validates every selected tab before overwriting any cell and records the original merge undo. @returns Success. */
  protected override runImplementation(): boolean {
    const {
      maTabs,
      mnStartCol: col,
      mnStartRow: row,
      mnEndCol: lastCol,
      mnEndRow: lastRow,
      mbCenter,
    } = this.option;
    if (!maTabs.size || (col === lastCol && row === lastRow)) return true;
    const doc = this.shell.GetDocument();
    for (const tab of maTabs) {
      const tester = ScEditableTester.CreateAndTestBlock(doc, tab, col, row, lastCol, lastRow);
      if (!tester.IsEditable()) {
        if (!this.mbApi) this.shell.ErrorMessage(tester.GetMessageId());
        return false;
      }
      if (
        doc.HasAttrib(
          this.option.getSingleRange(tab),
          HasAttrFlags.Merged | HasAttrFlags.Overlapped,
        )
      ) {
        if (!this.mbApi) this.shell.ErrorMessage(scMergeResourcesEnglish.STR_MSSG_MERGECELLS_0);
        return false;
      }
    }

    const undo = this.mbRecord ? new ScDocument(ScDocumentMode.SCDOCMODE_UNDO) : undefined;
    undo?.InitUndo(doc, Math.min(...maTabs), Math.max(...maTabs));
    let mergeContents = false;
    for (const tab of maTabs) {
      const range = this.option.getSingleRange(tab);
      const hasContents =
        (col < lastCol && !doc.IsBlockEmpty(col + 1, row, lastCol, lastRow, tab)) ||
        (row < lastRow && !doc.IsBlockEmpty(col, row + 1, col, lastRow, tab));
      if (undo)
        doc.CopyToDocument(
          range,
          InsertDeleteFlags.CONTENTS | InsertDeleteFlags.ATTRIB | InsertDeleteFlags.NOCAPTIONS,
          false,
          undo,
        );
      if (hasContents && this.contents) {
        doc.DoMergeContents(col, row, lastCol, lastRow, tab);
        mergeContents = true;
      } else if (hasContents && this.empty) doc.DoEmptyBlock(col, row, lastCol, lastRow, tab);
      doc.DoMerge(col, row, lastCol, lastRow, tab);
      if (mbCenter) ApplyMergeAlignment(doc, range.aStart);
      this.shell
        .GetDocFunc()
        .AdjustRowHeight(new ScRange(0, row, tab, doc.MaxCol(), lastRow, tab), true, this.mbApi);
      doc.FetchTable(tab)?.SetStreamValid(false);
    }
    if (undo)
      this.shell
        .GetUndoManager()
        .AddUndoAction(new ScUndoMerge(this.shell, this.option, mergeContents, undo));
    this.shell.SetDocumentModified();
    return true;
  }
}
