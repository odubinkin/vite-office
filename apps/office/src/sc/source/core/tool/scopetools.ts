/** @fileoverview Native scopetools.cxx grouping/listening scope state restoration over actual document owners. */
import type { ScDocument } from "../../../inc/document";
import type { ScColumn } from "../../../inc/column";
/** Original AutoCalcSwitch retains the actual document and the prior calculation policy. */
export class AutoCalcSwitch {
  private readonly mbOldValue: boolean;
  /** Original unconditional setter after capturing the same document's state. @param mrDoc - Actual document. @param autoCalc - Temporary calculation policy. @returns Scope. */
  constructor(
    private readonly mrDoc: ScDocument,
    autoCalc: boolean,
  ) {
    this.mbOldValue = mrDoc.GetAutoCalc();
    mrDoc.SetAutoCalc(autoCalc);
  }
  /** Original destructor restores the captured value through the native setter. @returns Nothing. */
  Dispose(): void {
    this.mrDoc.SetAutoCalc(this.mbOldValue);
  }
}
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

/** Original document-wide broadcaster deletion scope retains nested delay state. */
export class DelayDeletingBroadcasters {
  private readonly mOldValue: boolean;
  /** Captures native prior state before deferring removal. @param mDoc - Actual document. @returns Scope. */
  constructor(private readonly mDoc: ScDocument) {
    this.mOldValue = mDoc.IsDelayedDeletingBroadcasters();
    mDoc.EnableDelayDeletingBroadcasters(true);
  }
  /** Original valid-owner scope exit restores prior delay and flushes at the outer boundary. @returns Nothing. */
  Dispose(): void {
    this.mDoc.EnableDelayDeletingBroadcasters(this.mOldValue);
  }
}
