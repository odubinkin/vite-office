/** @fileoverview Replays complete original lookup, width and iterator streams with actual shared owners and initialized-field masks. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, test, vi } from "vitest";
import fixture from "./native-casefolding-iterator-cases.json";
import type { MappingElement as State } from "../../inc/casefolding";

/** Whole lossless initialized native stream reader. */
class NativeWords {
  private bytes: Buffer;
  private cursor = 0;
  /** Restores every original signed word and verifies the complete hash. @param mode - Native process mode. @returns Reader. */
  constructor(mode: keyof typeof fixture.captures) {
    const capture = fixture.captures[mode];
    this.bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
    expect(this.bytes.length).toBe(capture.rawBytes);
    let previous = 0;
    for (let at = 0; at < this.bytes.length; at += 4) {
      previous = (previous + this.bytes.readInt32LE(at)) | 0;
      this.bytes.writeInt32LE(previous, at);
    }
    expect(createHash("sha256").update(this.bytes).digest("hex")).toBe(capture.rawHash);
  }
  /** Compares each actual field with genuine original bytes. @param fields - Initialized observations. @returns Nothing. */
  emit(...fields: number[]): void {
    for (const value of fields) {
      const expected = this.bytes.readInt32LE(this.cursor);
      if (value !== expected)
        throw new Error(`Native field ${this.cursor / 4}: ${value} != ${expected}`);
      this.cursor += 4;
    }
  }
  /** Proves that every native field was compared. @returns Nothing. */
  finish(): void {
    expect(this.cursor).toBe(this.bytes.length);
  }
}

/** Fresh owners match the independent native processes. @returns Actual production API owners. */
async function owners() {
  vi.resetModules();
  const api = await import("../../inc/casefolding"),
    source = await import("./casefolding"),
    data = await import("./widthfolding_data"),
    { widthfolding } = await import("../../inc/widthfolding"),
    lookup = await import("../../inc/oneToOneMapping"),
    { TransliterationFlags } = await import("../../inc/transliteration"),
    { TransliterationModules } =
      await import("../../../offapi/com/sun/star/i18n/TransliterationModules"),
    { TransliterationModulesExtra } =
      await import("../../../offapi/com/sun/star/i18n/TransliterationModulesExtra"),
    { Locale } = await import("../../../udkapi/com/sun/star/lang/Locale"),
    { OUString } = await import("../../../sal/inc/rtl/ustring"),
    { RuntimeException, cppu_detail_getUnoType } =
      await import("../../../cppu/inc/com/sun/star/uno/RuntimeException");
  expect(api.casefolding).toBe(source.casefolding);
  expect(api.casefolding.getValue).toBe(source.getValue);
  expect(api.casefolding.getConditionalValue).toBe(source.getConditionalValue);
  expect(api.casefolding.getNextChar).toBe(source.getNextChar);
  const modules = [
    0,
    TransliterationFlags.IGNORE_CASE,
    TransliterationFlags.IGNORE_KANA,
    TransliterationFlags.IGNORE_CASE | TransliterationFlags.IGNORE_KANA,
    TransliterationFlags.IGNORE_WIDTH,
    TransliterationFlags.IGNORE_CASE | TransliterationFlags.IGNORE_WIDTH,
    TransliterationFlags.IGNORE_KANA | TransliterationFlags.IGNORE_WIDTH,
    TransliterationFlags.IGNORE_CASE |
      TransliterationFlags.IGNORE_KANA |
      TransliterationFlags.IGNORE_WIDTH,
  ];
  /** Reconstructs an original exact Locale string field. @param language - Caller UTF16 units. @returns Owned Locale. */
  function locale(language: string): InstanceType<typeof Locale> {
    const units = Uint16Array.from(
        language,
        /** Preserves one original unit. @param unit - Caller character. @returns Native unit. */ (
          unit,
        ) => unit.charCodeAt(0),
      ),
      text = new OUString(units, units.length),
      empty = new OUString(),
      result = new Locale(text, empty, empty);
    text.dispose();
    empty.dispose();
    return result;
  }
  /** Actual native caller explicitly initializes the otherwise indeterminate map cells. @returns Actual state owner. */
  function seed(): InstanceType<typeof api.MappingElement> {
    const e = new api.MappingElement();
    expect([e.current, e.element.type, e.element.nmap]).toEqual([0, 0, 0]);
    e.element.map.set([0x1111, 0x2222, 0x3333]);
    return e;
  }
  /** Observes one actual call, masking only native default cells that have no initialized value. @param native - Whole original stream. @param input - Actual allocated caller input. @param idx - Index reference. @param len - Logical length. @param e - Actual state. @param localeValue - Actual Locale. @param flag - Original mapping flags. @param module - Original modules. @param initialized - Caller-known map initialization. @returns Updated initialization marker. */
  function step(
    native: NativeWords,
    input: Uint16Array,
    idx: [number],
    len: number,
    e: State,
    localeValue: InstanceType<typeof Locale>,
    flag: number,
    module: number,
    initialized: boolean,
  ): boolean {
    const element = e.element,
      map = element.map,
      end = idx[0] >= len,
      loaded =
        !end && Boolean(module & TransliterationFlags.IGNORE_CASE) && e.current >= element.nmap;
    let result = 0,
      error = 0,
      message = 0,
      context = 0,
      name = 0;
    try {
      result = api.casefolding.getNextChar(input, idx, len, e, localeValue, flag, module);
      if (end) initialized = false;
      else if (loaded) initialized = true;
    } catch (x) {
      if (!(x instanceof RuntimeException)) throw x;
      error = 1;
      message = x.Message.getLength();
      context = Number(x.Context.is());
      const typeName = cppu_detail_getUnoType().getTypeName(),
        ascii = Uint8Array.from(Buffer.from("com.sun.star.uno.RuntimeException", "ascii"));
      name = Number(typeName.equalsAsciiL(ascii, ascii.length));
      typeName.dispose();
      x.dispose();
    }
    native.emit(
      result,
      idx[0],
      e.current,
      e.element.type,
      e.element.nmap,
      Number(initialized),
      initialized ? (map[0] as number) : 0,
      initialized ? (map[1] as number) : 0,
      initialized ? (map[2] as number) : 0,
      error,
      message,
      context,
      name,
      Number(element === e.element && map === e.element.map),
    );
    return initialized;
  }
  return {
    ...api,
    data,
    widthfolding,
    ...lookup,
    TransliterationFlags,
    TransliterationModules,
    TransliterationModulesExtra,
    Locale,
    locale,
    modules,
    seed,
    step,
  };
}

