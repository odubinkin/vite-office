/** @fileoverview Verifies Writer ASCII clipboard serialization follows list-label rules without leaking presentation metadata. */

import { describe, expect, it } from "vitest";

import { serializeWriterClipboardPlainText } from "./ascatr";

/** Defines a compact prepared Writer paragraph for ASCII format-writer tests. */
const paragraph = {
  listKind: "none",
  marker: undefined,
  style: "",
  text: "Body",
} as const;

describe("serializeWriterClipboardPlainText" /** Groups Writer ASCII list transfer tests. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterAsciiListWriterTests(): void {
  it("exports labels only when multiple complete list items are transferred" /** Verifies a standalone list item keeps only its selected text, matching Writer copy behavior. @returns Nothing; plain-text output is asserted. */, function suppressesSingleListLabels(): void {
    expect(
      serializeWriterClipboardPlainText([
        { ...paragraph, listKind: "bullet", marker: "•", text: "One" },
      ]),
    ).toBe("One");
  });

  it("indents complete list labels and supplies a fallback marker" /** Verifies readable multi-item text transfer remains useful when marker metadata is unavailable. @returns Nothing; plain-text output is asserted. */, function exportsMultipleListLabels(): void {
    expect(
      serializeWriterClipboardPlainText([
        { ...paragraph, listKind: "numbered", marker: undefined, text: "One" },
        { ...paragraph, listKind: "bullet", marker: undefined, text: "Two" },
        paragraph,
      ]),
    ).toBe("    1. One\n    • Two\nBody");
  });
});
