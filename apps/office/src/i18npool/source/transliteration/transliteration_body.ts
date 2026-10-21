/** @fileoverview Original Transliteration_body/casemapping/u2l/l2u/toggle owners and consumed uppercase binding. Title/sentence word-service overrides remain unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { MultipleCharsOutputException } from "../../../offapi/com/sun/star/i18n/MultipleCharsOutputException";
import { ONE_TO_ONE } from "../../../offapi/com/sun/star/i18n/TransliterationType";
import { getValue } from "../../../i18nutil/source/utility/casefolding";
import { unicode } from "../../../i18nutil/source/utility/unicode";
import { MappingType, NMAPPINGMAX } from "../../../i18nutil/inc/casefolding";
import { transliteration_commonclass } from "./transliteration_commonclass";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Original toggle decision preserves the source numeric category bit test. @param mapping - Original mapping flags. @param unit - Current unit. @returns Per-unit mapping. */
function lcl_getMappingTypeForToggleCase(mapping: MappingType, unit: number): MappingType {
  if (mapping === (MappingType.LowerToUpper | MappingType.UpperToLower))
    return (unicode.getUnicodeType(unit) & 0x02) !== 0
      ? MappingType.LowerToUpper
      : MappingType.UpperToLower;
  return mapping;
}
/** Original shared mapping owner. Typed-array allocation erases stack/heap storage choice without changing output or Sequence assignment. */
export class Transliteration_body extends transliteration_commonclass {
  protected nMappingType = MappingType.NONE;
  /** Original body names and default mapping. @returns Module. */
  constructor() {
    super();
    this.transliterationName = "Transliteration_body";
    this.implementationName = "com.sun.star.i18n.Transliteration.Transliteration_body";
  }
  /** Original type, including expanding body mappings. @returns ONE_TO_ONE. */
  public override getType(): number {
    return ONE_TO_ONE;
  }
  /** Original unsupported body equality. @param first - Unused string. @param pos1 - Unused position. @param count1 - Unused count. @param match1 - Unused output. @param second - Unused string. @param pos2 - Unused position. @param count2 - Unused count. @param match2 - Unused output. @returns Never. */
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
    void first;
    void pos1;
    void count1;
    void match1;
    void second;
    void pos2;
    void count2;
    void match2;
    throw new RuntimeException();
  }
  /** Original range copies whole input strings, including empty values. @param first - String. @param second - String. @returns Owned actual sequence. */
  public override transliterateRange(
    first: OUString,
    second: OUString,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    return Transliteration_body.strings([first, second]);
  }
  /** Original mapping loops and per-expansion absolute input offsets. @param input - String. @param start - UTF16 start. @param count - Input units. @param offset - Optional actual output owner. @returns Mapped value. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const source = input.getStr().subarray(start),
      out = new Uint16Array(count * NMAPPINGMAX);
    let written = 0;
    if (offset !== null) {
      const cells = new Map<number, [number]>();
      for (let i = 0; i < count; i++) {
        const mapping = getValue(
          source,
          i,
          count,
          this.aLocale,
          lcl_getMappingTypeForToggleCase(this.nMappingType, source[i] as number),
        );
        for (let j = 0; j < mapping.nmap; j++) cells.set((written + j) * 4, [i + start]);
        out.set(mapping.map.subarray(0, mapping.nmap), written);
        written += mapping.nmap;
      }
      const value = new Integers(cells, written);
      try {
        offset.assign(value);
      } finally {
        value.dispose();
      }
    } else {
      for (let i = 0; i < count; i++) {
        const mapping = getValue(
          source,
          i,
          count,
          this.aLocale,
          lcl_getMappingTypeForToggleCase(this.nMappingType, source[i] as number),
        );
        out.set(mapping.map.subarray(0, mapping.nmap), written);
        written += mapping.nmap;
      }
    }
    return new OUString(out.subarray(0, written), written);
  }
  /** Original scalar mapping does not call the string-loop toggle helper. @param unit - Native Unicode unit. @returns Mapped native value. */
  public override transliterateChar2String(unit: number): OUString {
    const mapping = getValue(new Uint16Array([unit]), 0, 1, this.aLocale, this.nMappingType);
    return new OUString(mapping.map.subarray(0, mapping.nmap), mapping.nmap);
  }
  /** Original scalar multiple-output exception, not a replacement/fallback character. @param unit - Native Unicode unit. @returns Single mapped unit. */
  public override transliterateChar2Char(unit: number): number {
    const mapping = getValue(new Uint16Array([unit]), 0, 1, this.aLocale, this.nMappingType);
    if (mapping.nmap > 1) throw new MultipleCharsOutputException();
    return mapping.map[0] as number;
  }
  /** Original folding delegates to mapping. @param input - String. @param start - Start. @param count - Count. @param offset - Optional actual output. @returns Folded value. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    return this.transliterateImpl(input, start, count, offset);
  }
}
/** Original mutable generic mapping owner. */
export class Transliteration_casemapping extends Transliteration_body {
  /** Original generic names/default. @returns Module. */
  constructor() {
    super();
    this.transliterationName = "casemapping(generic)";
    this.implementationName = "com.sun.star.i18n.Transliteration.Transliteration_casemapping";
  }
  /** Original conditional field assignment. @param mapping - Native mapping flag. @returns Nothing. */
  public setMappingType(mapping: MappingType): void {
    if (this.nMappingType !== mapping) this.nMappingType = mapping;
  }
  /** Original conditional Locale value copy. @param locale - Borrowed locale. @returns Nothing. */
  public setLocale(locale: LocaleConstReference): void {
    if (!this.aLocale.equals(locale)) this.aLocale.assign(locale);
  }
}
/** Original simple upper-to-lower module. */
export class Transliteration_u2l extends Transliteration_body {
  /** Original mapping/names. @returns Module. */
  constructor() {
    super();
    this.nMappingType = MappingType.UpperToLower;
    this.transliterationName = "upper_to_lower(generic)";
    this.implementationName = "com.sun.star.i18n.Transliteration.UPPERCASE_LOWERCASE";
  }
}
/** Original simple lower-to-upper module. */
export class Transliteration_l2u extends Transliteration_body {
  /** Original mapping/names. @returns Module. */
  constructor() {
    super();
    this.nMappingType = MappingType.LowerToUpper;
    this.transliterationName = "lower_to_upper(generic)";
    this.implementationName = "com.sun.star.i18n.Transliteration.LOWERCASE_UPPERCASE";
  }
}
/** Original toggle module; the string loop resolves its combined flags per unit. */
export class Transliteration_togglecase extends Transliteration_body {
  /** Original mapping/names. @returns Module. */
  constructor() {
    super();
    this.nMappingType = MappingType.LowerToUpper | MappingType.UpperToLower;
    this.transliterationName = "toggle(generic)";
    this.implementationName = "com.sun.star.i18n.Transliteration.TOGGLE_CASE";
  }
}
/** Existing classifier functional boundary now consumes the real source mapping owner, rather than another loop. It is not a UNO factory. @param input - String. @param start - Start. @param count - Count. @param locale - Borrowed locale. @returns Owned uppercase string. */
export function transliterateUppercase(
  input: OUStringConstReference,
  start: number,
  count: number,
  locale: LocaleConstReference,
): OUString {
  const mapping = new Transliteration_casemapping();
  try {
    mapping.setMappingType(MappingType.ToUpper);
    mapping.setLocale(locale);
    return mapping.transliterateString2String(input, start, count);
  } finally {
    mapping.dispose();
  }
}
