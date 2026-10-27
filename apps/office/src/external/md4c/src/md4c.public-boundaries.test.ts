/** @fileoverview Tests public md4c byte-domain guards, FNV vectors and callback exception identity. */
import { expect, it } from "vitest";
import { md_parse } from "./md4c";
import { md_fnv1a, md_link_label_cmp, md_link_label_hash } from "./md4c.label";
import type { MD_PARSER } from "./md4c.h";
/** Creates a real zero-returning consumer. @returns Source parser callbacks. */
function consumer(): MD_PARSER<undefined> {
  return {
    abi_version: 0,
    flags: 0,
    enter_block: /** Accepts native block. @returns Success. */ () => 0,
    leave_block: /** Accepts native block. @returns Success. */ () => 0,
    enter_span: /** Accepts native span. @returns Success. */ () => 0,
    leave_span: /** Accepts native span. @returns Success. */ () => 0,
    text: /** Accepts native text. @returns Success. */ () => 0,
  };
}
it("matches independently published FNV1a vectors and composes counted byte spans", /** Verifies wrapped unsigned hash. @returns Nothing. */ () => {
  const bytes = new TextEncoder();
  for (const [text, expected] of [
    ["", 2166136261],
    ["hello", 1335831723],
    ["foobar", 3214735720],
  ] as const)
    expect(md_fnv1a(2166136261, bytes.encode(text))).toBe(expected);
  expect(md_fnv1a(md_fnv1a(2166136261, bytes.encode("foo")), bytes.encode("bar"))).toBe(3214735720);
  expect(md_link_label_cmp(bytes.encode("a"), bytes.encode("a "))).toBe(0);
  expect(md_link_label_cmp(bytes.encode("a "), bytes.encode("a"))).toBe(0);
  expect(md_link_label_hash(bytes.encode("Straße\t LABEL"))).toBe(
    md_link_label_hash(bytes.encode("STRASSE LABEL")),
  );
});
it("rejects sizes outside supplied bytes before native callbacks and preserves thrown consumer identity", /** Verifies public transport boundary. @returns Nothing. */ () => {
  const bytes = new TextEncoder().encode("plain");
  for (const size of [-1, bytes.length + 1, 0.5, NaN, Infinity])
    expect(
      /** Calls an invalid counted span. @returns Status. */ () =>
        md_parse(bytes, size, consumer(), undefined),
    ).toThrow(RangeError);
  const failure = new Error("consumer failure"),
    parser = {
      ...consumer(),
      text: /** Propagates the consumer failure. @returns Nothing. */ () => {
        throw failure;
      },
    };
  expect(
    /** Calls the actual parser. @returns Status. */ () =>
      md_parse(bytes, bytes.length, parser, undefined),
  ).toThrow(failure);
});
