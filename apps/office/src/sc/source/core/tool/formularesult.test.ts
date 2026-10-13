/** @fileoverview Compares complete original FormulaResultValue constructors, implicit special members and real shared string lifetime streams. */
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { FormulaResultValue as F, FormulaResultValueType } from "../../../inc/formularesult";
import { FormulaError, CreateDoubleError } from "../../../../formula/inc/errorcodes";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import fixture from "./native-formularesult-value-cases.json";

/** Decodes and verifies the complete committed original caller output. @param mode - Native mode. @returns Whole original stream. */
function original(mode: keyof typeof fixture.captures): string {
  const capture = fixture.captures[mode];
  const bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(bytes.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(capture.sha256);
  return bytes.toString();
}

/** Observes original struct fields without guessing the result type from content. @param f - Actual struct. @returns Whole native field observation. */
function value(f: F): string {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, f.mfValue, true);
  return `${f.meType} ${view.getBigUint64(0, true).toString(16).padStart(16, "0")} ${Number(f.mbMultiLine)} ${f.mnError} ${Number(f.maString.isValid())} ${Number(f.maString.isEmpty())} ${f.maString.getLength()}`;
}

it("matches all original scalar constructor and encoded error value distinctions", /** Compares every UInt16 error against the separate double and encoded-double constructors. @returns Nothing. */ () => {
  let stream = `types ${F.Type.Invalid} ${F.Type.Value} ${F.Type.String} ${F.Type.Error}\n`;
  const zero = new F();
  stream += `default ${value(zero)}\n`;
  zero.dispose();
  for (let n = 0; n <= 65535; ++n) {
    const error = new F(n as FormulaError, FormulaError);
    const scalar = new F(n);
    const nan = new F(CreateDoubleError(n as FormulaError));
    stream += `${n} E ${value(error)} V ${value(scalar)} N ${value(nan)}\n`;
    nan.dispose();
    scalar.dispose();
    error.dispose();
  }
  for (const n of [
    -0,
    -2.5,
    Math.PI,
    Number.MIN_VALUE,
    Number.MAX_VALUE,
    -Number.MAX_VALUE,
    Infinity,
    -Infinity,
  ]) {
    const v = new F(n),
      copy = new F(v),
      move = F.move(v);
    stream += `special ${value(copy)} | ${value(move)} | ${value(v)}\n`;
    move.dispose();
    copy.dispose();
    v.dispose();
  }
  expect(stream).toBe(original("scalar"));
  expect(F.Type).toBe(FormulaResultValueType);
  expect([F.Invalid, F.Value, F.String, F.Error]).toEqual([0, 1, 2, 3]);
});

