/** @fileoverview HTMLTable::FixFrameFormat from htmltab.cxx for native content and container boxes. */
import { SvxBoxItem, SvxBoxItemLine as Edge } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLineStyle } from "../../../../editeng/source/items/borderline";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import * as H from "../../../inc/hintids";
import { MIN_BORDER_DIST } from "../../../inc/swtypes";
import type { SwTableBoxFormat } from "../../../inc/swtblfmt";
import { SwTableBoxNumFormat, SwTableBoxValue } from "../../core/attr/cellatr";
import type { SwTableBox } from "../../core/table/swtable";
import type { HTMLTable } from "./htmltab";

/** Original cell format publication and reusable-column cache. @param this - Actual HTML table. @param box - Actual new Writer box. @param row - First row. @param column - First column. @param rowSpan - Native format range. @param colSpan - Native width range. @param first - First content paragraph. @param last - Last content paragraph. @returns Nothing. */
export function FixFrameFormat(
  this: HTMLTable,
  box: SwTableBox,
  row: number,
  column: number,
  rowSpan: number,
  colSpan: number,
  first = true,
  last = true,
): void {
  const start = box.GetSttNd();
  if (start === null) {
    const format = box.ClaimFrameFormat();
    for (const which of [H.RES_BOX, H.RES_BACKGROUND, H.RES_VERT_ORIENT, H.RES_BOXATR_FORMAT])
      format.ResetFormatAttr(which);
    return;
  }
  const cell = this.GetCell(row, column);
  const sourceColumn = this["m_aColumns"][column];
  const sourceRow = this["m_aRows"][row];
  const endRow = this["m_aRows"][row + rowSpan - 1];
  const layout = this["m_xLayoutInfo"];
  if (!sourceColumn || !sourceRow || !endRow || !layout) throw new Error("assert(HTML box grid)");
  const item = cell.GetBoxItem();
  const brush = cell.GetBGBrush() ?? (rowSpan > 1 ? sourceRow.GetBGBrush() : null);
  const top = row === 0 && this["m_bTopBorder"] && first;
  const bottom = endRow.GetBottomBorder() && last;
  const outerBottom = bottom && row + rowSpan === this["m_nRows"];
  const innerBottom = bottom && !outerBottom;
  const emptyRows = bottom ? endRow.GetEmptyRows() : 0;
  const vertical = cell.GetVertOri();
  const numberFormat: [number] = [0];
  const numberValue: [number] = [0];
  const hasFormat = cell.GetNumFormat(numberFormat);
  const hasValue = hasFormat && cell.GetValue(numberValue);
  const reusable =
    colSpan === 1 && !top && !outerBottom && !emptyRows && !brush && !hasFormat && !item;
  const cached = reusable ? sourceColumn.GetFrameFormat(innerBottom, vertical) : null;
  if (cached !== null) {
    box.ChgFrameFormat(cached as SwTableBoxFormat);
    return;
  }
  const format = box.ClaimFrameFormat();
  if (item !== null) format.SetFormatAttr(item);
  else {
    const borders = new SvxBoxItem(H.RES_BOX);
    let set = this["m_nCellPadding"] > 0;
    let innerWidth = 0;
    for (let index = column; index < column + colSpan; ++index) {
      const value = layout.GetColumn(index);
      if (!value) throw new Error("assert(HTML layout column)");
      innerWidth += value.GetRelColWidth();
    }
    if (top) {
      borders.SetLine(this["m_aTopBorderLine"], Edge.TOP);
      set = true;
    }
    if (outerBottom) {
      borders.SetLine(this["m_aBottomBorderLine"], Edge.BOTTOM);
      set = true;
    } else if (innerBottom) {
      const line = this["m_aBorderLine"];
      if (emptyRows && !line.GetInWidth()) {
        const thick = line.Clone();
        thick.SetBorderLineStyle(SvxBorderLineStyle.SOLID);
        thick.SetWidth((line.GetOutWidth() * (emptyRows + 1)) & 65535);
        borders.SetLine(thick, Edge.BOTTOM);
      } else borders.SetLine(line, Edge.BOTTOM);
      set = true;
    }
    if (sourceColumn.m_bLeftBorder) {
      const line = column ? this["m_aBorderLine"] : this["m_aLeftBorderLine"];
      borders.SetLine(line, Edge.LEFT);
      innerWidth -= this["GetBorderWidth"](line);
      set = true;
    }
    if (this["m_bRightBorder"]) {
      const line = this["m_aRightBorderLine"];
      borders.SetLine(line, Edge.RIGHT);
      innerWidth -= this["GetBorderWidth"](line);
      set = true;
    }
    try {
      if (set) {
        const padding = this["m_nCellPadding"];
        const distance = 2 * padding <= innerWidth ? padding : (innerWidth / 2) & 65535;
        borders.SetAllDistances(distance || MIN_BORDER_DIST);
        format.SetFormatAttr(borders);
      } else format.ResetFormatAttr(H.RES_BOX);
    } finally {
      borders.Dispose();
    }
  }
  if (brush !== null) format.SetFormatAttr(brush);
  else format.ResetFormatAttr(H.RES_BACKGROUND);
  if (hasFormat && (hasValue || box.IsEmpty())) {
    const locked = format.GetDoc().GetNumberFormatter().IsTextFormat(numberFormat[0]);
    const text = locked
      ? null
      : start
          .GetNodes()
          .at(start.GetIndex() + 1)
          .GetTextNode();
    const align = text?.GetpSwAttrSet()?.GetItemIfSet(H.RES_PARATR_ADJUST, false);
    const adjust = align instanceof SvxAdjustItem ? align.GetAdjust() : SvxAdjust.End;
    const values = new SfxItemSet(format.GetAttrSet().GetPool(), [
      [H.RES_BOXATR_FORMAT, H.RES_BOXATR_VALUE],
    ]);
    if (locked) format.LockModify();
    try {
      values.Put(new SwTableBoxNumFormat(numberFormat[0]));
      if (hasValue) values.Put(new SwTableBoxValue(numberValue[0]));
      format.SetFormatAttrSet(values);
    } finally {
      if (locked) format.UnlockModify();
      values.Dispose();
    }
    if (text !== null && adjust !== SvxAdjust.End)
      text.SetAttr(new SvxAdjustItem(adjust, H.RES_PARATR_ADJUST));
  } else format.ResetFormatAttr(H.RES_BOXATR_FORMAT);
  if (vertical === V.NONE) format.ResetFormatAttr(H.RES_VERT_ORIENT);
  else format.SetFormatAttr(new SwFormatVertOrient(0, vertical));
  if (reusable) sourceColumn.SetFrameFormat(format, innerBottom, vertical);
}
