/** @fileoverview Original global.cxx calculation state used by segment index readiness; other ScGlobal services remain separate unimplemented responsibilities. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { OUString } from "../../../../sal/inc/rtl/ustring";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { getConfiguredSystemUILanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType, ScriptType } from "../../../../i18nlangtag/source/isolang/mslangid.script";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { EditTextObject, type EditTextObjectConstReference } from "../../../../editeng/inc/editobj";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { TransliterationWrapper } from "../../../../unotools/source/i18n/transliterationwrapper";
import { TransliterationFlags } from "../../../../i18nutil/inc/transliteration";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_APPLE_ROMAN,
  RTL_TEXTENCODING_IBM_437,
  RTL_TEXTENCODING_IBM_850,
  RTL_TEXTENCODING_IBM_860,
  RTL_TEXTENCODING_IBM_861,
  RTL_TEXTENCODING_IBM_863,
  RTL_TEXTENCODING_IBM_865,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../../../../sal/inc/rtl/textenc";
/** Original ScGlobal state owner, with the source-initialized threaded-group flag. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original ScGlobal static state owner.
export class ScGlobal {
  private static transliteration: TransliterationWrapper | null = null;
  /** Original process-wide IGNORE_CASE transliterator initialized for the office language. @returns Shared wrapper. */
  static GetTransliteration(): TransliterationWrapper {
    if (!this.transliteration) {
      const wrapper = new TransliterationWrapper(TransliterationFlags.IGNORE_CASE);
      wrapper.loadModuleIfNeeded(getConfiguredSystemUILanguage());
      this.transliteration = wrapper;
    }
    return this.transliteration;
  }
  /** Maps the source CSV charset token, including legacy aliases, to its native encoding. @param value - Persistent token. @returns Encoding. */
  static GetCharsetValue(value: string): rtl_TextEncoding {
    if (/^[0-9]+$/.test(value)) {
      const number = toInt32(value);
      return number === RTL_TEXTENCODING_DONTKNOW ? RTL_TEXTENCODING_UTF8 : number;
    }
    switch (value.toUpperCase()) {
      case "ANSI":
        return RTL_TEXTENCODING_MS_1252;
      case "MAC":
        return RTL_TEXTENCODING_APPLE_ROMAN;
      case "IBMPC_437":
        return RTL_TEXTENCODING_IBM_437;
      case "IBMPC":
      case "IBMPC_850":
        return RTL_TEXTENCODING_IBM_850;
      case "IBMPC_860":
        return RTL_TEXTENCODING_IBM_860;
      case "IBMPC_861":
        return RTL_TEXTENCODING_IBM_861;
      case "IBMPC_863":
        return RTL_TEXTENCODING_IBM_863;
      case "IBMPC_865":
        return RTL_TEXTENCODING_IBM_865;
      case "UTF8":
      case "UTF-8":
        return RTL_TEXTENCODING_UTF8;
      default:
        return RTL_TEXTENCODING_UTF8;
    }
  }
  /** Builds the original persistent charset token. @param value - Native encoding. @returns Token. */
  static GetCharsetString(value: rtl_TextEncoding): string {
    switch (value) {
      case RTL_TEXTENCODING_MS_1252:
        return "ANSI";
      case RTL_TEXTENCODING_APPLE_ROMAN:
        return "MAC";
      case RTL_TEXTENCODING_IBM_437:
        return "IBMPC_437";
      case RTL_TEXTENCODING_IBM_850:
        return "IBMPC_850";
      case RTL_TEXTENCODING_IBM_860:
        return "IBMPC_860";
      case RTL_TEXTENCODING_IBM_861:
        return "IBMPC_861";
      case RTL_TEXTENCODING_IBM_863:
        return "IBMPC_863";
      case RTL_TEXTENCODING_IBM_865:
        return "IBMPC_865";
      case RTL_TEXTENCODING_DONTKNOW:
        return "SYSTEM";
      default:
        return String(value);
    }
  }
  /** Original GetErrorString branch selection over the resolved English resource/symbol fields already used by this browser build. Native gettext/compiler symbol-map services are not fabricated here. @param error - Actual FormulaError. @returns Owned UTF16 error text. */
  static GetErrorString(error: FormulaError): OUString {
    switch (error) {
      case FormulaError.NoRef:
        return unicode("#REF!"); // STR_NO_REF_TABLE
      case FormulaError.NoAddin:
        return unicode("#ADDIN?"); // STR_NO_ADDIN
      case FormulaError.NoMacro:
        return unicode("#MACRO?"); // STR_NO_MACRO
      case FormulaError.NotAvailable:
        return unicode("#N/A"); // ocErrNA
      case FormulaError.NoName:
        return unicode("#NAME?"); // ocErrName
      case FormulaError.NoValue:
        return unicode("#VALUE!"); // ocErrValue
      case FormulaError.NoCode:
        return unicode("#NULL!"); // ocErrNull
      case FormulaError.DivisionByZero:
        return unicode("#DIV/0!"); // ocErrDivZero
      case FormulaError.IllegalFPOperation:
        return unicode("#NUM!"); // ocErrNum
      case FormulaError.Spill:
        return unicode("#SPILL!"); // ocErrSpill
      default:
        return unicode(`Err:${error}`); // STR_ERROR_STR plus original integer code.
    }
  }
  /** Original nullable rich-text comparison,including same-pointer fast path and nonvirtual base pool-insensitive Equals. @param left - Actual borrowed text or null. @param right - Actual borrowed text or null. @returns Native equality. */
  static EETextObjEqual(
    left: EditTextObjectConstReference | null,
    right: EditTextObjectConstReference | null,
  ): boolean {
    if (left === right) return true;
    return (
      left !== null &&
      right !== null &&
      EditTextObject.prototype.Equals.call(left as EditTextObject, right as EditTextObject)
    );
  }
  /** Original office-UI-language fallback for entirely weak cell strings. The real configured language is supplied by the existing browser settings port. @returns Nonempty native script flags. */
  static GetDefaultScriptType(): SvtScriptType {
    const script = getScriptType(getConfiguredSystemUILanguage());
    return script === ScriptType.ASIAN
      ? SvtScriptType.ASIAN
      : script === ScriptType.COMPLEX
        ? SvtScriptType.COMPLEX
        : SvtScriptType.LATIN;
  }
  /** Original system-following number-format language,retained by native Init. */
  public static eLnge = LANGUAGE_SYSTEM;
  /** Original mutable process calculation state, initialized false in global.cxx. */
  public static bThreadedGroupCalcInProgress = false;
  /** Native startup minimum before device-dependent InitTextHeight. */
  public static nStdRowHeight = 256;
}
