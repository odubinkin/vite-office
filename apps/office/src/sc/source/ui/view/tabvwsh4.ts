/** @fileoverview Consumed ScTabViewShell actual view ownership and default frame line from tabvwsh3.cxx/tabvwsh4.cxx/tabvwsh8.cxx/tabvwshf.cxx;native window/UNO services remain unported. */
import { SheetSplitMode } from "../../core/data/document.sheet-visibility";
import {
  FreezeSplitters,
  RemoveSplit,
  SplitAtCursor,
  type ScPaneCommand,
  type ScSplitDevice,
} from "./tabview";
import { SfxInt32Item } from "../../../../svl/source/items/intitem";
import type { Color } from "../../../../tools/inc/color";
import { CanHideTable } from "./viewfun2";
import type { ScModule } from "../../../inc/scmod";
import { DoAutoSum, UseSubTotal } from "./tabvwshc";
import type { ScRangeList } from "../../../inc/rangelst";
import type { OpCode } from "../../../../formula/inc/opcode";
import type { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScViewOptions, ViewOption } from "../../../inc/viewopti";
import type { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { ExecStyle, GetStyleState } from "./tabvwsha";
import { ScViewFunc } from "./viewfunc";
import { ScViewData } from "./viewdata";
import type { ScDocShell } from "../docshell/docsh";
import { SvxBorderLine, SvxBorderLineStyle } from "../../../../editeng/source/items/borderline";
import { COL_BLACK } from "../../../../tools/inc/color";
/** Native view-shell state persists across commands and is replaced with its actual document view. */
export class ScTabViewShell extends ScViewFunc {
  ExecStyle = ExecStyle.bind(null, this);
  GetStyleState = GetStyleState.bind(null, this);

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
  /** Queries the live per-sheet source splitter modes. @param mode - Mode to look for. @returns Whether either axis matches. */
  HasPaneMode(mode: SheetSplitMode): boolean {
    const layout = this.GetViewData().GetPaneLayout();
    return layout?.horizontalMode === mode || layout?.verticalMode === mode;
  }

  /** Queries source split and freeze menu activation. @param command - Pane slot kind. @returns Checked state for the native boolean commands. */
  GetPaneCommandState(command: ScPaneCommand): Readonly<{ enabled: boolean; checked?: boolean }> {
    if (command === "split" || command === "cursor") {
      const mode = command === "split" ? SheetSplitMode.NORMAL : SheetSplitMode.FIX;
      return { enabled: true, checked: this.HasPaneMode(mode) };
    }
    return { enabled: true };
  }

  /** Original MoveCursorEnd targets the editable side of each fixed splitter. @returns Cursor deltas for GoToStart. */
  MoveToStartDelta(): readonly [number, number] {
    const view = this.GetViewData(),
      layout = view.GetPaneLayout();
    const x = layout?.horizontalMode === SheetSplitMode.FIX ? layout.horizontalPosition : 0;
    const y = layout?.verticalMode === SheetSplitMode.FIX ? layout.verticalPosition : 0;
    view.ResetOldCursor();
    return [x - view.GetCurX(), y - view.GetCurY()];
  }

  /** Executes the native window split and freeze command family. @param kind - Source operation. @param device - Grid geometry. @param request - Source slot request. @returns Nothing. */
  ExecutePaneCommand(kind: ScPaneCommand, device: ScSplitDevice, request: SfxRequest): void {
    const view = this.GetViewData();
    const frozen = this.HasPaneMode(SheetSplitMode.FIX);
    if (kind === "split") {
      if (this.HasPaneMode(SheetSplitMode.NORMAL)) {
        RemoveSplit(view);
        if (frozen) this.viewShellDoc.SetDocumentModified();
      } else if (frozen) FreezeSplitters(view, device, false);
      else SplitAtCursor(view, device);
    } else if (kind === "cursor" && frozen) {
      RemoveSplit(view);
      this.viewShellDoc.SetDocumentModified();
    } else {
      const index = request.GetArgs().find(
        /** Finds the source FN_PARAM_1 index. @param item - Argument. @returns Match. */
        (item) => item.Which() === 21160,
      );
      FreezeSplitters(
        view,
        device,
        true,
        kind,
        index instanceof SfxInt32Item ? Math.max(0, index.GetValue()) : 1,
      );
      this.viewShellDoc.SetDocumentModified();
    }
    request.Done();
  }

  /** Source Hide state keeps at least one visible sheet. @returns Availability. */
  CanHideTable(): boolean {
    return CanHideTable(this);
  }

  /** Source Show state requires an ungrouped view and hidden sheets. @returns Availability. */
  CanShowTable(): boolean {
    const data = this.GetViewData(),
      doc = data.GetDocument();
    if (data.GetMarkData().GetSelectCount() > 1) return false;
    for (let tab = 0; tab < doc.GetTableCount(); tab++) if (!doc.IsVisible(tab)) return true;
    return false;
  }

  /** Source color state uses active-sheet protection. @returns Availability. */
  CanSetTabBgColor(): boolean {
    const data = this.GetViewData();
    return !data.GetDocument().IsTabProtected(data.GetTabNumber());
  }

  /** Original color dispatch applies to the current mark group, with protected targets omitted. @param color - Resolved color item. @returns Success. */
  SetTabBgColor(color: Readonly<Color>): boolean {
    if (!this.CanSetTabBgColor()) return false;
    const data = this.GetViewData(),
      marks = data.GetMarkData();
    const func = this.viewShellDoc.GetDocFunc(),
      doc = data.GetDocument();
    if (marks.GetSelectCount() <= 1)
      return func.SetTabBgColor(data.GetTabNumber(), color, true, false);
    const colors: { tab: number; newColor: Readonly<Color> }[] = [];
    for (const tab of marks.GetSelectedTabs()) {
      if (!doc.IsTabProtected(tab)) colors.push({ tab, newColor: color });
    }
    return func.SetTabBgColor(colors, false);
  }

  /** Original SID_SELECT_TABLES body uses the first visible requested sheet as fallback. @param tabs - Ordered requested sheet indices. @returns Nothing. */
  SelectTables(tabs: readonly number[]): void {
    const data = this.GetViewData(),
      doc = data.GetDocument(),
      marks = data.GetMarkData();
    const selected = tabs.map(
      /** Narrows the integer list item to native SCTAB. @param tab - Signed32 sequence entry. @returns Signed16 sheet. */
      (tab) => (tab << 16) >> 16,
    );
    const first = selected.find(
      /** Locates the first visible requested sheet. @param tab - Candidate index. @returns Whether visible. */
      (tab) => doc.IsVisible(tab),
    );
    if (first === undefined) return;
    marks.SetSelectedTabs(selected);
    if (!marks.GetTableSelect(data.CurrentTabForData())) this.SetTabNo(first);
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
    data.ReadCursorPositions();
    const document = data.GetDocument();
    if (document.GetTableCount()) {
      const active = document.GetVisibleTab();
      this.SetTabNo(document.FetchTable(active) ? active : 0, true);
    }
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
