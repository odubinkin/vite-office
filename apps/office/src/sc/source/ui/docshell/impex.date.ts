/** @fileoverview Original lcl_PutString explicit-date branch from impex.cxx, using the real calendar/transliteration/document formatter owners. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { stringToDouble } from "../../../../sal/inc/rtl/math";
import { rtl_math_ConversionStatus as Status } from "../../../../sal/inc/rtl/math-values";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import * as F from "../../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { CalendarWrapper } from "../../../../unotools/source/i18n/calendarwrapper";
import { TransliterationWrapper } from "../../../../unotools/source/i18n/transliterationwrapper";
import type { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import { SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { ScGlobal } from "../../../inc/global";
import type { ScDocumentImport } from "../../../inc/documentimport";
import type { ScAddress } from "../../../inc/address";
import { SC_COL_YMD, SC_COL_MDY } from "../inc/csvcontrol";
/** Original explicit-date parsing and calendar validation; false continues the original SetString/EditCell fallback. @param docImport - Actual document import owner. @param position - Actual cell. @param value - Original field string. @param columnFormat - Source external column type. @param formatter - Actual import-language formatter. @param transliteration - Actual primary comparison wrapper. @param calendar - Actual primary calendar. @param secondTransliteration - Optional actual second wrapper. @param secondCalendar - Optional actual second calendar. @returns Whether the branch wrote a date cell. */
export function PutDate(
  docImport: ScDocumentImport,
  position: ScAddress,
  value: OUStringConstReference,
  columnFormat: number,
  formatter: SvNumberFormatter,
  transliteration: TransliterationWrapper,
  calendar: CalendarWrapper,
  secondTransliteration: TransliterationWrapper | null,
  secondCalendar: CalendarWrapper | null,
): boolean {
  const document = docImport.getDoc(),
    length = value.getLength(),
    starts: number[] = [],
    ends: number[] = [],
    classifier = ScGlobal.getCharClass();
  let dayPart = 0,
    monthPart = 1,
    yearPart = 2,
    iso = false;
  switch (columnFormat) {
    case SC_COL_YMD:
      dayPart = 2;
      monthPart = 1;
      yearPart = 0;
      iso = true;
      break;
    case SC_COL_MDY:
      dayPart = 1;
      monthPart = 0;
      yearPart = 2;
      break;
  }
  let found = 0,
    inNumber = false;
  for (let index = 0; index < length && (inNumber || found < 7); ++index) {
    let letter = false;
    const unit = value.charAt(index);
    if (
      (48 <= unit && unit <= 57) ||
      (((!inNumber && found === monthPart) || (inNumber && found === monthPart + 1)) &&
        (letter = classifier.isLetterNumeric(value, index)))
    ) {
      if (!inNumber) {
        inNumber = true;
        starts[found] = index;
        ++found;
      }
      ends[found - 1] = index;
      if (
        iso &&
        (letter || (2 <= found && found <= 6 && index > (starts[found - 1] as number) + 1))
      )
        iso = false;
    } else {
      inNumber = false;
      if (iso) {
        switch (unit) {
          case 43:
            if (!(found >= 5 && index === (ends[found - 1] as number) + 1) && index > 0)
              iso = false;
            break;
          case 45:
            if (found >= 5 && index === (ends[found - 1] as number) + 1) break;
            if (
              (found === 0 && index > 0) ||
              found < 1 ||
              found > 2 ||
              index !== (ends[found - 1] as number) + 1
            )
              iso = false;
            break;
          case 84:
          case 32:
            if (found !== 3 || index !== (ends[found - 1] as number) + 1) iso = false;
            break;
          case 58:
            if (found < 4 || found > 5 || index !== (ends[found - 1] as number) + 1) iso = false;
            break;
          case 46:
          case 44:
            if (found !== 6 || index !== (ends[found - 1] as number) + 1) iso = false;
            break;
          case 90:
            if (!(found >= 5 && index === (ends[found - 1] as number) + 1)) iso = false;
            break;
          default:
            iso = false;
        }
      }
    }
  }
  if (found < 3) iso = false;
  const docFormatter = document.GetFormatTable();
  if (iso) {
    const key: [number] = [0],
      numeric: [number] = [0];
    if (docFormatter.IsNumberFormat(value, key, numeric) && docFormatter.GetType(key[0]) & T.DATE) {
      docImport.setNumericCell(position, numeric[0]);
      document.SetNumberFormat(position, key[0]);
      return true;
    }
  }
  if (found === 1) {
    const start = starts[0] as number,
      count = (ends[0] as number) + 1 - start;
    const candidate = value.copy(start, count);
    try {
      if (count >= 5 && count <= 8 && classifier.isNumeric(candidate)) {
        const longYear = count >= 7,
          shortFirst = count === 5 || count === 7;
        let fieldStart = start & 65535;
        for (let part = 0; part < 3; ++part) {
          let fieldEnd = (fieldStart + 1) & 65535;
          if (longYear && part === yearPart) fieldEnd = (fieldEnd + 2) & 65535;
          if (shortFirst && part === 0) fieldEnd = (fieldEnd - 1) & 65535;
          starts[part] = fieldStart;
          ends[part] = fieldEnd;
          fieldStart = (fieldEnd + 1) & 65535;
        }
        found = 3;
      }
    } finally {
      candidate.dispose();
    }
  }
  if (iso || found < 3) return false;
  const partView =
    /** Original bounded part view used by native integer conversion. @param part - Numeric part index. @returns Borrowed UTF16 units. */ (
      part: number,
    ): Uint16Array =>
      value.subView(starts[part] as number, (ends[part] as number) + 1 - (starts[part] as number));
  const day = toInt32(partView(dayPart)) & 65535;
  let year = toInt32(partView(yearPart)) & 65535,
    useSecond = false;
  const monthString = new OUString(partView(monthPart), partView(monthPart).length);
  let month = (monthString.toInt32() << 16) >> 16;
  try {
    if (!month) {
      const shortened = unicode("SEP"),
        september = unicode("SEPT"),
        months = calendar.getMonths();
      try {
        for (let index = 0; index < months.length && !month; ++index) {
          const item = months[index] as (typeof months)[number];
          if (
            transliteration.isEqual(monthString, item.FullName) ||
            transliteration.isEqual(monthString, item.AbbrevName) ||
            (index === 8 &&
              transliteration.isEqual(september, item.AbbrevName) &&
              transliteration.isEqual(monthString, shortened))
          )
            month = index + 1;
        }
        if (!month && secondCalendar && secondTransliteration) {
          const englishMonths = secondCalendar.getMonths();
          try {
            for (let index = 0; index < englishMonths.length && !month; ++index) {
              const item = englishMonths[index] as (typeof englishMonths)[number];
              if (
                secondTransliteration.isEqual(monthString, item.FullName) ||
                secondTransliteration.isEqual(monthString, item.AbbrevName) ||
                (index === 8 && secondTransliteration.isEqual(monthString, shortened))
              ) {
                month = index + 1;
                useSecond = true;
              }
            }
          } finally {
            for (const item of englishMonths) {
              item.FullName.dispose();
              item.AbbrevName.dispose();
            }
          }
        }
      } finally {
        for (const item of months) {
          item.FullName.dispose();
          item.AbbrevName.dispose();
        }
        shortened.dispose();
        september.dispose();
      }
    }
  } finally {
    monthString.dispose();
  }
  if (year < 100) year = docFormatter.ExpandTwoDigitYear(year);
  const selected = (useSecond ? secondCalendar : calendar) as CalendarWrapper,
    numberOfMonths = selected.getNumberOfMonthsInYear();
  if (!(day && month && day <= 31 && month <= numberOfMonths)) return false;
  --month;
  selected.setValue(F.DAY_OF_MONTH, day);
  selected.setValue(F.MONTH, month);
  selected.setValue(F.YEAR, year);
  let hour = found > 3 ? (toInt32(partView(3)) << 16) >> 16 : 0;
  const minute = found > 4 ? (toInt32(partView(4)) << 16) >> 16 : 0,
    second = found > 5 ? (toInt32(partView(5)) << 16) >> 16 : 0;
  let fraction = 0;
  if (found > 6) {
    const units = partView(6),
      buffer = new Uint16Array(units.length + 1);
    buffer[0] = 46;
    buffer.set(units, 1);
    const decimal = new OUString(buffer, buffer.length),
      status: [Status] = [Status.rtl_math_ConversionStatus_Ok];
    try {
      const result = stringToDouble(decimal, 46, 0, status);
      if (status[0] === Status.rtl_math_ConversionStatus_Ok) fraction = result / 86400;
    } finally {
      decimal.dispose();
    }
  }
  let index: number;
  if (found > 3 && hour >= 1 && hour <= 12 && (index = (ends[found - 1] as number) + 1) < length) {
    while (index < length && value.charAt(index) === 32) ++index;
    if (index < length) {
      let stop = index;
      while (stop < length && value.charAt(stop) !== 32) ++stop;
      const ampm = value.copy(index, stop - index),
        am = unicode("AM"),
        pm = unicode("PM");
      try {
        if (
          hour === 12 &&
          (transliteration.isEqual(ampm, formatter.GetLocaleData().getTimeAM()) ||
            (secondTransliteration && secondTransliteration.isEqual(ampm, am)))
        )
          hour = 0;
        else if (
          hour < 12 &&
          (transliteration.isEqual(ampm, formatter.GetLocaleData().getTimePM()) ||
            (secondTransliteration && secondTransliteration.isEqual(ampm, pm)))
        )
          hour += 12;
      } finally {
        ampm.dispose();
        am.dispose();
        pm.dispose();
      }
    }
  }
  selected.setValue(F.HOUR, hour);
  selected.setValue(F.MINUTE, minute);
  selected.setValue(F.SECOND, second);
  selected.setValue(F.MILLISECOND, 0);
  if (!selected.isValid()) return false;
  const difference = DateTime.Sub(
      new DateTime(docFormatter.GetNullDate()),
      selected.getEpochStart(),
    ),
    days = selected.getLocalDateTime() + fraction - difference,
    latin: [number] = [0],
    cjk: [number] = [0],
    ctl: [number] = [0];
  document.GetLanguage(latin, cjk, ctl);
  const type = found > 3 ? T.DATETIME : T.DATE;
  let format = docFormatter.GetStandardFormat(type, latin[0]);
  if (found > 5) format = docFormatter.GetStandardFormat(days, format, type, latin[0]);
  docImport.setNumericCell(position, days);
  document.SetNumberFormat(position, format);
  return true;
}
