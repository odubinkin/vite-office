/** @fileoverview Represents the original ActiveTable and grid properties of Calc view data. */
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ViewSettings } from "../../../../xmloff/source/core/DocumentSettingsContext";

const SC_ACTIVETABLE = "ActiveTable";
const SC_TABLES = "Tables";
const SC_UNO_SHOWGRID = "ShowGrid";

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
    } else if (key === SC_UNO_SHOWGRID && typeof value === "boolean") {
      document.GetViewOptions().SetOption(ViewOption.GRID, value);
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
        [SC_UNO_SHOWGRID, document.GetViewOptions().GetOption(ViewOption.GRID)],
      ],
    ];
  } finally {
    name.dispose();
  }
}
