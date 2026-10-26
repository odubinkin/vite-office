/** @fileoverview Focused native ISCII Devanagari conversion cases. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  ImplConvertIsciiDevanagariToUnicode,
  ImplCreateIsciiDevanagariToUnicodeContext,
  ImplDestroyIsciiDevanagariToUnicodeContext,
  ImplResetIsciiDevanagariToUnicodeContext,
} from "./convertisciidevangari";

/** Converts one ISCII source chunk with a fresh native context.
 * @param source - Encoded bytes.
 * @param flags - Native conversion flags.
 * @param capacity - Caller-provided output capacity.
 * @returns UTF-16 units and conversion status.
 */
function convert(source: readonly number[], flags = 0, capacity = source.length) {
  const destination = new Uint16Array(capacity);
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

it.each([
  [0xa6, 0x090c],
  [0xa7, 0x0961],
  [0xaa, 0x0960],
  [0xb3, 0x0958],
  [0xb4, 0x0959],
  [0xb5, 0x095a],
  [0xba, 0x095b],
  [0xbf, 0x095c],
  [0xc0, 0x095d],
  [0xc9, 0x095e],
  [0xdb, 0x0962],
  [0xdc, 0x0963],
  [0xdf, 0x0944],
  [0xea, 0x093d],
] as const)(
  "maps ISCII nukta pair %i to Unicode %i",
  /** Checks pinned compound mappings as code units, not host transliteration. @param byte - Base byte. @param unit - Source Unicode mapping. @returns Nothing. */ (
    byte,
    unit,
  ) => {
    expect(convert([byte, 0xe9])).toMatchObject({ units: [unit], info: 0, consumed: 2 });
  },
);

it("keeps an ordinary nukta separate and preserves state across ignored undefined bytes", /** Checks source compound fallback and previous-byte ownership. @returns Nothing. */ () => {
  expect(convert([0x41, 0xe9])).toMatchObject({ units: [0x41, 0x093c], info: 0, consumed: 2 });
  expect(convert([0xe8, 0x80, 0xe8], cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE)).toMatchObject(
    { units: [0x094d, 0x200c], info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED, consumed: 3 },
  );
  expect(convert([0x80], cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR)).toMatchObject({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 1,
  });
  expect(
    convert(
      [0x41, 0x80],
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
    ),
  ).toMatchObject({
    units: [0x41],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 1,
  });
  const full = convert([0x41], 0, 0);
  expect(full).toMatchObject({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(full.context.m_cPrevChar).toBe(0);
  ImplDestroyIsciiDevanagariToUnicodeContext(full.context);
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
