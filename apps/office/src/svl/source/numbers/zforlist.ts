/** @fileoverview Original SvNFFormatData format-code selection/default-adjustment responsibilities over genuine UNO sequences. The decimal field is projected explicitly;LocaleData diagnostic logging and the formatter/table/service owners are separate responsibilities. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NumberFormatCode,
  cppu_detail_getUnoType_NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import * as Type from "../../../offapi/com/sun/star/i18n/KNumberFormatType";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { NfIndexTableOffset as Offset } from "../../inc/zforlist";
/** Original declared initializer-list/sequence specialization. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);

/** Original exact index/default/currency fallback order,including creation of one default-initialized struct for an empty sequence. Decimal is the actual GetNumDecimalSep field;the diagnostic-only LocaleData checks do not change selection. @param sequence - Original mutable sequence reference. @param offset - Requested built-in index. @param decimal - Borrowed current-language decimal separator. @returns Original sequence index,zero on final fallback. */
export function ImpGetFormatCodeIndex(
  sequence: Sequence<NumberFormatCodeAddress>,
  offset: number,
  decimal: OUStringConstReference,
): number {
  for (let index = 0; index < sequence.getLength(); ++index)
    if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Index === offset) return index;
  if (sequence.hasElements()) {
    for (let index = 0; index < sequence.getLength(); ++index)
      if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Default) return index;
    if (Offset.NF_CURRENCY_START <= offset && offset <= Offset.NF_CURRENCY_END) {
      for (const fallback of [Offset.NF_CURRENCY_1000DEC2, Offset.NF_CURRENCY_1000INT])
        for (let index = 0; index < sequence.getLength(); ++index)
          if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Index === fallback)
            return index;
    }
  } else {
    const value = new NumberFormatCode(),
      temporary = new Codes(new Map([[0, value]]), 1);
    try {
      sequence.assign(temporary);
    } finally {
      temporary.dispose();
      value.dispose();
    }
    const units = new Uint16Array(decimal.getLength() + 13);
    units[0] = 48;
    units.set(decimal.getStr().subarray(0, decimal.getLength()), 1);
    units.fill(35, 1 + decimal.getLength());
    const code = new OUString(units, units.length);
    try {
      NumberFormatCode.borrowed(
        (sequence.getArray() as SequenceElements).get(0) as NumberFormatCodeAddress,
      ).Code = code;
    } finally {
      code.dispose();
    }
  }
  return 0;
}

/** Original mutable pointer/count algorithm prefers medium,then long,and preserves upstream duplicate-medium flags (CALC-272). The caller obtains this actual pointer through Sequence.getArray,retaining native COW before mutation. Diagnostic-only locale-data validation is not represented. @param formats - Actual compound storage pointer. @param count - Original element count. @returns Nothing. */
export function ImpAdjustFormatCodeDefault(formats: SequenceElements, count: number): void {
  if (!count) return;
  let selected = -1,
    medium = -1;
  for (let index = 0; index < count; ++index) {
    const code = NumberFormatCode.borrowed(formats.get(index * 40) as NumberFormatCodeAddress);
    if (code.Default) {
      if (code.Type === Type.MEDIUM) selected = medium = index;
      else {
        if (code.Type === Type.LONG && medium === -1) selected = index;
        // The original LONG arm falls through to this default-arm body.
        if (selected === -1) selected = index;
        code.Default = false;
      }
    }
  }
  if (selected === -1) selected = 0;
  NumberFormatCode.borrowed(formats.get(selected * 40) as NumberFormatCodeAddress).Default = true;
}
