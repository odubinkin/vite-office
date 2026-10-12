/** @fileoverview Whole original ordinary C++ classification, stack and constructor output comparison using real portable token owners. */
import { expect, it } from "vitest";
import { gunzipSync } from "node:zlib";
import original from "./native-token-cases.json";
import { FormulaCompiler } from "./FormulaCompiler";
import { OpCode } from "./opcode";
import { ParamClass } from "./paramclass";
import { FormulaError, CreateDoubleError } from "./errorcodes";
import {
  FormulaToken,
  FormulaFAPToken,
  FormulaByteToken,
  FormulaSpaceToken,
  FormulaDoubleToken,
  FormulaTypedDoubleToken,
  FormulaStringToken,
  FormulaStringOpToken,
  FormulaStringNameToken,
  FormulaIndexToken,
  FormulaExternalToken,
  FormulaMissingToken,
  FormulaJumpToken,
  FormulaUnknownToken,
  FormulaErrorToken,
  StackVar,
  StackVarEnumToString,
  RefCntPolicy,
} from "./token";
import { OUString } from "../../sal/inc/rtl/ustring";
import { SharedString, type SharedStringConstReference } from "../../svl/inc/sharedstring";
import { FormulaTokenRef, FormulaConstTokenRef } from "./types";
import { intrusive_ptr } from "../../external/boost/include/boost/smart_ptr/intrusive_ptr";

/** Serializes the actual original query fields in native output order. @param t - Actual token. @returns Whole query row. */
function value(t: FormulaToken): string {
  return [
    t.GetType(),
    t.GetOpCode(),
    t.GetRef(),
    t.GetRefCntPolicy(),
    Number(t.IsFunction()),
    t.GetParamCount(),
    Number(t.IsRef()),
    Number(t.IsExternalRef()),
    t.GetInForceArray(),
    Number(t.IsInForceArray()),
  ].join(" ");
}

/** Compares real original clone behavior and destroys the copied token. @param t - Actual token. @returns Whole original constructor/copy row. */
function copied(t: FormulaToken): string {
  const p = t.Clone();
  const row =
    value(t) + " | " + value(p) + " " + Number(t.equals(p)) + " " + Number(t.TextEqual(p)) + "\n";
  p.DeleteIfZeroRef();
  return row;
}

it("matches all original UInt16 opcode classifications for initialized actual byte and whitespace classes", /** Verifies: matches all original UInt16 opcode classifications for initialized actual byte and whitespace classes. @returns Nothing. */ () => {
  const rows: string[] = [];
  for (let n = 0; n <= 65535; n++) {
    const op = n as OpCode;
    let row = n + " " + Number(FormulaCompiler.IsOpCodeJumpCommand(op));
    for (const b of [0, 1, 255]) {
      const t =
        op === OpCode.ocWhitespace ? new FormulaSpaceToken(b, 32) : new FormulaByteToken(op, b);
      row += " | " + value(t);
      t.Delete();
    }
    rows.push(row + "\n");
  }
  expect(rows.join("")).toBe(capture("classification"));
});

it("matches all original UInt8 stack names, initialized base queries and clones", /** Verifies: matches all original UInt8 stack names, initialized base queries and clones. @returns Nothing. */ () => {
  const rows: string[] = [];
  for (let n = 0; n <= 255; n++) {
    const type = n as StackVar;
    const token = new FormulaToken(type);
    rows.push(n + " " + StackVarEnumToString(type) + " " + copied(token));
    token.Delete();
  }
  expect(rows.join("")).toBe(capture("stack"));
});

