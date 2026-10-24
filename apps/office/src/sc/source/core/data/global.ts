/** @fileoverview Original global.cxx calculation state used by segment index readiness; other ScGlobal services remain separate unimplemented responsibilities. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { OUString } from "../../../../sal/inc/rtl/ustring";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { getConfiguredSystemUILanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType, ScriptType } from "../../../../i18nlangtag/source/isolang/mslangid.script";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { EditTextObject, type EditTextObjectConstReference } from "../../../../editeng/inc/editobj";
/** Original ScGlobal state owner, with the source-initialized threaded-group flag. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original ScGlobal static state owner.
export class ScGlobal {
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
