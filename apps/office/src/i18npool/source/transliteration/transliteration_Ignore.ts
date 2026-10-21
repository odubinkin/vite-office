/** @fileoverview Original transliteration_Ignore function/table/pair algorithms, actual offset sequences and matching/range contracts. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { IGNORE } from "../../../offapi/com/sun/star/i18n/TransliterationType";
import { transliteration_commonclass } from "./transliteration_commonclass";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Original nested Mapping value. */
export interface Mapping {
  readonly previousChar: number;
  readonly currentChar: number;
  readonly replaceChar: number;
  readonly two2one: boolean;
}
/** Original ignore base; concrete constructors initialize all three native pointer fields. */
export class transliteration_Ignore extends transliteration_commonclass {
  declare protected func: ((unit: number) => number) | null;
  declare protected table: oneToOneMapping | null;
  declare protected map: readonly Mapping[] | null;
  /** Original ignore type. @returns IGNORE. */
  public override getType(): number {
    return IGNORE;
  }
  /** Original folding equality returns source offset plus one for a matching prefix. @param first - String. @param pos1 - Start. @param count1 - Count. @param match1 - Output. @param second - String. @param pos2 - Start. @param count2 - Count. @param match2 - Output. @returns Equality. */
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
    const offset1 = new Integers(),
      offset2 = new Integers();
    let s1: OUString | undefined, s2: OUString | undefined;
    try {
      s1 = this.folding(first, pos1, count1, offset1);
      s2 = this.folding(second, pos2, count2, offset2);
      const length = Math.min(s1.getLength(), s2.getLength());
      let matched = 0;
      for (; matched < length; matched++) if (s1.getStr()[matched] !== s2.getStr()[matched]) break;
      if (matched > 0) {
        match1[0] = offset1.operatorIndex(matched - 1)[0] + 1;
        match2[0] = offset2.operatorIndex(matched - 1)[0] + 1;
      } else {
        match1[0] = 0;
        match2[0] = 0;
      }
      return matched === s1.getLength() && matched === s2.getLength();
    } finally {
      s2?.dispose();
      s1?.dispose();
      offset2.dispose();
      offset1.dispose();
    }
  }
  /** Original default range uses only first units. @param first - Lower string. @param second - Upper string. @returns Owned range. */
  public override transliterateRange(
    first: OUString,
    second: OUString,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    if (first.isEmpty() || second.isEmpty()) throw new RuntimeException();
    const one = first.copy(0, 1),
      two = second.copy(0, 1);
    try {
      return transliteration_Ignore.strings([one, two]);
    } finally {
      two.dispose();
      one.dispose();
    }
  }
  /** Original two-module range overload. @param first - Lower string. @param second - Upper string. @param t1 - First native module. @param t2 - Second native module. @returns Two or four strings. */
  public static transliterateRange(
    first: OUString,
    second: OUString,
    t1: transliteration_commonclass,
    t2: transliteration_commonclass,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    if (first.isEmpty() || second.isEmpty()) throw new RuntimeException();
    const offset = new Integers();
    let s11: OUString | undefined,
      s12: OUString | undefined,
      s21: OUString | undefined,
      s22: OUString | undefined;
    try {
      s11 = t1.transliterate(first, 0, 1, offset);
      s12 = t1.transliterate(second, 0, 1, offset);
      s21 = t2.transliterate(first, 0, 1, offset);
      s22 = t2.transliterate(second, 0, 1, offset);
      return this.strings(s11.equals(s21) && s12.equals(s22) ? [s11, s12] : [s11, s12, s21, s22]);
    } finally {
      s22?.dispose();
      s21?.dispose();
      s12?.dispose();
      s11?.dispose();
      offset.dispose();
    }
  }
  /** Original transliteration delegates to folding. @param input - String. @param start - Start. @param count - Count. @param offset - Optional output. @returns Folded string. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    return this.foldingImpl(input, start, count, offset);
  }
  /** Original sentinel/pair loop, including pair offset ordering and final-count condition. @param input - String. @param start - Start. @param count - Count. @param offset - Optional output. @returns Folded string. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const out = new Uint16Array(count),
      source = input.getStr();
    let read = start,
      written = 0,
      position = 0,
      offsetIndex = 0;
    let pointer: SequenceElements | null = null;
    if (offset !== null) {
      offset.realloc(count);
      pointer = offset.getArray() as SequenceElements;
      position = start;
    }
    if (this.map !== null) {
      let previous = source[read++] as number;
      while (--count > 0) {
        const current = source[read++] as number;
        let index = 0;
        for (; (this.map[index] as Mapping).replaceChar !== 0; index++) {
          const mapping = this.map[index] as Mapping;
          if (previous === mapping.previousChar && current === mapping.currentChar) {
            if (offset !== null) {
              if (!mapping.two2one)
                ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position;
              position++;
              ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position++;
            }
            out[written++] = mapping.replaceChar;
            if (!mapping.two2one) out[written++] = current;
            previous = source[read++] as number;
            count--;
            break;
          }
        }
        if ((this.map[index] as Mapping).replaceChar === 0) {
          if (offset !== null)
            ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position++;
          out[written++] = previous;
          previous = current;
        }
      }
      if (count === 0) {
        if (offset !== null)
          ((pointer as SequenceElements).get(offsetIndex * 4) as [number])[0] = position;
        out[written++] = previous;
      }
    } else {
      while (count-- > 0) {
        let unit = source[read++] as number;
        unit = this.func !== null ? this.func(unit) : (this.table as oneToOneMapping).get(unit);
        if (unit !== 0xffff) out[written++] = unit;
        if (offset !== null) {
          if (unit !== 0xffff)
            ((pointer as SequenceElements).get(offsetIndex++ * 4) as [number])[0] = position;
          position++;
        }
      }
    }
    if (offset !== null) offset.realloc(written);
    return new OUString(out.subarray(0, written), written);
  }
  /** Original scalar fallback is identity when both function and table are null, even for pair modules. @param unit - Native Unicode unit. @returns Mapped unit or skip marker. */
  public override transliterateChar2Char(unit: number): number {
    unit &= 0xffff;
    return this.func !== null ? this.func(unit) : this.table !== null ? this.table.get(unit) : unit;
  }
}
