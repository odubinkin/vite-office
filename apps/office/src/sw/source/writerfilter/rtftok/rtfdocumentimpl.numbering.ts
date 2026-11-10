/** @fileoverview Original RTF numbering reference table delivery into DomainMapper and its retained ListsManager. */
import type { RtfDocumentImplContext } from "./rtfdocumentimpl.context";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { RTFReferenceTable } from "./rtfreferencetable";
import { ReferencePointer, type Properties } from "../inc/dmapper/resourcemodel";
import { RTFSprms } from "./rtfsprm";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
/** Original numbering table captures shared resource values at each LISTOVERRIDETABLE pop; the existing atomic document boundary delivers these actual references in source order. @param this - Actual reader. @returns Nothing. */
export function QueueListTable(this: RtfDocumentImplContext): void {
  QueueNumberingTable.call(this, this["m_aListTableSprms"]);
}
/** Original table callback payload is retained at the atomic boundary, including independent legacy PN tables. @param this - Actual reader. @param sprms - Native numbering table. @returns Nothing. */
export function QueueNumberingTable(this: RtfDocumentImplContext, sprms: RTFSprms): void {
  const empty = new RTFSprms(),
    properties = new ReferencePointer<Properties>(new RTFReferenceProperties(empty, sprms));
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

/** Original numbering phase of getProperties normalizes an owned paragraph copy using currently available source tables, before style deduplication. @param this - Actual reader. @param input - Original paragraph sprms. @returns Owned normalized sprms. */
export function GetNumberingProperties(this: RtfDocumentImplContext, input: RTFSprms): RTFSprms {
  const result = new RTFSprms(input),
    id = getNestedSprm(result, N.LN_CT_PPrBase_numPr, N.LN_CT_NumPr_numId);
  try {
    if (!id.is()) return result;
    const abstractId = this["m_aListOverrideTable"].get(id.operatorDereference().getInt()),
      abstract = abstractId === undefined ? undefined : this["m_aListTable"].get(abstractId);
    if (abstract?.is()) {
      const invalid = this["m_aInvalidListTableFirstIndents"].get(abstractId as number);
      if (invalid) result.deduplicateList(invalid);
      result.duplicateList(abstract);
    }
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  } finally {
    id.dispose();
  }
}
import { getNestedSprm } from "./rtfdocumentimpl.properties";
