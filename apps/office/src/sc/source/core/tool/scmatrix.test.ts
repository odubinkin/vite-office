/** @fileoverview Complete selected original matrix value streams over actual SharedString ownership and formula error helpers. */
import { expect, it } from "vitest";
import { gunzipSync } from "node:zlib";
import original from "./native-matrix-value-cases.json";
import { ScMatrixValue } from "../../../inc/scmatrix";
import { ScMatValType } from "../../../inc/types";
import { FormulaError, CreateDoubleError } from "../../../../formula/inc/errorcodes";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";

/** Decodes a complete original native stream. @param mode - Original capture. @returns Whole original output. */
function capture(mode: keyof typeof original.captures): string {
  const item = original.captures[mode],
    bytes = gunzipSync(Buffer.from(item.gzipBase64, "base64"));
  expect(bytes.length).toBe(item.byteLength);
  return bytes.toString("utf8");
}
/** Reads original fields and queries in the native caller order. @param f - Actual value. @returns Whole original row. */
function value(f: ScMatrixValue): string {
  const bits = new DataView(new ArrayBuffer(8));
  bits.setFloat64(0, f.fVal, false);
  return [
    f.nType,
    bits.getBigUint64(0, false).toString(16).padStart(16, "0"),
    f.GetError(),
    Number(f.GetBoolean()),
    Number(f.GetString().isValid()),
    Number(f.GetString().isEmpty()),
    f.GetString().getLength(),
  ].join(" ");
}

it("matches all original matrix UInt8 tags, IEEE comparisons and error payload queries", /** Verifies all256tags over initialized values and all65536encoded errors with complete output. @returns Nothing. */ () => {
  const rows: string[] = [];
  const d = new ScMatrixValue();
  rows.push(
    "types " +
      [
        ScMatValType.Value,
        ScMatValType.Boolean,
        ScMatValType.String,
        ScMatValType.Empty,
        ScMatValType.EmptyPath,
        ScMatValType.NonvalueMask,
      ].join(" ") +
      "\ndefault " +
      value(d) +
      "\n",
  );
  d.dispose();
  const a = new OUString(65),
    b = new OUString(66),
    sa = new SharedString(a),
    sb = new SharedString(b);
  for (let type = 0; type <= 255; type++)
    for (const v of [
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
      const t = new ScMatrixValue();
      t.nType = type as ScMatValType;
      t.fVal = v;
      t.aStr = sa;
      const copy = new ScMatrixValue(t),
        number = new ScMatrixValue(t),
        string = new ScMatrixValue(t),
        other = new ScMatrixValue(t);
      number.fVal = 1;
      string.aStr = sb;
      other.nType = ((type + 1) % 256) as ScMatValType;
      rows.push(
        type +
          " " +
          value(copy) +
          " " +
          [t.equals(copy), t.notEquals(copy), t.equals(number), t.equals(string), t.equals(other)]
            .map(Number)
            .join(" ") +
          "\n",
      );
      other.dispose();
      string.dispose();
      number.dispose();
      copy.dispose();
      t.dispose();
    }
  for (let n = 0; n <= 65535; n++) {
    const v = new ScMatrixValue();
    v.fVal = CreateDoubleError(n as FormulaError);
    rows.push("error " + n + " " + v.GetError() + " " + Number(v.GetBoolean()) + "\n");
    v.dispose();
  }
  expect(rows.join("")).toBe(capture("scalar"));
  sb.dispose();
  sa.dispose();
  b.dispose();
  a.dispose();
});

it("matches original matrix value copy assignment and rvalue copy ownership", /** Verifies real nullable/aliased string pointers, copy-only rvalues, assignment return/member identity and destruction. @returns Nothing. */ () => {
  const x = new OUString(new Uint16Array([65, 0, 66]), 3),
    y = new OUString(new Uint16Array([97, 0, 98]), 3),
    rows: string[] = [];
  /** Reads live original pointer identities and shared counts. @param label - Native label. @param f - Actual original value. @returns Nothing. */
  function snap(label: string, f: ScMatrixValue): void {
    rows.push(
      label +
        " " +
        value(f) +
        " " +
        (f.aStr.getData() === null ? -1 : f.aStr.getData() === x.pData ? 1 : 2) +
        " " +
        (f.aStr.getDataIgnoreCase() === null
          ? -1
          : f.aStr.getDataIgnoreCase() === x.pData
            ? 1
            : 2) +
        " " +
        x.pData?.refCount +
        " " +
        y.pData?.refCount +
        "\n",
    );
  }
  for (let pattern = 0; pattern < 5; pattern++) {
    rows.push("case " + pattern + "\n");
    const s = new SharedString(
      pattern === 1 || pattern === 3 || pattern === 4 ? x.pData : null,
      pattern === 2 || pattern === 3 ? y.pData : pattern === 4 ? x.pData : null,
    );
    const a = new ScMatrixValue(),
      member = a.aStr;
    a.aStr = s;
    a.nType = ScMatValType.String;
    a.fVal = -2.5;
    snap("a", a);
    const c = new ScMatrixValue(a);
    snap("copy", c);
    const r = new ScMatrixValue(a);
    snap("rvalue_copy", r);
    snap("source_after", a);
    const assigned = new ScMatrixValue(),
      assignedMember = assigned.aStr;
    rows.push("return " + Number(assigned.assign(c) === assigned) + "\n");
    snap("assigned", assigned);
    rows.push("self_return " + Number(c.assign(c) === c) + "\n");
    snap("self", c);
    rows.push("rvalue_return " + Number(assigned.assign(r) === assigned) + "\n");
    snap("rvalue_assigned", assigned);
    snap("rvalue_source", r);
    rows.push(
      "member_identity " +
        [a.aStr === member, assigned.aStr === assignedMember, a.GetString() === member]
          .map(Number)
          .join(" ") +
        "\n",
    );
    assigned.dispose();
    r.dispose();
    c.dispose();
    snap("after_scope", a);
    const selfString = a.aStr;
    a.aStr = selfString;
    snap("self_string", a);
    a.dispose();
    s.dispose();
    rows.push("clear " + x.pData?.refCount + " " + y.pData?.refCount + "\n");
  }
  expect(rows.join("")).toBe(capture("owned"));
  y.dispose();
  x.dispose();
});

it("matches original matrix tag field UInt8 narrowing and scalar copy assignment", /** Verifies original fixed enum field and actual member-wise assignment without replacing shared members. @returns Nothing. */ () => {
  const rows: string[] = [];
  for (const n of [
    -65537, -65536, -1, 0, 1, 2, 3, 4, 255, 256, 257, 65535, 65536, 65537, -2147483648, 2147483647,
  ]) {
    const a = new ScMatrixValue();
    a.nType = n as ScMatValType;
    a.fVal = n + 0.5;
    const c = new ScMatrixValue(a),
      b = new ScMatrixValue();
    b.assign(c);
    rows.push(n + " " + value(a) + " | " + value(b) + " " + Number(a.equals(b)) + "\n");
    b.dispose();
    c.dispose();
    a.dispose();
  }
  expect(rows.join("")).toBe(capture("fields"));
});
