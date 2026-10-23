/** @fileoverview Consumed ScTabViewShell actual view ownership and default frame line from tabvwsh3.cxx/tabvwsh4.cxx/tabvwsh8.cxx/tabvwshf.cxx;native window/UNO services remain unported. */
import type { ScModule } from "../../../inc/scmod";
import { DoAutoSum, UseSubTotal } from "./tabvwshc";
import type { ScRangeList } from "../../../inc/rangelst";
import type { OpCode } from "../../../../formula/inc/opcode";
import type { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScViewOptions, ViewOption } from "../../../inc/viewopti";
import type { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { ScViewFunc } from "./viewfunc";
import { ScViewData } from "./viewdata";
import type { ScDocShell } from "../docshell/docsh";
import { SvxBorderLine, SvxBorderLineStyle } from "../../../../editeng/source/items/borderline";
import { COL_BLACK } from "../../../../tools/inc/color";
/** Native view-shell state persists across commands and is replaced with its actual document view. */
export class ScTabViewShell extends ScViewFunc {
  /** Original filtered-data command query for the represented document profile. @param ranges - Source ranges. @returns Subtotal requested. */
  UseSubTotal(ranges: ScRangeList): boolean {
    return UseSubTotal(this, ranges);
  }
  /** Original AutoSum command orchestration. @param rangeFinder - Native output. @param subtotal - Native output. @param code - Aggregate. @returns Owned input-line formula. */
  DoAutoSum(rangeFinder: [boolean], subtotal: [boolean], code: OpCode): OUString {
    return DoAutoSum(this, rangeFinder, subtotal, code);
  }
  /** Consumed original tabvwsh3 FID_TOGGLEHEADERS request case;RepeatResize is projected by the browser owner. @param request - Native request. @returns Nothing. */
  ToggleHeaders(request: SfxRequest): void {
    const data = this.GetViewData(),
      slot = request.GetSlot(),
      item = request
        .GetArgs()
        .find(
          /** Finds the slot's original typed item. @param value - Argument. @returns Match. */ (
            value,
          ) => value.Which() === slot,
        );
    const visible = item instanceof SfxBoolItem ? item.GetValue() : !data.IsHeaderMode();
    data.SetHeaderMode(visible);
    request.AppendItem(new SfxBoolItem(slot, visible));
    request.Done();
  }
  /** Consumed original tabvwsh3 FID_TOGGLEFORMULA request case;document options receive the complete represented view copy. @param request - Native request. @returns Nothing. */
  ToggleFormula(request: SfxRequest): void {
    const data = this.GetViewData(),
      slot = request.GetSlot(),
      options = new ScViewOptions(data.GetOptions()),
      item = request
        .GetArgs()
        .find(
          /** Finds the slot's original typed item. @param value - Argument. @returns Match. */ (
            value,
          ) => value.Which() === slot,
        );
    const visible =
      item instanceof SfxBoolItem ? item.GetValue() : !options.GetOption(ViewOption.FORMULAS);
    options.SetOption(ViewOption.FORMULAS, visible);
    data.SetOptions(options);
    data.GetDocument().SetViewOptions(options);
    request.AppendItem(new SfxBoolItem(slot, visible));
    request.Done();
  }
  /** Consumed original tabvwshf FID_TAB_TOGGLE_GRID case ignores request arguments,updates only the current sheet and marks the document modified. @param request - Native request. @returns Nothing. */
  ToggleSheetGrid(request: SfxRequest): void {
    const data = this.GetViewData();
    data.SetShowGrid(!data.GetShowGrid());
    this.viewShellDoc.SetDocumentModified();
    request.Done();
  }
  private pCurFrameLine: SvxBorderLine | undefined = new SvxBorderLine(
    COL_BLACK,
    20,
    SvxBorderLineStyle.SOLID,
  );
  /** Binds actual source view data and shell. @param viewShellDoc - Document shell. @param module - Actual active input reference receiver. @returns View shell. */
  constructor(
    private readonly viewShellDoc: ScDocShell,
    module: ScModule | null = null,
  ) {
    const data = new ScViewData(viewShellDoc.GetDocument());
    super(data, viewShellDoc, module);
    // Native pView constructor initialization follows super because JavaScript forbids this before the base constructor.
    data["pView"] = this;
  }
  /** Original borrowed frame-line pointer. @returns Actual default line or absence. */
  GetDefaultFrameLine(): SvxBorderLine | undefined {
    return this.pCurFrameLine;
  }
  /** Original tabvwsh8 recreation copies only color,width and style. @param line - New default or absence. @returns Nothing. */
  SetDefaultFrameLine(line: SvxBorderLine | undefined): void {
    this.pCurFrameLine = line
      ? new SvxBorderLine(line.GetColor(), line.GetWidth(), line.GetBorderLineStyle())
      : undefined;
  }
}
