/** @fileoverview Verifies the Writer selection shell translates nested direct-format DOM ranges without treating cross-paragraph selection as a character command. */

import { afterEach, describe, expect, it } from "vitest";

import {
  getWriterCollapsedCaretOffset,
  getWriterSameParagraphSelection,
  restoreWriterCollapsedCaret,
} from "./select";

afterEach(
  /** Resets test-owned browser selection and DOM fixtures. @returns Nothing; the JSDOM body becomes empty. */ function resetWriterSelectionFixture(): void {
    globalThis.getSelection()?.removeAllRanges();
    document.body.replaceChildren();
  },
);

/** Replaces the document with two Writer paragraph hosts, the first containing nested direct-format elements. @returns First and second paragraph elements. */
function createSelectionFixture(): Readonly<{
  first: HTMLParagraphElement;
  second: HTMLParagraphElement;
}> {
  document.body.innerHTML =
    '<p data-writer-paragraph-id="p-1">A<strong>B<em>C</em></strong>D</p><p data-writer-paragraph-id="p-2">E</p>';
  const [first, second] = Array.from(document.querySelectorAll("p")) as HTMLParagraphElement[];
  return { first: first as HTMLParagraphElement, second: second as HTMLParagraphElement };
}

/** Installs a selection range in JSDOM. @param range - Prepared browser range. @returns Current mutable browser selection. */
function selectRange(range: Range): Selection {
  const selection = globalThis.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

describe("Writer selection shell" /** Groups nested Writer DOM selection bridge behavior. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterSelectionShellTests(): void {
  it("reads and restores collapsed offsets through nested text runs" /** Verifies caret conversion crosses rendered direct-format elements. @returns Nothing; clamped offsets are asserted. */, function restoresNestedCaret(): void {
    const { first } = createSelectionFixture();
    const boldText = first.querySelector("strong")?.firstChild as Text;
    const range = document.createRange();
    range.setStart(boldText, 1);
    range.collapse(true);
    selectRange(range);
    expect(getWriterCollapsedCaretOffset(first)).toBe(2);
    restoreWriterCollapsedCaret(first, 3);
    expect(globalThis.getSelection()?.isCollapsed).toBe(true);
    expect(globalThis.getSelection()?.getRangeAt(0).toString()).toBe("");
    expect(getWriterCollapsedCaretOffset(first)).toBe(3);
    restoreWriterCollapsedCaret(first, 999);
    expect(getWriterCollapsedCaretOffset(first)).toBe(4);
  });

  it("accepts either direction within one paragraph and rejects cross-paragraph selections" /** Verifies only a single editable Writer paragraph produces a format-command range. @returns Nothing; supported and rejected selections are asserted. */, function resolvesFormatRange(): void {
    const { first, second } = createSelectionFixture();
    const firstText = first.firstChild as Text;
    const italicText = first.querySelector("em")?.firstChild as Text;
    const sameParagraph = document.createRange();
    sameParagraph.setStart(firstText, 0);
    sameParagraph.setEnd(italicText, 1);
    const selection = selectRange(sameParagraph);
    expect(getWriterSameParagraphSelection(selection)).toEqual({
      end: 3,
      paragraphId: "p-1",
      start: 0,
    });
    const crossParagraph = document.createRange();
    crossParagraph.setStart(firstText, 0);
    crossParagraph.setEnd(second.firstChild as Text, 1);
    expect(getWriterSameParagraphSelection(selectRange(crossParagraph))).toBeUndefined();
    expect(getWriterSameParagraphSelection(null)).toBeUndefined();
  });
});
