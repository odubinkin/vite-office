/** @fileoverview Original SwHTMLTableLayoutColumn defaults and option/pass-value operations from htmltbl.cxx/htmltbl.hxx using the existing logical metric-number domain. */
import { MINLAY } from "../../../inc/swtypes";
/** Native column layout values; no text measurements or auto-layout pass is synthesized. */
export class SwHTMLTableLayoutColumn {
  private m_nMinNoAlign = MINLAY;
  private m_nMaxNoAlign = MINLAY;
  private m_nAbsMinNoAlign = MINLAY;
  private m_nMin = 0;
  private m_nMax = 0;
  private m_nAbsColWidth = 0;
  private m_nRelColWidth = 0;
  private m_nWidthOption: number;
  /** Original column-option constructor. @param width - Native uint16. @param m_bRelWidthOption - Original relative selector. @param m_bLeftBorder - Original border selector. @returns Column value. */
  constructor(
    width: number,
    private m_bRelWidthOption: boolean,
    private readonly m_bLeftBorder: boolean,
  ) {
    this.m_nWidthOption = width & 65535;
  }
  /** Original cell-width merge changes a nonzero option only for the same width family and a larger value. @param width - Native width. @param relative - Width family. @returns Nothing. */
  MergeCellWidthOption(width: number, relative: boolean): void {
    width &= 65535;
    if (
      !this.m_nWidthOption ||
      (relative === this.m_bRelWidthOption && this.m_nWidthOption < width)
    ) {
      this.m_nWidthOption = width;
      this.m_bRelWidthOption = relative;
    }
  }
  /** Original explicit width setter also selects relative mode. @param width - Native uint16. @returns Nothing. */
  SetWidthOption(width: number): void {
    this.m_nWidthOption = width & 65535;
    this.m_bRelWidthOption = true;
  }
  /** Original width option. @returns Width. */
  GetWidthOption(): number {
    return this.m_nWidthOption;
  }
  /** Original relative width option. @returns Selector. */
  IsRelWidthOption(): boolean {
    return this.m_bRelWidthOption;
  }
  /** Original independent maximum merge for the three provisional metrics. @param min - Minimum. @param max - Maximum. @param absolute - Absolute minimum. @returns Nothing. */
  MergeMinMaxNoAlign(min: number, max: number, absolute: number): void {
    this.m_nMinNoAlign = Math.max(this.m_nMinNoAlign, min);
    this.m_nMaxNoAlign = Math.max(this.m_nMaxNoAlign, max);
    this.m_nAbsMinNoAlign = Math.max(this.m_nAbsMinNoAlign, absolute);
  }
  /** Original provisional minimum. @returns Metric. */
  GetMinNoAlign(): number {
    return this.m_nMinNoAlign;
  }
  /** Original provisional maximum. @returns Metric. */
  GetMaxNoAlign(): number {
    return this.m_nMaxNoAlign;
  }
  /** Original provisional absolute minimum. @returns Metric. */
  GetAbsMinNoAlign(): number {
    return this.m_nAbsMinNoAlign;
  }
  /** Original pass reset leaves actual column widths and optionally width options unchanged. @param widthOption - Reset option fields as well. @returns Nothing. */
  ClearPass1Info(widthOption: boolean): void {
    this.m_nMinNoAlign = this.m_nMaxNoAlign = this.m_nAbsMinNoAlign = MINLAY;
    this.m_nMin = this.m_nMax = 0;
    if (widthOption) {
      this.m_nWidthOption = 0;
      this.m_bRelWidthOption = false;
    }
  }
  /** Original result assignment. @param min - Minimum. @param max - Maximum. @returns Nothing. */
  SetMinMax(min: number, max: number): void {
    this.m_nMin = min;
    this.m_nMax = max;
  }
  /** Original maximum setter. @param value - Metric. @returns Nothing. */
  SetMax(value: number): void {
    this.m_nMax = value;
  }
  /** Original additive minimum mutation. @param value - Metric. @returns Nothing. */
  AddToMin(value: number): void {
    this.m_nMin += value;
  }
  /** Original additive maximum mutation. @param value - Metric. @returns Nothing. */
  AddToMax(value: number): void {
    this.m_nMax += value;
  }
  /** Original minimum. @returns Metric. */
  GetMin(): number {
    return this.m_nMin;
  }
  /** Original maximum. @returns Metric. */
  GetMax(): number {
    return this.m_nMax;
  }
  /** Original absolute width setter. @param width - Native uint16. @returns Nothing. */
  SetAbsColWidth(width: number): void {
    this.m_nAbsColWidth = width & 65535;
  }
  /** Original absolute width. @returns Width. */
  GetAbsColWidth(): number {
    return this.m_nAbsColWidth;
  }
  /** Original relative width setter. @param width - Native uint16. @returns Nothing. */
  SetRelColWidth(width: number): void {
    this.m_nRelColWidth = width & 65535;
  }
  /** Original relative width. @returns Width. */
  GetRelColWidth(): number {
    return this.m_nRelColWidth;
  }
  /** Original left border. @returns Flag. */
  HasLeftBorder(): boolean {
    return this.m_bLeftBorder;
  }
}
