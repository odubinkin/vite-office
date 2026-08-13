/** @fileoverview Verifies Writer HTML list serialization preserves semantic list boundaries and ordered-list start values. */

import { describe, expect, it } from "vitest";

import { serializeWriterClipboardHtml } from "./htmlnumwriter";

/** Defines a compact prepared Writer paragraph for HTML format-writer tests. */
const paragraph = {
  listKind: "none",
  listLevel: 0,
  marker: undefined,
  style: "text-align: left;",
  text: "Body",
} as const;

describe("serializeWriterClipboardHtml" /** Groups semantic Writer HTML list transfer tests. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterHtmlListWriterTests(): void {
  it("separates ordinary paragraphs and non-contiguous list kinds" /** Verifies list groups never absorb surrounding body content. @returns Nothing; serialized HTML is asserted. */, function separatesListGroups(): void {
    expect(
      serializeWriterClipboardHtml([
        { ...paragraph, listKind: "bullet", marker: "•", text: "Bullet" },
        paragraph,
        { ...paragraph, listKind: "numbered", marker: "2.", text: "Second" },
      ]),
    ).toBe(
      '<ul><li style="text-align: left;">Bullet</li></ul><p style="text-align: left;">Body</p><ol start="2"><li style="text-align: left;">Second</li></ol>',
    );
  });

  it("escapes rich-text content and falls back to one for invalid ordered markers" /** Verifies transfer markup remains safe and valid when a rendered marker is unavailable or malformed. @returns Nothing; escaped output is asserted. */, function escapesTextAndNormalizesStart(): void {
    expect(
      serializeWriterClipboardHtml([
        { ...paragraph, listKind: "numbered", marker: "not-a-marker", text: `&<>"'` },
      ]),
    ).toBe('<ol><li style="text-align: left;">&amp;&lt;&gt;&quot;&#39;</li></ol>');
    expect(
      serializeWriterClipboardHtml([
        { ...paragraph, listKind: "numbered", marker: undefined, text: "First" },
      ]),
    ).toBe('<ol><li style="text-align: left;">First</li></ol>');
    expect(
      serializeWriterClipboardHtml([
        { ...paragraph, listKind: "numbered", marker: "0.", text: "First" },
      ]),
    ).toBe('<ol><li style="text-align: left;">First</li></ol>');
  });

  it("writes balanced nested mixed-kind lists and normalizes unsupported level jumps" /** Verifies a browser Writer list fragment has real nested semantics without emitting empty ancestor items. @returns Nothing; nested HTML output is asserted. */, function serializesNestedLists(): void {
    expect(
      serializeWriterClipboardHtml([
        { ...paragraph, listKind: "numbered", listLevel: 0, marker: "1.", text: "Parent" },
        { ...paragraph, listKind: "bullet", listLevel: 1, marker: "•", text: "Child" },
        { ...paragraph, listKind: "numbered", listLevel: 1, marker: "1.", text: "Nested number" },
        { ...paragraph, listKind: "numbered", listLevel: 0, marker: "2.", text: "Sibling" },
        { ...paragraph, listKind: "bullet", listLevel: 3, marker: "•", text: "Jump" },
      ]),
    ).toBe(
      '<ol><li style="text-align: left;">Parent<ul><li style="text-align: left;">Child</li></ul><ol><li style="text-align: left;">Nested number</li></ol></li><li style="text-align: left;">Sibling<ul><li style="text-align: left;">Jump</li></ul></li></ol>',
    );
  });
});
