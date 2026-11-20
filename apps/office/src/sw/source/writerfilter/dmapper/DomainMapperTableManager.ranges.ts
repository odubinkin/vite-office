/** @fileoverview Binds original OOXML table boundary resources to Writer's native text-to-table conversion. */
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwXText } from "../../core/unocore/unotext";
import { SwXTextRange } from "../../core/unocore/unoobj2";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwTableNode, type SwNode } from "../../core/docnode/node";
import type { Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { DomainMapperTableManager, GetTableGridSeparators } from "./DomainMapperTableManager";
import { scalar, text } from "../../core/unocore/unocrsrhelper";
import type { SwTable, SwTableBox } from "../../core/table/swtable";
import { setCellProperty } from "../../core/unocore/unotbl";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { PropertyIds } from "./PropertyIds";
import {
  ApplyOOXMLTableDefaults,
  ApplyTableMargins,
  ApplyTableMeasures,
  ApplyTableStyle,
  ApplyTableInteropGrabBag,
  FinalizeTableFlowProperties,
  ResolveTableCellProperties,
  TableRowStyleMask,
} from "./DomainMapperTableHandler";
import type { TablePropertyMap } from "./PropertyMap";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { UNO_TABLE_COLUMN_SUM } from "../../../inc/swtypes";

/** Completed cell with its native endpoints and delayed property map. */
type Cell = { ranges: readonly SwXTextRange[]; span: number; properties?: TablePropertyMap };
/** Ordered completed cells and their original row properties and grid. */
type Row = { cells: Cell[]; properties: TablePropertyMap; grid: readonly number[] };

/** Creates the registered UNO endpoints consumed by the original conversion routine. @param body - Actual text owner. @param node - Paragraph. @param offset - Native content index. @returns Owned endpoint. */
function endpoint(body: SwXText, node: SwNode, offset = 0): SwXTextRange {
  const position = new SwPosition(node, offset);
  const selection = new SwPaM(position);
  try {
    return new SwXTextRange(selection, body);
  } finally {
    selection.Dispose();
    position.Dispose();
  }
}

/** Routes table events to the current native nesting level. */
export class DomainMapperTableRanges {
  private readonly levels: TableLevel[] = [];

  /** Attaches to the original mapper and text interface. @param body - Original destination text. @param mapper - Active source mapper. @returns Receiver. */
  constructor(
    private readonly body: SwXText,
    private readonly mapper: DomainMapper_Impl,
  ) {}

  /** Consumes table boundaries and forwards properties to the active level. @param modifier - Generated OOXML resource. @returns Whether consumed. */
  sprm(modifier: Sprm): boolean {
    const id = modifier.getId();
    if (id === N.LN_tblStart) {
      this.levels.push(new TableLevel(this.body));
      return true;
    }
    const current = this.levels.at(-1);
    if (!current) return false;
    if (id !== N.LN_tblEnd) return current.sprm(modifier);
    this.levels.pop();
    const table = current.convert(this.mapper, this.levels.length > 0);
    if (table) this.levels.at(-1)?.includeNestedTable(table.GetTableNode());
    return true;
  }

  /** Releases all incomplete table levels after a failed parse. @returns Nothing. */
  dispose(): void {
    while (this.levels.length) this.levels.pop()?.dispose();
  }
}

/** Holds one table's paragraph boundaries, table properties and completed rows. */
class TableLevel {
  private readonly manager = new DomainMapperTableManager();
  private readonly grid: number[] = [];
  private readonly rows: Row[] = [];
  private cells: Cell[] = [];
  private first: SwTextNode | SwTableNode | undefined;

  /** Binds one level to the existing import body. @param body - Native Writer text. @returns Table level. */
  constructor(private readonly body: SwXText) {}

  /** Retargets the start if a nested table occupies the first position in the parent cell. @param table - Converted table node. @returns Nothing. */
  includeNestedTable(table: SwTableNode): void {
    if (this.first?.FindTableNode() === table) this.first = table;
  }

  /** Consumes a table property or structural marker for this level. @param modifier - Current resource. @returns Whether consumed. */
  sprm(modifier: Sprm): boolean {
    const id = modifier.getId();
    switch (id) {
      case N.LN_tcStart:
        this.finishCellProperties();
        this.first = this.body.GetTextNodes().at(-1);
        return true;
      case N.LN_tcEnd:
        this.endCell();
        return true;
      case N.LN_tblRow:
        this.finishCellProperties();
        this.manager.endOfRowAction(this.grid);
        this.rows.push({
          cells: this.cells,
          properties: this.manager.takeRowProperties(),
          grid: this.grid.slice(),
        });
        this.grid.length = 0;
        this.cells = [];
        return true;
      case N.LN_CT_TcPrBase_gridSpan: {
        const cell = this.cells.at(-1);
        if (cell) cell.span = Math.max(1, modifier.getValue()?.getInt() ?? 1);
        return true;
      }
      case N.LN_CT_TblGridBase_gridCol:
        this.grid.push(modifier.getValue()?.getInt() ?? 0);
        return true;
      default:
        return this.manager.sprm(modifier);
    }
  }

  /** Closes the current cell at its last completed paragraph. @returns Nothing. */
  private endCell(): void {
    const first = this.first;
    if (!first) throw new Error("DOCX table cell has no start paragraph.");
    const nodes = this.body.GetDoc().GetNodes();
    const owner = this.body.GetStartNode();
    let content = nodes.GetSectionContent(owner);
    if (content.at(-1) === first) {
      this.body.finishParagraph([]).dispose();
      content = nodes.GetSectionContent(owner);
    }
    const last = content.at(-2);
    if (!last) throw new Error("DOCX table cell has no end paragraph.");
    const end = last instanceof SwTableNode ? last.EndOfSectionNode() : last;
    this.cells.push({
      ranges: [
        endpoint(this.body, first),
        endpoint(this.body, end, end instanceof SwTextNode ? end.Len() : 0),
      ],
      span: 1,
    });
    this.first = undefined;
  }

  /** Native cell properties arrive after the cell end marker. @returns Nothing. */
  private finishCellProperties(): void {
    const cell = this.cells.at(-1);
    if (cell && !cell.properties) cell.properties = this.manager.takeCellProperties();
  }

  /** Converts native text spans and applies row and cell property vectors. @param mapper - Original mapper owner. @param nested - Whether the parent level is still open. @returns Converted native table when the range has rows. */
  convert(mapper: DomainMapper_Impl, nested: boolean): SwTable | undefined {
    try {
      const properties = this.manager.getTableProps();
      const info = ApplyTableStyle(properties, mapper.GetStyleSheetTable());
      try {
        const applyStyle = info.style !== undefined || info.defaults.GetPropertyIds().length !== 0;
        for (const [rowIndex, row] of this.rows.entries()) {
          const header = row.properties.isSet(PropertyIds.PROP_TBL_HEADER);
          row.properties.Erase(PropertyIds.PROP_TBL_HEADER);
          if (!applyStyle) continue;
          const mask = TableRowStyleMask(info, rowIndex, this.rows.length, header);
          for (const [cellIndex, cell] of row.cells.entries()) {
            const direct = cell.properties;
            cell.properties = ResolveTableCellProperties(
              info,
              mask,
              cellIndex,
              row.cells.length,
              direct,
            );
            direct?.dispose();
          }
        }
      } finally {
        info.defaults.dispose();
      }
      const table = this.body.convertToTable(
        this.rows.map(
          /** Collects original cell endpoints. @param row - Completed row. @returns Endpoints. */ (
            row,
          ) =>
            row.cells.map(
              /** Borrows the cell endpoint values. @param cell - Completed cell. @returns Endpoints. */ (
                cell,
              ) => cell.ranges,
            ),
        ),
        this.rows.map(
          /** Builds the actual cell property vectors. @param row - Completed row. @returns Cell property vectors. */ (
            row,
          ) =>
            row.cells.map(
              /** Borrows the cell property vector. @param cell - Completed cell. @returns Properties. */ (
                cell,
              ) =>
                cell.properties
                  ?.GetPropertyValues()
                  .filter(
                    /** Native conversion applies merge groups after processing cell properties. @param property - Original property. @returns Direct cell property. */ (
                      property,
                    ) => text(property.Name) !== "VerticalMerge",
                  ) ?? [],
            ),
        ),
        this.rows.map(
          /** Borrows the row properties. @param row - Completed row. @returns Properties. */ (
            row,
          ) => row.properties.GetPropertyValues(),
        ),
        [],
      );
      if (table) {
        const first = this.rows[0]?.cells[0]?.properties;
        ApplyTableInteropGrabBag(table.table, properties);
        ApplyOOXMLTableDefaults(properties);
        ApplyTableMeasures(
          table.table,
          properties,
          first,
          nested,
          mapper.GetSettingsTable().GetWordCompatibilityMode(),
        );
        ApplyTableMargins(
          table.table,
          properties,
          first,
          /** Reads direct cell distances during the native table default pass. @param row - Row index. @param column - Source cell index. @returns Original cell properties. */
          (row, column) => this.rows[row]?.cells[column]?.properties,
        );
        FinalizeTableFlowProperties(table.table, properties);
        for (const property of properties.GetPropertyValues())
          table.setPropertyValue(property.Name, property.Value);
        this.applyGridAndMerge(table.table);
      }
      return table?.table;
    } finally {
      this.dispose();
    }
  }

  /** Applies the represented grid to original boxes and merges by their relative left edge. @param table - Connected Writer table. @returns Nothing. */
  private applyGridAndMerge(table: SwTable): void {
    const groups: { left: number; open: boolean; cells: SwTableBox[] }[] = [];
    for (const [rowIndex, line] of table.GetTabLines().entries()) {
      const row = this.rows[rowIndex];
      if (!row) continue;
      const boxes = line.GetTabBoxes();
      let edge = 0;
      const grid = row.cells.map(
        /** Combines the native grid slots occupied by one logical cell. @param cell - Cell range and span. @returns Twip width. */ (
          cell,
        ) => {
          let width = 0;
          const last = edge + cell.span;
          for (let slot = edge; slot < Math.min(last, row.grid.length); slot++)
            width += row.grid[slot] as number;
          edge = last;
          return width;
        },
      );
      const leftEdges = GetTableGridSeparators(row.grid.length ? grid : []);
      const tableSize = table.GetFrameFormat().GetFrameSize();
      const fixedWidth = tableSize.GetWidthPercent() === 0 ? tableSize.GetWidth() : 0;
      const setSeparators =
        fixedWidth > 0 &&
        grid.length === boxes.length &&
        row.grid.length > 0 &&
        edge === row.grid.length &&
        grid.every(
          /** Requires a complete positive grid before applying relative separators. @param width - Raw cell width. @returns Whether the cell occupies width. */
          (width) => width > 0,
        );
      let previous = 0;
      for (const [column, box] of boxes.entries()) {
        const boundary =
          column === boxes.length - 1
            ? fixedWidth
            : Math.trunc(((leftEdges[column] ?? 0) * fixedWidth) / UNO_TABLE_COLUMN_SUM);
        const width = setSeparators ? boundary - previous : grid[column];
        previous = boundary;
        if (width !== undefined && width > 0) {
          const size = box.GetFrameSize();
          try {
            size.SetWidth(width);
            box.SetFrameSize(size);
          } finally {
            size.Dispose();
          }
        }
        const merge = row.cells[column]?.properties?.getProperty(
          PropertyIds.PROP_VERTICAL_MERGE,
        )?.[1];
        if (!merge) continue;
        try {
          const left = column === 0 ? 0 : (leftEdges[column - 1] ?? -1);
          if (scalar(merge, "bool")) {
            for (const group of groups) if (Math.abs(group.left - left) < 2) group.open = false;
            groups.push({ left, open: true, cells: [box] });
          } else {
            for (const group of groups)
              if (group.open && Math.abs(group.left - left) < 2) group.cells.push(box);
          }
        } finally {
          merge.dispose();
        }
      }
    }
    for (const { cells } of groups) {
      if (cells.length < 2) continue;
      for (const [index, box] of cells.entries()) {
        const span = new Any([index === 0 ? cells.length : index - cells.length], "sal_Int32");
        const continuation = new Any(true);
        try {
          setCellProperty(box, "RowSpan", span);
          if (index) setCellProperty(box, "VerticalMerge", continuation);
        } finally {
          continuation.dispose();
          span.dispose();
        }
      }
    }
  }

  /** Releases saved endpoints and temporary property maps on success or failed import. @returns Nothing. */
  dispose(): void {
    for (const row of this.rows) {
      row.properties.dispose();
      this.disposeCells(row.cells);
    }
    this.disposeCells(this.cells);
    this.rows.length = this.grid.length = this.cells.length = 0;
    this.first = undefined;
    this.manager.dispose();
  }

  /** Releases one row's original temporary owners. @param cells - Row cells. @returns Nothing. */
  private disposeCells(cells: readonly Cell[]): void {
    for (const cell of cells) {
      for (const range of cell.ranges) range.dispose();
      cell.properties?.dispose();
    }
  }
}
