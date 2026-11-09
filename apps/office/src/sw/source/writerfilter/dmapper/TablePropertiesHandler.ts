/** @fileoverview Consumed source cell shading case of the native table properties handler. */
import { resolveReturnedReference, type Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { CellColorHandler } from "./CellColorHandler";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { convertTableJustification } from "./ConversionHelper";
import { CellMarginHandler } from "./CellMarginHandler";
import { PropertyIds as P } from "./PropertyIds";
import { TablePropertyMap, TablePropertyMapTarget as T } from "./PropertyMap";

/** Native table manager endpoint for the represented cell property cases. */
interface TablePropertyTarget {
  cellProps(properties: TablePropertyMap): void;
  insertTableProps(properties: TablePropertyMap): void;
}

/** Resolves nested table resource properties through their source handlers. */
export class TablePropertiesHandler {
  private m_pTableManager: TablePropertyTarget | undefined;

  /** Binds the original table manager property target. @param manager - Actual table property owner. @returns Nothing. */
  SetTableManager(manager: TablePropertyTarget): void {
    this.m_pTableManager = manager;
  }

  /** Resolves the original native cell brush and inserts its actual property map. @param modifier - Table resource sprm. @returns Whether the property was consumed. */
  sprm(modifier: Sprm): boolean {
    const id = modifier.getId();
    if (id === N.LN_CT_TrPrBase_jc || id === N.LN_CT_TblPrBase_jc) {
      const properties = new TablePropertyMap();
      try {
        properties.setValue(
          T.HORI_ORIENT,
          convertTableJustification(modifier.getValue()?.getInt() ?? 0),
        );
        this.m_pTableManager?.insertTableProps(properties);
      } finally {
        properties.dispose();
      }
      return true;
    }
    if (id === N.LN_CT_TblPrBase_tblCellMar || id === N.LN_CT_TcPrBase_tcMar) {
      const handler = new CellMarginHandler();
      const properties = new TablePropertyMap();
      try {
        resolveReturnedReference(modifier.getProps(), handler);
        const table = id === N.LN_CT_TblPrBase_tblCellMar;
        for (const [valid, width, side, property] of [
          [
            handler.m_bLeftMarginValid,
            handler.m_nLeftMargin,
            T.CELL_MAR_LEFT,
            P.PROP_LEFT_BORDER_DISTANCE,
          ],
          [
            handler.m_bRightMarginValid,
            handler.m_nRightMargin,
            T.CELL_MAR_RIGHT,
            P.PROP_RIGHT_BORDER_DISTANCE,
          ],
          [
            handler.m_bTopMarginValid,
            handler.m_nTopMargin,
            T.CELL_MAR_TOP,
            P.PROP_TOP_BORDER_DISTANCE,
          ],
          [
            handler.m_bBottomMarginValid,
            handler.m_nBottomMargin,
            T.CELL_MAR_BOTTOM,
            P.PROP_BOTTOM_BORDER_DISTANCE,
          ],
        ] as const) {
          if (!valid) continue;
          if (table) properties.setValue(side, width);
          else {
            const value = new Any([width], "sal_Int32");
            try {
              properties.Insert(property, value);
            } finally {
              value.dispose();
            }
          }
        }
        if (table) this.m_pTableManager?.insertTableProps(properties);
        else this.m_pTableManager?.cellProps(properties);
      } finally {
        properties.dispose();
        handler.dispose();
      }
      return true;
    }
    if (id !== N.LN_CT_TcPrBase_shd) return false;
    const handler = new CellColorHandler();
    try {
      resolveReturnedReference(modifier.getProps(), handler);
      const properties = handler.getProperties();
      try {
        this.m_pTableManager?.cellProps(properties);
      } finally {
        properties.dispose();
      }
    } finally {
      handler.dispose();
    }
    return true;
  }
}
