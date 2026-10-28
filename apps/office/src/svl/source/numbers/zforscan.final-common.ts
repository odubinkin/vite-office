/** @fileoverview Shared original FinalScan operations. Remaining final string rebuilding and currency/date conversion stages are ported here as their source dependencies become available. */
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original RemoveQuotes removes exactly one matching outer double-quote pair, or one leading escape when the string has at least two units. @param value - Original in/out owner. @returns Native removed-unit count. */
export function RemoveQuotes(value: OUString): number {
  if (value.getLength() > 1) {
    const first = value.getStr()[0],
      last = value.getLength() - 1;
    if (first === 34 && value.getStr()[last] === 34) {
      const result = value.copy(1, last - 1);
      try {
        value.moveAssign(result);
      } finally {
        result.dispose();
      }
      return 2;
    } else if (first === 92) {
      const result = value.copy(1);
      try {
        value.moveAssign(result);
      } finally {
        result.dispose();
      }
      return 1;
    }
  }
  return 0;
}

import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { DateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType as T } from "../../inc/zforlist";
import type { ImpSvNumberformatScan } from "./zforscan";
import type { FinalScanState } from "./zforscan.final-state";
import { StringEqualsChar } from "./zforscan.final-number";
/** Original conversion-time date reorder and string quoting. @param this - Owner. @param state - Source locals. @returns Nothing. */
export function FinalScanConvert(this: ImpSvNumberformatScan, state: FinalScanState): void {
  const strings = this["sStrArray"],
    types = this["nTypeArray"],
    day = state.nDayPos,
    month = state.nMonthPos,
    year = state.nYearPos;
  if (state.bNewDateOrder && StringEqualsChar(state.sOldDateSep, 45)) {
    if (this["IsDateFragment"](year, month)) {
      types[year + 1] = S.STRING;
      (strings[year + 1] as OUString).assign(state.sOldDateSep);
      state.bNewDateOrder = false;
    }
    if (this["IsDateFragment"](month, day)) {
      types[month + 1] = S.STRING;
      (strings[month + 1] as OUString).assign(state.sOldDateSep);
      state.bNewDateOrder = false;
    }
  }
  if (state.bNewDateOrder) {
    switch (state.eOldDateOrder) {
      case DateOrder.DMY:
        switch (state.pLoc.getDateOrder()) {
          case DateOrder.MDY:
            if (this["IsDateFragment"](day, month) && !this["IsDateFragment"](year, day))
              this["SwapArrayElements"](day, month);
            break;
          case DateOrder.YMD:
            if (year !== 65535) {
              if (this["IsDateFragment"](day, month) && this["IsDateFragment"](month, year))
                this["SwapArrayElements"](day, year);
            } else if (this["IsDateFragment"](day, month)) this["SwapArrayElements"](day, month);
            break;
        }
        break;
      case DateOrder.MDY:
        switch (state.pLoc.getDateOrder()) {
          case DateOrder.DMY:
            if (this["IsDateFragment"](month, day) && !this["IsDateFragment"](year, month))
              this["SwapArrayElements"](month, day);
            break;
          case DateOrder.YMD:
            if (
              year !== 65535 &&
              this["IsDateFragment"](month, day) &&
              this["IsDateFragment"](day, year)
            ) {
              this["SwapArrayElements"](year, month);
              this["SwapArrayElements"](year, day);
            }
            break;
        }
        break;
      case DateOrder.YMD:
        switch (state.pLoc.getDateOrder()) {
          case DateOrder.DMY:
            if (year !== 65535) {
              if (this["IsDateFragment"](year, month) && this["IsDateFragment"](month, day))
                this["SwapArrayElements"](year, day);
            } else if (this["IsDateFragment"](month, day)) this["SwapArrayElements"](month, day);
            break;
          case DateOrder.MDY:
            if (
              year !== 65535 &&
              this["IsDateFragment"](year, month) &&
              this["IsDateFragment"](month, day)
            ) {
              this["SwapArrayElements"](year, day);
              this["SwapArrayElements"](year, month);
            }
            break;
        }
        break;
    }
  }
  for (state.i = 0; state.i < this["nStringsCnt"]; ++state.i) {
    if (types[state.i] === S.STRING && (strings[state.i] as OUString).getStr()[0] !== 34) {
      if (this["bConvertSystemToSystem"] && this["eScannedType"] === T.CURRENCY) {
        if ((strings[state.i] as OUString).equals(state.sOldCurSymbol)) continue;
        const value = strings[state.i] as OUString;
        if (value.getLength() < state.sOldCurSymbol.getLength()) {
          const upper = state.pChrCls.uppercase(value, 0, 1);
          let matches: boolean;
          try {
            matches = upper.getStr()[0] === state.sOldCurString.getStr()[0];
          } finally {
            upper.dispose();
          }
          if (matches) {
            const temporary = new OUString(value);
            let j = state.i + 1;
            try {
              while (
                temporary.getLength() < state.sOldCurSymbol.getLength() &&
                j < this["nStringsCnt"] &&
                types[j] === S.STRING
              )
                temporary.append(strings[j++] as OUString);
              const upper = state.pChrCls.uppercase(temporary);
              try {
                if (upper.equals(state.sOldCurString)) {
                  (strings[state.i++] as OUString).assign(temporary);
                  for (; state.i < j; ++state.i) {
                    types[state.i] = S.EMPTY;
                    this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
                  }
                  state.i = j - 1;
                  continue;
                }
              } finally {
                upper.dispose();
              }
            } finally {
              temporary.dispose();
            }
          }
        }
      }
      const value = strings[state.i] as OUString,
        length = value.getLength();
      for (let j = 0; j < length; ++j) {
        const english: [boolean] = [false];
        if ((j === 0 || value.getStr()[j - 1] !== 92) && this["GetKeyWord"](value, j, english)) {
          const quote = new Uint8Array([34, 0]),
            expression = new StringConcat(new StringConcat(quote, value), quote),
            quoted = new OUString(expression);
          try {
            value.moveAssign(quoted);
          } finally {
            quoted.dispose();
          }
          break;
        }
      }
    }
  }
}
/** Original repeated currency-tail replacement over the current array/output positions. @param this - Owner. @param state - Stack locals. @param code - Rebuilt source code. @param arrayIndex - Stable merged slot. @param arrayPosition - Saved local offset. @param stringPosition - Saved output offset. @returns Nothing. */
function replaceCurrencyTail(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
  code: OUString,
  arrayIndex: number,
  arrayPosition: number,
  stringPosition: number,
): void {
  const value = this["sStrArray"][arrayIndex] as OUString,
    upper = state.pChrCls.uppercase(value, arrayPosition, value.getLength() - arrayPosition);
  try {
    const currencyPosition = upper.indexOf(state.sOldCurString);
    if (currencyPosition >= 0) {
      const currency =
        this["bConvertMode"] && this["bConvertSystemToSystem"]
          ? this.GetCurSymbol()
          : state.sOldCurSymbol;
      const replaced = value.replaceAt(
        arrayPosition + currencyPosition,
        state.sOldCurString.getLength(),
        currency,
      );
      try {
        value.moveAssign(replaced);
      } finally {
        replaced.dispose();
      }
      const output = code.replaceAt(
        stringPosition + currencyPosition,
        state.sOldCurString.getLength(),
        currency,
      );
      try {
        code.moveAssign(output);
      } finally {
        output.dispose();
      }
    }
  } finally {
    upper.dispose();
  }
}
/** Original final string concatenation, quote stripping, escape simplification and Thai modifier token removal. @param this - Owner. @param state - Stack locals. @param code - Source in/out code. @returns Nothing. */
export function FinalScanRebuild(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
  code: OUString,
): void {
  const strings = this["sStrArray"],
    types = this["nTypeArray"],
    language = this.GetCurrentLanguageData();
  code.clear();
  state.i = 0;
  while (state.i < this["nStringsCnt"]) {
    let stringPosition: number,
      arrayPosition = 0;
    const arrayIndex = state.i;
    switch (types[state.i]) {
      case S.STRING:
      case S.FRACBLANK:
        stringPosition = code.getLength();
        do {
          const value = strings[state.i] as OUString;
          if (value.getLength() === 2 && value.getStr()[0] === 92) {
            const unit = value.getStr()[1] as number;
            switch (unit) {
              case 43:
              case 45: {
                code.append(Uint16Array.of(unit));
                break;
              }
              case 32:
              case 46:
              case 47:
                if (
                  !(this["eScannedType"] & T.DATE) &&
                  (StringEqualsChar(language.GetNumThousandSep(), unit) ||
                    StringEqualsChar(language.GetNumDecimalSep(), unit) ||
                    (unit === 32 &&
                      (StringEqualsChar(language.GetNumThousandSep(), 160) ||
                        StringEqualsChar(language.GetNumThousandSep(), 8239))))
                )
                  code.append(value);
                else if (
                  this["eScannedType"] & T.DATE &&
                  StringEqualsChar(language.GetDateSep(), unit)
                )
                  code.append(value);
                else if (
                  this["eScannedType"] & T.TIME &&
                  (StringEqualsChar(state.pLoc.getTimeSep(), unit) ||
                    StringEqualsChar(state.pLoc.getTime100SecSep(), unit))
                )
                  code.append(value);
                else if (this["eScannedType"] & T.FRACTION) code.append(value);
                else {
                  code.append(Uint16Array.of(unit));
                }
                break;
              default:
                code.append(value);
                break;
            }
          } else code.append(value);
          if (RemoveQuotes(value) > 0) {
            if (this["eScannedType"] === T.CURRENCY) {
              replaceCurrencyTail.call(
                this,
                state,
                code,
                arrayIndex,
                arrayPosition,
                stringPosition,
              );
              stringPosition = code.getLength();
              arrayPosition =
                (strings[arrayIndex] as OUString).getLength() +
                (arrayIndex === state.i ? 0 : value.getLength());
            }
          }
          if (arrayIndex !== state.i) {
            (strings[arrayIndex] as OUString).append(value);
            types[state.i] = S.EMPTY;
            this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
          }
          ++state.i;
        } while (state.i < this["nStringsCnt"] && types[state.i] === S.STRING);
        if (state.i < this["nStringsCnt"]) --state.i;
        if (this["eScannedType"] === T.CURRENCY && stringPosition < code.getLength())
          replaceCurrencyTail.call(this, state, code, arrayIndex, arrayPosition, stringPosition);
        break;
      case S.CURRENCY:
        code.append(strings[state.i] as OUString);
        RemoveQuotes(strings[state.i] as OUString);
        break;
      case K.THAI_T:
        if (state.bThaiT && this.GetNatNumModifier() === 1) {
          types[state.i] = S.EMPTY;
          this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
        } else code.append(strings[state.i] as OUString);
        break;
      case S.EMPTY:
        break;
      default:
        code.append(strings[state.i] as OUString);
        break;
    }
    ++state.i;
  }
}
/** Original FinalScan post-switch validation and common pipeline. @param this - Owner. @param state - Source locals. @param code - In/out code. @returns Native control position. */
export function FinalScanComplete(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
  code: OUString,
): number {
  if (
    this["eScannedType"] === T.SCIENTIFIC &&
    (this["nCntPre"] + this["nCntPost"] === 0 || this["nCntExp"] === 0)
  )
    return state.nPos;
  else if (this["eScannedType"] === T.FRACTION && (this["nCntExp"] > 8 || this["nCntExp"] === 0))
    return state.nPos;
  if (state.bThaiT && !this.GetNatNumModifier()) this.SetNatNumModifier(1);
  if (this["bConvertMode"]) FinalScanConvert.call(this, state);
  FinalScanRebuild.call(this, state, code);
  return 0;
}
