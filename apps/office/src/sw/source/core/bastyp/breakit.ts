/** @fileoverview Native SwBreakIt script queries from breakit.cxx over pinned ICU and BreakIteratorImpl. Native language tags supply locales for the represented dictionary word path. */
import { getProcessComponentContext } from "../../../../comphelper/inc/processfactory";
import { BreakIterator } from "../../../../offapi/com/sun/star/i18n/BreakIterator";
import type { XBreakIteratorService } from "../../../../offapi/com/sun/star/i18n/XBreakIterator";
import type { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../../udkapi/com/sun/star/uno/XComponentContext";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { u_charType } from "../../../../external/icu/source/common/uchar";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { GetI18NScriptTypeOfLanguage, SvtScriptType } from "../../../../svl/inc/languageoptions";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { LanguageTag } from "../../../../i18nlangtag/source/languagetag/languagetag.value";
import type { LocaleConstReference } from "../../../../udkapi/com/sun/star/lang/Locale";
/** Logical OUString view adapter; preserves individual surrogate units. @param text - Native logical text. @returns Native code units. */
export function GetWriterTextUnits(text: string): Uint16Array {
  const units = new Uint16Array(text.length);
  for (let index = 0; index < text.length; ++index) units[index] = text.charCodeAt(index);
  return units;
}
/** Native script owner; the core module binding supplies the process instance at Writer initialization. */
export class SwBreakIt {
  private readonly m_xBreak = new BreakIteratorImpl();
  private wordBreak: Reference<XBreakIteratorService> | undefined;
  private m_xLanguageTag: LanguageTag | undefined;
  /** Original cached LanguageTag locale for one native language type. @param language - Native language ID. @returns Borrowed native locale. */
  public GetLocale(language: number): LocaleConstReference {
    if (this.m_xLanguageTag === undefined) this.m_xLanguageTag = new LanguageTag(language);
    else if (this.m_xLanguageTag.getLanguageType() !== language)
      this.m_xLanguageTag.reset(language);
    return this.m_xLanguageTag.getLocale();
  }
  /** Borrows the real represented native break service. @returns Shared service. */
  public GetBreakIter(): BreakIteratorImpl {
    return this.m_xBreak;
  }
  /** Lazily borrows the original process word-break service. @returns Locale-dispatching word iterator. */
  public GetWordBreakIter(): XBreakIteratorService {
    this.wordBreak ??= BreakIterator.create(
      getProcessComponentContext() as Reference<XComponentContext>,
    );
    return this.wordBreak.operatorStar();
  }
  /** Original weak-run resolution, next-mark preference and application language fallback. @param text - Logical native text. @param position - Native UTF16 position. @returns Native i18n script. */
  public GetRealScriptOfText(text: string, position: number): number {
    let script: number = ScriptType.WEAK;
    const units = GetWriterTextUnits(text);
    if (units.length !== 0) {
      if (position && position === units.length) --position;
      else if (position < 0) position = 0;
      script = this.m_xBreak.getScriptType(units, position);
      if (script === ScriptType.WEAK && position >= 0 && position + 1 < units.length) {
        // Source deliberately examines one UTF16 unit, not a decoded scalar.
        const category = u_charType(units[position + 1] as number);
        if (category === 6 || category === 7 || category === 8)
          script = this.m_xBreak.getScriptType(units, position + 1);
      }
      if (script === ScriptType.WEAK && position) {
        const change = this.m_xBreak.beginOfScript(units, position, script);
        if (change > 0) script = this.m_xBreak.getScriptType(units, change - 1);
      }
      if (script === ScriptType.WEAK) {
        const change = this.m_xBreak.endOfScript(units, position, script);
        if (units.length > change && change >= 0)
          script = this.m_xBreak.getScriptType(units, change);
      }
    }
    if (script === ScriptType.WEAK)
      script = GetI18NScriptTypeOfLanguage(getConfiguredSystemLanguage());
    return script;
  }
  /** Original all-script accumulation; an initial weak run returns all three strong bits. @param text - Logical native text. @returns Native SvtScriptType mask. */
  public GetAllScriptsOfText(text: string): SvtScriptType {
    const all = SvtScriptType.LATIN | SvtScriptType.ASIAN | SvtScriptType.COMPLEX;
    const units = GetWriterTextUnits(text);
    let result = SvtScriptType.NONE;
    for (let position = 0; position < units.length;) {
      const script = this.m_xBreak.getScriptType(units, position);
      if (script === ScriptType.LATIN) result |= SvtScriptType.LATIN;
      else if (script === ScriptType.ASIAN) result |= SvtScriptType.ASIAN;
      else if (script === ScriptType.COMPLEX) result |= SvtScriptType.COMPLEX;
      else if (result === SvtScriptType.NONE) result |= all;
      if (result === all) break;
      position = this.m_xBreak.endOfScript(units, position, script);
    }
    return result;
  }
}
/** Existing module initialization binding for Writer's process script owner. */
export const g_pBreakIt = new SwBreakIt();
