/** @fileoverview Original numeric FinalScan delimiter switch, including source grouping/currency/fraction cursor transitions. No independent token storage or parsing policy is introduced. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { FLAG_STANDARD_IN_FORMAT, type ImpSvNumberformatScan } from "./zforscan";
import type { FinalScanState } from "./zforscan.final-state";
import { StringEqualsChar } from "./zforscan.final-number";
/** Original grouped/decimal separator arm; the fixed reference remains attached to its initial string slot while i advances. @param this - Owner. @param state - Source locals. @param saved - Unmapped delimiter. @param value - Original rStr reference. @returns Early native control position or arm completion. */
function FinalScanSeparator(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
  saved: number,
  value: OUString,
): number | undefined {
  const strings = this["sStrArray"],
    types = this["nTypeArray"];
  if (StringEqualsChar(state.sOldThousandSep, saved)) {
    const previous = this["PreviousChar"](state.i);
    let next: number;
    if (this["bExp"] || this["bBlank"] || this["bFrac"]) {
      if (!StringEqualsChar(state.sOldThousandSep, 32)) {
        state.nPos += (strings[state.i] as OUString).getLength();
        types[state.i] = S.EMPTY;
        this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
        ++state.i;
      } else {
        types[state.i] = S.STRING;
        if (this["bFrac"] && state.nCounter > 0) state.bDenomin = true;
      }
    } else if (
      state.i > 0 &&
      state.i < this["nStringsCnt"] - 1 &&
      (previous === 35 || previous === 48 || previous === 63) &&
      ((next = this["NextChar"](state.i)) === 35 || next === 48 || next === 63)
    ) {
      state.nPos += (strings[state.i] as OUString).getLength();
      if (!this["bThousand"]) this["bThousand"] = true;
      types[state.i] = S.EMPTY;
      this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
      ++state.i;
    } else if (
      state.i > 0 &&
      (previous === 35 || previous === 48 || previous === 63) &&
      this["PreviousType"](state.i) === S.DIGIT &&
      this["nThousand"] < FLAG_STANDARD_IN_FORMAT
    ) {
      if (StringEqualsChar(state.sOldThousandSep, 32)) {
        let first = true;
        const separator = this.GetCurrentLanguageData().GetNumThousandSep();
        while (
          state.i < this["nStringsCnt"] &&
          (strings[state.i] as OUString).equals(state.sOldThousandSep) &&
          StringEqualsChar(state.sOldThousandSep, this["NextChar"](state.i))
        ) {
          state.nPos += (strings[state.i] as OUString).getLength();
          if (first) {
            first = false;
            value.assign(separator);
            types[state.i] = S.THSEP;
          } else {
            value.append(separator);
            types[state.i] = S.EMPTY;
            this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
          }
          this["nThousand"] = (this["nThousand"] + 1) & 65535;
          ++state.i;
        }
        if (
          state.i < this["nStringsCnt"] - 1 &&
          (strings[state.i] as OUString).equals(state.sOldThousandSep)
        ) {
          state.nPos += (strings[state.i] as OUString).getLength();
          if (
            (state.nPos <= this["nCurrPos"] &&
              this["nCurrPos"] < state.nPos + (strings[state.i + 1] as OUString).getLength()) ||
            types[state.i + 1] === K.CCC ||
            (state.i < this["nStringsCnt"] - 2 &&
              (strings[state.i + 1] as OUString).getStr()[0] === 91 &&
              (strings[state.i + 2] as OUString).getStr()[0] === 36)
          )
            types[state.i] = S.STRING;
          else {
            if (first) {
              value.assign(separator);
              types[state.i] = S.THSEP;
            } else {
              value.append(separator);
              types[state.i] = S.EMPTY;
              this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
            }
            this["nThousand"] = (this["nThousand"] + 1) & 65535;
          }
          ++state.i;
        }
      } else {
        do {
          this["nThousand"] = (this["nThousand"] + 1) & 65535;
          types[state.i] = S.THSEP;
          state.nPos += (strings[state.i] as OUString).getLength();
          (strings[state.i] as OUString).assign(this.GetCurrentLanguageData().GetNumThousandSep());
          ++state.i;
        } while (
          state.i < this["nStringsCnt"] &&
          (strings[state.i] as OUString).equals(state.sOldThousandSep)
        );
      }
    } else {
      types[state.i] = S.STRING;
      state.nPos += value.getLength();
      ++state.i;
      while (
        state.i < this["nStringsCnt"] &&
        (strings[state.i] as OUString).equals(state.sOldThousandSep)
      ) {
        value.append(strings[state.i] as OUString);
        state.nPos += (strings[state.i] as OUString).getLength();
        types[state.i] = S.EMPTY;
        this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
        ++state.i;
      }
    }
  } else if (StringEqualsChar(state.sOldDecSep, saved)) {
    if (this["bBlank"] || this["bFrac"]) return state.nPos;
    else if (this["bExp"]) {
      state.nPos += (strings[state.i] as OUString).getLength();
      types[state.i] = S.EMPTY;
      this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
      ++state.i;
    } else if (this["bDecSep"]) {
      types[state.i] = S.STRING;
      state.nPos += value.getLength();
      ++state.i;
      while (
        state.i < this["nStringsCnt"] &&
        (strings[state.i] as OUString).equals(state.sOldDecSep)
      ) {
        value.append(strings[state.i] as OUString);
        state.nPos += (strings[state.i] as OUString).getLength();
        types[state.i] = S.EMPTY;
        this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
        ++state.i;
      }
    } else {
      state.nPos += (strings[state.i] as OUString).getLength();
      types[state.i] = S.DECSEP;
      (strings[state.i] as OUString).assign(this.GetCurrentLanguageData().GetNumDecimalSep());
      this["bDecSep"] = true;
      this["nDecPos"] = state.i;
      this["nCntPre"] = state.nCounter;
      state.nCounter = 0;
      ++state.i;
    }
  } else {
    if (
      saved === 32 &&
      this["eScannedType"] === T.FRACTION &&
      StringEqualsChar(strings[state.i] as OUString, 32)
    ) {
      if (!this["bBlank"] && !this["bFrac"]) {
        if (this["bDecSep"] && state.nCounter > 0) return state.nPos;
        this["bBlank"] = true;
        this["nBlankPos"] = state.i;
        this["nCntPre"] = state.nCounter;
        state.nCounter = 0;
      }
      if (this["bFrac"] && state.nCounter > 0) state.bDenomin = true;
      types[state.i] = S.STRING;
      state.nPos += (strings[state.i] as OUString).getLength();
    } else {
      types[state.i] = S.STRING;
      if (this["bFrac"] && state.nCounter > 0) state.bDenomin = true;
      state.nPos += value.getLength();
      ++state.i;
      while (
        state.i < this["nStringsCnt"] &&
        StringEqualsChar(strings[state.i] as OUString, saved)
      ) {
        value.append(strings[state.i] as OUString);
        state.nPos += (strings[state.i] as OUString).getLength();
        types[state.i] = S.EMPTY;
        this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
        ++state.i;
      }
    }
  }
  return undefined;
}
/** Original delimiter switch. Source arms that change type without advancing i deliberately leave the next outer iteration on that same slot. @param this - Owner. @param state - Source locals. @returns Early control position or completion. */
export function FinalScanNumberDelimiter(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
): number | undefined {
  const strings = this["sStrArray"],
    types = this["nTypeArray"],
    value = strings[state.i] as OUString,
    here = value.getStr()[0] as number,
    language = this.GetCurrentLanguageData();
  let simplified: number;
  if (StringEqualsChar(language.GetNumThousandSep(), here)) simplified = 44;
  else if (StringEqualsChar(language.GetNumDecimalSep(), here)) simplified = 46;
  else simplified = here;
  switch (simplified) {
    case 35:
    case 48:
    case 63:
      if (this["nThousand"] > 0) return state.nPos;
      if (!state.bDenomin) {
        types[state.i] = S.DIGIT;
        state.nPos += value.getLength();
        ++state.i;
        state.nCounter = (state.nCounter + 1) & 65535;
        while (
          state.i < this["nStringsCnt"] &&
          ((strings[state.i] as OUString).getStr()[0] === 35 ||
            (strings[state.i] as OUString).getStr()[0] === 48 ||
            (strings[state.i] as OUString).getStr()[0] === 63)
        ) {
          types[state.i] = S.DIGIT;
          state.nPos += (strings[state.i] as OUString).getLength();
          state.nCounter = (state.nCounter + 1) & 65535;
          ++state.i;
        }
      } else {
        types[state.i] = S.STRING;
        state.nPos += value.getLength();
      }
      break;
    case 45:
      if (
        this["bDecSep"] &&
        this["nDecPos"] + 1 === state.i &&
        types[this["nDecPos"]] === S.DECSEP
      ) {
        types[state.i] = S.DIGIT;
        state.nPos += value.getLength();
        ++state.i;
        state.nCounter = (state.nCounter + 1) & 65535;
        while (state.i < this["nStringsCnt"] && (strings[state.i] as OUString).getStr()[0] === 45) {
          if (
            this["eScannedType"] === T.CURRENCY &&
            value.getLength() >= 2 &&
            (state.i === this["nStringsCnt"] - 1 ||
              (strings[state.i + 1] as OUString).getStr()[0] !== 45)
          )
            break;
          value.append(strings[state.i] as OUString);
          state.nPos += (strings[state.i] as OUString).getLength();
          types[state.i] = S.EMPTY;
          this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
          state.nCounter = (state.nCounter + 1) & 65535;
          ++state.i;
        }
      } else {
        types[state.i] = S.STRING;
        state.nPos += value.getLength();
        ++state.i;
      }
      break;
    case 46:
    case 44:
    case 39:
    case 32:
      return FinalScanSeparator.call(this, state, here, value);
    case 47:
      if (this["eScannedType"] === T.FRACTION) {
        if (state.i === 0 || (types[state.i - 1] !== S.DIGIT && types[state.i - 1] !== S.EMPTY))
          return state.nPos ? state.nPos : 1;
        else if (!this["bFrac"] || (this["bDecSep"] && state.nCounter > 0)) {
          this["bFrac"] = true;
          this["nCntPost"] = state.nCounter;
          state.nCounter = 0;
          types[state.i] = S.FRAC;
          state.nPos += value.getLength();
          ++state.i;
        } else return state.nPos;
      } else {
        types[state.i] = S.STRING;
        state.nPos += value.getLength();
        ++state.i;
      }
      break;
    case 91:
      if (
        this["eScannedType"] === T.CURRENCY &&
        state.i < this["nStringsCnt"] - 1 &&
        types[state.i + 1] === S.STRING &&
        (strings[state.i + 1] as OUString).getStr()[0] === 36
      ) {
        state.nPos += (strings[state.i] as OUString).getLength();
        types[state.i] = S.CURRDEL;
        ++state.i;
        state.nPos += (strings[state.i] as OUString).getLength();
        (strings[state.i - 1] as OUString).append(strings[state.i] as OUString);
        types[state.i] = S.EMPTY;
        this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
        if (++state.i >= this["nStringsCnt"]) return state.nPos;
        state.nPos += (strings[state.i] as OUString).getLength();
        let part = strings[state.i] as OUString;
        types[state.i] = S.CURRENCY;
        let hadDash = false;
        ++state.i;
        while (state.i < this["nStringsCnt"] && (strings[state.i] as OUString).getStr()[0] !== 93) {
          state.nPos += (strings[state.i] as OUString).getLength();
          if (hadDash) {
            part.append(strings[state.i] as OUString);
            types[state.i] = S.EMPTY;
            this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
          } else if ((strings[state.i] as OUString).getStr()[0] === 45) {
            hadDash = true;
            part = strings[state.i] as OUString;
            types[state.i] = S.CURREXT;
          } else {
            part.append(strings[state.i] as OUString);
            types[state.i] = S.EMPTY;
            this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
          }
          ++state.i;
        }
        if (
          value.getLength() &&
          state.i < this["nStringsCnt"] &&
          (strings[state.i] as OUString).getStr()[0] === 93
        ) {
          types[state.i] = S.CURRDEL;
          state.nPos += (strings[state.i] as OUString).getLength();
          ++state.i;
        } else return state.nPos;
      } else {
        types[state.i] = S.STRING;
        state.nPos += (strings[state.i] as OUString).getLength();
        ++state.i;
      }
      break;
    default:
      types[state.i] = this["eScannedType"] === T.PERCENT && here === 37 ? S.PERCENT : S.STRING;
      state.nPos += value.getLength();
      ++state.i;
      break;
  }
  return undefined;
}
