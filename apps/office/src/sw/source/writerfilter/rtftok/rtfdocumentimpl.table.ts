/** @fileoverview Feeds buffered RTF row/cell sprms through actual Writer table mapper and UNO format owners. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import type { SwTable } from "../../core/table/swtable";
import { SwXCell, SwXTextTable } from "../../core/unocore/unotbl";
import { DomainMapperTableManager } from "../dmapper/DomainMapperTableManager";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import type { RtfTableRow } from "./rtfdocumentimpl.context";
import { RTFSprm } from "./rtfsprm";

/** Replays native buffered direction properties after creating actual table cells. @param table - Original table. @param rows - Actual source rows and cell properties. @returns Nothing. */
export function ApplyRtfTableDirection(table: SwTable, rows: readonly RtfTableRow[]): void {
  const manager = new DomainMapperTableManager();
  try {
    for (const [rowIndex, row] of rows.entries()) {
      for (const [id, value] of row.rowSprms) manager.sprm(new RTFSprm(id, value));
      const boxes = table.GetTabLines()[rowIndex]?.GetTabBoxes();
      for (const [cellIndex, box] of (boxes ?? []).entries()) {
        const source = row.cellSprms[cellIndex];
        if (source !== undefined)
          for (const [id, value] of source) manager.sprm(new RTFSprm(id, value));
        const cell = manager.takeCellProperties();
        try {
          const properties = cell.GetPropertyValues();
          if (properties.length !== 0) {
            const uno = new SwXCell(box);
            try {
              for (const property of properties)
                uno.setPropertyValue(property.Name, property.Value);
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
  } finally {
    manager.dispose();
  }
}
