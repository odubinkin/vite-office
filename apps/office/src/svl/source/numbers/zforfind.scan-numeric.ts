/** @fileoverview ImpSvNumberInputScan scan-numeric implementation, called with the original native owner as this. */
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { LongDateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import { SvNumFormatType } from "../../inc/zforlist";
import {
  SV_MAX_COUNT_INPUT_STRINGS,
  lcl_isBlanks,
  type ImpSvNumberInputScanContext,
} from "./zforfind.context";
import { type SvNumberformatConstReference } from "./zformat";

/** Source middle-fragment classification across decimals, fraction/grouping, date/time and compiled-format literals. @param value - Already uppercased fragment. @param stringPosition - Fragment index. @param numericCount - Numbers seen through this fragment. @returns Whether accepted.  @param this - Original native owner shared by its implementation fragments. */
export function ScanMidString(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  stringPosition: number,
  numericCount: number,
): boolean {
  const state = this["fields"],
    position: [number] = [0],
    oldType = state.eScannedType;
  if (state.nMatchedAllStrings) {
    if (this["ScanStringNumFor"](value, 0, stringPosition)) state.nMatchedAllStrings |= 0x02;
    else state.nMatchedAllStrings = 0;
  }
  const startBlanks = position[0],
    blanks = this["SkipBlanks"](value, position);
  if (this["GetDecSep"](value, position)) {
    if (state.nDecPos === 1 || state.nDecPos === 3) return this["MatchedReturn"]();
    if (state.nDecPos === 2) {
      const signedYear: [boolean] = [false];
      if (
        state.bDecSepInDateSeps ||
        this["SkipDatePatternSeparator"](stringPosition, position, signedYear)
      ) {
        if (
          state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.DATE &&
          state.eScannedType !== SvNumFormatType.DATETIME
        )
          return this["MatchedReturn"]();
        if (state.eScannedType === SvNumFormatType.UNDEFINED)
          state.eScannedType = SvNumFormatType.DATE;
        this["SkipBlanks"](value, position);
      } else return this["MatchedReturn"]();
    } else if (blanks || this["SkipBlanks"](value, position)) position[0] = startBlanks;
    else state.nDecPos = 2;
  } else if (
    state.eScannedType & SvNumFormatType.TIME &&
    this["GetTime100SecSep"](value, position)
  ) {
    if (state.nDecPos) return this["MatchedReturn"]();
    state.nDecPos = 2;
    if (
      state.bIso8601Tsep &&
      position[0] === value.getLength() &&
      state.eScannedType === SvNumFormatType.DATETIME &&
      (text(value) === "." || text(value) === ",")
    )
      return true;
    this["SkipBlanks"](value, position);
  }
  if (this["SkipChar"](47, value, position)) {
    if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.DATE
    )
      return this["MatchedReturn"]();
    if (
      state.eScannedType !== SvNumFormatType.DATE &&
      (state.eSetType === SvNumFormatType.FRACTION ||
        (state.nNumericsCnt === 3 &&
          (stringPosition === 3 || (stringPosition === 4 && state.nSign)) &&
          lcl_isBlanks(state.sStrArray[stringPosition - 2] as OUString)))
    ) {
      this["SkipBlanks"](value, position);
      if (position[0] === value.getLength()) {
        state.eScannedType = SvNumFormatType.FRACTION;
        if (
          state.eSetType === SvNumFormatType.FRACTION &&
          state.nNumericsCnt === 2 &&
          (stringPosition === 1 || (stringPosition === 2 && state.nSign))
        )
          return true;
      }
    } else position[0]--;
  }
  if (this["GetThousandSep"](value, position, stringPosition)) {
    if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.CURRENCY
    )
      return this["MatchedReturn"]();
    state.nThousand++;
  }
  const locale = this["language"].GetLocaleData(),
    signedYear: [boolean] = [false];
  let date = this["SkipDatePatternSeparator"](stringPosition, position, signedYear);
  if (!date) {
    this["SkipBlanks"](value, position);
    date = this["SkipString"](this["language"].GetDateSep(), value, position);
  }
  if (
    !date &&
    stringPosition === 1 &&
    state.mpFormat &&
    state.mpFormat.GetType() & SvNumFormatType.DATE
  ) {
    const order = state.mpFormat.GetExactDateOrder();
    if ((order & 255) === 89 && ((order >> 8) & 255) === 77 && ((order >> 16) & 255) === 68) {
      const previous = position[0];
      if (
        this["SkipChar"](46, value, position) &&
        this["SkipBlanks"](value, position) &&
        position[0] + 2 < value.getLength() &&
        (text(value).endsWith(" ") || text(value).endsWith(text(locale.getLongDateMonthSep())))
      )
        date = true;
      else position[0] = previous;
    }
  }
  if (
    date ||
    ((this["MayBeIso8601"]() || this["MayBeMonthDate"]()) && this["SkipChar"](45, value, position))
  ) {
    if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.DATE
    )
      return this["MatchedReturn"]();
    this["SkipBlanks"](value, position);
    state.eScannedType = SvNumFormatType.DATE;
    const month = this["GetMonth"](value, position);
    if (state.nMonth && month) return this["MatchedReturn"]();
    if (month) {
      state.nMonth = month;
      state.nMonthPos = 2;
      if (
        !(state.nMonth < 0 && this["SkipChar"](46, value, position)) &&
        !this["SkipChar"](45, value, position)
      )
        this["SkipString"](locale.getLongDateMonthSep(), value, position);
      this["SkipBlanks"](value, position);
    }
    if (signedYear[0]) {
      if (!state.mbEraCE) return this["MatchedReturn"]();
      state.mbEraCE = false;
    }
  }
  const monthStart = position[0],
    month = this["GetMonth"](value, position);
  if (month) {
    if (
      state.nMonth ||
      (state.eScannedType !== SvNumFormatType.UNDEFINED &&
        state.eScannedType !== SvNumFormatType.DATE)
    )
      return this["MatchedReturn"]();
    if (monthStart > 0 && position[0] < value.getLength()) {
      state.eScannedType = SvNumFormatType.DATE;
      state.nMonth = month;
      state.nMonthPos = numericCount <= 1 ? 2 : 3;
      if (state.nMonth < 0) this["SkipChar"](46, value, position);
      this["SkipString"](locale.getLongDateMonthSep(), value, position);
      this["SkipBlanks"](value, position);
    } else position[0] = monthStart;
  }
  if (this["SkipChar"](69, value, position) || this["SkipChar"](101, value, position)) {
    if (state.eScannedType !== SvNumFormatType.UNDEFINED) return this["MatchedReturn"]();
    this["SkipBlanks"](value, position);
    state.eScannedType = SvNumFormatType.SCIENTIFIC;
    if (state.nThousand + 2 === state.nNumericsCnt && state.nDecPos === 2) state.nDecPos = 3;
    state.nESign = this["GetESign"](value, position);
    this["SkipBlanks"](value, position);
  }
  if (this["SkipString"](locale.getTimeSep(), value, position)) {
    if (state.nDecPos) {
      if (state.bDecSepInDateSeps) {
        if (
          state.eScannedType !== SvNumFormatType.DATE &&
          state.eScannedType !== SvNumFormatType.DATETIME
        )
          return this["MatchedReturn"]();
        if (state.eScannedType === SvNumFormatType.DATE) state.nDecPos = 0;
      } else return this["MatchedReturn"]();
    }
    if (
      (state.eScannedType === SvNumFormatType.DATE ||
        state.eScannedType === SvNumFormatType.DATETIME) &&
      state.nNumericsCnt > 3
    ) {
      this["SkipBlanks"](value, position);
      state.eScannedType = SvNumFormatType.DATETIME;
    } else if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.TIME
    )
      return this["MatchedReturn"]();
    else {
      this["SkipBlanks"](value, position);
      state.eScannedType = SvNumFormatType.TIME;
    }
    if (!state.nTimePos) state.nTimePos = stringPosition + 1;
  }
  if (position[0] < value.getLength()) {
    if (state.eScannedType === SvNumFormatType.DATE) {
      if (state.nMonthPos === 1 && locale.getLongDateOrder() === LongDateOrder.MDY) {
        if (this["SkipString"](locale.getLongDateDaySep(), value, position))
          this["SkipBlanks"](value, position);
      } else if (position[0] === 0 && value.getLength() === 1 && this["MayBeIso8601"]()) {
        const code = value.getStr()[0];
        if (
          (stringPosition === 5 && code === 84) ||
          (stringPosition === 6 && code === 84 && text(state.sStrArray[0] as OUString) === "-")
        ) {
          position[0]++;
          state.bIso8601Tsep = true;
        } else if (stringPosition === 7 && code === 58) {
          if (state.nNumericsCnt >= 5) state.eScannedType = SvNumFormatType.DATETIME;
          position[0]++;
        }
      }
    } else if (
      state.eScannedType === SvNumFormatType.DATETIME &&
      position[0] === 0 &&
      value.getLength() === 1 &&
      this["MayBeIso8601"]() &&
      stringPosition === 9 &&
      value.getStr()[0] === 58
    )
      position[0]++;
  }
  if (position[0] < value.getLength()) {
    if (state.nMatchedAllStrings & ~0x08) state.eScannedType = oldType;
    else return false;
  }
  return true;
}

