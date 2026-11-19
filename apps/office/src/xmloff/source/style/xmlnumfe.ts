/** @fileoverview XML number-style output from the native compiled number formatter. */
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

/** Exports supported single-section styles using the real format behind substituted system entries. @param formatter - Workbook formatter. @param key - Assigned format key. @param name - Generated style reference. @returns ODF data style or null. */
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
    return `<number:boolean-style style:name="${name}"><number:boolean/></number:boolean-style>`;
  if (entry.GetNumForString(1, 0) || entry.GetNumForString(2, 0) || entry.GetNumForString(3, 0))
    return null;
  const type = entry.GetType() & ~T.DEFINED;
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
              : type === T.NUMBER || type === T.SCIENTIFIC
                ? "number-style"
                : null;
  if (!tag) return null;
  const parts: string[] = [];
  const fields = new Set<string>();
  const embedded: { value: string; position: number; integer: boolean }[] = [];
  let lastDigit = -1;
  for (let pos = 0, symbol: number; (symbol = entry.GetNumForType(0, pos)) !== 0; ++pos) {
    if (symbol === S.EXP) break;
    if (symbol === S.DIGIT) lastDigit = pos;
  }
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
    const raw = entry.GetNumForString(0, pos);
    if (!raw) break;
    const symbol = entry.GetNumForType(0, pos);
    const value = text(raw);
    const term = dateTerms.get(symbol);
    if (term) {
      const [element, long, named] = term;
      fields.add(element);
      parts.push(
        `<number:${element} number:style="${long ? "long" : "short"}"${named ? ' number:textual="true"' : ""}/>`,
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
      if (entry.GetNumForType(0, pos + 1) !== S.DIGIT) return null;
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
    } else if (symbol === S.DEL && value === "@") parts.push("<number:text-content/>");
    else if (symbol === S.CURRENCY)
      parts.push(`<number:currency-symbol>${escapeXml(value)}</number:currency-symbol>`);
    else if (symbol !== S.CURRDEL && symbol !== S.CURREXT) return null;
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
  if (parts.length === 0) return null;
  const longDate = fields.has("day-of-week");
  const systemDate =
    type === T.DATE &&
    builtin === (longDate ? N.NF_DATE_SYSTEM_LONG : N.NF_DATE_SYSTEM_SHORT) &&
    fields.has("day") &&
    fields.has("month") &&
    fields.has("year") &&
    fields.size === (longDate ? 4 : 3);
  const source = systemDate ? ' number:automatic-order="true" number:format-source="language"' : "";
  return `<number:${tag} style:name="${name}"${source}>${parts.join("")}</number:${tag}>`;
}
