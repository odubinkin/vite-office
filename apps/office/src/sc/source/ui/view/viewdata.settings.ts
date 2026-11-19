/** @fileoverview Represents the original ActiveTable property of Calc view data. */
import type { ScDocument } from "../../../inc/document";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ViewSettings } from "../../../../xmloff/source/core/DocumentSettingsContext";

const SC_ACTIVETABLE = "ActiveTable";

/** Reads the selected table name from the primary view entry. @param document - Actual document. @param views - Borrowed records. @returns Nothing. */
export function ReadUserDataSequence(document: ScDocument, views: ViewSettings): void {
  for (const [key, value] of views[0] ?? []) {
    if (key !== SC_ACTIVETABLE) continue;
    const name = unicode(value);
    const tab: [number] = [0];
    try {
      if (document.GetTable(name, tab)) document.SetVisibleTab(tab[0]);
    } finally {
      name.dispose();
    }
  }
}

/** Records the actual selected sheet by name from the document's view hint. @param document - Actual document. @returns Primary view entries. */
export function WriteUserDataSequence(document: ScDocument): ViewSettings {
  const tab = document.GetVisibleTab();
  const name = new OUString();
  try {
    return document.IsVisible(tab) && document.GetName(tab, name)
      ? [
          [
            ["ViewId", "view1"],
            [SC_ACTIVETABLE, text(name)],
          ],
        ]
      : [];
  } finally {
    name.dispose();
  }
}
