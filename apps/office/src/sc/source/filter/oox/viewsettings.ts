/** @fileoverview Calc worksheet and workbook view settings import. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { AttributeList } from "../../../../oox/source/helper/attributelist";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import type { ScAddress } from "../../../inc/address";
import {
  setSheetCursor,
  setSheetPaneLayout,
  setSheetTabSelected,
  SheetPane,
  SheetSplitMode,
} from "../../core/data/document.sheet-visibility";
import { AddressConverter } from "./addressconverter";

const topLeft = token("topLeft");
const panes = new Map<number, SheetPane>([
  [topLeft, SheetPane.TOPLEFT],
  [token("topRight"), SheetPane.TOPRIGHT],
  [token("bottomLeft"), SheetPane.BOTTOMLEFT],
  [token("bottomRight"), SheetPane.BOTTOMRIGHT],
]);
const split = token("split");
const frozen = token("frozen");
const frozenSplit = token("frozenSplit");

/** SpreadsheetML sheet view fields represented by the current Calc view. */
type SheetViewModel = {
  selected: boolean;
  showGrid: boolean;
  showHeaders: boolean;
  showZeros: boolean;
  showOutline: boolean;
};

/** Retains the parsed sheet views until the workbook's active sheet is available. */
export class ViewSettings {
  private readonly sheets = new Map<number, SheetViewModel>();
  private bookView: { readonly activeTab: number; readonly showSheetTabs: boolean } | undefined;

  /** Retains the first workbook view with the native tab bar default. @param attributes - Source workbook view. @returns Nothing. */
  importWorkbookView(attributes: AttributeList): void {
    this.bookView ??= {
      activeTab: attributes.getInteger(token("activeTab"), 0),
      showSheetTabs: attributes.getBool(token("showSheetTabs"), true),
    };
  }

  /** Resolves the source first workbook view's active sheet index. @returns Source tab with the default applied. */
  getActiveTab(): number {
    return this.bookView?.activeTab ?? 0;
  }

  /** Records the completed worksheet view and applies its independent grid flag. @param document - Target workbook. @param tab - Actual sheet. @param view - Source view settings. @returns Nothing. */
  setSheetViewSettings(document: ScDocument, tab: number, view: SheetViewModel): void {
    this.sheets.set(tab, view);
    document.SetSheetShowGrid(tab, view.showGrid);
  }

  /** Applies the active sheet's document-wide view properties. @param document - Target workbook. @param activeSheet - Active Calc tab. @returns Nothing. */
  finalizeImport(document: ScDocument, activeSheet: number): void {
    for (let tab = 0; tab < document.GetTableCount(); ++tab) {
      const selected = tab === activeSheet || this.sheets.get(tab)?.selected === true;
      setSheetTabSelected(document, tab, selected);
      if (selected) document.SetVisible(tab, true);
    }
    const view = this.sheets.get(activeSheet);
    const options = document.GetViewOptions();
    // The native view reader consumes headers and zero visibility, but ignores ShowFormulas.
    options.SetOption(ViewOption.HEADER, view?.showHeaders ?? true);
    options.SetOption(ViewOption.NULLVALS, view?.showZeros ?? true);
    options.SetOption(ViewOption.OUTLINER, view?.showOutline ?? true);
    options.SetOption(ViewOption.TABCONTROLS, this.bookView?.showSheetTabs ?? true);
  }
}

/** Owns the worksheet view selected by the original first-view rule. */
export class SheetViewSettings {
  private view: SheetViewModel | undefined;
  private readingFirstView = false;
  private firstPosition: ScAddress | undefined;
  private activePane = topLeft;
  private secondPosition: ScAddress | undefined;
  private paneState = split;
  private splitX = 0;
  private splitY = 0;
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
      selected: attributes.getBool(token("tabSelected"), false),
      showGrid: attributes.getBool(token("showGridLines"), true),
      showHeaders: attributes.getBool(token("showRowColHeaders"), true),
      showZeros: attributes.getBool(token("showZeros"), true),
      showOutline: attributes.getBool(token("showOutlineSymbols"), true),
    };
    this.firstPosition = this.readAddress(attributes, token("topLeftCell"));
  }

  /** Reads the active pane, split and scroll position of the additional pane. @param attributes - Source pane. @returns Nothing. */
  importPane(attributes: AttributeList): void {
    if (!this.readingFirstView) return;
    this.activePane = attributes.getToken(token("activePane"), topLeft);
    this.secondPosition = this.readAddress(attributes, token("topLeftCell"));
    this.paneState = attributes.getToken(token("state"), split);
    this.splitX = attributes.getDouble(token("xSplit"), 0);
    this.splitY = attributes.getDouble(token("ySplit"), 0);
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
    const first = this.firstPosition;
    const second = this.secondPosition;
    if (!first || (!second && first.Col() === 0 && first.Row() === 0)) return;
    const fixed = this.paneState === frozen || this.paneState === frozenSplit;
    const [horizontalMode, horizontalPosition] = paneAxis(
      this.splitX,
      first.Col(),
      document.MaxCol(),
      fixed,
      this.paneState === split,
    );
    const [verticalMode, verticalPosition] = paneAxis(
      this.splitY,
      first.Row(),
      document.MaxRow(),
      fixed,
      this.paneState === split,
    );
    setSheetPaneLayout(document, tab, {
      horizontalMode,
      verticalMode,
      horizontalPosition,
      verticalPosition,
      activePane: resolvePane(
        panes.get(this.activePane),
        horizontalPosition > 0,
        verticalPosition > 0,
      ),
      first: [first.Col(), first.Row()],
      second: [second?.Col() ?? 0, verticalPosition > 0 ? (second?.Row() ?? 0) : first.Row()],
    });
  }
}

/** Converts an OOXML split axis to absolute cell coordinates or native twips. @param value - Excel count or twips. @param first - First visible cell. @param maximum - Sheet axis limit. @param fixed - Whether freezing. @param normal - Whether splitting the window. @returns Native mode and position. */
function paneAxis(
  value: number,
  first: number,
  maximum: number,
  fixed: boolean,
  normal: boolean,
): readonly [SheetSplitMode, number] {
  if (fixed && value >= 1 && first + value <= maximum)
    return [SheetSplitMode.FIX, Math.trunc(first + value)];
  if (normal) {
    const position = Math.trunc(Math.max(0, Math.min(value + 0.5, 0x7fffffff)));
    if (position > 0) return [SheetSplitMode.NORMAL, position];
  }
  return [SheetSplitMode.NONE, 0];
}

/** Converts the Excel pane to Calc's view range conventions. @param pane - Original pane identity. @param horizontal - Horizontal split. @param vertical - Vertical split. @returns Native view pane. */
function resolvePane(
  pane: SheetPane | undefined,
  horizontal: boolean,
  vertical: boolean,
): SheetPane {
  switch (pane) {
    case SheetPane.TOPLEFT:
      return vertical ? SheetPane.TOPLEFT : SheetPane.BOTTOMLEFT;
    case SheetPane.TOPRIGHT:
      if (vertical) return horizontal ? SheetPane.TOPRIGHT : SheetPane.TOPLEFT;
      return horizontal ? SheetPane.BOTTOMRIGHT : SheetPane.BOTTOMLEFT;
    case SheetPane.BOTTOMRIGHT:
      return horizontal ? SheetPane.BOTTOMRIGHT : SheetPane.BOTTOMLEFT;
    default:
      return SheetPane.BOTTOMLEFT;
  }
}
