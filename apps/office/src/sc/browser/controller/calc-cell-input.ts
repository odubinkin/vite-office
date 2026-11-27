/** @fileoverview Browser input activation and commit through the native Calc view function. */
import type { CalcViewController } from "./calc-view-controller";
import { ScInputMode } from "../../inc/global";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Commits actual scalar/formula input atomically through existing cell and history owners. @param this - Actual controller. @returns Accepted. */
export function Commit(this: CalcViewController): boolean {
  if (this.mode === ScInputMode.SC_INPUT_NONE) return true;
  this.shell.EnsureOpen();
  try {
    if (this.inputHandler.IsModified()) {
      if (/[\r\n]/u.test(this.inputText))
        throw new Error("Multiline entry is not supported by the Calc input line.");
      const pos = this.Position();
      const input = unicode(this.inputText);
      try {
        if (!this.GetViewShell().EnterData(pos.Col(), pos.Row(), pos.Tab(), input)) return false;
      } finally {
        input.dispose();
      }
    }
    this.inputHandler.SetMode(ScInputMode.SC_INPUT_NONE);
    this.inputHandler.ResetInputState();
    this.viewData.SetRefMode(false, 0);
    this.inputText = "";
    this.error = "";
    this["Changed"]();
    return true;
  } catch (error) {
    this.error = (error as Error).message;
    this["Changed"]();
    return false;
  }
}
