/** @fileoverview Original HTMLTableColumn width-family merging, borrowed six-slot format cache and layout values from htmltab.cxx. */
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { SwHTMLTableLayoutColumn } from "../../../inc/htmltbl";
/** Native column owns option fields and borrows actual frame formats. */
export class HTMLTableColumn {
  private m_bIsEndOfGroup = false;
  private m_nWidth = 0;
  private m_bRelWidth = false;
  private m_eAdjust = SvxAdjust.End;
  private m_eVertOri: number = V.TOP;
  private readonly m_aFrameFormats: (SwFrameFormat | null)[] = [null, null, null, null, null, null];
  m_bLeftBorder = false;
  /** Original width merge takes the maximum only within the same width family; changing family replaces the width. @param width - Native uint16. @param relative - Width family. @returns Nothing. */
  SetWidth(width: number, relative: boolean): void {
    width &= 65535;
    if (this.m_bRelWidth === relative) {
      if (width > this.m_nWidth) this.m_nWidth = width;
    } else this.m_nWidth = width;
    this.m_bRelWidth = relative;
  }
  /** Original adjustment setter. @param value - Native enum. @returns Nothing. */
  SetAdjust(value: SvxAdjust): void {
    this.m_eAdjust = value;
  }
  /** Original adjustment query. @returns Enum. */
  GetAdjust(): SvxAdjust {
    return this.m_eAdjust;
  }
  /** Original vertical orientation setter. @param value - Native signed16. @returns Nothing. */
  SetVertOri(value: number): void {
    this.m_eVertOri = (value << 16) >> 16;
  }
  /** Original TOP default sentinel. @returns Orientation. */
  GetVertOri(): number {
    return this.m_eVertOri;
  }
  /** Original group-end marker. @returns Nothing. */
  SetEndOfGroup(): void {
    this.m_bIsEndOfGroup = true;
  }
  /** Original group-end query. @returns Flag. */
  IsEndOfGroup(): boolean {
    return this.m_bIsEndOfGroup;
  }
  /** Original cache index treats CENTER/BOTTOM specially and every other value as slot zero within each border family. TOP's source diagnostic does not alter the release-mode index. @param border - Border family. @param vertical - Native orientation. @returns Native slot. */
  private static GetFrameFormatIdx(border: boolean, vertical: number): number {
    return (border ? 3 : 0) + (vertical === V.CENTER ? 1 : vertical === V.BOTTOM ? 2 : 0);
  }
  /** Original borrowed format assignment. @param format - Actual format or null. @param border - Border family. @param vertical - Native orientation. @returns Nothing. */
  SetFrameFormat(format: SwFrameFormat | null, border: boolean, vertical: number): void {
    this.m_aFrameFormats[HTMLTableColumn.GetFrameFormatIdx(border, vertical)] = format;
  }
  /** Original borrowed format lookup. @param border - Border family. @param vertical - Native orientation. @returns Actual format or null. */
  GetFrameFormat(border: boolean, vertical: number): SwFrameFormat | null {
    return this.m_aFrameFormats[HTMLTableColumn.GetFrameFormatIdx(border, vertical)] ?? null;
  }
  /** Original fresh native layout-column value. @returns Actual layout owner. */
  CreateLayoutInfo(): SwHTMLTableLayoutColumn {
    return new SwHTMLTableLayoutColumn(this.m_nWidth, this.m_bRelWidth, this.m_bLeftBorder);
  }
}
