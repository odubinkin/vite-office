/** @fileoverview Original format-section conditions, character-width blanks, star controls and literal/text output from zformat.cxx. */
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Color } from "../../../tools/inc/color";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { SvNumberformatLimitOps as O } from "./zformat.prefix";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { impTransliterate } from "./zformat.transliterate";
import type { SvNFLanguageData } from "./zforlist";
import type { SvNumberformat, ImpSvNumFor } from "./zformat";
/** Original ASCII character width table used by InsertBlanks, independent of actual rendering fonts. */
const cCharWidths = [
  1, 1, 1, 2, 2, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3,
  2, 2, 2, 2, 2, 2, 3, 2, 1, 2, 2, 2, 3, 3, 3, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 1, 1, 1, 2, 2, 1, 2,
  2, 2, 2, 2, 1, 2, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 1,
];
/** Original fixed-width blank production; non-ASCII uses source width two. @param buffer - Actual buffer. @param position - Insertion point. @param character - Native sal_Unicode. @returns Position after inserted spaces. */
export function InsertBlanks(buffer: OUStringBuffer, position: number, character: number): number {
  character &= 65535;
  if (character >= 32) {
    let count = character <= 127 ? (cCharWidths[character - 32] as number) : 2;
    while (count-- > 0) buffer.insertChar(position++, 32);
  }
  return position;
}
/** Original star-fill escape and following UTF16 code unit. @param buffer - Actual buffer. @param token - Compiled star token. @returns Whether a fill was appended. */
function appendStarFillChar(buffer: OUStringBuffer, token: OUStringConstReference): boolean {
  if (token.getLength() > 1) {
    buffer.append(Uint16Array.of(27, token.getStr()[1] as number));
    return true;
  }
  return false;
}
/** Original tri-state condition comparison, including NO/default=-1 and IEEE comparison behavior. @param value - Number. @param limit - Compiled condition bound. @param operation - Native opcode. @returns -1, zero or one. */
function ImpCheckCondition(value: number, limit: number, operation: number): number {
  switch (operation) {
    case O.NUMBERFORMAT_OP_EQ:
      return Number(value === limit);
    case O.NUMBERFORMAT_OP_NE:
      return Number(value !== limit);
    case O.NUMBERFORMAT_OP_LT:
      return Number(value < limit);
    case O.NUMBERFORMAT_OP_LE:
      return Number(value <= limit);
    case O.NUMBERFORMAT_OP_GT:
      return Number(value > limit);
    case O.NUMBERFORMAT_OP_GE:
      return Number(value >= limit);
    default:
      return -1;
  }
}
/** Original condition-driven selection of the three numeric sections. @param this - Actual format. @param value - Cell value. @returns Compiled section index. */
export function GetSubformatIndex(this: SvNumberformat, value: number): number {
  const first = ImpCheckCondition(value, this["fLimit1"], this["eOp1"]);
  if (first === -1 || first === 1) return 0;
  const second = ImpCheckCondition(value, this["fLimit2"], this["eOp2"]);
  return second === -1 || second === 1 ? 1 : 2;
}
/** Original header predicate for whether section zero denotes actual negative values. @param this - Actual compiled format. @returns Negative section. */
export function IsFirstSubformatRealNegative(this: SvNumberformat): boolean {
  return (
    this["fLimit1"] === 0 &&
    this["fLimit2"] === 0 &&
    ((this["eOp1"] === O.NUMBERFORMAT_OP_LT &&
      [
        O.NUMBERFORMAT_OP_GT,
        O.NUMBERFORMAT_OP_EQ,
        O.NUMBERFORMAT_OP_GE,
        O.NUMBERFORMAT_OP_NO,
      ].includes(this["eOp2"])) ||
      (this["eOp1"] === O.NUMBERFORMAT_OP_LE &&
        [O.NUMBERFORMAT_OP_NO, O.NUMBERFORMAT_OP_GT].includes(this["eOp2"])))
  );
}
/** Original string overload: selects the text section, returns its color and expands each compiled token. @param this - Actual format. @param value - Borrowed cell string. @param output - Mutable output. @param color - Borrowed color output. @param star - Original fill flag. @returns Nothing. */
export function GetStringOutput(
  this: SvNumberformat,
  value: OUStringConstReference,
  output: OUString,
  color: [Color | null],
  star: boolean,
): void {
  const index =
    this.GetType() & T.TEXT ? 0 : (this["NumFor"][3] as ImpSvNumFor).GetCount() > 0 ? 3 : -1;
  if (index < 0) {
    color[0] = null;
    return;
  }
  const section = this["NumFor"][index] as ImpSvNumFor,
    info = section.Info(),
    buffer = new OUStringBuffer();
  color[0] = section.GetColor();
  try {
    if (info.eScannedType === T.TEXT)
      for (let token = 0; token < section.GetCount(); token++) {
        const string = info.sStrArray[token] as OUString;
        switch (info.nTypeArray[token]) {
          case S.STAR:
            if (star) appendStarFillChar(buffer, string);
            break;
          case S.BLANK:
            if (string.getLength() >= 2)
              InsertBlanks(buffer, buffer.getLength(), string.getStr()[1] as number);
            break;
          case K.GENERAL:
          case S.DEL:
            buffer.append(value);
            break;
          default:
            buffer.append(string);
        }
      }
    const result = buffer.makeStringAndClear();
    try {
      output.assign(result);
    } finally {
      result.dispose();
    }
  } finally {
    buffer.dispose();
  }
}
/** Original numeric TEXT/DEFINED production and empty-section output after common section selection. @param section - Actual compiled section. @param output - Mutable output. @param star - Fill flag. @returns Whether a star fill was emitted. */
export function GetLiteralOutput(section: ImpSvNumFor, output: OUString, star: boolean): boolean {
  const info = section.Info(),
    buffer = new OUStringBuffer();
  let result = false;
  try {
    for (let index = 0; index < section.GetCount(); index++) {
      const token = info.sStrArray[index] as OUString;
      switch (info.nTypeArray[index]) {
        case S.STAR:
          if (star) result = appendStarFillChar(buffer, token);
          break;
        case S.BLANK:
          if (token.getLength() >= 2)
            InsertBlanks(buffer, buffer.getLength(), token.getStr()[1] as number);
          break;
        case S.STRING:
        case S.CURRENCY:
          buffer.append(token);
          break;
        case S.THSEP:
          if (info.nThousand === 0) buffer.append(token);
          break;
      }
    }
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

/** Original ImpGetLogicalOutput; only BOOLEAN and STRING tokens emit output. @param value - Native double. @param section - Selected actual section. @param native - Original native-number owner. @param current - Actual language owner. @param output - Mutable result. @returns Original false fill result. */
export function GetLogicalOutput(
  value: number,
  section: ImpSvNumFor,
  native: NativeNumberWrapper,
  current: SvNFLanguageData,
  output: OUString,
): boolean {
  const buffer = new OUStringBuffer(),
    info = section.Info();
  try {
    for (let index = 0; index < section.GetCount(); ++index) {
      switch (info.nTypeArray[index]) {
        case K.BOOLEAN:
          buffer.append(value !== 0 ? current.GetTrueString() : current.GetFalseString());
          break;
        case S.STRING:
          buffer.append(info.sStrArray[index] as OUString);
          break;
      }
    }
    impTransliterate(buffer, section.GetNatNum(), native);
    const text = buffer.makeStringAndClear();
    try {
      output.assign(text);
    } finally {
      text.dispose();
    }
    return false;
  } finally {
    buffer.dispose();
  }
}
