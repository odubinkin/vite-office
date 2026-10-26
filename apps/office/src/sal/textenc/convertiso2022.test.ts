/** @fileoverview Focused pinned ISO-2022-JP and ISO-2022-KR decoding cases. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  ImplConvertIso2022JpToUnicode,
  ImplCreateIso2022JpToUnicodeContext,
  ImplIso2022JpToUnicodeState,
  ImplResetIso2022JpToUnicodeContext,
} from "./convertiso2022jp";
import {
  ImplConvertIso2022KrToUnicode,
  ImplCreateIso2022KrToUnicodeContext,
  ImplIso2022KrToUnicodeState,
  ImplResetIso2022KrToUnicodeContext,
} from "./convertiso2022kr";

/** Converts one source chunk with one source-owned state machine.
 * @param kind - Source encoding.
 * @param source - Encoded bytes.
 * @param flags - Conversion flags.
 * @param capacity - Destination capacity.
 * @returns UTF-16 units, status and consumed bytes.
 */
function convert(
  kind: "jp" | "kr",
  source: readonly number[],
  flags = 0,
  capacity = source.length,
) {
  const destination = new Uint16Array(capacity);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const written = (kind === "jp" ? ImplConvertIso2022JpToUnicode : ImplConvertIso2022KrToUnicode)(
    null,
    null,
    Uint8Array.from(source),
    source.length,
    destination,
    capacity,
    flags,
    info,
    consumed,
  );
  return { units: [...destination.subarray(0, written)], info: info[0], consumed: consumed[0] };
}

it("decodes JIS Roman and JIS X 0208 using pinned state transitions", () => {
  expect(
    convert(
      "jp",
      [0x41, 0x1b, 0x28, 0x4a, 0x5c, 0x7e, 0x1b, 0x24, 0x42, 0x24, 0x22, 0x1b, 0x28, 0x42, 0x5a],
    ),
  ).toEqual({
    units: [0x41, 0x00a5, 0x00af, 0x3042, 0x5a],
    info: 0,
    consumed: 15,
  });
});

it("decodes KS X 1001 between SO and SI after designator", () => {
  expect(convert("kr", [0x41, 0x1b, 0x24, 0x29, 0x43, 0x0e, 0x30, 0x21, 0x0f, 0x5a])).toEqual({
    units: [0x41, 0xac00, 0x5a],
    info: 0,
    consumed: 10,
  });
});

it("retains incomplete state without FLUSH and resets it on context reset", () => {
  const jp = ImplCreateIso2022JpToUnicodeContext();
  const kr = ImplCreateIso2022KrToUnicodeContext();
  const info: [number] = [0];
  const consumed: [number] = [0];
  const output = new Uint16Array(3);
  expect(
    ImplConvertIso2022JpToUnicode(
      null,
      jp,
      Uint8Array.from([0x1b, 0x24]),
      2,
      output,
      3,
      0,
      info,
      consumed,
    ),
  ).toBe(0);
  expect(info[0]).toBe(cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL);
  expect(jp.m_eState).toBe(ImplIso2022JpToUnicodeState.ESC_DOLLAR);
  expect(
    ImplConvertIso2022JpToUnicode(
      null,
      jp,
      Uint8Array.from([0x42, 0x24, 0x22]),
      3,
      output,
      3,
      0,
      info,
      consumed,
    ),
  ).toBe(1);
  expect(output[0]).toBe(0x3042);
  expect(jp.m_eState).toBe(ImplIso2022JpToUnicodeState.JIS_0208);
  ImplResetIso2022JpToUnicodeContext(jp);
  expect(jp.m_eState).toBe(ImplIso2022JpToUnicodeState.ASCII);
  expect(
    ImplConvertIso2022KrToUnicode(
      null,
      kr,
      Uint8Array.from([0x1b, 0x24, 0x29]),
      3,
      output,
      3,
      0,
      info,
      consumed,
    ),
  ).toBe(0);
  expect(info[0]).toBe(cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL);
  expect(kr.m_eState).toBe(ImplIso2022KrToUnicodeState.ESC_DOLLAR_RPAREN);
  expect(
    ImplConvertIso2022KrToUnicode(
      null,
      kr,
      Uint8Array.from([0x43, 0x0e, 0x30, 0x21]),
      4,
      output,
      3,
      0,
      info,
      consumed,
    ),
  ).toBe(1);
  expect(output[0]).toBe(0xac00);
  expect(kr.m_eState).toBe(ImplIso2022KrToUnicodeState.KSC_1001);
  ImplResetIso2022KrToUnicodeContext(kr);
  expect(kr.m_eState).toBe(ImplIso2022KrToUnicodeState.ASCII);
});

it("uses the pinned invalid and destination-buffer status paths", () => {
  expect(convert("jp", [0x1b, 0x24], cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH)).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 2,
  });
  expect(convert("kr", [0x80])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 1,
  });
  expect(convert("jp", [0x41], 0, 0)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 0,
  });
});
