/** @fileoverview Native HTMLTable materialization over its actual import grid and core SwTable graph. */
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { HoriOrientation as Hori } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { RES_BACKGROUND, RES_FRM_SIZE } from "../../../inc/hintids";
import { MINLAY } from "../../../inc/swtypes";
import { SwTableBoxStartNode, type SwStartNode } from "../../core/docnode/node";
import { SwTableBox, SwTableLine } from "../../core/table/swtable";
import type { HTMLTable } from "./htmltab";
import { HTMLTableCnts } from "./htmltab.contents";
import { FixFrameFormat } from "./htmltab.format";
import { InsertTableSection } from "./htmltab.sections";
import { SwHTMLParser } from "./swhtml";

/** Original box factory reuses the unique first box when its section matches. @param this - Actual HTML table. @param start - Actual cell start. @param upper - Actual row. @returns Core box. */
function NewTableBox(this: HTMLTable, start: SwStartNode, upper: SwTableLine): SwTableBox {
  if (this.m_xBox1?.GetSttNd() === start) {
    const box = this.m_xBox1;
    this.m_xBox1 = null;
    box.SetUpper(upper);
    return box;
  }
  const format = this["m_pBoxFormat"];
  if (!(start instanceof SwTableBoxStartNode) || format === null)
    throw new Error("assert(HTML table box start and format)");
  return new SwTableBox(format, start, upper);
}

/** Resets original reusable row size and brush items. @param line - Actual row format owner. @returns The claimed reusable format. */
function ResetLineFrameFormatAttrs(line: SwTableLine) {
  const format = line.ClaimFrameFormat();
  format.ResetFormatAttr(RES_FRM_SIZE);
  format.ResetFormatAttr(RES_BACKGROUND);
  return format;
}

/** Materializes a source content chain on the core box graph. @param this - Actual HTML table. @param upper - Row owner. @param contents - Native cell content. @param row - Start row. @param column - Start column. @param span - Column span. @returns Core box. */
function MakeTableBox(
  this: HTMLTable,
  upper: SwTableLine,
  contents: HTMLTableCnts,
  row: number,
  column: number,
  span: number,
): SwTableBox {
  const start = contents.GetStartNode();
  const lineFormat = this["m_pLineFormat"];
  const boxFormat = this["m_pBoxFormat"];
  const layout = this["m_xLayoutInfo"];
  if (!lineFormat || !boxFormat || !layout) throw new Error("assert(HTML table defaults)");
  let box: SwTableBox;
  if (!contents.Next() && start !== null) {
    box = NewTableBox.call(this, start, upper);
    contents.SetTableBox(box);
  } else {
    box = new SwTableBox(boxFormat, 0, upper);
    let first = true;
    for (let content: HTMLTableCnts | null = contents; content; content = content.Next()) {
      const section = content.GetStartNode();
      if (section !== null) {
        const line = new SwTableLine(this["m_pLineFrameFormatNoHeight"] ?? lineFormat, 0, box);
        this["m_pLineFrameFormatNoHeight"] ??= ResetLineFrameFormatAttrs(line);
        const leaf = NewTableBox.call(this, section, line);
        content.SetTableBox(leaf);
        FixFrameFormat.call(this, leaf, row, column, 1, span, first, content.Next() === null);
        line.AddBox(leaf);
        box.AddLine(line);
      } else {
        const child = content.GetTable();
        if (!child) throw new Error("assert(HTML table contents)");
        child["InheritVertBorders"](this, column, span);
        const absolute: [number] = [0];
        const relative: [number] = [0];
        layout.GetAvail(column, span, absolute, relative);
        child.MakeTable(
          box,
          absolute[0],
          relative[0],
          layout.GetLeftCellSpace(column, span),
          layout.GetRightCellSpace(column, span),
          layout.GetInhCellSpace(column, span),
        );
      }
      first = false;
    }
  }
  FixFrameFormat.call(this, box, row, column, 1, span);
  return box;
}

/** Reuses the first root row and splits the row after each source colspan. @param this - Actual HTML table. @param upper - Parent structural box or null. @param row - Original grid row. @returns Native row. */
function MakeTableLine(this: HTMLTable, upper: SwTableBox | null, row: number): SwTableLine {
  const lineFormat = this["m_pLineFormat"];
  const layout = this["m_xLayoutInfo"];
  const source = this["m_aRows"][row];
  if (!lineFormat || !layout || !source) throw new Error("assert(HTML table row)");
  const line =
    !upper && row === 0
      ? this.GetSwTable()?.GetTabLines()[0]
      : new SwTableLine(this["m_pLineFrameFormatNoHeight"] ?? lineFormat, 0, upper);
  if (!line) throw new Error("assert(HTML table first line)");
  const height = source.GetHeight();
  const brush = row > 0 || row + 1 < this["m_nRows"] ? source.GetBGBrush() : null;
  if (height || brush) {
    const format = ResetLineFrameFormatAttrs(line);
    if (height)
      format.SetFormatAttr(
        new SwFormatFrameSize(
          SwFrameSize.Minimum,
          0,
          height + this["GetTopCellSpace"](row) + this["GetBottomCellSpace"](row, 1),
        ),
      );
    if (brush) format.SetFormatAttr(brush);
  } else this["m_pLineFrameFormatNoHeight"] ??= ResetLineFrameFormatAttrs(line);
  for (let column = 0; column < this["m_nCols"];) {
    const cell = this.GetCell(row, column);
    const span = cell.GetColSpan();
    let split = column;
    while (split < this["m_nCols"] && this.GetCell(row, split).GetColSpan() !== 1) ++split;
    if (split + 1 - column !== span || split >= this["m_nCols"])
      throw new Error("assert(HTML table column split)");
    let rowSpan = cell.GetRowSpan();
    let contents = cell.GetContents();
    if (contents === null || cell.IsCovered()) {
      if (cell.IsCovered()) rowSpan = -rowSpan;
      const previous = this["GetPrevBoxStartNode"](row, column);
      const current = this["m_pParser"].m_xTable;
      if (!current) throw new Error("assert(current HTML table)");
      const start = InsertTableSection(this["m_pParser"], current, previous);
      if (!start) throw new Error("assert(HTML empty cell section)");
      contents = new HTMLTableCnts(start);
      const cellLayout = contents.CreateLayoutInfo();
      for (let index = column; index <= split; ++index) {
        const covered = layout.GetCell(row, index);
        if (!covered) throw new Error("assert(HTML layout cell)");
        this.GetCell(row, index).SetContents(contents);
        covered.SetContents(cellLayout);
        if (index === column && rowSpan < 0) covered.SetRowSpan(0);
      }
    }
    const box = MakeTableBox.call(this, line, contents, row, column, span);
    if (rowSpan !== 1) box.setRowSpan(rowSpan);
    line.AddBox(box);
    column = split + 1;
  }
  return line;
}

