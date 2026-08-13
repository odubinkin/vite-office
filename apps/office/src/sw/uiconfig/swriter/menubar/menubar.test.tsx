/**
 * @fileoverview Verifies Writer menu placement and browser-owned copy commands through the application shell.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Desktop as App } from "../../../../framework/source/services/desktop";

/**
 * Replaces the complete text content of one document-integrated editable Writer paragraph.
 *
 * @param paragraph - Accessible contenteditable paragraph rendered by the Writer document page.
 * @param text - Complete replacement text that the bounded paragraph model should store.
 * @returns Nothing; React receives the browser input event after the DOM text changes.
 */
function enterWriterParagraphText(paragraph: HTMLElement, text: string): void {
  paragraph.textContent = text;
  fireEvent.input(paragraph);
}

/** Provides a test-owned rich ClipboardItem that retains its MIME blobs for Writer UI assertions. */
class WriterClipboardItemFixture {
  /** MIME-typed blobs passed by the browser clipboard adapter. */
  readonly items: Record<string, Blob>;

  /**
   * Creates the test-owned rich clipboard item.
   *
   * @param items - MIME-typed clipboard blobs produced by the Writer command.
   * @returns A rich ClipboardItem fixture that retains the supplied MIME blobs.
   */
  constructor(items: Record<string, Blob>) {
    this.items = items;
  }
}

