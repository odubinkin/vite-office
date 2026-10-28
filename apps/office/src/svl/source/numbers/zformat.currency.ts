/** @fileoverview Original automatic-currency delimiter removal used by builtin format insertion in zforlist.cxx. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { GetQuoteEnd } from "./zformat.quotes";
/** Original StripNewCurrencyDelimiters, including quote handling and the missing closing-bracket fallback. @param value - Native format code. @returns Owned stripped code. */
export function StripNewCurrencyDelimiters(value: OUStringConstReference): OUString {
  const result = new OUStringBuffer(value.getLength()),
    length = value.getLength();
  let start = 0,
    position: number;
  try {
    while ((position = value.indexOf(Uint16Array.of(91, 36), start)) >= 0) {
      let end = GetQuoteEnd(value, position);
      if (end >= 0) {
        ++end;
        result.append(value.subView(start, end - start));
        start = end;
      } else {
        result.append(value.subView(start, position - start));
        start = position + 2;
        let dash: number;
        end = start - 1;
        do {
          dash = value.indexOf(45, ++end);
          end = GetQuoteEnd(value, dash);
        } while (end >= 0);
        let close: number;
        end = start - 1;
        do {
          close = value.indexOf(93, ++end);
          end = GetQuoteEnd(value, close);
        } while (end >= 0);
        if (close < 0) close = length;
        position = close;
        if (dash >= 0 && dash < close) position = dash;
        result.append(value.subView(start, position - start));
        start = close + 1;
      }
    }
    if (length > start) result.append(value.subView(start, length - start));
    return result.makeStringAndClear();
  } finally {
    result.dispose();
  }
}
