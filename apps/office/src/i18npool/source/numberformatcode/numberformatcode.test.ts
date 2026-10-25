/** @fileoverview Native mapper queries,generated compound values,Sequence COW and observable FIFO/four-locale cache lifetimes. */
import { expect, it } from "vitest";
import { NumberFormatCodeMapper } from "../../inc/numberformatcode";
import {
  mapElementTypeShortToString,
  mapElementTypeStringToShort,
  mapElementUsageShortToString,
  mapElementUsageStringToShort,
} from "./numberformatcode";
import * as Type from "../../../offapi/com/sun/star/i18n/KNumberFormatType";
import * as Usage from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import {
  NumberFormatCode,
  cppu_detail_getUnoType_NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { cppu_detail_getUnoType_FormatElement } from "../../../offapi/com/sun/star/i18n/FormatElement";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
  type typelib_TypeDescription as D,
  type typelib_CompoundTypeDescription as P,
  type typelib_TypeDescriptionReference as R,
} from "../../../cppu/inc/typelib/typedescription";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import catalogs from "../localedata/data/number-formats.json";
/** Original compiler Sequence specialization,sharing the actual generated element type. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);
/** Constructs the real Locale and releases temporary caller values. @param language - Language. @param country - Country. @param variant - Original qlt variant. @returns Native value. */
function locale(language: string, country: string, variant = ""): Locale {
  const l = unicode(language),
    c = unicode(country),
    v = unicode(variant);
  try {
    return new Locale(l, c, v);
  } finally {
    l.dispose();
    c.dispose();
    v.dispose();
  }
}
/** Observes the seven native public fields. @param value - Actual value/reference. @returns Scalar observation. */
function fields(
  value: Pick<
    NumberFormatCode,
    "Type" | "Usage" | "Code" | "DefaultName" | "NameID" | "Index" | "Default"
  >,
) {
  return [
    value.Type,
    value.Usage,
    text(value.Code),
    text(value.DefaultName),
    text(value.NameID),
    value.Index,
    value.Default,
  ];
}

it("retains exact IDL selector mappings and the source's different unknown fallbacks", /** These include the private static algorithms' native unknown-value policy. @returns Nothing. */ () => {
  for (const [name, value] of Object.entries(Type)) {
    expect(mapElementTypeShortToString(value)).toBe(name.toLowerCase());
    expect(mapElementTypeStringToShort(name.toLowerCase())).toBe(value);
  }
  for (const [name, value] of Object.entries(Usage)) {
    expect(mapElementUsageShortToString(value)).toBe(name);
    expect(mapElementUsageStringToShort(name)).toBe(value);
  }
  expect(mapElementTypeShortToString(0)).toBe("");
  expect(mapElementTypeStringToShort("MEDIUM")).toBe(Type.SHORT);
  expect(mapElementUsageShortToString(0)).toBe("");
  expect(mapElementUsageStringToShort("fixed_number")).toBe(0);
});

it("initializes actual cached compound metadata with original member offsets and size", /** Real type initialization drives the actual shared Sequence copier/destructor. @returns Nothing. */ () => {
  for (const [getter, size, offsets] of [
    [cppu_detail_getUnoType_NumberFormatCode, 40, [0, 2, 8, 16, 24, 32, 34]],
    [cppu_detail_getUnoType_FormatElement, 48, [0, 8, 16, 24, 32, 40, 42]],
  ] as const) {
    const type = getter();
    expect(getter()).toBe(type);
    const slot: [D | null] = [null];
    TYPELIB_DANGER_GET(slot, type.getTypeLibType() as R);
    try {
      expect((slot[0] as D).nSize).toBe(size);
      expect(Array.from((slot[0] as unknown as P).pMemberOffsets as Int32Array)).toEqual(offsets);
    } finally {
      TYPELIB_DANGER_RELEASE(slot[0] as D);
    }
  }
});

