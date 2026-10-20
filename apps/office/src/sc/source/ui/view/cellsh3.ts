/** @fileoverview Consumed native ScCellShell SID_CELL_FORMAT_RESET command over the actual view function owner. */
import { ScViewFunc } from "./viewfunc";
import { InsertDeleteFlags, ScSizeMode, TwipsToEvenHMM } from "../../../inc/global";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import type { ScViewData } from "../inc/viewdata";
import { ColRowSpan } from "../../../inc/columnspanset";
/** Native cell-shell command boundary;shared browser dispatch performs the existing Sfx slot admission. */
export class ScCellShell {
  /** Borrows actual native view functions. @param view - Source view owner. @returns Cell shell. */
  constructor(private readonly view: ScViewFunc) {}
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
