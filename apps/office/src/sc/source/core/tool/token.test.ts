/** @fileoverview Whole original empty/hybrid result token observations over real shared owners, preserving native value categories and counts. */
import { expect, it } from "vitest";
import { gunzipSync } from "node:zlib";
import original from "./native-result-token-cases.json";
import { ScEmptyCellToken, ScHybridCellToken } from "../../../inc/token";
import { FormulaToken, FormulaDoubleToken, RefCntPolicy } from "../../../../formula/inc/token";
import { FormulaError, CreateDoubleError } from "../../../../formula/inc/errorcodes";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString } from "../../../../svl/inc/sharedstring";

/** Restores the whole original native stream. @param mode - Capture label. @returns Original bytes as text. */
function capture(mode: keyof typeof original.captures): string {
  const value = original.captures[mode];
  const bytes = gunzipSync(Buffer.from(value.gzipBase64, "base64"));
  expect(bytes.length).toBe(value.byteLength);
  return bytes.toString("utf8");
}
/** Reads native base fields in original caller order. @param t - Actual token. @returns Whole row. */
function base(t: FormulaToken): string {
  return [t.GetType(), t.GetOpCode(), t.GetRef(), t.GetRefCntPolicy()].join(" ");
}
/** Reads the genuine formula member in original UTF16 order. @param s - Actual original value. @returns Whole row. */
function text(s: OUStringConstReference): string {
  return " " + [s.getLength(), ...s.getStr().subarray(0, s.getLength())].join(" ");
}

it("matches complete original empty token flags, clone policy and equality stream", /** Verifies all flag pairs and original base copy initialization. @returns Nothing. */ () => {
  const rows: string[] = [];
  for (const inherited of [false, true])
    for (const displayed of [false, true]) {
      const a = new ScEmptyCellToken(inherited, displayed);
      a.IncRef();
      a.SetRefCntPolicy(RefCntPolicy.UnsafeRef);
      const c = a.Clone() as ScEmptyCellToken;
      let row =
        base(a) +
        " | " +
        base(c) +
        " " +
        Number(c.IsInherited()) +
        " " +
        Number(c.IsDisplayedAsString());
      for (const ri of [false, true])
        for (const rd of [false, true]) {
          const b = new ScEmptyCellToken(ri, rd);
          row += " " + Number(a.equals(b)) + " " + Number(a.TextEqual(b));
          b.Delete();
        }
      const other = new FormulaDoubleToken(0);
      row += " " + Number(a.equals(other)) + "\n";
      rows.push(row);
      c.Delete();
      other.Delete();
      a.DecRef();
    }
  expect(rows.join("")).toBe(capture("empty"));
});

it("matches complete original hybrid token shared ownership and formula copy move stream", /** Verifies nullable/aliased shared data, formula categories, member queries and clone destruction. @returns Nothing. */ () => {
  const x = new OUString(new Uint16Array([65, 0, 66]), 3),
    y = new OUString(new Uint16Array([97, 0, 98]), 3),
    formula = new OUString(new Uint16Array([61, 65, 49]), 3);
  const rows: string[] = [];
  for (let pattern = 0; pattern < 5; pattern++)
    for (const moved of [false, true])
      for (const flag of [false, true]) {
        rows.push("case " + pattern + " " + Number(moved) + " " + Number(flag) + "\n");
        const s = new SharedString(
          pattern === 1 || pattern === 3 || pattern === 4 ? x.pData : null,
          pattern === 2 || pattern === 3 ? y.pData : pattern === 4 ? x.pData : null,
        );
        const input = new OUString(formula);
        const t = moved
          ? new ScHybridCellToken(0, s, input, flag, OUString.move)
          : new ScHybridCellToken(0, s, input, flag);
        /** Reads live original member pointers and genuine data reference counts. @param label - Native label. @param token - Original owner. @returns Nothing. */
        function data(label: string, token: ScHybridCellToken): void {
          const str = token.GetString();
          rows.push(
            label +
              " " +
              base(token) +
              " " +
              token.GetDouble() +
              " " +
              Number(token.IsEmptyDisplayedAsString()) +
              " " +
              (str.getData() === null ? -1 : str.getData() === x.pData ? 1 : 2) +
              " " +
              (str.getDataIgnoreCase() === null
                ? -1
                : str.getDataIgnoreCase() === x.pData
                  ? 1
                  : 2) +
              " " +
              x.pData?.refCount +
              " " +
              y.pData?.refCount +
              " " +
              formula.pData?.refCount +
              text(token.GetFormula()) +
              "\n",
          );
        }
        data("token", t);
        rows.push("source" + text(input) + "\n");
        t.IncRef();
        t.SetRefCntPolicy(RefCntPolicy.UnsafeRef);
        const c = t.Clone() as ScHybridCellToken;
        data("clone", c);
        rows.push("equal " + Number(t.equals(c)) + " " + Number(t.TextEqual(c)) + "\n");
        const opposite = new ScHybridCellToken(0, s, formula, !flag);
        rows.push("flag_equal " + Number(t.equals(opposite)) + "\n");
        opposite.Delete();
        c.Delete();
        data("clone_end", t);
        t.DecRef();
        rows.push(
          "token_end " +
            x.pData?.refCount +
            " " +
            y.pData?.refCount +
            " " +
            formula.pData?.refCount +
            "\n",
        );
        input.dispose();
        s.dispose();
        rows.push(
          "source_end " +
            x.pData?.refCount +
            " " +
            y.pData?.refCount +
            " " +
            formula.pData?.refCount +
            "\n",
        );
      }
  expect(rows.join("")).toBe(capture("hybrid"));
  formula.dispose();
  y.dispose();
  x.dispose();
});

it("matches original hybrid result IEEE payload and compared field distinctions", /** Verifies genuine equality short circuits, NaN and scalar payload copies. @returns Nothing. */ () => {
  const fa = new OUString(new Uint16Array([61, 65, 49]), 3),
    fb = new OUString(new Uint16Array([61, 65, 50]), 3),
    a = new OUString(65),
    b = new OUString(66),
    sa = new SharedString(a),
    sb = new SharedString(b);
  const rows: string[] = [];
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
    const t = new ScHybridCellToken(v, sa, fa, false),
      c = t.Clone() as ScHybridCellToken;
    const number = new ScHybridCellToken(1, sa, fa, false),
      string = new ScHybridCellToken(v, sb, fa, false),
      formula = new ScHybridCellToken(v, sa, fb, false),
      other = new FormulaDoubleToken(v);
    const bits = new DataView(new ArrayBuffer(8));
    bits.setFloat64(0, c.GetDouble(), false);
    rows.push(
      bits.getBigUint64(0, false).toString(16).padStart(16, "0") +
        " " +
        [t.equals(c), t.equals(number), t.equals(string), t.equals(formula), t.equals(other)]
          .map(Number)
          .join(" ") +
        "\n",
    );
    c.Delete();
    number.Delete();
    string.Delete();
    formula.Delete();
    other.Delete();
    t.Delete();
  }
  expect(rows.join("")).toBe(capture("equality"));
  sb.dispose();
  sa.dispose();
  b.dispose();
  a.dispose();
  fb.dispose();
  fa.dispose();
});
