/** @fileoverview Native table style geometry properties from TblStylePrHandler. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { resolveReturnedReference, type Properties, type Sprm } from "../inc/dmapper/resourcemodel";
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

/** Writes the original style properties that the table conversion consumes. */
export class TblStylePrHandler implements Properties {
  /** Borrows the owning style property map. @param properties - Actual style map. @returns Handler. */
  constructor(private readonly properties: PropertyMap) {}

  /** Table geometry is carried by child properties. @returns Nothing. */
  attribute(): void {}

  /** Reads style indentation and default cell distances. @param modifier - Source table property. @returns Nothing. */
  sprm(modifier: Sprm): void {
    switch (modifier.getId()) {
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

  /** Inserts one signed metric value. @param id - Native property identity. @param measure - Hundredths of a millimetre. @returns Nothing. */
  private insert(id: P, measure: number): void {
    const value = new Any([measure], "sal_Int32");
    try {
      this.properties.Insert(id, value);
    } finally {
      value.dispose();
    }
  }
}
