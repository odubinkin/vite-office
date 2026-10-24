/** @fileoverview Native selection/default policies over actual generated compound values and shared UNO COW. */
import { expect, it } from "vitest";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NumberFormatCode,
  cppu_detail_getUnoType_NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ImpGetFormatCodeIndex, ImpAdjustFormatCodeDefault } from "./zforlist";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
/** Actual generated specialization. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);
/** Builds real struct/Sequence owners,not a formatter service substitute. @param fields - Index,type,default observations. @returns Owned sequence. */
function codes(fields: [number, number, boolean][]) {
  const values = fields.map(
    /** Initializes actual fields. @param entry - Declared scalar fields. @returns Owned value. */ ([
      index,
      type,
      isDefault,
    ]) => {
      const code = new NumberFormatCode();
      code.Index = index;
      code.Type = type;
      code.Default = isDefault;
      return code;
    },
  );
  try {
    return new Codes(
      new Map(
        values.map(
          /** Addresses initialized compounds. @param value - Native struct. @param index - Position. @returns Byte address and value. */ (
            value,
            index,
          ) => [index * 40, value],
        ),
      ),
      values.length,
    );
  } finally {
    for (const value of values) value.dispose();
  }
}

it("selects exact index before default,currency decimals before integers,and final zero without modifying input", /** Native fallback ordering and const searches preserve actual handles. @returns Nothing. */ () => {
  const decimal = unicode(",");
  for (const [rows, offset, expected] of [
    [
      [
        [7, 1, true],
        [0, 2, false],
      ],
      0,
      1,
    ],
    [
      [
        [7, 1, false],
        [2, 3, true],
      ],
      14,
      1,
    ],
    [
      [
        [12, 1, false],
        [13, 2, false],
      ],
      14,
      1,
    ],
    [
      [
        [7, 1, false],
        [12, 1, false],
      ],
      17,
      1,
    ],
    [[[7, 1, false]], 15, 0],
    [
      [
        [13, 2, false],
        [12, 1, false],
      ],
      18,
      0,
    ],
    [
      [
        [7, 1, false],
        [13, 2, false],
      ],
      11,
      0,
    ],
  ] as [[number, number, boolean][], number, number][]) {
    const sequence = codes(rows),
      handle = sequence.get();
    try {
      expect(ImpGetFormatCodeIndex(sequence, offset, decimal)).toBe(expected);
      expect(sequence.get()).toBe(handle);
    } finally {
      sequence.dispose();
    }
  }
  decimal.dispose();
});

it("assigns the native empty fallback without changing another shared owner", /** Default struct scalars remain zero and the source separator may contain multiple UTF16 units. @returns Nothing. */ () => {
  const sequence = new Codes(),
    original = new Codes(sequence),
    decimal = unicode("\u066b\u200e");
  try {
    expect(ImpGetFormatCodeIndex(sequence, 0, decimal)).toBe(0);
    expect(original.getLength()).toBe(0);
    expect(sequence.getLength()).toBe(1);
    const code = NumberFormatCode.borrowed(sequence.operatorIndex(0));
    expect(text(code.Code)).toBe("0\u066b\u200e############");
    expect([
      code.Type,
      code.Usage,
      code.Index,
      code.Default,
      text(code.DefaultName),
      text(code.NameID),
    ]).toEqual([0, 0, 0, false, "", ""]);
  } finally {
    sequence.dispose();
    original.dispose();
    decimal.dispose();
  }
});

it("retains source medium/long/first fallback ordering,including duplicate medium flags", /** Native mutable pointer/count policy is exercised only on actual UNO storage. @returns Nothing. */ () => {
  for (const [types, expected] of [
    [[], []],
    [
      [
        [1, false],
        [3, false],
      ],
      [true, false],
    ],
    [
      [
        [1, true],
        [3, true],
      ],
      [false, true],
    ],
    [
      [
        [3, true],
        [1, true],
      ],
      [true, false],
    ],
    [
      [
        [2, true],
        [3, true],
      ],
      [true, false],
    ],
    [
      [
        [3, true],
        [2, true],
        [1, true],
      ],
      [false, true, false],
    ],
    [
      [
        [2, true],
        [2, true],
        [3, true],
      ],
      [true, true, false],
    ],
    [
      [
        [0, true],
        [1, true],
      ],
      [true, false],
    ],
  ] as [[number, boolean][], boolean[]][]) {
    const sequence = codes(
        types.map(
          /** Adds original index. @param entry - Fields. @param index - Position. @returns Constructor inputs. */ (
            [type, flag],
            index,
          ) => [index, type, flag],
        ),
      ),
      copy = new Codes(sequence);
    try {
      ImpAdjustFormatCodeDefault(sequence.getArray() as SequenceElements, sequence.getLength());
      expect(
        types.map(
          /** Observes adjusted actual fields. @param unused - Input fields. @param index - Position. @returns Default flag. */ (
            _,
            index,
          ) => NumberFormatCode.borrowed(sequence.operatorIndex(index)).Default,
        ),
      ).toEqual(expected);
      expect(
        types.map(
          /** Observes independently shared fields. @param unused - Input fields. @param index - Position. @returns Default flag. */ (
            _,
            index,
          ) => NumberFormatCode.borrowed(copy.operatorIndex(index)).Default,
        ),
      ).toEqual(
        types.map(
          /** Observes source expectation. @param entry - Input fields. @returns Original flag. */ ([
            ,
            flag,
          ]) => flag,
        ),
      );
    } finally {
      sequence.dispose();
      copy.dispose();
    }
  }
});

it("selects actual mapper General without replacing its compiled Sequence owner", /** Integration with the source locale catalog rather than a fake language-data provider. @returns Nothing. */ () => {
  const language = unicode("de"),
    country = unicode("DE"),
    empty = unicode(""),
    locale = new Locale(language, country, empty),
    mapper = new NumberFormatCodeMapper(),
    decimal = unicode(",");
  const sequence = mapper.getAllFormatCode(4, locale);
  try {
    ImpAdjustFormatCodeDefault(sequence.getArray() as SequenceElements, sequence.getLength());
    const index = ImpGetFormatCodeIndex(sequence, 0, decimal);
    expect(text(NumberFormatCode.borrowed(sequence.operatorIndex(index)).Code)).toBe("Standard");
  } finally {
    sequence.dispose();
    mapper.dispose();
    locale.dispose();
    language.dispose();
    country.dispose();
    empty.dispose();
    decimal.dispose();
  }
});
