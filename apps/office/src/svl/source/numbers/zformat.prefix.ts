/** @fileoverview Original bracket-prefix and subformat lexer from svl/source/numbers/zformat.cxx, including in-place blank removal and original cursor behavior. */
import { matchIgnoreAsciiCase, toInt32 } from "../../../o3tl/inc/string_view";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import type { ImpSvNumberformatScan } from "./zforscan";
/** Original bracket token values. */
export enum BracketFormatSymbolType {
  BRACKET_SYMBOLTYPE_FORMAT = -1, // subformat string
  BRACKET_SYMBOLTYPE_COLOR = -2, // color
  BRACKET_SYMBOLTYPE_ERROR = -3, // error
  BRACKET_SYMBOLTYPE_DBNUM1 = -4, // DoubleByteNumber, represent numbers
  BRACKET_SYMBOLTYPE_DBNUM2 = -5, // using CJK characters, Excel compatible
  BRACKET_SYMBOLTYPE_DBNUM3 = -6,
  BRACKET_SYMBOLTYPE_DBNUM4 = -7,
  BRACKET_SYMBOLTYPE_DBNUM5 = -8,
  BRACKET_SYMBOLTYPE_DBNUM6 = -9,
  BRACKET_SYMBOLTYPE_DBNUM7 = -10,
  BRACKET_SYMBOLTYPE_DBNUM8 = -11,
  BRACKET_SYMBOLTYPE_DBNUM9 = -12,
  BRACKET_SYMBOLTYPE_LOCALE = -13,
  BRACKET_SYMBOLTYPE_NATNUM0 = -14, // Our NativeNumber support, ASCII
  BRACKET_SYMBOLTYPE_NATNUM1 = -15, // Our NativeNumber support, represent
  BRACKET_SYMBOLTYPE_NATNUM2 = -16, // numbers using CJK, CTL, ...
  BRACKET_SYMBOLTYPE_NATNUM3 = -17,
  BRACKET_SYMBOLTYPE_NATNUM4 = -18,
  BRACKET_SYMBOLTYPE_NATNUM5 = -19,
  BRACKET_SYMBOLTYPE_NATNUM6 = -20,
  BRACKET_SYMBOLTYPE_NATNUM7 = -21,
  BRACKET_SYMBOLTYPE_NATNUM8 = -22,
  BRACKET_SYMBOLTYPE_NATNUM9 = -23,
  BRACKET_SYMBOLTYPE_NATNUM10 = -24,
  BRACKET_SYMBOLTYPE_NATNUM11 = -25,
  BRACKET_SYMBOLTYPE_NATNUM12 = -26,
  BRACKET_SYMBOLTYPE_NATNUM13 = -27,
  BRACKET_SYMBOLTYPE_NATNUM14 = -28,
  BRACKET_SYMBOLTYPE_NATNUM15 = -29,
  BRACKET_SYMBOLTYPE_NATNUM16 = -30,
  BRACKET_SYMBOLTYPE_NATNUM17 = -31,
  BRACKET_SYMBOLTYPE_NATNUM18 = -32,
  BRACKET_SYMBOLTYPE_NATNUM19 = -33,
}
/** Original condition operator values from include/svl/zformat.hxx. */
export enum SvNumberformatLimitOps {
  NUMBERFORMAT_OP_NO = 0,
  NUMBERFORMAT_OP_EQ = 1,
  NUMBERFORMAT_OP_NE = 2,
  NUMBERFORMAT_OP_LT = 3,
  NUMBERFORMAT_OP_LE = 4,
  NUMBERFORMAT_OP_GT = 5,
  NUMBERFORMAT_OP_GE = 6,
}
/** Original private lexer states. */
enum ScanState {
  SsStop,
  SsStart,
  SsGetCon,
  SsGetString,
  SsGetPrefix,
  SsGetTime,
  SsGetBracketed,
  SsGetQuoted,
}
const B = BracketFormatSymbolType,
  S = ScanState,
  O = SvNumberformatLimitOps;
const aNatNum = Uint16Array.of(78, 65, 84, 78, 85, 77),
  aDBNum = Uint16Array.of(68, 66, 78, 85, 77);
