/** @fileoverview Verifies Writer clipboard payloads include only visible selected paragraphs and preserve bounded paragraph presentation. */

import { afterEach, describe, expect, it } from "vitest";

import { createWriterClipboardSelection } from "./writer-clipboard-selection";

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
