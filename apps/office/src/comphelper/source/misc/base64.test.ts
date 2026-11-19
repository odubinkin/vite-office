/** @fileoverview Pinned comphelper Base64 conversion tests. */
import { expect, it } from "vitest";
import { decodeBase64, encodeBase64 } from "./base64";

it("matches the original three sequence and string conversion cases", /** Ports Base64Test's original expected bytes and output text. @returns Nothing. */ () => {
  for (const [bytes, encoded] of [
    [[0, 0, 0, 0, 0, 1, 2, 3], "AAAAAAABAgM="],
    [[5, 2, 3, 0, 0, 1, 2, 3], "BQIDAAABAgM="],
    [[200, 31, 77, 111, 0, 1, 2, 3], "yB9NbwABAgM="],
  ] as const) {
    expect(encodeBase64(Uint8Array.from(bytes))).toBe(encoded);
    expect(decodeBase64(encoded)).toEqual(Uint8Array.from(bytes));
  }
});

it("retains complete-quartet, ignored-character and original padding rules", /** Checks the original decoder table and clean one-byte encoding. @returns Nothing. */ () => {
  expect(decodeBase64("a G!k=")).toEqual(Uint8Array.of(104, 105));
  expect(decodeBase64("YQ==ZW")).toEqual(Uint8Array.of(97));
  expect(decodeBase64("AA")).toEqual(new Uint8Array());
  expect(decodeBase64("`AAA")).toEqual(Uint8Array.of(0, 0, 0));
  expect(encodeBase64(Uint8Array.of(97))).toBe("YQ==");
});