it("matches complete original shared string ownership and struct special member stream", /** Compares all independent/null/aliased original and folded pointer combinations with copy/move/assignment lifetimes. @returns Nothing. */ () => {
  const x = new OUString(new Uint16Array([65, 0, 66]), 3);
  const y = new OUString(new Uint16Array([97, 0, 98]), 3);
  const rows: string[] = [];
  /** Observes original nullable pointer identity. @param s - Actual string. @returns Original/folded identity pair. */
  function strings(s: SharedString): string {
    return ` ${s.getData() === null ? -1 : s.getData() === x.pData ? 1 : 2} ${s.getDataIgnoreCase() === null ? -1 : s.getDataIgnoreCase() === x.pData ? 1 : 2}`;
  }
  /** Observes the entire struct and shared reference state. @param name - Caller label. @param f - Struct. @returns Nothing. */
  function snap(name: string, f: F): void {
    rows.push(`${name} ${value(f)}${strings(f.maString)} ${x.pData.refCount} ${y.pData.refCount}`);
  }
  /** Creates the same real pointer pair as the unchanged native caller. @param pattern - Original combination. @returns Shared value. */
  function source(pattern: number): SharedString {
    return new SharedString(
      pattern === 1 || pattern === 3 || pattern === 4 ? x.pData : null,
      pattern === 2 || pattern === 3 ? y.pData : pattern === 4 ? x.pData : null,
    );
  }
  for (let pattern = 0; pattern < 5; ++pattern)
    for (const multi of [false, true])
      for (const moved of [false, true]) {
        rows.push(`case ${pattern} ${Number(multi)} ${Number(moved)}`);
        const s = source(pattern);
        const a = moved ? new F(s, multi, SharedString.move) : new F(s, multi);
        snap("a", a);
        rows.push(`input${strings(s)} ${x.pData.refCount} ${y.pData.refCount}`);
        const copy = new F(a);
        snap("copy", copy);
        const transfer = F.move(a);
        snap("transfer", transfer);
        snap("moved", a);
        const assign = new F(17);
        rows.push(`copy_return ${Number(assign.assign(copy) === assign)}`);
        snap("assigned", assign);
        rows.push(`self_copy ${Number(copy.assign(copy) === copy)}`);
        snap("self", copy);
        rows.push(`move_return ${Number(assign.moveAssign(transfer) === assign)}`);
        snap("move_assigned", assign);
        snap("source_after", transfer);
        assign.dispose();
        transfer.dispose();
        copy.dispose();
        snap("after_scope", a);
        a.dispose();
        rows.push(`after_value${strings(s)} ${x.pData.refCount} ${y.pData.refCount}`);
        s.dispose();
        rows.push(`clear ${x.pData.refCount} ${y.pData.refCount}`);
      }
  /** Constructs each original result kind, matching native prvalue string ownership. @param kind - Constructor kind. @returns Actual struct. */
  function make(kind: number): F {
    if (kind === 0) return new F();
    if (kind === 1) return new F(-2.5);
    if (kind === 2) {
      const s = source(3),
        f = new F(s, true, SharedString.move);
      s.dispose();
      return f;
    }
    return new F(FormulaError.DivisionByZero, FormulaError);
  }
  for (let from = 0; from < 4; ++from)
    for (let to = 0; to < 4; ++to)
      for (const move of [false, true]) {
        rows.push(`assign_case ${from} ${to} ${Number(move)}`);
        const a = make(from),
          b = make(to);
        snap("from", a);
        snap("to", b);
        if (move) b.moveAssign(a);
        else b.assign(a);
        snap("after_from", a);
        snap("after_to", b);
        b.dispose();
        a.dispose();
        rows.push(`clear ${x.pData.refCount} ${y.pData.refCount}`);
      }
  const empty = new F();
  rows.push(`empty_self_move ${Number(empty.moveAssign(empty) === empty)}`);
  snap("empty", empty);
  empty.dispose();
  expect(rows.join("\n") + "\n").toBe(original("owned"));
  expect(x.pData.refCount).toBe(1);
  expect(y.pData.refCount).toBe(1);
  y.dispose();
  x.dispose();
});

it("preserves explicit original error type even when its code is NONE", /** Prevents numeric-value guessing or normalization of original independent fields. @returns Nothing. */ () => {
  const error = new F(FormulaError.NONE, FormulaError);
  const numeric = new F(FormulaError.DivisionByZero);
  expect(error.meType).toBe(F.Type.Error);
  expect(error.mnError).toBe(FormulaError.NONE);
  expect(error.mfValue).toBe(0);
  expect(numeric.meType).toBe(F.Type.Value);
  expect(numeric.mfValue).toBe(532);
  expect(numeric.mnError).toBe(FormulaError.NONE);
  numeric.dispose();
  error.dispose();
});

it("matches original public field narrowing and shared member reference assignment", /** Compares native UInt8/UInt16 assignment, by-reference shared member identity and implicit copies. @returns Nothing. */ () => {
  const x = new OUString(new Uint16Array([65, 0, 66]), 3);
  const y = new OUString(new Uint16Array([97, 0, 98]), 3);
  const s = new SharedString(x.pData, y.pData);
  const rows: string[] = [];
  for (const n of [
    -65537, -65536, -1, 0, 1, 2, 3, 4, 255, 256, 257, 65535, 65536, 65537, -2147483648, 2147483647,
  ]) {
    const f = new F(),
      member = f.maString;
    f.mfValue = n + 0.5;
    f.meType = n as FormulaResultValueType;
    f.mnError = n as FormulaError;
    f.mbMultiLine = Boolean(n % 2);
    f.maString = s;
    rows.push(
      `field ${n} ${value(f)} ${Number(member === f.maString)} ${x.pData.refCount} ${y.pData.refCount}`,
    );
    f.maString = member;
    const copy = new F(f),
      move = F.move(f);
    rows.push(
      `members ${value(f)} | ${value(copy)} | ${value(move)} ${Number(member === f.maString)} ${x.pData.refCount} ${y.pData.refCount}`,
    );
    move.dispose();
    copy.dispose();
    f.dispose();
  }
  rows.push(`clear ${x.pData.refCount} ${y.pData.refCount}`);
  expect(rows.join("\n") + "\n").toBe(original("fields"));
  s.dispose();
  y.dispose();
  x.dispose();
});