/** Original table width passes, row/box conversion and publication. @param this - Actual HTML table. @param upper - Containing structural box or null. @param absolute - Native browse width. @param relative - Native parent-relative width. @param left - Parent cell left space. @param right - Parent cell right space. @param inherited - Parent inherited space. @returns Nothing. */
export function MakeTable(
  this: HTMLTable,
  upper: SwTableBox | null,
  absolute: number,
  relative: number,
  left: number,
  right: number,
  inherited: number,
): void {
  if (!this["m_nRows"] || !this["m_nCols"] || this["m_nCurrentRow"] !== this["m_nRows"])
    throw new Error("assert(closed HTML table grid)");
  this["SetBorders"]();
  const layout = this.CreateLayoutInfo();
  layout.AutoLayoutPass1();
  layout.AutoLayoutPass2(absolute, relative, left, right, inherited);
  const table = this.GetSwTable();
  if (table === null) return; // Pinned MakeTable returns after the layout passes when there is no SwTable.
  const format = table.GetFrameFormat();
  const forced = this["m_bForceFrame"];
  const percent = this["m_bPercentWidth"];
  const width = this["m_nWidth"];
  const adjust = this["m_eTableAdjust"];
  const leftMargin = this["m_nLeftMargin"];
  const orientation = forced
    ? percent
      ? Hori.FULL
      : Hori.LEFT
    : adjust === A.Right
      ? Hori.RIGHT
      : adjust === A.Center
        ? Hori.CENTER
        : leftMargin
          ? Hori.LEFT_AND_WIDTH
          : Hori.LEFT;
  format.SetFormatAttr(new SwFormatHoriOrient(0, orientation));
  if (orientation === Hori.LEFT_AND_WIDTH) {
    const margins = format.GetLRSpace().Clone();
    margins.SetLeft(SvxIndentValue.twips(leftMargin));
    margins.SetRight(SvxIndentValue.twips(this["m_nRightMargin"]));
    try {
      format.SetFormatAttr(margins);
    } finally {
      margins.Dispose();
    }
  }
  if (percent && orientation !== Hori.FULL) {
    const size = format.GetFrameSize().Clone();
    size.SetWidthPercent(width & 255);
    format.LockModify();
    try {
      format.SetFormatAttr(size);
    } finally {
      format.UnlockModify();
      size.Dispose();
    }
  }
  const first = table.GetTabLines()[0];
  const bootstrap = first?.GetTabBoxes()[0];
  if (!first || !bootstrap) throw new Error("assert(HTML table bootstrap)");
  this.m_xBox1 = bootstrap;
  first.RemoveBox(bootstrap);
  this["m_pLineFormat"] = first.GetFrameFormat();
  this["m_pBoxFormat"] = bootstrap.GetFrameFormat();
  for (let row = 0; row < this["m_nRows"]; ++row) {
    const line = MakeTableLine.call(this, upper, row);
    if (upper) upper.AddLine(line);
    else if (row > 0) table.AddLine(line);
  }
  const height = this["m_nHeight"];
  if (this["m_nRows"] === 1 && height && table.GetTabLines().length === 1)
    first
      .ClaimFrameFormat()
      .SetFormatAttr(
        new SwFormatFrameSize(
          SwFrameSize.Minimum,
          0,
          Math.max(MINLAY, SwHTMLParser.ToTwips(height)),
        ),
      );
  const brush = this["GetBGBrush"]();
  if (brush) format.SetFormatAttr(brush);
  table.SetRowsToRepeat(this["m_nHeadlineRepeat"] & 65535);
  const fly = this.GetContext()?.GetFrameFormat();
  let inFly = Boolean(fly);
  if (fly && !width) {
    const explicit = this.GetTableAdjust(false);
    if (explicit !== A.Left && explicit !== A.Right) {
      const size = new SwFormatFrameSize(
        SwFrameSize.Variable,
        Math.min(layout.GetMin(), 65535),
        MINLAY,
      );
      size.SetWidthPercent(100);
      fly.SetFormatAttr(size);
      inFly = false;
    } else {
      layout.SetMustNotRecalc(true);
      if (fly.GetAnchor().GetAnchorNode()?.FindTableNode()) {
        fly.SetFormatAttr(
          new SwFormatFrameSize(SwFrameSize.Variable, Math.min(layout.GetMax(), 65535), MINLAY),
        );
        inFly = false;
      } else layout.SetMustNotResize(true);
    }
  }
  layout.SetMayBeInFlyFrame(inFly);
  layout.SetMustResize(percent || !width);
  if (first.GetTabBoxes().length) layout.SetWidths();
  table.SetHTMLTableLayout(layout);
}
