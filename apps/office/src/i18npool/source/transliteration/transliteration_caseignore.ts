/** @fileoverview Original Transliteration_caseignore module, static range owners and iterator comparison; incomplete final expansions and match/sign outputs are preserved. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { MappingType, MappingElement } from "../../../i18nutil/inc/casefolding";
import { getNextChar } from "../../../i18nutil/source/utility/casefolding";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { TransliterationModules } from "../../../offapi/com/sun/star/i18n/TransliterationModules";
import { IGNORE } from "../../../offapi/com/sun/star/i18n/TransliterationType";
import {
  Transliteration_body,
  Transliteration_u2l,
  Transliteration_l2u,
} from "./transliteration_body";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Original function-local static owners are initialized on the first range call. */
let rangeLower: Transliteration_u2l | undefined, rangeUpper: Transliteration_l2u | undefined;
/** Original case-ignore logical module; service factory/interface ownership remains separate. */
export class Transliteration_caseignore extends Transliteration_body {
  private moduleLoaded = TransliterationFlags.NONE;
  /** Original full folding and names. @returns Module. */
  constructor() {
    super();
    this.nMappingType = MappingType.FullFolding;
    this.transliterationName = "case ignore (generic)";
    this.implementationName = "com.sun.star.i18n.Transliteration.IGNORE_CASE";
  }
  /** Original flags accumulate rather than replace. @param module - Native module mask. @param locale - Borrowed locale. @returns Nothing. */
  public override loadModule(module: TransliterationModules, locale: LocaleConstReference): void {
    this.moduleLoaded |= module;
    this.aLocale.assign(locale);
  }
  /** Original ignore type. @returns IGNORE. */
  public override getType(): number {
    return IGNORE;
  }
  /** Original one-unit range and lazy static simple-case modules. @param first - Lower string. @param second - Upper string. @returns Two or four owned values. */
  public override transliterateRange(
    first: OUString,
    second: OUString,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    if (first.getLength() !== 1 || second.getLength() !== 1) throw new RuntimeException();
    rangeLower ??= new Transliteration_u2l();
    rangeUpper ??= new Transliteration_l2u();
    rangeLower.loadModule(TransliterationModules.END_OF_MODULE, this.aLocale);
    rangeUpper.loadModule(TransliterationModules.END_OF_MODULE, this.aLocale);
    const l1 = rangeLower.transliterateString2String(first, 0, 1),
      u1 = rangeUpper.transliterateString2String(first, 0, 1),
      l2 = rangeLower.transliterateString2String(second, 0, 1),
      u2 = rangeUpper.transliterateString2String(second, 0, 1);
    try {
      return Transliteration_caseignore.strings(
        l1.equals(u1) && l2.equals(u2) ? [l1, l2] : [l1, l2, u1, u2],
      );
    } finally {
      u2.dispose();
      l2.dispose();
      u1.dispose();
      l1.dispose();
    }
  }
  /** Original equality delegates to compare and preserves relative match outputs. @param first - String. @param pos1 - Start. @param count1 - Count. @param match1 - Output. @param second - String. @param pos2 - Start. @param count2 - Count. @param match2 - Output. @returns Equality. */
  public override equals(
    first: OUStringConstReference,
    pos1: number,
    count1: number,
    match1: [number],
    second: OUStringConstReference,
    pos2: number,
    count2: number,
    match2: [number],
  ): boolean {
    return this.compare(first, pos1, count1, match1, second, pos2, count2, match2) === 0;
  }
  /** Original comparison with discarded match outputs. @param first - String. @param off1 - Start. @param len1 - Count. @param second - String. @param off2 - Start. @param len2 - Count. @returns Original comparison sign. */
  public override compareSubstring(
    first: OUStringConstReference,
    off1: number,
    len1: number,
    second: OUStringConstReference,
    off2: number,
    len2: number,
  ): number {
    return this.compare(first, off1, len1, [0], second, off2, len2, [0]);
  }
  /** Original complete-string compare. @param first - String. @param second - String. @returns Original comparison sign. */
  public override compareString(
    first: OUStringConstReference,
    second: OUStringConstReference,
  ): number {
    return this.compare(first, 0, first.getLength(), [0], second, 0, second.getLength(), [0]);
  }
  /** Original NOT_END expressions, iterator calls, decrement-before-mismatch and source length sign. @param first - String. @param pos1 - Start. @param count1 - Count. @param match1 - Output. @param second - String. @param pos2 - Start. @param count2 - Count. @param match2 - Output. @returns Original comparison. */
  private compare(
    first: OUStringConstReference,
    pos1: number,
    count1: number,
    match1: [number],
    second: OUStringConstReference,
    pos2: number,
    count2: number,
    match2: [number],
  ): number {
    const source1 = first.getStr().subarray(pos1),
      source2 = second.getStr().subarray(pos2),
      e1 = new MappingElement(),
      e2 = new MappingElement();
    match1[0] = 0;
    match2[0] = 0;
    while (
      (match1[0] < count1 || e1.current < e1.element.nmap) &&
      (match2[0] < count2 || e2.current < e2.element.nmap)
    ) {
      const c1 = getNextChar(
          source1,
          match1,
          count1,
          e1,
          this.aLocale,
          this.nMappingType,
          this.moduleLoaded,
        ),
        c2 = getNextChar(
          source2,
          match2,
          count2,
          e2,
          this.aLocale,
          this.nMappingType,
          this.moduleLoaded,
        );
      if (c1 !== c2) {
        match1[0]--;
        match2[0]--;
        return c1 > c2 ? 1 : -1;
      }
    }
    const remaining1 = match1[0] < count1 || e1.current < e1.element.nmap,
      remaining2 = match2[0] < count2 || e2.current < e2.element.nmap;
    return !remaining1 && !remaining2 ? 0 : remaining1 ? 1 : -1;
  }
}
/** Existing bounded TextSearch folding boundary now invokes actual module/Sequence operations. Aggregate service/default-mode activation remains unported. @param input - Original input. @param start - Start. @param count - Count. @param locale - Borrowed locale. @returns Mapped value and source offsets. */
export function transliterateCaseFolding(
  input: OUStringConstReference,
  start: number,
  count: number,
  locale: LocaleConstReference,
): { text: OUString; offsets: readonly number[] } {
  const module = new Transliteration_caseignore(),
    offset = new Integers();
  try {
    module.loadModule(TransliterationModules.IGNORE_CASE, locale);
    const text = module.transliterate(input, start, count, offset),
      offsets: number[] = [];
    for (let i = 0; i < offset.getLength(); i++) offsets.push(offset.operatorIndex(i)[0]);
    return { text, offsets };
  } finally {
    offset.dispose();
    module.dispose();
  }
}
