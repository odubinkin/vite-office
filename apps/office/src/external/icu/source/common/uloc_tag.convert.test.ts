/** @fileoverview Source forLanguageTag conversion uses real parsed owners and resource maps, preserving exact append output and partial lengths. */
import { expect, it } from "vitest";
import { ulocimp_forLanguageTag } from "./uloc_tag.convert";
/** Calls the actual append-sink operation. @param text - Narrow input. @param incoming - Sticky status. @returns Output state. */
function convert(text: string, incoming = 0) {
  let output = "seed";
  const status: [number] = [incoming],
    parsed: [number] = [77];
  ulocimp_forLanguageTag(
    text,
    -1,
    {
      /** Preserves preexisting sink bytes. @param value - Narrow append. @returns Nothing. */ Append(
        value,
      ) {
        output += value;
      },
    },
    parsed,
    status,
  );
  return { output, status: status[0], parsed: parsed[0] };
}
it("maps actual Unicode keys/types/timezones to canonical legacy keywords", /** Uses pinned keyTypeData. @returns Nothing. */ () => {
  const text = "en-US-u-ca-gregory-tz-usnyc-kn";
  expect(convert(text)).toEqual({
    output: "seeden_US@calendar=gregorian;colnumeric=yes;timezone=America/New_York",
    status: 0,
    parsed: text.length,
  });
});
it("sorts variants and attributes while retaining the first duplicate keyword", /** These source ownership/order operations differ from the unsorted parser result. @returns Nothing. */ () => {
  expect(convert("en-posix-1901-z-value-a-test").output).toBe("seeden__1901_POSIX@a=test;z=value");
  expect(convert("en-u-foo-bar-foo-ca-gregory-ca-buddhist").output).toBe(
    "seeden@attribute=bar-foo;calendar=gregorian",
  );
  expect(convert("en-u-12-ca-gregory").output).toBe("seeden@attribute=12;calendar=gregorian");
});
it("preserves POSIX flag handling with and without existing variants", /** Keeps source underscore and keyword behavior before Locale normalization. @returns Nothing. */ () => {
  expect(convert("en-u-va-posix").output).toBe("seeden_POSIX");
  expect(convert("und-u-va-posix").output).toBe("seedund_POSIX");
  expect(convert("en-posix-u-va-posix").output).toBe("seeden__POSIX@va=posix");
});
it("preserves extlang replacement and private-use/lvariant behavior", /** Uses the same actual parser owner. @returns Nothing. */ () => {
  expect(convert("zh-cmn-Hans-u-ca-gregory").output).toBe("seedcmn_Hans@calendar=gregorian");
  expect(convert("en-x-foo-lvariant-posix").output).toBe("seeden__POSIX");
  expect(convert("en-x-foo-LVARIANT-posix").output).toBe("seeden@x=foo-lvariant-posix");
  expect(convert("x-private").output).toBe("seed@x=private");
});
it("retains partial success, incoming failure outputs and warnings", /** Full input validity is not invented as an error condition. @returns Nothing. */ () => {
  expect(convert("en-u")).toEqual({ output: "seeden", status: 0, parsed: 2 });
  expect(convert("en-u-ca-x")).toEqual({ output: "seeden@calendar=yes", status: 0, parsed: 7 });
  expect(convert("en-US", 1)).toEqual({ output: "seed", status: 1, parsed: 77 });
  expect(convert("en-US", -128).status).toBe(-128);
});
