/** @fileoverview Native direction sprm handling in DomainMapperTableManager and the current table/row/cell property-map lifecycle. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import type { Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { TablePropertyMap } from "./PropertyMap";

/** Actual mapper property owners for the represented top-level table direction path. */
export class DomainMapperTableManager {
  private readonly m_aTableProperties = new TablePropertyMap();
  private m_aTmpTableProperties = new TablePropertyMap();
  private m_pCellProps = new TablePropertyMap();

  /** Original row and cell direction consumers. @param modifier - Actual resource sprm. @returns Whether the table manager consumed it. */
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
    if (id !== N.LN_CT_TcPrBase_textDirection) return false;
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
    this.m_pCellProps.dispose();
    this.m_aTmpTableProperties.dispose();
    this.m_aTableProperties.dispose();
  }
}
