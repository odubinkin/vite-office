/** @fileoverview Original OUString::fromUtf8 counted views and strict error flags through the actual checked SAL converter. */
import { expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import { text } from "../../i18nlangtag/source/isolang/isolang.tables";
it.each([
  [[], ""],
  [[65, 0, 66], "A\u0000B"],
  [[0xef, 0xbb, 0xbf, 65], "\ufeffA"],
  [[0xf0, 0x9f, 0x98, 0x80], "😀"],
  [[65, 0xff, 66], "A"],
])(
  "converts original counted bytes %j",
  /** Checks source error-stop behavior and embedded-zero preservation without a host decoder. @param bytes - Original byte view. @param expected - Original strict-converter result. @returns Nothing. */ (
    bytes,
    expected,
  ) => {
    const result = OUString.fromUtf8(Uint8Array.from(bytes as number[]));
    try {
      expect(text(result)).toBe(expected);
    } finally {
      result.dispose();
    }
  },
);
