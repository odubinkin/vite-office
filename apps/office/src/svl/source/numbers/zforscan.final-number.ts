/** @fileoverview Original FinalScan numeric-category token walk, grouping insertion and digit merging. Delimiter branches operate on the same original automatic locals and scanner-owned slots. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { rtl_ustr_compare_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { toInt32 } from "../../../o3tl/inc/string_view";
import { DigitGroupingIterator } from "../../../unotools/inc/digitgroupingiterator";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { FLAG_STANDARD_IN_FORMAT, type ImpSvNumberformatScan } from "./zforscan";
import type { FinalScanState } from "./zforscan.final-state";
import { FinalScanNumberDelimiter } from "./zforscan.final-number-delimiter";
/** Original StringEqualsChar predicate on a borrowed native value. @param value - Owned value. @param unit - Source char16. @returns Equality. */
export function StringEqualsChar(
  value: Pick<OUString, "getLength" | "getStr">,
  unit: number,
): boolean {
  return value.getLength() === 1 && value.getStr()[0] === unit;
}
/** Original numeric-category while loop, count finalization and postprocessing. Undefined denotes completing the source switch branch; numeric results, including zero, are early control positions. @param this - Actual owner. @param state - Original automatic locals. @returns Early native control or completion. */
export function FinalScanNumber(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
): number | undefined {
  const strings = this["sStrArray"],
    types = this["nTypeArray"];
  while (state.i < this["nStringsCnt"]) {
    const value = strings[state.i] as OUString;
    if (
      this["eScannedType"] === T.FRACTION &&
      types[state.i] === S.DEL &&
      StringEqualsChar(state.sOldThousandSep, 32) &&
      StringEqualsChar(value, 32) &&
      !this["bFrac"] &&
      this["IsLastBlankBeforeFrac"](state.i)
    )
      types[state.i] = S.STRING;
    if (
      types[state.i] === S.BLANK ||
      types[state.i] === S.STAR ||
      types[state.i] === K.CCC ||
      types[state.i] === K.GENERAL
    ) {
      if (types[state.i] === K.GENERAL) {
        this["nThousand"] = FLAG_STANDARD_IN_FORMAT;
        if (this["bConvertMode"]) value.assign(this["sNameStandardFormat"]);
      }
      state.nPos += value.getLength();
      ++state.i;
    } else if (types[state.i] === S.STRING || (types[state.i] as number) > 0) {
      if (this["eScannedType"] === T.SCIENTIFIC && types[state.i] === K.E) {
        if (this["bExp"]) return state.nPos;
        this["bExp"] = true;
        this["nExpPos"] = state.i;
        if (this["bDecSep"]) this["nCntPost"] = state.nCounter;
        else this["nCntPre"] = state.nCounter;
        state.nCounter = 0;
        types[state.i] = S.EXP;
      } else if (
        this["eScannedType"] === T.FRACTION &&
        (value.getStr()[0] === 32 ||
          (types[state.i] === S.STRING &&
            ((value.getStr()[0] as number) < 48 || (value.getStr()[0] as number) > 57)))
      ) {
        if (!this["bBlank"] && !this["bFrac"]) {
          if (this["bDecSep"] && state.nCounter > 0) return state.nPos;
          if (value.getStr()[0] === 32 || state.nCounter > 0) {
            this["bBlank"] = true;
            this["nBlankPos"] = state.i;
            this["nCntPre"] = state.nCounter;
            state.nCounter = 0;
            types[state.i] = S.FRACBLANK;
          }
        } else if (value.getStr()[0] === 32) types[state.i] = S.FRACBLANK;
        else if (this["bFrac"] && state.nCounter > 0) state.bDenomin = true;
      } else if (types[state.i] === K.THAI_T) {
        state.bThaiT = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
      } else if (
        (value.getStr()[0] as number) >= 48 &&
        (value.getStr()[0] as number) <= 57 &&
        !state.bDenomin
      ) {
        const divisor = new OUStringBuffer();
        let j = state.i;
        try {
          while (
            j < this["nStringsCnt"] &&
            ((strings[j] as OUString).getStr()[0] as number) >= 48 &&
            ((strings[j] as OUString).getStr()[0] as number) <= 57
          )
            divisor.append(strings[j++] as OUString);
          if (j <= 0) throw new Error("assert(j > 0)");
          const canonical = OUString.number(
            toInt32(divisor.getStr().subarray(0, divisor.getLength())),
          ).view();
          if (
            rtl_ustr_compare_WithLength(
              canonical,
              canonical.length,
              divisor.getStr(),
              divisor.getLength(),
            ) === 0
          ) {
            while (state.i < j) types[state.i++] = S.FRAC_FDIV;
            state.i = j - 1;
            if (this["nCntPost"]) state.nCounter = this["nCntPost"];
            else if (this["nCntPre"]) state.nCounter = this["nCntPre"];
            if (this["eScannedType"] !== T.FRACTION && !this["nCntPre"]) ++this["nCntPre"];
            if (this["bFrac"]) state.bDenomin = true;
          }
        } finally {
          divisor.dispose();
        }
      } else {
        if (this["bFrac"] && state.nCounter > 0) state.bDenomin = true;
        types[state.i] = S.STRING;
      }
      state.nPos += (strings[state.i] as OUString).getLength();
      ++state.i;
    } else if (types[state.i] === S.DEL) {
      const result = FinalScanNumberDelimiter.call(this, state);
      if (result !== undefined) return result;
    } else {
      state.nPos += value.getLength();
      ++state.i;
    }
  }
  if (this["eScannedType"] === T.FRACTION) {
    if (this["bFrac"]) this["nCntExp"] = state.nCounter;
    else if (this["bBlank"]) this["nCntPost"] = state.nCounter;
    else this["nCntPre"] = state.nCounter;
  } else {
    if (this["bExp"]) this["nCntExp"] = state.nCounter;
    else if (this["bDecSep"]) this["nCntPost"] = state.nCounter;
    else this["nCntPre"] = state.nCounter;
  }
  if (this["bThousand"]) {
    let maximum: number;
    if (this["bFrac"]) maximum = this["bBlank"] ? this["nBlankPos"] : 0;
    else if (this["bDecSep"]) maximum = this["nDecPos"];
    else if (this["bExp"]) maximum = this["nExpPos"];
    else maximum = state.i;
    let count = 0,
      firstDigit = maximum,
      firstGrouping = maximum;
    const grouping = new DigitGroupingIterator(state.pLoc.getDigitGrouping());
    try {
      state.i = maximum;
      // Source uint16 postdecrement also wraps the final failed condition to 65535.
      while (state.i-- > 0) {
        if (types[state.i] === S.DIGIT) {
          firstDigit = state.i;
          count += (strings[state.i] as OUString).getLength();
          if (state.i > 0 && count >= grouping.getPos()) {
            if ((strings[state.i] as OUString).getLength() !== 1)
              console.warn("DBG_ASSERT: combined digits in group separator insertion");
            const index: [number] = [state.i];
            const inserted = this["InsertSymbol"](
              index,
              S.THSEP,
              this.GetCurrentLanguageData().GetNumThousandSep(),
            );
            state.i = index[0];
            if (!inserted) return state.nPos;
            firstDigit = state.i + 1;
            firstGrouping = state.i;
            grouping.advance();
          }
        }
      }
      state.i &= 65535;
    } finally {
      grouping.dispose();
    }
    if (firstGrouping < firstDigit) {
      types[firstGrouping] = S.EMPTY;
      this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
    }
  }
  for (state.i = 0; state.i < this["nStringsCnt"]; ++state.i) {
    if (types[state.i] === S.DIGIT) {
      const value = strings[state.i] as OUString;
      while (++state.i < this["nStringsCnt"] && types[state.i] === S.DIGIT) {
        value.append(strings[state.i] as OUString);
        types[state.i] = S.EMPTY;
        this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
      }
    }
  }
  return undefined;
}