/** Source trailing fragment classification, including postfixed signs, date/time separators and format-token fallback. @param value - Already uppercased end fragment. @returns Whether all source characters were consumed.  @param this - Original native owner shared by its implementation fragments. */
export function ScanEndString(this: ImpSvNumberInputScanContext, value: OUString): boolean {
  const state = this["fields"],
    position: [number] = [0];
  if (state.nMatchedAllStrings) {
    if (this["ScanStringNumFor"](value, 0, 0xffff)) state.nMatchedAllStrings |= 0x01;
    else state.nMatchedAllStrings = 0;
  }
  const startBlanks = position[0],
    blanks = this["SkipBlanks"](value, position);
  if (this["GetDecSep"](value, position)) {
    if (state.nDecPos === 1 || state.nDecPos === 3) return this["MatchedReturn"]();
    if (state.nDecPos === 2) {
      const signedYear: [boolean] = [false];
      if (
        state.bDecSepInDateSeps ||
        this["SkipDatePatternSeparator"](state.nStringsCnt - 1, position, signedYear)
      ) {
        if (
          state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.DATE &&
          state.eScannedType !== SvNumFormatType.DATETIME
        )
          return this["MatchedReturn"]();
        if (state.eScannedType === SvNumFormatType.UNDEFINED)
          state.eScannedType = SvNumFormatType.DATE;
        this["SkipBlanks"](value, position);
      } else return this["MatchedReturn"]();
    } else if (blanks) position[0] = startBlanks;
    else {
      state.nDecPos = 3;
      this["SkipBlanks"](value, position);
    }
  }
  let signHere = false;
  if (state.nSign === 0 && state.eScannedType !== SvNumFormatType.DATE) {
    state.nSign = this["GetSign"](value, position);
    if (state.bNegCheck) return this["MatchedReturn"]();
    if (state.nSign) signHere = true;
  }
  this["SkipBlanks"](value, position);
  if (state.bNegCheck && this["SkipChar"](41, value, position)) {
    state.bNegCheck = false;
    this["SkipBlanks"](value, position);
  }
  if (this["GetCurrency"](value, position)) {
    if (state.eScannedType !== SvNumFormatType.UNDEFINED) return this["MatchedReturn"]();
    this["SkipBlanks"](value, position);
    state.eScannedType = SvNumFormatType.CURRENCY;
    if (state.nSign === 0) {
      state.nSign = this["GetSign"](value, position);
      this["SkipBlanks"](value, position);
      if (state.bNegCheck) return this["MatchedReturn"]();
    }
    if (
      state.bNegCheck &&
      state.eScannedType === SvNumFormatType.CURRENCY &&
      this["SkipChar"](41, value, position)
    ) {
      state.bNegCheck = false;
      this["SkipBlanks"](value, position);
    }
  }
  if (this["SkipChar"](37, value, position)) {
    if (state.eScannedType !== SvNumFormatType.UNDEFINED) return this["MatchedReturn"]();
    this["SkipBlanks"](value, position);
    state.eScannedType = SvNumFormatType.PERCENT;
  }
  const locale = this["language"].GetLocaleData();
  if (this["SkipString"](locale.getTimeSep(), value, position)) {
    if (state.nDecPos) return this["MatchedReturn"]();
    if (state.eScannedType === SvNumFormatType.DATE && state.nNumericsCnt > 2) {
      this["SkipBlanks"](value, position);
      state.eScannedType = SvNumFormatType.DATETIME;
    } else if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.TIME
    )
      return this["MatchedReturn"]();
    else {
      this["SkipBlanks"](value, position);
      state.eScannedType = SvNumFormatType.TIME;
    }
    if (!state.nTimePos) state.nTimePos = state.nStringsCnt;
  }
  const signedYear: [boolean] = [false];
  let date = this["SkipDatePatternSeparator"](state.nStringsCnt - 1, position, signedYear);
  if (!date) date = this["SkipString"](this["language"].GetDateSep(), value, position);
  if (date && signHere) state.nSign = 0;
  if (
    date ||
    ((this["MayBeIso8601"]() || this["MayBeMonthDate"]()) && this["SkipChar"](45, value, position))
  ) {
    if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.DATE
    )
      return this["MatchedReturn"]();
    this["SkipBlanks"](value, position);
    state.eScannedType = SvNumFormatType.DATE;
    const month = this["GetMonth"](value, position);
    if (state.nMonth && month) return this["MatchedReturn"]();
    if (month) {
      state.nMonth = month;
      state.nMonthPos = 3;
      if (state.nMonth < 0) this["SkipChar"](46, value, position);
      this["SkipBlanks"](value, position);
    }
  }
  const monthStart = position[0],
    month = this["GetMonth"](value, position);
  if (month) {
    if (
      state.nMonth ||
      (state.eScannedType !== SvNumFormatType.UNDEFINED &&
        state.eScannedType !== SvNumFormatType.DATE)
    )
      return this["MatchedReturn"]();
    if (monthStart > 0) {
      state.eScannedType = SvNumFormatType.DATE;
      state.nMonth = month;
      state.nMonthPos = 3;
      if (state.nMonth < 0) this["SkipChar"](46, value, position);
      this["SkipBlanks"](value, position);
    } else position[0] = monthStart;
  }
  const originalPosition = position[0];
  if (this["GetTimeAmPm"](value, position)) {
    if (
      state.eScannedType !== SvNumFormatType.UNDEFINED &&
      state.eScannedType !== SvNumFormatType.TIME &&
      state.eScannedType !== SvNumFormatType.DATETIME
    )
      return this["MatchedReturn"]();
    if (
      state.eScannedType !== SvNumFormatType.TIME &&
      state.nDecPos === 2 &&
      state.nNumericsCnt === 2
    )
      position[0] = originalPosition;
    else {
      this["SkipBlanks"](value, position);
      if (state.eScannedType !== SvNumFormatType.DATETIME)
        state.eScannedType = SvNumFormatType.TIME;
    }
  }
  if (state.bNegCheck && this["SkipChar"](41, value, position)) {
    if (state.eScannedType === SvNumFormatType.CURRENCY) {
      state.bNegCheck = false;
      this["SkipBlanks"](value, position);
    } else return this["MatchedReturn"]();
  }
  if (
    position[0] < value.getLength() &&
    (state.eScannedType === SvNumFormatType.DATE || state.eScannedType === SvNumFormatType.DATETIME)
  ) {
    const oldPosition = position[0],
      separator = locale.getLongDateDayOfWeekSep();
    if (this["StringContains"](separator, value, position[0])) {
      position[0] += separator.getLength();
      this["SkipBlanks"](value, position);
    }
    const day = this["GetDayOfWeek"](value, position);
    if (day) {
      if (position[0] < value.getLength()) {
        if (day < 0) this["SkipChar"](46, value, position);
        this["SkipBlanks"](value, position);
      }
    } else position[0] = oldPosition;
  }
  if (position[0] < value.getLength() && !this["ScanStringNumFor"](value, position[0], 0xffff))
    return false;
  return true;
}

