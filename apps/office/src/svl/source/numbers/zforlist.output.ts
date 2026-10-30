/** @fileoverview Original formatter engine output dispatch and input-line precision over actual format/language owners. */
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { Accessor } from "../../inc/nfengine";
import { ImpSubstituteEntry } from "./zforlist.recognition";
import { GetEditFormat } from "./zforlist.edit";
import { ImpSvNumberformatScan } from "./zforscan";
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
/** Original input-line format substitution, editing-key selection, precision changes and error fallback. @param current - Actual language state. @param table - Actual format table. @param native - Native-number owner. @param policy - Source accessor. @param value - Cell number. @param key - Display format key. @param filtering - Keep the substituted display format. @param forceSystemLocale - Select editing format in the system locale. @returns Owned input string. */
export function GetInputLineString(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  value: number,
  key: number,
  filtering = false,
  forceSystemLocale = false,
): OUString {
  const realKey: [number] = [key >>> 0];
  let format = ImpSubstituteEntry(
    current,
    table,
    native,
    policy,
    table.GetFormatEntry(realKey[0]),
    realKey,
  );
  if (!format) format = table.GetFormatEntry(0);
  if (!format) throw new Error("Required native standard format0 is absent");
  current.ChangeIntl(format.GetLanguage());
  let type = format.GetMaskedType();
  if (type === SvNumFormatType.ALL) type = format.GetNumForInfoScannedType(0);
  const originalType = type,
    oldPrecision = current.GetFormatScanner().GetStandardPrec();
  let precisionChanged = false;
  const result = new OUString(),
    color: [Color | null] = [null];
  try {
    if (
      type === SvNumFormatType.NUMBER ||
      type === SvNumFormatType.PERCENT ||
      type === SvNumFormatType.CURRENCY ||
      type === SvNumFormatType.SCIENTIFIC ||
      type === SvNumFormatType.FRACTION
    ) {
      if (type !== SvNumFormatType.PERCENT) type = SvNumFormatType.NUMBER;
      current.ChangeStandardPrec(INPUTSTRING_PRECISION);
      precisionChanged = true;
    }
    if (!filtering) {
      const editKey = GetEditFormat(
        current,
        table,
        native,
        policy,
        value,
        realKey[0],
        type,
        format,
        forceSystemLocale ? LANGUAGE_SYSTEM : LANGUAGE_DONTKNOW,
      );
      if (editKey !== realKey[0]) format = table.GetFormatEntry(editKey);
    }
    if (!format) throw new Error("assert(pFormat)");
    if (type === SvNumFormatType.TIME && format.GetFormatPrecision()) {
      current.ChangeStandardPrec(INPUTSTRING_PRECISION);
      precisionChanged = true;
    }
    format.GetOutputString(
      value,
      result,
      color,
      current.GetStandardPrec(),
      current.GetNumDecimalSep().getStr()[0] as number,
      current.GetFormatScanner(),
    );
    if (originalType !== SvNumFormatType.NUMBER && result.equals(ImpSvNumberformatScan.sErrStr)) {
      format = table.GetFormatEntry(0);
      if (!format) throw new Error("assert(pFormat)");
      current.ChangeStandardPrec(INPUTSTRING_PRECISION);
      precisionChanged = true;
      format.GetOutputString(
        value,
        result,
        color,
        current.GetStandardPrec(),
        current.GetNumDecimalSep().getStr()[0] as number,
        current.GetFormatScanner(),
      );
    }
    if (result.equals(ImpSvNumberformatScan.sErrStr))
      throw new Error("assert(sOutString != ImpSvNumberformatScan::sErrStr)");
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  } finally {
    if (precisionChanged) current.ChangeStandardPrec(oldPrecision);
  }
}
