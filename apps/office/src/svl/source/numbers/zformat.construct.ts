/** @fileoverview Original SvNumberformat normal-constructor control flow over actual subformats, scanner, input scanner and native-number service. */
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM, LANGUAGE_THAI } from "../../../i18nlangtag/inc/lang";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { trim } from "../../../o3tl/inc/string_view";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { StringConcat, type StringNumber } from "../../../sal/inc/rtl/stringconcat";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { SvNumFormatType as T, SvNumInputOptions } from "../../inc/zforlist";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import type { ImpSvNumberInputScan } from "./zforfind";
import { SvNumberFormatter } from "./zforlist";
import type { SvNumberformat } from "./zformat";
import {
  ImpNextSymbol,
  ImpGetNumber,
  lcl_SvNumberformat_IsBracketedPrefix,
  BracketFormatSymbolType as B,
  SvNumberformatLimitOps as O,
} from "./zformat.prefix";
import { ImpGetLocaleType } from "./zformat.locale";
import { ImpObtainCalendarAndNumerals } from "./zformat.locale-calendar";
/** Adapts native compile-time UTF16 literals to borrowed unit views. @param value - Exact source literal. @returns UTF16 literal units. */
function literal(value: string): Uint16Array {
  const result = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) result[i] = value.charCodeAt(i);
  return result;
}
/** Original lazy Unicode concatenation operand families used by the constructor. */
type Operand = OUStringConstReference | Uint16Array | StringNumber | StringConcat;
/** Materializes the source lazy concatenation without a parallel string owner. @param values - Borrowed original operands. @returns Owned string. */
function concatenate(...values: Operand[]): OUString {
  let expression: Operand = values[0] as Operand;
  for (let i = 1; i < values.length; ++i)
    expression = new StringConcat(expression, values[i] as Operand);
  return expression instanceof Uint16Array
    ? new OUString(expression, expression.length)
    : new OUString(expression);
}
/** Original NatNum12 parameter currency-word check. @param value - Source parameter view. @returns Three-letter uppercase word. */
function lcl_isNatNum12Currency(value: Uint16Array): boolean {
  let upper = 0;
  for (let i = 0; i < value.length; ++i) {
    const unit = value[i] as number;
    if (65 <= unit && unit <= 90) ++upper;
    else if (unit === 32 && upper === 3 && (i === 3 || value[i - 4] === 32)) return true;
    else upper = 0;
  }
  return upper === 3 && (value.length === 3 || value[value.length - 4] === 32);
}
/** Original complete normal constructor; scalar references bind the original C++ arguments and all mutations target the real compiled entry. @param this - Actual compiled entry. @param code - Mutable original code. @param input - Actual input scanner. @param native - Actual native-number provider. @param check - Error position. @param language - Mutable native language. @param replaceBoolean - Original defaulttrue. @returns Nothing. */
export function Construct(
  this: SvNumberformat,
  code: OUString,
  input: ImpSvNumberInputScan,
  native: NativeNumberWrapper,
  check: [number],
  language: [number],
  replaceBoolean: boolean,
): void {
  const scan = this["rScan"],
    sections = this["NumFor"],
    locale = this["maLocale"];
  if (replaceBoolean) scan.ReplaceBooleanEquivalent(code);
  const buffer = new OUStringBuffer(code),
    fromDecimal = new OUString(),
    toDecimal = new OUString();
  try {
    const grouping = scan.GetCurrentLanguageData().GetNumThousandSep();
    if (grouping.getLength() === 1) {
      if (grouping.getStr()[0] === 0xa0) buffer.replace(0xa0, 32);
      else if (grouping.getStr()[0] === 0x202f) buffer.replace(0x202f, 32);
    }
    if (scan.GetConvertMode()) {
      fromDecimal.assign(scan.GetCurrentLanguageData().GetNumDecimalSep());
      locale.meLanguage = scan.GetNewLnge();
      language[0] = locale.meLanguage;
    } else locale.meLanguage = language[0] & 65535;
    this["bStandard"] = false;
    this["fLimit1"] = 0;
    this["fLimit2"] = 0;
    this["eOp1"] = O.NUMBERFORMAT_OP_NO;
    this["eOp2"] = O.NUMBERFORMAT_OP_NO;
    this["eType"] = T.DEFINED;
    let cancel = false,
      condition = false,
      type: number = B.BRACKET_SYMBOLTYPE_FORMAT,
      oldPosition = 0,
      index = 0;
    const position: [number] = [0];
    check[0] = 0;
    for (index = 0; index < 4 && !cancel; ++index) {
      if (scan.GetConvertMode()) scan.GetCurrentLanguageData().ChangeIntl(scan.GetTmpLnge());
      const calendar = new OUString(),
        token = new OUString();
      try {
        oldPosition = position[0];
        do {
          type = ImpNextSymbol(scan, buffer, position, token);
          if (type > 0) {
            if (index === 0 && !condition) {
              condition = true;
              this["eOp1"] = type;
            } else if (index === 1 && condition) this["eOp2"] = type;
            else {
              cancel = true;
              check[0] = oldPosition;
            }
            if (!cancel) {
              const result: [number] = [0],
                count = ImpGetNumber(buffer, position, token);
              if (count > 0) {
                const numberType: [number] = [T.UNDEFINED];
                if (
                  !input.IsNumberFormat(
                    token,
                    numberType,
                    result,
                    null,
                    native,
                    SvNumInputOptions.NONE,
                  ) ||
                  (numberType[0] !== T.NUMBER && numberType[0] !== T.SCIENTIFIC)
                ) {
                  result[0] = 0;
                  position[0] -= count;
                  buffer.remove(position[0], count);
                  buffer.insertChar(position[0], 48);
                  ++position[0];
                } else if (scan.GetConvertMode()) {
                  const decimalPosition = token.indexOf(fromDecimal);
                  if (decimalPosition >= 0) {
                    if (toDecimal.isEmpty()) {
                      const separator = scan
                        .GetCurrentLanguageData()
                        .GetLangDecimalSep(scan.GetNewLnge());
                      try {
                        toDecimal.moveAssign(separator);
                      } finally {
                        separator.dispose();
                      }
                    }
                    if (!toDecimal.equals(fromDecimal)) {
                      const converted = token.replaceAt(
                        decimalPosition,
                        fromDecimal.getLength(),
                        toDecimal,
                      );
                      try {
                        position[0] -= count;
                        buffer.remove(position[0], count);
                        buffer.insert(position[0], converted);
                        position[0] += converted.getLength();
                      } finally {
                        converted.dispose();
                      }
                    }
                  }
                }
              } else {
                result[0] = 0;
                buffer.insertChar(position[0]++, 48);
              }
              if (index === 0) this["fLimit1"] = result[0];
              else this["fLimit2"] = result[0];
              if (position[0] < buffer.getLength() && buffer.charAt(position[0]) === 93)
                ++position[0];
              else {
                cancel = true;
                check[0] = position[0];
              }
            }
            oldPosition = position[0];
          } else if (lcl_SvNumberformat_IsBracketedPrefix(type)) {
            const original = new OUString(token),
              section = sections[index];
            if (!section) throw new Error("assert(nIndex < 4)");
            try {
              if (type === B.BRACKET_SYMBOLTYPE_COLOR) {
                if (section.GetColor() !== null) {
                  cancel = true;
                  check[0] = oldPosition;
                } else {
                  const color = scan.GetColor(token);
                  section.SetColor(color, token);
                  if (color === null) {
                    cancel = true;
                    check[0] = oldPosition;
                  }
                }
              } else if (
                type <= B.BRACKET_SYMBOLTYPE_NATNUM0 &&
                type >= B.BRACKET_SYMBOLTYPE_NATNUM19
              ) {
                if (section.GetNatNum().IsSet()) {
                  cancel = true;
                  check[0] = oldPosition;
                } else {
                  const params = new OUString();
                  try {
                    const space = token.indexOf(32);
                    if (space >= 0) {
                      const trimmedView = trim(token.subView(space + 1)),
                        trimmed = new OUString(trimmedView, trimmedView.length);
                      try {
                        params.moveAssign(trimmed);
                      } finally {
                        trimmed.dispose();
                      }
                    }
                    const number = -(type - B.BRACKET_SYMBOLTYPE_NATNUM0) & 255;
                    if (!params.isEmpty() && number !== 12) {
                      cancel = true;
                      check[0] = oldPosition;
                    } else {
                      const canonical = concatenate(literal("NatNum"), OUString.number(number));
                      try {
                        token.moveAssign(canonical);
                      } finally {
                        canonical.dispose();
                      }
                      section.SetNatNumNum(number, false);
                      if (number === 12) {
                        if (params.isEmpty()) {
                          const units = literal("cardinal"),
                            value = new OUString(units, units.length);
                          try {
                            params.moveAssign(value);
                          } finally {
                            value.dispose();
                          }
                        } else if (params.indexOf(literal("CURRENCY")) >= 0) {
                          const replaced = params.replaceAll(
                            literal("CURRENCY"),
                            scan.GetLoc().getCurrBankSymbol().subView(0),
                          );
                          try {
                            params.moveAssign(replaced);
                          } finally {
                            replaced.dispose();
                          }
                        }
                        section.SetNatNumParams(params);
                        const full = concatenate(token, literal(" "), params);
                        try {
                          token.moveAssign(full);
                        } finally {
                          full.dispose();
                        }
                      }
                    }
                  } finally {
                    params.dispose();
                  }
                }
              } else if (
                type <= B.BRACKET_SYMBOLTYPE_DBNUM1 &&
                type >= B.BRACKET_SYMBOLTYPE_DBNUM9
              ) {
                if (section.GetNatNum().IsSet()) {
                  cancel = true;
                  check[0] = oldPosition;
                } else {
                  const number = (1 - (type - B.BRACKET_SYMBOLTYPE_DBNUM1)) & 255,
                    canonical = concatenate(literal("DBNum"), Uint16Array.of(48 + number));
                  try {
                    token.moveAssign(canonical);
                  } finally {
                    canonical.dispose();
                  }
                  section.SetNatNumNum(number, true);
                }
              } else if (type === B.BRACKET_SYMBOLTYPE_LOCALE) {
                if (
                  section.GetNatNum().GetLang() !== LANGUAGE_DONTKNOW ||
                  buffer.charAt(position[0] - 1) !== 93
                ) {
                  cancel = true;
                  check[0] = oldPosition;
                } else {
                  const offset: [number] = [2],
                    temporary = ImpGetLocaleType(token.subView(0), offset);
                  if (temporary.meLanguage === LANGUAGE_DONTKNOW) {
                    cancel = true;
                    check[0] = oldPosition;
                  } else {
                    if (
                      index === 0 &&
                      (temporary.meLanguage === LANGUAGE_SYSTEM ||
                        SvNumberFormatter.IsLocaleInstalled(temporary.meLanguage))
                    ) {
                      locale.assign(temporary);
                      language[0] = temporary.meLanguage;
                      scan.SetNewLnge(language[0]);
                      if (temporary.isPlainLocale()) token.clear();
                      else {
                        const localeCode = temporary.generateCode();
                        try {
                          const full = concatenate(literal("$-"), localeCode);
                          try {
                            token.moveAssign(full);
                          } finally {
                            full.dispose();
                          }
                        } finally {
                          localeCode.dispose();
                        }
                      }
                    } else {
                      if (index === 0) locale.meLanguageWithoutLocaleData = temporary.meLanguage;
                      const localeCode = temporary.generateCode();
                      try {
                        const full = concatenate(literal("$-"), localeCode);
                        try {
                          token.moveAssign(full);
                        } finally {
                          full.dispose();
                        }
                      } finally {
                        localeCode.dispose();
                      }
                    }
                    section.SetNatNumLang(MsLangId.getRealLanguage(temporary.meLanguage));
                    if (original.getLength() > 6) {
                      const inserted = ImpObtainCalendarAndNumerals(
                        locale,
                        buffer,
                        position[0],
                        language,
                        temporary,
                      );
                      try {
                        calendar.moveAssign(inserted);
                      } finally {
                        inserted.dispose();
                      }
                    }
                  }
                }
              }
              if (!cancel) {
                if (token.equals(original)) oldPosition = position[0];
                else {
                  buffer.remove(oldPosition, position[0] - oldPosition);
                  if (!token.isEmpty()) {
                    const prefix = concatenate(literal("["), token, literal("]"));
                    try {
                      buffer.insert(oldPosition, prefix);
                    } finally {
                      prefix.dispose();
                    }
                    position[0] = oldPosition + token.getLength() + 2;
                    oldPosition = position[0];
                  } else position[0] = oldPosition;
                }
              }
            } finally {
              original.dispose();
            }
          }
        } while (!cancel && lcl_SvNumberformat_IsBracketedPrefix(type));
        if (!cancel) {
          if (type === B.BRACKET_SYMBOLTYPE_FORMAT) {
            if (index === 1 && this["eOp1"] === O.NUMBERFORMAT_OP_NO)
              this["eOp1"] = O.NUMBERFORMAT_OP_GT;
            else if (index === 2 && this["eOp2"] === O.NUMBERFORMAT_OP_NO)
              this["eOp2"] = O.NUMBERFORMAT_OP_LT;
            if (token.isEmpty()) {
              const section = sections[index];
              if (section) section.Info().eScannedType = T.EMPTY;
            } else {
              if (!calendar.isEmpty()) {
                const full = concatenate(calendar, token);
                try {
                  token.moveAssign(full);
                } finally {
                  full.dispose();
                }
              }
              let error = scan.ScanFormat(token);
              const count = scan.GetResultStringsCnt();
              if (count === 0 && error === 0) error = 1;
              if (error === 0) {
                let section = sections[index];
                if (!section) throw new Error("assert(nIndex < 4)");
                if (scan.GetNatNumModifier() && !section.GetNatNum().IsSet()) {
                  const full = concatenate(
                    literal("[NatNum"),
                    OUString.number(scan.GetNatNumModifier()),
                    literal("]"),
                    token,
                  );
                  try {
                    token.moveAssign(full);
                  } finally {
                    full.dispose();
                  }
                  section.SetNatNumNum(scan.GetNatNumModifier(), false);
                }
                const realLanguage = MsLangId.getRealLanguage(language[0]);
                if (
                  section.GetNatNum().GetNatNum() === 1 &&
                  realLanguage === LANGUAGE_THAI &&
                  section.GetNatNum().GetLang() === LANGUAGE_DONTKNOW
                ) {
                  const full = concatenate(
                    literal("[$-"),
                    OUString.number(realLanguage, 16).toAsciiUpperCase(),
                    literal("]"),
                    token,
                  );
                  try {
                    token.moveAssign(full);
                  } finally {
                    full.dispose();
                  }
                  section.SetNatNumLang(realLanguage);
                }
                buffer.remove(oldPosition, position[0] - oldPosition);
                buffer.insert(oldPosition, token);
                position[0] = oldPosition + token.getLength();
                if (position[0] < buffer.getLength()) {
                  buffer.insertChar(position[0], 59);
                  ++position[0];
                } else if (index > 0 && scan.GetScannedType() === T.TEXT) {
                  if (index === 1) this["eOp1"] = O.NUMBERFORMAT_OP_NO;
                  else if (index === 2) this["eOp2"] = O.NUMBERFORMAT_OP_NO;
                  index = 3;
                }
                section = sections[index];
                if (!section) throw new Error("assert(nIndex < 4)");
                section.Enlarge(count);
                scan.CopyInfo(section.Info(), count);
                if (index === 0)
                  this["eType"] =
                    section.GetNatNum().GetNatNum() === 12 &&
                    lcl_isNatNum12Currency(section.GetNatNum().GetParams().subView(0))
                      ? T.CURRENCY
                      : section.Info().eScannedType;
                else if (index === 3) section.Info().eScannedType = T.TEXT;
                else if (section.Info().eScannedType !== this["eType"]) this["eType"] = T.DEFINED;
              } else {
                check[0] = oldPosition + error;
                cancel = true;
              }
            }
          } else if (type === B.BRACKET_SYMBOLTYPE_ERROR) {
            check[0] = oldPosition;
            cancel = true;
          } else if (lcl_SvNumberformat_IsBracketedPrefix(type)) {
            check[0] = oldPosition + 1;
            cancel = true;
          }
        }
        if (cancel && !check[0]) check[0] = 1;
        if (!cancel) {
          const section = sections[index];
          if (
            section &&
            section.GetNatNum().IsSet() &&
            section.GetNatNum().GetLang() === LANGUAGE_DONTKNOW
          )
            section.SetNatNumLang(language[0]);
        }
        if (buffer.getLength() === position[0]) {
          if (index < 3 && code.charAt(code.getLength() - 1) === 59) {
            if (index === 0 && this["eOp1"] === O.NUMBERFORMAT_OP_NO)
              this["eOp1"] = O.NUMBERFORMAT_OP_GT;
            else if (index === 1 && this["eOp2"] === O.NUMBERFORMAT_OP_NO)
              this["eOp2"] = O.NUMBERFORMAT_OP_LT;
            const next = sections[index + 1];
            if (next) next.Info().eScannedType = T.EMPTY;
            if (buffer.charAt(position[0] - 1) !== 59) buffer.insertChar(position[0]++, 59);
          }
          if (
            index === 2 &&
            type === B.BRACKET_SYMBOLTYPE_FORMAT &&
            buffer.charAt(position[0] - 1) === 59
          ) {
            const last = sections[3];
            if (last) last.Info().eScannedType = T.TEXT;
          }
          cancel = true;
        }
        const section = sections[index];
        if (section?.GetNatNum().IsSet())
          section.SetNatNumDate(Boolean(section.Info().eScannedType & T.DATE));
      } finally {
        token.dispose();
        calendar.dispose();
      }
    }
    if (!check[0] && this.IsSubstituted()) {
      if (this.IsSystemTimeFormat()) {
        if ((this["eType"] & ~T.DEFINED) !== T.TIME)
          check[0] = Math.max(buffer.view().indexOf(93) + 1, 1);
      } else if (this.IsSystemLongDateFormat()) {
        if ((this["eType"] & ~T.DEFINED) !== T.DATE)
          check[0] = Math.max(buffer.view().indexOf(93) + 1, 1);
      } else throw new Error("assert(!unhandled substitute)");
    }
    if (condition && !check[0]) {
      let appendTo = -1,
        semicolon = false;
      const first = sections[0],
        current = sections[index];
      if (index === 1 && first?.GetCount() === 0 && buffer.charAt(buffer.getLength() - 1) !== 59)
        appendTo = 0;
      else if (
        index === 1 &&
        current?.GetCount() === 0 &&
        buffer.charAt(buffer.getLength() - 1) !== 59 &&
        first &&
        (first.GetCount() > 1 ||
          (first.GetCount() === 1 && first.Info().nTypeArray[0] !== K.GENERAL))
      ) {
        appendTo = index;
        semicolon = true;
      } else if (
        index === 2 &&
        current?.GetCount() === 0 &&
        buffer.charAt(buffer.getLength() - 1) !== 59 &&
        this["eOp2"] !== O.NUMBERFORMAT_OP_NO
      ) {
        appendTo = index;
        semicolon = true;
      }
      if (appendTo >= 0) {
        const addition = new OUString(scan.GetStandardName());
        try {
          if (!scan.ScanFormat(addition)) {
            const count = scan.GetResultStringsCnt(),
              section = sections[appendTo];
            if (count && section) {
              section.Enlarge(count);
              scan.CopyInfo(section.Info(), count);
              if (semicolon) {
                const full = concatenate(literal(";"), addition);
                try {
                  buffer.append(full);
                } finally {
                  full.dispose();
                }
              } else buffer.append(addition);
            }
          }
        } finally {
          addition.dispose();
        }
      }
    }
    const normalized = buffer.makeStringAndClear();
    try {
      code.moveAssign(normalized);
    } finally {
      normalized.dispose();
    }
    this["sFormatstring"].assign(code);
    if (
      sections[2]?.GetCount() === 0 &&
      this["eOp1"] === O.NUMBERFORMAT_OP_GT &&
      this["eOp2"] === O.NUMBERFORMAT_OP_NO &&
      this["fLimit1"] === 0 &&
      this["fLimit2"] === 0
    )
      this["eOp1"] = O.NUMBERFORMAT_OP_GE;
  } finally {
    toDecimal.dispose();
    fromDecimal.dispose();
    buffer.dispose();
  }
}
