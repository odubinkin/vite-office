/** @fileoverview Original sheet link lookup by source document from Calc linkuno.cxx. */
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ScDocument } from "../../../inc/document";
import type { ScTable } from "../../../inc/table";

/** Gets the first linked table for a document URL, matching native sheet link registration order. @param document - Workbook. @param name - Borrowed link file name. @returns Sheet supplying the shared link properties. */
export function GetSheetLinkByName(
  document: ScDocument,
  name: OUStringConstReference,
): ScTable | undefined {
  for (let tab = 0; tab < document.GetTableCount(); ++tab) {
    const table = document.FetchTable(tab);
    if (table?.IsLinked() && table.GetLinkDoc().equals(name)) return table;
  }
  return undefined;
}