it("matches original named token constructor and clone rows", /** Verifies: matches original named token constructor and clone rows. @returns Nothing. */ () => {
  const rows: string[] = [];
  const base = new FormulaToken(StackVar.svUnknown, OpCode.ocBad);
  rows.push(copied(base));
  const space = new FormulaSpaceToken(255, 0x3000);
  rows.push(copied(space));
  const byte = new FormulaByteToken(OpCode.ocSum, 3, ParamClass.ForceArray);
  rows.push(copied(byte));
  const number = new FormulaDoubleToken(-0);
  rows.push(copied(number));
  const typed = new FormulaTypedDoubleToken(2.5, -7);
  rows.push(copied(typed));
  const text = new OUString(new Uint16Array([65, 0, 66]), 3);
  const string = new SharedString(text);
  text.dispose();
  const str = new FormulaStringToken(string);
  rows.push(copied(str));
  const strOp = new FormulaStringOpToken(OpCode.ocStringXML, string);
  strOp.SetByte(3);
  strOp.SetInForceArray(ParamClass.ForceArray);
  rows.push(copied(strOp));
  const name = new FormulaStringNameToken(StackVar.svStringName, string);
  rows.push(copied(name));
  const index = new FormulaIndexToken(OpCode.ocName, 65535);
  rows.push(copied(index));
  const externalText = new OUString(new Uint16Array([69, 120, 116, 101, 114, 110, 97, 108]), 8);
  const external = new FormulaExternalToken(OpCode.ocExternal, 3, externalText);
  externalText.dispose();
  rows.push(copied(external));
  const missing = new FormulaMissingToken();
  rows.push(copied(missing));
  const jump = new FormulaJumpToken(OpCode.ocChoose, new Int16Array([3, 1, -7, 32000]));
  rows.push(copied(jump));
  const unknown = new FormulaUnknownToken(OpCode.ocBad);
  rows.push(copied(unknown));
  const error = new FormulaErrorToken();
  rows.push(copied(error));
  const rhs = new FormulaErrorToken(FormulaError.DivisionByZero);
  error.IncRef();
  error.SetRefCntPolicy(RefCntPolicy.UnsafeRef);
  error.assign(rhs);
  rows.push(copied(error));
  for (const token of [
    base,
    space,
    byte,
    number,
    typed,
    str,
    strOp,
    name,
    index,
    external,
    missing,
    jump,
    unknown,
    error,
    rhs,
  ])
    token.Delete();
  string.dispose();
  expect(rows.join("")).toBe(capture("values"));
});

it("matches original intrusive reference and FAP lifetime streams through actual pointee hooks", /** Verifies: matches original intrusive reference and FAP lifetime streams through actual pointee hooks. @returns Nothing. */ () => {
  const originalToken = new FormulaDoubleToken(9);
  const a = new FormulaTokenRef(originalToken);
  const rows: string[] = [];
  /** Emits the original live raw pointer/count observation. @param label - Native row label. @returns Nothing. */
  function emit(label: string): void {
    rows.push(
      label + " " + originalToken.GetRef() + " " + Number(a.get() === originalToken) + "\n",
    );
  }
  emit("raw");
  const b = new FormulaTokenRef(a);
  emit("copy");
  a.assign(a);
  emit("self_copy");
  a.assignPointer(originalToken);
  emit("raw_assign");
  const m = intrusive_ptr.move(b);
  emit("move");
  rows.push("moved_null " + Number(b.get() === null) + "\n");
  m.moveAssign(m);
  emit("self_move");
  a.moveAssign(m);
  emit("move_assign");
  const p = a.detach();
  emit("detach");
  a.reset(p, false);
  emit("adopt");
  a.reset(originalToken);
  emit("same_reset");
  const c = new FormulaConstTokenRef(originalToken);
  emit("const");
  c.dispose();
  emit("const_end");
  const f = new FormulaFAPToken(OpCode.ocSum, 2, originalToken);
  emit("fap");
  const clone = f.Clone();
  emit("fap_copy");
  rows.push("fap_equal " + Number(f.equals(clone)) + "\n");
  clone.Delete();
  emit("fap_copy_end");
  f.Delete();
  emit("fap_end");
  m.dispose();
  b.dispose();
  emit("copy_scope_end");
  a.reset();
  rows.push("reset_null " + Number(a.get() === null) + "\n");
  a.dispose();
  expect(rows.join("")).toBe(capture("ownership"));
});

