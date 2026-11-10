/** @fileoverview Original AsciiToNative character/text conversion responsibility from nativenumbersupplier.cxx, using compiled upstream tables and original output offsets. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import data from "./data/numberchar.json" with { type: "json" };
/** Original Number pointer fields after scalar table projection. */
export interface NumberSpec {
  number: number;
  numberFlag: number;
  multiplierChar: readonly number[];
  multiplierExponent: readonly number[];
}
/** Original mutable static punctuation arrays, shared by all service instances. */
export const DecimalChar = [...data.decimalChar],
  SeparatorChar = [...data.separatorChar];
/** Original ASCII digit predicate. @param ch - UTF16 unit. @returns Source predicate. */
export function isNumber(ch: number): boolean {
  return ch >= 48 && ch <= 57;
}
/** Original AsciiToNativeChar lookahead, locale punctuation and identity offsets. @param input - Source. @param number - Character row. @param offsets - Optional output sequence. @returns Owned converted string. */
export function AsciiToNativeChar(
  input: OUStringConstReference,
  number: number,
  offsets?: number[],
): OUString {
  const src = input.getStr(),
    count = input.getLength(),
    result = new Uint16Array(count),
    digits = data.numberChar[number] as number[];
  if (offsets) offsets.length = count;
  for (let i = 0; i < count; ++i) {
    const ch = src[i] as number;
    if (isNumber(ch)) result[i] = digits[ch - 48] as number;
    else if (i + 1 < count && isNumber(src[i + 1] as number)) {
      if (i > 0 && isNumber(src[i - 1] as number) && ch === SeparatorChar[0])
        result[i] = SeparatorChar[number] || ch;
      else
        result[i] =
          ch === DecimalChar[0]
            ? DecimalChar[number] || ch
            : ch === 45
              ? data.minusChar[number] || ch
              : ch;
    } else result[i] = ch;
    if (offsets) offsets[i] = i;
  }
  return new OUString(result, count);
}
/** Mutable counterparts of native destination/count/offset pointers. */
interface State {
  output: number[];
  count: number;
  offsets: number[] | undefined;
}
/** Original recursive AsciiToNative_numberMaker with source omission bits and cursor shifts. @param str - Ungrouped digits. @param begin - Cursor. @param len - Run length. @param state - Mutable destination. @param multiIndex - Multiplier index, or -1. @param start - Original source position. @param number - Original specification. @param digits - Original number row. @returns Original nonzero result. */
function AsciiToNative_numberMaker(
  str: number[],
  begin: number,
  len: number,
  state: State,
  multiIndex: number,
  start: number,
  number: NumberSpec,
  digits: readonly number[],
): boolean {
  const multi = multiIndex === -1 ? 0 : (number.multiplierChar[multiIndex] as number),
    exponents = number.multiplierExponent,
    last = exponents[exponents.length - 1] as number;
  const emit =
    /** Writes one native destination unit and its original offset. @param ch - Unit. @param at - Source offset. @returns Nothing. */ (
      ch: number,
      at: number,
    ): void => {
      state.output[state.count] = ch;
      if (state.offsets) state.offsets[state.count] = at;
      state.count++;
    };
  if (len <= last) {
    if (last > 1) {
      let notZero = false;
      for (const end = begin + len; begin < end; begin++)
        if (notZero || str[begin] !== 48) {
          emit(digits[(str[begin] as number) - 48] as number, begin + start);
          notZero = true;
        }
      if (notZero && multi > 0) emit(multi, begin + start);
      return notZero;
    } else if (str[begin] !== 48) {
      if (!(number.numberFlag & (multiIndex < 0 ? 0 : 1 << (2 + multiIndex))) || str[begin] !== 49)
        emit(digits[(str[begin] as number) - 48] as number, begin + start);
      if (multi > 0) emit(multi, begin + start);
    } else if (
      !(number.numberFlag & 1) &&
      state.count > 0 &&
      state.output[state.count - 1] !== digits[0]
    )
      emit(digits[0] as number, begin + start);
    return str[begin] !== 48;
  }
  let printPower = false;
  for (let i = 1; i <= exponents.length; i++) {
    const tmp = len - (i === exponents.length ? 0 : (exponents[i] as number));
    if (tmp > 0) {
      const nonzero = AsciiToNative_numberMaker(
        str,
        begin,
        tmp,
        state,
        i === exponents.length ? -1 : i,
        start,
        number,
        digits,
      );
      printPower = printPower || nonzero;
      begin += tmp;
      len -= tmp;
    }
  }
  if (printPower) {
    if (state.count > 0 && last === 1 && state.output[state.count - 1] === digits[0]) state.count--;
    if (multi > 0) emit(multi, begin + start);
  }
  return printPower;
}
/** Original AsciiToNative run collection, decimal toggling, zero omission and offsets (including source grouping-offset behavior). @param input - Source. @param number - Compiled original Number. @param offsets - Optional mutable sequence. @returns Owned result. */
export function AsciiToNative(
  input: OUStringConstReference,
  number: NumberSpec,
  offsets?: number[],
): OUString {
  const nCount = input.getLength();
  if (nCount <= 0) return new OUString();
  const str = input.getStr(),
    digits = data.numberChar[number.number] as number[],
    src: number[] = [],
    state: State = { output: [], count: 0, offsets };
  if (offsets) offsets.length = nCount * 2;
  let len = 0,
    doDecimal = false;
  const emit =
    /** Writes original destination and offset pointer. @param ch - UTF16 unit. @param at - Source index. @returns Nothing. */ (
      ch: number,
      at: number,
    ): void => {
      state.output[state.count] = ch;
      if (offsets) offsets[state.count] = at;
      state.count++;
    };
  for (let i = 0; i <= nCount; i++) {
    if (i < nCount && isNumber(str[i] as number)) {
      if (doDecimal) emit(digits[(str[i] as number) - 48] as number, i);
      else src[len++] = str[i] as number;
    } else {
      if (len > 0) {
        if (i < nCount - 1 && str[i] === SeparatorChar[0] && isNumber(str[i + 1] as number))
          continue;
        let notZero = false;
        for (
          let begin = 0, end = len % (number.multiplierExponent[0] as number);
          end <= len;
          begin = end, end += number.multiplierExponent[0] as number
        ) {
          if (end === 0) continue;
          const previous = state.count,
            nonzero = AsciiToNative_numberMaker(
              src,
              begin,
              end - begin,
              state,
              end === len ? -1 : 0,
              i - len,
              number,
              digits,
            );
          notZero = notZero || nonzero;
          if (
            state.count > 0 &&
            number.multiplierExponent[number.multiplierExponent.length - 1] === 1 &&
            state.output[state.count - 1] === digits[0]
          )
            state.count--;
          if (notZero && previous === state.count && end !== len)
            emit(number.multiplierChar[0] as number, i - len);
        }
        if (!notZero && !(number.numberFlag & 2)) emit(digits[0] as number, i - len);
        len = 0;
      }
      if (i < nCount) {
        doDecimal =
          !doDecimal &&
          i < nCount - 1 &&
          str[i] === DecimalChar[0] &&
          isNumber(str[i + 1] as number);
        const ch = str[i] as number;
        if (doDecimal) emit(DecimalChar[number.number] || ch, i);
        else if (i < nCount - 1 && ch === 45 && isNumber(str[i + 1] as number))
          emit(data.minusChar[number.number] || ch, i);
        else if (i < nCount - 1 && ch === SeparatorChar[0] && isNumber(str[i + 1] as number))
          emit(SeparatorChar[number.number] || ch, i);
        else emit(ch, i);
      }
    }
  }
  if (offsets) offsets.length = state.count;
  return new OUString(Uint16Array.from(state.output.slice(0, state.count)), state.count);
}
