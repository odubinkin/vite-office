/** @fileoverview Browser host Locale field preparation shared by system-language platform binding and live locale consumers. This is an explicit host adapter,not a native OS/RTL locale service. */
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Browser host-locale query replaces only the native system-locale configuration source. Raw browser language is retained even when Intl lacks that locale; Intl supplies the host default in non-DOM environments. @returns Actual prepared Locale value. */
export function getPlatformLocale(): Locale {
  const input = globalThis.navigator?.language || new Intl.NumberFormat().resolvedOptions().locale;
  const units = input.split("-");
  units[0] = (units[0] as string).toLowerCase();
  let index = 1;
  if (/^[a-z]{4}$/i.test(units[index] ?? "")) {
    const script = units[index] as string;
    units[index] = script.charAt(0).toUpperCase() + script.slice(1).toLowerCase();
    index += 1;
  }
  if (/^[a-z]{2}$/i.test(units[index] ?? "")) units[index] = (units[index] as string).toUpperCase();
  const tag = units.join("-");
  const parts = tag.split("-"),
    language = parts[0] as string;
  const simple = /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(tag);
  const region = simple
    ? (parts[1] ?? "")
    : (parts.find(
        /** Locates the source country field. @param part - Subtag. @returns Country flag. */ (
          part,
        ) => /^(?:[A-Z]{2}|[0-9]{3})$/.test(part),
      ) ?? "");
  const locale = new Locale(
    unicode(simple ? language : "qlt"),
    unicode(region),
    unicode(simple ? "" : tag),
  );
  return locale;
}

/** Existing known-length shared string constructor at the browser ASCII language-tag boundary. @param value - BCP47 ASCII text. @returns Actual shared string. */
function unicode(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value,
      /** Original ASCII-to-Unicode constructor input. @param unit - ASCII unit. @returns UTF16 unit. */ (
        unit,
      ) => unit.charCodeAt(0),
    ),
    value.length,
  );
}
