/** @fileoverview Automatic-currency caller exclusions and original malformed-code preconditions. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumberFormatter, SvNFFormatData } from "./zforlist";
import { NumberFormatCode } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { SvNumberformat } from "./zformat";
it("retains explicit currency delimiters for the excluded bank-code builtin", /** Same input with different original builtin indices exercises the caller's exemption. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    code = new NumberFormatCode(),
    pattern = unicode("[$$-409]0.00"),
    table = new SvNFFormatData(),
    scanner = formatter["m_aCurrentLanguage"].GetFormatScanner();
  try {
    code.Code = pattern;
    code.Usage = 8;
    code.Index = 13;
    const automatic = table.ImpInsertFormat(scanner, [0x409], code, 21);
    expect(automatic).not.toBeNull();
    expect(text((automatic as SvNumberformat).GetFormatstring())).toBe("$0.00");
    code.Index = 16;
    const explicit = table.ImpInsertFormat(scanner, [0x409], code, 24);
    expect(explicit).not.toBeNull();
    expect(text((explicit as SvNumberformat).GetFormatstring())).toBe("[$$-409]0.00");
    expect(text(code.Code)).toBe("[$$-409]0.00");
  } finally {
    pattern.dispose();
    code.dispose();
    table.dispose();
    formatter.dispose();
  }
});
it("preserves the checked search-length failure after an unclosed currency delimiter", /** Source missing-bracket fallback advances past the input and violates the next bounded search precondition. @returns Nothing. */ () => {
  const value = unicode("[$USD-409");
  try {
    expect(
      /** Calls the original helper on malformed code. @returns Owned result or native guard. */ () =>
        SvNumberformat.StripNewCurrencyDelimiters(value),
    ).toThrow(/assert\(nStrLen >= 0/);
  } finally {
    value.dispose();
  }
});
