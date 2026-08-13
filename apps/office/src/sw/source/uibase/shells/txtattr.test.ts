/** @fileoverview Verifies the Writer direct-character command shell delegates valid same-paragraph ranges without broadening selection ownership. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { createWriterDocument, replaceWriterParagraph } from "../../core/doc/writer";
import { toggleWriterCharacterFormat } from "./txtattr";

/** Creates a compact Writer document with one editable direct-format paragraph. @returns Writer fixture ready for command-shell tests. */
function createWriterFixture() {
  return replaceWriterParagraph(
    createWriterDocument(
      createDocument({ id: "writer", suiteId: "writer", title: "Writer" }),
      "p-1",
    ),
    "p-1",
    "Body",
  );
}

describe("Writer text attribute shell" /** Groups direct character shell boundaries. @returns Nothing; Vitest registers the enclosed case. */, function defineWriterTextAttributeShellTests(): void {
  it("toggles a non-empty same-paragraph range and leaves a collapsed selection untouched" /** Verifies the command shell preserves selection ownership while delegating the immutable document transition. @returns Nothing; formatted and unchanged documents are asserted. */, function togglesSelection(): void {
    const writer = createWriterFixture();
    const formatted = toggleWriterCharacterFormat(
      writer,
      { end: 3, paragraphId: "p-1", start: 1 },
      "bold",
    );
    expect(formatted.paragraphs[0]?.runs).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "B" },
      { attributes: { bold: true, italic: false, underline: false }, text: "od" },
      { attributes: { bold: false, italic: false, underline: false }, text: "y" },
    ]);
    expect(
      toggleWriterCharacterFormat(writer, { end: 2, paragraphId: "p-1", start: 2 }, "italic"),
    ).toBe(writer);
  });
});
