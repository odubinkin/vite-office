/** @fileoverview Consumed SwLineNumberingDlg reset,sensitivity and numeric acceptance from pinned linenum.cxx/linenumbering.ui;style/format/header-footer controls remain unrepresented. */
import type { SwLineNumberInfoValue } from "../../../inc/lineinfo";
/** Original represented dialog draft;document state remains owned by SwLineNumberInfo. */
export class SwLineNumberingDlg {
  private value: SwLineNumberInfoValue;
  /** Loads source controls,including the unknown-offset sentinel. @param value - Actual document settings. @returns Nothing. */
  public constructor(value: SwLineNumberInfoValue) {
    this.value = { ...value, posFromLeft: value.posFromLeft === 65535 ? 0 : value.posFromLeft };
    this.SetValue({});
  }
  /** Applies native control bounds while retaining inactive drafts. @param next - Actual entry/checkbox changes. @returns Nothing. */
  public SetValue(next: Partial<SwLineNumberInfoValue>): void {
    const value = { ...this.value, ...next };
    this.value = {
      ...value,
      countBy: Math.max(1, Math.min(1000, Math.round(value.countBy))),
      dividerCountBy: Math.max(0, Math.min(1000, Math.round(value.dividerCountBy))),
      posFromLeft: Math.max(0, Math.round(value.posFromLeft)),
    };
  }
  /** Returns independent represented control values. @returns Draft. */
  public QueryValue(): SwLineNumberInfoValue {
    return { ...this.value };
  }
  /** Original body sensitivity. @returns Whether numbering is enabled. */
  public LineOnOffHdl(): boolean {
    return this.value.paintLineNumbers;
  }
  /** Original separator interval sensitivity retains whitespace as actual text. @returns Whether interval is enabled. */
  public ModifyHdl(): boolean {
    return this.value.paintLineNumbers && this.value.divider.length > 0;
  }
  /** Returns source ushort acceptance without changing inactive drafts. @returns Accepted line-number value. */
  public OKHdl(): SwLineNumberInfoValue {
    return {
      ...this.value,
      posFromLeft: this.value.posFromLeft & 65535,
      countBy: this.value.countBy & 65535,
      dividerCountBy: this.value.dividerCountBy & 65535,
    };
  }
}
