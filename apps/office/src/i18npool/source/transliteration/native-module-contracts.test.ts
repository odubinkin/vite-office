/** @fileoverview Original logical module operations with real Sequence/Locale/value owners and explicitly initialized generic one-to-one producer contracts. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { Sequence, asNonConstRange } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import {
  MultipleCharsOutputException,
  cppu_detail_getUnoType,
} from "../../../offapi/com/sun/star/i18n/MultipleCharsOutputException";
import { MappingType } from "../../../i18nutil/inc/casefolding";
import { oneToOneMapping } from "../../../i18nutil/inc/oneToOneMapping";
import { TransliterationModules as Modules } from "../../../offapi/com/sun/star/i18n/TransliterationModules";
import * as Types from "../../../offapi/com/sun/star/i18n/TransliterationType";
import {
  Transliteration_body,
  Transliteration_casemapping,
  Transliteration_u2l,
  Transliteration_l2u,
  Transliteration_togglecase,
} from "./transliteration_body";
import { transliteration_OneToOne } from "./transliteration_OneToOne";
import { transliteration_Ignore } from "./transliteration_Ignore";
import { ignoreKashida_CTL } from "./ignoreKashida_CTL";
import { ignoreSpace_ja_JP } from "./ignoreSpace_ja_JP";
import { ignoreBaFa_ja_JP } from "./ignoreBaFa_ja_JP";
import { ignoreHyuByu_ja_JP } from "./ignoreHyuByu_ja_JP";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4),
  Strings = Sequence.specialize<ReturnType<OUString["getDataAddress"]>>("OUString", 8);
/** Real UTF16 value construction. @param value - Text. @returns Owner. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads only actual string units. @param value - Native string. @returns Text. */
function text(value: Pick<OUString, "getStr" | "getLength">): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Observes and releases a returned native string. @param value - Owned result. @returns Text. */
function result(value: OUString): string {
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}
/** Reads actual byte-strided scalar cells. @param value - Owned sequence. @returns Offset values. */
function offsets(value: Sequence<[number]>): number[] {
  const out: number[] = [];
  for (let i = 0; i < value.getLength(); i++) out.push(value.operatorIndex(i)[0]);
  return out;
}
/** Reads owned Sequence strings without acquiring or releasing borrowed tail cells. @param value - Owned result. @returns Text values. */
function strings(value: Sequence<ReturnType<OUString["getDataAddress"]>>): string[] {
  try {
    const out: string[] = [];
    for (let i = 0; i < value.getLength(); i++)
      out.push(text(OUString.unacquired(value.operatorIndex(i))));
    return out;
  } finally {
    value.dispose();
  }
}
/** Valid initialized native subclass contract; no private state or production search backend is replaced. */
class InitializedOneToOne extends transliteration_OneToOne {
  /** Supplies either the original function pointer or an actual oneToOneMapping owner. @param useTable - Producer choice. @returns Module. */
  constructor(useTable: boolean) {
    super();
    this.func = useTable
      ? null
      : /** Valid Unicode-unit translation callback for the generic base contract. @param unit - Native unit. @returns Original unit xor one. */ (
          unit,
        ) => unit ^ 1;
    this.table = useTable ? new oneToOneMapping([{ first: 97, second: 65 }], 4) : null;
  }
}
it("retains native type constants and generic/module names", /** No UNO factory/WeakImplHelper claim is made by these logical owner tests. @returns Nothing. */ () => {
  expect([
    Types.NONE,
    Types.ONE_TO_ONE,
    Types.NUMERIC,
    Types.ONE_TO_ONE_NUMERIC,
    Types.IGNORE,
    Types.CASCADE,
  ]).toEqual([0, 1, 2, 3, 4, 8]);
  const generic = new InitializedOneToOne(true),
    body = new Transliteration_body(),
    kashida = new ignoreKashida_CTL();
  try {
    expect(result(generic.getName())).toBe("");
    expect(result(generic.getImplementationName())).toBe("");
    expect(generic.getType()).toBe(Types.ONE_TO_ONE);
    expect(result(body.getName())).toBe("Transliteration_body");
    expect(body.getType()).toBe(Types.ONE_TO_ONE);
    expect(kashida.getType()).toBe(Types.IGNORE);
    expect(result(kashida.getImplementationName())).toBe(
      "com.sun.star.i18n.Transliteration.ignoreKashida_CTL",
    );
    expect(strings(body.getSupportedServiceNames())).toEqual([
      "com.sun.star.i18n.Transliteration.l10n",
    ]);
    expect(body.supportsService(u("com.sun.star.i18n.Transliteration.l10n"))).toBe(true);
    expect(body.supportsService(u("com.sun.star.i18n.Transliteration"))).toBe(false);
  } finally {
    kashida.dispose();
    body.dispose();
    generic.dispose();
  }
});
it("retains all base unsupported operations and unchanged caller outputs", /** Native RuntimeException is a real generated UNO value. @returns Nothing. */ () => {
  const owner = new InitializedOneToOne(false),
    locale = new Locale(),
    ints = new Integers(),
    names = new Strings(),
    input = u("a"),
    first: [number] = [12],
    second: [number] = [34];
  const calls = [
    /** Original unsupported module loader. @returns Nothing. */ () =>
      owner.loadModuleNew(ints, locale),
    /** Original unsupported name loader. @returns Nothing. */ () =>
      owner.loadModuleByImplName(input, locale),
    /** Original unsupported name-list loader. @returns Nothing. */ () =>
      owner.loadModulesByImplNames(names, locale),
    /** Original unsupported available modules. @returns Sequence if accepted. */ () =>
      owner.getAvailableModules(locale, 0),
    /** Original unsupported folding. @returns String if accepted. */ () =>
      owner.folding(input, 0, 1, ints),
    /** Original unsupported comparison through folding. @returns Equality if accepted. */ () =>
      owner.equals(input, 0, 1, first, input, 0, 1, second),
    /** Original unsupported range. @returns Sequence if accepted. */ () =>
      owner.transliterateRange(input, input),
  ];
  try {
    for (const call of calls) expect(call).toThrow(RuntimeException);
    expect(first).toEqual([12]);
    expect(second).toEqual([34]);
  } finally {
    input.dispose();
    names.dispose();
    ints.dispose();
    locale.dispose();
    owner.dispose();
  }
});
it.each([false, true])(
  "maps initialized one-to-one values with real offset COW, table=%s",
  /** Generic initialized producer contract; constants are independent expected values. @param table - Original pointer choice. @returns Nothing. */ (
    table,
  ) => {
    const owner = new InitializedOneToOne(table),
      input = u("zab"),
      output = new Integers(2),
      locale = new Locale();
    asNonConstRange(output).operatorIndex(0, 4)[0] = 77;
    asNonConstRange(output).operatorIndex(1, 4)[0] = 88;
    const shared = new Integers(output);
    try {
      owner.loadModule(Modules.END_OF_MODULE, locale);
      expect(result(owner.transliterate(input, 1, 2, output))).toBe(table ? "Ab" : "`c");
      expect(offsets(output)).toEqual([1, 2]);
      expect(offsets(shared)).toEqual([77, 88]);
      expect(result(owner.transliterateString2String(input, 1, 2))).toBe(table ? "Ab" : "`c");
      expect(owner.transliterateChar2Char(97)).toBe(table ? 65 : 96);
      expect(result(owner.transliterateChar2String(97))).toBe(table ? "A" : "`");
      expect(owner.compareString(u("a"), u("c"))).toBe(table ? -34 : -2);
      expect(owner.compareString(u("a"), u("aa"))).toBe(-1);
      expect(owner.compareString(u("aa"), u("a"))).toBe(1);
      expect(owner.compareString(u("aa"), u("aa"))).toBe(0);
      expect(result(owner.transliterate(input, 0, 0, output))).toBe("");
      expect(offsets(output)).toEqual([]);
    } finally {
      shared.dispose();
      output.dispose();
      input.dispose();
      locale.dispose();
      owner.dispose();
    }
  },
);
it("uses actual body mapping, expansions, locale copies and toggle contracts", /** The caller changes its Locale after a native copy, not module private state. @returns Nothing. */ () => {
  const module = new Transliteration_casemapping(),
    locale = new Locale(u("tr"), u("TR"), u("")),
    output = new Integers(1),
    old = new Integers(output),
    input = u("xiﬃ");
  try {
    module.setMappingType(MappingType.ToUpper);
    module.setMappingType(MappingType.ToUpper);
    module.setLocale(locale);
    module.setLocale(locale);
    locale.Language.assign(u("en"));
    expect(result(module.transliterate(input, 1, 2, output))).toBe("İFFI");
    expect(offsets(output)).toEqual([1, 2, 2, 2]);
    expect(old.getLength()).toBe(1);
    expect(result(module.transliterateString2String(input, 1, 2))).toBe("İFFI");
    expect(result(module.folding(input, 1, 2, output))).toBe("İFFI");
    expect(result(module.transliterateChar2String(0xfb03))).toBe("FFI");
    expect(module.transliterateChar2Char(0x61)).toBe(65);
    expect(
      /** Scalar expansion must use the actual generated exception. @returns Unit if accepted. */ () =>
        module.transliterateChar2Char(0xfb03),
    ).toThrow(MultipleCharsOutputException);
    expect(
      /** The base body equality is not a silent implementation substitute. @returns Equality if accepted. */ () =>
        module.equals(input, 0, 1, [0], input, 0, 1, [0]),
    ).toThrow(RuntimeException);
    expect(strings(module.transliterateRange(u("abc"), u("")))).toEqual(["abc", ""]);
    const toggle = new Transliteration_togglecase(),
      upper = new Transliteration_l2u(),
      lower = new Transliteration_u2l(),
      body = new Transliteration_body();
    try {
      expect(result(toggle.transliterateString2String(u("aA1"), 0, 3))).toBe("Aa1");
      expect(result(toggle.transliterate(u("aA"), 0, 2, output))).toBe("Aa");
      expect(offsets(output)).toEqual([0, 1]);
      expect(result(upper.transliterateString2String(u("a"), 0, 1))).toBe("A");
      expect(result(lower.transliterateString2String(u("A"), 0, 1))).toBe("a");
      expect(result(body.transliterateString2String(u("a"), 0, 1))).toBe("a");
      module.setMappingType(MappingType.NONE);
      expect(result(module.transliterateString2String(u("a"), 0, 1))).toBe("a");
    } finally {
      body.dispose();
      lower.dispose();
      upper.dispose();
      toggle.dispose();
    }
  } finally {
    input.dispose();
    old.dispose();
    output.dispose();
    locale.dispose();
    module.dispose();
  }
});
it.each([
  [ignoreKashida_CTL, "XـabـY", 1, 4, "ab", [2, 3]],
  [ignoreSpace_ja_JP, "X a\u3000Y", 1, 3, "a", [2]],
  [ignoreBaFa_ja_JP, "XヴァaY", 1, 3, "バa", [2, 3]],
  [ignoreHyuByu_ja_JP, "XフュaY", 1, 3, "ヒュa", [1, 2, 3]],
  [ignoreBaFa_ja_JP, "ab", 0, 2, "ab", [0, 1]],
  [ignoreBaFa_ja_JP, "a", 0, 1, "a", [0]],
  [ignoreBaFa_ja_JP, "", 0, 0, "", []],
])(
  "preserves original concrete ignore output/offset case %#",
  /** Uses real source module constructors. @param Owner - Original module class. @param value - Input. @param start - Range start. @param count - Count. @param expected - Output. @param expectedOffsets - Native offsets. @returns Nothing. */ (
    Owner,
    value,
    start,
    count,
    expected,
    expectedOffsets,
  ) => {
    const module = new Owner(),
      input = u(value),
      output = new Integers();
    try {
      expect(result(module.transliterate(input, start, count, output))).toBe(expected);
      expect(offsets(output)).toEqual(expectedOffsets);
      expect(result(module.transliterateString2String(input, start, count))).toBe(expected);
    } finally {
      output.dispose();
      input.dispose();
      module.dispose();
    }
  },
);
it("preserves sentinel deletion, scalar identity and ignore equality match outputs", /** LiteralFFFF collides with the original skip sentinel; no replacement Unicode policy is added. @returns Nothing. */ () => {
  const kashida = new ignoreKashida_CTL(),
    space = new ignoreSpace_ja_JP(),
    pair = new ignoreBaFa_ja_JP(),
    offset = new Integers(),
    first: [number] = [0],
    second: [number] = [0];
  try {
    expect(kashida.transliterateChar2Char(0x640)).toBe(0xffff);
    expect(space.transliterateChar2Char(32)).toBe(0xffff);
    expect(pair.transliterateChar2Char(0x30f4)).toBe(0x30f4);
    expect(result(kashida.transliterate(u("a\uffffb"), 0, 3, offset))).toBe("ab");
    expect(offsets(offset)).toEqual([0, 2]);
    expect(result(space.transliterateString2String(u("\u200b\t"), 0, 2))).toBe("\t");
    expect(kashida.equals(u("xـa"), 1, 2, first, u("a"), 0, 1, second)).toBe(true);
    expect(first).toEqual([3]);
    expect(second).toEqual([1]);
    expect(kashida.equals(u("a"), 0, 1, first, u("b"), 0, 1, second)).toBe(false);
    expect(first).toEqual([0]);
    expect(second).toEqual([0]);
    expect(kashida.equals(u("a"), 0, 1, first, u("ab"), 0, 2, second)).toBe(false);
    expect(kashida.equals(u("ab"), 0, 2, first, u("a"), 0, 1, second)).toBe(false);
    expect(strings(kashida.transliterateRange(u("abc"), u("xyz")))).toEqual(["a", "x"]);
    expect(
      /** Empty first endpoint is an original RuntimeException. @returns Range if accepted. */ () =>
        kashida.transliterateRange(u(""), u("a")),
    ).toThrow(RuntimeException);
    expect(
      /** Empty second endpoint is an original RuntimeException. @returns Range if accepted. */ () =>
        kashida.transliterateRange(u("a"), u("")),
    ).toThrow(RuntimeException);
    const equal = new InitializedOneToOne(true),
      different = new InitializedOneToOne(false);
    try {
      expect(
        strings(transliteration_Ignore.transliterateRange(u("a"), u("b"), equal, equal)),
      ).toEqual(["A", "b"]);
      expect(
        strings(transliteration_Ignore.transliterateRange(u("a"), u("b"), equal, different)),
      ).toEqual(["A", "b", "`", "c"]);
      expect(
        /** Static overload rejects an empty first endpoint. @returns Range if accepted. */ () =>
          transliteration_Ignore.transliterateRange(u(""), u("b"), equal, different),
      ).toThrow(RuntimeException);
      expect(
        /** Static overload rejects an empty second endpoint. @returns Range if accepted. */ () =>
          transliteration_Ignore.transliterateRange(u("a"), u(""), equal, different),
      ).toThrow(RuntimeException);
    } finally {
      different.dispose();
      equal.dispose();
    }
  } finally {
    offset.dispose();
    pair.dispose();
    space.dispose();
    kashida.dispose();
  }
});
it("retains generated multiple-output exception inheritance, copies, moves and cached real type", /** All inherited fields are the actual UNO Exception owners. @returns Nothing. */ () => {
  const context = new Reference(),
    source = new MultipleCharsOutputException(u("expanded"), context),
    copy = new MultipleCharsOutputException(source),
    moved = MultipleCharsOutputException.move(copy),
    empty = new MultipleCharsOutputException();
  try {
    expect(source).toBeInstanceOf(Exception);
    expect(text(source.Message)).toBe("expanded");
    expect(text(moved.Message)).toBe("expanded");
    expect(copy.Message.isEmpty()).toBe(true);
    expect(empty.Message.isEmpty()).toBe(true);
    expect(cppu_detail_getUnoType()).toBe(cppu_detail_getUnoType());
  } finally {
    empty.dispose();
    moved.dispose();
    copy.dispose();
    source.dispose();
    context.dispose();
  }
});

