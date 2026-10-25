/** @fileoverview Extracted single-paragraph GetItemScriptType range/caret algorithm from impedit2.cxx over actual resolved ESelection and initialized ScriptTypePosInfo values;no synthetic EditEngine or paragraph provider. */
import { ESelection } from "../../inc/ESelection";
import { ScriptTypePosInfo } from "../../inc/ParagraphPortion";
import {
  SvtScriptType,
  FromI18NToSvtScriptType,
  GetScriptTypeOfLanguage,
  GetI18NScriptTypeOfLanguage,
} from "../../../svl/inc/languageoptions";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  MakeDirectionChangeScanner,
  MakeScriptChangeScanner,
  ScriptHintProvider,
} from "../../../i18nutil/inc/scriptchangescanner";
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

/** Original InitScriptTypes path for one literal paragraph without fields or script-hint attributes,as used for a style label. The actual caller supplies default language and resolved paragraph direction;no EditEngine service or alternate cache is fabricated. @param text - Actual paragraph text. @param language - Actual engine default language. @param rightToLeft - Actual resolved writing direction. @returns Native script-position values. */
export function initPlainParagraphScriptTypes(
  text: OUStringConstReference,
  language: number,
  rightToLeft: boolean,
): ScriptTypePosInfo[] {
  const types: ScriptTypePosInfo[] = [];
  if (text.isEmpty()) return types;
  const direction = MakeDirectionChangeScanner(text, rightToLeft ? 1 : 0);
  const scanner = MakeScriptChangeScanner(
    text,
    GetI18NScriptTypeOfLanguage(language),
    direction,
    new ScriptHintProvider(),
  );
  while (!scanner.AtEnd() || types.length === 0) {
    const change = scanner.Peek();
    types.push(
      new ScriptTypePosInfo(change.m_nScriptType, change.m_nStartIndex, change.m_nEndIndex),
    );
    scanner.Advance();
  }
  return types;
}
