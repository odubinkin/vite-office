/** @fileoverview Compiled numeric picture queries from svl/source/numbers/zformat.cxx. */
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NfKeywordIndex } from "../../inc/nfkeytab";
import { NfSymbolType } from "../../inc/nfsymbol";
import { SvNumFormatType } from "../../inc/zforlist";
import type { ImpSvNumFor, SvNumberformat } from "./zformat";
import { GetDenominatorString } from "./zformat.fraction";
import { ImpSvNumberformatScan } from "./zforscan";

/** Source GetFormatSpecialInfo out parameters. */
export interface FormatSpecialInfo {
  grouped: boolean;
  red: boolean;
  precision: number;
  leadingZeros: number;
}

/** Reads the positive format's grouping and digits and the negative format's red modifier.
 * @param format - Compiled number format.
 * @param section - Selected compiled subformat.
 * @returns Native format options.
 */
export function GetFormatSpecialInfo(
  format: SvNumberformat,
  section: ImpSvNumFor,
): FormatSpecialInfo {
  const info = section.Info();
  let precision = info.nCntPost;
  if (info.eScannedType === SvNumFormatType.FRACTION) {
    const denominator = GetDenominatorString(section);
    try {
      precision = info.nCntExp - (text(denominator).indexOf("#") + 1);
    } finally {
      denominator.dispose();
    }
  }

  let leadingZeros = 0;
  if (format.IsStandard() && info.eScannedType === SvNumFormatType.NUMBER) {
    leadingZeros = 1;
  } else {
    for (let position = 0; position < section.GetCount(); position++) {
      const token = info.nTypeArray[position];
      if (
        token === NfSymbolType.DECSEP ||
        token === NfSymbolType.EXP ||
        token === NfSymbolType.FRACBLANK
      )
        break;
      if (token === NfSymbolType.DIGIT) {
        const digits = text(info.sStrArray[position] as OUString);
        leadingZeros += /^#*([0?]*)/.exec(digits)?.[1]?.length ?? 0;
      }
    }
  }

  const [[, first], [, second]] = format.GetConditions();
  return {
    grouped: info.bThousand,
    red:
      first === 0 &&
      second === 0 &&
      (format.GetColor(1)?.equals(ImpSvNumberformatScan.GetRedColor()) ?? false),
    precision,
    leadingZeros,
  };
}

/** Rebuilds the first time section with the requested seconds precision.
 * @param section - First compiled subformat.
 * @param precision - Requested fraction digits.
 * @param separator - Locale's fractional time separator.
 * @returns Format code.
 */
export function GetFormatStringForTimePrecision(
  section: ImpSvNumFor,
  precision: number,
  separator: string,
): string {
  const info = section.Info();
  let result = "";
  for (let position = 0; position < section.GetCount(); position++) {
    const type = info.nTypeArray[position];
    const token = text(info.sStrArray[position] as OUString);
    switch (type) {
      case NfKeywordIndex.S:
      case NfKeywordIndex.SS:
        result += token;
        if (
          position > 0 &&
          info.nTypeArray[position - 1] === NfSymbolType.DEL &&
          position < section.GetCount() - 1
        )
          result += text(info.sStrArray[++position] as OUString);
        if (precision > 0) result += separator + "0".repeat(precision);
        break;
      case NfSymbolType.TIME100SECSEP:
      case NfSymbolType.DIGIT:
        break;
      case NfSymbolType.STRING:
        result += `"${token}"`;
        break;
      default:
        result += token;
    }
  }
  return result;
}

/** Returns the compiled percent token and any immediately preceding literals.
 * @param section - First compiled subformat.
 * @returns Percent suffix.
 */
export function GetPercentString(section: ImpSvNumFor): string {
  const info = section.Info();
  for (let position = 0; position < section.GetCount(); position++) {
    if (info.nTypeArray[position] !== NfSymbolType.PERCENT) continue;
    const percent = text(info.sStrArray[position] as OUString);
    let literals = "";
    for (position--; position >= 0 && info.nTypeArray[position] === NfSymbolType.STRING; position--)
      literals = text(info.sStrArray[position] as OUString) + literals;
    return literals.length ? `"${literals}"${percent}` : percent;
  }
  return "";
}

/** Serializes the section's compiled native-number modifier. @param section - Compiled subformat. @returns Modifier. */
export function GetNatNumModifierString(section: ImpSvNumFor): string {
  const native = section.GetNatNum();
  if (!native.IsSet()) return "";
  const mode = native.GetNatNum();
  return `[NatNum${mode}${mode === 12 ? " " + text(native.GetParams()) : ""}]`;
}
