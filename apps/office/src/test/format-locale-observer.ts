/** @fileoverview Observes actual compiled-format locale value owners through the original scalar-context native witness protocol. */
import { LocaleType, ImpGetLocaleType } from "../svl/source/numbers/zformat.locale";
import { ImpObtainCalendarAndNumerals } from "../svl/source/numbers/zformat.locale-calendar";
import { OUString, type OUStringConstReference } from "../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../sal/inc/rtl/ustrbuf";
/** Encodes original counted UTF16 units. @param value - Source owner/view. @returns Native protocol text. */
function hex(value: Pick<OUStringConstReference, "getLength" | "getStr">): string {
  let result = "";
  for (let index = 0; index < value.getLength(); ++index)
    result += (value.getStr()[index] as number).toString(16).padStart(4, "0");
  return result || "-";
}
/** Decodes a complete native input without normalization. @param text - Native protocol text. @returns Actual SAL owner. */
function decode(text: string): OUString {
  const units = new Uint16Array(text === "-" ? 0 : text.length / 4);
  for (let index = 0; index < units.length; ++index)
    units[index] = Number.parseInt(text.slice(index * 4, index * 4 + 4), 16);
  return new OUString(units, units.length);
}
/** Reads actual source metadata and generated code. @param value - Actual value owner. @returns Complete native observation. */
function metadata(value: LocaleType): (number | string)[] {
  const code = value.generateCode();
  try {
    return [
      value.meLanguage,
      value.meLanguageWithoutLocaleData,
      value.meSubstitute,
      value.mnNumeralShape,
      value.mnCalendarType,
      Number(value.isPlainLocale()),
      hex(code),
    ];
  } finally {
    code.dispose();
  }
}
/** Executes only actual source methods on genuine value/string owners; inputs are original native metadata arguments. @param query - Native scalar query. @returns Local observation to compare with independently compiled output. */
export function observeFormatLocale(query: string): string {
  const [kind, a, b, c, d] = query.split(" ");
  if (kind === "L") {
    const value = new LocaleType(Number(a));
    value.meLanguageWithoutLocaleData = Number(b);
    return metadata(value).join(" ");
  }
  const value = decode((kind === "P" ? b : d) as string);
  try {
    if (kind === "P") {
      const position: [number] = [Number(a)],
        result = ImpGetLocaleType(value.subView(0), position);
      return [...metadata(result), position[0]].join(" ");
    }
    if (kind !== "C") throw new Error("Unsupported original locale witness command");
    const locale = new LocaleType(),
      target = new LocaleType(Number(b)),
      language: [number] = [Number(a)],
      buffer = new OUStringBuffer(value);
    locale.meLanguage = Number(a);
    try {
      const calendar = ImpObtainCalendarAndNumerals(locale, buffer, Number(c), language, target);
      try {
        return [locale.meLanguage, language[0], hex(calendar), hex(buffer)].join(" ");
      } finally {
        calendar.dispose();
      }
    } finally {
      buffer.dispose();
    }
  } finally {
    value.dispose();
  }
}
