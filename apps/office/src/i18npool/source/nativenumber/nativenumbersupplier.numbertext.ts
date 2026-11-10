/** @fileoverview Original NatNum12 prefix scan, separator/result caches and real process-context NumberText constructor call. Application context/manager installation remains an enclosing bootstrap responsibility. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import type { XNumberText } from "../../../offapi/com/sun/star/linguistic2/XNumberText";
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { NumberText } from "../../../offapi/com/sun/star/linguistic2/NumberText";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getLocaleDecimalSeparator, getLocaleThousandSeparator } from "../localedata/localedata";
import { isNumber } from "./nativenumbersupplier.text";
/** Original two UTF16 separator fields cached for each exact Locale key. */
interface Separators {
  DecimalSeparator: number;
  ThousandSeparator: number;
}
const aLocaleSeparatorsBuf = new Map<string, Separators>();
const aBuff = new Map<string, Map<string, OUString>>();
let xNumberText: Reference<XNumberText> | undefined;
/** Original source-local separator cache, keyed by the uncanonicalized static Locale-to-BCP47 conversion. @param locale - Actual requested Locale. @param loc - Original BCP47 key. @returns Borrowed immutable separator pair. */
function getLocaleSeparators(locale: LocaleConstReference, loc: string): Separators {
  let result = aLocaleSeparatorsBuf.get(loc);
  if (result === undefined) {
    result = {
      DecimalSeparator: getLocaleDecimalSeparator(locale).charCodeAt(0) || 0,
      ThousandSeparator: getLocaleThousandSeparator(locale).charCodeAt(0) || 0,
    };
    aLocaleSeparatorsBuf.set(loc, result);
  }
  return result;
}
/** Original number-text member group, preserving count-zero/full-input selection and suffix reattachment. @param locale - Actual target Locale. @param input - Complete original text. @param params - Original modifier view. @returns Owned output string. */
export function getNumberText(
  locale: LocaleConstReference,
  input: OUStringConstReference,
  params: OUStringConstReference,
): OUString {
  const aLoc = LanguageTag.convertToBcp47(locale);
  try {
    const separators = getLocaleSeparators(locale, text(aLoc));
    const len = input.getLength(),
      src = input.getStr();
    const buffer = new OUStringBuffer(len);
    try {
      let i = 0,
        count = 0;
      for (; i < len; i++) {
        const ch = src[i] as number;
        if (isNumber(ch) || ch === separators.DecimalSeparator) {
          count++;
          buffer.append(src.subarray(i, i + 1));
        } else if (ch === separators.ThousandSeparator && count > 0) continue;
        else if (ch === 45 && count === 0) buffer.append(src.subarray(i, i + 1));
        else break;
      }
      const number = count === 0 ? new OUString(input) : buffer.makeStringAndClear();
      try {
        if (xNumberText === undefined)
          // The cached object is the actual Reference owner; this cast erases only C++ const at the generated [in] binding, which does not mutate the borrowed context.
          xNumberText = NumberText.create(
            getProcessComponentContext() as Reference<XComponentContext>,
          );
        const modifiers = text(params),
          prefix = modifiers.length !== 0 && modifiers !== "cardinal" ? modifiers + " " : "";
        const key = text(number);
        let items = aBuff.get(key);
        if (items === undefined) {
          items = new Map();
          aBuff.set(key, items);
        }
        const itemKey = prefix + text(aLoc);
        let item = items.get(itemKey);
        if (item === undefined) {
          item = new OUString();
          items.set(itemKey, item);
        }
        if (item.getLength() === 0) {
          const request = unicode(prefix + key);
          try {
            const converted = (xNumberText.get() as XNumberText).getNumberText(request, locale);
            try {
              item.assign(converted);
            } finally {
              converted.dispose();
            }
            if (item.getLength() === 0) item.assign(number);
          } finally {
            request.dispose();
          }
        }
        const result = new OUString(item);
        try {
          if (i !== 0 && i < len) result.append(src.subarray(i, len));
          return result;
        } catch (error) {
          result.dispose();
          throw error;
        }
      } finally {
        number.dispose();
      }
    } finally {
      buffer.dispose();
    }
  } finally {
    aLoc.dispose();
  }
}
