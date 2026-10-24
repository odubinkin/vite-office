/** @fileoverview Native scopetools.cxx grouping/listening scope state restoration over actual document owners. */
import type { ScDocument } from "../../../inc/document";
import type { ScColumn } from "../../../inc/column";
/** Original grouping scope retains the previous actual document state. */
export class DelayFormulaGroupingSwitch {
  private readonly mbOldValue: boolean;
  /** Captures original state before setting the requested policy. @param mrDoc - Actual document. @param delay - Requested policy. @returns Scope. */
  constructor(
    private readonly mrDoc: ScDocument,
    delay: boolean,
  ) {
    this.mbOldValue = mrDoc.IsDelayedFormulaGrouping();
    mrDoc.DelayFormulaGrouping(delay);
  }
  /** Original explicit reset. @returns Nothing. */
  reset(): void {
    this.mrDoc.DelayFormulaGrouping(this.mbOldValue);
  }
  /** Original scope exit restores the same prior state. @returns Nothing. */
  Dispose(): void {
    this.mrDoc.DelayFormulaGrouping(this.mbOldValue);
  }
}
/** Original listening scope is column-specific and preserves nested state. */
export class DelayStartListeningFormulaCells {
  private readonly mbOldValue: boolean;
  /** Binds either the disabled scope form or original explicit-policy form. @param mColumn - Actual column. @param delay - Optional policy;omitting it leaves the owner unchanged. @returns Scope. */
  constructor(
    private readonly mColumn: ScColumn,
    delay?: boolean,
  ) {
    this.mbOldValue = mColumn.GetDoc().IsEnabledDelayStartListeningFormulaCells(mColumn);
    if (delay !== undefined) mColumn.GetDoc().EnableDelayStartListeningFormulaCells(mColumn, delay);
  }
  /** Original explicit activation. @returns Nothing. */
  set(): void {
    this.mColumn.GetDoc().EnableDelayStartListeningFormulaCells(this.mColumn, true);
  }
  /** Original destruction body restores the captured native state. @returns Nothing. */
  private ImplDestroy(): void {
    this.mColumn.GetDoc().EnableDelayStartListeningFormulaCells(this.mColumn, this.mbOldValue);
  }
  /** Explicit managed scope exit binds the native valid-owner restoration path. @returns Nothing. */
  Dispose(): void {
    this.ImplDestroy();
  }
}
