/** @fileoverview Original logical transliteration_commonclass methods over actual Locale/OUString/Sequence owners. WeakImplHelper/query/factory/service registration remains unported; no XInterface facade is supplied. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import type { TransliterationModules } from "../../../offapi/com/sun/star/i18n/TransliterationModules";
/** Erased native Sequence<OUString> specialization and sizeof(OUString). */
const Strings = Sequence.specialize<ReturnType<OUString["getDataAddress"]>>("OUString", 8);
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Native common logical base; native interface ownership and process ABI are distinct unimplemented responsibilities. */
export abstract class transliteration_commonclass {
  protected readonly aLocale = new Locale();
  protected transliterationName = "";
  protected implementationName = "";
  /** Explicit binding for native implicit Locale member destruction in logical owners. @returns Nothing. */
  public dispose(): void {
    this.aLocale.dispose();
  }
  /** Erases native ASCII literals/pointers through the real constructor. @param value - Native ASCII name. @returns Owned string. */
  private static ascii(value: string): OUString {
    const bytes = new Uint8Array(value.length + 1);
    for (let i = 0; i < value.length; i++) bytes[i] = value.charCodeAt(i);
    return OUString.createFromAscii(bytes);
  }
  /** Erases native initializer_list<OUString> construction without replacing Sequence value ownership. @param values - Borrowed actual values. @returns Owned sequence. */
  protected static strings(
    values: readonly OUString[],
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    const cells = new Map<number, ReturnType<OUString["getDataAddress"]>>();
    for (let i = 0; i < values.length; i++)
      cells.set(i * 8, (values[i] as OUString).getDataAddress());
    return new Strings(cells, values.length);
  }
  /** Original module name. @returns Owned string. */
  public getName(): OUString {
    return transliteration_commonclass.ascii(this.transliterationName);
  }
  /** Original module type virtual operation. @returns Type mask. */
  public abstract getType(): number;
  /** Original base load ignores the module argument and copies Locale. @param module - Unused original module. @param locale - Borrowed locale. @returns Nothing. */
  public loadModule(module: TransliterationModules, locale: LocaleConstReference): void {
    void module;
    this.aLocale.assign(locale);
  }
  /** Original unsupported base operation. @param modules - Unused declared enum sequence. @param locale - Unused locale. @returns Never. */
  public loadModuleNew(modules: Sequence<[number]>, locale: LocaleConstReference): void {
    void modules;
    void locale;
    throw new RuntimeException();
  }
  /** Original unsupported base operation. @param name - Unused implementation name. @param locale - Unused locale. @returns Never. */
  public loadModuleByImplName(name: OUStringConstReference, locale: LocaleConstReference): void {
    void name;
    void locale;
    throw new RuntimeException();
  }
  /** Original unsupported base operation. @param names - Unused names. @param locale - Unused locale. @returns Never. */
  public loadModulesByImplNames(
    names: Sequence<ReturnType<OUString["getDataAddress"]>>,
    locale: LocaleConstReference,
  ): void {
    void names;
    void locale;
    throw new RuntimeException();
  }
  /** Original unsupported base operation. @param locale - Unused locale. @param type - Unused type. @returns Never. */
  public getAvailableModules(
    locale: LocaleConstReference,
    type: number,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    void locale;
    void type;
    throw new RuntimeException();
  }
  /** Original final forwarding operation. @param input - String. @param start - UTF16 start. @param count - Unit count. @param offset - Actual output owner. @returns Mapped string. */
  public transliterate(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]>,
  ): OUString {
    return this.transliterateImpl(input, start, count, offset);
  }
  /** Original final folding forwarding. @param input - String. @param start - UTF16 start. @param count - Unit count. @param offset - Actual output owner. @returns Folded string. */
  public folding(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]>,
  ): OUString {
    return this.foldingImpl(input, start, count, offset);
  }
  /** Original null-offset forwarding. @param input - String. @param start - UTF16 start. @param count - Unit count. @returns Mapped string. */
  public transliterateString2String(
    input: OUStringConstReference,
    start: number,
    count: number,
  ): OUString {
    return this.transliterateImpl(input, start, count, null);
  }
  /** Original qualified base call still dispatches virtual transliterateImpl. @param unit - Native Unicode unit. @returns Mapped string. */
  public transliterateChar2String(unit: number): OUString {
    const value = new OUString(new Uint16Array([unit]), 1);
    try {
      return transliteration_commonclass.prototype.transliterateString2String.call(
        this,
        value,
        0,
        1,
      );
    } finally {
      value.dispose();
    }
  }
  /** Original scalar virtual operation. @param unit - Native Unicode unit. @returns Mapped unit. */
  public abstract transliterateChar2Char(unit: number): number;
  /** Original equality virtual contract. @param first - First string. @param pos1 - Start. @param count1 - Count. @param match1 - Match output. @param second - Second string. @param pos2 - Start. @param count2 - Count. @param match2 - Match output. @returns Equality. */
  public abstract equals(
    first: OUStringConstReference,
    pos1: number,
    count1: number,
    match1: [number],
    second: OUStringConstReference,
    pos2: number,
    count2: number,
    match2: [number],
  ): boolean;
  /** Original range operation. @param first - Lower input. @param second - Upper input. @returns Owned strings. */
  public abstract transliterateRange(
    first: OUString,
    second: OUString,
  ): Sequence<ReturnType<OUString["getDataAddress"]>>;
  /** Original transformed-unit difference rather than normalized sign. @param first - First string. @param off1 - Start. @param len1 - Count. @param second - Second string. @param off2 - Start. @param len2 - Count. @returns Native difference. */
  public compareSubstring(
    first: OUStringConstReference,
    off1: number,
    len1: number,
    second: OUStringConstReference,
    off2: number,
    len2: number,
  ): number {
    const offset1 = new Integers(2 * len1),
      offset2 = new Integers(2 * len2);
    let value1: OUString | undefined, value2: OUString | undefined;
    try {
      value1 = this.transliterate(first, off1, len1, offset1);
      value2 = this.transliterate(second, off2, len2, offset2);
      let left = value1.getLength(),
        right = value2.getLength(),
        index = 0;
      while (left !== 0 && right !== 0) {
        const difference = (value1.getStr()[index] as number) - (value2.getStr()[index] as number);
        if (difference !== 0) return difference;
        index++;
        left--;
        right--;
      }
      return left - right;
    } finally {
      value2?.dispose();
      value1?.dispose();
      offset2.dispose();
      offset1.dispose();
    }
  }
  /** Original complete-string forwarding. @param first - String. @param second - String. @returns Comparison. */
  public compareString(first: OUStringConstReference, second: OUStringConstReference): number {
    return this.compareSubstring(first, 0, first.getLength(), second, 0, second.getLength());
  }
  /** Original implementation name. @returns Owned ASCII value. */
  public getImplementationName(): OUString {
    return transliteration_commonclass.ascii(this.implementationName);
  }
  /** Original shared helper dispatch. The cast erases the unported C++ interface inheritance only; no query/acquire/release implementations are fabricated or claimed. @param name - Demanded service. @returns Exact membership. */
  public supportsService(name: OUString): boolean {
    return supportsService(this as unknown as XServiceInfo, name);
  }
  /** Original single supported localization service name. @returns Owned actual sequence. */
  public getSupportedServiceNames(): Sequence<ReturnType<OUString["getDataAddress"]>> {
    const name = transliteration_commonclass.ascii("com.sun.star.i18n.Transliteration.l10n");
    try {
      return transliteration_commonclass.strings([name]);
    } finally {
      name.dispose();
    }
  }
  /** Original mapping implementation contract. @param input - String. @param start - Start. @param count - Count. @param offset - Optional actual output. @returns Mapped value. */
  protected abstract transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString;
  /** Original folding implementation contract. @param input - String. @param start - Start. @param count - Count. @param offset - Optional actual output. @returns Folded value. */
  protected abstract foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString;
}
