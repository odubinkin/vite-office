/** @fileoverview Native SwDoc::IsUsed paragraph and numbering-rule overloads from poolfmt.cxx over represented owner graphs. */
import type { SwDoc } from "./doc";
import type { SwTextFormatColl } from "./fmtcol";
import type { SwFormat } from "../attr/format";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwNumRule } from "./number";

/** Original numbering predicate includes direct text/style clients, redlines and nodes in the matching default list; paragraph use follows original transitive format clients. @param document - Owning Writer document. @param format - Native style identity. @returns Original used-state predicate. */
export function IsUsed(document: SwDoc, format: SwTextFormatColl | SwNumRule): boolean {
  if (format instanceof SwNumRule) {
    const list = document.GetDocumentListsManager().GetListByName(format.GetDefaultListId());
    return (
      format.GetTextNodeListSize() > 0 ||
      format.GetParagraphStyleListSize() > 0 ||
      format.IsUsedByRedline() ||
      (list !== undefined && list.GetDefaultListStyleName() === format.GetName() && list.HasNodes())
    );
  }
  for (const node of document.GetNodes().entries()) {
    if (!(node instanceof SwTextNode)) continue;
    let owner: SwFormat | undefined = node.GetTextFormatColl();
    while (owner !== undefined) {
      if (owner === format) return true;
      owner = owner.DerivedFrom();
    }
  }
  return false;
}
