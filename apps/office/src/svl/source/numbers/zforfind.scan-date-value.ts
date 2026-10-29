/** @fileoverview Original GetDateRef from zforfind.cxx, operating on the native scanner owner and actual CalendarWrapper. THE_FUTURE and NF_TEST_CALENDAR remain disabled exactly as in the normal upstream build. */
import type { ImpSvNumberInputScanContext } from "./zforfind.context";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { approxFloor } from "../../../sal/inc/rtl/math";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { Date as ToolsDate } from "../../../tools/source/datetime/tdate";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { DateOrder, LongDateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import type { SvNumberformatConstReference } from "./zformat";
import { NfEvalDateFormat, SvNumFormatType } from "../../inc/zforlist";
/** Original calendar date conversion and prescribed date-order retry loop. @param this - Original scanner owner. @param fDays - Serial-day output. @param nCounter - Consumed numeric-particle count. @returns Whether source calendar validation accepts the input. */
export function GetDateRef(
  this: ImpSvNumberInputScanContext,
  fDays: [number],
  nCounter: [number],
): boolean {
  const state = this["fields"],
    format = state.mpFormat as SvNumberformatConstReference;
  let eEDF: number;
  let nFormatOrder: number;
  if (state.mpFormat && format.GetType() & SvNumFormatType.DATE) {
    eEDF = this["language"].GetEvalDateFormat();
    switch (eEDF) {
      case NfEvalDateFormat.International:
      case NfEvalDateFormat.Format:
        nFormatOrder = 1; // only one loop
        break;
      default:
        nFormatOrder = 2;
        if (state.nMatchedAllStrings) {
          eEDF = NfEvalDateFormat.FormatThenInternational;
          // we have a complete match, use it
        }
    }
  } else {
    eEDF = NfEvalDateFormat.International;
    nFormatOrder = 1;
  }
  let res = true;

  const pLoc = this["language"].GetLocaleData();
  const pCal = this["language"].GetCalendar();
  const aToday = new DateTime(new ToolsDate(ToolsDate.SYSTEM));
  for (let nTryOrder = 1; nTryOrder <= nFormatOrder; nTryOrder++) {
    pCal.setGregorianDateTime(aToday); // today
    const aOrgCalendar = new OUString(); // empty => not changed yet
    let DateFmt: DateOrder;
    let bFormatTurn: boolean;
    switch (eEDF) {
      case NfEvalDateFormat.International:
        bFormatTurn = false;
        DateFmt = this["GetDateOrder"]();
        break;
      case NfEvalDateFormat.Format:
        bFormatTurn = true;
        DateFmt = format.GetDateOrder();
        break;
      case NfEvalDateFormat.InternationalThenFormat:
        if (nTryOrder == 1) {
          bFormatTurn = false;
          DateFmt = this["GetDateOrder"]();
        } else {
          bFormatTurn = true;
          DateFmt = format.GetDateOrder();
        }
        break;
      case NfEvalDateFormat.FormatThenInternational:
        if (nTryOrder == 2) {
          bFormatTurn = false;
          DateFmt = this["GetDateOrder"]();
        } else {
          bFormatTurn = true;
          // Even if the format pattern is to be preferred, the input may
          // have matched a pattern of the current locale, which then
          // again is to be preferred. Both date orders can be different
          // so we need to obtain the actual match. For example ISO
          // YYYY-MM-DD format vs locale's DD.MM.YY input.
          // If no pattern was matched, obtain from format.
          // Note that patterns may have been constructed from the
          // format's locale and prepended to the current locale's
          // patterns, it doesn't necessarily mean a current locale's
          // pattern was matched, but may if the format's locale's
          // patterns didn't match, which were tried first.
          DateFmt = this["GetDateOrder"](true);
        }
        break;
      default:
        DateFmt = DateOrder.YMD;
        bFormatTurn = false;
    }
    // Source THE_FUTURE calendar switching is compiled out.

    res = true;
    nCounter[0] = 0;
    // For incomplete dates, always assume first day of month if not specified.
    pCal.setValue(C.DAY_OF_MONTH, 1);

    switch (
      state.nNumericsCnt // count of numbers in string
    ) {
      case 0: // none
        if (state.nMonthPos) // only month (Jan)
        {
          pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
        } else {
          res = false;
        }
        break;

      case 1: // only one number
        nCounter[0] = 1;
        switch (
          state.nMonthPos // where is the month
        ) {
          case 0: {
            // not found
            // If input matched a date pattern, use the pattern
            // to determine if it is a day, month or year. The
            // pattern should have only one single value then,
            // 'D-', 'M-' or 'Y-'. If input did not match a
            // pattern assume the usual day of current month.
            const nDateOrder = bFormatTurn
              ? format.GetExactDateOrder()
              : this["GetDatePatternOrder"]();
            switch (nDateOrder) {
              case 89:
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              case 77:
                pCal.setValue(C.MONTH, this["ImplGetMonth"](0));
                break;
              case 68:
              default:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                break;
            }
            break;
          }
          case 1: // month at the beginning (Jan 01)
            pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
            switch (DateFmt) {
              case DateOrder.MDY:
              case DateOrder.YMD: {
                const day = this["ImplGetDay"](0);
                if (day > 0 && day <= 32) // Why 32?
                {
                  pCal.setValue(C.DAY_OF_MONTH, day);
                  break;
                }
                // Original fallthrough to the DMY year assignment.
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              }
              case DateOrder.DMY:
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              default:
                res = false;
                break;
            }
            break;
          case 3: // month at the end (10 Jan)
            pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
            switch (DateFmt) {
              case DateOrder.DMY:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                break;
              case DateOrder.YMD:
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              default:
                res = false;
                break;
            }
            break;
          default:
            res = false;
            break;
        } // switch (state.nMonthPos)
        break;

      case 2: // 2 numbers
        nCounter[0] = 2;
        switch (
          state.nMonthPos // where is the month
        ) {
          case 0: // not found
            {
              let nExactDateOrder = bFormatTurn
                ? format.GetExactDateOrder()
                : this["GetDatePatternOrder"]();
              let bIsExact = 0xff < nExactDateOrder && nExactDateOrder <= 0xffff;
              if (
                !bIsExact &&
                bFormatTurn &&
                this["IsAcceptedDatePattern"](state.nNums[0] as number)
              ) {
                // If input does not match format but pattern, use pattern
                // instead, even if eEDF==NfEvalDateFormat.FormatThenInternational.
                // For example, format has "Y-M-D" and pattern is "D.M.",
                // input with 2 numbers can't match format and 31.12. would
                // lead to 1931-12-01 (fdo#54344)
                nExactDateOrder = this["GetDatePatternOrder"]();
                bIsExact = 0xff < nExactDateOrder && nExactDateOrder <= 0xffff;
              }
              let bHadExact: boolean;
              if (bIsExact) {
                // formatted as date and exactly 2 parts
                bHadExact = true;
                switch ((nExactDateOrder >> 8) & 0xff) {
                  case 89:
                    pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                    break;
                  case 77:
                    pCal.setValue(C.MONTH, this["ImplGetMonth"](0));
                    break;
                  case 68:
                    pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                    break;
                  default:
                    bHadExact = false;
                }
                switch (nExactDateOrder & 0xff) {
                  case 89:
                    pCal.setValue(C.YEAR, this["ImplGetYear"](1));
                    break;
                  case 77:
                    pCal.setValue(C.MONTH, this["ImplGetMonth"](1));
                    break;
                  case 68:
                    pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
                    break;
                  default:
                    bHadExact = false;
                }
              } else {
                bHadExact = false;
              }
              // If input matched against a date acceptance pattern
              // do not attempt to mess around with guessing the
              // order, either it matches or it doesn't.
              if ((bFormatTurn || !bIsExact) && (!bHadExact || !pCal.isValid())) {
                if (!bHadExact && nExactDateOrder) {
                  pCal.setGregorianDateTime(aToday); // reset today
                }
                switch (DateFmt) {
                  case DateOrder.MDY: {
                    // M D
                    const month = this["ImplGetMonth"](0);
                    pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
                    pCal.setValue(C.MONTH, month);
                    if (!pCal.isValid()) // 2nd try
                    {
                      // M Y
                      pCal.setValue(C.DAY_OF_MONTH, 1);
                      pCal.setValue(C.MONTH, month);
                      pCal.setValue(C.YEAR, this["ImplGetYear"](1));
                    }
                    break;
                  }
                  case DateOrder.DMY:
                    // D M
                    pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                    pCal.setValue(C.MONTH, this["ImplGetMonth"](1));
                    if (!pCal.isValid()) // 2nd try
                    {
                      // M Y
                      pCal.setValue(C.DAY_OF_MONTH, 1);
                      pCal.setValue(C.MONTH, this["ImplGetMonth"](0));
                      pCal.setValue(C.YEAR, this["ImplGetYear"](1));
                    }
                    break;
                  case DateOrder.YMD:
                    // M D
                    pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
                    pCal.setValue(C.MONTH, this["ImplGetMonth"](0));
                    if (!pCal.isValid()) // 2nd try
                    {
                      // Y M
                      pCal.setValue(C.DAY_OF_MONTH, 1);
                      pCal.setValue(C.MONTH, this["ImplGetMonth"](1));
                      pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                    }
                    break;
                  default:
                    res = false;
                    break;
                }
              }
            }
            break;
          case 1: {
            // month at the beginning (Jan 01 01)
            // The input is valid as MDY in almost any
            // constellation, there is no date order (M)YD except if
            // set in a format applied.
            pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
            const nExactDateOrder = bFormatTurn ? format.GetExactDateOrder() : 0;
            if (((nExactDateOrder >> 8) & 0xff) == 89 && (nExactDateOrder & 0xff) == 68) {
              pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
              pCal.setValue(C.YEAR, this["ImplGetYear"](0));
            } else {
              pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
              pCal.setValue(C.YEAR, this["ImplGetYear"](1));
            }
            break;
          }
          case 2: {
            // month in the middle (10 Jan 94)
            pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
            const eLDO = this["GetMiddleMonthLongDateOrder"](bFormatTurn, pLoc, DateFmt);
            switch (eLDO) {
              case LongDateOrder.DMY:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                pCal.setValue(C.YEAR, this["ImplGetYear"](1));
                break;
              case LongDateOrder.YMD:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              default:
                res = false;
                break;
            }
            break;
          }
          case 3: // month at the end (94 10 Jan)
            if (pLoc.getLongDateOrder() != LongDateOrder.YDM) res = false;
            else {
              pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
              pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
              pCal.setValue(C.YEAR, this["ImplGetYear"](0));
            }
            break;
          default:
            res = false;
            break;
        } // switch (state.nMonthPos)
        break;

      default: // more than two numbers (31.12.94 8:23) (31.12. 8:23)
        switch (
          state.nMonthPos // where is the month
        ) {
          case 0: {
            // not found
            nCounter[0] = 3;
            if (state.nTimePos > 1) {
              // find first time number index (should only be 3 or 2 anyway)
              for (let j = 0; j < state.nNumericsCnt; j++) {
                if ((state.nNums[j] as number) == state.nTimePos - 2) {
                  nCounter[0] = j;
                  break; // for
                }
              }
            }
            // ISO 8601 yyyy-mm-dd forced recognition
            const eDF = this["CanForceToIso8601"](DateFmt) ? DateOrder.YMD : DateFmt;
            switch (eDF) {
              case DateOrder.MDY:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
                pCal.setValue(C.MONTH, this["ImplGetMonth"](0));
                if (nCounter[0] > 2) pCal.setValue(C.YEAR, this["ImplGetYear"](2));
                break;
              case DateOrder.DMY:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                pCal.setValue(C.MONTH, this["ImplGetMonth"](1));
                if (nCounter[0] > 2) pCal.setValue(C.YEAR, this["ImplGetYear"](2));
                break;
              case DateOrder.YMD:
                if (nCounter[0] > 2) pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](2));
                pCal.setValue(C.MONTH, this["ImplGetMonth"](1));
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              default:
                res = false;
                break;
            }
            break;
          }
          case 1: {
            // month at the beginning (Jan 01 01 8:23)
            nCounter[0] = 2;
            // The input is valid as MDY in almost any
            // constellation, there is no date order (M)YD except if
            // set in a format applied.
            pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
            const nExactDateOrder = bFormatTurn ? format.GetExactDateOrder() : 0;
            if (((nExactDateOrder >> 8) & 0xff) == 89 && (nExactDateOrder & 0xff) == 68) {
              pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
              pCal.setValue(C.YEAR, this["ImplGetYear"](0));
            } else {
              pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
              pCal.setValue(C.YEAR, this["ImplGetYear"](1));
            }
            break;
          }
          case 2: {
            // month in the middle (10 Jan 94 8:23)
            nCounter[0] = 2;
            pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
            const eLDO = this["GetMiddleMonthLongDateOrder"](bFormatTurn, pLoc, DateFmt);
            switch (eLDO) {
              case LongDateOrder.DMY:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](0));
                pCal.setValue(C.YEAR, this["ImplGetYear"](1));
                break;
              case LongDateOrder.YMD:
                pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
                pCal.setValue(C.YEAR, this["ImplGetYear"](0));
                break;
              default:
                res = false;
                break;
            }
            break;
          }
          case 3: // month at the end (94 10 Jan 8:23)
            nCounter[0] = 2;
            if (pLoc.getLongDateOrder() != LongDateOrder.YDM) res = false;
            else {
              pCal.setValue(C.DAY_OF_MONTH, this["ImplGetDay"](1));
              pCal.setValue(C.MONTH, Math.abs(state.nMonth) - 1);
              pCal.setValue(C.YEAR, this["ImplGetYear"](0));
            }
            break;
          default:
            nCounter[0] = 2;
            res = false;
            break;
        } // switch (state.nMonthPos)
        break;
    } // switch (state.nNumericsCnt)

    if (state.mbEraCE != true) pCal.setValue(C.ERA, state.mbEraCE ? 1 : 0);

    if (res && pCal.isValid()) {
      const fDiff = DateTime.Sub(new DateTime(state.maNullDate), pCal.getEpochStart());
      fDays[0] = approxFloor(pCal.getLocalDateTime());
      fDays[0] -= fDiff;
      nTryOrder = nFormatOrder; // break for
    } else {
      res = false;
    }
    /* istanbul ignore if -- B8TCAE-D01: THE_FUTURE is disabled; this local empty calendar name is never assigned or passed by reference. */
    if (aOrgCalendar.getLength() !== 0) {
      pCal.loadCalendar(aOrgCalendar, pLoc.getMyLocale()); // restore calendar
    } else {
      /* Retain the normal no-restore source-map alternative. */
    }
    aOrgCalendar.dispose();
  }
  return res;
}
