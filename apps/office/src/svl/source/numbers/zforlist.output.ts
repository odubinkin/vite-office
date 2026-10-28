/** @fileoverview Original formatter engine output dispatch and input-line precision over actual format/language owners. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Color } from "../../../tools/inc/color";
import { SvNumFormatType } from "../../inc/zforlist";
import { ZF_STANDARD_TEXT } from "./zforlist.index";
import { INPUTSTRING_PRECISION } from "./zforlist.defaults";
import type { SvNFLanguageData, SvNFFormatData } from "./zforlist";
/** Original numeric/string engine dispatch: missing numeric keys use General and missing string keys use Text; entries with text sections receive string input. @param current - Actual language/cache/scanner owner. @param table - Actual owned format table. @param value - Native numeric/string overload. @param key - Native unsigned32 format key. @param output - Actual mutable output. @param color - Actual color pointer output. @returns Nothing. */
export function GetOutputString(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  value: number | OUStringConstReference,
  key: number,
  output: OUString,
  color: [Color | null],
): void {
  if (typeof value === "number" && table.GetNoZero() && value === 0) {
    output.clear();
    return;
  }
  if (typeof value === "number") {
    const format = table.GetFormatEntry(key) ?? table.GetFormatEntry(0);
    if (!format) throw new Error("Required native standard format0 is absent");
    current.ChangeIntl(format.GetLanguage());
    format.GetOutputString(
      value,
      output,
      color,
      current.GetStandardPrec(),
      current.GetNumDecimalSep().getStr()[0] as number,
      current.GetFormatScanner(),
    );
  } else {
    const format = table.GetFormatEntry(key) ?? table.GetFormatEntry(ZF_STANDARD_TEXT);
    if (!format) throw new Error("Required native standard text format is absent");
    if (!format.IsTextFormat() && !format.HasTextFormat()) {
      color[0] = null;
      output.assign(value);
    } else {
      current.ChangeIntl(format.GetLanguage());
      format.GetOutputString(value, output, color);
    }
  }
}
/** Original GetInputLineString General branch changes the formatter's standard precision for input text and restores it after formatting. @param current - Actual language state. @param table - Actual format table. @param value - Cell number. @param key - Format key. @param _filtering - Source filter flag. @param _forceSystemLocale - Source locale flag. @returns Owned input string. */
export function GetInputLineString(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  value: number,
  key: number,
  _filtering = false,
  _forceSystemLocale = false,
): OUString {
  void _filtering;
  void _forceSystemLocale;
  const format = table.GetFormatEntry(key) ?? table.GetFormatEntry(0);
  if (!format) throw new Error("Required native standard format0 is absent");
  current.ChangeIntl(format.GetLanguage());
  const oldPrecision = current.GetStandardPrec();
  if (format.GetMaskedType() === SvNumFormatType.NUMBER)
    current.ChangeStandardPrec(INPUTSTRING_PRECISION);
  const result = new OUString(),
    color: [Color | null] = [null];
  try {
    format.GetOutputString(
      value,
      result,
      color,
      current.GetStandardPrec(),
      current.GetNumDecimalSep().getStr()[0] as number,
      current.GetFormatScanner(),
    );
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  } finally {
    if (format.GetMaskedType() === SvNumFormatType.NUMBER) current.ChangeStandardPrec(oldPrecision);
  }
}
