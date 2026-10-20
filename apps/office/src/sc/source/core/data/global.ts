/** @fileoverview Original global.cxx calculation state used by segment index readiness; other ScGlobal services remain separate unimplemented responsibilities. */
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { getConfiguredSystemUILanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType, ScriptType } from "../../../../i18nlangtag/source/isolang/mslangid.script";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
/** Original ScGlobal state owner, with the source-initialized threaded-group flag. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original ScGlobal static state owner.
export class ScGlobal {
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
