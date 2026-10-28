/** @fileoverview Native consumed URI decode modes used by Markdown links and HTML named-anchor filtering. */
import { expect, it } from "vitest";
import { decodeToIUri, decodeUnambiguous } from "./urlobj";
it("decodes only the native Unambiguous ASCII category", /** Reserved URI separators and control octets remain escaped; native nonreserved punctuation is decoded. @returns Nothing. */ () => {
  expect(decodeUnambiguous("%20%21%22%24%27%28%29%2a%2d%2e%3c%3e%40%5c%5e%5f%60%7b%7c%7d%7e")).toBe(
    " !\"$'()*-.<>@\\^_`{|}~",
  );
  expect(decodeUnambiguous("%23%25%26%2b%2c%2f%3a%3b%3d%3f%5b%5d%00%7f")).toBe(
    "%23%25%26%2B%2C%2F%3A%3B%3D%3F%5B%5D%00%7F",
  );
  expect(decodeUnambiguous("%30%39%41%5a%61%7a")).toBe("09AZaz");
});
it("preserves the original ToIUri ASCII escapes after sharing UTF8 decoding", /** Existing Markdown URI spelling must not change when the named-anchor mode is connected. @returns Nothing. */ () => {
  expect(decodeToIUri("%20%41%7c%2f")).toBe("%20%41%7C%2F");
  expect(decodeToIUri("A/B%2fC%7cname")).toBe("A/B%2FC%7Cname");
});
it("decodes valid UTF8 scalars and retains malformed escaped octets in both modes", /** Native getUTF32 does not use a replacement-character browser URL decoder. @returns Nothing. */ () => {
  for (const decode of [decodeToIUri, decodeUnambiguous]) {
    expect(decode("%E2%82%AC%F0%9F%98%80")).toBe("€😀");
    expect(decode("%c0%af%ed%a0%80%ff")).toBe("%C0%AF%ED%A0%80%FF");
    expect(decode("%E2%82")).toBe("%E2%82");
    expect(decode("raw%zz%2")).toBe("raw%zz%2");
  }
});
it("keeps escaped percent and literal separators distinct without recursive decoding", /** Native name filtering decodes one escape layer only. @returns Nothing. */ () => {
  expect(decodeUnambiguous("A/B%2fC%7cname%257Ctable")).toBe("A/B%2FC|name%257Ctable");
});
