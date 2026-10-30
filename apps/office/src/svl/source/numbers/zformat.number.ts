/** @fileoverview Original number/percent/currency/scientific digit production and decimal/grouping fill over real compiled format and locale owners. */
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_math_doubleToUString, rtl_math_StringFormat as F } from "../../../sal/inc/rtl/math.h";
import { round } from "../../../sal/inc/rtl/math";
import { DigitGroupingIterator } from "../../../unotools/inc/digitgroupingiterator";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { ImpSvNumberformatScan, FLAG_STANDARD_IN_FORMAT } from "./zforscan";
import { formatStandardNumber, type ImpSvNumFor } from "./zformat";
import type { SvNFLanguageData } from "./zforlist";
import { InsertBlanks } from "./zformat.output";
/** Original GetPrecExp, including its iterative 1e-7..1e7 interval. @param value - Positive magnitude. @returns Decimal exponent plus one. */
function GetPrecExp(value: number): number {
  if (value < 1e-7 || value > 1e7) return Math.floor(Math.log10(value)) + 1;
  let result = 1;
  while (value < 1) {
    value *= 10;
    --result;
  }
  while (value >= 10) {
    value /= 10;
    ++result;
  }
  return result;
}
/** Original explicit RTL conversion keeps trailing zeroes; caller owns the returned string. @param value - Number. @param precision - Fractional digits. @param format - Original RTL conversion selector. @returns Output. */
function convertNumber(
  value: number,
  precision: number,
  format = F.rtl_math_StringFormat_F,
): OUString {
  const result = new OUString();
  rtl_math_doubleToUString(
    result.getDataAddress(),
    null,
    0,
    value,
    format,
    precision,
    46,
    null,
    0,
    false,
  );
  return result;
}
/** Original star insertion puts ESC before the following UTF16 unit. @param buffer - Output. @param position - Insertion point. @param token - Compiled token. @returns Fill emitted. */
function insertStarFillChar(buffer: OUStringBuffer, position: number, token: OUString): boolean {
  if (token.getLength() > 1) {
    buffer.insertChar(position, token.getStr()[1] as number);
    buffer.insertChar(position, 27);
    return true;
  }
  return false;
}
/** Source General production uses the actual current precision/decimal and removes its sign at the caller. This admitted path has no complete native-number modifier. @param value - Number. @param current - Actual language owner. @returns Owned standard output. */
function standard(value: number, current: SvNFLanguageData): OUString {
  return formatStandardNumber(
    value,
    Math.min(current.GetStandardPrec(), 300),
    current.GetNumDecimalSep().getStr()[0] as number,
  );
}
/** Original remaining-integer digit grouping, updating the source cursor/count references. @param current - Locale owner. @param buffer - Number. @param start - First digit. @param position - Mutable cursor. @param section - Compiled section. @param count - Mutable count. @param grouping - Actual sequence iterator. @returns Nothing. */
function ImpDigitFill(
  current: SvNFLanguageData,
  buffer: OUStringBuffer,
  start: number,
  position: [number],
  section: ImpSvNumFor,
  count: [number],
  grouping: DigitGroupingIterator,
): void {
  if (section.Info().bThousand) {
    while (position[0] > start) {
      if (count[0] === grouping.getPos()) {
        buffer.insert(position[0], current.GetNumThousandSep());
        grouping.advance();
      }
      ++count[0];
      --position[0];
    }
  } else position[0] = start;
}
/** Original backwards integer/literal fill and locale grouping sequence. @param current - Language owner. @param buffer - Number buffer. @param value - Rounded/scaled magnitude. @param position - Initial digit cursor. @param symbol - Initial token. @param section - Compiled section. @param digitLimit - Integer digits in pattern. @param star - Fill flag. @param addDecimal - Retain decimal separator. @returns Star-fill result. */
export function ImpNumberFillWithThousands(
  current: SvNFLanguageData,
  buffer: OUStringBuffer,
  value: number,
  position: number,
  symbol: number,
  section: ImpSvNumFor,
  digitLimit: number,
  star: boolean,
  addDecimal = true,
): boolean {
  let result = false,
    leading = 0,
    stop = false;
  const info = section.Info(),
    cursor: [number] = [position],
    count: [number] = [0],
    grouping = new DigitGroupingIterator(current.GetLocaleData().getDigitGrouping());
  let doThousands = info.nThousand === 0;
  try {
    while (!stop) {
      if (symbol === 0) stop = true;
      const type = info.nTypeArray[symbol],
        token = info.sStrArray[symbol] as OUString;
      switch (type) {
        case S.DECSEP:
        case S.STRING:
        case S.CURRENCY:
        case S.PERCENT:
          if (type === S.DECSEP) grouping.reset();
          if (type === S.STRING && digitLimit === 0) cursor[0] = 0;
          if (type !== S.DECSEP || addDecimal) buffer.insert(cursor[0], token);
          if (cursor[0] === 0) leading += token.getLength();
          break;
        case S.STAR:
          if (star) result = insertStarFillChar(buffer, cursor[0], token);
          break;
        case S.BLANK:
          if (token.getLength() >= 2) InsertBlanks(buffer, cursor[0], token.getStr()[1] as number);
          break;
        case S.THSEP:
          if (!doThousands && symbol < section.GetCount() - 1)
            doThousands =
              symbol === 0 ||
              (info.nTypeArray[symbol - 1] !== S.DIGIT &&
                info.nTypeArray[symbol - 1] !== S.THSEP) ||
              info.nTypeArray[symbol + 1] === S.DIGIT;
          if (doThousands) {
            if (cursor[0] > 0) buffer.insert(cursor[0], token);
            else if (count[0] < digitLimit) {
              let leader = 0;
              if (symbol > 0 && info.nTypeArray[symbol - 1] === S.DIGIT) {
                const previous = info.sStrArray[symbol - 1] as OUString;
                if (previous.getLength())
                  leader = previous.getStr()[previous.getLength() - 1] as number;
              }
              if (leader === 63) buffer.insertChar(cursor[0], 32);
              else if (leader !== 35) buffer.insert(cursor[0], token);
            }
            grouping.advance();
          }
          break;
        case S.DIGIT:
          for (let index = token.getLength() - 1; index >= 0; --index) {
            ++count[0];
            if (cursor[0] > 0) --cursor[0];
            else if (token.getStr()[index] === 48) buffer.insertChar(0, 48);
            else if (token.getStr()[index] === 63) buffer.insertChar(0, 0x2007);
            if (count[0] === digitLimit && cursor[0] > 0)
              ImpDigitFill(current, buffer, 0, cursor, section, count, grouping);
          }
          break;
        case K.CCC:
          buffer.insert(cursor[0], current.GetCurAbbrev());
          break;
        case K.GENERAL: {
          const number = standard(value, current),
            temp = new OUStringBuffer();
          try {
            temp.append(number);
            temp.stripStart(45);
            const text = temp.makeStringAndClear();
            try {
              buffer.insert(cursor[0], text);
            } finally {
              text.dispose();
            }
          } finally {
            temp.dispose();
            number.dispose();
          }
          break;
        }
      }
      symbol = (symbol - 1) & 65535;
    }
    cursor[0] += leading;
    if (cursor[0] > leading)
      ImpDigitFill(current, buffer, leading, cursor, section, count, grouping);
    return result;
  } finally {
    grouping.dispose();
  }
}
/** Original decimal placeholder fill before integer/grouping fill. @param current - Actual language. @param buffer - Digits without decimal point. @param value - Rounded magnitude. @param decimalPosition - Original decimal position or -1. @param symbol - Last token. @param section - Compiled section. @param integer - Decimal portion is all zeroes. @param star - Fill flag. @returns Star-fill result. */
function ImpDecimalFill(
  current: SvNFLanguageData,
  buffer: OUStringBuffer,
  value: number,
  decimalPosition: number,
  symbol: number,
  section: ImpSvNumFor,
  integer: boolean,
  star: boolean,
): boolean {
  let result = false,
    filled = false,
    position = buffer.getLength();
  const info = section.Info();
  if (info.nCntPost > 0) {
    let trailing = true;
    while (symbol > 0 && info.nTypeArray[symbol] !== S.DECSEP) {
      const token = info.sStrArray[symbol] as OUString;
      switch (info.nTypeArray[symbol]) {
        case S.STAR:
          if (star) result = insertStarFillChar(buffer, position, token);
          break;
        case S.BLANK:
          if (token.getLength() >= 2) InsertBlanks(buffer, position, token.getStr()[1] as number);
          break;
        case S.STRING:
        case S.CURRENCY:
        case S.PERCENT:
          buffer.insert(position, token);
          break;
        case S.THSEP:
          if (info.nThousand === 0) buffer.insert(position, token);
          break;
        case S.DIGIT: {
          if (decimalPosition >= 0 && decimalPosition <= position) {
            let append = token.getLength() - (position - decimalPosition);
            while (append-- > 0) buffer.insertChar(position++, 48);
          }
          for (let index = token.getLength() - 1; position > 0 && index >= 0; --index) {
            const character = token.getStr()[index];
            --position;
            if (buffer.charAt(position) !== 48) {
              trailing = false;
              filled = true;
            }
            if (trailing) {
              if (character === 48) filled = true;
              else if (character === 45) {
                if (integer) buffer.setCharAt(position, 45);
                filled = true;
              } else if (character === 63) {
                buffer.setCharAt(position, 0x2007);
                filled = true;
              } else if (!filled) buffer.remove(position, 1);
            }
          }
          break;
        }
        case K.CCC:
          buffer.insert(position, current.GetCurAbbrev());
          break;
        case K.GENERAL: {
          const number = standard(value, current),
            temp = new OUStringBuffer();
          try {
            temp.append(number);
            temp.stripStart(45);
            const text = temp.makeStringAndClear();
            try {
              buffer.insert(position, text);
            } finally {
              text.dispose();
            }
          } finally {
            temp.dispose();
            number.dispose();
          }
          break;
        }
      }
      --symbol;
    }
  }
  return (
    ImpNumberFillWithThousands(
      current,
      buffer,
      value,
      position,
      symbol,
      section,
      info.nCntPre,
      star,
      filled,
    ) || result
  );
}
/** Original ImpGetNumberOutput arithmetic and fill sequence for the admitted no-complete-NatNum path; no alternate locale, parser or rounding is supplied. @param value - Native value after section sign normalization. @param index - Selected section. @param section - Actual compiled section. @param current - Actual language owner. @param output - Owned mutable output. @param star - Fill flag. @returns Star-fill result. */
export function GetNumberOutput(
  value: number,
  index: number,
  section: ImpSvNumFor,
  current: SvNFLanguageData,
  output: OUString,
  star: boolean,
): boolean {
  let sign = value < 0 && index === 0;
  value = Math.abs(value);
  const info = section.Info(),
    buffer = new OUStringBuffer();
  try {
    if (info.eScannedType === T.PERCENT) {
      if (value < 1.7e306) value *= 100;
      else {
        output.assign(ImpSvNumberformatScan.sErrStr);
        return false;
      }
    }
    let decimalPosition = -1,
      integer = false;
    if (info.nThousand !== FLAG_STANDARD_IN_FORMAT) {
      for (let group = 0; group < info.nThousand; ++group)
        value = value > 2.3e-305 ? value / 1000 : 0;
      const exponent = value > 0 ? GetPrecExp(value) : 0;
      value = round(value, info.nCntPost);
      if (info.nCntPost) {
        const precision =
            info.nCntPost + exponent > 15 && exponent < 15 ? 15 - exponent : info.nCntPost,
          digits = convertNumber(value, precision);
        try {
          buffer.append(digits);
        } finally {
          digits.dispose();
        }
        for (let place = precision; place < info.nCntPost; ++place)
          buffer.append(Uint16Array.of(48));
        buffer.stripStart(48);
      } else if (value !== 0) {
        const digits = convertNumber(value, 0);
        try {
          buffer.append(digits);
        } finally {
          digits.dispose();
        }
        buffer.stripStart(48);
      }
      decimalPosition = buffer.indexOf(46);
      if (decimalPosition >= 0) {
        integer = true;
        for (let position = decimalPosition + 1; position < buffer.getLength(); ++position)
          if (buffer.charAt(position) !== 48) {
            integer = false;
            break;
          }
        buffer.remove(decimalPosition, 1);
      }
      if (sign) {
        let allZero = buffer.isEmpty();
        if (!allZero) {
          allZero = true;
          for (let position = 0; position < buffer.getLength(); ++position)
            if (buffer.charAt(position) !== 48) {
              allZero = false;
              break;
            }
        }
        if (allZero) sign = false;
      }
    }
    const result = ImpDecimalFill(
      current,
      buffer,
      value,
      decimalPosition,
      section.GetCount() - 1,
      section,
      integer,
      star,
    );
    if (sign) buffer.insertChar(0, 45);
    const text = buffer.makeStringAndClear();
    try {
      output.assign(text);
    } finally {
      text.dispose();
    }
    return result;
  } finally {
    buffer.dispose();
  }
}

