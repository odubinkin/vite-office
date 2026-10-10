/** @fileoverview Replays original C/header ASCII equality, literal operators and borrowed observations without upstream sources. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { it, expect } from "vitest";
import fixture from "./native-ascii-equality-cases.json";
import { rtl_ustr_asciil_reverseEquals_WithLength } from "../inc/rtl/ustring.h";
import { OUString } from "../inc/rtl/ustring";

it("replays every original UTF16 and ASCII pair through the C and complete shared header owners", /** Compares complete actual native bytes without deriving expected Unicode comparisons in JS. @returns Nothing. */ () => {
  const native = gunzipSync(Buffer.from(fixture.pairs.gzipBase64, "base64"));
  expect(native).toHaveLength(fixture.pairs.rawBytes);
  expect(createHash("sha256").update(native).digest("hex")).toBe(fixture.pairs.rawHash);
  const actual = Buffer.alloc(native.length);
  const unicode = new Uint16Array(1),
    ascii = new Uint8Array(1);
  let offset = 0;
  for (let code = 0; code < fixture.pairs.unicodeCount; code++) {
    unicode[0] = code;
    const owner = new OUString(code);
    for (let byte = 0; byte < fixture.pairs.asciiCount; byte++) {
      ascii[0] = byte;
      actual[offset++] = Number(rtl_ustr_asciil_reverseEquals_WithLength(unicode, ascii, 1));
      actual[offset++] = Number(owner.equalsAsciiL(ascii, 1));
    }
    owner.dispose();
  }
  expect(actual.equals(native)).toBe(true);
  expect(fixture.pairs.unicodeCount * fixture.pairs.asciiCount).toBe(8388608);
  expect(fixture.sanitizedIdentical).toBe(true);
}, 30000);

it("replays complete native prefix, literal, borrowed identity and refcount observations", /** Retains embedded NUL, surrogate, offset and empty/null-zero cases and original guards. @returns Nothing. */ () => {
  expect(fixture.fields).toEqual([
    "cEquality",
    "memberEquality",
    "literalLt",
    "literalTr",
    "literalAz",
    "borrowedEquality",
    "sameDataPointer",
    "beforeRefCount",
    "afterRefCount",
    "sameBuffers",
  ]);
  const lt = new Uint8Array([108, 116, 0]),
    tr = new Uint8Array([116, 114, 0]),
    az = new Uint8Array([97, 122, 0]);
  const rows = [];
  for (const call of fixture.calls) {
    const unicode = new Uint16Array([...call.unicode, 0]);
    const ascii = new Uint8Array([...call.ascii, 0]);
    const up = call.nullUnicode ? null : unicode.subarray(call.unicodeOffset);
    const ap = call.nullAscii ? null : ascii.subarray(call.asciiOffset);
    const beforeUnicode = unicode.slice(),
      beforeAscii = ascii.slice();
    const owner = new OUString(up, call.unicodeLength);
    const pointer = owner.pData,
      refCount = pointer.refCount;
    const borrowed = OUString.unacquired([pointer]);
    rows.push([
      Number(rtl_ustr_asciil_reverseEquals_WithLength(up, ap, call.length)),
      Number(owner.equalsAsciiL(ap, call.asciiLength)),
      Number(owner.equalsAsciiL(lt, 2)),
      Number(owner.equalsAsciiL(tr, 2)),
      Number(owner.equalsAsciiL(az, 2)),
      Number(borrowed.equalsAsciiL(ap, call.asciiLength)),
      Number(owner.pData === pointer),
      refCount,
      owner.pData.refCount,
      Number(
        unicode.every(
          /** Observes every caller-owned UTF16 unit. @param unit - Current unit. @param index - Unit offset. @returns Whether unchanged. */ (
            unit,
            index,
          ) => unit === beforeUnicode[index],
        ) &&
          ascii.every(
            /** Observes every caller-owned char byte. @param byte - Current byte. @param index - Byte offset. @returns Whether unchanged. */ (
              byte,
              index,
            ) => byte === beforeAscii[index],
          ),
      ),
    ]);
    owner.dispose();
  }
  expect(rows).toEqual(fixture.observations);
  expect(fixture.guard).toEqual({ signal: "SIGABRT", expression: "nStrLen >= 0" });
  expect(
    /** Exercises the original negative-length assertion. @returns The native comparison result if the assertion does not fire. */ () =>
      rtl_ustr_asciil_reverseEquals_WithLength(new Uint16Array(1), new Uint8Array(1), -1),
  ).toThrow("assert(nStrLen >= 0)");
  expect(rtl_ustr_asciil_reverseEquals_WithLength(null, null, 4294967296)).toBe(true);
  const empty = new OUString();
  expect(empty.equalsAsciiL(null, 4294967296)).toBe(true);
  empty.dispose();
});
