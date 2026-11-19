/** @fileoverview XLSX number formats mapped through the native Calc formatter. */
import { LANGUAGE_ENGLISH_US } from "../../../../i18nlangtag/inc/lang";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  NfIndexTableOffset as N,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
} from "../../../../svl/inc/zforlist";
import type { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist.formatter";
import { ScGlobal } from "../../core/data/global";

const nativeBuiltin = [
  N.NF_NUMBER_STANDARD,
  N.NF_NUMBER_INT,
  N.NF_NUMBER_DEC2,
  N.NF_NUMBER_1000INT,
  N.NF_NUMBER_1000DEC2,
  N.NF_CURRENCY_1000INT,
  N.NF_CURRENCY_1000INT_RED,
  N.NF_CURRENCY_1000DEC2,
  N.NF_CURRENCY_1000DEC2_RED,
  N.NF_PERCENT_INT,
  N.NF_PERCENT_DEC2,
  N.NF_SCIENTIFIC_000E00,
  N.NF_FRACTION_1D,
  N.NF_FRACTION_2D,
  N.NF_DATE_SYS_DDMMYYYY,
  N.NF_DATE_SYS_DMMMYY,
  N.NF_DATE_SYS_DDMMM,
  N.NF_DATE_SYS_MMYY,
  N.NF_TIME_HHMMAMPM,
  N.NF_TIME_HHMMSSAMPM,
  N.NF_TIME_HHMM,
  N.NF_TIME_HHMMSS,
  N.NF_DATETIME_SYSTEM_SHORT_HHMM,
];
const reused = new Map<number, number>([
  [23, 0],
  [24, 0],
  [25, 0],
  [26, 0],
  [27, 14],
  [28, 14],
  [29, 14],
  [30, 14],
  [31, 14],
  [32, 21],
  [33, 21],
  [34, 21],
  [35, 21],
  [36, 14],
  [50, 14],
  [51, 14],
  [52, 14],
  [53, 14],
  [54, 14],
  [55, 14],
  [56, 14],
  [57, 14],
  [58, 14],
  [59, 1],
  [60, 2],
  [61, 3],
  [62, 4],
  [63, 5],
  [64, 6],
  [65, 7],
  [66, 8],
  [67, 9],
  [68, 10],
  [69, 12],
  [70, 13],
  [71, 14],
  [72, 14],
  [73, 15],
  [74, 16],
  [75, 17],
  [76, 20],
  [77, 21],
  [78, 22],
  [79, 45],
  [80, 46],
  [81, 47],
]);
const workbookUsFormats = new Map<number, string>([
  [5, "$#,##0_);($#,##0)"],
  [6, "$#,##0_);[RED]($#,##0)"],
  [7, "$#,##0.00_);($#,##0.00)"],
  [8, "$#,##0.00_);[RED]($#,##0.00)"],
  [14, "M/D/YYYY"],
  [15, "D-MMM-YY"],
  [16, "D-MMM"],
  [17, "MMM-YY"],
  [18, "h:mm AM/PM"],
  [19, "h:mm:ss AM/PM"],
  [20, "h:mm"],
  [21, "h:mm:ss"],
  [22, "M/D/YYYY h:mm"],
  [37, "#,##0_);(#,##0)"],
  [38, "#,##0_);[RED](#,##0)"],
  [39, "#,##0.00_);(#,##0.00)"],
  [40, "#,##0.00_);[RED](#,##0.00)"],
  [41, '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)'],
  [42, '_($* #,##0_);_($* (#,##0);_($* "-"_);_(@_)'],
  [43, '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)'],
  [44, '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'],
  [45, "mm:ss"],
  [46, "[h]:mm:ss"],
  [47, "mm:ss.0"],
  [48, "##0.0E+0"],
]);

/** Looks for a marker outside quoted text and bracketed conditions. @param code - Source number code. @param marker - Target. @param start - Initial offset. @returns Offset or original minus-two sentinel. */
function positionToken(code: string, marker: string, start: number): number {
  for (let pos = start; pos >= 0 && pos < code.length; ++pos) {
    if (code[pos] === '"' || code[pos] === "[") {
      pos = code.indexOf(code[pos] === '"' ? '"' : "]", pos + 1);
      if (pos < 0) return -2;
    } else if (code.startsWith(marker, pos)) return pos;
  }
  return -2;
}

/** Original SpreadsheetML escape normalization before the native scanner. @param code - Raw formatCode. @returns Normalized format. */
export function normalizeFormatCode(code: string): string {
  let out = code,
    erased = 0;
  for (let start = 0; ;) {
    const escape = positionToken(code, "\\ ", start);
    if (escape <= 0) break;
    let pos = escape + 2;
    while (pos < code.length - 1 && /[?#0]/.test(code[pos] as string)) pos++;
    if (pos < code.length - 1 && code[pos] === "/") {
      out = out.slice(0, escape - erased) + out.slice(escape - erased + 1);
      erased++;
    }
    start = positionToken(code, ";", escape);
  }
  return out.startsWith("[$]") ? out.slice(3) : out;
}

/** Indexed workbook format records, resolved once through the original formatter. */
export class NumberFormatsBuffer {
  private readonly codes = new Map<number, string>();
  private readonly keys = new Map<number, number>();

  /** Installs or replaces the source workbook format definition. @param id - Workbook ID. @param code - Source Excel code. @returns Nothing. */
  importNumFmt(id: number, code: string): void {
    if (id >= 0) this.codes.set(id, normalizeFormatCode(code));
  }

  /** Gets the native key for an XF, resolving literal and predefined definitions. @param id - Workbook format ID. @param formatter - Workbook formatter. @returns Native format key. */
  getNumberFormat(id: number, formatter: SvNumberFormatter): number {
    const cached = this.keys.get(id);
    if (cached !== undefined) return cached;
    const builtin = reused.get(id) ?? id;
    const code = this.codes.get(id) ?? workbookUsFormats.get(builtin);
    const predefined = builtin === 49 ? N.NF_TEXT : nativeBuiltin[builtin];
    let key = 0;
    if (code) {
      const source = unicode(code);
      const check: [number] = [0],
        type: [number] = [0],
        result: [number] = [0];
      try {
        formatter.PutandConvertEntry(
          source,
          check,
          type,
          result,
          LANGUAGE_ENGLISH_US,
          ScGlobal.eLnge,
          true,
        );
        if (check[0] === 0 && result[0] !== NUMBERFORMAT_ENTRY_NOT_FOUND) key = result[0];
      } finally {
        source.dispose();
      }
    } else if (predefined !== undefined) key = formatter.GetFormatIndex(predefined, ScGlobal.eLnge);
    this.keys.set(id, key);
    return key;
  }
}
