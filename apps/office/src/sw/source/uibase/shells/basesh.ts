/** @fileoverview Consumed SwBaseShell::ExecTextCtrl/GetTextCtrlState character boundary from basesh.cxx; native layout/readonly/auto-update services remain unrepresented. */
import type { SfxItemSet } from "../../../../svl/inc/itemset";
import type { SwPaM } from "../../core/crsr/pam";
import type { SwTextShellTarget } from "./textsh1";
/** UI shell delegates complete native items to original core owners. */
export class SwBaseShell {
  /** Binds the actual editing shell. @param target - Native owner. @returns Nothing. */
  public constructor(protected readonly target: SwTextShellTarget) {}
  /** Reads current native attribute state into the caller-owned set. @param state - Requested items. @returns Nothing. */
  public GetTextCtrlState(state: SfxItemSet): void {
    this.target.GetCurAttr(state);
  }
  /** Executes complete native character arguments through the editing shell. @param items - Request set. @param range - Optional retained native selection. @returns Whether selected content changed. */
  public ExecTextCtrl(items: SfxItemSet, range?: SwPaM): boolean {
    return this.target.SetAttrSet(items, undefined, range);
  }
}
