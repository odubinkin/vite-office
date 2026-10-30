/** @fileoverview Original fraction token strings, continued-fraction elements and finite fraction display over actual compiled format owners. */
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { saturating_castInt64 } from "../../../o3tl/inc/float_int_conversion";
import { sprintfIntegral } from "../../../o3tl/inc/sprintf";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import type { SvNumberformat, ImpSvNumFor } from "./zformat";
import type { SvNFLanguageData } from "./zforlist";
import { ImpSvNumberformatScan } from "./zforscan";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { impTransliterate } from "./zformat.transliterate";
import { ImpGetNatNumString } from "./zformat.time";
import { ImpNumberFill, ImpNumberFillWithThousands } from "./zformat.number";
/** Native signed64 machine-value projection for the original signed integer arithmetic; undefined overflow domains require separate native evidence. @param value - Integer operation result. @returns Signed64 value. */
function int64(value: bigint): bigint {
  return BigInt.asIntN(64, value);
}
/** Original lcl_GetDenominatorString over consecutive divisor/digit tokens after the fraction slash. @param section - Actual compiled subformat. @returns Owned token string. */
export function GetDenominatorString(section: ImpSvNumFor): OUString {
  const info = section.Info(),
    buffer = new OUStringBuffer();
  try {
    for (let index = 0; index < section.GetCount(); ++index)
      if (info.nTypeArray[index] === S.FRAC) {
        while (
          ++index < section.GetCount() &&
          info.nTypeArray[index] !== S.FRAC_FDIV &&
          info.nTypeArray[index] !== S.DIGIT
        ) {
          /* Original skip to the denominator. */
        }
        for (; index < section.GetCount(); ++index) {
          if (info.nTypeArray[index] === S.FRAC_FDIV || info.nTypeArray[index] === S.DIGIT)
            buffer.append(info.sStrArray[index] as OUString);
          else index = section.GetCount();
        }
      }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original numerator placeholders immediately before the slash. @param section - Actual compiled subformat. @returns Owned token string. */
function GetNumeratorString(section: ImpSvNumFor): OUString {
  const info = section.Info(),
    buffer = new OUStringBuffer();
  try {
    for (let index = 0; index < section.GetCount(); ++index)
      if (info.nTypeArray[index] === S.FRAC) {
        for (--index; index >= 0 && info.nTypeArray[index] === S.DIGIT; --index)
          buffer.insert(0, info.sStrArray[index] as OUString);
        index = section.GetCount();
      }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original integer placeholders/grouping immediately before the fraction blank. @param section - Actual compiled subformat. @returns Owned token string. */
function GetFractionIntegerString(section: ImpSvNumFor): OUString {
  const info = section.Info(),
    buffer = new OUStringBuffer();
  try {
    for (let index = 0; index < section.GetCount(); ++index)
      if (info.nTypeArray[index] === S.FRACBLANK) {
        for (
          --index;
          index >= 0 && (info.nTypeArray[index] === S.DIGIT || info.nTypeArray[index] === S.THSEP);
          --index
        )
          buffer.insert(0, info.sStrArray[index] as OUString);
        index = section.GetCount();
      }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original ImpGetFractionElements with actual section metadata and the original mutable double/integer output references. @param value - In/out magnitude/fraction. @param native - Actual original native-number wrapper. @param whole - Whole-part double. @param numerator - Signed64 numerator. @param denominator - Signed64 denominator. @returns Nothing. */
export function ImpGetFractionElements(
  value: [number],
  section: ImpSvNumFor,
  whole: [number],
  numerator: [bigint],
  denominator: [bigint],
): void {
  if (value[0] < 0) value[0] = -value[0];
  whole[0] = Math.floor(value[0]);
  value[0] -= whole[0];
  const format = GetDenominatorString(section);
  let forced: bigint;
  try {
    forced = BigInt(format.toInt32());
  } finally {
    format.dispose();
  }
  if (forced > 0n) {
    denominator[0] = forced;
    numerator[0] = BigInt(Math.floor(value[0] * Number(denominator[0])));
    const lower = Number(numerator[0]) / Number(denominator[0]),
      upper = Number(numerator[0] + 1n) / Number(denominator[0]),
      difference = value[0] - lower;
    if (difference > upper - value[0]) numerator[0] = int64(numerator[0] + 1n);
  } else {
    denominator[0] = 1n;
    const basis = BigInt(Math.floor(Math.pow(10, section.Info().nCntExp))) - 1n;
    let previousNumerator = 1n,
      previousDenominator = 0n,
      remainder = value[0];
    while (remainder > 0) {
      const temporary = 1 / remainder,
        partial = saturating_castInt64(Math.floor(temporary));
      remainder = temporary - Number(partial);
      const nextDenominator = int64(partial * denominator[0] + previousDenominator);
      if (nextDenominator <= basis) {
        const nextNumerator = int64(partial * numerator[0] + previousNumerator);
        previousNumerator = numerator[0];
        numerator[0] = nextNumerator;
        previousDenominator = denominator[0];
        denominator[0] = nextDenominator;
      } else {
        const collateral = int64(int64(basis - previousDenominator) / denominator[0]);
        if (int64(2n * collateral) >= partial) {
          const testNumerator = int64(collateral * numerator[0] + previousNumerator),
            testDenominator = int64(collateral * denominator[0] + previousDenominator),
            sign = Number(numerator[0]) > value[0] * Number(denominator[0]) ? 1 : -1;
          if (
            sign *
              (Number(int64(numerator[0] * testDenominator + denominator[0] * testNumerator)) -
                2 * Number(int64(denominator[0] * testDenominator)) * value[0]) >
            0
          ) {
            numerator[0] = testNumerator;
            denominator[0] = testDenominator;
          }
        }
        remainder = 0;
      }
    }
  }
  if (numerator[0] >= denominator[0]) {
    ++whole[0];
    numerator[0] = 0n;
    denominator[0] = forced > 0n ? forced : 1n;
  }
}
/** Original finite ImpGetFractionOutput with its original pre-fill native-number conversions. @param this - Actual original format owner. @param input - Value after source section normalization. @param index - Selected numeric section. @param native - Actual original native-number wrapper. @param current - Real language owner. @param output - Mutable output. @param star - Fill flag. @returns Star-fill result. */
export function GetFractionOutput(
  this: SvNumberformat,
  input: number,
  index: number,
  star: boolean,
  native: NativeNumberWrapper,
  current: SvNFLanguageData,
  output: OUString,
): boolean {
  const section = this["NumFor"][index] as ImpSvNumFor,
    info = section.Info(),
    whole = new OUStringBuffer(),
    value: [number] = [input],
    integer: [number] = [Math.floor(input)],
    fraction: [bigint] = [0n],
    divisor: [bigint] = [1n];
  let numerator: OUStringBuffer | undefined,
    denominator: OUStringBuffer | undefined,
    integerFormat: OUString | undefined,
    numeratorFormat: OUString | undefined,
    denominatorFormat: OUString | undefined;
  let result = false;
  const sign = input < 0 && index === 0;
  try {
    numerator = new OUStringBuffer();
    denominator = new OUStringBuffer();
    integerFormat = GetFractionIntegerString(section);
    numeratorFormat = GetNumeratorString(section);
    denominatorFormat = GetDenominatorString(section);
    if (integer[0] > 0xffffffff || info.nCntExp > 9) {
      output.assign(ImpSvNumberformatScan.sErrStr);
      return false;
    }
    if (info.nCntExp === 0) {
      output.clear();
      return false;
    }
    ImpGetFractionElements(value, section, integer, fraction, divisor);
    if (info.nCntPre === 0) {
      const improper = integer[0] * Number(divisor[0]) + Number(fraction[0]);
      if (improper > 9007199254740991) {
        output.assign(ImpSvNumberformatScan.sErrStr);
        return false;
      }
      fraction[0] = BigInt(Math.floor(improper));
    } else if (integer[0] !== 0 || fraction[0] === 0n) {
      const buffer = new Uint8Array(100),
        length = sprintfIntegral(buffer, integer[0]);
      whole.appendAscii(buffer, length);
      impTransliterate(whole, section.GetNatNum(), native);
    }
    const hide =
      info.nCntPre > 0 &&
      fraction[0] === 0n &&
      numeratorFormat.indexOf(48) < 0 &&
      (denominatorFormat.indexOf(48) < 0 || denominatorFormat.toInt32() > 0);
    if (!hide) {
      const fractionText = ImpGetNatNumString(section.GetNatNum(), Number(fraction[0]), 0, native);
      try {
        numerator.assign(fractionText);
      } finally {
        fractionText.dispose();
      }
      const divisorText = ImpGetNatNumString(section.GetNatNum(), Number(divisor[0]), 0, native);
      try {
        denominator.assign(divisorText);
      } finally {
        divisorText.dispose();
      }
    }
    const symbol: [number] = [(section.GetCount() - 1) & 65535],
      position: [number] = [0];
    result =
      ImpNumberFill.call(
        this,
        native,
        current,
        denominator,
        value[0],
        position,
        symbol,
        index,
        S.FRAC,
        star,
        true,
      ) || result;
    let continuing = true;
    if (info.nTypeArray[symbol[0]] === S.FRAC) {
      if (hide) {
        if (numeratorFormat.indexOf(63) >= 0 || denominatorFormat.indexOf(63) >= 0)
          denominator.insertChar(0, 32);
      } else
        denominator.insertChar(0, (info.sStrArray[symbol[0]] as OUString).getStr()[0] as number);
      if (symbol[0]) --symbol[0];
      else continuing = false;
    }
    if (!continuing) numerator.truncate();
    else {
      result =
        ImpNumberFill.call(
          this,
          native,
          current,
          numerator,
          value[0],
          position,
          symbol,
          index,
          S.FRACBLANK,
          star,
        ) || result;
      continuing = false;
      if (info.nTypeArray[symbol[0]] === S.FRACBLANK) {
        const token = info.sStrArray[symbol[0]] as OUString;
        if (symbol[0]) {
          if (hide) {
            if (
              integerFormat.indexOf(63) >= 0 ||
              numeratorFormat.indexOf(63) >= 0 ||
              denominatorFormat.indexOf(63) >= 0
            )
              for (let character = 0; character < token.getLength(); ++character)
                numerator.insertChar(0, 32);
          } else if (integer[0] !== 0 || integerFormat.indexOf(48) >= 0) numerator.insert(0, token);
          else if (integerFormat.indexOf(63) >= 0 || numeratorFormat.indexOf(63) >= 0)
            for (let character = 0; character < token.getLength(); ++character)
              numerator.insertChar(0, 32);
          --symbol[0];
          continuing = true;
        } else numerator.insert(0, token);
      }
    }
    if (!continuing) whole.truncate();
    else
      result =
        ImpNumberFillWithThousands.call(
          this,
          native,
          current,
          whole,
          value[0],
          whole.getLength(),
          symbol[0],
          index,
          info.nCntPre,
          star,
        ) || result;
    const buffer = new OUStringBuffer();
    try {
      if (sign && (fraction[0] !== 0n || integer[0] !== 0)) buffer.append(Uint16Array.of(45));
      buffer
        .append(whole.getStr().subarray(0, whole.getLength()))
        .append(numerator.getStr().subarray(0, numerator.getLength()))
        .append(denominator.getStr().subarray(0, denominator.getLength()));
      const text = buffer.makeStringAndClear();
      try {
        output.assign(text);
      } finally {
        text.dispose();
      }
    } finally {
      buffer.dispose();
    }
    return result;
  } finally {
    denominatorFormat?.dispose();
    numeratorFormat?.dispose();
    integerFormat?.dispose();
    denominator?.dispose();
    numerator?.dispose();
    whole.dispose();
  }
}
