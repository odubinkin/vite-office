/** @fileoverview Original GetScriptType selection traversal's layout-absent text branch from edattr.cxx over the real BreakIteratorImpl; field expansion/merged cached ScriptInfo services remain unrepresented. */
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { iterateCodePoints } from "../../../../o3tl/inc/string_view";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import {
  SvtScriptType,
  GetScriptTypeOfLanguage,
  FromI18NToSvtScriptType,
} from "../../../../svl/inc/languageoptions";
import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
/** Original flags over actual native ranges; empty/weak-only uses native language fallback rather than a hardcoded Latin service. @param document - Native document. @param cursor - Native ring. @returns Original script mask. */
export function getSwSelectionScriptType(document: SwDoc, cursor: SwPaM): SvtScriptType {
  const iterator = new BreakIteratorImpl();
  let result: number = SvtScriptType.NONE;
  for (const current of cursor.GetRingContainer()) {
    const start = current.Start(),
      end = current.End();
    for (let index = start.GetNodeIndex(); index <= end.GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      const text = Uint16Array.from(
        { length: node.Len() },
        /** Preserves original UTF16 code units. @param unused - Placeholder. @param position - Original offset. @returns Code unit. */ (
          _,
          position,
        ) => node.GetText().charCodeAt(position),
      );
      if (start.compare(end) === 0) {
        const position: [number] = [start.GetContentIndex()];
        if (position[0] > 0) iterateCodePoints(text, position, -1);
        result |=
          text.length === 0
            ? GetScriptTypeOfLanguage(getConfiguredSystemLanguage())
            : FromI18NToSvtScriptType(iterator.getScriptType(text, position[0]));
      } else {
        let position = index === start.GetNodeIndex() ? start.GetContentIndex() : 0;
        const limit = Math.min(
          index === end.GetNodeIndex() ? end.GetContentIndex() : text.length,
          text.length,
        );
        while (position < limit) {
          const script = iterator.getScriptType(text, position);
          result |= FromI18NToSvtScriptType(script);
          if (result === 7) break;
          position = iterator.endOfScript(text, position, script);
        }
      }
      if (result === 7) break;
    }
    if (result === 7) break;
  }
  return result === SvtScriptType.NONE
    ? GetScriptTypeOfLanguage(LANGUAGE_SYSTEM)
    : (result as SvtScriptType);
}
