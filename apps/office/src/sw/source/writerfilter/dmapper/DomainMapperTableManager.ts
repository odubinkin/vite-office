/** @fileoverview Native table/row/cell property ownership and original grid separators. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import { resolveReturnedReference, type Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { TablePropertyMap } from "./PropertyMap";
import { UNO_TABLE_COLUMN_SUM } from "../../../inc/swtypes";
import { TablePositionHandler } from "./TablePositionHandler";
import { TablePropertiesHandler } from "./TablePropertiesHandler";

/** Actual mapper property owners for the represented top-level table direction path. */
export class DomainMapperTableManager {
  private readonly m_aTableProperties = new TablePropertyMap();
  private m_aTmpTableProperties = new TablePropertyMap();
  private m_pCellProps = new TablePropertyMap();
  private readonly m_pTablePropsHandler = new TablePropertiesHandler();
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

  /** Original end-of-row accumulation; absent properties do not overwrite the table's previous values. @returns Nothing. */
  endOfRowAction(): void {
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
