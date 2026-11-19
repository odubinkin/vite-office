/** @fileoverview Represents the original ActiveTable and supported display properties of Calc view data. */
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ViewSettings } from "../../../../xmloff/source/core/DocumentSettingsContext";

const SC_ACTIVETABLE = "ActiveTable";
const SC_TABLES = "Tables";
const SC_UNO_SHOWGRID = "ShowGrid";
const SC_UNO_SHOWZERO = "ShowZeroValues";
const SC_UNO_COLROWHDR = "HasColumnRowHeaders";
const viewOptions = new Map<string, ViewOption>([
  [SC_UNO_SHOWGRID, ViewOption.GRID],
  [SC_UNO_SHOWZERO, ViewOption.NULLVALS],
  [SC_UNO_COLROWHDR, ViewOption.HEADER],
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
          if (document.GetTable(name, tab))
            for (const [property, flag] of items)
              if (property === SC_UNO_SHOWGRID && typeof flag === "boolean")
                document.SetSheetShowGrid(tab[0], flag);
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
    const sheets: [string, [[string, boolean]]][] = [];
    for (let index = 0; index < document.GetTableCount(); ++index) {
      if (document.GetName(index, name))
        sheets.push([text(name), [[SC_UNO_SHOWGRID, document.GetSheetShowGrid(index)]]]);
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
