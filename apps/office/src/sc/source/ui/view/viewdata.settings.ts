/** @fileoverview Represents the original ActiveTable and supported display properties of Calc view data. */
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type {
  NamedViewSettings,
  ViewItem,
  ViewSettings,
} from "../../../../xmloff/source/core/DocumentSettingsContext";
import {
  getSheetCursor,
  setSheetCursor,
  getSheetPaneLayout,
  setSheetPaneLayout,
  setSheetTabSelected,
  SheetPane,
  SheetSplitMode,
} from "../../core/data/document.sheet-visibility";

const SC_ACTIVETABLE = "ActiveTable";
const SC_TABLES = "Tables";
const SC_TABLESELECTED = "TableSelected";
const SC_UNO_SHOWGRID = "ShowGrid";
const SC_UNO_SHOWZERO = "ShowZeroValues";
const SC_UNO_COLROWHDR = "HasColumnRowHeaders";
const SC_UNO_OUTLSYMB = "IsOutlineSymbolsSet";
const SC_UNO_SHEETTABS = "HasSheetTabs";
const SC_UNO_SHOWPAGEBR = "ShowPageBreaks";
const SC_CURSORPOSITIONX = "CursorPositionX";
const SC_CURSORPOSITIONY = "CursorPositionY";
const viewOptions = new Map<string, ViewOption>([
  [SC_UNO_SHOWGRID, ViewOption.GRID],
  [SC_UNO_SHOWZERO, ViewOption.NULLVALS],
  [SC_UNO_COLROWHDR, ViewOption.HEADER],
  [SC_UNO_OUTLSYMB, ViewOption.OUTLINER],
  [SC_UNO_SHEETTABS, ViewOption.TABCONTROLS],
  [SC_UNO_SHOWPAGEBR, ViewOption.PAGEBREAKS],
]);

/** Reads the selected table name from the primary view entry. @param document - Actual document. @param views - Borrowed records. @returns Nothing. */
export function ReadUserDataSequence(document: ScDocument, views: ViewSettings): void {
  for (const [key, value] of views[0] ?? []) {
    if (key === SC_ACTIVETABLE && typeof value === "string") {
      const name = unicode(value);
      const tab: [number] = [0];
      try {
        if (document.GetTable(name, tab)) document.SetVisibleTab(tab[0]);
      } finally {
        name.dispose();
      }
    } else if (typeof value === "boolean") {
      const option = viewOptions.get(key);
      if (option !== undefined) document.GetViewOptions().SetOption(option, value);
    } else if (key === SC_TABLES && typeof value === "object") {
      for (const [sheet, items] of value) {
        const name = unicode(sheet);
        const tab: [number] = [0];
        try {
          if (!document.GetTable(name, tab)) continue;
          let [column, row] = getSheetCursor(document, tab[0]);
          let cursorValue = 0;
          for (const [property, scalar] of items) {
            if (property === SC_TABLESELECTED)
              setSheetTabSelected(document, tab[0], scalar === true);
            if (property === SC_UNO_SHOWGRID && typeof scalar === "boolean")
              document.SetSheetShowGrid(tab[0], scalar);
            if (property !== SC_CURSORPOSITIONX && property !== SC_CURSORPOSITIONY) continue;
            if (typeof scalar === "number") cursorValue = scalar;
            if (property === SC_CURSORPOSITIONX)
              column = Math.max(0, Math.min((cursorValue << 16) >> 16, document.MaxCol()));
            else row = Math.max(0, Math.min(cursorValue, document.MaxRow()));
          }
          setSheetCursor(document, tab[0], column, row);
          readPanes(document, tab[0], items);
        } finally {
          name.dispose();
        }
      }
    }
  }
}

/** Records the actual selected sheet by name from the document's view hint. @param document - Actual document. @returns Primary view entries. */
export function WriteUserDataSequence(document: ScDocument): ViewSettings {
  const tab = document.GetVisibleTab();
  const name = new OUString();
  try {
    if (!document.IsVisible(tab) || !document.GetName(tab, name)) return [];
    const active = text(name);
    const sheets: NamedViewSettings[number][] = [];
    for (let index = 0; index < document.GetTableCount(); ++index) {
      if (document.GetName(index, name)) {
        const [column, row] = getSheetCursor(document, index);
        sheets.push([
          text(name),
          [
            [SC_CURSORPOSITIONX, column],
            [SC_CURSORPOSITIONY, row],
            [SC_UNO_SHOWGRID, document.GetSheetShowGrid(index)],
            ...writePanes(document, index),
          ],
        ]);
      }
    }
    return [
      [
        ["ViewId", "view1"],
        [SC_TABLES, sheets],
        [SC_ACTIVETABLE, active],
        ...Array.from(
          viewOptions,
          /** Reads one supported view boolean. @param entry - Name and native option. @returns View property. */
          ([key, option]) => [key, document.GetViewOptions().GetOption(option)] as const,
        ),
      ],
    ];
  } finally {
    name.dispose();
  }
}