describe("WriterMenuBar" /** Groups Writer menu and clipboard integration tests. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterMenuBarTests(): void {
  it("places implemented Writer commands in accessible top-level menus" /**
   * Verifies File, Edit, View, Format, and Styles open their Writer-positioned command popups while Add paragraph is absent.
   *
   * @returns Nothing; assertions cover bounded command placement and disabled state.
   */, function rendersWriterMenus(): void {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("menu", { name: "File menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Save" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.queryByRole("menu", { name: "File menu" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByRole("menu", { name: "View menu" })).toBeVisible();
    const sidebarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Sidebar" });
    expect(sidebarMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(sidebarMenuItem);
    expect(
      screen.queryByRole("complementary", { name: "Writer properties sidebar" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const hiddenSidebarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Sidebar" });
    expect(hiddenSidebarMenuItem).toHaveAttribute("aria-checked", "false");
    fireEvent.click(hiddenSidebarMenuItem);
    expect(screen.getByRole("complementary", { name: "Writer properties sidebar" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const rulersMenuItem = screen.getByRole("menuitem", { name: "Rulers" });
    expect(rulersMenuItem).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(rulersMenuItem);
    const horizontalRulerMenuItem = screen.getByRole("menuitemcheckbox", {
      name: "Horizontal ruler",
    });
    expect(horizontalRulerMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(horizontalRulerMenuItem);
    expect(screen.queryByLabelText("Writer horizontal ruler")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rulers" }));
    const hiddenHorizontalRulerMenuItem = screen.getByRole("menuitemcheckbox", {
      name: "Horizontal ruler",
    });
    expect(hiddenHorizontalRulerMenuItem).toHaveAttribute("aria-checked", "false");
    fireEvent.click(hiddenHorizontalRulerMenuItem);
    expect(screen.getByLabelText("Writer horizontal ruler")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const statusBarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Status Bar" });
    expect(statusBarMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(statusBarMenuItem);
    expect(screen.queryByRole("status", { name: "Writer status bar" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const hiddenStatusBarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Status Bar" });
    expect(hiddenStatusBarMenuItem).toHaveAttribute("aria-checked", "false");
    fireEvent.click(hiddenStatusBarMenuItem);
    expect(screen.getByRole("status", { name: "Writer status bar" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("menu", { name: "Edit menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Undo" })).toBeDisabled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    const getSelection = vi.spyOn(window, "getSelection").mockReturnValue(null);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    getSelection.mockRestore();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    expect(screen.getByRole("menu", { name: "Format menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Align left" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Styles" }));
    expect(screen.getByRole("menu", { name: "Styles menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(screen.getByRole("menu", { name: "Insert menu" })).toHaveTextContent(
      "No browser command is implemented here yet.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    expect(screen.getByRole("menu", { name: "Table menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Tools" }));
    expect(screen.getByRole("menu", { name: "Tools menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Window" }));
    expect(screen.getByRole("menu", { name: "Window menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByRole("menu", { name: "Help menu" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Add paragraph" })).not.toBeInTheDocument();
  });

  it("copies the selected Writer body through Edit and the standard toolbar" /**
   * Verifies empty-selection feedback, successful browser clipboard writes, and rejected clipboard feedback without document mutation.
   *
   * @returns A promise resolved after the asynchronous copy feedback is asserted.
   */, async function copiesWriterSelection(): Promise<void> {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      render(<App />);
      const editor = screen.getByRole("textbox", { name: "Writer document text" });
      const getSelection = vi.spyOn(window, "getSelection").mockReturnValue(null);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      getSelection.mockRestore();
      expect(screen.getByText("Select text to copy.")).toBeInTheDocument();
      enterWriterParagraphText(editor, "Copied Writer body");
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      const copyMenuItem = screen.getByRole("menuitem", { name: "Copy" });
      await act(
        /** Requests native Copy from the Writer Edit menu. @returns A fulfilled React act promise. */
        async function copiesSelectedText(): Promise<void> {
          fireEvent.click(copyMenuItem);
        },
      );
      expect(writeText).toHaveBeenCalledWith("Copied Writer body");
      expect(screen.getByText("Copied selection.")).toBeInTheDocument();
      writeText.mockRejectedValueOnce(new Error("Denied"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      const rejectedCopyMenuItem = screen.getByRole("menuitem", { name: "Copy" });
      await act(
        /** Requests a rejected native copy that must surface deterministic status feedback. @returns A fulfilled React act promise. */
        async function rejectsSelectedTextCopy(): Promise<void> {
          fireEvent.click(rejectedCopyMenuItem);
        },
      );
      expect(screen.getByText("Could not copy selection.")).toBeInTheDocument();
    } finally {
      if (originalClipboard === undefined)
        delete (navigator as unknown as { clipboard?: unknown }).clipboard;
      else Object.defineProperty(navigator, "clipboard", originalClipboard);
    }
  });

  it("copies selected visible Writer content as bounded rich HTML through the standard toolbar" /**
   * Verifies Copy excludes accessibility descriptions while preserving the implemented heading and alignment presentation for rich target editors.
   *
   * @returns A promise resolved after the ClipboardItem MIME payloads are asserted.
   */, async function copiesFormattedWriterSelection(): Promise<void> {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const originalClipboardItem = Object.getOwnPropertyDescriptor(globalThis, "ClipboardItem");
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write, writeText: vi.fn() },
    });
    Object.defineProperty(globalThis, "ClipboardItem", {
      configurable: true,
      value: WriterClipboardItemFixture,
    });
    try {
      render(<App />);
      const editor = screen.getByRole("textbox", { name: "Writer document text" });
      enterWriterParagraphText(editor, "Formatted Writer body");
      fireEvent.change(screen.getByLabelText("Paragraph style"), {
        target: { value: "heading-1" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Align center" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      await act(
        /** Activates the Writer standard-toolbar Copy command. @returns A fulfilled React act promise. */
        async function copiesRichWriterSelection(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        },
      );
      const clipboardItems = write.mock.calls[0]?.[0] as readonly WriterClipboardItemFixture[];
      const clipboardItem = clipboardItems[0] as WriterClipboardItemFixture;
      expect(await clipboardItem.items["text/plain"]?.text()).toBe("Formatted Writer body");
      expect(await clipboardItem.items["text/html"]?.text()).toBe(
        '<p style="text-align: center; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;">Formatted Writer body</p>',
      );
      expect(await clipboardItem.items["text/plain"]?.text()).not.toContain("Paragraph style:");
    } finally {
      if (originalClipboard === undefined)
        delete (navigator as unknown as { clipboard?: unknown }).clipboard;
      else Object.defineProperty(navigator, "clipboard", originalClipboard);
      if (originalClipboardItem === undefined)
        delete (globalThis as { ClipboardItem?: unknown }).ClipboardItem;
      else Object.defineProperty(globalThis, "ClipboardItem", originalClipboardItem);
    }
  });

  it("replaces native keyboard Copy data with sanitized formatted Writer clipboard types" /**
   * Verifies Ctrl/Cmd+C cannot serialize hidden paragraph-style descriptions even though the browser selection crosses their DOM siblings.
   *
   * @returns Nothing; native ClipboardEvent payload types are asserted synchronously.
   */, function interceptsNativeWriterCopy(): void {
    render(<App />);
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    const documentBody = screen.getByRole("article", { name: "Writer document body" });
    const emptySelectionSetData = vi.fn();
    globalThis.getSelection()?.removeAllRanges();
    fireEvent.copy(documentBody, { clipboardData: { setData: emptySelectionSetData } });
    expect(emptySelectionSetData).not.toHaveBeenCalled();
    enterWriterParagraphText(editor, "Keyboard copied heading");
    fireEvent.change(screen.getByLabelText("Paragraph style"), {
      target: { value: "heading-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Align center" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    const setData = vi.fn();
    fireEvent.copy(documentBody, {
      clipboardData: { setData },
    });
    expect(setData).toHaveBeenNthCalledWith(1, "text/plain", "Keyboard copied heading");
    expect(setData).toHaveBeenNthCalledWith(
      2,
      "text/html",
      '<p style="text-align: center; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;">Keyboard copied heading</p>',
    );
    expect(setData).not.toHaveBeenCalledWith(
      "text/plain",
      expect.stringContaining("Paragraph style:"),
    );
  });
});