/** Original bounded keyword match and decimal-prefix conversion. @param value - Input view. @param position - Offset. @param keyword - Native keyword. @param number - Parsed number. @returns Matched keyword with at least one following unit. */
export function lcl_matchKeywordAndGetNumber(
  value: Uint16Array,
  position: number,
  keyword: Uint16Array,
  number: [number],
): boolean {
  if (
    0 <= position &&
    position + keyword.length < value.length &&
    matchIgnoreAsciiCase(value, keyword, position)
  ) {
    number[0] = toInt32(value.subarray(position + keyword.length));
    return true;
  }
  number[0] = 0;
  return false;
}
/** Original backwards parity of combining format units. @param value - Actual mutable input. @param position - Last unit. @returns Whether the next unit is combined. */
export function IsCombiningSymbol(value: OUStringBuffer, position: number): boolean {
  let result = false;
  while (position >= 0) {
    switch (value.charAt(position)) {
      case 42:
      case 92:
      case 95:
        result = !result;
        --position;
        break;
      default:
        return result;
    }
  }
  return result;
}
/** Original condition-value token, removing ASCII spaces in-place until the unconsumed closing bracket. @param value - Actual buffer. @param position - Mutable offset. @param symbol - Token output. @returns Consumed nonblank units. */
export function ImpGetNumber(value: OUStringBuffer, position: [number], symbol: OUString): number {
  const start = position[0],
    output = new OUStringBuffer();
  let length = value.getLength();
  try {
    while (position[0] < length) {
      const unit = value.charAt(position[0]);
      if (unit === 93) break;
      if (unit === 32) {
        value.remove(position[0], 1);
        --length;
      } else {
        ++position[0];
        output.append(Uint16Array.of(unit));
      }
    }
    const result = output.makeStringAndClear();
    symbol.moveAssign(result);
    result.dispose();
    return position[0] - start;
  } finally {
    output.dispose();
  }
}
/** Original complete prefix/subformat state machine. @param scanner - Actual owning format scanner. @param value - Mutable input. @param position - Mutable cursor. @param symbol - Token output. @returns Original bracket token or condition operator. */
export function ImpNextSymbol(
  scanner: ImpSvNumberformatScan,
  value: OUStringBuffer,
  position: [number],
  symbol: OUString,
): number {
  let type: number = B.BRACKET_SYMBOLTYPE_FORMAT,
    letter = 32,
    length = value.getLength(),
    state: ScanState = S.SsStart;
  const output = new OUStringBuffer(128),
    keywords = scanner.GetKeywords();
  const append =
    /** Appends exactly one sal_Unicode through the view overload. @param unit - UTF16 unit. @returns Nothing. */ (
      unit: number,
    ): void => {
      output.append(Uint16Array.of(unit));
    };
  const upper =
    /** Original current-language uppercase of exactly one source unit. @param input - Actual source string. @returns First uppercase unit. */ (
      input: OUStringConstReference,
    ): number => {
      const converted = scanner
        .GetCurrentLanguageData()
        .GetCharClass()
        .uppercase(input, position[0] - 1, 1);
      try {
        return converted.getStr()[0] as number;
      } finally {
        converted.dispose();
      }
    };
  const time =
    /** Tests only the original H/MI/S keyword initials. @param unit - Uppercase unit. @returns Time initial. */ (
      unit: number,
    ): boolean =>
      unit === (keywords[K.H] as OUStringConstReference).getStr()[0] ||
      unit === (keywords[K.MI] as OUStringConstReference).getStr()[0] ||
      unit === (keywords[K.S] as OUStringConstReference).getStr()[0];
  try {
    while (position[0] < length && state !== S.SsStop) {
      const unit = value.charAt(position[0]++);
      switch (state) {
        case S.SsStart:
          if (unit === 34) {
            state = S.SsGetQuoted;
            append(unit);
          } else if (unit === 91) {
            state = S.SsGetBracketed;
            append(unit);
          } else if (unit === 59) {
            state = S.SsGetString;
            --position[0];
            type = B.BRACKET_SYMBOLTYPE_FORMAT;
          } else if (unit === 93) {
            state = S.SsStop;
            type = B.BRACKET_SYMBOLTYPE_ERROR;
          } else if (unit === 32) {
            --position[0];
            value.remove(position[0], 1);
            --length;
          } else {
            append(unit);
            state = S.SsGetString;
            type = B.BRACKET_SYMBOLTYPE_FORMAT;
          }
          break;
        case S.SsGetBracketed:
          switch (unit) {
            case 60:
            case 62:
            case 61:
              output.stripStart(91);
              append(unit);
              letter = unit;
              state = S.SsGetCon;
              switch (unit) {
                case 60:
                  type = O.NUMBERFORMAT_OP_LT;
                  break;
                case 62:
                  type = O.NUMBERFORMAT_OP_GT;
                  break;
                case 61:
                  type = O.NUMBERFORMAT_OP_EQ;
                  break;
              }
              break;
            case 32:
              --position[0];
              value.remove(position[0], 1);
              --length;
              break;
            case 36:
              if (position[0] < length && value.charAt(position[0]) === 45) {
                output.stripStart(91);
                type = B.BRACKET_SYMBOLTYPE_LOCALE;
                state = S.SsGetPrefix;
              } else {
                type = B.BRACKET_SYMBOLTYPE_FORMAT;
                state = S.SsGetString;
              }
              append(unit);
              break;
            case 126:
              type = B.BRACKET_SYMBOLTYPE_FORMAT;
              append(unit);
              state = S.SsGetString;
              break;
            default: {
              const input = value.toString(),
                natNum: [number] = [0],
                dbNum: [number] = [0];
              try {
                if (
                  lcl_matchKeywordAndGetNumber(
                    input.subView(0),
                    position[0] - 1,
                    aNatNum,
                    natNum,
                  ) &&
                  0 <= natNum[0] &&
                  natNum[0] <= 19
                ) {
                  output.stripStart(91);
                  output.append(input.subView(--position[0], aNatNum.length + 1));
                  position[0] += aNatNum.length + 1;
                  type = B.BRACKET_SYMBOLTYPE_NATNUM0 - natNum[0];
                  state = S.SsGetPrefix;
                } else if (
                  lcl_matchKeywordAndGetNumber(input.subView(0), position[0] - 1, aDBNum, dbNum) &&
                  1 <= dbNum[0] &&
                  dbNum[0] <= 9
                ) {
                  output.stripStart(91);
                  output.append(input.subView(--position[0], aDBNum.length + 1));
                  position[0] += aDBNum.length + 1;
                  type = B.BRACKET_SYMBOLTYPE_DBNUM1 - (dbNum[0] - 1);
                  state = S.SsGetPrefix;
                } else if (time(upper(input))) {
                  append(unit);
                  state = S.SsGetTime;
                  letter = unit;
                } else {
                  output.stripStart(91);
                  append(unit);
                  type = B.BRACKET_SYMBOLTYPE_COLOR;
                  state = S.SsGetPrefix;
                }
              } finally {
                input.dispose();
              }
              break;
            }
          }
          break;
        case S.SsGetString:
          if (unit === 34) {
            state = S.SsGetQuoted;
            append(unit);
          } else if (unit === 59 && (position[0] < 2 || !IsCombiningSymbol(value, position[0] - 2)))
            state = S.SsStop;
          else append(unit);
          break;
        case S.SsGetQuoted:
          if (unit === 34) state = S.SsGetString;
          append(unit);
          break;
        case S.SsGetTime:
          if (unit === 93) {
            append(unit);
            state = S.SsGetString;
            type = B.BRACKET_SYMBOLTYPE_FORMAT;
          } else {
            const input = value.toString();
            let isTime: boolean;
            try {
              isTime = time(upper(input));
            } finally {
              input.dispose();
            }
            if (isTime) {
              if (letter === unit) {
                append(unit);
                letter = 32;
              } else {
                output.stripStart(91);
                append(unit);
                state = S.SsGetPrefix;
              }
            } else {
              output.stripStart(91);
              append(unit);
              type = B.BRACKET_SYMBOLTYPE_COLOR;
              state = S.SsGetPrefix;
            }
          }
          break;
        case S.SsGetCon:
          switch (unit) {
            case 60:
              state = S.SsStop;
              type = B.BRACKET_SYMBOLTYPE_ERROR;
              break;
            case 62:
              if (letter === 60) {
                append(unit);
                letter = 32;
                state = S.SsStop;
                type = O.NUMBERFORMAT_OP_NE;
              } else {
                state = S.SsStop;
                type = B.BRACKET_SYMBOLTYPE_ERROR;
              }
              break;
            case 61:
              if (letter === 60) {
                append(unit);
                letter = 32;
                type = O.NUMBERFORMAT_OP_LE;
              } else if (letter === 62) {
                append(unit);
                letter = 32;
                type = O.NUMBERFORMAT_OP_GE;
              } else {
                state = S.SsStop;
                type = B.BRACKET_SYMBOLTYPE_ERROR;
              }
              break;
            case 32:
              --position[0];
              value.remove(position[0], 1);
              --length;
              break;
            default:
              state = S.SsStop;
              --position[0];
              break;
          }
          break;
        case S.SsGetPrefix:
          if (unit === 93) state = S.SsStop;
          else append(unit);
          break;
      }
    }
    const result = output.makeStringAndClear();
    symbol.moveAssign(result);
    result.dispose();
    return type;
  } finally {
    output.dispose();
  }
}

