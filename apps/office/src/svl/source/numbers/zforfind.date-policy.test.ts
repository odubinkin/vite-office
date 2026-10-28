/** @fileoverview Native ISO override and compiled-format date-order policy over original scanner state. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import {
  DateOrder,
  LongDateOrder,
  type LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import { NfEvalDateFormat, SvNumFormatType } from "../../inc/zforlist";
import { NfKeywordIndex } from "../../inc/nfkeytab";

import { ImpSvNumFor, SvNumberformat } from "./zformat";

it("forces ambiguous short ISO years only when native date-order policy permits", /** Checks literal ISO fragments against an actual accepted Y-M-D pattern. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    NumberStringDivision(value: OUString): void;
    CanForceToIso8601(order: DateOrder): boolean;
  };
  const state = language.pStringScanner.fields;
  try {
    for (const [value, order, accepted] of [
      ["24-12-31", DateOrder.DMY, false],
      ["24-12-31", DateOrder.MDY, true],
      ["12-12-31", DateOrder.MDY, false],
      ["00-12-31", DateOrder.DMY, true],
      ["32-12-31", DateOrder.DMY, true],
      ["12-12-31", DateOrder.YMD, true],
      ["12-12-31", DateOrder.Invalid, false],
      ["123-12-31", DateOrder.DMY, true],
      ["2024-12-31", DateOrder.DMY, true],
      ["24/12/31", DateOrder.YMD, false],
      ["12-12-31", 99 as DateOrder, false],
    ] as const) {
      scanner.Reset();
      for (const pattern of state.sDateAcceptancePatterns) pattern.dispose();
      state.sDateAcceptancePatterns = [unicode("Y-M-D")];
      const input = unicode(value);
      try {
        scanner.NumberStringDivision(input);
        expect(scanner.CanForceToIso8601(order), `${value} ${order}`).toBe(accepted);
      } finally {
        input.dispose();
      }
    }
    scanner.Reset();
    for (const pattern of state.sDateAcceptancePatterns) pattern.dispose();
    state.sDateAcceptancePatterns = [unicode("D/M/Y")];
    const unmatched = unicode("24-12-31");
    try {
      scanner.NumberStringDivision(unmatched);
      expect(scanner.CanForceToIso8601(DateOrder.Invalid)).toBe(true);
    } finally {
      unmatched.dispose();
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});

it("compares actual format order with pattern order in all four date evaluation modes", /** Checks native DATE format admission rather than replacing GetDateOrder with a test implementation. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(
    code,
    language.GetFormatScanner(),
    language.GetFormatScanner().GetCurrentLanguageData().pStringScanner,
    language.GetFormatScanner().getColorCallback().GetNatNum(),
    [0],
    [0x0409],
  );
  format.SetType(SvNumFormatType.DATE);
  const section = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  section.Enlarge(3);
  section.Info().nTypeArray.splice(0, 3, NfKeywordIndex.DD, NfKeywordIndex.MM, NfKeywordIndex.YYYY);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    NumberStringDivision(value: OUString): void;
    IsAcceptableIso8601(): boolean;
    GetMiddleMonthLongDateOrder(
      formatTurn: boolean,
      locale: LocaleDataWrapper,
      order: DateOrder,
    ): LongDateOrder;
  };
  const state = language.pStringScanner.fields;
  try {
    for (const mode of Object.values(NfEvalDateFormat)) {
      scanner.Reset();
      for (const pattern of state.sDateAcceptancePatterns) pattern.dispose();
      state.sDateAcceptancePatterns = [unicode("Y-M-D")];
      state.mpFormat = format;
      language.SetEvalDateFormat(mode);
      const input = unicode("24-12-31");
      try {
        scanner.NumberStringDivision(input);
        expect(scanner.IsAcceptableIso8601(), String(mode)).toBe(mode !== NfEvalDateFormat.Format);
      } finally {
        input.dispose();
      }
    }
    for (const [types, value, shortOrder, longOrder] of [
      [
        [NfKeywordIndex.MM, NfKeywordIndex.DD, NfKeywordIndex.YYYY],
        "12 JAN 2024",
        DateOrder.MDY,
        LongDateOrder.MDY,
      ],
      [
        [NfKeywordIndex.YYYY, NfKeywordIndex.MM, NfKeywordIndex.DD],
        "12 JAN 2024",
        DateOrder.DMY,
        LongDateOrder.DMY,
      ],
      [
        [NfKeywordIndex.DD, NfKeywordIndex.MM, NfKeywordIndex.YYYY],
        "2024 JAN 12",
        DateOrder.YMD,
        LongDateOrder.YMD,
      ],
      [
        [NfKeywordIndex.MM, NfKeywordIndex.DD, NfKeywordIndex.YYYY],
        "12 JAN 2024",
        DateOrder.YMD,
        LongDateOrder.YMD,
      ],
      [
        [NfKeywordIndex.MM, NfKeywordIndex.DD, NfKeywordIndex.YYYY],
        "12 JAN 2024",
        DateOrder.DMY,
        LongDateOrder.DMY,
      ],
    ] as const) {
      scanner.Reset();
      state.mpFormat = format;
      section.Info().nTypeArray.splice(0, 3, ...types);
      const input = unicode(value);
      try {
        scanner.NumberStringDivision(input);
        expect(
          scanner.GetMiddleMonthLongDateOrder(true, language.GetLocaleData(), shortOrder),
        ).toBe(longOrder);
      } finally {
        input.dispose();
      }
    }
  } finally {
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});
