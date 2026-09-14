/** @fileoverview Verifies native clipboard mechanics delegate canonical selections to Writer. */

import { describe, expect, it, vi } from "vitest";

import { BrowserWriterClipboardEvents } from "./writer-clipboard-events";
import { getWriterDomSelection } from "./writer-selection";

describe("BrowserWriterClipboardEvents" /** Groups native clipboard adapter behavior. @returns Nothing. */, () => {
  it("copies, cuts, and pastes a cross-paragraph selection through injected ports" /** Verifies cross-paragraph clipboard delegation. @returns Nothing. */, () => {
    document.body.innerHTML =
      '<p data-writer-paragraph-id="p-1">First</p><p data-writer-paragraph-id="p-2">Second</p>';
    const paragraphs = document.querySelectorAll("p");
    const range = document.createRange();
    range.setStart(paragraphs[0]?.firstChild as Text, 2);
    range.setEnd(paragraphs[1]?.firstChild as Text, 3);
    const selection = globalThis.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
    const cut = vi.fn();
    const paste = vi.fn();
    const adapter = new BrowserWriterClipboardEvents({
      cut,
      getSelection: /** Reads the fixture selection. @returns Fixture selection. */ () => selection,
      mapSelection: getWriterDomSelection,
      paste,
    });
    const setData = vi.fn();
    const event = {
      clipboardData: { setData } as unknown as DataTransfer,
      preventDefault: vi.fn(),
    };
    expect(adapter.Copy(event)).toBe(true);
    expect(adapter.Cut(event)).toBe(true);
    expect(cut).toHaveBeenCalledWith({
      mark: { offset: 2, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-2" },
    });
    expect(adapter.Paste(event)).toBe(true);
    expect(paste).toHaveBeenCalledWith(
      expect.objectContaining({ mark: expect.any(Object) }),
      event.clipboardData,
    );
    expect(setData).toHaveBeenCalledWith("text/plain", expect.stringContaining("rst"));
  });
});