/** Source fragment dispatch and final compiled-format reconciliation before numeric conversion. @param value - Already uppercased input. @param format - Optional compiled format to match. @returns Whether the input has a numeric or logical shape.  @param this - Original native owner shared by its implementation fragments. */
export function IsNumberFormatMain(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  format: SvNumberformatConstReference | null,
): boolean {
  this["Reset"]();
  const state = this["fields"];
  state.mpFormat = format;
  this["NumberStringDivision"](value);
  if (state.nStringsCnt >= SV_MAX_COUNT_INPUT_STRINGS) return false;
  if (state.nNumericsCnt === 0) {
    if (!state.nStringsCnt) return false;
    const fragment = state.sStrArray[0] as OUString,
      units = fragment.getStr();
    let begin = 0,
      end = fragment.getLength();
    while (begin < end && units[begin] === 32) begin++;
    while (end > begin && units[end - 1] === 32) end--;
    const stripped = new OUString(units.subarray(begin, end), end - begin);
    try {
      fragment.assign(stripped);
    } finally {
      stripped.dispose();
    }
    state.nLogical = this["GetLogical"](fragment);
    if (!state.nLogical) return false;
    state.eScannedType = SvNumFormatType.LOGICAL;
    state.nMatchedAllStrings &= ~0x08;
    return true;
  }
  const index: [number] = [0],
    numberCount: [number] = [0];
  switch (state.nNumericsCnt) {
    case 1:
      if (this["GetNextNumber"](index, numberCount)) {
        if (
          state.eSetType === SvNumFormatType.FRACTION &&
          (index[0] >= state.nStringsCnt ||
            this["language"].IsDecimalSep(state.sStrArray[index[0]] as OUString))
        ) {
          state.eScannedType = SvNumFormatType.FRACTION;
          state.nMatchedAllStrings &= ~0x08;
          return true;
        }
      } else {
        if (!this["ScanStartString"](state.sStrArray[index[0]] as OUString)) return false;
        index[0]++;
      }
      this["GetNextNumber"](index, numberCount);
      if (
        state.eSetType === SvNumFormatType.FRACTION &&
        state.nSign &&
        !state.bNegCheck &&
        state.eScannedType === SvNumFormatType.UNDEFINED &&
        state.nDecPos === 0 &&
        (index[0] >= state.nStringsCnt ||
          this["language"].IsDecimalSep(state.sStrArray[index[0]] as OUString))
      ) {
        state.eScannedType = SvNumFormatType.FRACTION;
        state.nMatchedAllStrings &= ~0x08;
        return true;
      }
      if (
        index[0] < state.nStringsCnt &&
        !this["ScanEndString"](state.sStrArray[index[0]] as OUString)
      )
        return false;
      break;
    case 2:
      if (!this["GetNextNumber"](index, numberCount)) {
        if (!this["ScanStartString"](state.sStrArray[index[0]] as OUString)) return false;
        index[0]++;
      }
      this["GetNextNumber"](index, numberCount);
      if (!this["ScanMidString"](state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
        return false;
      index[0]++;
      this["GetNextNumber"](index, numberCount);
      if (
        index[0] < state.nStringsCnt &&
        !this["ScanEndString"](state.sStrArray[index[0]] as OUString)
      )
        return false;
      if (
        state.eSetType === SvNumFormatType.FRACTION &&
        !state.bNegCheck &&
        state.eScannedType === SvNumFormatType.UNDEFINED &&
        (state.nDecPos === 0 || state.nDecPos === 3)
      ) {
        state.eScannedType = SvNumFormatType.FRACTION;
        state.nMatchedAllStrings &= ~0x08;
        return true;
      }
      break;
    case 3:
      if (!this["GetNextNumber"](index, numberCount)) {
        if (!this["ScanStartString"](state.sStrArray[index[0]] as OUString)) return false;
        index[0]++;
        if (state.nDecPos === 1) return false;
      }
      this["GetNextNumber"](index, numberCount);
      if (!this["ScanMidString"](state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
        return false;
      index[0]++;
      if (state.eScannedType === SvNumFormatType.SCIENTIFIC) return false;
      this["GetNextNumber"](index, numberCount);
      if (!this["ScanMidString"](state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
        return false;
      index[0]++;
      this["GetNextNumber"](index, numberCount);
      if (
        index[0] < state.nStringsCnt &&
        !this["ScanEndString"](state.sStrArray[index[0]] as OUString)
      )
        return false;
      if (
        state.eSetType === SvNumFormatType.FRACTION &&
        !state.bNegCheck &&
        state.eScannedType === SvNumFormatType.UNDEFINED &&
        (state.nDecPos === 0 || state.nDecPos === 3)
      ) {
        state.eScannedType = SvNumFormatType.FRACTION;
        state.nMatchedAllStrings &= ~0x08;
        return true;
      }
      if (state.eScannedType === SvNumFormatType.FRACTION && state.nDecPos) return false;
      break;
    default:
      if (!this["GetNextNumber"](index, numberCount)) {
        if (!this["ScanStartString"](state.sStrArray[index[0]] as OUString)) return false;
        index[0]++;
        if (state.nDecPos === 1) return false;
      }
      this["GetNextNumber"](index, numberCount);
      if (!this["ScanMidString"](state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
        return false;
      index[0]++;
      {
        let oldThousands = 10;
        while (oldThousands !== state.nThousand && numberCount[0] < state.nNumericsCnt - 1) {
          oldThousands = state.nThousand;
          if (state.eScannedType === SvNumFormatType.SCIENTIFIC) return false;
          this["GetNextNumber"](index, numberCount);
          if (
            index[0] < state.nStringsCnt &&
            !this["ScanMidString"](state.sStrArray[index[0]] as OUString, index[0], numberCount[0])
          )
            return false;
          index[0]++;
        }
      }
      if (
        state.eScannedType === SvNumFormatType.DATE ||
        state.eScannedType === SvNumFormatType.TIME ||
        state.eScannedType === SvNumFormatType.UNDEFINED
      ) {
        for (let slot = numberCount[0]; slot < state.nNumericsCnt - 1; slot++) {
          if (Number(state.eScannedType) === SvNumFormatType.SCIENTIFIC) return false;
          this["GetNextNumber"](index, numberCount);
          if (
            index[0] < state.nStringsCnt &&
            !this["ScanMidString"](state.sStrArray[index[0]] as OUString, index[0], numberCount[0])
          )
            return false;
          index[0]++;
        }
      }
      this["GetNextNumber"](index, numberCount);
      if (
        index[0] < state.nStringsCnt &&
        !this["ScanEndString"](state.sStrArray[index[0]] as OUString)
      )
        return false;
      if (
        state.eSetType === SvNumFormatType.FRACTION &&
        !state.bNegCheck &&
        state.eScannedType === SvNumFormatType.UNDEFINED &&
        (state.nDecPos === 0 || state.nDecPos === 3)
      ) {
        state.eScannedType = SvNumFormatType.FRACTION;
        state.nMatchedAllStrings &= ~0x08;
        return true;
      }
      if (state.eScannedType === SvNumFormatType.FRACTION && state.nDecPos) return false;
  }
  if (state.eScannedType === SvNumFormatType.UNDEFINED) {
    state.nMatchedAllStrings &= ~0x08;
    const didMatch = state.nMatchedAllStrings !== 0;
    if (
      state.nMatchedAllStrings &&
      !format?.IsNumForStringElementCountEqual(
        state.nStringScanNumFor,
        state.nStringsCnt,
        state.nNumericsCnt,
      )
    )
      state.nMatchedAllStrings = 0;
    if (state.nMatchedAllStrings) {
      let type = state.eSetType;
      if ((type === SvNumFormatType.UNDEFINED || type === SvNumFormatType.DEFINED) && format)
        type = format.GetNumForInfoScannedType(state.nStringScanNumFor);
      state.eScannedType =
        type !== SvNumFormatType.UNDEFINED && type !== SvNumFormatType.DEFINED
          ? type
          : SvNumFormatType.NUMBER;
    } else if (didMatch) {
      if (state.nDecPos !== 2 || state.nNumericsCnt !== 2) return false;
      state.eScannedType = SvNumFormatType.NUMBER;
    } else state.eScannedType = SvNumFormatType.NUMBER;
  } else if (state.eScannedType === SvNumFormatType.DATE) {
    state.nMatchedAllStrings &= ~0x08;
    const wasReturn = (state.nMatchedAllStrings & 0x10) !== 0;
    if (
      state.nMatchedAllStrings &&
      !format?.IsNumForStringElementCountEqual(
        state.nStringScanNumFor,
        state.nStringsCnt,
        state.nNumericsCnt,
      )
    )
      state.nMatchedAllStrings = 0;
    if (state.nMatchedAllStrings) {
      let type = state.eSetType;
      if ((type === SvNumFormatType.UNDEFINED || type === SvNumFormatType.DEFINED) && format)
        type = format.GetNumForInfoScannedType(state.nStringScanNumFor);
      if (type !== SvNumFormatType.UNDEFINED && type !== SvNumFormatType.DEFINED)
        state.eScannedType = type;
    } else if (wasReturn) return false;
  } else state.nMatchedAllStrings = 0;
  return true;
}
