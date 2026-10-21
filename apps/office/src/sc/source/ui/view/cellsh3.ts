/** @fileoverview Consumed native ScCellShell SID_CELL_FORMAT_RESET command over the actual view function owner. */
import { ScViewFunc } from "./viewfunc";
import { InsertDeleteFlags, ScSizeMode, TwipsToEvenHMM } from "../../../inc/global";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item, SfxInt32Item } from "../../../../svl/source/items/intitem";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import type { ScViewData } from "../inc/viewdata";
import { ScRange } from "../../../inc/address";
import { ColRowSpan } from "../../../inc/columnspanset";
/** Native cell-shell command boundary;shared browser dispatch performs the existing Sfx slot admission. */
export class ScCellShell {
  /** Borrows actual native view functions. @param view - Source view owner. @returns Cell shell. */
  constructor(private readonly view: ScViewFunc) {}
  /** Original SID_SELECTALL honors Calc Input SelectRangeBeforeAll's true default. @param request - Actual request. @param data - Native view. @param selectFirst - Prepared native configuration value. @returns Nothing. */
  ExecuteSelectAll(request: SfxRequest, data: ScViewData, selectFirst = true): void {
    const firstCol: [number] = [data.GetCurX()],
      firstRow: [number] = [data.GetCurY()],
      lastCol: [number] = [firstCol[0]],
      lastRow: [number] = [firstRow[0]];
    let canMark = false;
    if (selectFirst && !data.GetMarkData().IsMarked()) {
      data
        .GetDocument()
        .GetDataArea(data.GetTabNumber(), firstCol, firstRow, lastCol, lastRow, true, false);
      canMark = firstCol[0] !== lastCol[0] || firstRow[0] !== lastRow[0];
    }
    if (canMark)
      this.view.MarkRange(
        new ScRange(
          firstCol[0],
          firstRow[0],
          data.GetTabNumber(),
          lastCol[0],
          lastRow[0],
          data.GetTabNumber(),
        ),
        false,
      );
    else this.view.SelectAll();
    request.Done();
  }
  /** Original SID_INC_INDENT/SID_DEC_INDENT cell-shell dispatch. @param increment - Direction. @returns Result. */
  ChangeIndent(increment: boolean): boolean {
    return this.view.ChangeIndent(increment);
  }
  /** Native row-height argument contract uses UInt16 HMM and optional Int32 one-based Row. @param request - Source request. @param data - View. @returns Typed height present. */
  ExecuteRowHeight(request: SfxRequest, data: ScViewData): boolean {
    const height = request
      .GetArgs()
      .find(
        /** Finds native height. @param item - Argument. @returns Match. */ (item) =>
          item.Which() === 26286,
      );
    if (!(height instanceof SfxUInt16Item)) return false;
    const row = request
        .GetArgs()
        .find(
          /** Finds FN_PARAM_1. @param item - Argument. @returns Match. */ (item) =>
            item.Which() === 21160,
        ),
      twips = Number(toTwips(BigInt(height.GetValue()), Length.mm100));
    if (row instanceof SfxInt32Item) {
      const index = row.GetValue() - 1,
        marks = data.GetMarkData();
      this.view.SetWidthOrHeight(
        false,
        marks.IsRowMarked(index) ? marks.GetMarkedRowSpans() : [new ColRowSpan(index, index)],
        ScSizeMode.SC_SIZE_DIRECT,
        twips,
      );
    } else {
      this.view.SetMarkedWidthOrHeight(false, ScSizeMode.SC_SIZE_DIRECT, twips);
      if (!request.IsAPI()) request.Done();
    }
    return true;
  }
  /** Original accepted height dialog records a separate HMM request. @param twips - Height. @returns Recording request. */
  CompleteRowHeight(twips: number): SfxRequest {
    this.view.SetMarkedWidthOrHeight(false, ScSizeMode.SC_SIZE_DIRECT, twips & 0xffff);
    const request = new SfxRequest(26286);
    request.AppendItem(new SfxUInt16Item(26286, TwipsToEvenHMM(twips) & 0xffff));
    request.Done();
    return request;
  }
  /** Original row show/hide command. @param show - Visibility. @returns Nothing. */
  ShowRows(show: boolean): void {
    this.view.SetMarkedWidthOrHeight(
      false,
      show ? ScSizeMode.SC_SIZE_SHOW : ScSizeMode.SC_SIZE_DIRECT,
      0,
    );
  }
  /** Native typed width arguments use HMM and optional one-based Column;the explicit-column branch does not Done the source request. @param request - Real typed request. @param data - Native view data. @returns Whether typed width was present. */
  ExecuteColumnWidth(request: SfxRequest, data: ScViewData): boolean {
    const width = request
      .GetArgs()
      .find(
        /** Finds the native width identity. @param item - Source item. @returns Identity match. */ (
          item,
        ) => item.Which() === 26290,
      );
    if (!(width instanceof SfxUInt16Item)) return false;
    const column = request
        .GetArgs()
        .find(
          /** Finds FN_PARAM_1. @param item - Source item. @returns Identity match. */ (item) =>
            item.Which() === 21160,
        ),
      twips = Number(toTwips(BigInt(width.GetValue()), Length.mm100));
    if (column instanceof SfxUInt16Item) {
      const index = column.GetValue() - 1,
        marks = data.GetMarkData();
      this.view.SetWidthOrHeight(
        true,
        marks.IsColumnMarked(index) ? marks.GetMarkedColSpans() : [new ColRowSpan(index, index)],
        ScSizeMode.SC_SIZE_DIRECT,
        twips,
      );
    } else {
      this.view.SetMarkedWidthOrHeight(true, ScSizeMode.SC_SIZE_DIRECT, twips);
      if (!request.IsAPI()) request.Done();
    }
    return true;
  }
  /** Native accepted-dialog path constructs a separate completed HMM request after applying twips. @param twips - Native metric result. @returns Actual recording request;recorder services remain unported. */
  CompleteColumnWidth(twips: number): SfxRequest {
    this.view.SetMarkedWidthOrHeight(true, ScSizeMode.SC_SIZE_DIRECT, twips & 0xffff);
    const request = new SfxRequest(26290);
    request.AppendItem(new SfxUInt16Item(26290, TwipsToEvenHMM(twips) & 0xffff));
    request.Done();
    return request;
  }
  /** Original show/hide commands retain stored widths. @param show - Show versus hide. @returns Nothing. */
  ShowColumns(show: boolean): void {
    this.view.SetMarkedWidthOrHeight(
      true,
      show ? ScSizeMode.SC_SIZE_SHOW : ScSizeMode.SC_SIZE_DIRECT,
      0,
    );
  }
  /** Original SID_CELL_FORMAT_RESET passes both HARDATTR and EDITATTR,without replacing values by pool defaults. @returns Operation result. */
  ResetAttributes(): boolean {
    return this.view.DeleteContents(InsertDeleteFlags.HARDATTR | InsertDeleteFlags.EDITATTR);
  }
}
