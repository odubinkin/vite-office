/** @fileoverview Native table/row/cell property ownership and original grid separators. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import { resolveReturnedReference, type Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import { TablePropertyMap, TablePropertyMapTarget as T } from "./PropertyMap";
import { UNO_TABLE_COLUMN_SUM } from "../../../inc/swtypes";
import { TablePositionHandler } from "./TablePositionHandler";
import { MeasureHandler } from "./MeasureHandler";
import { convertTwipToMm100_LimitedRoundUp } from "./ConversionHelper";
import { TablePropertiesHandler } from "./TablePropertiesHandler";

/** Actual mapper property owners for the represented top-level table direction path. */
export class DomainMapperTableManager {
  private readonly m_aTableProperties = new TablePropertyMap();
  private m_aTmpTableProperties = new TablePropertyMap();
  private m_pCellProps = new TablePropertyMap();
  private m_pRowProps = new TablePropertyMap();
  private m_nRow = 0;
  private m_nHeaderRepeat = 0;
  private readonly m_pTablePropsHandler = new TablePropertiesHandler();
  private m_nTableWidth = 0;
  private m_pTmpPosition: TablePositionHandler | undefined;

  /** Connects the original fallback table property handler. @returns Table manager. */
  constructor() {
    this.m_pTablePropsHandler.SetTableManager(this);
  }

  /** Resolves original row position and overlap attributes in stream order. @param modifier - Actual resource modifier. @returns Whether consumed. */
  resolvePositionSprm(modifier: Sprm): boolean {
    switch (modifier.getId()) {
      case N.LN_CT_TblPrBase_tblpPr: {
        const properties = modifier.getProps();
        if (properties !== null) {
          this.m_pTmpPosition ??= new TablePositionHandler();
          resolveReturnedReference(properties, this.m_pTmpPosition);
        }
        return true;
      }
      case N.LN_CT_TblPrBase_tblOverlap:
        this.m_pTmpPosition?.setTableOverlap(modifier.getValue()?.getInt() ?? 0);
        return true;
      default:
        return false;
    }
  }

  /** Transfers the current native row position for the end-of-row comparison. @returns Owned position or absent. */
  takeRowPosition(): TablePositionHandler | undefined {
    const position = this.m_pTmpPosition;
    this.m_pTmpPosition = undefined;
    return position;
  }

  /** Original row and cell property consumers. @param modifier - Actual resource sprm. @returns Whether the table manager consumed it. */
  sprm(modifier: Sprm): boolean {
    const id = modifier.getId(),
      value = modifier.getValue()?.getInt() ?? 0;
    if (id === N.LN_CT_TblPrBase_tblW || id === N.LN_CT_TblPrBase_tblInd) {
      const handler = new MeasureHandler();
      try {
        resolveReturnedReference(modifier.getProps(), handler);
        const width = handler.getMeasureValue();
        if (id === N.LN_CT_TblPrBase_tblInd)
          this.m_aTmpTableProperties.setValue(T.LEFT_MARGIN, width);
        else {
          this.m_nTableWidth = width;
          if (width) {
            this.m_aTmpTableProperties.setValue(T.TABLE_WIDTH_TYPE, SizeType.FIX);
            this.m_aTmpTableProperties.setValue(T.TABLE_WIDTH, width);
          } else if (handler.getUnit() === N.LN_Value_ST_TblWidth_pct) {
            this.m_aTmpTableProperties.setValue(T.TABLE_WIDTH_TYPE, SizeType.VARIABLE);
            this.m_aTmpTableProperties.setValue(
              T.TABLE_WIDTH,
              Math.min(100, Math.trunc(handler.getValue() / 50)),
            );
          }
        }
      } finally {
        handler.dispose();
      }
      return true;
    }
    if (id === N.LN_CT_TrPrBase_tblHeader) {
      const repeat = value > 0 && this.m_nHeaderRepeat === this.m_nRow;
      if (repeat || (value === 0 && this.m_nRow === 0)) {
        // Original ten-row limit handles headers that Word stops repeating at a page boundary.
        const count = repeat && this.m_nHeaderRepeat < 10 ? this.m_nHeaderRepeat + 1 : 0;
        const item = new Any([count], "sal_Int32");
        try {
          this.m_aTmpTableProperties.Insert(P.PROP_HEADER_ROW_COUNT, item);
        } finally {
          item.dispose();
        }
        this.m_nHeaderRepeat = count || -1;
      } else this.m_nHeaderRepeat = -1;
      return true;
    }
    if (id === N.LN_CT_TblPrBase_bidiVisual) {
      const item = new Any([value ? WritingMode2.RL_TB : WritingMode2.LR_TB], "sal_Int16");
      try {
        this.m_aTmpTableProperties.Insert(P.PROP_WRITING_MODE, item);
      } finally {
        item.dispose();
      }
      return true;
    }
    if (id === N.LN_CT_TcPrBase_vMerge || id === N.LN_CT_TcPrBase_hMerge) {
      const item = new Any([value === N.LN_Value_ST_Merge_restart], "bool");
      try {
        this.m_pCellProps.Insert(
          id === N.LN_CT_TcPrBase_vMerge ? P.PROP_VERTICAL_MERGE : P.PROP_HORIZONTAL_MERGE,
          item,
        );
      } finally {
        item.dispose();
      }
      return true;
    }
    if (id !== N.LN_CT_TcPrBase_textDirection) return this.m_pTablePropsHandler.sprm(modifier);
    let direction: number;
    switch (value) {
      case N.LN_Value_ST_TextDirection_tbRl:
      case N.LN_Value_ST_TextDirection_tbRlV:
        direction = WritingMode2.TB_RL;
        break;
      case N.LN_Value_ST_TextDirection_btLr:
        direction = WritingMode2.BT_LR;
        break;
      case N.LN_Value_ST_TextDirection_lrTbV:
        direction = WritingMode2.LR_TB;
        break;
      default:
        return true;
    }
    const item = new Any([direction], "sal_Int16");
    try {
      this.m_pCellProps.Insert(P.PROP_FRM_DIRECTION, item);
    } finally {
      item.dispose();
    }
    return true;
  }

