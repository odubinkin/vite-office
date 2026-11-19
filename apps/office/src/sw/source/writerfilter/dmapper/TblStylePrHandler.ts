/** @fileoverview Native table style geometry properties from TblStylePrHandler. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import {
  resolveReturnedReference,
  type Id,
  type Properties,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { CellMarginHandler } from "./CellMarginHandler";
import { MeasureHandler } from "./MeasureHandler";
import { PropertyIds as P } from "./PropertyIds";
import type { PropertyMap } from "./PropertyMap";

/** Original declaration order, independent of the conditional style bit masks. */
export enum TblStyleType {
  Unknown,
  WholeTable,
  FirstRow,
  LastRow,
  FirstCol,
  LastCol,
  Band1Vert,
  Band2Vert,
  Band1Horz,
  Band2Horz,
  NECell,
  NWCell,
  SECell,
  SWCell,
}

const types = new Map<number, TblStyleType>([
  [N.LN_Value_ST_TblStyleOverrideType_wholeTable, TblStyleType.WholeTable],
  [N.LN_Value_ST_TblStyleOverrideType_firstRow, TblStyleType.FirstRow],
  [N.LN_Value_ST_TblStyleOverrideType_lastRow, TblStyleType.LastRow],
  [N.LN_Value_ST_TblStyleOverrideType_firstCol, TblStyleType.FirstCol],
  [N.LN_Value_ST_TblStyleOverrideType_lastCol, TblStyleType.LastCol],
  [N.LN_Value_ST_TblStyleOverrideType_band1Vert, TblStyleType.Band1Vert],
  [N.LN_Value_ST_TblStyleOverrideType_band2Vert, TblStyleType.Band2Vert],
  [N.LN_Value_ST_TblStyleOverrideType_band1Horz, TblStyleType.Band1Horz],
  [N.LN_Value_ST_TblStyleOverrideType_band2Horz, TblStyleType.Band2Horz],
  [N.LN_Value_ST_TblStyleOverrideType_neCell, TblStyleType.NECell],
  [N.LN_Value_ST_TblStyleOverrideType_nwCell, TblStyleType.NWCell],
  [N.LN_Value_ST_TblStyleOverrideType_seCell, TblStyleType.SECell],
  [N.LN_Value_ST_TblStyleOverrideType_swCell, TblStyleType.SWCell],
]);

/** Writes the original style properties that the table conversion consumes. */
export class TblStylePrHandler implements Properties {
  private m_nType = TblStyleType.Unknown;

  /** Borrows the owning style property map. @param properties - Actual style map. @returns Handler. */
  constructor(private readonly properties: PropertyMap) {}

  /** Receives the native conditional style category. @param id - Attribute ID. @param value - Typed value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    if (id === N.LN_CT_TblStyleOverrideType)
      this.m_nType = types.get(value.getInt()) ?? TblStyleType.Unknown;
  }

  /** Returns the conditional category selected by the source attribute. @returns Table style category. */
  getType(): TblStyleType {
    return this.m_nType;
  }

  /** Reads style indentation and default cell distances. @param modifier - Source table property. @returns Nothing. */
  sprm(modifier: Sprm): void {
    switch (modifier.getId()) {
      case N.LN_CT_TblPrBase:
      case N.LN_CT_TrPrBase:
        resolveReturnedReference(modifier.getProps(), this);
        break;
      case N.LN_CT_TrPrBase_tblHeader:
        this.insert(P.PROP_HEADER_ROW_COUNT, 1);
        break;
      case N.LN_CT_TblPrBase_tblInd: {
        const measure = new MeasureHandler();
        try {
          const reference = modifier.getProps();
          if (reference !== null) {
            resolveReturnedReference(reference, measure);
            this.insert(P.PROP_LEFT_MARGIN, measure.getMeasureValue());
          }
        } finally {
          measure.dispose();
        }
        break;
      }
      case N.LN_CT_TblPrBase_tblCellMar: {
        const margins = new CellMarginHandler();
        try {
          resolveReturnedReference(modifier.getProps(), margins);
          if (margins.m_bLeftMarginValid)
            this.insert(P.META_PROP_CELL_MAR_LEFT, margins.m_nLeftMargin);
          if (margins.m_bRightMarginValid)
            this.insert(P.META_PROP_CELL_MAR_RIGHT, margins.m_nRightMargin);
          if (margins.m_bTopMarginValid)
            this.insert(P.META_PROP_CELL_MAR_TOP, margins.m_nTopMargin);
          if (margins.m_bBottomMarginValid)
            this.insert(P.META_PROP_CELL_MAR_BOTTOM, margins.m_nBottomMargin);
        } finally {
          margins.dispose();
        }
        break;
      }
    }
  }

  /** Inserts one signed style value. @param id - Native property identity. @param measure - Native integer. @returns Nothing. */
  private insert(id: P, measure: number): void {
    const value = new Any([measure], "sal_Int32");
    try {
      this.properties.Insert(id, value);
    } finally {
      value.dispose();
    }
  }
}
