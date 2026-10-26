/** @fileoverview Runtime single-byte registry compared with authenticated original descriptors. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import fixture from "./native-singlebyte-reverse-cases.json";
import { Impl_getByteConvertData } from "./tables";
import type { ImplByteConvertData } from "./tenchelp";

it("keeps every runtime single-byte descriptor identical to the native capture", () => {
  const capture = fixture.captures.descriptors;
  const source = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(source.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(source).digest("hex")).toBe(capture.digest);
  const rows = source.toString().trimEnd().split("\n");
  expect(rows).toHaveLength(55);
  for (const row of rows) {
    const [encoding, original] = JSON.parse(row) as [number, ImplByteConvertData];
    expect(Impl_getByteConvertData(encoding)).toEqual(original);
  }
  expect(Impl_getByteConvertData(0)).toBeNull();
});
