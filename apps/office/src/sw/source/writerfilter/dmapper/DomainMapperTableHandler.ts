/** @fileoverview Original mapper merge collection and native cell border reconciliation. */
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import { SwXText } from "../../core/unocore/unotext";
import type { TablePositionHandler } from "./TablePositionHandler";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import type { SwTable, SwTableLine } from "../../core/table/swtable";
import { SwXTextTableCursor, SwXTextTableRow } from "../../core/unocore/unotbl";
import { scalar, stringValue, unicode } from "../../core/unocore/unocrsrhelper";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import { PropertyIds as P } from "./PropertyIds";
import { PropertyMap, TablePropertyMapTarget as T, TablePropertyMap } from "./PropertyMap";
import { TableStyleSheetEntry, type StyleSheetTable } from "./StyleSheetTable";
import { RES_FRMATR_GRABBAG } from "../../../inc/hintids";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";

const DEF_BORDER_DIST = 190;

/** Supplies the original Word default distances after style and direct properties. @param properties - Merged table properties. @returns Nothing. */
export function ApplyOOXMLTableDefaults(properties: TablePropertyMap): void {
  const current: [number] = [0];
  for (const target of [T.CELL_MAR_LEFT, T.CELL_MAR_RIGHT])
    if (!properties.getValue(target, current)) properties.setValue(target, DEF_BORDER_DIST);
}

const FIRST_ROW = 0x800;
const LAST_ROW = 0x400;
const FIRST_COLUMN = 0x200;
const LAST_COLUMN = 0x100;

/** Native table-style inputs shared by all cells in the same table. */
interface TableInfo {
  look: number;
  style?: TableStyleSheetEntry;
  defaults: PropertyMap;
}

/** Cell properties that are applied to the original Writer box. */
const templateCellProperties = [
  P.PROP_BACK_COLOR,
  P.PROP_CELL_INTEROP_GRAB_BAG,
  P.PROP_VERT_ORIENT,
  P.PROP_LEFT_BORDER,
  P.PROP_RIGHT_BORDER,
  P.PROP_TOP_BORDER,
  P.PROP_BOTTOM_BORDER,
  P.PROP_LEFT_BORDER_DISTANCE,
  P.PROP_RIGHT_BORDER_DISTANCE,
  P.PROP_TOP_BORDER_DISTANCE,
  P.PROP_BOTTOM_BORDER_DISTANCE,
] as const;

/** Resolves inherited style geometry before applying direct table properties. @param properties - Direct table map. @param styles - Original stylesheet table. @returns Cell resolution inputs with owned defaults. */
export function ApplyTableStyle(properties: TablePropertyMap, styles: StyleSheetTable): TableInfo {
  const lookProperty = properties.getProperty(P.PROP_TBL_LOOK)?.[1];
  let look = 0x4a0;
  try {
    if (lookProperty) look = scalar(lookProperty, "sal_Int32") as number;
  } finally {
    lookProperty?.dispose();
    properties.Erase(P.PROP_TBL_LOOK);
  }
  const info: TableInfo = { look, defaults: new PropertyMap() };
  const style = properties.getProperty(P.META_PROP_TABLE_STYLE_NAME)?.[1];
  if (!style) return info;
  const value: [number] = [0];
  try {
    const entry = styles.FindStyleSheetByISTD(stringValue(style));
    if (!entry) return info;
    if (entry instanceof TableStyleSheetEntry) {
      info.style = entry;
      for (const [bit, condition] of [
        [0x020, FIRST_ROW],
        [0x040, LAST_ROW],
        [0x080, FIRST_COLUMN],
        [0x100, LAST_COLUMN],
      ] as const) {
        if (info.look & bit && !entry.Has(condition)) info.look &= ~bit;
      }
    }
    if (info.style && info.look & 0x020) {
      const firstRow = info.style.GetProperties(FIRST_ROW);
      try {
        const header = firstRow.getProperty(P.PROP_HEADER_ROW_COUNT)?.[1];
        try {
          if (header) properties.Insert(P.PROP_HEADER_ROW_COUNT, header, false);
        } finally {
          header?.dispose();
        }
      } finally {
        firstRow.dispose();
      }
    }
    const merged = entry.GetMergedInheritedProperties(styles);
    try {
      CopyTableCellStyleProperties(info.defaults, merged);
      for (const [id, target] of [
        [P.PROP_LEFT_MARGIN, T.LEFT_MARGIN],
        [P.META_PROP_CELL_MAR_LEFT, T.CELL_MAR_LEFT],
        [P.META_PROP_CELL_MAR_RIGHT, T.CELL_MAR_RIGHT],
        [P.META_PROP_CELL_MAR_TOP, T.CELL_MAR_TOP],
        [P.META_PROP_CELL_MAR_BOTTOM, T.CELL_MAR_BOTTOM],
      ] as const) {
        if (properties.getValue(target, value)) continue;
        const property = merged.getProperty(id)?.[1];
        try {
          if (property?.extract(value, "sal_Int32")) properties.setValue(target, value[0]);
        } finally {
          property?.dispose();
        }
      }
    } finally {
      merged.dispose();
    }
    return info;
  } catch (error) {
    info.defaults.dispose();
    throw error;
  } finally {
    style.dispose();
  }
}

