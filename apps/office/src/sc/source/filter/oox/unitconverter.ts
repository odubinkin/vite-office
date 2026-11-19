/** @fileoverview SpreadsheetML character and device units from the native UnitConverter. */
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import type { ConstFont } from "../../../../vcl/source/font/font";
import { Date } from "../../../../offapi/com/sun/star/util/Date";
import type { DateTime } from "../../../../offapi/com/sun/star/util/DateTime";

const daysBeforeMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/** Counts days from Gregorian year zero with the source's signed integer division. @param date - Original date fields. @returns Day index. */
function getDays(date: Pick<Date, "Year" | "Month" | "Day">): number {
  const { Year: year, Month: month, Day: day } = date;
  const yearDays =
    year * 365 +
    Math.trunc((year + 3) / 4) -
    Math.trunc((year + 99) / 100) +
    Math.trunc((year + 399) / 400);
  const monthDays = daysBeforeMonth[month - 1];
  if (monthDays === undefined) return yearDays;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return yearDays + monthDays + day - (month < 3 || !leap ? 1 : 0);
}

/** Reference-device boundary for workbook font metrics in native twips. */
export interface XlsxReferenceDevice {
  readonly screenPixelTwips: number;
  measureTextWidth(font: ConstFont, text: string): number;
}

/** Returns the maximum digit advance measured with the workbook's actual font. @param font - Workbook font. @param device - Optional reference device. @returns Twips or zero when unavailable. */
export function getMaxDigitWidth(font?: ConstFont, device?: XlsxReferenceDevice): number {
  if (!font || !device) return 0;
  let width = 0;
  for (const digit of "0123456789") width = Math.max(width, device.measureTextWidth(font, digit));
  return Number.isFinite(width) ? width : 0;
}

/** Imports character widths into twips using the native two-millimetre fallback. */
export class UnitConverter {
  private nullDate = getDays(new Date(30, 12, 1899));
  readonly twipsPerSpace: number;
  readonly twipsPerDigit: number;
  readonly twipsPerScreenPixel: number;

  /** Initializes device or native fallback coefficients. @param font - Workbook font. @param device - Reference device. @returns Converter. */
  constructor(font?: ConstFont, device?: XlsxReferenceDevice) {
    const space = font && device ? device.measureTextWidth(font, " ") : 0;
    this.twipsPerSpace = space > 0 && Number.isFinite(space) ? space : 1440 / 25.4;
    this.twipsPerDigit = getMaxDigitWidth(font, device) || convert(2, Length.mm, Length.twip);
    this.twipsPerScreenPixel = device?.screenPixelTwips || convert(0.5, Length.mm, Length.twip);
  }

  /** Updates the workbook epoch before worksheet values are read. @param date - Selected epoch. @returns Nothing. */
  finalizeNullDate(date: Readonly<Date>): void {
    this.nullDate = getDays(date);
  }

  /** Converts an imported date to a numeric value at the source's whole-second precision. @param date - Parsed source value. @returns Spreadsheet serial. */
  calcSerialFromDateTime(date: Readonly<DateTime>): number {
    return (
      getDays(date) - this.nullDate + date.Hours / 24 + date.Minutes / 1440 + date.Seconds / 86400
    );
  }
}
