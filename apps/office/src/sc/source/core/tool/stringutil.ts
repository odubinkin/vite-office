/** @fileoverview Unicode ScStringUtil simple-number scanner from pinned stringutil.cxx; byte overload and formatter-driven input classification remain unsupported. */
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  rtl_math_uStringToDouble,
  rtl_math_ConversionStatus,
} from "../../../../sal/inc/rtl/math.h";
/** Original Calc string helper responsibility, sharing the existing RTL numeric conversion owner. */
export const ScStringUtil = {
  /** Validates native simple decimal/scientific input before RTL conversion. Precheck failures preserve the output; RTL failures retain its assigned result. Grouping is deliberately the source three-digit policy, including its first-group permissiveness. @param rStr - Borrowed UTF16 input. @param dsep - Decimal separator code unit. @param gsep - Group separator code unit. @param dsepa - Alternate decimal code unit or zero. @param rVal - Mutable numeric output reference. @param bDetectScientificNumber - Native default allows exponent notation. @returns Whether the entire trimmed number was consumed with OK status. */
  parseSimpleNumber(
    rStr: OUStringConstReference,
    dsep: number,
    gsep: number,
    dsepa: number,
    rVal: [number],
    bDetectScientificNumber = true,
  ): boolean {
    const input = rStr.getStr();
    let first = 0,
      end = rStr.getLength();
    while (first < end && (input[first] === 0x20 || input[first] === 0xa0)) first++;
    if (first === end) return false;
    while (end > first && (input[end - 1] === 0x20 || input[end - 1] === 0xa0)) end--;
    const buffer: number[] = [];
    let nPosDSep = -1,
      nPosGSep = -1,
      nDigitCount = 0,
      haveSeenDigit = false,
      nPosExponent = -1;
    for (let i = 0; i < end - first; i++) {
      let c = input[first + i] as number;
      if (c === 0x20 && gsep === 0xa0) c = 0xa0;
      if (0x30 <= c && c <= 0x39) {
        buffer.push(c);
        haveSeenDigit = true;
        nDigitCount++;
      } else if (c === dsep || (dsepa !== 0 && c === dsepa)) {
        if (nPosDSep >= 0) return false;
        if (nPosGSep >= 0 && i - nPosGSep !== 4) return false;
        nPosDSep = i;
        nPosGSep = -1;
        buffer.push(dsep);
        nDigitCount = 0;
      } else if (c === gsep) {
        if (!haveSeenDigit) return false;
        if (nPosDSep >= 0) return false;
        if (nPosGSep >= 0 && nDigitCount !== 3) return false;
        if (nPosExponent >= 0) return false;
        nPosGSep = i;
        nDigitCount = 0;
      } else if (c === 0x2d || c === 0x2b) {
        if (i === 0 || (nPosExponent >= 0 && i === nPosExponent + 1)) buffer.push(c);
        else return false;
      } else if (c === 0x45 || c === 0x65) {
        if (nPosExponent >= 0 || !bDetectScientificNumber) return false;
        if (nPosGSep >= 0 && nDigitCount !== 3) return false;
        buffer.push(c);
        nPosExponent = i;
        nPosDSep = -1;
        nPosGSep = -1;
        nDigitCount = 0;
      } else return false;
    }
    if (nPosGSep >= 0 && nDigitCount !== 3) return false;
    const status: [rtl_math_ConversionStatus] = [
        rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok,
      ],
      parseEnd: [number] = [0];
    rVal[0] = rtl_math_uStringToDouble(
      Uint16Array.from(buffer),
      buffer.length,
      dsep,
      gsep,
      status,
      parseEnd,
    );
    return (
      status[0] === rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok &&
      parseEnd[0] >= buffer.length
    );
  },
};