/** Copies the represented cell portion of an original table property map. @param target - Cell map. @param source - Table or conditional map. @returns Nothing. */
function CopyTableCellStyleProperties(target: PropertyMap, source: PropertyMap): void {
  for (const id of templateCellProperties) {
    const value = source.getProperty(id)?.[1];
    if (!value) continue;
    try {
      target.Insert(id, value);
    } finally {
      value.dispose();
    }
  }
}

/** Determines the native row condition for the cell masks in this row. @param info - Resolved table style. @param row - Source row index. @param rowCount - Number of source rows. @param header - Original explicit header marker. @returns Row condition mask. */
export function TableRowStyleMask(
  info: TableInfo,
  row: number,
  rowCount: number,
  header: boolean,
): number {
  if (header || (row === 0 && info.look & 0x020)) return FIRST_ROW;
  if (row > 0 && row === rowCount - 1 && info.look & 0x040) return LAST_ROW;
  if (info.look & 0x200) return 0;
  return (row + 1 + Number(Boolean(info.look & 0x020))) & 1 ? 0x020 : 0x010;
}

/** Layers table defaults, native row/column conditions and direct cell properties. @param info - Resolved table style. @param rowMask - Source row mask. @param cell - Cell index in this row. @param cellCount - Source row cell count. @param direct - Native direct cell properties. @returns Owned cell map. */
export function ResolveTableCellProperties(
  info: TableInfo,
  rowMask: number,
  cell: number,
  cellCount: number,
  direct: TablePropertyMap | undefined,
): TablePropertyMap {
  const properties = new TablePropertyMap();
  try {
    properties.InsertProps(info.defaults);
    if (info.style) {
      let cellMask = 0;
      if (cell === 0 && info.look & 0x080) cellMask = FIRST_COLUMN;
      else if (cell > 0 && cell === cellCount - 1 && info.look & 0x100) cellMask = LAST_COLUMN;
      else if (!(info.look & 0x400))
        cellMask = (cell + 1 + Number(Boolean(info.look & 0x080))) & 1 ? 0x080 : 0x040;
      let mask = rowMask | cellMask;
      if (mask === (FIRST_ROW | FIRST_COLUMN)) mask |= 0x004;
      else if (mask === (FIRST_ROW | LAST_COLUMN)) mask |= 0x008;
      else if (mask === (LAST_ROW | FIRST_COLUMN)) mask |= 0x001;
      else if (mask === (LAST_ROW | LAST_COLUMN)) mask |= 0x002;
      const conditional = info.style.GetProperties(mask);
      try {
        CopyTableCellStyleProperties(properties, conditional);
      } finally {
        conditional.dispose();
      }
    }
    if (direct) properties.InsertProps(direct);
    return properties;
  } catch (error) {
    properties.dispose();
    throw error;
  }
}

/** Copies mapper-only table style and look into the native frame interoperability item. @param table - Converted native table. @param properties - Accumulated table properties. @returns Nothing. */
export function ApplyTableInteropGrabBag(table: SwTable, properties: TablePropertyMap): void {
  const grabBag = new Map<string, Any>();
  try {
    for (const [id, name] of [
      [P.META_PROP_TABLE_STYLE_NAME, "TableStyleName"],
      [P.META_PROP_TABLE_LOOK, "TableStyleLook"],
    ] as const) {
      const value = properties.getProperty(id)?.[1];
      if (!value) continue;
      grabBag.set(name, value);
      properties.Erase(id);
    }
    if (!grabBag.size) return;
    const item = new SfxGrabBagItem(RES_FRMATR_GRABBAG, grabBag);
    try {
      table.GetFrameFormat().SetFormatAttr(item);
    } finally {
      item.Dispose();
    }
  } finally {
    for (const value of grabBag.values()) value.dispose();
  }
}

