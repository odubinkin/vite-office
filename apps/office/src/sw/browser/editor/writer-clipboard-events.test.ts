/** @fileoverview Verifies native clipboard mechanics delegate canonical selections to Writer. */

import { describe, expect, it, vi } from "vitest";

import { BrowserWriterClipboardEvents } from "./writer-clipboard-events";

describe("BrowserWriterClipboardEvents", /** Groups native clipboard adapter behavior. @returns Nothing. */ function defineBrowserWriterClipboardEventTests(): void {
  it("copies, cuts, and pastes a cross-paragraph selection through injected ports", /** Verifies cross-paragraph clipboard delegation. @returns Nothing. */ function routesClipboardOperations(): void {
    document.body.innerHTML =
      '<p data-writer-paragraph-id="p-1">First</p><p data-writer-paragraph-id="p-2">Second</p>';
    const paragraphs = document.querySelectorAll("p");
    const range = document.createRange();
    range.setStart(paragraphs[0]?.firstChild as Text, 2);
    range.setEnd(paragraphs[1]?.firstChild as Text, 3);
    const selection = globalThis.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
    const payload = { html: "<p>model selection</p>", plainText: "model selection" };
    const createSelection = vi.fn(
      /** Returns the canonical fixture payload. @returns Model selection payload. */ () => payload,
    );
    const cut = vi.fn();
    const paste = vi.fn();
    const synchronizeSelection = vi.fn(
      /** Accepts the fixture selection. @returns True. */ () => true,
    );
    const adapter = new BrowserWriterClipboardEvents({
      createSelection,
      cut,
      paste,
      synchronizeSelection,
    });
    const setData = vi.fn();
    const event = {
      clipboardData: { setData } as unknown as DataTransfer,
      preventDefault: vi.fn(),
    };
    expect(adapter.Copy(event)).toBe(true);
    expect(adapter.Cut(event)).toBe(true);
    expect(cut).toHaveBeenCalledWith();
    expect(adapter.Paste(event)).toBe(true);
    expect(paste).toHaveBeenCalledWith(event.clipboardData);
    expect(adapter.DragStart(event.clipboardData)).toBe(true);
    const preventDrop = vi.fn();
    expect(adapter.Drop(event.clipboardData, preventDrop)).toBe(true);
    expect(preventDrop).toHaveBeenCalledOnce();
    expect(setData).toHaveBeenCalledWith("text/plain", "model selection");
    expect(createSelection).toHaveBeenCalledTimes(3);
    expect(synchronizeSelection).toHaveBeenCalledTimes(5);
  });

  it("leaves native events untouched when selection cannot enter Writer", /** Verifies selection synchronization rejection. @returns Nothing. */ function rejectsOutsideSelection(): void {
    const adapter = new BrowserWriterClipboardEvents({
      createSelection: vi.fn(),
      cut: vi.fn(),
      paste: vi.fn(),
      synchronizeSelection: /** Rejects the outside fixture. @returns False. */ () => false,
    });
    const event = {
      clipboardData: { setData: vi.fn() } as unknown as DataTransfer,
      preventDefault: vi.fn(),
    };
    expect(adapter.Copy(event)).toBe(false);
    expect(adapter.Cut(event)).toBe(false);
    expect(adapter.Paste(event)).toBe(false);
    expect(adapter.DragStart(event.clipboardData)).toBe(false);
    expect(adapter.Drop(event.clipboardData, event.preventDefault)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("does not replace native copy, cut, or drag data for a collapsed Writer cursor", /** Verifies empty model selections preserve native behavior. @returns Nothing. */ function rejectsCollapsedSelection(): void {
    const adapter = new BrowserWriterClipboardEvents({
      createSelection: /** Represents a collapsed cursor. @returns Undefined. */ () => undefined,
      cut: vi.fn(),
      paste: vi.fn(),
      synchronizeSelection: /** Accepts the collapsed Writer cursor. @returns True. */ () => true,
    });
    const event = {
      clipboardData: { setData: vi.fn() } as unknown as DataTransfer,
      preventDefault: vi.fn(),
    };
    expect(adapter.Copy(event)).toBe(false);
    expect(adapter.Cut(event)).toBe(false);
    expect(adapter.DragStart(event.clipboardData)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.clipboardData.setData).not.toHaveBeenCalled();
  });
});
