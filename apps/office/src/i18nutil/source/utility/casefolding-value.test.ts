/** @fileoverview Replays every complete original native case value, borrowed identity and copy/lifetime observation. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, test, vi } from "vitest";
import fixture from "./native-casefolding-value-cases.json";
import type { MappingConstReference } from "../../inc/casefolding";

/** Complete lossless native row reader; comparisons retain every initialized signed field. */
class NativeRows {
  private bytes: Buffer;
  private cursor = 0;
  private width: number;
  /** Reconstructs and hashes the whole original stream. @param mode - Original native process mode. @returns Reader. */
  constructor(mode: keyof typeof fixture.corpora) {
    const corpus = fixture.corpora[mode];
    this.width = corpus.width;
    this.bytes = gunzipSync(Buffer.from(corpus.gzipBase64, "base64"));
    expect(this.bytes.length).toBe(corpus.rawBytes);
    const previous = new Int32Array(this.width);
    for (let offset = 0; offset < this.bytes.length; offset += 4) {
      const column = (offset / 4) % this.width;
      previous[column] = (previous[column] as number) + this.bytes.readInt32LE(offset);
      this.bytes.writeInt32LE(previous[column] as number, offset);
    }
    expect(createHash("sha256").update(this.bytes).digest("hex")).toBe(corpus.rawHash);
  }
  /** Compares one complete actual field sequence to original native bytes. @param row - Actual observations. @returns Nothing. */
  emit(row: readonly number[]): void {
    for (const actual of row) {
      const expected = this.bytes.readInt32LE(this.cursor);
      if (actual !== expected)
        throw new Error(`Native field ${this.cursor / 4}: ${actual} != ${expected}`);
      this.cursor += 4;
    }
  }
  /** Proves complete stream consumption. @returns Nothing. */
  finish(): void {
    expect(this.cursor).toBe(this.bytes.length);
  }
}

/** Uses fresh actual shared owners, matching the separate native processes. @returns Actual production owners and observers. */
async function owners() {
  vi.resetModules();
  const casefolding = await import("./casefolding"),
    { Locale } = await import("../../../udkapi/com/sun/star/lang/Locale"),
    { OUString } = await import("../../../sal/inc/rtl/ustring"),
    { RuntimeException, cppu_detail_getUnoType } =
      await import("../../../cppu/inc/com/sun/star/uno/RuntimeException"),
    { splitSurrogates } = await import("../../../sal/inc/rtl/character");
  /** Observes every native initialized Mapping member. @param m - Borrowed or returned value. @returns Native observation row. */
  function observe(m: MappingConstReference): number[] {
    return [0, m.type, m.nmap, m.map[0] as number, m.map[1] as number, m.map[2] as number, 0, 0, 0];
  }
  /** Observes actual UNO exception fields and cached actual type, then destroys the caught value. @param e - Actual exception. @returns Native observation row. */
  function exception(e: unknown): number[] {
    if (!(e instanceof RuntimeException)) throw e;
    const name = cppu_detail_getUnoType().getTypeName();
    const ascii = Uint8Array.from(Buffer.from("com.sun.star.uno.RuntimeException", "ascii"));
    const row = [
      1,
      0,
      0,
      0,
      0,
      0,
      e.Message.getLength(),
      Number(e.Context.is()),
      Number(name.equalsAsciiL(ascii, ascii.length)),
    ];
    name.dispose();
    e.dispose();
    return row;
  }
  /** Records either actual returned struct or actual default UNO exception. @param input - Actual native caller units. @param pos - Native position. @param len - Native logical length. @param locale - Actual borrowed Locale. @param flag - Original flags. @returns Complete original observation. */
  function value(
    input: Uint16Array,
    pos: number,
    len: number,
    locale: InstanceType<typeof Locale>,
    flag: number,
  ): number[] {
    try {
      return observe(casefolding.getValue(input, pos, len, locale, flag));
    } catch (e) {
      return exception(e);
    }
  }
  return { casefolding, Locale, OUString, splitSurrogates, observe, exception, value };
}

