/** @fileoverview XML number-style output from the native compiled number formatter. */
import { LanguageTag } from "../../../i18nlangtag/source/languagetag/languagetag.value";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NfKeywordIndex as K } from "../../../svl/inc/nfkeytab";
import { NfSymbolType as S } from "../../../svl/inc/nfsymbol";
import { NfIndexTableOffset as N, SvNumFormatType as T } from "../../../svl/inc/zforlist";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist.formatter";
import {
  convertLanguageToLocale,
  getRealLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";
import { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import type { SvNumberformatConstReference } from "../../../svl/source/numbers/zformat";
import { SvNumberformatLimitOps as O } from "../../../svl/source/numbers/zformat.prefix";
import { Converter } from "../../../sax/source/tools/converter";
import { doubleToString } from "../../../sal/rtl/strtmpl.math";
import { escapeXml } from "../text/txtparae";

const dateTerms = new Map<number, readonly [string, boolean, boolean?]>([
  [K.YY, ["year", false]],
  [K.YYYY, ["year", true]],
  [K.M, ["month", false]],
  [K.MM, ["month", true]],
  [K.MMM, ["month", false, true]],
  [K.MMMM, ["month", true, true]],
  [K.D, ["day", false]],
  [K.DD, ["day", true]],
  [K.DDD, ["day-of-week", false]],
  [K.DDDD, ["day-of-week", true]],
  [K.NN, ["day-of-week", false]],
  [K.NNN, ["day-of-week", true]],
  [K.NNNN, ["day-of-week", true]],
  [K.H, ["hours", false]],
  [K.HH, ["hours", true]],
  [K.MI, ["minutes", false]],
  [K.MMI, ["minutes", true]],
  [K.S, ["seconds", false]],
  [K.SS, ["seconds", true]],
]);

/** Writes the declared data format locale. @param language - Formatter locale identifier. @returns ODF language attributes. */
function numberStyleLocale(language: number): string {
  if (language === LANGUAGE_SYSTEM) return "";
  const tag = new LanguageTag(language);
  try {
    const locale = tag.getLocale();
    const code = text(locale.Language),
      country = text(locale.Country);
    return code
      ? ' number:language="' +
          escapeXml(code) +
          '"' +
          (country ? ' number:country="' + escapeXml(country) + '"' : "")
      : "";
  } finally {
    tag.dispose();
  }
}

/** Exports supported number-format sections using the real format behind substituted system entries. @param formatter - Workbook formatter. @param key - Assigned format key. @param name - Generated style reference. @returns ODF data style or null. */
export function ExportNumberFormat(
  formatter: SvNumberFormatter,
  key: number,
  name: string,
): string | null {
  const realKey: [number] = [key];
  const entry = formatter.GetSubstitutedEntry(key, realKey);
  if (!entry) return null;
  const builtin = SvNumberFormatter.GetIndexTableOffset(realKey[0]);
  if (builtin === N.NF_BOOLEAN)
    return `<number:boolean-style style:name="${name}"${numberStyleLocale(entry.GetLanguage())}><number:boolean/></number:boolean-style>`;
  const conditions = entry.GetConditions();
  const textPart = entry.HasTextFormat();
  const sections = [
    true,
    entry.GetNumForInfoScannedType(1) !== T.UNDEFINED || conditions[0][0] !== O.NUMBERFORMAT_OP_NO,
    entry.GetNumForInfoScannedType(2) !== T.UNDEFINED || conditions[1][0] !== O.NUMBERFORMAT_OP_NO,
    textPart,
  ];
  const last = sections.lastIndexOf(true);
  const maps = writeMaps(conditions, textPart, name);
  const result: string[] = [];
  for (let part = 0; part <= last; ++part) {
    if (!sections[part]) continue;
    const style = exportPart(entry, builtin, part, name, part === last, maps);
    if (style === null) return null;
    result.push(style);
  }
  return result.join("");
}

const conditionOperators = ["", "=", "!=", "<", "<=", ">", ">="] as const;
const inverseOperators = ["<=", "!=", "=", ">=", ">", "<=", "<"] as const;

/** Emits native ordered maps, including the complementary map when text owns the fallback. @param conditions - Scanned operators and limits. @param textPart - Whether the last part handles text. @param name - Main style identifier. @returns XML maps. */
function writeMaps(
  conditions: ReturnType<SvNumberformatConstReference["GetConditions"]>,
  textPart: boolean,
  name: string,
): string {
  const [[first, firstLimit], [second, secondLimit]] = conditions;
  const maps: string[] = [];
  /** Appends one represented condition in original section order. @param operator - ODF operator. @param limit - Condition limit. @param part - Target section. @returns Nothing. */
  function add(operator: string | undefined, limit: number, part: number): void {
    if (operator)
      maps.push(
        `<style:map style:condition="${escapeXml("value()" + operator + doubleToString(limit))}" style:apply-style-name="${escapeXml(name)}P${part}"/>`,
      );
  }
  add(conditionOperators[first], firstLimit, 0);
  add(conditionOperators[second], secondLimit, 1);
  if (textPart) {
    const last = second !== O.NUMBERFORMAT_OP_NO ? 2 : first !== O.NUMBERFORMAT_OP_NO ? 1 : 0;
    const lastOperator = last === 2 ? second : first;
    const lastLimit = last === 2 ? secondLimit : last === 1 ? firstLimit : Number.MAX_VALUE;
    const opposite =
      firstLimit === secondLimit &&
      ((first === O.NUMBERFORMAT_OP_LT && second === O.NUMBERFORMAT_OP_GT) ||
        (first === O.NUMBERFORMAT_OP_GT && second === O.NUMBERFORMAT_OP_LT));
    add(opposite ? "=" : inverseOperators[lastOperator], lastLimit, last);
  }
  return maps.join("");
}

/** Builds the native ODF fraction attributes from compiled numerator and denominator.
 * @param entry - Actual compiled format.
 * @param part - Subformat.
 * @param integer - Integer placeholders before the fraction separator.
 * @param grouped - Whether the integer has thousands grouping.
 * @returns ODF fraction element.
 */
function writeFraction(
  entry: SvNumberformatConstReference,
  part: number,
  integer: string | undefined,
  grouped: boolean,
): string {
  const numerator = entry.GetNumeratorString(part);
  const denominator = entry.GetDenominatorString(part);
  try {
    const divisor = text(denominator);
    const numeratorDigits = text(numerator);
    const integerDigits = integer?.replaceAll("#", "").length ?? 0;
    const blanks = integer?.replace(/[^?]/g, "").length ?? 0;
    const delimiter = entry.GetIntegerFractionDelimiterString(part);
    const zerosNumerator = numeratorDigits.replace(/[^0]/g, "").length;
    const zerosDenominator = divisor.replace(/[^0]/g, "").length;
    let attributes = "";
    if (integer !== undefined) attributes += ' number:min-integer-digits="' + integerDigits + '"';
    if (blanks) attributes += ' loext:max-blank-integer-digits="' + blanks + '"';
    if (grouped) attributes += ' number:grouping="true"';
    if (delimiter && delimiter !== " ")
      attributes += ' loext:integer-fraction-delimiter="' + escapeXml(delimiter) + '"';
    attributes +=
      ' number:min-numerator-digits="' +
      Math.max(1, numeratorDigits.replaceAll("#", "").length) +
      '"';
    attributes += ' loext:max-numerator-digits="' + numeratorDigits.length + '"';
    if (zerosNumerator) attributes += ' loext:zeros-numerator-digits="' + zerosNumerator + '"';
    const fixed = Number.parseInt(divisor, 10);
    if (fixed > 0) attributes += ' number:denominator-value="' + fixed + '"';
    else {
      attributes +=
        ' number:min-denominator-digits="' + Math.max(1, divisor.replaceAll("#", "").length) + '"';
      attributes += ' number:max-denominator-value="' + "9".repeat(divisor.length) + '"';
      if (zerosDenominator)
        attributes += ' loext:zeros-denominator-digits="' + zerosDenominator + '"';
    }
    return "<number:fraction" + attributes + "/>";
  } finally {
    numerator.dispose();
    denominator.dispose();
  }
}

/** Emits one native part under its generated primary or volatile style name. @param entry - Actual compiled number format. @param builtin - Original format index. @param part - Section index. @param name - Main style identifier. @param defaultPart - Whether this is the last section. @param maps - Conditions on the last section. @returns XML or null for unsupported tokens. */
function exportPart(
  entry: SvNumberformatConstReference,
  builtin: number,
  part: number,
  name: string,
  defaultPart: boolean,
  maps: string,
): string | null {
  const type = entry.GetNumForInfoScannedType(part) & ~T.DEFINED;
  const tag =
    type === T.PERCENT
      ? "percentage-style"
      : type === T.DATE || type === T.DATETIME
        ? "date-style"
        : type === T.TIME
          ? "time-style"
          : type === T.CURRENCY
            ? "currency-style"
            : type === T.TEXT
              ? "text-style"
              : type === T.NUMBER ||
                  type === T.SCIENTIFIC ||
                  type === T.FRACTION ||
                  type === T.EMPTY ||
                  type === T.ALL ||
                  type === T.UNDEFINED
                ? "number-style"
                : null;
  if (!tag) return null;
  const parts: string[] = [];
  const fields = new Set<string>();
  const embedded: { value: string; position: number; integer: boolean }[] = [];
  let lastDigit = -1;
  for (let pos = 0, symbol: number; (symbol = entry.GetNumForType(part, pos)) !== 0; ++pos) {
    if (symbol === S.EXP) break;
    if (symbol === S.DIGIT) lastDigit = pos;
  }
  const time = type === T.TIME || type === T.DATETIME;
  let fractionAt = -1;
  let integer = "";
  let hasFractionInteger = false;
  let numberAt = -1,
    grouping = false,
    beforeDecimal = true,
    required = 0,
    integerDigits = 0,
    digits = 0,
    decimals = 0,
    exponentDigits = 0;
  let exponent: string | undefined;
  for (let pos = 0; ; ++pos) {
    const raw = entry.GetNumForString(part, pos);
    if (!raw) break;
    const symbol = entry.GetNumForType(part, pos);
    const value = text(raw);
    if (type === T.FRACTION) {
      if (symbol === S.DIGIT) {
        if (fractionAt < 0) fractionAt = parts.push("") - 1;
        if (!hasFractionInteger) integer += value;
        continue;
      }
      if (symbol === S.THSEP || symbol === S.FRAC_FDIV || symbol === S.FRAC) continue;
      if (symbol === S.FRACBLANK) {
        hasFractionInteger = true;
        continue;
      }
    }
    const term = dateTerms.get(symbol);
    if (term) {
      const [element, long, named] = term;
      fields.add(element);
      const precision = element === "seconds" ? entry.GetFormatPrecision(part) : 0;
      const fractional = precision > 0 ? ' number:decimal-places="' + precision + '"' : "";
      parts.push(
        `<number:${element} number:style="${long ? "long" : "short"}"${named ? ' number:textual="true"' : ""}${fractional}/>`,
      );
      if (symbol === K.NNNN) {
        const locale = convertLanguageToLocale(getRealLanguage(entry.GetLanguage()), false);
        const data = new LocaleDataWrapper(locale);
        try {
          parts.push(
            `<number:text>${escapeXml(text(data.getLongDateDayOfWeekSep()))}</number:text>`,
          );
        } finally {
          data.dispose();
          locale.dispose();
        }
      }
    } else if (symbol === K.AMPM) parts.push("<number:am-pm/>");
    else if (symbol === K.GENERAL) parts.push('<number:number number:min-integer-digits="1"/>');
    else if (symbol === S.DIGIT) {
      if (time) continue;
      if (!/^[#0]+$/.test(value)) return null;
      if (numberAt < 0) numberAt = parts.push("") - 1;
      if (numberAt !== parts.length - 1) return null;
      if (exponent) exponentDigits += value.length;
      else if (beforeDecimal) {
        integerDigits += value.length;
        required += value.replace(/#/g, "").length;
      } else {
        digits += value.length;
        decimals += value.replace(/#/g, "").length;
      }
    } else if (symbol === S.THSEP) {
      if (entry.GetNumForType(part, pos + 1) !== S.DIGIT) return null;
      grouping = true;
    } else if (symbol === S.DECSEP) beforeDecimal = false;
    else if (symbol === S.EXP) exponent = value;
    else if (
      symbol === S.STRING ||
      symbol === S.PERCENT ||
      symbol === S.DATESEP ||
      symbol === S.TIMESEP
    ) {
      if (symbol === S.STRING && numberAt >= 0 && pos < lastDigit)
        embedded.push({
          value,
          position: beforeDecimal ? integerDigits : digits,
          integer: beforeDecimal,
        });
      else parts.push(`<number:text>${escapeXml(value)}</number:text>`);
    } else if (
      time &&
      (symbol === S.TIME100SECSEP || (symbol === S.DEL && (value === "[" || value === "]")))
    ) {
      continue;
    } else if (symbol === S.DEL && value === "@") parts.push("<number:text-content/>");
    else if (symbol === S.CURRENCY) {
      const extension =
        entry.GetNumForType(part, pos + 1) === S.CURREXT
          ? entry.GetNumForString(part, pos + 1)
          : null;
      const language = extension
        ? Math.abs(Number.parseInt(text(extension), 16)) & 0xffff
        : LANGUAGE_SYSTEM;
      parts.push(
        `<number:currency-symbol${numberStyleLocale(language)}>${escapeXml(value)}</number:currency-symbol>`,
      );
    } else if (symbol !== S.CURRDEL && symbol !== S.CURREXT) return null;
  }
  if (fractionAt >= 0) {
    parts[fractionAt] = writeFraction(
      entry,
      part,
      hasFractionInteger ? integer : undefined,
      entry.GetFormatSpecialInfo(part).grouped,
    );
  }
  if (numberAt >= 0) {
    const element = exponent ? "scientific-number" : "number";
    const scientific = exponent
      ? ` number:min-exponent-digits="${exponentDigits}" number:exponent-interval="${integerDigits}" number:forced-exponent-sign="${exponent.includes("+")}"`
      : "";
    const body = embedded
      .map(
        /** Emits literal text at its source position relative to the decimal point. @param item - Embedded token. @returns ODF element. */
        (item) =>
          `<number:embedded-text number:position="${item.integer ? integerDigits - item.position : -item.position}">${escapeXml(item.value)}</number:embedded-text>`,
      )
      .join("");
    parts[numberAt] =
      `<number:${element} number:min-integer-digits="${required}" number:decimal-places="${digits}"${digits !== decimals ? ` number:min-decimal-places="${decimals}"` : ""}${grouping ? ' number:grouping="true"' : ""}${scientific}${body ? `>${body}</number:${element}>` : "/>"}`;
  }
  if (parts.length === 0) parts.push("<number:text/>");
  const longDate = fields.has("day-of-week");
  const systemDate =
    part === 0 &&
    type === T.DATE &&
    builtin === (longDate ? N.NF_DATE_SYSTEM_LONG : N.NF_DATE_SYSTEM_SHORT) &&
    fields.has("day") &&
    fields.has("month") &&
    fields.has("year") &&
    fields.size === (longDate ? 4 : 3);
  const source = systemDate ? ' number:automatic-order="true" number:format-source="language"' : "";
  const color = entry.GetColor(part);
  const rgb: [string] = [""];
  if (color) Converter.convertColor(rgb, color.toUInt32());
  const properties = color ? `<style:text-properties fo:color="${rgb[0]}"/>` : "";
  const styleName = escapeXml(defaultPart ? name : `${name}P${part}`);
  const flags = defaultPart ? "" : ' style:volatile="true"';
  const overflow =
    type === T.TIME && entry.GetFormatSpecialInfo(part).grouped
      ? ' number:truncate-on-overflow="false"'
      : "";
  return `<number:${tag} style:name="${styleName}"${flags}${source}${overflow}${numberStyleLocale(entry.GetLanguage())}>${properties}${parts.join("")}${defaultPart ? maps : ""}</number:${tag}>`;
}
