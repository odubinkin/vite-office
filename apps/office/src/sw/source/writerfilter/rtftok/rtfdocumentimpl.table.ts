/** @fileoverview Feeds buffered RTF row/cell sprms through actual Writer table mapper and UNO format owners. */
import type { SwTable } from "../../core/table/swtable";
import { SwXCell, SwXTextTable } from "../../core/unocore/unotbl";
import {
  DomainMapperTableManager,
  GetTableGridSeparators,
} from "../dmapper/DomainMapperTableManager";
import {
  ApplyHorizontalMerges,
  ApplyTableMeasures,
  ApplyTableRowProperties,
  FinalizeTableFlowProperties,
  ApplyTableMargins,
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
import type { RtfDocumentImplContext, RtfTableRow } from "./rtfdocumentimpl.context";
import type { SwDoc } from "../../core/doc/doc";
import { createRtfBorderLine } from "./rtfdocumentimpl.border";
import type { TablePositionHandler } from "../dmapper/TablePositionHandler";
import { RTFSprm, RTFSprms } from "./rtfsprm";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import { putTableIndent } from "./rtfdispatchvalue.table";
import { RTFValue } from "./rtfvalue";

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

/** Builds the original effective row resource values without mutating the captured group. @param row - Native row snapshot. @returns Owned row property list. */
function PrepareTableRowProperties(row: RtfTableRow): RTFSprms {
  const sprms = new RTFSprms(row.rowSprms);
  const width = sprms.find(N.LN_CT_TblPrBase_tblW);
  const indent = sprms.find(N.LN_CT_TblPrBase_tblInd);
  try {
    if (!width.is()) {
      putNestedAttribute(sprms, N.LN_CT_TblPrBase_tblW, N.LN_CT_TblWidth_type, new RTFValue(3));
      putNestedAttribute(
        sprms,
        N.LN_CT_TblPrBase_tblW,
        N.LN_CT_TblWidth_w,
        new RTFValue((row.boundaries.at(-1) ?? 0) - row.left),
      );
    }
    if (row.left && !indent.is()) putTableIndent(sprms, row.left);
    return sprms;
  } finally {
    width.dispose();
    indent.dispose();
  }
}

/** Replays native buffered table properties after creating actual Writer cells. @param table - Original table. @param rows - Actual source rows and cell properties. @returns Nothing. */
export function ApplyRtfTableProperties(table: SwTable, rows: readonly RtfTableRow[]): void {
  const manager = new DomainMapperTableManager();
  const merges: VerticallyMergedCell[] = [];
  const horizontalMerges: HorizontallyMergedCell[] = [];
  const mergeRows: (boolean | undefined)[][] = [];
  try {
    for (const [index, row] of rows.entries()) {
      const rowProperties = PrepareTableRowProperties(row);
      try {
        for (const [id, value] of rowProperties) manager.sprm(new RTFSprm(id, value));
      } finally {
        rowProperties.dispose();
      }
      const resolved = manager.takeRowProperties();
      try {
        const line = table.GetTabLines()[index];
        if (line) ApplyTableRowProperties(line, resolved);
      } finally {
        resolved.dispose();
      }
      manager.endOfRowAction(PrepareRtfTableGrid(row));
    }
    const tableProperties = manager.getTableProps();
    ApplyTableMargins(table, tableProperties);
    for (const [rowIndex, row] of rows.entries()) {
      const mergeRow: (boolean | undefined)[] = [];
      mergeRows.push(mergeRow);
      let separators: number[] | undefined;
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
    }
    ApplyVerticalMergeBorders(table, mergeRows);
    ApplyVerticalMerges(merges);
    FinalizeTableFlowProperties(table, tableProperties);
    ApplyTableMeasures(table, tableProperties);
    const uno = new SwXTextTable(table);
    for (const property of tableProperties.GetPropertyValues())
      uno.setPropertyValue(property.Name, property.Value);
    ApplyHorizontalMerges(table, horizontalMerges);
  } finally {
    manager.dispose();
  }
}

/** A native positioned table awaiting conversion after its following paragraph has been built. */
export interface PendingRtfTableFrame {
  readonly table: SwTable;
  readonly position: TablePositionHandler;
}

/** Compares original row positions before handing each contiguous table to the native materializer. @param this - Original RTF reader. @param document - Native Writer owner. @param table - First connected table. @param rows - Buffered source rows. @param pending - Owned pending native fly conversions, absent in shape text. @returns Nothing. */
export function MaterializeRtfTable(
  this: RtfDocumentImplContext,
  document: SwDoc,
  table: SwTable,
  rows: readonly RtfTableRow[],
  pending: PendingRtfTableFrame[] | undefined,
): void {
  const manager = new DomainMapperTableManager();
  let from = 0;
  let current: TablePositionHandler | undefined;
  let target = table;

  /** Publishes one finished source table group and transfers its row position. @param reader - Native reader. @param end - Exclusive row index. @returns Nothing. */
  function finish(reader: RtfDocumentImplContext, end: number): void {
    MaterializeRtfTableGroup.call(reader, document, target, rows.slice(from, end), pending);
    if (current !== undefined) {
      pending?.push({ table: target, position: current });
      current = undefined;
    }
  }
  try {
    for (const [index, row] of rows.entries()) {
      if (pending !== undefined)
        for (const [id, value] of row.rowSprms) manager.resolvePositionSprm(new RTFSprm(id, value));
      const position = manager.takeRowPosition();
      try {
        if (
          index > from &&
          !(
            current === position ||
            (current !== undefined && position !== undefined && current.operatorEquals(position))
          )
        ) {
          finish(this, index);
          const boundary = document.nodes.at(
            target.GetTableNode().EndOfSectionNode().GetIndex() + 1,
          );
          target = document.nodes.MakeTableNodeBefore(boundary, document.GetUniqueTableName(), {});
          from = index;
        }
      } catch (error) {
        position?.dispose();
        throw error;
      }
      current?.dispose();
      current = position;
    }
    finish(this, rows.length);
  } finally {
    current?.dispose();
    manager.dispose();
  }
}

/** Replays one group of completed rows into native cell sections. @param this - Actual reader. @param document - Native document. @param table - Connected table. @param rows - Buffered rows. @param pending - Owned pending native fly conversions, absent in shape text. @returns Nothing. */
function MaterializeRtfTableGroup(
  this: RtfDocumentImplContext,
  document: SwDoc,
  table: SwTable,
  rows: readonly RtfTableRow[],
  pending: PendingRtfTableFrame[] | undefined,
): void {
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
    const widths = PrepareRtfTableGrid(row);
    const line = document.nodes.AppendTableRow(table, row.cells.length);
    for (const [index, cell] of row.cells.entries()) {
      // AppendTableRow created exactly row.cells.length boxes before this bounded iteration.
      const box = line.GetTabBoxes()[index] as ReturnType<typeof line.GetTabBoxes>[number];
      const borders = row.borders[index];
      if (borders !== undefined && borders.size > 0) {
        const item = box.GetBox();
        for (const [edge, border] of borders)
          item.SetLine(createRtfBorderLine(border, this["colors"]), edge);
        box.ClaimFrameFormat().SetFormatAttr(item);
      }
      const width = widths[index] ?? 0;
      if (width > 0) {
        const size = box.GetFrameSize();
        size.SetWidth(width);
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
          MaterializeRtfTable.call(this, document, nested, content.rows, pending);
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
}
