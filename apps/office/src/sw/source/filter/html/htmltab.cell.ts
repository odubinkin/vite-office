/** @fileoverview Original HTMLTableCell state, protection, output-reference queries and layout-cell creation from htmltab.cxx. */
import type { HTMLTableCnts } from "./htmltab.contents";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwHTMLTableLayoutCell } from "../../../inc/htmltbl";
/** Native cells share actual content/brush/box references, while SetProtected clones only its background brush. */
export class HTMLTableCell {
  private m_xContents: HTMLTableCnts | null = null;
  private m_xBGBrush: SvxBrushItem | null = null;
  private m_xBoxItem: SvxBoxItem | null = null;
  private m_nValue = 0;
  private m_nNumFormat = 0;
  private m_nRowSpan = 1;
  private m_nColSpan = 1;
  private m_nWidth = 0;
  private m_eVertOrient: number = V.NONE;
  private m_bProtected = false;
  private m_bRelWidth = false;
  private m_bHasNumFormat = false;
  private m_bHasValue = false;
  private m_bNoWrap = false;
  private mbCovered = false;
  /** Original full cell assignment resets protection but deliberately leaves an existing width option untouched. @param contents - Shared section chain. @param rowSpan - Native row span. @param colSpan - Native column span. @param vertical - Native orientation. @param brush - Shared actual brush. @param box - Shared actual box. @param hasFormat - Native presence flag. @param format - Native uint32 format ID. @param hasValue - Native presence flag. @param value - Original double. @param noWrap - Wrapping selector. @param covered - Covered-cell selector. @returns Nothing. */
  Set(
    contents: HTMLTableCnts | null,
    rowSpan: number,
    colSpan: number,
    vertical: number,
    brush: SvxBrushItem | null,
    box: SvxBoxItem | null,
    hasFormat: boolean,
    format: number,
    hasValue: boolean,
    value: number,
    noWrap: boolean,
    covered: boolean,
  ): void {
    this.m_xContents = contents;
    this.m_nRowSpan = rowSpan & 65535;
    this.m_nColSpan = colSpan & 65535;
    this.m_bProtected = false;
    this.m_eVertOrient = (vertical << 16) >> 16;
    this.m_xBGBrush = brush;
    this.m_xBoxItem = box;
    this.m_bHasNumFormat = hasFormat;
    this.m_bHasValue = hasValue;
    this.m_nNumFormat = format >>> 0;
    this.m_nValue = value;
    this.m_bNoWrap = noWrap;
    this.mbCovered = covered;
  }
  /** Original protection clears contents, copies only the background brush and resets spans. Width, numeric, box, orientation and wrapping fields remain. @returns Nothing. */
  SetProtected(): void {
    this.m_xContents = null;
    if (this.m_xBGBrush) this.m_xBGBrush = new SvxBrushItem(this.m_xBGBrush);
    this.m_nRowSpan = this.m_nColSpan = 1;
    this.m_bProtected = true;
  }
  /** Original shared-content assignment. @param contents - Actual chain. @returns Nothing. */
  SetContents(contents: HTMLTableCnts | null): void {
    this.m_xContents = contents;
  }
  /** Original shared-content borrow. @returns Native contents or null. */
  GetContents(): HTMLTableCnts | null {
    return this.m_xContents;
  }
  /** Original row-span assignment. @param span - Native uint16. @returns Nothing. */
  SetRowSpan(span: number): void {
    this.m_nRowSpan = span & 65535;
  }
  /** Original row-span query. @returns Span. */
  GetRowSpan(): number {
    return this.m_nRowSpan;
  }
  /** Original column-span assignment. @param span - Native uint16. @returns Nothing. */
  SetColSpan(span: number): void {
    this.m_nColSpan = span & 65535;
  }
  /** Original column-span query. @returns Span. */
  GetColSpan(): number {
    return this.m_nColSpan;
  }
  /** Original width family/value assignment. @param width - Native uint16. @param relative - Percent selector. @returns Nothing. */
  SetWidth(width: number, relative: boolean): void {
    this.m_nWidth = width & 65535;
    this.m_bRelWidth = relative;
  }
  /** Original background borrow. @returns Actual shared brush or null. */
  GetBGBrush(): SvxBrushItem | null {
    return this.m_xBGBrush;
  }
  /** Original box borrow. @returns Actual shared box or null. */
  GetBoxItem(): SvxBoxItem | null {
    return this.m_xBoxItem;
  }
  /** Original query always writes the output, independently of its returned presence flag. @param output - Native uint32 reference. @returns Presence. */
  GetNumFormat(output: [number]): boolean {
    output[0] = this.m_nNumFormat;
    return this.m_bHasNumFormat;
  }
  /** Original query always writes the output, independently of its returned presence flag. @param output - Native double reference. @returns Presence. */
  GetValue(output: [number]): boolean {
    output[0] = this.m_nValue;
    return this.m_bHasValue;
  }
  /** Original vertical orientation. @returns Value. */
  GetVertOri(): number {
    return this.m_eVertOrient;
  }
  /** Original used predicate returns content presence or protection, without requiring covered/value/width flags. @returns Used. */
  IsUsed(): boolean {
    return this.m_xContents !== null || this.m_bProtected;
  }
  /** Original independent cell-layout value retaining shared content-layout identity. @returns Actual native layout cell. */
  CreateLayoutInfo(): SwHTMLTableLayoutCell {
    return new SwHTMLTableLayoutCell(
      this.m_xContents?.CreateLayoutInfo() ?? null,
      this.m_nRowSpan,
      this.m_nColSpan,
      this.m_nWidth,
      this.m_bRelWidth,
      this.m_bNoWrap,
    );
  }
  /** Original covered-cell query. @returns Flag. */
  IsCovered(): boolean {
    return this.mbCovered;
  }
}