/** Original ImpNumberFill for exponent/denominator/numerator token runs, with source mutable token and digit positions. @param current - Actual language owner. @param buffer - Digits and inserted literals. @param value - Magnitude for General tokens. @param position - Mutable character cursor. @param symbol - Mutable token cursor. @param section - Compiled section. @param stopType - Original token stop condition. @param star - Fill flag. @param insertRightBlank - Original denominator alignment flag. @returns Star-fill result. */
export function ImpNumberFill(
  current: SvNFLanguageData,
  buffer: OUStringBuffer,
  value: number,
  position: [number],
  symbol: [number],
  section: ImpSvNumFor,
  stopType: number,
  star: boolean,
  insertRightBlank = false,
): boolean {
  let result = false,
    stop = false,
    foundNumber = false;
  const info = section.Info();
  let doThousands = info.nThousand === 0;
  position[0] = buffer.getLength();
  while (!stop && info.nTypeArray[symbol[0]] !== stopType) {
    const type = info.nTypeArray[symbol[0]],
      token = info.sStrArray[symbol[0]] as OUString;
    switch (type) {
      case S.STAR:
        if (star) {
          if (foundNumber && stopType !== S.EXP) position[0] = 0;
          result = insertStarFillChar(buffer, position[0], token);
        }
        break;
      case S.BLANK:
        if (token.getLength() >= 2) {
          if (foundNumber && stopType !== S.EXP) position[0] = 0;
          position[0] = InsertBlanks(buffer, position[0], token.getStr()[1] as number);
        }
        break;
      case S.THSEP:
        if (!doThousands && symbol[0] < section.GetCount() - 1)
          doThousands =
            symbol[0] === 0 ||
            (info.nTypeArray[symbol[0] - 1] !== S.DIGIT &&
              info.nTypeArray[symbol[0] - 1] !== S.THSEP) ||
            info.nTypeArray[symbol[0] + 1] === S.DIGIT;
        if (doThousands && position[0] > 0) buffer.insert(position[0], token);
        break;
      case S.DIGIT: {
        foundNumber = true;
        const blankPosition = (insertRightBlank ? position[0] : 0) & 65535;
        for (let index = token.getLength() - 1; index >= 0; --index) {
          if (position[0] > 0) --position[0];
          else if (token.getStr()[index] === 48) buffer.insertChar(0, 48);
          else if (token.getStr()[index] === 63) buffer.insertChar(blankPosition, 0x2007);
        }
        break;
      }
      case K.CCC:
        buffer.insert(position[0], current.GetCurAbbrev());
        break;
      case K.GENERAL: {
        const number = standard(value, current),
          temporary = new OUStringBuffer();
        foundNumber = true;
        try {
          temporary.append(number);
          temporary.stripStart(45);
          const text = temporary.makeStringAndClear();
          try {
            buffer.insert(position[0], text);
          } finally {
            text.dispose();
          }
        } finally {
          temporary.dispose();
          number.dispose();
        }
        break;
      }
      case S.FRAC_FDIV:
        if (position[0] > 0) --position[0];
        break;
      default:
        if (foundNumber && stopType !== S.EXP) position[0] = 0;
        buffer.insert(position[0], token);
    }
    if (symbol[0]) --symbol[0];
    else stop = true;
  }
  return result;
}

