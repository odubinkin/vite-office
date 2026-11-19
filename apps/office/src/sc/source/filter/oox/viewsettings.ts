/** @fileoverview Calc worksheet and workbook view settings import. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { AttributeList } from "../../../../oox/source/helper/attributelist";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import type { ScAddress } from "../../../inc/address";
import { setSheetCursor } from "../../core/data/document.sheet-visibility";
import { AddressConverter } from "./addressconverter";

const topLeft = token("topLeft");

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
  private readingFirstView = false;
  private firstPosition: ScAddress | undefined;
  private activePane = topLeft;
  private readonly paneCursors = new Map<number, ScAddress>();

  /** Binds the view to the destination worksheet. @param document - Target workbook. @param tab - Actual sheet. @returns View settings importer. */
  constructor(
    private readonly document: ScDocument,
    private readonly tab: number,
  ) {}

  /** Reads the original sheet view booleans and their Excel defaults. @param attributes - Source sheet view. @returns Nothing. */
  importSheetView(attributes: AttributeList): void {
    this.readingFirstView = this.view === undefined;
    if (!this.readingFirstView) return;
    this.view = {
      showGrid: attributes.getBool(token("showGridLines"), true),
      showHeaders: attributes.getBool(token("showRowColHeaders"), true),
      showZeros: attributes.getBool(token("showZeros"), true),
    };
    this.firstPosition = this.readAddress(attributes, token("topLeftCell"));
  }

  /** Identifies the active pane used to choose the cursor record. @param attributes - Source pane. @returns Nothing. */
  importPane(attributes: AttributeList): void {
    if (this.readingFirstView) this.activePane = attributes.getToken(token("activePane"), topLeft);
  }

  /** Reads the cursor of one pane. @param attributes - Source selection. @returns Nothing. */
  importSelection(attributes: AttributeList): void {
    if (!this.readingFirstView) return;
    const pane = attributes.getToken(token("pane"), topLeft);
    this.paneCursors.set(pane, this.readAddress(attributes, token("activeCell")));
  }

  /** Resolves a cursor coordinate with the native fallback for a missing or invalid source. @param attributes - Source attributes. @param name - Coordinate attribute token. @returns Native position. */
  private readAddress(attributes: AttributeList, name: number): ScAddress {
    const source = attributes.getStringDefaulted(name);
    try {
      return AddressConverter.createValidCellAddress(source, this.tab, this.document);
    } finally {
      source.dispose();
    }
  }

  /** Applies the worksheet view and passes it to the workbook owner. @param document - Target workbook. @param tab - Actual sheet. @param views - Workbook view settings. @returns Nothing. */
  finalizeImport(document: ScDocument, tab: number, views: ViewSettings): void {
    if (this.view) views.setSheetViewSettings(document, tab, this.view);
    const cursor = this.paneCursors.get(this.activePane) ?? this.firstPosition;
    if (cursor) setSheetCursor(document, tab, cursor.Col(), cursor.Row());
  }
}
