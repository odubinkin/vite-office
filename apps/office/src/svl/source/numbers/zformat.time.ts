/** @fileoverview Original finite time output and fractional-second production over actual compiled sections, tools::Time and calendar owners; complete native-number modifiers remain with the unfinished transliteration producer. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { rtl_math_doubleToUString, rtl_math_StringFormat as F } from "../../../sal/inc/rtl/math.h";
import { round } from "../../../sal/inc/rtl/math";
import { Time } from "../../../tools/source/datetime/ttime";
import { DateTime } from "../../../tools/source/datetime/datetime";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayIndex";
import * as A from "../../../offapi/com/sun/star/i18n/AmPmValue";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { INPUTSTRING_PRECISION } from "./zforlist.defaults";
import { ImpSvNumberformatScan } from "./zforscan";
import type { ImpSvNumFor } from "./zformat";
import type { SvNFLanguageData } from "./zforlist";
import { InsertBlanks } from "./zformat.output";
/** Original ImpGetNatNumString integer/padding branch for admitted incomplete native metadata. @param value - Integer field. @param minimum - Native uint16 minimum digits. @returns Owned field text. */
export function ImpGetNatNumString(value: number, minimum = 0): OUString {
  minimum &= 65535;
  if (minimum === 2 && value >= 0 && value < 10)
    return new OUString(Uint16Array.of(48, 48 + value), 2);
  const result = new OUString(OUString.number(BigInt(value)));
  if (minimum && result.getLength() < minimum) {
    let buffer: OUStringBuffer | undefined;
    try {
      buffer = new OUStringBuffer();
      for (let index = 0; index < minimum - result.getLength(); ++index)
        buffer.append(Uint16Array.of(48));
      buffer.append(result);
      return buffer.makeStringAndClear();
    } finally {
      buffer?.dispose();
      result.dispose();
    }
  }
  return result;
}
/** Original ImpGetFractionOfSecondString keeps one extra decimal only for GetClock's truncated fraction. @param buffer - Fraction output. @param fraction - Fractional seconds. @param decimals - Requested digits. @param extra - Add one rounding decimal. @param minimum - Original minimum input-line digits. @returns Actual emitted digit count. */
export function ImpGetFractionOfSecondString(
  buffer: OUStringBuffer,
  fraction: number,
  decimals: number,
  extra: boolean,
  minimum: number,
): number {
  if (!decimals) return 0;
  const converted = new OUString();
  try {
    rtl_math_doubleToUString(
      converted.getDataAddress(),
      null,
      0,
      fraction,
      F.rtl_math_StringFormat_F,
      extra ? decimals + 1 : decimals,
      46,
      null,
      0,
      false,
    );
    buffer.append(converted);
  } finally {
    converted.dispose();
  }
  buffer.stripStart(48);
  buffer.stripStart(46);
  if (extra && buffer.getLength() > decimals) buffer.truncate(decimals);
  if (minimum) {
    buffer.stripEnd(48);
    for (let index = buffer.getLength(); index < minimum; ++index)
      buffer.append(Uint16Array.of(48));
    decimals = buffer.getLength();
  }
  return decimals & 65535;
}
/** Original time output, with wall-clock modulo-day extraction versus bracketed elapsed fields. Caller admits finite values and incomplete native metadata. @param input - Original serial value after selected-section sign handling. @param index - Selected native subformat. @param section - Actual compiled section. @param current - Current language/calendar owner. @param output - Mutable result. @param star - Source fill flag. @returns Whether the latest enabled star token emitted a fill. */
export function GetTimeOutput(
  input: number,
  index: number,
  section: ImpSvNumFor,
  current: SvNFLanguageData,
  output: OUString,
  star: boolean,
): boolean {
  let calendarSet = false,
    result = false,
    sign = false,
    value = input;
  if (value < 0) {
    value = -value;
    if (index === 0) sign = true;
  }
  const info = section.Info(),
    inputLine =
      current.GetStandardPrec() === INPUTSTRING_PRECISION && info.nCntPost > 0 && info.nCntPost < 7,
    secondsText = new OUStringBuffer();
  let buffer: OUStringBuffer | undefined;
  let decimals = inputLine ? 7 : info.nCntPost,
    hour = 0,
    minute = 0,
    second = 0,
    secondPosition = 0;
  try {
    buffer = new OUStringBuffer();
    if (!info.bThousand) {
      const hours: [number] = [0],
        minutes: [number] = [0],
        seconds: [number] = [0],
        fraction: [number] = [0];
      Time.GetClock(input, hours, minutes, seconds, fraction, decimals);
      hour = hours[0];
      minute = minutes[0];
      second = seconds[0];
      decimals = ImpGetFractionOfSecondString(
        secondsText,
        fraction[0],
        decimals,
        true,
        inputLine ? info.nCntPost : 0,
      );
    } else {
      const time = round(value * 86400, decimals);
      if (sign && time === 0) sign = false;
      if (time > 0xffffffff) {
        output.assign(ImpSvNumberformatScan.sErrStr);
        return false;
      }
      const seconds = Math.trunc(time) >>> 0;
      decimals = ImpGetFractionOfSecondString(
        secondsText,
        time - seconds,
        decimals,
        false,
        inputLine ? info.nCntPost : 0,
      );
      if (info.nThousand === 3) second = seconds;
      else if (info.nThousand === 2) {
        minute = Math.trunc(seconds / 60);
        second = seconds % 60;
      } else if (info.nThousand === 1) {
        hour = Math.trunc(seconds / 3600);
        minute = Math.trunc((seconds % 3600) / 60);
        second = seconds % 60;
      }
    }
    let ampm = 32;
    if (info.nCntExp) {
      if (hour === 0) {
        hour = 12;
        ampm = 97;
      } else if (hour < 12) ampm = 97;
      else {
        ampm = 112;
        if (hour > 12) hour -= 12;
      }
    }
    for (let tokenIndex = 0; tokenIndex < section.GetCount(); ++tokenIndex) {
      const token = info.sStrArray[tokenIndex] as OUStringConstReference;
      switch (info.nTypeArray[tokenIndex]) {
        case S.STAR:
          if (star) {
            result = token.getLength() > 1;
            if (result) buffer.append(Uint16Array.of(27, token.getStr()[1] as number));
          }
          break;
        case S.BLANK:
          if (token.getLength() >= 2)
            InsertBlanks(buffer, buffer.getLength(), token.getStr()[1] as number);
          break;
        case S.STRING:
        case S.CURRENCY:
        case S.DATESEP:
        case S.TIMESEP:
        case S.TIME100SECSEP:
          buffer.append(token);
          break;
        case S.DIGIT: {
          const length =
            inputLine &&
            tokenIndex > 0 &&
            (info.nTypeArray[tokenIndex - 1] === S.STRING ||
              info.nTypeArray[tokenIndex - 1] === S.TIME100SECSEP)
              ? decimals
              : token.getLength();
          for (
            let digit = 0;
            digit < length && secondPosition < decimals && secondPosition < secondsText.getLength();
            ++digit
          )
            buffer.append(Uint16Array.of(secondsText.getStr()[secondPosition++] as number));
          break;
        }
        case K.AMPM: {
          const calendar = current.GetCalendar();
          if (!calendarSet) {
            let difference = DateTime.Sub(
              new DateTime(current.GetNullDate()),
              calendar.getEpochStart(),
            );
            difference += input;
            calendar.setLocalDateTime(difference);
            calendarSet = true;
          }
          const name = calendar.getDisplayName(D.AM_PM, ampm === 97 ? A.AM : A.PM, 0);
          try {
            buffer.append(name);
          } finally {
            name.dispose();
          }
          break;
        }
        case K.AP:
          buffer.append(Uint16Array.of(ampm === 97 ? 97 : 112));
          break;
        case K.MI:
        case K.MMI:
        case K.H:
        case K.HH:
        case K.S:
        case K.SS: {
          const type = info.nTypeArray[tokenIndex],
            field =
              type === K.MI || type === K.MMI
                ? minute
                : type === K.H || type === K.HH
                  ? hour
                  : second,
            text = ImpGetNatNumString(
              field,
              type === K.MMI || type === K.HH || type === K.SS ? 2 : 0,
            );
          try {
            buffer.append(text);
          } finally {
            text.dispose();
          }
          break;
        }
      }
    }
    if (sign && info.bThousand) buffer.insertChar(0, 45);
    const text = buffer.makeStringAndClear();
    try {
      output.assign(text);
    } finally {
      text.dispose();
    }
    return result;
  } finally {
    buffer?.dispose();
    secondsText.dispose();
  }
}
