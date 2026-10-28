/** @fileoverview Original zforscan.cxx ScanType category/ambiguity state machine and InsertSymbol storage mutation. These operate directly on the real scanner's token arrays and locale services. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { NF_MAX_FORMAT_SYMBOLS, SvNumFormatType as T } from "../../inc/zforlist";
import type { ImpSvNumberformatScan } from "./zforscan";
/** Original ScanType resolves minute/month, date/time combinations, currency/calendar brackets, fractional seconds and source conflict control positions. @param this - Original owner. @returns Native zero or control position. */
export function ScanType(this: ImpSvNumberformatScan): number {
  const locale = this.GetLoc(),
    position: [number] = [0],
    index: [number] = [0];
  let nextType: number,
    matchBracket = false,
    haveGeneral = false,
    timeDetected = false,
    haveMinute = false;
  this["SkipStrings"](index, position);
  while (index[0] < this["nStringsCnt"]) {
    let i = index[0];
    const types = this["nTypeArray"],
      strings = this["sStrArray"];
    if ((types[i] as number) > 0)
      switch (types[i]) {
        case K.E:
          nextType = T.SCIENTIFIC;
          break;
        case K.H:
        case K.HH:
          timeDetected = true;
          // Source falls through the S/SS branch before TIME classification.
          if (!haveMinute) timeDetected = true;
          nextType = T.TIME;
          break;
        case K.S:
        case K.SS:
          if (!haveMinute) timeDetected = true;
          nextType = T.TIME;
          break;
        case K.AMPM:
        case K.AP:
          nextType = T.TIME;
          break;
        case K.M:
        case K.MM:
        case K.MI:
        case K.MMI: {
          const before = this["PreviousKeyword"](i),
            after = this["NextKeyword"](i);
          if (
            before === K.H ||
            before === K.HH ||
            after === K.S ||
            after === K.SS ||
            timeDetected ||
            this["PreviousChar"](i) === 91
          ) {
            nextType = T.TIME;
            if (types[i] === K.M || types[i] === K.MM) types[i] = (types[i] as number) - 2;
            timeDetected = false;
            haveMinute = true;
          } else {
            nextType = T.DATE;
            if (types[i] === K.MI || types[i] === K.MMI) types[i] = (types[i] as number) + 2;
          }
          break;
        }
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
          nextType = T.DATE;
          timeDetected = false;
          break;
        case K.CCC:
          nextType = T.CURRENCY;
          break;
        case K.BOOLEAN:
          nextType = T.LOGICAL;
          break;
        case K.GENERAL:
          nextType = T.NUMBER;
          haveGeneral = true;
          break;
        default:
          nextType = T.UNDEFINED;
          break;
      }
    else
      switch ((strings[i] as OUString).getStr()[0]) {
        case 35:
        case 63:
          nextType = T.NUMBER;
          break;
        case 48:
          if (this["eScannedType"] & T.TIME) {
            if (this["Is100SecZero"](i, this["bDecSep"])) {
              this["bDecSep"] = true;
              nextType = T.TIME;
            } else return position[0];
          } else nextType = T.NUMBER;
          break;
        case 37:
          nextType = T.PERCENT;
          break;
        case 47:
          nextType = T.FRACTION;
          break;
        case 91:
          if (
            i < this["nStringsCnt"] - 1 &&
            types[i + 1] === S.STRING &&
            (strings[i + 1] as OUString).getStr()[0] === 36
          ) {
            nextType = T.CURRENCY;
            matchBracket = true;
          } else if (
            i < this["nStringsCnt"] - 1 &&
            types[i + 1] === S.STRING &&
            (strings[i + 1] as OUString).getStr()[0] === 126
          ) {
            nextType = T.DATE;
            matchBracket = true;
          } else {
            const after = this["NextKeyword"](i);
            if (
              after === K.H ||
              after === K.HH ||
              after === K.M ||
              after === K.MM ||
              after === K.S ||
              after === K.SS
            )
              nextType = T.TIME;
            else return position[0];
          }
          break;
        case 64:
          nextType = T.TEXT;
          break;
        default:
          if (
            this["eScannedType"] & T.TIME &&
            i > 0 &&
            (types[i - 1] === K.S || types[i - 1] === K.SS)
          ) {
            const marker = i >= 11 ? (strings[i - 6] as OUString) : null;
            if (
              this["eScannedType"] & T.DATE &&
              i >= 11 &&
              i < this["nStringsCnt"] - 1 &&
              types[i - 6] === S.STRING &&
              marker !== null &&
              (literal(marker, '"T"') || literal(marker, "\\T") || literal(marker, "T")) &&
              types[i - 11] === K.YYYY &&
              (types[i - 9] === K.M || types[i - 9] === K.MM) &&
              (types[i - 7] === K.D || types[i - 7] === K.DD) &&
              (types[i - 5] === K.H || types[i - 5] === K.HH) &&
              (types[i - 3] === K.MI || types[i - 3] === K.MMI) &&
              types[i + 1] === S.DEL &&
              (strings[i + 1] as OUString).getStr()[0] === 48
            ) {
              const separator = strings[i] as OUString;
              if (
                separator.getLength() === 1 &&
                (separator.getStr()[0] === 44 || separator.getStr()[0] === 46)
              )
                this["bDecSep"] = true;
              else return position[0];
            } else if (locale.getTime100SecSep().equals(strings[i] as OUString))
              this["bDecSep"] = true;
            else if (
              (strings[i] as OUString).getStr()[0] === 93 &&
              i < this["nStringsCnt"] - 1 &&
              locale.getTime100SecSep().equals(strings[i + 1] as OUString)
            ) {
              this["bDecSep"] = true;
              ++i;
            }
          }
          nextType = T.UNDEFINED;
          break;
      }
    if (this["eScannedType"] === T.UNDEFINED) this["eScannedType"] = nextType;
    else if (this["eScannedType"] === T.TEXT || nextType === T.TEXT) this["eScannedType"] = T.TEXT;
    else if (nextType === T.UNDEFINED) {
      /* Source retains current category. */
    } else if (this["eScannedType"] !== nextType)
      switch (this["eScannedType"]) {
        case T.DATE:
          switch (nextType) {
            case T.TIME:
              this["eScannedType"] = T.DATETIME;
              break;
            case T.FRACTION:
              break;
            default:
              if (this["nCurrPos"] >= 0) this["eScannedType"] = T.UNDEFINED;
              else if (!(strings[i] as OUString).equals(this.GetCurrentLanguageData().GetDateSep()))
                return position[0];
          }
          break;
        case T.TIME:
          switch (nextType) {
            case T.DATE:
              this["eScannedType"] = T.DATETIME;
              break;
            case T.FRACTION:
              break;
            default:
              if (this["nCurrPos"] >= 0) this["eScannedType"] = T.UNDEFINED;
              else if (!locale.getTimeSep().equals(strings[i] as OUString)) return position[0];
              break;
          }
          break;
        case T.DATETIME:
          switch (nextType) {
            case T.TIME:
            case T.DATE:
            case T.FRACTION:
              break;
            default:
              if (this["nCurrPos"] >= 0) this["eScannedType"] = T.UNDEFINED;
              else if (
                !this.GetCurrentLanguageData()
                  .GetDateSep()
                  .equals(strings[i] as OUString) &&
                !locale.getTimeSep().equals(strings[i] as OUString)
              )
                return position[0];
          }
          break;
        case T.PERCENT:
        case T.SCIENTIFIC:
        case T.FRACTION:
          if (nextType !== T.NUMBER) return position[0];
          break;
        case T.NUMBER:
          switch (nextType) {
            case T.SCIENTIFIC:
            case T.PERCENT:
            case T.FRACTION:
            case T.CURRENCY:
              this["eScannedType"] = nextType;
              break;
            default:
              if (this["nCurrPos"] >= 0) this["eScannedType"] = T.UNDEFINED;
              else return position[0];
          }
          break;
        default:
          break;
      }
    position[0] += (strings[i] as OUString).getLength();
    ++i;
    index[0] = i;
    if (matchBracket) {
      while (matchBracket && index[0] < this["nStringsCnt"]) {
        i = index[0];
        if (types[i] === S.DEL && (strings[i] as OUString).getStr()[0] === 93) matchBracket = false;
        else types[i] = S.STRING;
        position[0] += (strings[i] as OUString).getLength();
        index[0]++;
      }
      if (matchBracket) return position[0];
    }
    this["SkipStrings"](index, position);
  }
  if (
    (this["eScannedType"] === T.NUMBER || this["eScannedType"] === T.UNDEFINED) &&
    this["nCurrPos"] >= 0 &&
    !haveGeneral
  )
    this["eScannedType"] = T.CURRENCY;
  if (this["eScannedType"] === T.UNDEFINED) this["eScannedType"] = T.DEFINED;
  return 0;
}
/** Compares a source narrow literal with the actual UTF16 span, with no allocation or normalization. @param value - Native string. @param text - Source literal. @returns Equality. */
function literal(value: OUStringConstReference, text: string): boolean {
  if (value.getLength() !== text.length) return false;
  const units = value.getStr();
  for (let i = 0; i < text.length; ++i) if (units[i] !== text.charCodeAt(i)) return false;
  return true;
}
/** Original insertion reuses a preceding EMPTY slot or shifts through the source extra retained slot, preserving aliasing of rStr and count mutation order. @param this - Owner. @param position - Native uint16 in/out cursor. @param type - Source token type. @param value - Borrowed native string. @returns Whether inserted. */
export function InsertSymbol(
  this: ImpSvNumberformatScan,
  position: [number],
  type: number,
  value: OUStringConstReference,
): boolean {
  position[0] &= 65535;
  if (this["nStringsCnt"] >= NF_MAX_FORMAT_SYMBOLS || position[0] > this["nStringsCnt"])
    return false;
  if (position[0] > 0 && this["nTypeArray"][position[0] - 1] === S.EMPTY) --position[0];
  else {
    if (this["nStringsCnt"] >= NF_MAX_FORMAT_SYMBOLS - 1) return false;
    ++this["nStringsCnt"];
    let i = this["nStringsCnt"];
    while (i > position[0]) {
      const next = i - 1;
      this["nTypeArray"][i] = this["nTypeArray"][next] as number;
      (this["sStrArray"][i] as OUString).assign(this["sStrArray"][next] as OUString);
      i = next;
    }
  }
  this["nResultStringsCnt"] = (this["nResultStringsCnt"] + 1) & 65535;
  this["nTypeArray"][position[0]] = type;
  (this["sStrArray"][position[0]] as OUString).assign(value);
  return true;
}