test("complete original static width data, numeric declarations, scalar outputs and getter identity", /** Replays every initialized original width field. @returns Completed replay. */ async () => {
  const native = new NativeWords("tables"),
    {
      data,
      widthfolding,
      TransliterationModules,
      TransliterationModulesExtra,
      TransliterationFlags,
    } = await owners();
  const getters = fixture.getters.map(
    /** Selects the actual source-defined static APIs. @param name - Original getter name. @returns Actual method. */ (
      name,
    ) =>
      widthfolding[name as keyof typeof widthfolding] as () => ReturnType<
        typeof widthfolding.gethalf2fullTable
      >,
  );
  native.emit(4, 6, 0, 2, 4);
  for (const name of fixture.moduleNames)
    native.emit(TransliterationModules[name as keyof typeof TransliterationModules] as number);
  native.emit(TransliterationModules.MAKE_FIXED_SIZE);
  for (const name of fixture.extraNames)
    native.emit(TransliterationModulesExtra[name as keyof typeof TransliterationModulesExtra]);
  for (const name of fixture.flagNames)
    native.emit(TransliterationFlags[name as keyof typeof TransliterationFlags]);
  for (const row of data.decomposition_table)
    native.emit(row.decomposited_character_1, row.decomposited_character_2);
  for (const row of data.composition_table) native.emit(row[0] as number, row[1] as number);
  for (const rows of [data.full2half, data.half2full])
    for (const row of rows) native.emit(row.first, row.second, row.flag);
  for (const a of getters) for (const b of getters) native.emit(Number(a() === b()));
  for (let key = 0; key < 65536; key++) {
    native.emit(widthfolding.decompose_ja_voiced_sound_marksChar2Char(key));
    for (const get of getters) native.emit(get().find(key), get().get(key));
  }
  for (let first = 0x3040; first <= 0x30ff; first++)
    for (let second = 0x3099; second <= 0x309a; second++)
      native.emit(
        widthfolding.getCompositionChar(first, second),
        widthfolding.getCompositionChar(first + 65536, second + 65536),
      );
  native.finish();
}, 120000);