/** Original ImpGetScientificOutput, including engineering exponent rescaling and rounded-up mantissa compensation. Actual RTL conversion and compiled digit-fill owners are reused. @param value - Finite normalized cell value. @param index - Selected numeric section. @param section - Compiled section. @param current - Actual language owner. @param output - Mutable output. @param star - Fill flag. @returns Star-fill result. */
export function GetScientificOutput(
  value: number,
  index: number,
  section: ImpSvNumFor,
  current: SvNFLanguageData,
  output: OUString,
  star: boolean,
): boolean {
  const info = section.Info(),
    mantissa = new OUStringBuffer(),
    exponent = new OUStringBuffer();
  let result = false,
    sign = false;
  if (value < 0) {
    if (index === 0) sign = true;
    value = -value;
  }
  try {
    const initial = convertNumber(
      value,
      info.nCntPre + info.nCntPost - 1,
      F.rtl_math_StringFormat_E,
    );
    try {
      mantissa.append(initial);
    } finally {
      initial.dispose();
    }
    let exponentSign = 1,
      decimalPosition = -1;
    const exponentPosition = mantissa.indexOf(69);
    if (exponentPosition >= 0) {
      let start = exponentPosition + 1;
      if (mantissa.charAt(start) === 45) {
        exponentSign = -1;
        ++start;
      } else if (mantissa.charAt(start) === 43) ++start;
      exponent.append(mantissa.getStr().subarray(start, mantissa.getLength()));
      mantissa.truncate(exponentPosition);
      if (info.nCntPre !== 1) {
        const exponentValue = new OUString(exponent.getStr(), exponent.getLength());
        let number: number;
        try {
          number = exponentValue.toInt32() * exponentSign;
        } finally {
          exponentValue.dispose();
        }
        let rescale = info.nCntPre !== 0 ? number % info.nCntPre : -1;
        if (rescale < 0 && info.nCntPre !== 0) rescale += info.nCntPre;
        number -= rescale;
        if (number < 0) {
          exponentSign = -1;
          number = -number;
        } else exponentSign = 1;
        exponent.truncate();
        exponent.append(OUString.number(number));
        const firstDigit = mantissa.charAt(0),
          scaled = convertNumber(value, rescale + info.nCntPost, F.rtl_math_StringFormat_E);
        try {
          mantissa.truncate();
          mantissa.append(scaled);
        } finally {
          scaled.dispose();
        }
        mantissa.truncate(mantissa.indexOf(69));
        if (mantissa.charAt(0) === 49 && firstDigit !== 49) mantissa.append(Uint16Array.of(48));
      }
      let position = 0;
      while ((position = mantissa.indexOf(46, position)) >= 0) {
        if (decimalPosition < 0) decimalPosition = position;
        mantissa.remove(position, 1);
      }
    }
    const symbol: [number] = [(section.GetCount() - 1) & 65535],
      position: [number] = [exponent.getLength() - 1];
    let zeros = 0;
    while (zeros < position[0] && exponent.charAt(zeros) === 48) ++zeros;
    if (zeros) exponent.remove(0, zeros);
    result =
      ImpNumberFill(current, exponent, value, position, symbol, section, S.EXP, star) || result;
    let continueMantissa = true;
    if (info.nTypeArray[symbol[0]] === S.EXP) {
      const token = info.sStrArray[symbol[0]] as OUString;
      if (exponentSign === -1) exponent.insertChar(0, 45);
      else if (token.getLength() > 1 && token.getStr()[1] === 43) exponent.insertChar(0, 43);
      exponent.insertChar(0, token.getStr()[0] as number);
      if (symbol[0]) --symbol[0];
      else continueMantissa = false;
    }
    if (!continueMantissa) mantissa.truncate();
    else
      result =
        ImpDecimalFill(
          current,
          mantissa,
          value,
          decimalPosition,
          symbol[0],
          section,
          false,
          star,
        ) || result;
    if (sign) mantissa.insertChar(0, 45);
    mantissa.append(exponent.getStr().subarray(0, exponent.getLength()));
    const text = mantissa.makeStringAndClear();
    try {
      output.assign(text);
    } finally {
      text.dispose();
    }
    return result;
  } finally {
    exponent.dispose();
    mantissa.dispose();
  }
}
