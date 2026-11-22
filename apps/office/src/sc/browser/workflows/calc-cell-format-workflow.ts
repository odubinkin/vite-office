/** @fileoverview Browser request bridge for ScTabViewShell::ExecuteCellFormatDlg. */
import { normalizeCommandShortcut } from "../../../framework/browser/accelerators/keymapping";
import type { SfxSlotDefinition } from "../../../sfx2/source/control/msg";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { NUMBERFORMAT_ENTRY_NOT_FOUND, SvNumFormatType } from "../../../svl/inc/zforlist";
import { SfxUInt32Item } from "../../../svl/source/items/intitem";
import { SvxLanguageItem } from "../../../editeng/source/items/textitem.language";
import { ATTR_LANGUAGE_FORMAT, ATTR_VALUE_FORMAT } from "../../inc/scitems";
import { ScMarkData } from "../../inc/markdata";
import { ScEditableTester } from "../../source/ui/docshell/editable";
import {
  FID_CELL_FORMAT,
  FORMAT_CELL_DIALOG,
  ScAttrDlg,
  type ScAttrDlgResult,
} from "../../source/ui/attrdlg/attrdlg";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Binds the original Format Cells slot. @returns Native slot definition. */
export function createCellFormatSlot(): SfxSlotDefinition<{
  readonly cellFormat: CalcCellFormatWorkflow;
}> {
  const resource = getCalcCommandResource(FORMAT_CELL_DIALOG);
  return {
    commandUrl: FORMAT_CELL_DIALOG,
    slotId: FID_CELL_FORMAT,
    label: resource.label,
    shortcuts: resource.shortcuts.map(normalizeCommandShortcut),
    /** Queries actual selection admission. @param target - Sheet view. @returns State. */
    getState: (target) => ({ enabled: target.cellFormat.CanOpen() }),
    /** Requests the native dialog. @param target - Sheet view. @param request - Original request. @returns Completion. */
    execute: (target, request) => target.cellFormat.Execute(request),
  };
}

/** Owns the active Format Cells request and applies the original typed set once. */
export class CalcCellFormatWorkflow {
  readonly dialogs = new SfxDialogController<ScAttrDlg, ScAttrDlgResult>();

  /** Borrows the view and modal admission. @param controller - Calc view controller. @param canOpen - Modal admission. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Reads original cell formatting admission without emitting an error during state queries. @returns Format Cells command state. */
  CanOpen(): boolean {
    if (!this.canOpen()) return false;
    const view = this.controller.viewData,
      doc = view.GetDocument(),
      marks = view.GetMarkData();
    return (
      marks.IsMarked() || marks.IsMultiMarked()
        ? ScEditableTester.CreateAndTestSelection(doc, marks)
        : ScEditableTester.CreateAndTestSelectedBlock(
            doc,
            view.GetCurX(),
            view.GetCurY(),
            view.GetCurX(),
            view.GetCurY(),
            marks,
          )
    ).IsFormatEditable();
  }

  /** Executes supplied attributes or opens the original async modeless request with modal presentation. @param request - Native slot request. @returns Whether changes were applied. */
  async Execute(request: SfxRequest): Promise<boolean> {
    if (!this.CanOpen() || !this.controller.Commit()) return false;
    const data = this.controller.viewData,
      doc = data.GetDocument();
    const marks = new ScMarkData(data.GetMarkData());
    const address = this.controller.Address(),
      tab = data.CurrentTabForData();
    const view = this.controller.GetViewShell();
    const model = new ScAttrDlg(data);
    try {
      if (request.GetArgs().length) {
        const changes = model.items.Clone(false),
          old = model.items.Clone(false);
        try {
          for (const item of request.GetArgs()) changes.Put(item);
          if (changes.Count()) view.ApplyAttributes(changes, old);
          request.Done();
          return changes.Count() !== 0;
        } finally {
          changes.Dispose();
          old.Dispose();
        }
      }
      const copy = new SfxRequest(request.GetSlot(), request.GetArgs(), request.GetCallMode());
      request.Ignore();
      const completion = await this.dialogs.Request(model);
      if (completion.kind !== "accepted") return false;
      const { items, format } = completion.result;
      try {
        if (
          data.GetDocument() !== doc ||
          this.controller.Address() !== address ||
          data.CurrentTabForData() !== tab ||
          !data.GetMarkData().GetMarkedRanges().equals(marks.GetMarkedRanges()) ||
          [...data.GetMarkData().GetSelectedTabs()].some(
            /** Detects a sheet selected after the modal opened. @param sheet - Current selection. @returns Difference. */
            (sheet) => !marks.GetSelectedTabs().has(sheet),
          ) ||
          data.GetMarkData().GetSelectCount() !== marks.GetSelectCount() ||
          !view.CheckSelectionFormatEditable(true)
        )
          return false;
        if (format) {
          const code = unicode(format.code);
          try {
            const formatter = model.formatter;
            const key: [number] = [formatter.GetEntryKey(code, format.language)];
            const check: [number] = [0];
            if (key[0] === NUMBERFORMAT_ENTRY_NOT_FOUND)
              formatter.PutEntry(code, check, [SvNumFormatType.ALL], key, format.language);
            if (check[0] || key[0] === NUMBERFORMAT_ENTRY_NOT_FOUND) return false;
            items.Put(new SfxUInt32Item(ATTR_VALUE_FORMAT, key[0]), true);
            items.Put(new SvxLanguageItem(format.language, ATTR_LANGUAGE_FORMAT), true);
          } finally {
            code.dispose();
          }
        }
        if (items.Count()) view.ApplyAttributes(items, model.items);
        copy.Done();
        return items.Count() !== 0;
      } finally {
        items.Dispose();
      }
    } finally {
      model.Dispose();
    }
  }

  /** Cancels the active cell dialog when the frame closes. @returns Nothing. */
  Close(): void {
    const active = this.dialogs.GetSnapshot();
    if (active) this.dialogs.Cancel(active.id);
  }
}
