/** @fileoverview Original SAL byte conversion and missing-converter behavior used by Calc CSV. */
import { expect, it } from "vitest";
import { RTL_TEXTENCODING_MS_1251 } from "../inc/rtl/textenc";
import { OStringToOUString, OUStringToOString } from "./ustring-convert";

it("uses the original single-byte descriptor for a selected native encoding", /** Checks uses the original single-byte descriptor for a selected native encoding. @returns Test completion or assertion result. */ () => {
  const bytes = OUStringToOString("Привет", RTL_TEXTENCODING_MS_1251);
  expect([...bytes]).toEqual([0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2]);
  expect(OStringToOUString(bytes, RTL_TEXTENCODING_MS_1251)).toBe("Привет");
});

it("preserves the original SAL dummy conversion when no converter exists", /** Checks preserves the original SAL dummy conversion when no converter exists. @returns Test completion or assertion result. */ () => {
  const missingEncoding = 9999;
  expect([...OUStringToOString("A€", missingEncoding)]).toEqual([0x41, 0xac]);
  expect(OStringToOUString(new Uint8Array([0x41, 0xac]), missingEncoding)).toBe("A¬");
});
