/** @fileoverview Original RTF numbering reference table delivery into DomainMapper and its retained ListsManager. */
import type { RtfDocumentImplContext } from "./rtfdocumentimpl.context";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { RTFReferenceTable } from "./rtfreferencetable";
import { ReferencePointer, type Properties } from "../inc/dmapper/resourcemodel";
import { RTFSprms } from "./rtfsprm";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
/** Original numbering table captures shared resource values at each LISTOVERRIDETABLE pop; the existing atomic document boundary delivers these actual references in source order. @param this - Actual reader. @returns Nothing. */
export function QueueListTable(this: RtfDocumentImplContext): void {
  const empty = new RTFSprms(),
    properties = new ReferencePointer<Properties>(
      new RTFReferenceProperties(empty, this["m_aListTableSprms"]),
    );
  try {
    this["m_aListTables"].push(new RTFReferenceTable(new Map([[0, properties]])));
  } finally {
    properties.clear();
    empty.dispose();
  }
}
/** Native table delivery is performed once per original callback, preserving repeated cumulative tables and existing definitions. @param this - Actual reader. @returns Nothing. */
export function PrepareListNumbering(this: RtfDocumentImplContext): void {
  for (const table of this["m_aListTables"]) this["Mapper"]().table(N.LN_NUMBERING, table);
}
