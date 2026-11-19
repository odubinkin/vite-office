/** @fileoverview SheetViewSettings import of the represented native per-sheet option. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { AttributeList } from "../../../../oox/source/helper/attributelist";
import type { ScDocument } from "../../../inc/document";

/** Owns the worksheet view selected by the original first-view rule. */
export class SheetViewSettings {
  private showGrid: boolean | undefined;

  /** Reads the original optional grid visibility with the Excel default. @param attributes - Source sheet view. @returns Nothing. */
  importSheetView(attributes: AttributeList): void {
    this.showGrid ??= attributes.getBool(token("showGridLines"), true);
  }

  /** Applies the primary view once the worksheet has loaded. @param document - Target workbook. @param tab - Actual sheet. @returns Nothing. */
  finalizeImport(document: ScDocument, tab: number): void {
    document.SetSheetShowGrid(tab, this.showGrid ?? true);
  }
}
