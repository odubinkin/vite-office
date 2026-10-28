/** @fileoverview Consumed native GetStringScriptType loop over original BreakIterator script runs;formatted-cell cache/services remain separate. */
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { XBreakIterator } from "../../../../offapi/com/sun/star/i18n/XBreakIterator";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
/** Original ScDocument string classification loop,ignoring weak runs. The service is borrowed explicitly at this consumed scope boundary;native GetBreakIterator's UNO factory is not emulated. @param string - Native logical UTF16 string. @param breakIterator - Actual script-query service or missing service. @returns Combined native flags. */
function lcl_GetStringScriptType(
  string: OUStringConstReference,
  breakIterator: XBreakIterator | null,
): SvtScriptType {
  let result = SvtScriptType.NONE;
  const text = string.getStr().subarray(0, string.getLength());
  if (text.length !== 0 && breakIterator !== null) {
    let pos = 0;
    do {
      const type = breakIterator.getScriptType(text, pos);
      switch (type) {
        case ScriptType.LATIN:
          result |= SvtScriptType.LATIN;
          break;
        case ScriptType.ASIAN:
          result |= SvtScriptType.ASIAN;
          break;
        case ScriptType.COMPLEX:
          result |= SvtScriptType.COMPLEX;
          break;
      }
      pos = breakIterator.endOfScript(text, pos, type);
    } while (pos >= 0 && pos < text.length);
  }
  return result;
}

import type { ScDocument } from "../../../inc/document";
import { ScScriptTypeData, type ScScriptServiceFactory } from "../inc/scrdata";
/** Original lazy script-service owner access, retaining the existing borrowed host factory binding. @param this - Actual document. @param factory - Existing actual service factory or unavailable port. @returns Actual iterator or null. */
export function GetBreakIterator(
  this: ScDocument,
  factory?: ScScriptServiceFactory,
): XBreakIterator | null {
  this["pScriptTypeData"] ??= new ScScriptTypeData();
  this["pScriptTypeData"].xBreakIter ??= factory?.() ?? null;
  return this["pScriptTypeData"].xBreakIter;
}
/** Original document-bound empty guard and actual service access before the existing native script-run loop. @param this - Actual document. @param string - Actual Unicode input. @param factory - Existing host factory binding. @returns Script flags. */
export function GetStringScriptType(
  this: ScDocument,
  string: OUStringConstReference,
  factory?: ScScriptServiceFactory,
): SvtScriptType {
  return string.getLength() === 0
    ? SvtScriptType.NONE
    : lcl_GetStringScriptType(string, this.GetBreakIterator(factory));
}