test("all original width flags, binary/index lookups, byte counts, virtual dispatch and borrowed rows", /** Replays the complete original class caller stream. @returns Completed replay. */ async () => {
  const native = new NativeWords("lookup"),
    { data, oneToOneMapping, oneToOneMappingWithFlag } = await owners();
  for (const rows of [data.full2half, data.half2full])
    for (const flag of fixture.lookupFlags) {
      const owner = new oneToOneMappingWithFlag(rows, rows.length * 6, flag);
      for (let phase = 0; phase < 2; phase++) {
        if (phase) {
          owner.makeIndex();
          owner.makeIndex();
        }
        for (let key = 0; key < 65536; key++) native.emit(owner.find(key), owner.get(key));
      }
      owner.dispose();
    }
  const pairs = [
    { first: 1, second: 0x1111 },
    { first: 258, second: 0x2222 },
    { first: 259, second: 0x3333 },
  ];
  for (const bytes of [0, 1, 3, 4, 5, 8, 12]) {
    const owner = new oneToOneMapping(pairs, bytes);
    for (let key = 0; key < 65536; key++) native.emit(owner.find(key), owner.get(key));
    owner.dispose();
  }
  const explicitUnit = new oneToOneMapping(pairs, 24, 8),
    nullOwner = new oneToOneMapping(null, 128),
    nullFlag = new oneToOneMappingWithFlag(null, 0, 7);
  nullFlag.makeIndex();
  nullFlag.makeIndex();
  for (let key = 0; key < 65536; key++)
    native.emit(explicitUnit.find(key), nullOwner.get(key), nullFlag.get(key));
  explicitUnit.dispose();
  nullOwner.dispose();
  nullFlag.dispose();
  const rows: [
      { first: number; second: number; flag: number },
      { first: number; second: number; flag: number },
      { first: number; second: number; flag: number },
    ] = [
      { first: 0x41, second: 0x61, flag: 1 },
      { first: 0x42, second: 0x62, flag: 2 },
      { first: 0x300, second: 0x301, flag: 4 },
    ],
    owner = new oneToOneMappingWithFlag(rows, rows.length * 6, 7);
  owner.makeIndex();
  for (let phase = 0; phase < 3; phase++) {
    if (phase === 1) {
      rows[0].second = 0x111;
      rows[1].flag = 0;
      rows[2].first = 0x301;
    }
    if (phase === 2) owner.makeIndex();
    for (const key of [0x41, 0x42, 0x300, 0x301, -1, 65536, 65537])
      native.emit(owner.find(key), owner.get(key));
  }
  owner.dispose();
  for (const row of rows) native.emit(row.first, row.second, row.flag);
  native.finish();
}, 120000);

test("every BMP input, case flag and module combination matches complete original iterator state", /** Replays all initialized native point observations. @returns Completed replay. */ async () => {
  const native = new NativeWords("points"),
    { Locale, MappingElement, modules, step } = await owners(),
    locale = new Locale(),
    input = new Uint16Array(3);
  for (const flag of fixture.pointFlags)
    for (const module of modules)
      for (let code = 0; code < 65536; code++) {
        input[0] = code;
        const e = new MappingElement();
        e.element.map.set([0x1111, 0x2222, 0x3333]);
        const idx: [number] = [0];
        let initialized = true;
        initialized = step(native, input, idx, 1, e, locale, flag, module, initialized);
        step(native, input, idx, 1, e, locale, flag, module, initialized);
      }
  native.finish();
  locale.dispose();
}, 180000);

test("complete original multi-call histories preserve locale, pending mappings, composition, errors and field identity", /** Replays every original initialized caller history. @returns Completed replay. */ async () => {
  const native = new NativeWords("histories"),
    { Locale, locale, modules, seed, step } = await owners();
  const locales = fixture.languages.map(locale);
  for (const units of fixture.histories)
    for (const lang of locales)
      for (const flag of fixture.pointFlags)
        for (let start = 0; start < 8; start++)
          for (let varying = 0; varying < 2; varying++) {
            const input = Uint16Array.from([...units, 0]),
              saved = input.slice(),
              idx: [number] = [0],
              e = seed();
            let initialized = true;
            for (let call = 0; call < units.length * 3 + 2; call++) {
              initialized = step(
                native,
                input,
                idx,
                units.length,
                e,
                lang,
                flag,
                modules[(start + (varying ? call : 0)) % 8] as number,
                initialized,
              );
              if (
                !input.every(
                  /** Confirms unchanged allocated input. @param unit - Actual unit. @param i - Buffer position. @returns Original equality. */ (
                    unit,
                    i,
                  ) => unit === saved[i],
                )
              )
                throw new Error("Original caller input changed");
            }
          }
  const empty = new Locale(),
    input = Uint16Array.of(0xfb03, 0x41, 0),
    idx: [number] = [0],
    e = seed();
  step(native, input, idx, 2, e, empty, 128, modules[1] as number, true);
  empty.dispose();
  for (const lang of locales) lang.dispose();
  native.finish();
}, 120000);