/** Original classification of prefixes, including positive condition operators. @param nSymbolType - Lexer result. @returns Whether another prefix may follow. */
export function lcl_SvNumberformat_IsBracketedPrefix(nSymbolType: number): boolean {
  if (nSymbolType > 0) {
    return true; // conditions
  }
  switch (nSymbolType) {
    case B.BRACKET_SYMBOLTYPE_COLOR:
    case B.BRACKET_SYMBOLTYPE_DBNUM1:
    case B.BRACKET_SYMBOLTYPE_DBNUM2:
    case B.BRACKET_SYMBOLTYPE_DBNUM3:
    case B.BRACKET_SYMBOLTYPE_DBNUM4:
    case B.BRACKET_SYMBOLTYPE_DBNUM5:
    case B.BRACKET_SYMBOLTYPE_DBNUM6:
    case B.BRACKET_SYMBOLTYPE_DBNUM7:
    case B.BRACKET_SYMBOLTYPE_DBNUM8:
    case B.BRACKET_SYMBOLTYPE_DBNUM9:
    case B.BRACKET_SYMBOLTYPE_LOCALE:
    case B.BRACKET_SYMBOLTYPE_NATNUM0:
    case B.BRACKET_SYMBOLTYPE_NATNUM1:
    case B.BRACKET_SYMBOLTYPE_NATNUM2:
    case B.BRACKET_SYMBOLTYPE_NATNUM3:
    case B.BRACKET_SYMBOLTYPE_NATNUM4:
    case B.BRACKET_SYMBOLTYPE_NATNUM5:
    case B.BRACKET_SYMBOLTYPE_NATNUM6:
    case B.BRACKET_SYMBOLTYPE_NATNUM7:
    case B.BRACKET_SYMBOLTYPE_NATNUM8:
    case B.BRACKET_SYMBOLTYPE_NATNUM9:
    case B.BRACKET_SYMBOLTYPE_NATNUM10:
    case B.BRACKET_SYMBOLTYPE_NATNUM11:
    case B.BRACKET_SYMBOLTYPE_NATNUM12:
    case B.BRACKET_SYMBOLTYPE_NATNUM13:
    case B.BRACKET_SYMBOLTYPE_NATNUM14:
    case B.BRACKET_SYMBOLTYPE_NATNUM15:
    case B.BRACKET_SYMBOLTYPE_NATNUM16:
    case B.BRACKET_SYMBOLTYPE_NATNUM17:
    case B.BRACKET_SYMBOLTYPE_NATNUM18:
    case B.BRACKET_SYMBOLTYPE_NATNUM19:
      return true;
  }
  return false;
}
