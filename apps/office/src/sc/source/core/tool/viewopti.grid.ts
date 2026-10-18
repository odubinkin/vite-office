/** @fileoverview Original complete ScGridOptions value/default/comparison responsibility over shared SvxOptionsGrid. */
import { SvxOptionsGrid } from "../../../../svx/inc/optgrid";
import { ScOptionsUtil } from "./optutil";
/** Native Calc drawing-grid options;construction deliberately retains common base defaults until SetDefaults. */
export class ScGridOptions extends SvxOptionsGrid {
  /** Original reset first assigns a fresh common-default value,then applies Calc geometry and division defaults. @returns Nothing. */
  SetDefaults(): void {
    SvxOptionsGrid.prototype.copy_assign.call(this, new ScGridOptions());
    if (ScOptionsUtil.IsMetricSystem()) {
      this.m_nFldDrawX = 1000;
      this.m_nFldDrawY = 1000;
    } else {
      this.m_nFldDrawX = 1270;
      this.m_nFldDrawY = 1270;
    }
    this.m_nFldDivisionX = 1;
    this.m_nFldDivisionY = 1;
  }
  /** Original seven-field payload equality reads raw inherited fields,not hidden getter APIs. @param source - Actual borrowed Calc options. @returns Equality. */
  equals(source: Readonly<ScGridOptions>): boolean {
    const other = source as ScGridOptions;
    return (
      this.m_nFldDrawX === other.m_nFldDrawX &&
      this.m_nFldDivisionX === other.m_nFldDivisionX &&
      this.m_nFldDrawY === other.m_nFldDrawY &&
      this.m_nFldDivisionY === other.m_nFldDivisionY &&
      this.m_bUseGridsnap === other.m_bUseGridsnap &&
      this.m_bSynchronize === other.m_bSynchronize &&
      this.m_bGridVisible === other.m_bGridVisible
    );
  }
}