/** Applies the original row split default and native row properties. @param line - Connected Writer row. @param properties - Actual mapper row properties. @returns Nothing. */
export function ApplyTableRowProperties(line: SwTableLine, properties: TablePropertyMap): void {
  const split = new Any([true], "bool");
  try {
    properties.Insert(P.PROP_IS_SPLIT_ALLOWED, split, false);
  } finally {
    split.dispose();
  }
  // The mapper consumes this marker before passing row properties to UNO.
  properties.Erase(P.PROP_TBL_HEADER);
  const row = new SwXTextTableRow(line);
  for (const property of properties.GetPropertyValues())
    row.setPropertyValue(property.Name, property.Value);
}

/** Finalizes the original table header count, writing direction and table-level split property. @param table - Connected Writer table. @param properties - Accumulated native table properties. @returns Nothing. */
export function FinalizeTableFlowProperties(table: SwTable, properties: TablePropertyMap): void {
  const rows = table.GetTabLines();
  const count = properties.getProperty(P.PROP_HEADER_ROW_COUNT)?.[1];
  let allHeaders: boolean;
  try {
    allHeaders =
      rows.length > 1 && count !== undefined && scalar(count, "sal_Int32") === rows.length;
  } finally {
    count?.dispose();
  }
  const zero = new Any([0], "sal_Int32");
  const direction = new Any([WritingMode2.CONTEXT], "sal_Int16");
  try {
    properties.Insert(P.PROP_HEADER_ROW_COUNT, zero, allHeaders);
    properties.Insert(P.PROP_WRITING_MODE, direction, false);
  } finally {
    direction.dispose();
    zero.dispose();
  }
  if (allHeaders || (rows.length === 1 && !rows[0]?.GetFrameFormat().GetRowSplit().GetValue())) {
    const split = new Any([false], "bool");
    try {
      properties.Insert(P.PROP_SPLIT, split);
    } finally {
      split.dispose();
    }
  }
}

/** Reads the original line width directly from the resolved first-cell property. @param cell - Source cell property map. @param id - Original border property. @returns Width in mm100. */
function CellBorderWidth(cell: TablePropertyMap | undefined, id: P): number {
  const property = cell?.getProperty(id)?.[1];
  if (!property) return 0;
  try {
    const line = new BorderLine2();
    return property.extract(line, cppu_detail_getUnoType_BorderLine2) ? line.LineWidth : 0;
  } finally {
    property.dispose();
  }
}

/** Applies source table width and indentation through the existing UNO table owner. @param table - Actual converted table. @param properties - Accumulated native table properties. @param firstCell - Resolved first cell. @param nested - Whether the table resides in a parent cell. @param wordMode - Word compatibility mode for OOXML. @returns Horizontal correction for floating table placement in mm100. */
export function ApplyTableMeasures(
  table: SwTable,
  properties: TablePropertyMap,
  firstCell?: TablePropertyMap,
  nested = table.GetTableNode().FindTableBoxStartNode() !== null,
  wordMode?: number,
): number {
  const width: [number] = [0],
    type: [number] = [SizeType.FIX],
    margin: [number] = [0];
  const hasWidth = properties.getValue(T.TABLE_WIDTH, width);
  properties.getValue(T.TABLE_WIDTH_TYPE, type);
  if (hasWidth) {
    if (type[0] === SizeType.FIX && width[0] > 0) {
      const value = new Any(width, "sal_Int32");
      try {
        properties.Insert(P.PROP_WIDTH, value);
      } finally {
        value.dispose();
      }
    } else {
      const relative = new Any([type[0] === SizeType.FIX ? 100 : width[0]], "sal_Int16");
      const flag = new Any([true], "bool");
      try {
        properties.Insert(P.PROP_RELATIVE_WIDTH, relative);
        properties.Insert(P.PROP_IS_WIDTH_RELATIVE, flag);
      } finally {
        relative.dispose();
        flag.dispose();
      }
    }
  }
  const orient: [number] = [HoriOrientation.LEFT_AND_WIDTH];
  properties.getValue(T.HORI_ORIENT, orient);
  const orientation = new Any(orient, "sal_Int16");
  try {
    properties.Insert(P.PROP_HORI_ORIENT, orientation);
  } finally {
    orientation.dispose();
  }
  const hasMargin = properties.getValue(T.LEFT_MARGIN, margin);
  const halfBorder = Math.trunc(CellBorderWidth(firstCell, P.PROP_LEFT_BORDER) / 2);
  const cellMargin: [number] = [0];
  properties.getValue(T.CELL_MAR_LEFT, cellMargin);
  let adjusted = (nested ? Math.max(0, margin[0]) : margin[0]) + halfBorder;
  if (!nested && wordMode !== undefined && wordMode < 15) {
    const direct = firstCell?.getProperty(P.PROP_LEFT_BORDER_DISTANCE)?.[1];
    try {
      if (direct) direct.extract(cellMargin, "sal_Int32");
    } finally {
      direct?.dispose();
    }
    adjusted = margin[0] - (hasMargin ? Math.max(halfBorder, cellMargin[0]) : halfBorder);
  }
  if (hasMargin || adjusted || wordMode !== undefined) {
    const left = new Any([adjusted], "sal_Int32");
    try {
      properties.Insert(P.PROP_LEFT_MARGIN, left);
    } finally {
      left.dispose();
    }
  }
  return cellMargin[0] + (nested ? 0 : halfBorder);
}