it("retains all original Japanese space rows and explicit non-space identities", /** Independent source key/range specification prevents a general whitespace policy from replacing the15 native entries. @returns Nothing. */ () => {
  const module = new ignoreSpace_ja_JP(),
    removed = [0x20, 0xa0, 0x202f, 0x3000, 0x303f];
  for (let unit = 0x2002; unit <= 0x200b; unit++) removed.push(unit);
  const identity = [0, 9, 10, 13, 0x2000, 0x2001, 0x200c, 0x2028, 0x2029, 0x2060, 0x3001, 0xd800],
    source = new OUString(Uint16Array.from(removed), removed.length),
    retained = new OUString(Uint16Array.from(identity), identity.length);
  try {
    expect(removed).toHaveLength(15);
    for (const unit of removed) expect(module.transliterateChar2Char(unit)).toBe(0xffff);
    for (const unit of identity) expect(module.transliterateChar2Char(unit)).toBe(unit);
    expect(result(module.transliterateString2String(source, 0, source.getLength()))).toBe("");
    expect(result(module.transliterateString2String(retained, 0, retained.getLength()))).toBe(
      text(retained),
    );
  } finally {
    retained.dispose();
    source.dispose();
    module.dispose();
  }
});
it("retains every original BaFa/HyuByu row in both scripts", /** The expected Japanese strings specify original two-to-one and two-to-two outputs independently of the loop or table layout. @returns Nothing. */ () => {
  const rows = [
    [ignoreBaFa_ja_JP, "ヴァ", "バ"],
    [ignoreBaFa_ja_JP, "ゔぁ", "ば"],
    [ignoreBaFa_ja_JP, "ファ", "ハ"],
    [ignoreBaFa_ja_JP, "ふぁ", "は"],
    [ignoreHyuByu_ja_JP, "フュ", "ヒュ"],
    [ignoreHyuByu_ja_JP, "ふゅ", "ひゅ"],
    [ignoreHyuByu_ja_JP, "ヴュ", "ビュ"],
    [ignoreHyuByu_ja_JP, "ゔゅ", "びゅ"],
  ] as const;
  for (const [Owner, input, expected] of rows) {
    const module = new Owner(),
      source = u(input);
    try {
      expect(result(module.transliterateString2String(source, 0, source.getLength()))).toBe(
        expected,
      );
    } finally {
      source.dispose();
      module.dispose();
    }
  }
});
