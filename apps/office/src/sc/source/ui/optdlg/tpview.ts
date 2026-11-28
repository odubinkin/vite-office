/** @fileoverview The represented Display controls of the native Calc View tab page. */
import { ScTpViewItem, ScViewOptions, ViewOption } from "../../../inc/viewopti";

/** View flags edited by the represented native Display group. */
export const viewDisplayOptions = [
  [ViewOption.FORMULAS, "Formulas"],
  [ViewOption.NULLVALS, "Zero values"],
  [ViewOption.FORMULAS_MARKS, "Formula indicator and hint"],
  [ViewOption.SYNTAX, "Value highlighting"],
] as const;

/** Owns the editable page values and the initial item used by Reset. */
export class ScTpContentOptions {
  readonly options: ScViewOptions;
  private readonly saved: ScViewOptions;

  /** Copies the current view item into the page. @param options - Initial native view options. @returns Page model. */
  constructor(options: ScViewOptions) {
    this.saved = new ScViewOptions(options);
    this.options = new ScViewOptions(options);
  }

  /** Restores the values loaded when the page opened. @returns Nothing. */
  Reset(): void {
    this.options.copy_assign(this.saved);
  }

  /** Emits the changed view options for application to the active view. @returns Changed options, if any. */
  FillItemSet(): ScTpViewItem | undefined {
    return this.options.equals(this.saved) ? undefined : new ScTpViewItem(this.options);
  }
}
