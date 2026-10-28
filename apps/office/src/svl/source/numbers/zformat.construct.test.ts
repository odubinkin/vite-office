/** @fileoverview Connected original constructor stages on actual formatter/scanner/subformat owners. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";
import { ImpSvNumberformatScan } from "./zforscan";
it.each(["0;@", "0;"])(
  "preserves inherited trailing text versus explicit empty subformat for %s",
  /** Native examples distinguish hidden negatives from an inherited trailing text section. @param source - Source pattern. @returns Nothing. */ (
    source,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
      code = unicode(source),
      check: [number] = [0];
    try {
      const format = new SvNumberformat(
        code,
        scanner,
        scanner.GetCurrentLanguageData().pStringScanner,
        formatter.GetNatNum(),
        check,
        [0x409],
      );
      try {
        expect(check[0]).toBe(0);
        expect(text(format.GetFormatstring())).toBe(source);
        expect(format.GetType()).toBe(T.NUMBER);
        if (source === "0;@") {
          expect(format["NumFor"][3]?.Info().eScannedType).toBe(T.TEXT);
          expect(format["eOp1"]).toBe(0);
          expect(format.HasTextFormat()).toBe(true);
        } else {
          expect(format["NumFor"][1]?.Info().eScannedType).toBe(T.EMPTY);
          expect(format["eOp1"]).toBe(6);
        }
      } finally {
        format.dispose();
      }
    } finally {
      code.dispose();
      formatter.dispose();
    }
  },
);
it("normalizes a real color prefix and owns the actual scanner palette pointer", /** The color modifier and numeric tokens belong to the same native subformat. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
    code = unicode("[red]0"),
    check: [number] = [0];
  try {
    const format = new SvNumberformat(
      code,
      scanner,
      scanner.GetCurrentLanguageData().pStringScanner,
      formatter.GetNatNum(),
      check,
      [0x409],
    );
    try {
      expect(check[0]).toBe(0);
      expect(text(code)).toBe("[RED]0");
      expect(format["NumFor"][0]?.GetColor()).toBe(ImpSvNumberformatScan.GetRedColor());
      expect(format["NumFor"][0]?.Info().eScannedType).toBe(T.NUMBER);
    } finally {
      format.dispose();
    }
  } finally {
    code.dispose();
    formatter.dispose();
  }
});
it("replaces the source NatNum12 currency argument through the actual bank-symbol field", /** Source currency-word recognition changes entry type while retaining the scanned numeric tokens. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
    code = unicode("[NatNum12 CURRENCY]0"),
    check: [number] = [0];
  try {
    const format = new SvNumberformat(
      code,
      scanner,
      scanner.GetCurrentLanguageData().pStringScanner,
      formatter.GetNatNum(),
      check,
      [0x409],
    );
    try {
      const section = format["NumFor"][0];
      if (!section) throw Error("Missing original subformat");
      expect(check[0]).toBe(0);
      expect(format.GetType()).toBe(T.CURRENCY);
      expect(section.GetNatNum().GetNatNum()).toBe(12);
      expect(text(section.GetNatNum().GetParams())).toBe(
        text(formatter.GetLocaleData().getCurrBankSymbol()),
      );
      expect(section.Info().eScannedType).toBe(T.NUMBER);
    } finally {
      format.dispose();
    }
  } finally {
    code.dispose();
    formatter.dispose();
  }
});
it("uses the actual input scanner for a condition and converts its decimal separator to the target language", /** Querying another decimal separator preserves the active locale until the original format scan switches it. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x407),
    current = formatter["m_aCurrentLanguage"],
    scanner = current.GetFormatScanner(),
    code = unicode("[>1,5]0"),
    check: [number] = [0],
    language: [number] = [0x407];
  try {
    const separator = current.GetLangDecimalSep(0x409);
    try {
      expect(text(separator)).toBe(".");
      expect(text(current.GetLocaleData().getNumDecimalSep())).toBe(",");
      expect(current.fields.ActLnge[0]).toBe(0x407);
    } finally {
      separator.dispose();
    }
    scanner.SetConvertMode(0x407, 0x409, false, false);
    const format = new SvNumberformat(
      code,
      scanner,
      current.pStringScanner,
      formatter.GetNatNum(),
      check,
      language,
    );
    try {
      expect(check[0]).toBe(0);
      expect(format["fLimit1"]).toBe(1.5);
      expect(text(code).startsWith("[>1.5]0;")).toBe(true);
      expect(format["NumFor"][1]?.Info().nTypeArray[0]).toBe(K.GENERAL);
      expect(language[0]).toBe(0x409);
      expect(format.GetLanguage()).toBe(0x409);
    } finally {
      format.dispose();
    }
  } finally {
    code.dispose();
    formatter.dispose();
  }
});
