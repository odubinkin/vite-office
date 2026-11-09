/** @fileoverview Feeds buffered RTF row/cell sprms through actual Writer table mapper and UNO format owners. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import type { SwTable } from "../../core/table/swtable";
import { SwXCell, SwXTextTable } from "../../core/unocore/unotbl";
import {
  DomainMapperTableManager,
  GetTableGridSeparators,
} from "../dmapper/DomainMapperTableManager";
import {
  ApplyHorizontalMerges,
  ApplyVerticalMergeBorders,
  CollectHorizontalMerge,
  type HorizontallyMergedCell,
} from "../dmapper/DomainMapperTableHandler";
import {
  ApplyVerticalMerges,
  CollectVerticalMerge,
  type VerticallyMergedCell,
} from "../../core/unocore/unotext";
import { scalar, text } from "../../core/unocore/unocrsrhelper";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import type { RtfDocumentImplContext, RtfTableRow } from "./rtfdocumentimpl.context";
import type { SwDoc } from "../../core/doc/doc";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { createRtfBorderLine } from "./rtfdocumentimpl.border";
import { RTFSprm } from "./rtfsprm";

const COL_DFLT_WIDTH = 41;

/** Original prepareProperties cell-width correction over the actual CELLX snapshots. @param row - Native row values. @returns Source grid widths. */
function PrepareRtfTableGrid(row: RtfTableRow): number[] {
  const grid: number[] = [];
  let prior = row.left;
  let positive = false;
  for (const boundary of row.boundaries) {
    let width = boundary - prior;
    if (width > 0) positive = true;
    else if (positive) width = COL_DFLT_WIDTH;
    grid.push(width);
    prior = boundary;
  }
  return grid;
}

/** Replays native buffered table properties after creating actual Writer cells. @param table - Original table. @param rows - Actual source rows and cell properties. @returns Nothing. */
export function ApplyRtfTableProperties(table: SwTable, rows: readonly RtfTableRow[]): void {
  const manager = new DomainMapperTableManager();
  const merges: VerticallyMergedCell[] = [];
  const horizontalMerges: HorizontallyMergedCell[] = [];
  const mergeRows: (boolean | undefined)[][] = [];
  try {
    for (const [rowIndex, row] of rows.entries()) {
      const mergeRow: (boolean | undefined)[] = [];
      mergeRows.push(mergeRow);
      let separators: number[] | undefined;
      for (const [id, value] of row.rowSprms) manager.sprm(new RTFSprm(id, value));
      const boxes = table.GetTabLines()[rowIndex]?.GetTabBoxes();
      for (const [cellIndex, box] of (boxes ?? []).entries()) {
        const source = row.cellSprms[cellIndex];
        if (source !== undefined)
          for (const [id, value] of source) manager.sprm(new RTFSprm(id, value));
        const cell = manager.takeCellProperties();
        try {
          CollectHorizontalMerge(horizontalMerges, cell, rowIndex, cellIndex);
          const properties = cell.GetPropertyValues();
          if (properties.length !== 0) {
            const uno = new SwXCell(box);
            try {
              for (const property of properties) {
                if (text(property.Name) === "VerticalMerge") {
                  const restart = scalar(property.Value, "bool") as boolean;
                  mergeRow[cellIndex] = restart;
                  separators ??= GetTableGridSeparators(PrepareRtfTableGrid(row));
                  const left = cellIndex === 0 ? 0 : (separators[cellIndex - 1] ?? -1);
                  CollectVerticalMerge(merges, box, left, restart);
                } else uno.setPropertyValue(property.Name, property.Value);
              }
            } finally {
              uno.dispose();
            }
          }
        } finally {
          cell.dispose();
        }
      }
      manager.endOfRowAction();
    }
    ApplyVerticalMergeBorders(table, mergeRows);
    ApplyVerticalMerges(merges);
    const tableProperties = manager.getTableProps(),
      defaultDirection = new Any([WritingMode2.CONTEXT], "sal_Int16");
    try {
      tableProperties.Insert(P.PROP_WRITING_MODE, defaultDirection, false);
    } finally {
      defaultDirection.dispose();
    }
    const uno = new SwXTextTable(table);
    for (const property of tableProperties.GetPropertyValues())
      uno.setPropertyValue(property.Name, property.Value);
    ApplyHorizontalMerges(table, horizontalMerges);
  } finally {
    manager.dispose();
  }
}

