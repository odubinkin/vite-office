/** @fileoverview NativeNumberSupplierService NATNUM0 path from the pinned i18npool source. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import data from "./data/numberchar.json" with { type: "json" };

const natnum1Locales = [
  "zh_CN",
  "zh_TW",
  "ja",
  "ko",
  "he",
  "ar",
  "th",
  "hi",
  "or",
  "mr",
  "bn",
  "pa",
  "gu",
  "ta",
  "te",
  "kn",
  "ml",
  "lo",
  "bo",
  "my",
  "km",
  "mn",
  "ne",
  "dz",
  "fa",
  "cu",
] as const;
const numberChar = data.numberChar.flat();
const multiplierChar = data.multiplierChar7Cjk.flat();
const multiplierExponent = data.multiplierExponent7Cjk;
const isNumber = /** Implements is Number. @param value - Value. @returns The boolean result. */ (
  value: number,
): boolean => value >= 48 && value <= 57;

/** Original language gate: Chinese precedes the two-character language scan.  @param locale - Locale. @returns The number result. */
function getLanguageNumber(locale: LocaleConstReference): number {
  const language = locale.Language.getStr();
  if (locale.Language.getLength() === 2 && language[0] === 122 && language[1] === 104) {
    const country = locale.Country.getStr();
    const region = String.fromCharCode(...country.subarray(0, locale.Country.getLength()));
    return region === "TW" || region === "HK" || region === "MO" ? 1 : 0;
  }
  for (let index = 2; index < natnum1Locales.length; index++) {
    const candidate = natnum1Locales[index] as string;
    if (
      locale.Language.getLength() === 2 &&
      language[0] === candidate.charCodeAt(0) &&
      language[1] === candidate.charCodeAt(1)
    )
      return index;
  }
  return -1;
}

/** Mutable counterparts of the source cursor, count, destination and offset pointers. */
interface ScanState {
  index: number;
  count: number;
  output: number[];
  offsets: number[];
}

/** NativeToAscii_numberMaker, retaining source recursion and multiplier shift order.  @param maxInitial - Max Initial. @param prev - Prev. @param input - Input. @param count - Count. @param state - State. @returns Nothing. */
function nativeToAsciiNumberMaker(
  maxInitial: number,
  prev: number,
  input: Uint16Array,
  count: number,
  state: ScanState,
): void {
  let max = maxInitial;
  let num = 0;
  let end = 0;
  while (++state.index < count) {
    const value = input[state.index] as number;
    let curr = numberChar.indexOf(value);
    if (curr >= 0) {
      if (num > 0) break;
      num = curr % 10;
    } else if ((curr = multiplierChar.indexOf(value)) >= 0) {
      curr = multiplierExponent[curr % multiplierExponent.length] as number;
      if (prev > curr && num === 0) num = 1;
      let shift = 0;
      end = 0;
      if (curr >= max) max = curr;
      else if (curr > prev) shift = max - curr;
      else end = curr;
      while (end++ < prev) {
        state.output[state.count] = 48 + (end === prev ? num : 0);
        state.offsets[state.count] = state.index;
        state.count++;
      }
      if (shift) {
        state.count -= max;
        const countEnd = state.count + shift;
        while (state.count < countEnd) {
          state.output[state.count] = state.output[state.count + curr] as number;
          state.offsets[state.count] = state.offsets[state.count + curr] as number;
          state.count++;
        }
        max = curr;
      }
      nativeToAsciiNumberMaker(max, curr, input, count, state);
      return;
    } else break;
  }
  while (end++ < prev) {
    state.output[state.count] = 48 + (end === prev ? num : 0);
    state.offsets[state.count] = state.index - 1;
    state.count++;
  }
}

/** Original NativeToAscii table lookup, lookahead and multiplier recursion.  @param input - Input. @param offsets - Offsets. @returns The OUString result. */
function nativeToAscii(input: OUStringConstReference, offsets?: number[]): OUString {
  const source = input.getStr();
  const count = input.getLength();
  const state: ScanState = { index: 0, count: 0, output: [], offsets: [] };
  if (!count) return new OUString();
  for (state.index = 0; state.index < count; state.index++) {
    const current = source[state.index] as number;
    let index = multiplierChar.indexOf(current);
    if (index >= 0) {
      if (state.count === 0 || !isNumber(state.output[state.count - 1] as number)) {
        state.output[state.count] = 49;
        state.offsets[state.count] = state.index;
        state.count++;
      }
      index = multiplierExponent[index % multiplierExponent.length] as number;
      nativeToAsciiNumberMaker(index, index, source, count, state);
    } else {
      index = numberChar.indexOf(current);
      const next = state.index < count - 1 ? (source[state.index + 1] as number) : -1;
      const followedByNumber = numberChar.indexOf(next) >= 0 || multiplierChar.indexOf(next) >= 0;
      let converted = current;
      if (index >= 0) converted = (index % 10) + 48;
      else if (data.separatorChar.includes(current) && followedByNumber)
        converted = data.separatorChar[0] as number;
      else if (data.decimalChar.includes(current) && followedByNumber)
        converted = data.decimalChar[0] as number;
      else if (data.minusChar.includes(current) && followedByNumber)
        converted = data.minusChar[0] as number;
      state.output[state.count] = converted;
      state.offsets[state.count] = state.index;
      state.count++;
    }
  }
  if (offsets) offsets.splice(0, offsets.length, ...state.offsets.slice(0, state.count));
  return new OUString(Uint16Array.from(state.output.slice(0, state.count)), state.count);
}

/** Represented NativeNumberSupplierService field consumed by TransformInput. */
export class NativeNumberSupplierService {
  /** Source getNativeNumberString NATNUM0 dispatch, including unsupported-language identity.  @param input - Input. @param locale - Locale. @param mode - Mode. @param offsets - Offsets. @returns The OUString result. */
  getNativeNumberString(
    input: OUStringConstReference,
    locale: LocaleConstReference,
    mode: 0,
    offsets?: number[],
  ): OUString {
    void mode;
    if (getLanguageNumber(locale) < 0) return new OUString(input);
    return nativeToAscii(input, offsets);
  }
}
