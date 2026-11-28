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
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import {
  SvNumberformat,
  type SvNumberformatConstReference,
} from "../../../svl/source/numbers/zformat";
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

/** Exports supported number-format sections using the real format behind substituted system entries. @param formatter - Workbook formatter. @param key - Assigned format key. @param name - Generated style reference. @param systemLanguage - Whether to omit explicit locale attributes. @returns ODF data style or null. */
export function ExportNumberFormat(
  formatter: SvNumberFormatter,
  key: number,
  name: string,
  systemLanguage = false,
): string | null {
  const realKey: [number] = [key];
  const entry = formatter.GetSubstitutedEntry(key, realKey);
  if (!entry) return null;
  const builtin = SvNumberFormatter.GetIndexTableOffset(realKey[0]);
  if (builtin === N.NF_BOOLEAN)
    return `<number:boolean-style style:name="${name}"${systemLanguage ? "" : numberStyleLocale(entry.GetLanguage())}><number:boolean/></number:boolean-style>`;
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
    const style = exportPart(entry, builtin, part, name, part === last, maps, systemLanguage);
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

/** Collects native text and fixed-width compatibility spaces before serializing one ODF element. */
class NumberText {
  private content = "";
  private blankWidths = "";

  /** Appends a literal or the source compatibility width of an underscore token. @param value - Literal or blank character. @param width - Whether value is a blank width control. @returns Nothing. */
  public Add(value: string, width = false): void {
    if (!width) {
      this.content += value;
      return;
    }
    this.blankWidths +=
      (this.blankWidths ? "_" : "") +
      value +
      (this.content.length || this.blankWidths ? String(this.content.length) : "");
    const spaces = new OUStringBuffer();
    try {
      this.content += " ".repeat(
        Math.max(0, SvNumberformat.InsertBlanks(spaces, 0, value.charCodeAt(0))),
      );
    } finally {
      spaces.dispose();
    }
  }

  /** Serializes the accumulated literal and its native blank-width encoding. @param position - Optional original embedded-text position. @returns ODF element or an empty string. */
  public Finish(position?: number): string {
    if (!this.content) return "";
    const localName = position === undefined ? "text" : "embedded-text";
    const location = position === undefined ? "" : ` number:position="${position}"`;
    const widths = this.blankWidths
      ? ` loext:blank-width-char="${escapeXml(this.blankWidths)}"`
      : "";
    const output = `<number:${localName}${location}${widths}>${escapeXml(this.content)}</number:${localName}>`;
    this.content = "";
    this.blankWidths = "";
    return output;
  }
}

/** Collects positioned literals and blank widths from the native integer, mantissa and exponent token stream. @param entry - Original compiled number format. @param part - Format section. @returns Consumed source literals, XML fragments and exponent-tail placement. */
function collectEmbeddedEntries(entry: SvNumberformatConstReference, part: number) {
  const entries = new Map<number, NumberText>();
  const skip = new Set<number>();
  let integer = 0;
  let total = 0;
  let fraction = false;
  for (let index = 0; ; ++index) {
    const token = entry.GetNumForString(part, index);
    if (!token) break;
    const kind = entry.GetNumForType(part, index);
    if (kind === S.DECSEP || kind === S.EXP) {
      ++total;
      fraction = true;
    } else if (kind === S.DIGIT) {
      const length = token.getLength();
      total += length;
      if (!fraction) integer += length;
    }
  }
  let passed = 0;
  let inExponent = false;
  let exponentText = false;
  for (let index = 0; ; ++index) {
    const token = entry.GetNumForString(part, index);
    if (!token) break;
    const kind = entry.GetNumForType(part, index);
    if (kind === S.EXP) inExponent = true;
    if (kind === S.EXP || kind === S.DECSEP) ++passed;
    else if (kind === S.DIGIT) passed += token.getLength();
    else if (
      passed > 0 &&
      passed < total &&
      (kind === S.BLANK || kind === S.STRING || kind === S.PERCENT)
    ) {
      const value = text(token);
      if (kind === S.BLANK && value.length < 2) continue;
      const position = integer - passed;
      const group = entries.get(position) ?? new NumberText();
      group.Add(kind === S.BLANK ? value.charAt(1) : value, kind === S.BLANK);
      entries.set(position, group);
      skip.add(index);
      exponentText ||= inExponent;
    }
  }
  let xml = "";
  for (const [position, group] of entries) xml += group.Finish(position);
  return { skip, xml, exponentText };
}

/** Emits one native part under its generated primary or volatile style name. @param entry - Actual compiled number format. @param builtin - Original format index. @param part - Section index. @param name - Main style identifier. @param defaultPart - Whether this is the last section. @param maps - Conditions on the last section. @param systemLanguage - Whether to omit explicit locale attributes. @returns XML or null for unsupported tokens. */
function exportPart(
  entry: SvNumberformatConstReference,
  builtin: number,
  part: number,
  name: string,
  defaultPart: boolean,
  maps: string,
  systemLanguage: boolean,
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
  const supportsEmbedded =
    type === T.ALL ||
    type === T.NUMBER ||
    type === T.CURRENCY ||
    type === T.SCIENTIFIC ||
    type === T.PERCENT;
  const embedded = supportsEmbedded ? collectEmbeddedEntries(entry, part) : undefined;
  const literal = new NumberText();
  /** Flushes the current original literal text group before other elements. @returns Nothing. */
  function flushText(): void {
    const value = literal.Finish();
    if (value) parts.push(value);
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
    blankInteger = 0,
    blankExponent = 0,
    exponentDigits = 0;
  let decimalReplacement = "";
  let exponent: string | undefined;
  for (let pos = 0; ; ++pos) {
    const raw = entry.GetNumForString(part, pos);
    if (!raw) break;
    const symbol = entry.GetNumForType(part, pos);
    if (embedded?.skip.has(pos)) continue;
    const value = text(raw);
    if (
      symbol === S.STRING ||
      symbol === S.PERCENT ||
      symbol === S.DATESEP ||
      symbol === S.TIMESEP
    ) {
      literal.Add(value);
      continue;
    }
    if (symbol === S.BLANK) {
      if (value.length === 2) literal.Add(value.charAt(1), true);
      continue;
    }
    if (symbol !== S.THSEP && symbol !== S.DECSEP && symbol !== S.EXP) flushText();
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
      if (!/^[#0?-]+$/.test(value)) return null;
      if (numberAt < 0) numberAt = parts.push("") - 1;
      if (numberAt !== parts.length - 1) return null;
      if (exponent) {
        exponentDigits += value.length;
        blankExponent += value.replace(/[^?]/g, "").length;
      } else if (beforeDecimal) {
        integerDigits += value.length;
        required += value.replace(/#/g, "").length;
        blankInteger += value.replace(/[^?]/g, "").length;
      } else {
        digits += value.length;
        decimals += value.replace(/[^0]/g, "").length;
        if (value.includes("-")) decimalReplacement = "-";
        else if (value.includes("?") && decimalReplacement === "") decimalReplacement = " ";
      }
    } else if (symbol === S.THSEP) {
      if (entry.GetNumForType(part, pos + 1) !== S.DIGIT) return null;
      grouping = true;
    } else if (symbol === S.DECSEP) beforeDecimal = false;
    else if (symbol === S.EXP) exponent = value;
    else if (
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
  flushText();
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
      ? ` number:min-exponent-digits="${exponentDigits}" number:exponent-interval="${integerDigits}" number:forced-exponent-sign="${exponent.includes("+") || embedded?.exponentText === true}"` +
        (exponent.startsWith("e") ? ' loext:exponent-lowercase="true"' : "") +
        (blankExponent > 0
          ? ` loext:blank-exponent-digits="${Math.max(0, Math.min(blankExponent, exponentDigits - 1))}"`
          : "")
      : "";
    const replacement =
      !exponent && (decimalReplacement || digits !== decimals)
        ? ` number:decimal-replacement="${decimalReplacement}"`
        : "";
    const blank = blankInteger ? ` loext:max-blank-integer-digits="${blankInteger}"` : "";
    const body = embedded?.xml;
    parts[numberAt] =
      `<number:${element} number:min-integer-digits="${required}"${blank} number:decimal-places="${digits}"${digits !== decimals ? ` number:min-decimal-places="${decimals}"` : ""}${replacement}${grouping ? ' number:grouping="true"' : ""}${scientific}${body ? `>${body}</number:${element}>` : "/>"}`;
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
  const comment = text(entry.GetComment());
  const title =
    defaultPart && (entry.GetType() & T.DEFINED) !== 0 && comment
      ? ` number:title="${escapeXml(comment)}"`
      : "";
  return `<number:${tag} style:name="${styleName}"${flags}${source}${overflow}${systemLanguage ? "" : numberStyleLocale(entry.GetLanguage())}${title}>${properties}${parts.join("")}${defaultPart ? maps : ""}</number:${tag}>`;
}