/** Replays completed original row buffers into connected Writer sections in cell order. @param this - Actual reader. @param document - Native document. @param table - Connected table. @param rows - Buffered rows. @returns Nothing. */
export function MaterializeRtfTable(
  this: RtfDocumentImplContext,
  document: SwDoc,
  table: SwTable,
  rows: readonly RtfTableRow[],
): void {
  const firstRow = rows[0];
  if (firstRow !== undefined) {
    const format = table.GetFrameFormat();
    const orient = format.GetHoriOrient().Clone();
    orient.SetHoriOrient(
      firstRow.alignment === "center"
        ? HoriOrientation.CENTER
        : firstRow.alignment === "right"
          ? HoriOrientation.RIGHT
          : firstRow.left !== 0
            ? HoriOrientation.NONE
            : HoriOrientation.LEFT,
    );
    format.SetFormatAttr(orient);
    if (firstRow.left !== 0) {
      const lr = format.GetLRSpace().Clone();
      lr.SetLeft(SvxIndentValue.twips(firstRow.left));
      format.SetFormatAttr(lr);
    }
    if (firstRow.defaultPaddings.size > 0) {
      const item = format.GetBox().Clone();
      for (const [edge, value] of firstRow.defaultPaddings) item.SetDistance(value, edge);
      format.SetFormatAttr(item);
    }
  }
  const rightEdge = rows.reduce(
    /** Computes the maximum result. @param maximum - Maximum. @param row - Row. @returns The computed result. */ (
      maximum,
      row,
    ) => Math.max(maximum, (row.boundaries.at(-1) ?? 0) - row.left),
    0,
  );
  if (rightEdge > 0) {
    const size = table.GetFrameFormat().GetFrameSize().Clone();
    size.SetWidth(rightEdge);
    table.GetFrameFormat().SetFormatAttr(size);
  }
  for (const row of rows) {
    const line = document.nodes.AppendTableRow(table, row.cells.length);
    if (row.height !== 0) {
      const size = line.GetFrameFormat().GetFrameSize().Clone();
      size.SetHeight(Math.abs(row.height));
      size.SetHeightSizeType(row.height < 0 ? SwFrameSize.Fixed : SwFrameSize.Minimum);
      line.GetFrameFormat().SetFormatAttr(size);
    }
    if (!row.split) line.GetFrameFormat().SetFormatAttr(new SwFormatRowSplit(false));
    for (const [index, cell] of row.cells.entries()) {
      // AppendTableRow created exactly row.cells.length boxes before this bounded iteration.
      const box = line.GetTabBoxes()[index] as ReturnType<typeof line.GetTabBoxes>[number];
      const vertical = row.verticals[index];
      if (vertical !== undefined) {
        const item = box.GetVertOrient();
        item.SetVertOrient(vertical);
        box.ClaimFrameFormat().SetFormatAttr(item);
      }
      const borders = row.borders[index];
      if (borders !== undefined && borders.size > 0) {
        const item = box.GetBox();
        for (const [edge, border] of borders)
          item.SetLine(createRtfBorderLine(border, this["colors"]), edge);
        box.ClaimFrameFormat().SetFormatAttr(item);
      }
      const paddings = row.paddings[index];
      if (row.defaultPaddings.size > 0 || (paddings !== undefined && paddings.size > 0)) {
        const item = box.GetBox();
        for (const [edge, value] of row.defaultPaddings) item.SetDistance(value, edge);
        for (const [edge, value] of paddings ?? []) item.SetDistance(value, edge);
        box.ClaimFrameFormat().SetFormatAttr(item);
      }
      const right = row.boundaries[index];
      const left = index === 0 ? row.left : row.boundaries[index - 1];
      if (right !== undefined && left !== undefined && right > left) {
        const size = box.GetFrameSize();
        size.SetWidth(right - left);
        box.SetFrameSize(size);
      }
      const cellEnd = box.GetStartNode().EndOfSectionNode();
      let available = box.GetParagraphs()[0];
      for (const content of cell) {
        if ("rows" in content) {
          const nested = document.nodes.MakeTableNodeBefore(
            available ?? cellEnd,
            document.GetUniqueTableName(),
            {},
          );
          MaterializeRtfTable.call(this, document, nested, content.rows);
        } else {
          const paragraph = available ?? document.nodes.AppendTableCellParagraph(box);
          this["ApplyParagraph"](paragraph, content);
          available = undefined;
        }
      }
      const last = cell.at(-1);
      if (last && "rows" in last && !available) document.nodes.AppendTableCellParagraph(box);
    }
  }
  ApplyRtfTableProperties(table, rows);
  let repeatedRows = 0;
  for (const row of rows) {
    if (!row.header) break;
    if (repeatedRows === 10) {
      repeatedRows = 0;
      break;
    }
    repeatedRows++;
  }
  table.SetRowsToRepeat(repeatedRows);
}
