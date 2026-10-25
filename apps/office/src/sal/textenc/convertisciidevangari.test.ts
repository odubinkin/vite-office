/** @fileoverview Focused native ISCII Devanagari conversion cases. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  ImplConvertIsciiDevanagariToUnicode,
  ImplCreateIsciiDevanagariToUnicodeContext,
  ImplResetIsciiDevanagariToUnicodeContext,
} from "./convertisciidevangari";

/** Converts one ISCII source chunk with a fresh native context.
 * @param source - Encoded bytes.
 * @param flags - Native conversion flags.
 * @returns UTF-16 units and conversion status.
 */
function convert(source: readonly number[], flags = 0) {
  const destination = new Uint16Array(source.length);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const context = ImplCreateIsciiDevanagariToUnicodeContext();
  const written = ImplConvertIsciiDevanagariToUnicode(
    null,
    context,
    Uint8Array.from(source),
    source.length,
    destination,
    destination.length,
    flags,
    info,
    consumed,
  );
  return {
    units: [...destination.subarray(0, written)],
    info: info[0],
    consumed: consumed[0],
    context,
  };
}

it("maps pinned ISCII base, nukta and halant combinations", /** Checks source map and compound characters. @returns Nothing. */ () => {
  expect(convert([0x41, 0xa1, 0xa1, 0xe9, 0xe8, 0xe8, 0xe8, 0xe9])).toMatchObject({
    units: [0x0041, 0x0901, 0x0950, 0x094d, 0x200c, 0x094d, 0x200d],
    info: 0,
    consumed: 8,
  });
});

it("uses pinned undefined-byte status and FLUSH source rewind", /** Checks source bad-input actions. @returns Nothing. */ () => {
  expect(convert([0x80])).toMatchObject({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
    consumed: 1,
  });
  expect(
    convert(
      [0x80],
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
    ),
  ).toMatchObject({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 0,
  });
});

it("resets the source-owned previous-byte state", /** Checks native context reset. @returns Nothing. */ () => {
  const context = ImplCreateIsciiDevanagariToUnicodeContext();
  context.m_cPrevChar = 0xe8;
  ImplResetIsciiDevanagariToUnicodeContext(context);
  expect(context.m_cPrevChar).toBe(0);
});
