/** @fileoverview Original zforscan.cxx GetKeyWord, Next_Symbol, Symbol_Division and token-neighbor helpers. Every fragment operates on the actual scanner owner and its real language/classifier/currency services. */
import { LANGUAGE_ENGLISH_US, LANGUAGE_THAI } from "../../../i18nlangtag/inc/lang";
import { getRealLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { NF_MAX_FORMAT_SYMBOLS } from "../../inc/zforlist";
import { GetQuoteEnd } from "./zformat.quotes";
import { sEnglishKeyword } from "./zforscan.keywords";
import { KeywordLocalization, type ImpSvNumberformatScan } from "./zforscan";
/** Original ScanState. */
enum ScanState {
  SsStop = 0,
  SsStart = 1,
  SsGetChar = 2,
  SsGetString = 3,
  SsGetWord = 4,
  SsGetStar = 5,
  SsGetBlank = 6,
}
/** Original StringEqualsChar one-code-unit predicate. @param value - Native string. @param unit - Native char16. @returns Equality. */
function StringEqualsChar(value: OUStringConstReference, unit: number): boolean {
  return value.getLength() === 1 && value.getStr()[0] === unit;
}
/** Projects OUStringChar into the existing actual SAL buffer's UTF16 span overload. @param buffer - Original buffer owner. @param unit - Source char16. @returns Nothing. */
function appendChar(buffer: OUStringBuffer, unit: number): void {
  buffer.append(Uint16Array.of(unit));
}
/** Original longest-first keyword lookup, sticky found-English flag and Thai import special case. @param this - Original scanner. @param symbol - Native input. @param position - Native UTF16 position. @param foundEnglish - Sticky out flag. @returns Keyword or zero. */
export function GetKeyWord(
  this: ImpSvNumberformatScan,
  symbol: OUStringConstReference,
  position: number,
  foundEnglish: [boolean],
): number {
  const value = this.GetChrCls().uppercase(symbol, position, symbol.getLength() - position),
    keywords = this.GetKeywords();
  try {
    if (value.startsWith(keywords[K.GENERAL] as OUStringConstReference)) return K.GENERAL;
    if (
      this["meKeywordLocalization"] === KeywordLocalization.AllowEnglish &&
      value.startsWith(sEnglishKeyword[K.GENERAL] as OUString)
    ) {
      foundEnglish[0] = true;
      return K.GENERAL;
    }
    let i: number = K.LASTKEYWORD;
    while (i > 0 && !value.startsWith(keywords[i] as OUStringConstReference)) --i;
    if (i === 0 && this["meKeywordLocalization"] === KeywordLocalization.AllowEnglish) {
      i = K.LASTKEYWORD;
      while (i > 0 && !value.startsWith(sEnglishKeyword[i] as OUString)) --i;
    }
    if (
      i === 0 &&
      this["bConvertMode"] &&
      value.getStr()[0] === 84 &&
      this["eTmpLnge"] === LANGUAGE_ENGLISH_US &&
      getRealLanguage(this["eNewLnge"]) === LANGUAGE_THAI
    )
      i = K.THAI_T;
    return i;
  } finally {
    value.dispose();
  }
}
/** Original character-state machine, preserving quote/backslash/star/blank UTF16 units and localized/English keyword cursor rules. @param this - Original scanner. @param value - Native input. @param position - In/out source position. @param symbol - Existing output owner. @returns Source token type. */
export function Next_Symbol(
  this: ImpSvNumberformatScan,
  value: OUStringConstReference,
  position: [number],
  symbol: OUString,
): number {
  this["InitKeywords"]();
  const character = this.GetChrCls(),
    locale = this.GetLoc();
  let type = 0,
    state: ScanState = ScanState.SsStart;
  const buffer = new OUStringBuffer();
  try {
    while (position[0] < value.getLength() && state !== ScanState.SsStop) {
      const token = value.getStr()[position[0]++] as number;
      switch (state) {
        case ScanState.SsStart: {
          if (
            this["nCurrPos"] >= 0 &&
            this["sCurString"].getLength() > 1 &&
            position[0] - 1 + this["sCurString"].getLength() <= value.getLength() &&
            (position[0] <= 1 || value.getStr()[position[0] - 2] !== 91)
          ) {
            const part = value.copy(position[0] - 1, this["sCurString"].getLength()),
              test = character.uppercase(part);
            let matches: boolean;
            try {
              matches = test.equals(this["sCurString"]);
            } finally {
              test.dispose();
              part.dispose();
            }
            if (matches) {
              const actual = value.copy(--position[0], this["sCurString"].getLength());
              try {
                symbol.assign(actual);
              } finally {
                actual.dispose();
              }
              position[0] += symbol.getLength();
              type = S.STRING;
              return type;
            }
          }
          switch (token) {
            case 35:
            case 48:
            case 63:
            case 37:
            case 64:
            case 91:
            case 93:
            case 44:
            case 46:
            case 47:
            case 39:
            case 32:
            case 58:
            case 45:
              type = S.DEL;
              appendChar(buffer, token);
              state = ScanState.SsStop;
              break;
            case 42:
              type = S.STAR;
              appendChar(buffer, token);
              state = ScanState.SsGetStar;
              break;
            case 95:
              type = S.BLANK;
              appendChar(buffer, token);
              state = ScanState.SsGetBlank;
              break;
            case 34:
              type = S.STRING;
              state = ScanState.SsGetString;
              appendChar(buffer, token);
              break;
            case 92:
              type = S.STRING;
              state = ScanState.SsGetChar;
              appendChar(buffer, token);
              break;
            case 36:
            case 43:
            case 40:
            case 41:
              type = S.STRING;
              state = ScanState.SsStop;
              appendChar(buffer, token);
              break;
            default: {
              const language = this.GetCurrentLanguageData();
              if (
                StringEqualsChar(language.GetNumDecimalSep(), token) ||
                StringEqualsChar(language.GetNumThousandSep(), token) ||
                StringEqualsChar(language.GetDateSep(), token) ||
                StringEqualsChar(locale.getTimeSep(), token) ||
                StringEqualsChar(locale.getTime100SecSep(), token)
              ) {
                type = S.DEL;
                appendChar(buffer, token);
                state = ScanState.SsStop;
              } else if (character.isLetter(value, position[0] - 1)) {
                const english: [boolean] = [false],
                  next = this["GetKeyWord"](value, position[0] - 1, english);
                if (next) {
                  let currency = false;
                  if (
                    this["nCurrPos"] >= 0 &&
                    position[0] - 1 + this["sCurString"].getLength() <= value.getLength() &&
                    this["sCurString"].startsWith(
                      english[0]
                        ? (sEnglishKeyword[next] as OUString)
                        : (this["sKeyword"][next] as OUString),
                    )
                  ) {
                    const part = value.copy(position[0] - 1, this["sCurString"].getLength()),
                      test = character.uppercase(part);
                    try {
                      if (test.equals(this["sCurString"])) currency = true;
                    } finally {
                      test.dispose();
                      part.dispose();
                    }
                  }
                  if (currency) {
                    state = ScanState.SsGetWord;
                    appendChar(buffer, token);
                  } else {
                    type = next;
                    let length: number;
                    if (english[0]) {
                      length = (sEnglishKeyword[type] as OUString).getLength();
                      buffer.assign(
                        type === K.GENERAL
                          ? this["sNameStandardFormat"]
                          : (this["sKeyword"][type] as OUString),
                      );
                    } else {
                      length = (this["sKeyword"][type] as OUString).getLength();
                      buffer.assign(value.subView(position[0] - 1, length));
                    }
                    if (
                      (type === K.E || this["IsAmbiguousE"](type)) &&
                      position[0] < value.getLength()
                    )
                      switch (value.getStr()[position[0]]) {
                        case 43:
                        case 45:
                          appendChar(buffer, value.getStr()[position[0]] as number);
                          type = K.E;
                          position[0]++;
                          break;
                        case 48:
                        case 35:
                          type = K.E;
                          break;
                      }
                    position[0]--;
                    position[0] += length;
                    state = ScanState.SsStop;
                  }
                } else {
                  state = ScanState.SsGetWord;
                  appendChar(buffer, token);
                }
              } else {
                type = S.STRING;
                state = ScanState.SsStop;
                appendChar(buffer, token);
              }
              break;
            }
          }
          break;
        }
        case ScanState.SsGetChar:
          appendChar(buffer, token);
          state = ScanState.SsStop;
          break;
        case ScanState.SsGetString:
          if (token === 34) state = ScanState.SsStop;
          appendChar(buffer, token);
          break;
        case ScanState.SsGetWord:
          if (character.isLetter(value, position[0] - 1)) {
            const english: [boolean] = [false],
              next = this["GetKeyWord"](value, position[0] - 1, english);
            if (next) {
              type = S.STRING;
              state = ScanState.SsStop;
              position[0]--;
            } else appendChar(buffer, token);
          } else {
            let dontStop = false;
            if (token === 47 && position[0] < value.getLength()) {
              const next = value.getStr()[position[0]] as number;
              if (next === 80 || next === 112) {
                const length = buffer.getLength(),
                  units = buffer.getStr();
                if (
                  length >= 1 &&
                  (units[0] === 65 || units[0] === 97) &&
                  (length === 1 ||
                    (length === 2 &&
                      (units[1] === 77 || units[1] === 109) &&
                      (value.getStr()[position[0] + 1] === 77 ||
                        value.getStr()[position[0] + 1] === 109)))
                ) {
                  appendChar(buffer, token);
                  dontStop = true;
                }
              }
            }
            if (!dontStop) {
              state = ScanState.SsStop;
              position[0]--;
              type = S.STRING;
            }
          }
          break;
        case ScanState.SsGetStar:
        case ScanState.SsGetBlank:
          state = ScanState.SsStop;
          appendChar(buffer, token);
          break;
        default:
          break;
      }
    }
    if (state === ScanState.SsGetWord) type = S.STRING;
    const result = buffer.makeStringAndClear();
    try {
      symbol.assign(result);
    } finally {
      result.dispose();
    }
    return type;
  } finally {
    buffer.dispose();
  }
}
/** Original currency-presence/quote scan, scalar reset, fixed-capacity token loop and duplicate/trailing-star control position. @param this - Original owner. @param value - Native input. @returns Zero or native control position. */
export function Symbol_Division(
  this: ImpSvNumberformatScan,
  value: OUStringConstReference,
): number {
  this["nCurrPos"] = -1;
  const upper = this.GetChrCls().uppercase(value);
  try {
    let cursor = 0;
    while (cursor >= 0 && cursor < upper.getLength()) {
      cursor = upper.indexOf(this.GetCurString(), cursor);
      if (cursor >= 0) {
        const end = GetQuoteEnd(upper, cursor);
        if (end < 0) {
          const prior = upper.getStr()[cursor - 1];
          if (cursor === 0 || (prior !== 34 && prior !== 92)) {
            this["nCurrPos"] = cursor;
            cursor = -1;
          } else cursor++;
        } else cursor = end + 1;
      }
    }
    this["nStringsCnt"] = 0;
    let star = false;
    this.Reset();
    const position: [number] = [0],
      length = value.getLength();
    while (position[0] < length && this["nStringsCnt"] < NF_MAX_FORMAT_SYMBOLS) {
      const i = this["nStringsCnt"];
      this["nTypeArray"][i] = this["Next_Symbol"](
        value,
        position,
        this["sStrArray"][i] as OUString,
      );
      if (this["nTypeArray"][i] === S.STAR) {
        if (star) return position[0];
        else {
          if ((this["sStrArray"][i] as OUString).getLength() < 2) return position[0];
          star = true;
        }
      }
      this["nStringsCnt"]++;
    }
    return 0;
  } finally {
    upper.dispose();
  }
}
/** Original string/star/blank skipping updates native counters without copying storage. @param this - Owner. @param index - Token cursor. @param position - Text cursor. @returns Nothing. */
export function SkipStrings(
  this: ImpSvNumberformatScan,
  index: [number],
  position: [number],
): void {
  while (
    index[0] < this["nStringsCnt"] &&
    (this["nTypeArray"][index[0]] === S.STRING ||
      this["nTypeArray"][index[0]] === S.BLANK ||
      this["nTypeArray"][index[0]] === S.STAR)
  ) {
    position[0] += (this["sStrArray"][index[0]] as OUString).getLength();
    index[0]++;
  }
}
/** Original preceding keyword query. @param this - Owner. @param index - Native uint16 cursor. @returns Keyword or zero. */
export function PreviousKeyword(this: ImpSvNumberformatScan, index: number): number {
  index &= 65535;
  let result = 0;
  if (index > 0 && index < this["nStringsCnt"]) {
    --index;
    while (index > 0 && (this["nTypeArray"][index] as number) <= 0) --index;
    if ((this["nTypeArray"][index] as number) > 0) result = this["nTypeArray"][index] as number;
  }
  return result;
}
/** Original following keyword query. @param this - Owner. @param index - Native uint16 cursor. @returns Keyword or zero. */
export function NextKeyword(this: ImpSvNumberformatScan, index: number): number {
  index &= 65535;
  let result = 0;
  if (index < this["nStringsCnt"] - 1) {
    ++index;
    while (index < this["nStringsCnt"] - 1 && (this["nTypeArray"][index] as number) <= 0) ++index;
    if ((this["nTypeArray"][index] as number) > 0) result = this["nTypeArray"][index] as number;
  }
  return result;
}
/** Original preceding non-EMPTY token type. @param this - Owner. @param index - Native uint16 cursor. @returns Type or zero. */
export function PreviousType(this: ImpSvNumberformatScan, index: number): number {
  index &= 65535;
  if (index > 0 && index < this["nStringsCnt"]) {
    do {
      --index;
    } while (index > 0 && this["nTypeArray"][index] === S.EMPTY);
    return this["nTypeArray"][index] as number;
  }
  return 0;
}
/** Original preceding character skips designated token types but may return the boundary token's last unit. @param this - Owner. @param index - Native uint16 cursor. @returns UTF16 unit or space. */
export function PreviousChar(this: ImpSvNumberformatScan, index: number): number {
  index &= 65535;
  let result = 32;
  if (index > 0 && index < this["nStringsCnt"]) {
    --index;
    while (
      index > 0 &&
      (this["nTypeArray"][index] === S.EMPTY ||
        this["nTypeArray"][index] === S.STRING ||
        this["nTypeArray"][index] === S.STAR ||
        this["nTypeArray"][index] === S.BLANK)
    )
      --index;
    const value = this["sStrArray"][index] as OUString;
    if (value.getLength() > 0) result = value.getStr()[value.getLength() - 1] as number;
  }
  return result;
}
/** Original following character helper. @param this - Owner. @param index - Native uint16 cursor. @returns UTF16 unit or space. */
export function NextChar(this: ImpSvNumberformatScan, index: number): number {
  index &= 65535;
  let result = 32;
  if (index < this["nStringsCnt"] - 1) {
    ++index;
    while (
      index < this["nStringsCnt"] - 1 &&
      (this["nTypeArray"][index] === S.EMPTY ||
        this["nTypeArray"][index] === S.STRING ||
        this["nTypeArray"][index] === S.STAR ||
        this["nTypeArray"][index] === S.BLANK)
    )
      ++index;
    const value = this["sStrArray"][index] as OUString;
    if (value.getLength() > 0) result = value.getStr()[0] as number;
  }
  return result;
}
/** Original fraction-blank search includes the source preincrement before examining each token. @param this - Owner. @param index - Native uint16 cursor. @returns Whether this is the last blank before a slash. */
export function IsLastBlankBeforeFrac(this: ImpSvNumberformatScan, index: number): boolean {
  index &= 65535;
  let result = true;
  if (index < this["nStringsCnt"] - 1) {
    let stop = false;
    ++index;
    while (index < this["nStringsCnt"] - 1 && !stop) {
      ++index;
      if (
        this["nTypeArray"][index] === S.DEL &&
        (this["sStrArray"][index] as OUString).getStr()[0] === 47
      )
        stop = true;
      else if (
        (this["nTypeArray"][index] === S.DEL &&
          (this["sStrArray"][index] as OUString).getStr()[0] === 32) ||
        this["nTypeArray"][index] === S.STRING
      )
        result = false;
    }
    if (!stop) result = false;
  } else result = false;
  return result;
}
/** Original fractional-second zero predicate. @param this - Owner. @param index - Native uint16 cursor. @param hadDecimal - Earlier decimal-separator flag. @returns Predicate. */
export function Is100SecZero(
  this: ImpSvNumberformatScan,
  index: number,
  hadDecimal: boolean,
): boolean {
  index &= 65535;
  const previous = this["PreviousKeyword"](index);
  return (
    (previous === K.S || previous === K.SS) &&
    (hadDecimal || (index > 0 && this["nTypeArray"][index - 1] === S.STRING))
  );
}
