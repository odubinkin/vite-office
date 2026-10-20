/** @fileoverview Complete scalar witness against unchanged native ICU78.3 and LibreOffice Unicode type/alpha/control bodies. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { u_charType } from "./uchar";
import { unicode } from "../../../../i18nutil/source/utility/unicode";
import fixture from "./native-character-types.json";
it("matches every scalar native category and original cached alpha/control result", /** Genuine native original bodies supply the independent byte digest. @returns Nothing. */ () => {
  const bytes = new Uint8Array(fixture.codePoints * 4);
  for (let code = 0; code < fixture.codePoints; code++) {
    bytes[code * 4] = u_charType(code);
    bytes[code * 4 + 1] = unicode.getUnicodeType(code);
    bytes[code * 4 + 2] = Number(unicode.isAlpha(code));
    bytes[code * 4 + 3] = Number(unicode.isControl(code));
  }
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(fixture.sha256);
  expect([...bytes.subarray(0, 4)]).toEqual([15, 0, 0, 0]);
  expect(unicode.getUnicodeType(0)).toBe(15);
  expect(unicode.getUnicodeType(0)).toBe(15);
  expect(u_charType(-1)).toBe(0);
  expect(u_charType(0x110000)).toBe(0);
  expect(unicode.isControl(0x200d)).toBe(true);
  expect(unicode.isControl(0x2028)).toBe(true);
  expect(unicode.isControl(0x2029)).toBe(true);
  expect(unicode.isAlpha(0x2160)).toBe(false);
});