/** Applies default cell margins only where direct cell distances are absent. @param table - Actual converted table. @param properties - Accumulated native table properties. @param firstCell - Resolved first cell. @param cellProperties - Optional row and cell property lookup. @returns Nothing. */
export function ApplyTableMargins(
  table: SwTable,
  properties: TablePropertyMap,
  firstCell?: TablePropertyMap,
  cellProperties?: (row: number, column: number) => TablePropertyMap | undefined,
): void {
  const left: [number] = [0],
    right: [number] = [0],
    top: [number] = [0],
    bottom: [number] = [0];
  properties.getValue(T.CELL_MAR_LEFT, left);
  properties.getValue(T.CELL_MAR_RIGHT, right);
  properties.getValue(T.CELL_MAR_TOP, top);
  properties.getValue(T.CELL_MAR_BOTTOM, bottom);
  const halfLeft = Math.trunc(CellBorderWidth(firstCell, P.PROP_LEFT_BORDER) / 2);
  const halfRight = Math.trunc(CellBorderWidth(firstCell, P.PROP_RIGHT_BORDER) / 2);
  const actualLeft = Math.max(halfLeft, left[0]);
  const actualRight = Math.max(actualLeft + halfRight, left[0] + right[0]) - actualLeft;
  const margins = [
    [SvxBoxItemLine.LEFT, actualLeft, P.PROP_LEFT_BORDER_DISTANCE],
    [SvxBoxItemLine.RIGHT, actualRight, P.PROP_RIGHT_BORDER_DISTANCE],
    [SvxBoxItemLine.TOP, top[0], P.PROP_TOP_BORDER_DISTANCE],
    [SvxBoxItemLine.BOTTOM, bottom[0], P.PROP_BOTTOM_BORDER_DISTANCE],
  ] as const;
  const format = table.GetFrameFormat();
  const tableBox = format.GetBox().Clone();
  try {
    for (const [edge, width] of margins)
      tableBox.SetDistance(Number(toTwips(BigInt(width), Length.mm100)), edge);
    format.SetFormatAttr(tableBox);
  } finally {
    tableBox.Dispose();
  }
  for (const [rowIndex, row] of table.GetTabLines().entries())
    for (const [column, cell] of row.GetTabBoxes().entries()) {
      const box = cell.GetBox();
      try {
        const direct = cellProperties?.(rowIndex, column);
        for (const [edge, width, id] of margins)
          if (!direct?.isSet(id))
            box.SetDistance(Number(toTwips(BigInt(width), Length.mm100)), edge);
        cell.ClaimFrameFormat().SetFormatAttr(box);
      } finally {
        box.Dispose();
      }
    }
}

/** Original cell coordinates retained until UNO table conversion completes. */
export interface HorizontallyMergedCell {
  readonly firstRow: number;
  readonly firstCol: number;
  lastRow: number;
  lastCol: number;
}

