/** @fileoverview Actual browser dialog ownership for the lazy exchange-support tabulator page and accumulated output items. */
import { SfxItemSet } from "../../../svl/inc/itemset";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../editeng/inc/lrspitem";
import { SID_ATTR_LRSPACE, SID_ATTR_TABSTOP } from "../../../editeng/inc/editids";
import { FieldUnit } from "../../../tools/inc/fldunit";
import type { SvxTabulatorTabPage } from "../../source/tabpages/tabstpge";
import { createTabulatorPage } from "./tabstpge-binding";
/** Keeps the original page lazy and retains exchange output across tab switches; no general SfxTabDialog service is simulated. */
export class TabulatorDialogSession {
  private page?: SvxTabulatorTabPage;
  private focus: ((selectAll: boolean) => void) | undefined;
  readonly output: SfxItemSet;
  /** Borrows native input and module unit. @param input - Actual dialog input. @param unit - Current module display unit. @returns Session. */
  constructor(
    private readonly input: SfxItemSet,
    private readonly unit: FieldUnit,
  ) {
    this.output = new SfxItemSet(input.GetPool(), input.GetRanges());
  }
  /** Creates the native page only when visited. @returns Existing or newly reset controller. */
  Open(): SvxTabulatorTabPage {
    return (this.page ??= createTabulatorPage(
      this.input,
      this.unit,
      /** Delegates real entry focus after browser rendering. @param selectAll - Original selection operation. @returns Nothing. */
      (selectAll) => this.focus?.(selectAll),
    ));
  }
  /** Installs the currently mounted entry operation. @param focus - Actual browser operation. @returns Nothing. */
  SetFocus(focus?: (selectAll: boolean) => void): void {
    this.focus = focus;
  }
  /** Dispatches a real widget event outside React's state projection. @param action - Original handler and widget input assignments. @returns Nothing. */
  Run(action: (page: SvxTabulatorTabPage) => void): void {
    action(this.Open());
  }
  /** Exchanges the visited page against current indentation and retains only its own output item. @param firstLinePt - Current indent-page value. @returns Nothing. */
  Deactivate(firstLinePt: number): void {
    if (!this.page) return;
    const temporary = new SfxItemSet(this.input.GetPool(), this.input.GetRanges());
    const lrWhich = this.input.GetPool().GetWhichIDFromSlotID(SID_ATTR_LRSPACE);
    const lr = new SvxLRSpaceItem(lrWhich);
    lr.SetTextFirstLineOffset(SvxIndentValue.twips(Math.round(firstLinePt * 20)));
    temporary.Put(lr);
    this.page.DeactivatePage(temporary);
    const tabs = temporary.GetItemIfSet(
      this.input.GetPool().GetWhichIDFromSlotID(SID_ATTR_TABSTOP),
      false,
    );
    if (tabs) this.output.Put(tabs);
  }
}
