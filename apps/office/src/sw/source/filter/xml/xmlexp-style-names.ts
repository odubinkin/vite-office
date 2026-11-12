/** @fileoverview SwXMLExport named-paragraph XStyle name boundary into XMLStyleExport::exportStyle. Stable browser graph IDs resolve actual document-owned formats; no parallel style catalog is introduced. */
import { SwXStyle } from "../../core/unocore/unostyle";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import { encodeWriterOdfStyleName, getWriterOdfStyleName } from "../../../inc/poolfmt";
import { exportStyleNameAttributes } from "../../../../xmloff/source/style/styleexp";
/** Queries the actual style boundary and destroys returned native value and wrapper scopes. @param collection - Document-owned format. @returns Programmatic style name. */
function programmaticName(collection: SwTextFormatColl): string {
  const style = new SwXStyle(collection.GetDoc(), "ParagraphStyles", collection),
    name = style.getName();
  try {
    let result = "";
    for (let index = 0; index < name.getLength(); index++)
      result += String.fromCharCode(name.getStr()[index] as number);
    return result;
  } finally {
    name.dispose();
    style.dispose();
  }
}
/** Resolves browser graph references through actual XStyle names before native XML name encoding. @param document - Actual document. @param id - Existing graph style identity. @returns Encoded current style name or existing unmaterialized-pool fallback. */
export function getParagraphOdfStyleName(document: SwDoc, id: string): string {
  const collection = document.FindTextFormatColl(id);
  return collection === undefined
    ? getWriterOdfStyleName(id)
    : encodeWriterOdfStyleName(programmaticName(collection));
}
/** Original named style export uses its programmatic name, with display-name only when encoding changes it. @param collection - Actual named style. @returns XML name attributes. */
export function exportParagraphStyleNameAttributes(collection: SwTextFormatColl): string {
  const name = programmaticName(collection);
  return exportStyleNameAttributes(name, encodeWriterOdfStyleName(name));
}
