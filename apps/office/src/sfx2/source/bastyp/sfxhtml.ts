/** @fileoverview Original static SfxHTMLParser table-number option responsibility from sfxhtml.cxx; consumes the actual SvNumberFormatter without creating another parser or format table. */
import type { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { SvNumFormatType } from "../../../svl/inc/zforlist";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { toInt32, getToken } from "../../../o3tl/inc/string_view";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Original SDVAL/SDNUM parsing ignores recognition/insertion status, reads the parse locale independently from the format locale, and retains every semicolon in the format-code suffix. The static member is expressed as a source responsibility function, with no substitute SfxHTMLParser constructor. @param format - In/out format key. @param language - Output number-format locale. @param value - Original SDVAL. @param number - Original SDNUM. @param formatter - Actual document formatter. @returns Native recognized numeric value. */
export function GetTableDataOptionsValNum(
  format: [number],
  language: [number],
  value: string,
  number: string,
  formatter: SvNumberFormatter,
): number {
  const parseLanguage = toInt32(number) & 65535,
    parseFormat: [number] = [formatter.GetFormatForLanguageIfBuiltIn(0, parseLanguage)],
    output: [number] = [0],
    input = unicode(value),
    options = unicode(number);
  try {
    formatter.IsNumberFormat(input, parseFormat, output);
    const units = options.getStr().subarray(0, options.getLength()),
      first = units.indexOf(59),
      second = first < 0 ? -1 : units.indexOf(59, first + 1);
    if (second >= 0) {
      const position: [number] = [0];
      language[0] = toInt32(getToken(units, 1, 59, position)) & 65535;
      const code = new OUString(units.subarray(position[0]), units.length - position[0]),
        check: [number] = [0],
        type: [number] = [SvNumFormatType.UNDEFINED];
      try {
        if (language[0] !== LANGUAGE_SYSTEM)
          formatter.PutEntry(code, check, type, format, language[0]);
        else
          formatter.PutandConvertEntry(code, check, type, format, parseLanguage, language[0], true);
      } finally {
        code.dispose();
      }
    } else {
      language[0] = LANGUAGE_SYSTEM;
      format[0] = formatter.GetFormatForLanguageIfBuiltIn(0, language[0]);
    }
    return output[0];
  } finally {
    options.dispose();
    input.dispose();
  }
}
