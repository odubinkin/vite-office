/** @fileoverview Extracted single-paragraph GetItemScriptType range/caret algorithm from impedit2.cxx over actual resolved ESelection and initialized ScriptTypePosInfo values;no synthetic EditEngine or paragraph provider. */
import { ESelection } from "../../inc/ESelection";
import type { ScriptTypePosInfo } from "../../inc/ParagraphPortion";
import {
  SvtScriptType,
  FromI18NToSvtScriptType,
  GetScriptTypeOfLanguage,
} from "../../../svl/inc/languageoptions";
import { WEAK } from "../../../offapi/com/sun/star/i18n/ScriptType";

/** Original scalar range/caret operation for one existing paragraph;CreateSel bounds and InitScriptTypes belong to the actual caller. Native endpoint-only membership is intentionally preserved. @param types - Actual initialized paragraph script data. @param selection - Actual resolved single-paragraph selection. @param language - Actual default language. @returns Source script flags. */
export function getSingleParagraphItemScriptType(
  types: readonly Readonly<ScriptTypePosInfo>[],
  selection: ESelection,
  language: number,
): SvtScriptType {
  if (selection.start.nPara !== selection.end.nPara)
    throw new Error("Single-paragraph script lookup requires one resolved paragraph.");
  const range = new ESelection(selection);
  range.Adjust();
  let start = range.start.nIndex,
    end = range.end.nIndex;
  if (start === end) {
    if (start !== 0) --start;
    else ++end;
  }
  let script = SvtScriptType.NONE;
  for (const type of types) {
    const startInRange = type.nStartPos <= start && start < type.nEndPos;
    const endInRange = type.nStartPos < end && end <= type.nEndPos;
    if ((startInRange || endInRange) && type.nScriptType !== WEAK)
      script |= FromI18NToSvtScriptType(type.nScriptType);
  }
  return script !== SvtScriptType.NONE ? script : GetScriptTypeOfLanguage(language);
}
