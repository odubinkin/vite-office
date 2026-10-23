/** @fileoverview Original SvtLanguageOptions script-value conversion functions; actual existing platform/configured language fields supply system resolution, not a new LanguageTag service. */
import { SvtScriptType } from "../../inc/languageoptions";
import { getConfiguredSystemLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType } from "../../../i18nlangtag/source/isolang/mslangid.script";
import {
  LANGUAGE_DONTKNOW,
  LANGUAGE_ENGLISH_US,
  LANGUAGE_SYSTEM,
  LANGUAGE_PROCESS_OR_USER_DEFAULT,
} from "../../../i18nlangtag/inc/lang";
import * as ScriptType from "../../../offapi/com/sun/star/i18n/ScriptType";
/** Original scalar script conversion. @param script - Native i18n script. @returns Original flags. */
export function FromI18NToSvtScriptType(script: number): SvtScriptType {
  switch (script) {
    case ScriptType.LATIN:
      return SvtScriptType.LATIN;
    case ScriptType.ASIAN:
      return SvtScriptType.ASIAN;
    case ScriptType.COMPLEX:
      return SvtScriptType.COMPLEX;
    default:
      return SvtScriptType.NONE;
  }
}
/** Original language query over the existing real system/configuration boundary. @param language - Original native language. @returns Original script flags. */
export function GetScriptTypeOfLanguage(language: number): SvtScriptType {
  if (language === LANGUAGE_DONTKNOW) language = LANGUAGE_ENGLISH_US;
  else if (language === LANGUAGE_SYSTEM || language === LANGUAGE_PROCESS_OR_USER_DEFAULT)
    language = getConfiguredSystemLanguage();
  const script = getScriptType(language);
  return script === ScriptType.ASIAN
    ? SvtScriptType.ASIAN
    : script === ScriptType.COMPLEX
      ? SvtScriptType.COMPLEX
      : SvtScriptType.LATIN;
}
/** Original inverse scalar script conversion, including NONE/UNKNOWN's zero. @param script - Native flags. @returns Original i18n value. */
export function FromSvtScriptTypeToI18N(script: SvtScriptType): number {
  switch (script) {
    case SvtScriptType.LATIN:
      return ScriptType.LATIN;
    case SvtScriptType.ASIAN:
      return ScriptType.ASIAN;
    case SvtScriptType.COMPLEX:
      return ScriptType.COMPLEX;
    default:
      return 0;
  }
}
/** Original composed language-to-i18n query. @param language - Native language. @returns Native i18n script. */
export function GetI18NScriptTypeOfLanguage(language: number): number {
  return FromSvtScriptTypeToI18N(GetScriptTypeOfLanguage(language));
}
