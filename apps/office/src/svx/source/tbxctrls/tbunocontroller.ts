/** @fileoverview Consumed SvxFontSizeBox_Base acceptance/status/focus behavior from tbunocontroller.cxx over the real FontSizeBox and browser dispatch/focus ports. */
import type { FontSizeBox } from "../../../svtools/source/control/ctrlbox";
/** Original toolbox font-size controller value lifecycle; no UNO frame or service substitute. */
export class SvxFontSizeBox_Base {
  private m_bRelease = true;
  private m_aCurText = "";
  /** Retains the actual numeric owner and platform execution ports. @param widget - Original FontSizeBox. @param dispatch - Actual point-size command execution. @param focusDocument - Actual frame-container focus. @returns Controller. */
  constructor(
    readonly widget: FontSizeBox,
    private readonly dispatch: (points: number) => void,
    private readonly focusDocument: () => void,
  ) {
    widget.set_value(0);
    widget.set_active_or_entry_text("");
  }
  /** Original focus release flag is reset after Tab acceptance. @returns Nothing. */
  ReleaseFocus_Impl(): void {
    if (!this.m_bRelease) {
      this.m_bRelease = true;
      return;
    }
    this.focusDocument();
  }
  /** Original Select passes a float point height and releases focus before dispatch. @returns Nothing. */
  Select(): void {
    const points = Math.fround(Math.fround(this.widget.get_value()) / 10);
    this.ReleaseFocus_Impl();
    this.dispatch(points);
  }
  /** Original direct-pick distinction prevents dispatch on partial keystrokes. @param directPick - Actual list selection rather than entry modification. @returns Nothing. */
  SelectHdl(directPick: boolean): void {
    if (directPick) this.Select();
  }
  /** Original entry activation always selects. @returns Handled. */
  ActivateHdl(): boolean {
    this.Select();
    return true;
  }
  /** Original status assignment preserves text when its parsed value already matches. @param point - Tenths of a point. @param erase - Mixed/absent state. @returns Nothing. */
  statusChanged_Impl(point: number, erase: boolean): void {
    if (!erase) {
      if (this.widget.get_value() !== point) this.widget.set_value(point);
    } else {
      this.widget.set_value(-1);
      this.widget.set_active_or_entry_text("");
    }
    this.m_aCurText = this.widget.get_active_text();
  }
  /** Original scalable fill preserves numerical value and remembers the resulting escape text. @returns Nothing. */
  UpdateFont(): void {
    const value = this.widget.get_value();
    this.widget.Fill();
    this.widget.set_value(value);
    this.m_aCurText = this.widget.get_active_text();
  }
  /** Original Tab dispatches without stealing traversal; Escape restores last status text and leaves sidebar cancellation to its parent. @param key - Actual browser key. @param inSidebar - Actual placement. @returns Whether consumed. */
  DoKeyInput(key: string, inSidebar: boolean): boolean {
    if (key === "Tab") {
      this.m_bRelease = false;
      this.Select();
    } else if (key === "Escape") {
      this.widget.set_active_or_entry_text(this.m_aCurText);
      if (!inSidebar) {
        this.ReleaseFocus_Impl();
        return true;
      }
    }
    return false;
  }
  /** Original owner restores uncommitted text only after focus leaves the whole composite control. @param hasFocus - Whether a combo subwidget retains focus. @returns Nothing. */
  FocusOutHdl(hasFocus: boolean): void {
    if (!hasFocus) this.widget.set_active_or_entry_text(this.m_aCurText);
  }
}
