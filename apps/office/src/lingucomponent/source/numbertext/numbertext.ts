/** @fileoverview Original NumberText_Impl component and acquired constructor factory; installation paths bind to the packaged program root, without native filesystem or mutex ABI. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XNumberText } from "../../../offapi/com/sun/star/linguistic2/XNumberText";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import {
  Locale,
  cppu_detail_getUnoType_Locale,
  type LocaleConstReference,
} from "../../../udkapi/com/sun/star/lang/Locale";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Numbertext } from "../../../external/libnumbertext/src/Numbertext";
import { OUStringToOString, OStringToOUString } from "../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_ASCII_US, RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";

/** Actual original service component: source interfaces, weak ownership and per-instance language-module cache. */
export class NumberText_Impl
  extends WeakImplHelper.specialize(XNumberText, XServiceInfo)
  implements XNumberText, XServiceInfo
{
  private readonly m_aNumberText = new Numbertext();
  private m_bInitialized = false;
  /** Original recursion guard precedes deployment-path initialization; bundled modules use their package-root filenames. @returns Nothing. */
  private EnsureInitialized(): void {
    if (this.m_bInitialized) return;
    this.m_bInitialized = true;
    this.m_aNumberText.set_prefix("");
  }
  /** Original locale component order and script/country language-module key; missing library conversion retains input and no-match stays empty. @param input - Original complete text. @param locale - Actual target locale. @returns Owned result. */
  getNumberText(input: OUStringConstReference, locale: LocaleConstReference): OUString {
    this.EnsureInitialized();
    const tag = new LanguageTag(locale);
    try {
      const language = tag.getLanguage();
      try {
        const country = tag.getCountry();
        try {
          const script = tag.getScript();
          try {
            let code = text(language);
            if (script.getLength() !== 0) code += "-" + text(script);
            if (country.getLength() !== 0) code += "-" + text(country);
            const bytes = OUStringToOString(code, RTL_TEXTENCODING_ASCII_US);
            const langCode = String.fromCharCode(...bytes);
            // Original non-Windows SAL UTF8 boundary precedes the external interpreter.
            const number: [string] = [
              OStringToOUString(
                OUStringToOString(text(input), RTL_TEXTENCODING_UTF8),
                RTL_TEXTENCODING_UTF8,
              ),
            ];
            this.m_aNumberText.numbertext(number, langCode);
            // The accepted JS library returns Unicode directly; UTF8 bytes bind the source external-result transport.
            return OUString.fromUtf8(new TextEncoder().encode(number[0]));
          } finally {
            script.dispose();
          }
        } finally {
          country.dispose();
        }
      } finally {
        language.dispose();
      }
    } finally {
      tag.dispose();
    }
  }
  /** Original source TODO remains an empty Locale sequence, without enumerating packaged programs. @returns Owned empty sequence. */
  getAvailableLanguages(): Sequence<Locale> {
    return new (Sequence.specialize<Locale>(cppu_detail_getUnoType_Locale, 24))();
  }
  /** Original implementation identity. @returns Owned exact name. */
  getImplementationName(): OUString {
    return unicode("com.sun.star.lingu2.NumberText");
  }
  /** Original shared helper performs exact service-name membership. @param name - Demanded service. @returns Original predicate. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }
  /** Original single supported service name and actual addressed Sequence ownership. @returns Owned name sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = unicode("com.sun.star.linguistic2.NumberText");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        new Map([[0, name.getDataAddress()]]),
        1,
      );
    } finally {
      name.dispose();
    }
  }
}
/** Original component constructor ignores context/arguments and returns exactly one acquired root pointer. @param context - Original raw context pointer. @param arguments_ - Original Any arguments. @returns Acquired component. */
export function lingucomponent_NumberText_get_implementation(
  context: XComponentContext | null,
  arguments_: Sequence<Any>,
): XInterface {
  void context;
  void arguments_;
  return acquire(new NumberText_Impl());
}
