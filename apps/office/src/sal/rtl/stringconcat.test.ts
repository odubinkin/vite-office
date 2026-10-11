/** @fileoverview Complete unchanged native StringNumber, borrowed StringConcat and actual OUString materialization observations. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it, vi } from "vitest";
import fixture from "./native-stringconcat-cases.json";

/** Loads independent original process-mode state and a complete native stream comparator. @param mode - Original observation mode. @returns Actual shared owners and observer functions. */
async function context(mode: keyof typeof fixture.captures) {
  vi.resetModules();
  const strings = await import("../inc/rtl/ustring");
  const expressions = await import("../inc/rtl/stringconcat");
  const header = await import("../inc/rtl/ustring.h");
  const template = await import("./strtmpl");
  const expected = gunzipSync(Buffer.from(fixture.captures[mode].gzipBase64, "base64"));
  const actual = new Int32Array(expected.length / 4);
  let cursor = 0;
  /** Records complete original signed32 observations. @param values - Observed row. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const value of values) actual[cursor++] = Number(value);
  }
  /** Compares all initialized native observations and full stream hash. @returns Nothing. */
  function finish(): void {
    const output = Buffer.from(actual.buffer);
    expect(cursor).toBe(actual.length);
    expect(createHash("sha256").update(output).digest("hex")).toBe(fixture.captures[mode].digest);
    expect(output.equals(expected)).toBe(true);
  }
  /** Observes actual materialized original string data and zero. @param value - Original owned string. @returns Nothing. */
  function string(value: InstanceType<typeof strings.OUString>): void {
    emit(value.pData.refCount, value.getLength(), value.getStr()[value.getLength()] as number);
    for (let i = 0; i < value.getLength(); i++) emit(value.getStr()[i] as number);
  }
  /** Observes every initialized number unit, borrowed buffer and view. @param value - Original fixed local number. @returns Nothing. */
  function number(value: InstanceType<typeof expressions.StringNumber>): void {
    emit(value.length, value.getStr() === value.buf, value.view().length);
    for (let i = 0; i <= value.length; i++) emit(value.getStr()[i] as number);
  }
  return { strings, expressions, header, template, emit, finish, string, number };
}

it("matches original fixed number representations and owned OUString number materialization" /** Replays signed32/signed64/unsigned64 original local buffers without inventing spare native units. @returns Completion. */, async () => {
  const c = await context("numbers"),
    { OUString } = c.strings;
  for (let i = -32768; i < 32768; i++) {
    const n = OUString.number(i);
    c.emit(0, i, 0, 10);
    c.number(n);
    const value = new OUString(OUString.number(i));
    c.string(value);
    value.dispose();
  }
  for (let radix = 2; radix <= 36; radix++) {
    for (const value of [-2147483647, -32768, -1, 0, 1, 32767, 2147483647]) {
      const n = OUString.number(value, radix);
      c.emit(0, value, 0, radix);
      c.number(n);
      c.emit(n.toAsciiUpperCase() === n);
      c.number(n);
      const string = new OUString(n);
      c.string(string);
      string.dispose();
    }
    for (const value of [-9223372036854775807n, -32768n, -1n, 0n, 1n, 9223372036854775807n]) {
      const n = OUString.number(value, radix),
        bits = BigInt.asUintN(64, value);
      c.emit(1, Number(BigInt.asIntN(32, bits)), Number(BigInt.asIntN(32, bits >> 32n)), radix);
      c.number(n);
      const string = new OUString(n);
      c.string(string);
      string.dispose();
    }
    const n = new c.expressions.StringNumber(
      c.header.RTL_USTR_MAX_VALUEOFUINT64,
      c.header.rtl_ustr_valueOfUInt64,
      18446744073709551615n,
      radix,
    );
    c.emit(2, -1, -1, radix);
    c.number(n);
    const string = new OUString(n);
    c.string(string);
    string.dispose();
  }
  c.finish();
});

it("matches all65536 original UTF16 expression units and borrowed destination offsets" /** Replays actual known-length views, marker and const ASCII helpers through original expression owners. @returns Completion. */, async () => {
  const c = await context("unicode"),
    { OUString } = c.strings;
  const sep = new Uint8Array([58, 58, 0]);
  for (let unit = 0; unit < 65536; unit++) {
    const view = new Uint16Array([unit]),
      marker = OUString.Concat(view);
    const expression = new c.expressions.StringConcat(marker, sep);
    const output = new Uint16Array(8).fill(0xbeef),
      end = expression.addData(output.subarray(1));
    c.emit(unit, expression.length(), (end.byteOffset - output.byteOffset) / 2);
    c.emit(...output);
    const value = new OUString(expression);
    c.string(value);
    value.dispose();
  }
  c.finish();
});