it("returns exact selected defaults,index results and original empty structs on misses", /** Default struct Type0 is deliberately different from the mapping helper's SHORT1 fallback. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    en = locale("en", "US"),
    ar = locale("ar", "SA");
  const general = mapper.getDefault(Type.MEDIUM, Usage.FIXED_NUMBER, en),
    currency = mapper.getFormatCode(12, ar),
    missing = mapper.getFormatCode(-1, en),
    badType = mapper.getDefault(0, Usage.FIXED_NUMBER, en),
    badUsage = mapper.getDefault(Type.SHORT, 0, en),
    narrowed = mapper.getFormatCode(65536, en);
  try {
    expect(fields(general)).toEqual([2, 4, "General", "", "FixedFormatskey1", 0, true]);
    expect(text(currency.Code)).toBe("[$\u20c1-401] #٬##0;[$\u20c1-401] #٬##0 -");
    for (const value of [missing, badType, badUsage])
      expect(fields(value)).toEqual([0, 0, "", "", "", 0, false]);
    expect(fields(narrowed)).toEqual(fields(general));
  } finally {
    general.dispose();
    currency.dispose();
    missing.dispose();
    badType.dispose();
    badUsage.dispose();
    narrowed.dispose();
    mapper.dispose();
    en.dispose();
    ar.dispose();
  }
});

it("returns native ordered Sequence values with genuine copy-on-write and independently owned return strings", /** Caller mutation cannot change a copied Sequence or mapper cache. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    en = locale("en", "US"),
    all = mapper.getAllFormatCodes(en),
    fixed = mapper.getAllFormatCode(Usage.FIXED_NUMBER, en),
    empty = mapper.getAllFormatCode(0, en),
    copy = new Codes(all),
    changed = unicode("caller edit");
  const original = NumberFormatCode.borrowed(copy.operatorIndex(0)),
    owned = new NumberFormatCode(original);
  try {
    expect(all.getLength()).toBe(70);
    expect(fixed.getLength()).toBe(12);
    expect(empty.getLength()).toBe(0);
    expect(NumberFormatCode.borrowed(all.operatorIndex(69)).Index).toBe(75);
    const mutable = NumberFormatCode.borrowed(
      (all.getArray() as NumberFormatCodeAddress).get(0) as NumberFormatCodeAddress,
    );
    mutable.Code = changed;
    mutable.Default = false;
    expect(text(NumberFormatCode.borrowed(all.operatorIndex(0)).Code)).toBe("caller edit");
    expect(text(original.Code)).toBe("General");
    expect(original.Default).toBe(true);
    expect(text(owned.Code)).toBe("General");
    expect(owned.assign(owned)).toBe(owned);
    owned.Type = 65537;
    owned.Usage = 65540;
    owned.Index = 65535;
    expect([owned.Type, owned.Usage, owned.Index]).toEqual([1, 4, -1]);
    const cached = mapper.getFormatCode(0, en);
    try {
      expect(text(cached.Code)).toBe("General");
      expect(cached.Default).toBe(true);
    } finally {
      cached.dispose();
    }
  } finally {
    owned.dispose();
    changed.dispose();
    copy.dispose();
    empty.dispose();
    fixed.dispose();
    all.dispose();
    mapper.dispose();
    en.dispose();
  }
});

it("retains four original FIFO locale values and releases an evicted cache without invalidating returned codes", /** Actual Locale/OUString ownership exposes cache retention without touching private data or installing a provider. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    locales = [
      locale("en", "US"),
      locale("de", "DE"),
      locale("fr", "FR"),
      locale("th", "TH"),
      locale("ar", "SA"),
    ],
    first = locales[0] as Locale,
    code = mapper.getFormatCode(0, first),
    before = first.Language.pData.refCount;
  try {
    expect(before).toBe(2);
    for (let index = 1; index < 4; ++index) {
      const value = mapper.getFormatCode(0, locales[index] as Locale);
      value.dispose();
    }
    expect(first.Language.pData.refCount).toBe(before);
    const hit = mapper.getFormatCode(0, first);
    hit.dispose();
    const last = mapper.getFormatCode(0, locales[4] as Locale);
    last.dispose();
    expect(first.Language.pData.refCount).toBe(before - 1);
    expect(text(code.Code)).toBe("General");
  } finally {
    mapper.dispose();
    expect(text(code.Code)).toBe("General");
    code.dispose();
    for (const value of locales) value.dispose();
  }
});

it("transports every pinned locale's complete source format fields through actual generated compounds", /** Source projection is checked independently against XML;this verifies all15186 public mapped return values and UTF16 payloads. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    types: Record<string, number> = { short: 1, medium: 2, long: 3 },
    usages: Record<string, number> = {
      DATE: 1,
      TIME: 2,
      DATE_TIME: 3,
      FIXED_NUMBER: 4,
      FRACTION_NUMBER: 5,
      PERCENT_NUMBER: 6,
      SCIENTIFIC_NUMBER: 7,
      CURRENCY: 8,
    };
  let count = 0;
  try {
    for (const [name, expected] of Object.entries(catalogs)) {
      const value = locale("qlt", "", name.replaceAll("_", "-")),
        codes = mapper.getAllFormatCodes(value);
      try {
        expect(codes.getLength()).toBe(expected.length);
        for (let index = 0; index < expected.length; ++index) {
          const source = expected[index] as (typeof expected)[number];
          expect(fields(NumberFormatCode.borrowed(codes.operatorIndex(index)))).toEqual([
            types[source.formatType],
            usages[source.formatUsage],
            source.formatCode,
            source.formatName,
            source.formatKey,
            source.formatIndex,
            source.isDefault,
          ]);
          ++count;
        }
      } finally {
        codes.dispose();
        value.dispose();
      }
    }
    expect(count).toBe(15186);
  } finally {
    mapper.dispose();
  }
});