/** Consumes the mapper-only property before forwarding the remaining map to UNO. @param merges - Collected native ranges. @param cell - Actual cell property map. @param row - Source row. @param col - Source column. @returns Nothing. */
export function CollectHorizontalMerge(
  merges: HorizontallyMergedCell[],
  cell: TablePropertyMap,
  row: number,
  col: number,
): void {
  const merge = cell.getProperty(P.PROP_HORIZONTAL_MERGE)?.[1];
  if (!merge) return;
  try {
    if (scalar(merge, "bool"))
      merges.push({ firstRow: row, firstCol: col, lastRow: row, lastCol: -1 });
    else {
      const last = merges.at(-1);
      if (last) {
        last.lastRow = row;
        last.lastCol = col;
      }
    }
  } finally {
    merge.dispose();
    cell.Erase(P.PROP_HORIZONTAL_MERGE);
  }
}

const borderEdges = [
  SvxBoxItemLine.TOP,
  SvxBoxItemLine.LEFT,
  SvxBoxItemLine.BOTTOM,
  SvxBoxItemLine.RIGHT,
];

/** Applies ranges in reverse order, restoring the first cell's explicit border lines. @param table - Actual converted table. @param merges - Original accumulated ranges. @returns Nothing. */
export function ApplyHorizontalMerges(table: SwTable, merges: HorizontallyMergedCell[]): void {
  const lines = table.GetTabLines();
  for (const merge of merges.reverse()) {
    if (merge.lastCol === -1) continue;
    const first = lines[merge.firstRow]?.GetTabBoxes()[merge.firstCol],
      last = lines[merge.lastRow]?.GetTabBoxes()[merge.lastCol];
    if (!first || !last) continue;
    const borders = first.GetBox(),
      cursor = new SwXTextTableCursor(first);
    try {
      if (!cursor.gotoCell(last, true) || !cursor.mergeRange()) continue;
      const result = first.GetBox();
      try {
        for (const edge of borderEdges) {
          const line = borders.GetLine(edge);
          if (line && line.GetBorderLineStyle() !== BorderLineStyle.NONE)
            result.SetLine(line, edge);
        }
        first.ClaimFrameFormat().SetFormatAttr(result);
      } finally {
        result.Dispose();
      }
    } finally {
      cursor.dispose();
      borders.Dispose();
    }
  }
}

/** Uses only the final contiguous continuing cell's bottom border on the merge master. @param table - Actual table. @param merges - Original cell merge properties in source grid order. @returns Nothing. */
export function ApplyVerticalMergeBorders(
  table: SwTable,
  merges: readonly (readonly (boolean | undefined)[])[],
): void {
  const lines = table.GetTabLines();
  for (const [row, values] of merges.entries()) {
    for (const [column, restart] of values.entries()) {
      if (restart !== true) continue;
      let last = row;
      while (merges[last + 1]?.[column] === false) ++last;
      if (last === row) continue;
      const first = lines[row]?.GetTabBoxes()[column];
      const final = lines[last]?.GetTabBoxes()[column];
      if (!first || !final) continue;
      const box = first.GetBox();
      const bottom = final.GetFrameFormat().GetBox().GetBottom();
      try {
        box.SetLine(bottom, SvxBoxItemLine.BOTTOM);
        first.ClaimFrameFormat().SetFormatAttr(box);
      } finally {
        box.Dispose();
      }
    }
  }
}

/** Applies the original table positioning sequence through the connected Writer XText owner. @param table - Actual converted native table. @param position - Original row position handler. @param horizontalShift - Native unadjusted cell spacing and outside border shift in mm100. @returns Nothing. */
export function ConvertFloatingRtfTable(
  table: SwTable,
  position: TablePositionHandler,
  horizontalShift: number,
): void {
  const node = table.GetTableNode();
  const text = new SwXText(node.GetDoc(), node.StartOfSectionNode());
  const original = position.getTablePosition();
  const values = new SequenceAsHashMap(original, "PropertyValue");
  const key = unicode("HoriOrientPosition");
  try {
    const x = values.operatorIndex(key);
    const offset = scalar(x, "sal_Int32") as number;
    x.insert([offset - horizontalShift], "sal_Int32");
    const properties = values.getAsConstPropertyValueList();
    try {
      text.convertToSwTextFrame(table, properties);
    } finally {
      properties.dispose();
    }
  } finally {
    key.dispose();
    values.dispose();
    original.dispose();
    text.dispose();
  }
}
