/** @fileoverview Exhaustive pinned ICU78.3 and LibreOffice scalar script observations. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import fixture from "./native-script-cases.json";
import { GetScriptClass } from "./scriptclass";
import {
  ublock_getCode,
  uscript_getScript,
  u_getUnicodeProperties,
} from "../../../external/icu/source/common/uchar";
import { u_getIntPropertyValue } from "../../../external/icu/source/common/uprops";
import { UProperty } from "../../../external/icu/source/common/unicode/uchar";

it("matches every scalar block, script and source editing class from compiled original scopes", /** Matches every scalar block, script and source editing class from compiled original scopes. @returns Operation result. */ () => {
  const expected = gunzipSync(Buffer.from(fixture.compressedRows, "base64"));
  expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.rawSha256);
  expect(expected.length).toBe(fixture.codePoints * 6);
  const actual = Buffer.alloc(expected.length);
  for (let c = 0; c < fixture.codePoints; ++c) {
    const status: [number] = [0];
    actual.writeUInt16LE(ublock_getCode(c), c * 6);
    actual.writeInt16LE(uscript_getScript(c, status), c * 6 + 2);
    actual.writeInt16LE(GetScriptClass(c), c * 6 + 4);
    if (!actual.subarray(c * 6, c * 6 + 6).equals(expected.subarray(c * 6, c * 6 + 6)))
      throw new Error(`Pinned script mismatch at U+${c.toString(16)}`);
    if (status[0] !== 0) throw new Error(`Unexpected ICU status at ${c}`);
  }
  expect(actual.equals(expected)).toBe(true);
});

it("retains native invalid scalar, warning and failure status behavior", /** Retains native invalid scalar, warning and failure status behavior. @returns Operation result. */ () => {
  expect(uscript_getScript(65, null)).toBe(-1);
  const failure: [number] = [1];
  expect(uscript_getScript(65, failure)).toBe(-1);
  expect(failure[0]).toBe(1);
  const warning: [number] = [-1];
  expect(uscript_getScript(65, warning)).toBe(25);
  expect(warning[0]).toBe(-1);
  for (const c of [-1, 0x110000, 0x7fffffff, -2147483648]) {
    const status: [number] = [0];
    expect(uscript_getScript(c, status)).toBe(-1);
    expect(status[0]).toBe(1);
    expect(ublock_getCode(c)).toBe(0);
  }
  expect(u_getUnicodeProperties(65, 3)).toBe(0);
  expect(u_getIntPropertyValue(65, UProperty.UCHAR_BLOCK)).toBe(1);
  expect(
    /** Exercises the invalid request boundary. @returns Operation result. */ () =>
      u_getIntPropertyValue(65, 0 as UProperty.UCHAR_BLOCK),
  ).toThrow();
});
