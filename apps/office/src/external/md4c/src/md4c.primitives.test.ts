/** @fileoverview Native-compiled md4c 0.5.3 differential fixtures for every Unicode scalar and malformed UTF-8. */
import { expect, it } from "vitest";
import { md_is_html_tag, md_is_html_any } from "./md4c.html";
import { md_is_link_label, md_is_link_destination, md_is_link_title } from "./md4c.link";
import fixture from "./native-primitives.json";
import {
  md_decode_unicode,
  md_decode_utf8_before__,
  md_get_unicode_fold_info,
  md_is_unicode_punct__,
  md_is_unicode_whitespace__,
} from "./md4c.unicode";
import { md_build_attribute, md_is_entity_str } from "./md4c.attribute";
import { md_link_label_cmp, md_link_label_hash } from "./md4c.label";
import { MD_TEXTTYPE as T, MD_DIALECT_GITHUB, MD_FLAG_WIKILINKS } from "./md4c.h";
const bytes = new TextEncoder();
it("matches compiled md4c classification and folding for every Unicode scalar", () => {
  let digest = 2166136261;
  /** Adds one native unsigned word in the fixture's little-endian order. @param value - Word. @returns Nothing. */
  function hash(value: number): void {
    for (let shift = 0; shift < 32; shift += 8)
      digest = Math.imul(digest ^ ((value >>> shift) & 255), 16777619) >>> 0;
  }
  for (let cp = 0; cp <= 0x10ffff; cp++) {
    hash(Number(md_is_unicode_whitespace__(cp)));
    hash(Number(md_is_unicode_punct__(cp)));
    const folded = md_get_unicode_fold_info(cp);
    hash(folded.length);
    for (const scalar of folded) hash(scalar);
  }
  expect(digest).toBe(fixture.unicodeDigest);
});
it.each(fixture.utf8)(
  "matches compiled forward and reverse UTF-8 decoding: $bytes",
  ({ bytes: value, cp, width, before }) => {
    const input = new Uint8Array(value);
    expect(md_decode_unicode(input, 0)).toEqual([cp, width]);
    expect(md_decode_utf8_before__(input, input.length)).toBe(before);
  },
);
it.each(["&nbsp;", "&unknownEntity;", "&#1234567;", "&#x10ABCD;"])(
  "recognizes native entity syntax without consulting an HTML entity dictionary: %s",
  (text) => {
    expect(md_is_entity_str(bytes.encode(text), 0)).toBe(text.length);
  },
);
it.each(["&a;", "&#12345678;", "&#x1234567;", "&a-b;", "&nbsp"])(
  "rejects invalid or unterminated native entity syntax: %s",
  (text) => {
    expect(md_is_entity_str(bytes.encode(text), 0)).toBe(-1);
  },
);
it("retains UTF-8 byte offsets and source substring separation for attributes", () => {
  const result = md_build_attribute(bytes.encode("é\\* &unknown;\0\0 tail"));
  expect(new TextDecoder().decode(result.text)).toBe("é* &unknown;\0\0 tail");
  expect(result.size).toBe(20);
  expect(result.substr_types).toEqual([
    T.MD_TEXT_NORMAL,
    T.MD_TEXT_ENTITY,
    T.MD_TEXT_NULLCHAR,
    T.MD_TEXT_NULLCHAR,
    T.MD_TEXT_NORMAL,
  ]);
  expect(result.substr_offsets).toEqual([0, 4, 13, 14, 15, 20]);
});
it("keeps no-escape attributes and zero-length native trivial attributes", () => {
  expect(new TextDecoder().decode(md_build_attribute(bytes.encode("\\*"), 1).text)).toBe("\\*");
  expect(md_build_attribute(new Uint8Array())).toEqual({
    text: new Uint8Array(),
    size: 0,
    substr_types: [T.MD_TEXT_NORMAL],
    substr_offsets: [0, 0],
  });
});
it("uses pinned Unicode folding and native label comparison ordering", () => {
  const a = bytes.encode("  STRAẞE\u2000"),
    b = bytes.encode("straße ");
  expect(md_link_label_cmp(a, b)).toBe(0);
  expect(md_link_label_hash(a)).toBe(md_link_label_hash(b));
  expect(md_link_label_cmp(bytes.encode("a"), bytes.encode("b"))).toBe(1);
  expect(md_link_label_cmp(bytes.encode("İ"), bytes.encode("i\u0307"))).toBe(0);
  expect(MD_DIALECT_GITHUB | MD_FLAG_WIKILINKS).toBe(0x2f0c);
});

it.each(fixture.scans)(
  "matches the compiled $operation scanner: $text",
  ({ operation, text, result }) => {
    const input = bytes.encode(text),
      lines: { beg: number; end: number }[] = [];
    let start = 0;
    for (let offset = 0; offset < input.length; offset++)
      if (input[offset] === 10) {
        lines.push({ beg: start, end: offset });
        start = offset + 1;
      }
    lines.push({ beg: start, end: input.length });
    const ctx = {
      text: input,
      size: input.length,
      html_comment_horizon: 0,
      html_proc_instr_horizon: 0,
      html_decl_horizon: 0,
      html_cdata_horizon: 0,
    };
    if (operation === "tag" || operation === "html") {
      const end = (operation === "tag" ? md_is_html_tag : md_is_html_any)(
        ctx,
        lines,
        0,
        input.length,
      );
      expect(end < 0 ? [0] : [1, end, 0, 0, 0, 0]).toEqual(result);
    } else {
      const range =
        operation === "label"
          ? md_is_link_label(ctx, lines, 0)
          : operation === "destination"
            ? md_is_link_destination(ctx, 0, input.length)
            : md_is_link_title(ctx, lines, 0);
      expect(
        range === undefined
          ? [0]
          : [
              1,
              range.end,
              range.contents_beg,
              range.contents_end,
              range.beg_line_index,
              range.end_line_index,
            ],
      ).toEqual(result);
    }
  },
);
