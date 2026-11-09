/** @fileoverview Consumed source cell shading case of the native table properties handler. */
import { resolveReturnedReference, type Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { CellColorHandler } from "./CellColorHandler";
import type { TablePropertyMap } from "./PropertyMap";

/** Native table manager endpoint for the represented cell property cases. */
interface TablePropertyTarget {
  cellProps(properties: TablePropertyMap): void;
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
    if (modifier.getId() !== N.LN_CT_TcPrBase_shd) return false;
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
