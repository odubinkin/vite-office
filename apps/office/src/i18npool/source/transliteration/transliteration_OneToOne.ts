/** @fileoverview Original transliteration_OneToOne logical class; func/table retain native uninitialized producer preconditions until concrete modules initialize them. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { asNonConstRange, type Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { ONE_TO_ONE } from "../../../offapi/com/sun/star/i18n/TransliterationType";
import { transliteration_commonclass } from "./transliteration_commonclass";
/** Original function/table module base, not an initialized standalone mapping provider. */
export class transliteration_OneToOne extends transliteration_commonclass {
  declare protected func: ((unit: number) => number) | null;
  declare protected table: oneToOneMapping | null;
  /** Original type. @returns ONE_TO_ONE. */
  public override getType(): number {
    return ONE_TO_ONE;
  }
  /** Original unsupported folding operation. @param input - Unused string. @param start - Unused start. @param count - Unused count. @param offset - Unused output. @returns Never. */
  public override foldingImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    void input;
    void start;
    void count;
    void offset;
    throw new RuntimeException();
  }
  /** Original unsupported equality. @param first - Unused string. @param pos1 - Unused start. @param count1 - Unused count. @param match1 - Unused output. @param second - Unused string. @param pos2 - Unused start. @param count2 - Unused count. @param match2 - Unused output. @returns Never. */
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
  /** Original unsupported range operation. @param first - Unused string. @param second - Unused string. @returns Never. */
  public override transliterateRange(
    first: OUString,
    second: OUString,
  ): Sequence<ReturnType<OUString["getDataAddress"]>> {
    void first;
    void second;
    throw new RuntimeException();
  }
  /** Original unit loop and identity offset iota. @param input - String. @param start - Start. @param count - Unit count. @param offset - Optional output. @returns Mapped string. */
  public override transliterateImpl(
    input: OUStringConstReference,
    start: number,
    count: number,
    offset: Sequence<[number]> | null,
  ): OUString {
    const out = new Uint16Array(count);
    if (offset !== null) {
      offset.realloc(count);
      const range = asNonConstRange(offset);
      for (let i = 0; i < count; i++) range.operatorIndex(i, 4)[0] = start + i;
    }
    for (let i = 0; i < count; i++) {
      const unit = input.getStr()[start + i] as number;
      out[i] = this.func !== null ? this.func(unit) : (this.table as oneToOneMapping).get(unit);
    }
    return new OUString(out, out.length);
  }
  /** Original function/table scalar operation. @param unit - Native Unicode unit. @returns Mapped unit. */
  public override transliterateChar2Char(unit: number): number {
    return this.func !== null
      ? this.func(unit & 0xffff)
      : (this.table as oneToOneMapping).get(unit & 0xffff);
  }
}
