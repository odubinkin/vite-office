/** @fileoverview Calc worksheet and workbook view settings import. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { AttributeList } from "../../../../oox/source/helper/attributelist";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";

/** SpreadsheetML sheet view fields represented by the current Calc view. */
type SheetViewModel = {
  showGrid: boolean;
  showHeaders: boolean;
  showZeros: boolean;
};

/** Retains the parsed sheet views until the workbook's active sheet is available. */
export class ViewSettings {
  private readonly sheets = new Map<number, SheetViewModel>();

  /** Records the completed worksheet view and applies its independent grid flag. @param document - Target workbook. @param tab - Actual sheet. @param view - Source view settings. @returns Nothing. */
  setSheetViewSettings(document: ScDocument, tab: number, view: SheetViewModel): void {
    this.sheets.set(tab, view);
    document.SetSheetShowGrid(tab, view.showGrid);
  }

  /** Applies the active sheet's document-wide view properties. @param document - Target workbook. @param activeSheet - Active Calc tab. @returns Nothing. */
  finalizeImport(document: ScDocument, activeSheet: number): void {
    const view = this.sheets.get(activeSheet);
    const options = document.GetViewOptions();
    // The native view reader consumes headers and zero visibility, but ignores ShowFormulas.
    options.SetOption(ViewOption.HEADER, view?.showHeaders ?? true);
    options.SetOption(ViewOption.NULLVALS, view?.showZeros ?? true);
  }
}

/** Owns the worksheet view selected by the original first-view rule. */
export class SheetViewSettings {
  private view: SheetViewModel | undefined;

  /** Reads the original sheet view booleans and their Excel defaults. @param attributes - Source sheet view. @returns Nothing. */
  importSheetView(attributes: AttributeList): void {
    this.view ??= {
      showGrid: attributes.getBool(token("showGridLines"), true),
      showHeaders: attributes.getBool(token("showRowColHeaders"), true),
      showZeros: attributes.getBool(token("showZeros"), true),
    };
  }

  /** Applies the worksheet view and passes it to the workbook owner. @param document - Target workbook. @param tab - Actual sheet. @param views - Workbook view settings. @returns Nothing. */
  finalizeImport(document: ScDocument, tab: number, views: ViewSettings): void {
    if (this.view) views.setSheetViewSettings(document, tab, this.view);
  }
}
