/** @fileoverview Browser-owned asynchronous presentation of the native Calc page-style dialogs. */
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxRequest } from "../../../sfx2/source/control/request";
import type { CalcViewController } from "../controller/calc-view-controller";
import {
  ApplyHeaderFooter,
  ApplyPageStyle,
  CreatePageStyleRequest,
  FillHeaderFieldData,
} from "../../source/ui/docshell/docsh4";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { ScHFEditDlg, StandaloneHeaderFooterLayout } from "../../source/ui/pagedlg/hfedtdlg";
import { ScStyleSaveData } from "../../source/ui/undo/undostyl";
import type { ScStyleDlgRequest, ScStyleDlgResult } from "../../source/ui/styleui/styledlg";

/** Retains and applies the native page style and standalone header/footer dialog requests. */
export class CalcPageStyleWorkflow {
  readonly headerFooterDialogs = new SfxDialogController<ScHFEditDlg, SfxItemSet>();
  readonly pageStyleDialogs = new SfxDialogController<ScStyleDlgRequest, ScStyleDlgResult>();

  /** Borrows the current browser session and its modal ownership check. @param controller - Actual Calc view controller. @param canOpen - Whether the session can open a dialog. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Opens the original Format Page slot on the active sheet's shared page style. @param request - Source Sfx request. @returns Completion. */
  async EditPageStyle(request: SfxRequest): Promise<void> {
    if (request.GetArgs().length || !this.controller.Commit()) return;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const name = document.GetPageStyle(view.CurrentTabForData());
    const style = document.GetStyleSheetPool()?.GetPageStyle(name, true);
    if (!style) return;
    const before = new ScStyleSaveData(style);
    const copy = new SfxRequest(request.GetSlot(), request.GetArgs(), request.GetCallMode());
    request.Ignore();
    let transferred = false;
    try {
      const completion = await this.pageStyleDialogs.Request(
        CreatePageStyleRequest(this.controller.shell, style, before, view.CurrentTabForData()),
      );
      if (completion.kind !== "accepted") return;
      try {
        if (this.controller.viewData.GetDocument() !== document) return;
        transferred = ApplyPageStyle(this.controller.shell, style, before, completion.result);
        if (transferred) copy.Done();
      } finally {
        completion.result.items.Dispose();
      }
    } finally {
      if (!transferred) before.items.Dispose();
    }
  }

  /** Reads original applicability from the active named page style. @returns Whether the command is available. */
  CanEditHeaderFooter(): boolean {
    if (!this.canOpen()) return false;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const tab = view.CurrentTabForData();
    if (!document.FetchTable(tab)) return false;
    const style = document.GetStyleSheetPool()?.GetPageStyle(document.GetPageStyle(tab));
    return !style || StandaloneHeaderFooterLayout(style.GetItemSet()) !== undefined;
  }

  /** Opens and applies the source standalone header/footer editor. @param request - Source request. @returns Completion. */
  async EditHeaderFooter(request: SfxRequest): Promise<void> {
    if (request.GetArgs().length || !this.CanEditHeaderFooter() || !this.controller.Commit())
      return;
    const view = this.controller.viewData;
    const document = view.GetDocument();
    const tab = view.CurrentTabForData();
    const name = document.GetPageStyle(tab);
    const style = document.GetStyleSheetPool()?.GetPageStyle(name, true);
    if (!style) return;
    const items = style.GetItemSet().Clone();
    const layout = StandaloneHeaderFooterLayout(items);
    if (!layout) {
      items.Dispose();
      return;
    }
    const shell = this.controller.shell;
    const model = new ScHFEditDlg(items, name, layout, FillHeaderFieldData(shell, tab));
    const copy = new SfxRequest(request.GetSlot(), request.GetArgs(), request.GetCallMode());
    request.Ignore();
    try {
      const result = await this.headerFooterDialogs.Request(model);
      if (result.kind !== "accepted") return;
      try {
        if (shell.GetDocument() !== document) return;
        ApplyHeaderFooter(shell, style, result.result);
        copy.Done();
      } finally {
        result.result.Dispose();
      }
    } finally {
      model.Dispose();
      items.Dispose();
    }
  }

  /** Cancels pending page requests during session teardown. @returns Nothing. */
  Close(): void {
    const headerFooter = this.headerFooterDialogs.GetSnapshot();
    if (headerFooter) this.headerFooterDialogs.Cancel(headerFooter.id);
    const style = this.pageStyleDialogs.GetSnapshot();
    if (style) this.pageStyleDialogs.Cancel(style.id);
  }
}
