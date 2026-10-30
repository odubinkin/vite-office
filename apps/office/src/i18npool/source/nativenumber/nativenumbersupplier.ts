/** @fileoverview NativeNumberSupplierService NATNUM0 through NATNUM11 paths from the pinned i18npool source. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import data from "./data/numberchar.json" with { type: "json" };

import { getLocaleDecimalSeparator, getLocaleThousandSeparator } from "../localedata/localedata";
import {
  AsciiToNative,
  AsciiToNativeChar,
  DecimalChar,
  SeparatorChar,
  type NumberSpec,
} from "./nativenumbersupplier.text";
import {
  getHebrewNativeNumberString,
  getCyrillicNativeNumberString,
} from "./nativenumbersupplier.alphabetic";
/** The represented source modes; mode12 needs the original NumberText dependency. */
export type NativeNumberMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
const natnum1Locales = data.natnum1Locales;
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
      else if (SeparatorChar.includes(current) && followedByNumber)
        converted = SeparatorChar[0] as number;
      else if (DecimalChar.includes(current) && followedByNumber)
        converted = DecimalChar[0] as number;
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

/** Source supplier locale cache and shared-table dispatch. NumberText/mode12 and unconsumed XML/char service methods remain unported. */
export class NativeNumberSupplierService {
  private readonly aLocale = new Locale();
  /** Native value-member destruction. @returns Nothing. */
  dispose(): void {
    this.aLocale.dispose();
  }
  /** Original mode validity including the source mode12 validity declaration, independent of conversion availability. @param locale - Actual locale. @param mode - Native mode scalar. @returns Original validity. */
  static isValidNatNumImpl(locale: LocaleConstReference, mode: number): boolean {
    const langnum = getLanguageNumber(locale);
    switch (mode) {
      case 0:
      case 3:
      case 12:
        return true;
      case 1:
        return langnum >= 0;
      case 2:
        return langnum === 4 || (langnum >= 0 && langnum < 4);
      // Original mode2 falls through to the CJK-only text modes.
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return langnum >= 0 && langnum < 4;
      case 9:
      case 10:
      case 11:
        return langnum === 3;
    }
    return false;
  }
  /** Source getNativeNumberString dispatch. Unknown locales retain identity even for mode3; locale changes mutate the original shared punctuation arrays. @param input - Input. @param locale - Locale. @param mode - Represented original mode. @param offsets - Optional output sequence. @returns Owned result. */
  getNativeNumberString(
    input: OUStringConstReference,
    locale: LocaleConstReference,
    mode: NativeNumberMode,
    offsets?: number[],
  ): OUString {
    if (!NativeNumberSupplierService.isValidNatNumImpl(locale, mode)) return new OUString(input);
    const langnum = getLanguageNumber(locale);
    if (langnum === -1) return new OUString(input);
    let number: NumberSpec | undefined,
      num = -1;
    switch (mode) {
      case 0:
        return nativeToAscii(input, offsets);
      case 1:
        num = data.natnum1[langnum] as number;
        break;
      case 2:
        num = data.natnum2[langnum] as number;
        break;
      case 3:
        num = 1;
        break;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        number = data.numberSpecs[mode][langnum];
        break;
      case 9:
        num = 9;
        break;
      case 10:
      case 11:
        number = data.numberSpecs[mode][0];
        break;
    }
    if (number || num >= 0) {
      if (!this.aLocale.equals(locale)) {
        const decimal = getLocaleDecimalSeparator(locale),
          separator = getLocaleThousandSeparator(locale);
        this.aLocale.assign(locale);
        DecimalChar[0] = decimal.charCodeAt(0) || 0;
        DecimalChar[1] =
          DecimalChar[0] > 0x7e || DecimalChar[0] < 0x21 ? 0xff0e : DecimalChar[0] + 0xfee0;
        SeparatorChar[0] = separator.charCodeAt(0) || 0;
        SeparatorChar[1] =
          SeparatorChar[0] > 0x7e || SeparatorChar[0] < 0x21 ? 0xff0c : SeparatorChar[0] + 0xfee0;
      }
      if (number) return AsciiToNative(input, number, offsets);
      if (num === 28) return getHebrewNativeNumberString(input, mode === 2);
      if (num === 31) return getCyrillicNativeNumberString(input);
      return AsciiToNativeChar(input, num, offsets);
    }
    return new OUString(input);
  }
}