  /** Merges native cell properties into the current cell context. @param properties - Actual borrowed property map. @returns Nothing. */
  cellProps(properties: TablePropertyMap): void {
    this.m_pCellProps.InsertProps(properties);
  }

  /** Merges original table property slots into the current row's table context. @param properties - Borrowed table properties. @returns Nothing. */
  insertTableProps(properties: TablePropertyMap): void {
    this.m_aTmpTableProperties.InsertProps(properties);
  }

  /** Inserts original row-level properties. @param properties - Borrowed row map. @returns Nothing. */
  insertRowProps(properties: TablePropertyMap): void {
    this.m_pRowProps.InsertProps(properties);
  }

  /** Transfers the current row map to the native row application boundary. @returns Owned row properties. */
  takeRowProperties(): TablePropertyMap {
    const properties = this.m_pRowProps;
    this.m_pRowProps = new TablePropertyMap();
    return properties;
  }

  /** Accumulates row table properties with the source grid fallback. @param grid - Prepared RTF row grid, when present. @returns Nothing. */
  endOfRowAction(grid?: readonly number[]): void {
    const type: [number] = [SizeType.VARIABLE];
    const width: [number] = [0];
    if (grid?.length) {
      this.m_aTmpTableProperties.getValue(T.TABLE_WIDTH_TYPE, type);
      this.m_aTmpTableProperties.getValue(T.TABLE_WIDTH, width);
      if (!this.m_nTableWidth) {
        let sum = 0;
        for (const column of grid) sum = Math.max(-0x80000000, Math.min(0x7fffffff, sum + column));
        this.m_nTableWidth = convertTwipToMm100_LimitedRoundUp(sum);
      }
      if (type[0] === SizeType.VARIABLE && (width[0] <= 0 || width[0] > 100)) {
        this.m_aTmpTableProperties.setValue(T.TABLE_WIDTH_TYPE, SizeType.FIX);
        this.m_aTmpTableProperties.setValue(T.TABLE_WIDTH, this.m_nTableWidth);
      }
    }
    this.m_nTableWidth = 0;
    this.m_nRow++;
    this.m_aTableProperties.InsertProps(this.m_aTmpTableProperties);
    this.m_aTmpTableProperties.dispose();
    this.m_aTmpTableProperties = new TablePropertyMap();
  }

  /** Transfers the current cell property map to the atomic table handler and starts the next cell. @returns Owned cell properties. */
  takeCellProperties(): TablePropertyMap {
    const properties = this.m_pCellProps;
    this.m_pCellProps = new TablePropertyMap();
    return properties;
  }

  /** Original table-owned property map, borrowed until destruction. @returns Native properties. */
  getTableProps(): TablePropertyMap {
    return this.m_aTableProperties;
  }

  /** Releases represented native row, cell and table property maps. @returns Nothing. */
  dispose(): void {
    this.m_pTmpPosition?.dispose();
    this.m_pCellProps.dispose();
    this.m_pRowProps.dispose();
    this.m_aTmpTableProperties.dispose();
    this.m_aTableProperties.dispose();
  }
}

/** Original one-grid-slot-per-cell separator calculation on the supplied grid. @param grid - Original grid widths. @returns Native relative column separators. */
export function GetTableGridSeparators(grid: readonly number[]): number[] {
  let width = 0;
  for (const cellWidth of grid)
    width = Math.min(0x7fffffff, Math.max(-0x80000000, width + cellWidth));
  let relative = 0;
  const positions: number[] = [];
  for (const gridWidth of grid.slice(0, -1)) {
    if (gridWidth) {
      if (!width) throw new Error("divide_by_zero");
      relative += (gridWidth * UNO_TABLE_COLUMN_SUM) / width;
    }
    positions.push(((Math.sign(relative) * Math.round(Math.abs(relative))) << 16) >> 16);
  }
  return positions;
}
