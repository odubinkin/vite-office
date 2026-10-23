/** @fileoverview Binary64 comparisons against the unchanged complete native KahanSum header and original SAL object graph. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import fixture from "./native-kahan-cases.json" with { type: "json" };
import { KahanSum } from "./kahan";
/** Decodes one original initialized binary64 observation. @param value - Native hexadecimal bits. @returns Number. */
function number(value: string): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, BigInt("0x" + value), true);
  return view.getFloat64(0, true);
}
/** Reads exact binary64 result bits without numeric string formatting. @param value - Actual value. @returns Hexadecimal bits. */
function bits(value: number): string {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value, true);
  return view.getBigUint64(0, true).toString(16).padStart(16, "0");
}
it("matches every original portable native accumulator sequence", /** Retains input order,copy timing and source get mutation for every observed case. @returns Nothing. */ () => {
  const rows = gunzipSync(Buffer.from(fixture.captures.values.gzipBase64, "base64"))
    .toString()
    .trimEnd()
    .split("\n");
  expect(rows).toHaveLength(fixture.rowCount);
  expect(rows[0]).toBe("PROFILE 0");
  expect(rows[1]).toBe(`DEFAULT ${bits(new KahanSum().get())} ${bits(new KahanSum(0.1).get())}`);
  for (const row of rows.slice(2)) {
    const columns = row.split(" "),
      values = columns.slice(1, 7).map(number);
    const [seed, error, x, y, z, multiplier] = values as [
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    const a = new KahanSum(seed, error);
    a.add(x);
    a.add(y);
    a.add(z);
    const b = new KahanSum(a),
      c = new KahanSum(a),
      d = new KahanSum(y, x);
    d.add(z);
    c.add(d);
    b.multiply_assign(multiplier);
    const result = [a.get(), a.get(), b.get(), c.get(), d.get()];
    a.add(x);
    result.push(a.get());
    const sum: [number] = [seed],
      compensation: [number] = [error];
    KahanSum.sumNeumaierNormal(sum, compensation, x);
    result.push(sum[0], compensation[0]);
    expect(result.map(bits), `native sequence ${columns[0]}`).toEqual(columns.slice(7));
  }
});