/** Decodes the complete native output, retaining the stored length invariant. @param mode - Original capture mode. @returns Whole original output. */
function capture(mode: keyof typeof original.captures): string {
  const record = original.captures[mode];
  const bytes = gunzipSync(Buffer.from(record.gzipBase64, "base64"));
  expect(bytes.length).toBe(record.byteLength);
  return bytes.toString();
}

it("matches original shared string token ownership, assignment and member identity streams", /** Verifies all real string token families over nullable, original/folded and aliased data with copy/move arguments. @returns Nothing. */ () => {
  const x = new OUString(new Uint16Array([65, 0, 66]), 3);
  const y = new OUString(new Uint16Array([97, 0, 98]), 3);
  const rows: string[] = [];
  /** Captures logical native pointer identities without physical addresses. @param s - Actual shared value. @returns Original pointer identity pair. */
  function data(s: SharedStringConstReference): string {
    return (
      " " +
      (s.getData() === null ? -1 : s.getData() === x.pData ? 1 : 2) +
      " " +
      (s.getDataIgnoreCase() === null ? -1 : s.getDataIgnoreCase() === x.pData ? 1 : 2)
    );
  }
  for (let pattern = 0; pattern < 5; pattern++)
    for (let kind = 0; kind < 3; kind++)
      for (const moved of [false, true]) {
        rows.push("case " + pattern + " " + kind + " " + Number(moved) + "\n");
        const s = new SharedString(
          pattern === 1 || pattern === 3 || pattern === 4 ? x.pData : null,
          pattern === 2 || pattern === 3 ? y.pData : pattern === 4 ? x.pData : null,
        );
        const t =
          kind === 0
            ? moved
              ? new FormulaStringToken(s, SharedString.move)
              : new FormulaStringToken(s)
            : kind === 1
              ? moved
                ? new FormulaStringOpToken(OpCode.ocStringName, s, SharedString.move)
                : new FormulaStringOpToken(OpCode.ocStringName, s)
              : moved
                ? new FormulaStringNameToken(StackVar.svStringName, s, SharedString.move)
                : new FormulaStringNameToken(StackVar.svStringName, s);
        /** Captures the actual owned shared member and live data counts. @param name - Native label. @param token - Original string-family token. @returns Nothing. */
        function snap(name: string, token: FormulaStringToken | FormulaStringNameToken): void {
          rows.push(
            name +
              data(token.GetString()) +
              " " +
              x.pData?.refCount +
              " " +
              y.pData?.refCount +
              "\n",
          );
        }
        snap("token", t);
        rows.push("source" + data(s) + "\n");
        const c = t.Clone() as FormulaStringToken | FormulaStringNameToken;
        snap("clone", c);
        rows.push("equal " + Number(t.equals(c)) + " " + Number(t.TextEqual(c)) + "\n");
        if (kind !== 2) {
          const str = t as FormulaStringToken,
            address = str.GetString();
          str.SetString(str.GetString());
          snap("self_string", t);
          rows.push("same_member " + Number(address === str.GetString()) + "\n");
          const replacement = new SharedString(y.pData, x.pData);
          str.SetString(replacement);
          snap("assigned_string", t);
          rows.push("after_assign_equal " + Number(t.equals(c)) + "\n");
          replacement.dispose();
        }
        c.Delete();
        snap("clone_end", t);
        t.Delete();
        rows.push("token_end " + x.pData?.refCount + " " + y.pData?.refCount + "\n");
        s.dispose();
        rows.push("source_end " + x.pData?.refCount + " " + y.pData?.refCount + "\n");
      }
  expect(rows.join("")).toBe(capture("strings"));
  x.dispose();
  y.dispose();
});