const HMode = "HorizontalSplitMode";
const VMode = "VerticalSplitMode";
const HPosition = "HorizontalSplitPosition";
const VPosition = "VerticalSplitPosition";
const HTwips = "HorizontalSplitPositionTwips";
const VTwips = "VerticalSplitPositionTwips";
const Active = "ActiveSplitRange";
const Left = "PositionLeft";
const Top = "PositionTop";
const Right = "PositionRight";
const Bottom = "PositionBottom";
const paneProperties = new Set([
  HMode,
  VMode,
  HPosition,
  VPosition,
  HTwips,
  VTwips,
  Active,
  Left,
  Top,
  Right,
  Bottom,
]);

/** Reads the native view settings supplied by ODF, including the twips properties used at the import boundary. @param document - Workbook. @param tab - Native sheet. @param items - Named view data. @returns Nothing. */
function readPanes(document: ScDocument, tab: number, items: readonly ViewItem[]): void {
  const values = new Map<string, number>();
  for (const [name, value, type] of items) {
    const short = name === HMode || name === VMode || name === Active;
    if (
      !paneProperties.has(name) ||
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      (type === "short") !== short
    )
      continue;
    switch (name) {
      case HPosition:
        values.delete(HTwips);
        break;
      case VPosition:
        values.delete(VTwips);
        break;
      case HTwips:
        values.delete(HPosition);
        break;
      case VTwips:
        values.delete(VPosition);
        break;
    }
    values.set(name, value);
  }
  if (!values.size) return;
  const active = values.get(Active) ?? SheetPane.BOTTOMLEFT;
  const [horizontalMode, horizontalPosition] = readAxis(
    values,
    HMode,
    HPosition,
    HTwips,
    document.MaxCol(),
    true,
  );
  const [verticalMode, verticalPosition] = readAxis(
    values,
    VMode,
    VPosition,
    VTwips,
    document.MaxRow(),
  );
  setSheetPaneLayout(document, tab, {
    horizontalMode,
    verticalMode,
    horizontalPosition,
    verticalPosition,
    activePane:
      active >= SheetPane.TOPLEFT && active <= SheetPane.BOTTOMRIGHT
        ? active
        : SheetPane.BOTTOMLEFT,
    first: [
      bound(asColumn(values.get(Left) ?? 0), document.MaxCol()),
      bound(values.get(verticalMode === SheetSplitMode.NONE ? Bottom : Top), document.MaxRow()),
    ],
    second: [
      bound(asColumn(values.get(Right) ?? 0), document.MaxCol()),
      bound(values.get(Bottom), document.MaxRow()),
    ],
  });
}

/** Reads a fixed cell coordinate or split distance at the native view boundary. @param values - Current settings. @param modeKey - Split mode property. @param positionKey - Pixel or fixed coordinate. @param twipsKey - Optional physical distance property. @param maximum - Maximum native row or column. @param column - Whether to narrow as a native column. @returns Mode and supported coordinate. */
function readAxis(
  values: ReadonlyMap<string, number>,
  modeKey: string,
  positionKey: string,
  twipsKey: string,
  maximum: number,
  column = false,
): readonly [SheetSplitMode, number] {
  const mode = values.get(modeKey);
  if (mode === SheetSplitMode.FIX) {
    const raw = values.get(twipsKey) ?? values.get(positionKey) ?? 0;
    const position = bound(column ? asColumn(raw) : raw, maximum);
    if (position) return [mode, position];
  } else if (mode === SheetSplitMode.NORMAL) {
    const position = bound(values.get(twipsKey) ?? (values.get(positionKey) ?? 0) * 15, 0x7fffffff);
    if (position) return [mode, position];
  }
  return [SheetSplitMode.NONE, 0];
}

/** Narrows a raw config integer to Calc's signed column width. @param value - Source coordinate. @returns Narrowed column. */
function asColumn(value: number): number {
  return (value << 16) >> 16;
}

/** Clamps a position to its native domain. @param value - Source position. @param maximum - Inclusive bound. @returns Sanitized coordinate. */
function bound(value: number | undefined, maximum: number): number {
  return Math.max(0, Math.min(value ?? 0, maximum));
}

/** Emits native fixed coordinates or the physical split properties understood by Calc's view reader. @param document - Active workbook. @param tab - Native sheet. @returns Per-sheet view properties. */
function writePanes(document: ScDocument, tab: number): readonly ViewItem[] {
  const panes = getSheetPaneLayout(document, tab);
  if (!panes) return [];
  return [
    [HMode, panes.horizontalMode, "short"],
    [VMode, panes.verticalMode, "short"],
    [panes.horizontalMode === SheetSplitMode.NORMAL ? HTwips : HPosition, panes.horizontalPosition],
    [panes.verticalMode === SheetSplitMode.NORMAL ? VTwips : VPosition, panes.verticalPosition],
    [Active, panes.activePane, "short"],
    [Left, panes.first[0]],
    [Top, panes.verticalMode === SheetSplitMode.NONE ? 0 : panes.first[1]],
    [Right, panes.second[0]],
    [Bottom, panes.second[1]],
  ];
}
