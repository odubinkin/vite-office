/** @fileoverview Verifies bounded Writer same-paragraph text replacement preserves direct formatting and document lifecycle state. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { appendWriterParagraph, createWriterDocument, replaceWriterParagraph } from "./writer";
import { replaceWriterParagraphTextRange } from "./DocumentContentOperationsManager";

/** Creates one formatted Writer paragraph fixture. @returns Dirty-compatible Writer document with normalized direct-format runs. */
function createWriterFixture() {
  const writer = replaceWriterParagraph(
    createWriterDocument(
      createDocument({ id: "writer", suiteId: "writer", title: "Writer" }),
      "p-1",
    ),
    "p-1",
    "Before after",
  );
  return replaceWriterParagraphTextRange(writer, { end: 6, paragraphId: "p-1", start: 0 }, [
    { attributes: { bold: true }, text: "Before" },
  ]);
}

describe("Writer document content operations" /** Groups same-paragraph text range replacement behavior. @returns Nothing; Vitest registers the enclosed case. */, function defineWriterDocumentContentOperationTests(): void {
  it("replaces, removes, and rejects bounded Writer paragraph ranges" /** Verifies Cut/Paste foundations preserve surrounding direct runs and no-op identity. @returns Nothing; immutable document changes are asserted. */, function replacesParagraphRange(): void {
    const writer = createWriterFixture();
    const pasted = replaceWriterParagraphTextRange(
      writer,
      { end: 6, paragraphId: "p-1", start: 6 },
      [{ attributes: { italic: true }, text: " big" }],
    );
    expect(pasted.paragraphs[0]?.text).toBe("Before big after");
    expect(pasted.paragraphs[0]?.runs).toEqual([
      { attributes: { bold: true, italic: false, underline: false }, text: "Before" },
      { attributes: { bold: false, italic: true, underline: false }, text: " big" },
      { attributes: { bold: false, italic: false, underline: false }, text: " after" },
    ]);
    expect(
      replaceWriterParagraphTextRange(pasted, { end: 10, paragraphId: "p-1", start: 6 }, [])
        .paragraphs[0]?.text,
    ).toBe("Before after");
    expect(
      replaceWriterParagraphTextRange(writer, { end: 0, paragraphId: "p-1", start: 0 }, []),
    ).toBe(writer);
    const documentWithSibling = appendWriterParagraph(pasted, "p-2");
    expect(
      replaceWriterParagraphTextRange(
        documentWithSibling,
        { end: 1, paragraphId: "p-1", start: 0 },
        [],
      ).paragraphs[1]?.id,
    ).toBe("p-2");
    expect(
      /** Attempts an out-of-bounds Writer text range. @returns Nothing; the operation always throws. */
      function replacesBeyondWriterParagraph(): void {
        replaceWriterParagraphTextRange(writer, { end: 99, paragraphId: "p-1", start: 0 }, []);
      },
    ).toThrow("outside");
    expect(
      /** Attempts replacement in an unknown Writer paragraph. @returns Nothing; the operation always throws. */
      function replacesUnknownWriterParagraph(): void {
        replaceWriterParagraphTextRange(writer, { end: 0, paragraphId: "missing", start: 0 }, []);
      },
    ).toThrow("Unknown paragraph");
  });
});
