/** @fileoverview Native document frame-format index cleanup and owning-table destruction fragments from docnew.cxx. Full document/default/layout destruction remains unported. */
import type { SwDoc } from "./doc";
import type { SwFormat } from "../attr/format";
/** Original lcl_DelFormatIndices clears borrowed effective content and anchor items in place, without item replacement or section deletion. @param format - Actual format. @returns Nothing. */
function DelFormatIndices(format: SwFormat): void {
  const content = format.GetContent();
  if (content.GetContentIdx()) content.SetNewContentIdx(null);
  const anchor = format.GetAnchor();
  if (anchor.GetAnchorNode()) anchor.SetAnchor(null);
}
/** Original early destructor loops over the represented actual ordinary/special collections before page descriptors are released. Section-format collection ownership is not represented. @param document - Actual document in destruction. @returns Nothing. */
export function ClearFrameFormatIndices(document: SwDoc): void {
  for (const format of document.GetFrameFormats()) DelFormatIndices(format);
  for (const format of document.GetSpzFrameFormats()) DelFormatIndices(format);
}
/** Original table teardown removes the separately owned default, destroys special fly formats, then destroys ordinary/special tables before later style/default teardown. It does not claim the remaining complete document destructor. @param document - Actual document in destruction. @returns Nothing. */
export function DestroyFrameFormatTables(document: SwDoc): void {
  const ordinary = document.GetFrameFormats(),
    special = document.GetSpzFrameFormats();
  ordinary.erase(ordinary.begin());
  special.DeleteAndDestroyAll();
  ordinary.Dispose();
  special.Dispose();
}
