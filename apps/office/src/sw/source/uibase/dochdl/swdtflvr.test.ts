/** @fileoverview Verifies Writer clipboard payloads include only visible selected paragraphs and preserve bounded paragraph presentation. */

import { afterEach, describe, expect, it } from "vitest";

import { createWriterClipboardSelection, readWriterClipboardPaste } from "./swdtflvr";

afterEach(
  /**
   * Removes test-owned selections and document markup after each selection serialization scenario.
   *
   * @returns Nothing; the JSDOM document is returned to its default selection state.
   */
  function resetWriterClipboardSelectionFixture(): void {
    globalThis.getSelection()?.removeAllRanges();
    document.body.replaceChildren();
  },
);

/**
 * Selects the complete supplied DOM node range through the browser selection API.
 *
 * @param firstNode - First node included by the test-owned selection.
 * @param lastNode - Last node included by the test-owned selection.
 * @returns Current browser Selection that owns the requested range.
 */
function selectCompleteNodes(firstNode: Node, lastNode: Node): Selection {
  const range = document.createRange();
  range.setStartBefore(firstNode);
  range.setEndAfter(lastNode);
  const selection = globalThis.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

describe("createWriterClipboardSelection" /** Groups selected Writer paragraph clipboard serialization tests. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterClipboardSelectionTests(): void {
  it("parses only bounded Writer direct formats from rich or plain clipboard text" /** Verifies Paste consumes visible text while discarding unsafe clipboard HTML behavior and attributes. @returns Nothing; normalized source-aware text runs are asserted. */, function parsesWriterClipboardPaste(): void {
    const htmlClipboard = {
      /** Returns test-owned MIME values. @param type - Requested clipboard MIME type. @returns Rich HTML only for text/html. */
      getData(type: string): string {
        return type === "text/html"
          ? '<strong>Bold <em>italic</em></strong><span style="text-decoration: underline">under</span><br><!--ignored--><a href="https://invalid.example" onclick="alert(1)">link</a><script>ignored</script>'
          : "plain fallback";
      },
    } as Pick<DataTransfer, "getData">;
    expect(readWriterClipboardPaste(htmlClipboard)).toEqual({
      runs: [
        { attributes: { bold: true, italic: false, underline: false }, text: "Bold " },
        { attributes: { bold: true, italic: true, underline: false }, text: "italic" },
        { attributes: { bold: false, italic: false, underline: true }, text: "under" },
        { attributes: { bold: false, italic: false, underline: false }, text: "\nlink" },
      ],
      source: "html",
    });
    const plainClipboard = {
      /** Returns only the requested test-owned plain-text MIME payload. @param type - Requested clipboard MIME type. @returns Plain text only for text/plain. */
      getData(type: string): string {
        return type === "text/plain" ? "plain\ntext" : "";
      },
    } as Pick<DataTransfer, "getData">;
    expect(readWriterClipboardPaste(plainClipboard)).toEqual({
      runs: [{ attributes: { bold: false, italic: false, underline: false }, text: "plain\ntext" }],
      source: "plain-text",
    });
    expect(
      readWriterClipboardPaste({
        /** Returns no values for an empty clipboard fixture. @returns Empty browser clipboard value. */
        getData: (): string => "",
      }),
    ).toBeUndefined();
    expect(
      readWriterClipboardPaste({
        /** Returns an empty ignored script as HTML. @param type - Requested clipboard MIME type. @returns Empty script HTML or no plain text. */
        getData(type: string): string {
          return type === "text/html" ? "<script></script>" : "";
        },
      }),
    ).toEqual({ runs: [], source: "html" });
    expect(
      readWriterClipboardPaste({
        /** Returns ignored script HTML and a visible plain fallback. @param type - Requested clipboard MIME type. @returns Script HTML or fallback text. */
        getData(type: string): string {
          return type === "text/html" ? "<script>ignored</script>" : "fallback";
        },
      }),
    ).toEqual({
      runs: [{ attributes: { bold: false, italic: false, underline: false }, text: "fallback" }],
      source: "plain-text",
    });
  });

  it("omits accessibility descriptions and preserves every bounded paragraph style in rich HTML" /** Verifies only rendered editable paragraph bodies become clipboard data. @returns Nothing; visible plain text and portable HTML are asserted. */, function serializesVisibleParagraphs(): void {
    document.body.innerHTML = `
      <span data-writer-auxiliary-description="true">Paragraph style: Heading 1</span>
      <p data-alignment="center" data-style="heading-1" data-writer-paragraph-id="p-1">First &amp; &lt;heading&gt;</p>
      <span data-writer-auxiliary-description="true">Paragraph style: Default Paragraph Style</span>
      <p data-alignment="right" data-style="default" data-writer-paragraph-id="p-2">Second</p>
      <p data-alignment="justify" data-style="default" data-writer-paragraph-id="p-3">Third</p>
      <p data-alignment="diagonal" data-style="unknown" data-writer-paragraph-id="p-4">Fourth</p>
    `;
    const paragraphs = document.querySelectorAll("p");
    const selection = selectCompleteNodes(
      paragraphs[0] as HTMLParagraphElement,
      paragraphs[3] as HTMLParagraphElement,
    );

    expect(createWriterClipboardSelection(selection)).toEqual({
      html: '<p style="text-align: center; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;">First &amp; &lt;heading&gt;</p><p style="text-align: right; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Second</p><p style="text-align: justify; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Third</p><p style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Fourth</p>',
      plainText: "First & <heading>\nSecond\nThird\nFourth",
    });
  });

  it("serializes only a partial paragraph selection and escapes every HTML-significant character" /** Verifies partial Writer selection boundaries remain exact in both clipboard formats. @returns Nothing; the clipped text and HTML escaping are asserted. */, function serializesPartialParagraph(): void {
    const paragraph = document.createElement("p");
    paragraph.dataset.alignment = "left";
    paragraph.dataset.style = "default";
    paragraph.dataset.writerParagraphId = "p-1";
    paragraph.textContent = `x&<>"'y`;
    document.body.append(paragraph);
    const textNode = paragraph.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 1);
    range.setEnd(textNode, 6);
    const selection = globalThis.getSelection() as Selection;
    selection.addRange(range);

    expect(createWriterClipboardSelection(selection)).toEqual({
      html: '<p style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">&amp;&lt;&gt;&quot;&#39;</p>',
      plainText: `&<>"'`,
    });
  });

  it("preserves only supported direct character semantics in rich Writer clipboard HTML" /** Verifies strong, emphasis, and single underline survive selection Copy while arbitrary editable markup is flattened. @returns Nothing; bounded semantic HTML and plain text are asserted. */, function serializesDirectCharacterFormatting(): void {
    document.body.innerHTML =
      '<p data-alignment="left" data-style="default" data-writer-paragraph-id="p-1"><strong>Bold <em>italic</em></strong><span style="text-decoration: underline">under</span><mark>plain</mark></p>';
    const paragraph = document.querySelector("p") as HTMLParagraphElement;
    const selection = selectCompleteNodes(paragraph, paragraph);
    expect(createWriterClipboardSelection(selection)).toEqual({
      html: '<p style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;"><strong>Bold <em>italic</em></strong><span style="text-decoration: underline">under</span>plain</p>',
      plainText: "Bold italicunderplain",
    });
    const textNode = paragraph.querySelector("strong")?.firstChild as Text;
    const partialRange = document.createRange();
    partialRange.setStart(textNode, 1);
    partialRange.setEnd(textNode, 4);
    selection.removeAllRanges();
    selection.addRange(partialRange);
    expect(createWriterClipboardSelection(selection)?.html).toContain("<strong>old</strong>");
  });

  it("retains a uniform partial emphasis or underline ancestor and flattens mixed-format endpoints" /** Verifies partial Range cloning restores each safe shared ancestor without wrapping a selection that crosses formats. @returns Nothing; portable HTML fragments are asserted. */, function serializesPartialDirectFormats(): void {
    document.body.innerHTML =
      '<p data-alignment="left" data-style="default" data-writer-paragraph-id="p-1"><em>italic</em><span style="text-decoration: underline">under</span><!--ignored--></p>';
    const paragraph = document.querySelector("p") as HTMLParagraphElement;
    const italicText = paragraph.querySelector("em")?.firstChild as Text;
    const underlineText = paragraph.querySelector("span")?.firstChild as Text;
    const selection = globalThis.getSelection() as Selection;
    const italicRange = document.createRange();
    italicRange.setStart(italicText, 1);
    italicRange.setEnd(italicText, 4);
    selection.addRange(italicRange);
    expect(createWriterClipboardSelection(selection)?.html).toContain("<em>tal</em>");
    selection.removeAllRanges();
    const underlineRange = document.createRange();
    underlineRange.setStart(underlineText, 1);
    underlineRange.setEnd(underlineText, 4);
    selection.addRange(underlineRange);
    expect(createWriterClipboardSelection(selection)?.html).toContain(
      '<span style="text-decoration: underline">nde</span>',
    );
    selection.removeAllRanges();
    const mixedRange = document.createRange();
    mixedRange.setStart(italicText, 0);
    mixedRange.setEnd(underlineText, 2);
    selection.addRange(mixedRange);
    expect(createWriterClipboardSelection(selection)?.html).not.toContain("<em><span");
  });

  it("delegates contiguous complete list items to semantic HTML and list-aware plain-text writers" /** Verifies the transfer handler sends only complete list paragraphs through list serialization. @returns Nothing; semantic markup and visible plain-text labels are asserted. */, function serializesSemanticLists(): void {
    document.body.innerHTML = `
      <span data-writer-auxiliary-description="true">Paragraph list: Ordered List</span>
      <p data-alignment="left" data-list-kind="numbered" data-list-marker="1." data-style="default" data-writer-paragraph-id="p-1">First</p>
      <p data-alignment="left" data-list-kind="numbered" data-list-marker="2." data-style="default" data-writer-paragraph-id="p-2">Second</p>
      <p data-alignment="left" data-list-kind="none" data-style="default" data-writer-paragraph-id="p-3">Body</p>
      <p data-alignment="left" data-list-kind="bullet" data-list-marker="•" data-style="default" data-writer-paragraph-id="p-4">Third</p>
      <p data-alignment="left" data-list-kind="bullet" data-list-marker="•" data-style="default" data-writer-paragraph-id="p-5">Fourth</p>
    `;
    const paragraphs = document.querySelectorAll("p");
    const selection = selectCompleteNodes(
      paragraphs[0] as HTMLParagraphElement,
      paragraphs[4] as HTMLParagraphElement,
    );

    expect(createWriterClipboardSelection(selection)).toEqual({
      html: '<ol><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">First</li><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Second</li></ol><p style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Body</p><ul><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Third</li><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Fourth</li></ul>',
      plainText: "    1. First\n    2. Second\nBody\n    • Third\n    • Fourth",
    });
  });

  it("keeps a partial list paragraph ordinary and preserves an ordered fragment start value" /** Verifies that text-range precision prevents accidental semantic list expansion. @returns Nothing; partial and suffix selection output is asserted. */, function preservesPartialListSelectionBoundaries(): void {
    document.body.innerHTML = `
      <p data-alignment="left" data-list-kind="numbered" data-list-marker="2." data-style="default" data-writer-paragraph-id="p-1">Second item</p>
      <p data-alignment="left" data-list-kind="numbered" data-list-marker="3." data-style="default" data-writer-paragraph-id="p-2">Third item</p>
    `;
    const paragraphs = document.querySelectorAll("p");
    const selection = selectCompleteNodes(
      paragraphs[0] as HTMLParagraphElement,
      paragraphs[1] as HTMLParagraphElement,
    );
    expect(createWriterClipboardSelection(selection)).toEqual({
      html: '<ol start="2"><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Second item</li><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Third item</li></ol>',
      plainText: "    2. Second item\n    3. Third item",
    });

    const textNode = (paragraphs[0] as HTMLParagraphElement).firstChild as Text;
    const partialRange = document.createRange();
    partialRange.setStart(textNode, 1);
    partialRange.setEnd(textNode, 7);
    const partialSelection = globalThis.getSelection() as Selection;
    partialSelection.removeAllRanges();
    partialSelection.addRange(partialRange);
    expect(createWriterClipboardSelection(partialSelection)).toEqual({
      html: '<p style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">econd </p>',
      plainText: "econd ",
    });
  });

  it("delegates bounded list levels as nested HTML and level-indented plain text" /** Verifies transfer records read data-list-level without copying DOM-only marker or accessibility nodes. @returns Nothing; nested semantic output is asserted. */, function serializesNestedListLevels(): void {
    document.body.innerHTML = `
      <span data-writer-auxiliary-description="true">Paragraph list: Ordered List</span>
      <p data-alignment="left" data-list-kind="numbered" data-list-level="0" data-list-marker="1." data-style="default" data-writer-paragraph-id="p-1">Parent</p>
      <p data-alignment="left" data-list-kind="bullet" data-list-level="1" data-list-marker="•" data-style="default" data-writer-paragraph-id="p-2">Child</p>
      <p data-alignment="left" data-list-kind="numbered" data-list-level="0" data-list-marker="2." data-style="default" data-writer-paragraph-id="p-3">Sibling</p>
    `;
    const paragraphs = document.querySelectorAll("p");
    const selection = selectCompleteNodes(
      paragraphs[0] as HTMLParagraphElement,
      paragraphs[2] as HTMLParagraphElement,
    );

    expect(createWriterClipboardSelection(selection)).toEqual({
      html: '<ol><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Parent<ul><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Child</li></ul></li><li style="text-align: left; font-size: 1rem; font-weight: 400; line-height: 1.75rem;">Sibling</li></ol>',
      plainText: "    1. Parent\n        • Child\n    2. Sibling",
    });
  });

  it("normalizes malformed and oversized DOM list levels before format writers consume them" /** Verifies a malformed browser attribute cannot leak an unbounded indent into clipboard serialization. @returns Nothing; normalized nested output is asserted. */, function normalizesClipboardListLevels(): void {
    document.body.innerHTML = `
      <p data-alignment="left" data-list-kind="numbered" data-list-level="not-a-level" data-list-marker="1." data-style="default" data-writer-paragraph-id="p-1">Parent</p>
      <p data-alignment="left" data-list-kind="bullet" data-list-level="999" data-list-marker="•" data-style="default" data-writer-paragraph-id="p-2">Child</p>
    `;
    const paragraphs = document.querySelectorAll("p");
    const selection = selectCompleteNodes(
      paragraphs[0] as HTMLParagraphElement,
      paragraphs[1] as HTMLParagraphElement,
    );

    expect(createWriterClipboardSelection(selection)?.plainText).toBe(
      `    1. Parent\n${"    ".repeat(10)}• Child`,
    );
  });

  it("rejects absent, collapsed, multi-range-shaped, and non-Writer selections" /** Verifies copy feedback can distinguish a visible Writer selection from unsupported browser selection state. @returns Nothing; unsupported states produce no clipboard payload. */, function rejectsUnsupportedSelections(): void {
    expect(createWriterClipboardSelection(null)).toBeUndefined();
    const paragraph = document.createElement("p");
    paragraph.textContent = "Not a Writer paragraph";
    document.body.append(paragraph);
    const range = document.createRange();
    range.setStart(paragraph.firstChild as Text, 0);
    range.collapse(true);
    const selection = globalThis.getSelection() as Selection;
    selection.addRange(range);
    expect(createWriterClipboardSelection(selection)).toBeUndefined();
    expect(
      createWriterClipboardSelection({ isCollapsed: false, rangeCount: 2 } as Selection),
    ).toBeUndefined();
    expect(
      createWriterClipboardSelection(selectCompleteNodes(paragraph, paragraph)),
    ).toBeUndefined();
  });
});
