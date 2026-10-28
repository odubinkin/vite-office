/** @fileoverview Original pointer-walk General name extraction includes malformed source modifier inputs. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { extractStandardGeneralName } from "./zforscan";
import formats from "../../../i18npool/source/localedata/data/number-formats.json";

it("retains native modifier,delimiter,and malformed/nested bracket behavior", /** These observations follow the original pointers,not a regex cleanup policy. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["", ""],
    ["General", "General"],
    ["[NatNum1]General", "General"],
    ["[A][B]常规;other", "常规"],
    ["[A;B]Standard;next", "Standard"],
    [";next", ""],
    ["General;", "General"],
    ["[A]", ""],
    ["[A", ""],
    ["[A[B]General", "General"],
    ["]General", "]General"],
    ["[A]General[B]tail", "tail"],
    ["[A]🧮General", "🧮General"],
  ]) {
    const code = unicode(input as string),
      result = extractStandardGeneralName(code);
    try {
      expect(text(result)).toBe(expected);
    } finally {
      result.dispose();
      code.dispose();
    }
  }
});

it("extracts every registered locale's actual index-zero standard name", /** Only the admitted standard entry is tested;this does not assert full scanner parsing. @returns Nothing. */ () => {
  let count = 0;
  for (const catalog of Object.values(formats)) {
    const standard = catalog.find(
      /** Finds original General. @param row - Source locale entry. @returns Index match. */ (
        row,
      ) => row.formatIndex === 0,
    );
    expect(standard).toBeDefined();
    const source = standard as (typeof catalog)[number];
    const code = unicode(source.formatCode),
      name = extractStandardGeneralName(code);
    try {
      expect(name.getLength()).toBeGreaterThan(0);
      expect(text(name)).toBe(source.formatCode.replace(/^\[NatNum1\]/, ""));
      ++count;
    } finally {
      name.dispose();
      code.dispose();
    }
  }
  expect(count).toBe(284);
});

import { SvNFLanguageData } from "./zforlist";
import { ImpSvNumberformatScan, KeywordLocalization } from "./zforscan";
import { ImpSvNumFor } from "./zformat";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";

it("keeps locale-keyword case,English normalization,localization policy and reset state", /** These are original General paths;other token families remain explicit admission failures. @returns Nothing. */ () => {
  const language = unicode("de"),
    country = unicode("DE"),
    empty = unicode(""),
    locale = new Locale(language, country, empty),
    name = unicode("Standard"),
    localeData = new LocaleDataWrapper(locale);
  const mapper = new NumberFormatCodeMapper(),
    current = new SvNFLanguageData(mapper, 0x0407);
  try {
    for (const mode of Object.values(KeywordLocalization)) {
      const scanner = new ImpSvNumberformatScan(current, mapper),
        code = unicode("sTaNdArD"),
        english = unicode("GENERAL"),
        unsupported = unicode("0.00"),
        info = new ImpSvNumFor();
      try {
        scanner.ChangeIntl(mode);
        expect(scanner.ScanFormat(code)).toBe(0);
        expect(text(code)).toBe("sTaNdArD");
        expect(scanner.GetResultStringsCnt()).toBe(1);
        info.Enlarge(1);
        scanner.CopyInfo(info.Info(), 1);
        expect(
          text(info.Info().sStrArray[0] as import("../../../sal/inc/rtl/ustring").OUString),
        ).toBe("sTaNdArD");
        expect(info.Info().nTypeArray).toEqual([39]);
        expect([
          info.Info().eScannedType,
          info.Info().nThousand,
          info.Info().bThousand,
          info.Info().nCntPre,
          info.Info().nCntPost,
          info.Info().nCntExp,
        ]).toEqual([16, 1000, false, 0, 0, 0]);
        if (mode === KeywordLocalization.AllowEnglish) {
          expect(scanner.ScanFormat(english)).toBe(0);
          expect(text(english)).toBe("Standard");
        } else
          expect(
            /** Enforces the prepared native keyword policy. @returns Control position. */ () =>
              scanner.ScanFormat(english),
          ).toThrow(/not implemented/);
        expect(
          /** Rejects an unported pattern family without a fabricated syntax error. @returns Control position. */ () =>
            scanner.ScanFormat(unsupported),
        ).toThrow(/not implemented/);
        expect(scanner.ScanFormat(empty)).toBe(0);
        expect(scanner.GetResultStringsCnt()).toBe(0);
        expect(scanner.GetScannedType()).toBe(2048);
        info.Enlarge(0);
        scanner.CopyInfo(info.Info(), 0);
        expect(info.Info().nThousand).toBe(0);
        scanner.ChangeStandardPrec(65536);
        expect(scanner.GetStandardPrec()).toBe(0);
      } finally {
        info.dispose();
        scanner.dispose();
        code.dispose();
        english.dispose();
        unsupported.dispose();
      }
    }
  } finally {
    current.dispose();
    mapper.dispose();
    localeData.dispose();
    name.dispose();
    locale.dispose();
    language.dispose();
    country.dispose();
    empty.dispose();
  }
});

import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
