/** @fileoverview Original FinalScan DATE, TIME and DATETIME switch branches. Locals share the original function's stack lifetime; all compiled fields and strings belong to the actual scanner. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType as T } from "../../inc/zforlist";
import type { ImpSvNumberformatScan } from "./zforscan";
import type { FinalScanState } from "./zforscan.final-state";
/** Original maximum decimals allowed by rtl_math_round. */
const MaxCntPost = 20;
/** Original date-particle position recording, repeated in DATE and DATETIME branches. @param owner - Real scanner. @param state - Source locals. @returns Nothing. */
function recordDateParticle(owner: ImpSvNumberformatScan, state: FinalScanState): void {
  if (!state.bNewDateOrder) return;
  switch (owner["nTypeArray"][state.i]) {
    case K.M:
    case K.MM:
      if (state.nMonthPos === 65535) state.nMonthPos = state.i;
      else state.bNewDateOrder = false;
      break;
    case K.D:
    case K.DD:
      if (state.nDayPos === 65535) state.nDayPos = state.i;
      else state.bNewDateOrder = false;
      break;
    case K.YY:
    case K.YYYY:
      if (state.nYearPos === 65535) state.nYearPos = state.i;
      else state.bNewDateOrder = false;
      break;
  }
}
/** Original reference-parameter calendar call updates shared locals and the scanner's actual remaining token count, including error returns. @param owner - Real scanner. @param state - Original locals. @returns Native helper status. */
function calendar(owner: ImpSvNumberformatScan, state: FinalScanState): number {
  const position: [number] = [state.nPos],
    index: [number] = [state.i],
    count: [number] = [owner["nResultStringsCnt"]];
  const result = owner["FinalScanGetCalendar"](position, index, count);
  state.nPos = position[0];
  state.i = index[0];
  owner["nResultStringsCnt"] = count[0];
  return result;
}
/** Original DATE branch. Undefined means the switch branch reached its end; a numeric zero can also be an original early error control value and must not be conflated with completion. @param this - Owner. @param state - Stack locals. @returns Source early control position or branch completion. */
export function FinalScanDate(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
): number | undefined {
  const strings = this["sStrArray"],
    types = this["nTypeArray"];
  while (state.i < this["nStringsCnt"]) {
    const value = strings[state.i] as OUString;
    switch (types[state.i]) {
      case S.BLANK:
      case S.STAR:
      case S.STRING:
        state.nPos += value.getLength();
        ++state.i;
        break;
      case S.DEL:
        if (value.equals(state.sOldDateSep)) {
          types[state.i] = S.DATESEP;
          state.nPos += value.getLength();
          if (this["bConvertMode"]) value.assign(this.GetCurrentLanguageData().GetDateSep());
          ++state.i;
        } else {
          const result = calendar(this, state);
          if (result !== 0) {
            if (result < 0) return state.nPos;
          } else {
            types[state.i] = S.STRING;
            state.nPos += value.getLength();
            ++state.i;
          }
        }
        break;
      case K.THAI_T:
      case K.M:
      case K.MM:
      case K.MMM:
      case K.MMMM:
      case K.MMMMM:
      case K.Q:
      case K.QQ:
      case K.D:
      case K.DD:
      case K.DDD:
      case K.DDDD:
      case K.YY:
      case K.YYYY:
      case K.NN:
      case K.NNN:
      case K.NNNN:
      case K.WW:
      case K.AAA:
      case K.AAAA:
      case K.EC:
      case K.EEC:
      case K.G:
      case K.GG:
      case K.GGG:
      case K.R:
      case K.RR:
        if (types[state.i] === K.THAI_T) state.bThaiT = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        recordDateParticle(this, state);
        ++state.i;
        break;
      default:
        types[state.i] = S.STRING;
        state.nPos += value.getLength();
        ++state.i;
        break;
    }
  }
  return undefined;
}
/** Original TIME branch with duration brackets, fractional seconds, source unbounded time-only counter and A/P state. @param this - Owner. @param state - Source stack locals. @returns Source early control position or completion. */
export function FinalScanTime(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
): number | undefined {
  const strings = this["sStrArray"],
    types = this["nTypeArray"];
  while (state.i < this["nStringsCnt"]) {
    const value = strings[state.i] as OUString;
    switch (types[state.i]) {
      case S.BLANK:
      case S.STAR:
      case S.STRING:
        state.nPos += value.getLength();
        ++state.i;
        break;
      case S.DEL:
        switch (value.getStr()[0]) {
          case 48:
            if (this["Is100SecZero"](state.i, this["bDecSep"])) {
              this["bDecSep"] = true;
              types[state.i] = S.DIGIT;
              state.nCounter = (state.nCounter + 1) & 65535;
              ++state.i;
              while (
                state.i < this["nStringsCnt"] &&
                (strings[state.i] as OUString).getStr()[0] === 48
              ) {
                value.append(strings[state.i] as OUString);
                types[state.i] = S.EMPTY;
                this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
                state.nCounter = (state.nCounter + 1) & 65535;
                ++state.i;
              }
              state.nPos += value.getLength();
            } else return state.nPos;
            break;
          case 35:
          case 63:
            return state.nPos;
          case 91: {
            if (this["bThousand"]) return state.nPos;
            this["bThousand"] = true;
            const next = new OUString(this["NextChar"](state.i)),
              upper = state.pChrCls.uppercase(next);
            let character: number;
            try {
              character = upper.getStr()[0] as number;
            } finally {
              upper.dispose();
              next.dispose();
            }
            if (character === state.cOldKeyH) this["nThousand"] = 1;
            else if (character === state.cOldKeyMI) this["nThousand"] = 2;
            else if (character === state.cOldKeyS) this["nThousand"] = 3;
            else return state.nPos;
            state.nPos += value.getLength();
            ++state.i;
            break;
          }
          case 93:
            if (!this["bThousand"]) return state.nPos;
            state.nPos += value.getLength();
            ++state.i;
            break;
          default:
            state.nPos += value.getLength();
            if (value.equals(state.sOldTimeSep)) {
              types[state.i] = S.TIMESEP;
              if (this["bConvertMode"]) value.assign(state.pLoc.getTimeSep());
            } else if (value.equals(state.sOldTime100SecSep)) {
              this["bDecSep"] = true;
              types[state.i] = S.TIME100SECSEP;
              if (this["bConvertMode"]) value.assign(state.pLoc.getTime100SecSep());
            } else types[state.i] = S.STRING;
            ++state.i;
            break;
        }
        break;
      case K.AMPM:
      case K.AP:
        this["bExp"] = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        ++state.i;
        break;
      case K.THAI_T:
      case K.MI:
      case K.MMI:
      case K.H:
      case K.HH:
      case K.S:
      case K.SS:
        if (types[state.i] === K.THAI_T) state.bThaiT = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        ++state.i;
        break;
      default:
        types[state.i] = S.STRING;
        state.nPos += value.getLength();
        ++state.i;
        break;
    }
  }
  this["nCntPost"] = state.nCounter;
  if (this["bExp"]) this["nCntExp"] = 1;
  return undefined;
}
/** Original DATETIME branch keeps date/time part transitions, bounded fractional seconds and calendar merging distinct from TIME. @param this - Owner. @param state - Stack locals. @returns Source early control position or completion. */
export function FinalScanDateTime(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
): number | undefined {
  const strings = this["sStrArray"],
    types = this["nTypeArray"];
  while (state.i < this["nStringsCnt"]) {
    const value = strings[state.i] as OUString;
    switch (types[state.i]) {
      case S.BLANK:
      case S.STAR:
      case S.STRING:
        state.nPos += value.getLength();
        ++state.i;
        break;
      case S.DEL: {
        const result = calendar(this, state);
        if (result !== 0) {
          if (result < 0) return state.nPos;
        } else
          switch (value.getStr()[0]) {
            case 48:
              if (
                state.bTimePart &&
                this["Is100SecZero"](state.i, this["bDecSep"]) &&
                state.nCounter < MaxCntPost
              ) {
                this["bDecSep"] = true;
                types[state.i] = S.DIGIT;
                ++state.nCounter;
                ++state.i;
                while (
                  state.i < this["nStringsCnt"] &&
                  (strings[state.i] as OUString).getStr()[0] === 48 &&
                  state.nCounter < MaxCntPost
                ) {
                  value.append(strings[state.i] as OUString);
                  types[state.i] = S.EMPTY;
                  this["nResultStringsCnt"] = (this["nResultStringsCnt"] - 1) & 65535;
                  ++state.nCounter;
                  ++state.i;
                }
                state.nPos += value.getLength();
              } else return state.nPos;
              break;
            case 35:
            case 63:
              return state.nPos;
            default:
              state.nPos += value.getLength();
              if (state.bTimePart) {
                if (value.equals(state.sOldTimeSep)) {
                  types[state.i] = S.TIMESEP;
                  if (this["bConvertMode"]) value.assign(state.pLoc.getTimeSep());
                } else if (value.equals(state.sOldTime100SecSep)) {
                  this["bDecSep"] = true;
                  types[state.i] = S.TIME100SECSEP;
                  if (this["bConvertMode"]) value.assign(state.pLoc.getTime100SecSep());
                } else types[state.i] = S.STRING;
              } else if (value.equals(state.sOldDateSep)) {
                types[state.i] = S.DATESEP;
                if (this["bConvertMode"]) value.assign(this.GetCurrentLanguageData().GetDateSep());
              } else types[state.i] = S.STRING;
              ++state.i;
              break;
          }
        break;
      }
      case K.AMPM:
      case K.AP:
        state.bTimePart = true;
        this["bExp"] = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        ++state.i;
        break;
      case K.MI:
      case K.MMI:
      case K.H:
      case K.HH:
      case K.S:
      case K.SS:
        state.bTimePart = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        ++state.i;
        break;
      case K.M:
      case K.MM:
      case K.MMM:
      case K.MMMM:
      case K.MMMMM:
      case K.Q:
      case K.QQ:
      case K.D:
      case K.DD:
      case K.DDD:
      case K.DDDD:
      case K.YY:
      case K.YYYY:
      case K.NN:
      case K.NNN:
      case K.NNNN:
      case K.WW:
      case K.AAA:
      case K.AAAA:
      case K.EC:
      case K.EEC:
      case K.G:
      case K.GG:
      case K.GGG:
      case K.R:
      case K.RR:
        state.bTimePart = false;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        recordDateParticle(this, state);
        ++state.i;
        break;
      case K.THAI_T:
        state.bThaiT = true;
        value.assign(this["sKeyword"][types[state.i] as number] as OUString);
        state.nPos += value.getLength();
        ++state.i;
        break;
      default:
        types[state.i] = S.STRING;
        state.nPos += value.getLength();
        ++state.i;
        break;
    }
  }
  this["nCntPost"] = state.nCounter;
  if (this["bExp"]) this["nCntExp"] = 1;
  return undefined;
}
/** Original TEXT/DEFINED branch leaves General and the @ delimiter typed; all other ordinary tokens become text. @param this - Owner. @param state - Stack locals. @returns Nothing. */
export function FinalScanText(this: ImpSvNumberformatScan, state: FinalScanState): void {
  const strings = this["sStrArray"],
    types = this["nTypeArray"];
  while (state.i < this["nStringsCnt"]) {
    const value = strings[state.i] as OUString;
    switch (types[state.i]) {
      case S.BLANK:
      case S.STAR:
      case K.GENERAL:
        break;
      default:
        if (types[state.i] !== S.DEL || value.getStr()[0] !== 64) types[state.i] = S.STRING;
    }
    state.nPos += value.getLength();
    ++state.i;
  }
}
/** Selects only the original date/time/text switch branches while the remaining FinalScan responsibilities are ported. This helper is not the public format compiler. @param this - Owner. @param state - Stack locals. @returns Original early control value or branch completion. */
export function FinalScanDateOrText(
  this: ImpSvNumberformatScan,
  state: FinalScanState,
): number | undefined {
  switch (this["eScannedType"]) {
    case T.DATE:
      return FinalScanDate.call(this, state);
    case T.TIME:
      return FinalScanTime.call(this, state);
    case T.DATETIME:
      return FinalScanDateTime.call(this, state);
    case T.TEXT:
    case T.DEFINED:
      FinalScanText.call(this, state);
  }
  return undefined;
}