it("matches original lazy operand references, owner changes, literals and distinct empty allocation" /** Holds each original operand alive through delayed materialization and observes every initialized result. @returns Completion. */, async () => {
  const c = await context("borrowed"),
    { OUString } = c.strings;
  const source = new OUString(new Uint16Array([97, 0, 0xd800, 98]), 4);
  const n = OUString.number(35, 36),
    marker = OUString.Concat(source);
  const first = new c.expressions.StringConcat(marker, new Uint8Array([58, 0]));
  const expression = new c.expressions.StringConcat(first, n);
  c.emit(source.pData.refCount);
  const original = new OUString(expression);
  c.string(original);
  c.emit(source.pData.refCount);
  const next = new OUString(new Uint16Array([0xdc00, 90]), 2);
  source.moveAssign(next);
  next.dispose();
  n.buf[0] = 120;
  c.emit(expression.length(), source.pData.refCount);
  const changed = new OUString(expression);
  c.string(changed);
  c.string(original);
  source.clear();
  n.length = 0;
  n.buf[0] = 0;
  const final = new OUString(expression);
  c.string(final);
  c.emit(source.pData.refCount);
  const zero = new OUString(OUString.Concat(new Uint16Array())),
    defaultValue = new OUString();
  c.string(zero);
  c.emit(zero.pData === defaultValue.pData);
  const literal = new c.strings.OUStringLiteral(new Uint16Array([76, 0]));
  const lm = OUString.Concat(literal),
    mix = new c.expressions.StringConcat(lm, source);
  const ls = new OUString(mix);
  c.string(ls);
  c.emit(literal.str.refCount, source.pData.refCount);
  for (const value of [source, original, changed, final, zero, defaultValue, ls]) value.dispose();
  c.finish();
});

it("matches original complete ASCII-uppercase replacement and checked range or literal guards" /** Replays Unicode strategy predicates and every initialized C buffer unit, retaining original guard diagnostics. @returns Completion. */, async () => {
  const c = await context("uppercase");
  for (let unit = 0; unit < 65536; unit++) {
    const data = new Uint16Array([unit, 0xbeef]);
    c.header.rtl_ustr_toAsciiUpperCase_WithLength(data, 1);
    c.emit(unit, data[0] as number, data[1] as number, c.template.toAsciiUpper.Applicable()(unit));
  }
  const data = new Uint16Array([97, 0, 98]);
  c.header.rtl_ustr_toAsciiUpperCase_WithLength(data, 3);
  c.emit(...data);
  c.header.rtl_ustr_toAsciiUpperCase_WithLength(data, 0);
  c.emit(...data);
  c.finish();
  expect(fixture.assertions).toHaveLength(2);
  expect(fixture.assertions[0]?.stderr).toContain("len >= 0");
  expect(fixture.assertions[1]?.stderr).toContain("strlen( str ) == N - 1");
  expect(
    /** Calls the original invalid-length boundary. @returns Nothing. */
    () => c.header.rtl_ustr_toAsciiUpperCase_WithLength(data, -1),
  ).toThrow("len >= 0");
  expect(
    /** Invokes the original const-char-array helper guard. @returns Original unreachable length. */
    () => c.expressions.ToStringHelper.length(new Uint8Array([97, 0, 98, 0])),
  ).toThrow("strlen( str ) == N - 1");
});

it("matches every original nonzero signed-char literal conversion and complete materialization" /** Replays the actual selected native signed-char target without normalizing non-ASCII bytes. @returns Completion. */, async () => {
  const c = await context("bytes"),
    { OUString } = c.strings;
  for (let unit = 1; unit < 256; unit++) {
    const expression = OUString.Concat(new Uint8Array([unit, 0]));
    const output = new Uint16Array(4).fill(0xbeef),
      end = expression.addData(output.subarray(1));
    c.emit(unit, expression.length(), (end.byteOffset - output.byteOffset) / 2);
    c.emit(...output);
    const value = new OUString(expression);
    c.string(value);
    value.dispose();
  }
  c.finish();
});