it("matches original scalar narrowing, typed doubles and owned jump payload fields", /** Verifies whole ordinary original field observations including clone independence and IEEE payloads. @returns Nothing. */ () => {
  const rows: string[] = [];
  for (const n of [
    -65537, -65536, -1, 0, 1, 127, 128, 255, 256, 257, 32767, 32768, 65535, 65536, 2147483647,
    -2147483648,
  ]) {
    const space = new FormulaSpaceToken(n, n),
      s = space.Clone() as FormulaSpaceToken;
    const byte = new FormulaByteToken(OpCode.ocSum);
    byte.SetByte(n);
    byte.SetInForceArray(n as ParamClass);
    const b = byte.Clone() as FormulaByteToken;
    const typed = new FormulaTypedDoubleToken(n / 2, n),
      t = typed.Clone() as FormulaTypedDoubleToken;
    typed.SetDoubleType(n + 1);
    const index = new FormulaIndexToken(OpCode.ocName, n);
    index.SetIndex(n + 1);
    index.SetSheet(n);
    const i = index.Clone() as FormulaIndexToken;
    const error = new FormulaErrorToken(n as FormulaError);
    error.SetError((n + 1) as FormulaError);
    const e = error.Clone() as FormulaErrorToken;
    rows.push(
      [
        n,
        s.GetByte(),
        s.GetChar(),
        b.GetByte(),
        b.GetInForceArray(),
        t.GetDoubleType(),
        typed.GetDoubleType(),
        i.GetIndex(),
        i.GetSheet(),
        e.GetError(),
      ].join(" ") + "\n",
    );
    for (const token of [space, s, byte, b, typed, t, index, i, error, e]) token.Delete();
  }
  for (const n of [
    0,
    -0,
    2.5,
    -2.5,
    Number.MIN_VALUE,
    Number.MAX_VALUE,
    Infinity,
    -Infinity,
    CreateDoubleError(FormulaError.DivisionByZero),
  ]) {
    const a = new FormulaDoubleToken(n),
      c = a.Clone() as FormulaDoubleToken;
    const bits = new DataView(new ArrayBuffer(8));
    bits.setFloat64(0, c.GetDouble(), false);
    let row =
      "double " +
      bits.getBigUint64(0, false).toString(16).padStart(16, "0") +
      " " +
      c.GetDoubleType() +
      " " +
      Number(a.equals(c));
    a.SetDouble(17.25);
    row += " " + a.GetDouble() + "\n";
    rows.push(row);
    a.Delete();
    c.Delete();
  }
  for (const count of [0, 1, 3]) {
    const j = new FormulaJumpToken(OpCode.ocIf, new Int16Array([count, 1, -7, 32000]));
    j.SetInForceArray(ParamClass.ReferenceOrForceArray);
    const c = j.Clone() as FormulaJumpToken;
    let row = "jump " + count;
    for (let n = 0; n <= count; n++) row += " " + c.GetJump()[n];
    row +=
      " " +
      Number(j.equals(c)) +
      " " +
      Number(j.GetJump() === c.GetJump()) +
      " " +
      c.GetInForceArray();
    if (count !== 0) c.GetJump()[1] = -8;
    row += " " + Number(j.equals(c)) + "\n";
    rows.push(row);
    j.Delete();
    c.Delete();
  }
  expect(rows.join("")).toBe(capture("fields"));
});

it("matches all original string-op parameter counts including the early-filtered and reachable byte cases", /** Verifies: matches all original string-op parameter counts including the early-filtered and reachable byte cases. @returns Nothing. */ () => {
  const string = new SharedString();
  const rows: string[] = [];
  for (let n = 0; n <= 65535; n++) {
    let row = String(n);
    for (const b of [0, 1, 255]) {
      const token = new FormulaStringOpToken(n as OpCode, string);
      token.SetByte(b);
      row += " " + token.GetParamCount();
      token.Delete();
    }
    rows.push(row + "\n");
  }
  string.dispose();
  expect(rows.join("")).toBe(capture("string-param"));
});