test("every Unicode input and original defined point flag matches all native value fields", /** Replays the complete original native stream with actual shared owners. @returns Completed replay. */ async () => {
  const native = new NativeRows("points"),
    { Locale, splitSurrogates, value } = await owners(),
    locale = new Locale(),
    input = new Uint16Array(3);
  for (const flag of fixture.flags)
    for (let code = 0; code < 0x110000; code++) {
      input.fill(0);
      const len = splitSurrogates(code, input);
      native.emit(value(input, 0, len, locale, flag));
    }
  native.finish();
  locale.dispose();
}, 120000);

test("every supplementary tail matches the complete original empty Mapping", /** Replays the complete original native stream with actual shared owners. @returns Completed replay. */ async () => {
  const native = new NativeRows("tails"),
    { Locale, splitSurrogates, value } = await owners(),
    locale = new Locale(),
    input = new Uint16Array(3);
  for (let code = 0x10000; code < 0x110000; code++) {
    input.fill(0);
    splitSurrogates(code, input);
    native.emit(value(input, 1, 2, locale, 255));
  }
  native.finish();
  locale.dispose();
}, 120000);

test("all native locale/flag/context calls preserve const identity, independent copies and real exceptions", /** Replays the complete original native stream with actual shared owners. @returns Completed replay. */ async () => {
  const native = new NativeRows("conditions"),
    { casefolding, Locale, OUString, observe, exception, value } = await owners();
  const borrowed = [
    casefolding.mapping_03a3,
    casefolding.mapping_0307,
    casefolding.mapping_004a,
    casefolding.mapping_012e,
    casefolding.mapping_00cc,
    casefolding.mapping_00cd,
    casefolding.mapping_0128,
    casefolding.mapping_0049,
    casefolding.mapping_0069,
    casefolding.mapping_0130,
  ].flat();
  const locales = fixture.languages.map(
    /** Constructs the original caller Locale fields. @param language - Original exact language units. @returns Owned Locale. */ (
      language,
    ) => {
      const units = Uint16Array.from(
          language,
          /** Preserves each original UTF16 unit. @param character - Caller unit. @returns Native unit. */ (
            character,
          ) => character.charCodeAt(0),
        ),
        text = new OUString(units, units.length),
        blank = new OUString(),
        locale = new Locale(text, blank, blank);
      text.dispose();
      blank.dispose();
      return locale;
    },
  );
  for (const context of fixture.contexts)
    for (const character of fixture.characters)
      for (const locale of locales)
        for (let flag = 0; flag < 256; flag++) {
          const [before, after, pos, len] = context as [number, number, number, number],
            input = new Uint16Array(5);
          if (pos > 0) input[pos - 1] = before;
          input[pos] = character;
          input[pos + 1] = after;
          const saved = input.slice();
          let conditional: number[],
            index = -1;
          try {
            const result = casefolding.getConditionalValue(input, pos, len, locale, flag);
            conditional = observe(result);
            index = borrowed.indexOf(result);
          } catch (e) {
            conditional = exception(e);
          }
          const actual = value(input, pos, len, locale, flag);
          let copied: boolean;
          try {
            const copy = casefolding.getValue(input, pos, len, locale, flag),
              initial = observe(copy);
            copy.type ^= 255;
            copy.nmap = 3;
            for (let i = 0; i < 3; i++) copy.map[i] = (copy.map[i] as number) ^ 65535;
            copied = value(input, pos, len, locale, flag).every(
              /** Compares all native fields after mutating the returned copy. @param unit - Actual field. @param i - Field index. @returns Original equality. */ (
                unit,
                i,
              ) => unit === initial[i],
            );
          } catch (e) {
            copied = exception(e).every(
              /** Compares actual exception fields from repeated original calls. @param unit - Actual field. @param i - Field index. @returns Original equality. */ (
                unit,
                i,
              ) => unit === actual[i],
            );
          }
          if (
            !input.every(
              /** Checks every original caller unit. @param unit - Actual unit. @param i - Input position. @returns Original equality. */ (
                unit,
                i,
              ) => unit === saved[i],
            )
          )
            throw new Error("Original caller input changed");
          native.emit([...conditional, index, ...actual, Number(copied)]);
        }
  native.finish();
  for (const locale of locales) locale.dispose();
}, 120000);
