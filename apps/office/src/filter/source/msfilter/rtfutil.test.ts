/** @fileoverview Native RTF UTF16-unit emission using the actual checked SAL byte owner. */
import { expect, it } from "vitest";
import { OutHex, OutString, OutStringUpr } from "./rtfutil";
import * as enc from "../../../sal/inc/rtl/textenc";

it("preserves original UInt32/UInt8 hex bounds, sign bits and leading zeros", () => {
  expect(OutHex(-1, 2)).toBe("ff");
  expect(OutHex(0x12345678, 16)).toBe("0000000012345678");
  expect(OutHex(0x12345678, 255)).toBe("0000000012345678");
  expect(OutHex(10, 256)).toBe("");
});
it("emits source control aliases and escapes independently of conversion", () => {
  expect(OutString("A\v\t\\{}\u00a0\u001e\u001f", enc.RTL_TEXTENCODING_MS_1252)).toBe(
    "A\\line \\tab \\\\\\{\\}\\~\\_\\-",
  );
});
it("emits actual destination bytes without Unicode for font names", () => {
  expect(OutString("Café", enc.RTL_TEXTENCODING_MS_1252, false)).toBe("Caf\\'e9");
  expect(OutString("漢", enc.RTL_TEXTENCODING_MS_932, false)).toBe("\\'8a\\'bf");
  expect(OutString("漢", enc.RTL_TEXTENCODING_UTF8, false)).toBe("\\'e6\\'bc\\'a2");
});
it("tracks native per-unit fallback lengths and resets uc after a multibyte result", () => {
  expect(OutString("漢", enc.RTL_TEXTENCODING_MS_932)).toBe("\\uc2 \\u28450\\'8a\\'bf\\uc1 ");
  expect(OutString("漢é", enc.RTL_TEXTENCODING_MS_932)).toBe(
    "\\uc2 \\u28450\\'8a\\'bf\\uc1 \\u233\\'3f",
  );
  // MS1258 estimates one byte; its checked mapped two-byte result fails before retry.
  expect(OutString("ắ", enc.RTL_TEXTENCODING_MS_1258)).toBe("\\uc0 \\u7855\\uc1 ");
});
it("retains code-unit surrogate and source dummy conversion behavior", () => {
  expect(OutString("😀", enc.RTL_TEXTENCODING_MS_1252)).toBe("\\uc0 \\u-10179\\uc1 \\u-8704\\'3f");
  expect(OutString("😀", enc.RTL_TEXTENCODING_DONTKNOW, false)).toBe("\\'3d\\'00");
  expect(OutString("\u8000", enc.RTL_TEXTENCODING_MS_1252)).toBe("\\u-32768\\'3f");
});
it("keeps native upr and nested ud grouping", () => {
  expect(OutStringUpr("\\name", "é", enc.RTL_TEXTENCODING_MS_1252)).toBe(
    "{\\upr{\\name \\'e9}{\\*\\ud{\\name \\u233\\'e9}}}",
  );
});
