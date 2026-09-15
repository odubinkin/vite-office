/**
 * @fileoverview Verifies Writer menu placement and browser-owned copy commands through the application shell.
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Desktop } from "../../../framework/source/services/desktop";
import { createOfficeModuleDescriptors } from "../../../framework/source/services/modulemanager";
import { createWriterModuleFactory } from "../../source/uibase/app/swmodule";

/** Renders the desktop through the same Writer module registration used by the composition root. @returns Configured desktop element. */
function App(): React.JSX.Element {
  return <Desktop modules={createOfficeModuleDescriptors([createWriterModuleFactory()])} />;
}

/**
 * Replaces the complete text content of one document-integrated editable Writer paragraph.
 *
 * @param paragraph - Accessible contenteditable paragraph rendered by the Writer document page.
 * @param text - Complete replacement text that the bounded paragraph model should store.
 * @returns Nothing; React receives the browser input event after the DOM text changes.
 */
function enterWriterParagraphText(paragraph: HTMLElement, text: string): void {
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = window.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  fireEvent(
    paragraph,
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: text,
      inputType: "insertReplacementText",
    }),
  );
}

/** Selects all visible text in one Writer paragraph. @param paragraph - Editable paragraph. @returns Nothing. */
function selectWriterParagraphText(paragraph: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = window.getSelection();
  if (selection === null) throw new Error("Writer test selection is unavailable.");
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
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
  beforeEach(
    /** Opens the dedicated Writer page used by application-shell menu tests. @returns Nothing. */
    function openWriterRoute(): void {
      globalThis.history.replaceState(null, "", "/writer");
    },
  );

  it("places implemented Writer commands in accessible top-level menus" /**
   * Verifies generated supported menus expose only upstream-positioned commands while filtered X menus stay absent.
   *
   * @returns Nothing; assertions cover bounded command placement and disabled state.
   */, function rendersWriterMenus(): void {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("menu", { name: "File menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "New Document" })).toBeEnabled();
    expect(screen.getByRole("menuitem", { name: "Open…" })).toBeEnabled();
    expect(screen.getByRole("menuitem", { name: "Save As…" })).toBeEnabled();
    expect(screen.getByRole("menuitem", { name: "Open Local Copy…" })).toBeEnabled();
    expect(screen.getByRole("menuitem", { name: "Save Local Copy" })).toBeEnabled();
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
      name: "Rulers",
    });
    expect(horizontalRulerMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(horizontalRulerMenuItem);
    expect(screen.queryByLabelText("Writer horizontal ruler")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rulers" }));
    const hiddenHorizontalRulerMenuItem = screen.getByRole("menuitemcheckbox", {
      name: "Rulers",
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
    expect(screen.getByRole("menuitem", { name: "Cut" })).toBeEnabled();
    expect(screen.getByRole("menuitem", { name: "Paste" })).toBeEnabled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    const getSelection = vi.spyOn(window, "getSelection").mockReturnValue(null);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    getSelection.mockRestore();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    expect(screen.getByRole("menu", { name: "Format menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Text" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Styles" }));
    expect(screen.getByRole("menu", { name: "Styles menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(screen.getByRole("menuitem", { name: "Hyperlink…" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Table" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tools" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Window" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Help" })).not.toBeInTheDocument();
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
      await waitFor(
        /** Waits for Sfx command failure presentation. @returns Nothing. */ () =>
          expect(screen.getByText("Select text to copy.")).toBeInTheDocument(),
      );
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
      expect(screen.getByText("Document has unsaved changes.")).toBeInTheDocument();
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
      fireEvent.click(screen.getByRole("button", { name: "Center" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      selectWriterParagraphText(editor);
      fireEvent.change(screen.getByLabelText("Font name"), { target: { value: "Noto Serif" } });
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      selectWriterParagraphText(editor);
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
        '<p style="text-align: center; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;"><span style="font-family: Noto Serif"><strong>Formatted Writer body</strong></span></p>',
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

  it("cuts and pastes through Writer menu and toolbar browser commands" /** Verifies Cut copies before deletion, Paste resolves selected, collapsed, and fallback targets, and both failure paths report deterministic feedback. @returns A promise resolved after browser command interactions are asserted. */, async function cutsAndPastesWriterSelection(): Promise<void> {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const originalExecCommand = Object.getOwnPropertyDescriptor(document, "execCommand");
    const writeText = vi.fn().mockResolvedValue(undefined);
    const read = vi.fn();
    const readText = vi.fn().mockResolvedValue("Plain clipboard");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { read, readText, writeText },
    });
    try {
      render(<App />);
      const editor = screen.getByRole("textbox", { name: "Writer document text" });
      fireEvent.click(screen.getByRole("button", { name: "Cut" }));
      await waitFor(
        /** Waits for Sfx command failure presentation. @returns Nothing. */ () =>
          expect(screen.getByText("Select text to cut.")).toBeInTheDocument(),
      );
      enterWriterParagraphText(editor, "Cut me");
      const selection = window.getSelection() as Selection;
      const selectedRange = document.createRange();
      selectedRange.selectNodeContents(editor);
      selection.removeAllRanges();
      selection.addRange(selectedRange);
      document.dispatchEvent(new Event("selectionchange"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await act(
        /** Executes the menu Cut command after preparing one same-paragraph selection. @returns A fulfilled React act promise. */
        async function cutsSelectedWriterText(): Promise<void> {
          fireEvent.click(screen.getByRole("menuitem", { name: "Cut" }));
        },
      );
      expect(writeText).toHaveBeenCalledWith("Cut me");
      expect(editor).toHaveTextContent("");
      read.mockResolvedValue([
        {
          /** Returns bounded rich or plain test clipboard text. @param type - Requested clipboard MIME type. @returns MIME-typed Blob with deterministic text. */
          async getType(type: string): Promise<Blob> {
            return new Blob(
              [
                type === "text/html"
                  ? '<span style="font-family: Noto Serif"><strong>Pasted</strong></span>'
                  : "Pasted",
              ],
              { type },
            );
          },
          types: ["text/html", "text/plain"],
        } as unknown as ClipboardItem,
      ]);
      await act(
        /** Executes toolbar Paste at the collapsed caret restored by the successful Cut transition. @returns A fulfilled React act promise. */
        async function pastesAtCollapsedCaret(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Paste" }));
        },
      );
      const pastedEditor = screen.getByRole("textbox", { name: "Writer document text" });
      expect(pastedEditor.querySelector("strong")).toHaveTextContent("Pasted");
      expect(pastedEditor.querySelector("span")).toHaveStyle({ fontFamily: "Noto Serif" });
      const replaceRange = document.createRange();
      replaceRange.selectNodeContents(pastedEditor);
      selection.removeAllRanges();
      selection.addRange(replaceRange);
      document.dispatchEvent(new Event("selectionchange"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      await act(
        /** Replaces a same-paragraph selection through the Edit Paste command. @returns A fulfilled React act promise. */
        async function pastesOverSelection(): Promise<void> {
          fireEvent.click(screen.getByRole("menuitem", { name: "Paste" }));
        },
      );
      const replacedEditor = screen.getByRole("textbox", { name: "Writer document text" });
      expect(replacedEditor).toHaveTextContent("Pasted");
      selection.removeAllRanges();
      await act(
        /** Pastes with no browser selection, exercising the deterministic active-paragraph fallback. @returns A fulfilled React act promise. */
        async function pastesAtActiveParagraphEnd(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Paste" }));
        },
      );
      const duplicatedEditor = screen.getByRole("textbox", { name: "Writer document text" });
      expect(duplicatedEditor).toHaveTextContent("PastedPasted");
      read.mockResolvedValue([]);
      await act(
        /** Executes Paste with no browser text payload. @returns A fulfilled React act promise. */
        async function rejectsEmptyBrowserClipboard(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Paste" }));
        },
      );
      expect(screen.getByText("Clipboard has no text to paste.")).toBeInTheDocument();
      const failedCutRange = document.createRange();
      failedCutRange.selectNodeContents(duplicatedEditor);
      const failedCutSelection = window.getSelection() as Selection;
      failedCutSelection.removeAllRanges();
      failedCutSelection.addRange(failedCutRange);
      document.dispatchEvent(new Event("selectionchange"));
      expect(failedCutSelection.toString()).toBe("PastedPasted");
      writeText.mockRejectedValueOnce(new Error("Denied"));
      Object.defineProperty(document, "execCommand", {
        configurable: true,
        value: vi.fn().mockReturnValue(false),
      });
      await act(
        /** Executes a denied Cut that must retain document text. @returns A fulfilled React act promise. */
        async function rejectsCutClipboardWrite(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Cut" }));
        },
      );
      expect(duplicatedEditor).toHaveTextContent("PastedPasted");
      read.mockRejectedValueOnce(new Error("Denied"));
      readText.mockRejectedValueOnce(new Error("Denied"));
      await act(
        /** Executes a denied Paste read that must retain document text. @returns A fulfilled React act promise. */
        async function rejectsPasteClipboardRead(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Paste" }));
        },
      );
      expect(screen.getByText("Could not read browser clipboard.")).toBeInTheDocument();
    } finally {
      if (originalClipboard === undefined)
        delete (navigator as unknown as { clipboard?: unknown }).clipboard;
      else Object.defineProperty(navigator, "clipboard", originalClipboard);
      if (originalExecCommand === undefined)
        delete (document as unknown as { execCommand?: unknown }).execCommand;
      else Object.defineProperty(document, "execCommand", originalExecCommand);
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
    fireEvent.click(screen.getByRole("button", { name: "Center" }));
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
      '<p style="text-align: center; font-size: 1.5rem; font-weight: 700; line-height: 2.25rem;"><strong>Keyboard copied heading</strong></p>',
    );
    expect(setData).not.toHaveBeenCalledWith(
      "text/plain",
      expect.stringContaining("Paragraph style:"),
    );
  });

  it("implements roving, popup, submenu, typeahead, escape, and outside-click menu semantics" /** Verifies the primary menu keyboard and dismissal interactions. @returns Nothing. */, function navigatesWriterMenus(): void {
    render(<App />);
    const file = screen.getByRole("button", { name: "File" });
    const edit = screen.getByRole("button", { name: "Edit" });
    file.focus();
    fireEvent.keyDown(file, { key: "ArrowRight" });
    expect(edit).toHaveFocus();
    expect(edit).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Cut" }), { key: "End" });
    expect(screen.getByRole("menuitem", { name: "Select All" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Select All" }), { key: "p" });
    expect(screen.getByRole("menuitem", { name: "Paste" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Paste" }), { key: "Escape" });
    expect(edit).toHaveFocus();
    expect(screen.queryByRole("menu", { name: "Edit menu" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    const text = screen.getByRole("menuitem", { name: "Text" });
    text.focus();
    fireEvent.keyDown(text, { key: "ArrowRight" });
    expect(screen.getByRole("menuitemcheckbox", { name: "Bold" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menuitemcheckbox", { name: "Bold" }), { key: "ArrowLeft" });
    expect(text).toHaveFocus();
    fireEvent.pointerDown(screen.getByRole("region", { name: "Writer document canvas" }));
    expect(screen.queryByRole("menu", { name: "Format menu" })).not.toBeInTheDocument();
  });

  it("covers every keyboard entry and transition in the reusable menu state machine" /** Traverses every supported top-level and popup keyboard transition. @returns Nothing. */, function traversesMenuStateMachine(): void {
    vi.useFakeTimers();
    try {
      render(<App />);
      const file = screen.getByRole("button", { name: "File" });
      file.focus();
      fireEvent.keyDown(file, { key: "ArrowLeft" });
      expect(screen.getByRole("button", { name: "Styles" })).toHaveFocus();
      fireEvent.keyDown(screen.getByRole("button", { name: "Styles" }), { key: "Home" });
      expect(file).toHaveFocus();
      fireEvent.keyDown(file, { key: "End" });
      expect(screen.getByRole("button", { name: "Styles" })).toHaveFocus();
      fireEvent.keyDown(screen.getByRole("button", { name: "Styles" }), { key: "Escape" });
      fireEvent.keyDown(screen.getByRole("button", { name: "Styles" }), { key: "Tab" });

      fireEvent.click(file);
      const firstFileItem = screen.getByRole("menuitem", { name: "New Document" });
      firstFileItem.focus();
      fireEvent.keyDown(firstFileItem, { key: "ArrowDown" });
      expect(screen.getByRole("menuitem", { name: "Open…" })).toHaveFocus();
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Open…" }), {
        key: "ArrowUp",
      });
      expect(firstFileItem).toHaveFocus();
      fireEvent.keyDown(firstFileItem, { key: "End" });
      expect(screen.getByRole("menuitem", { name: "Export…" })).toHaveFocus();
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Export…" }), {
        key: "Home",
      });
      expect(firstFileItem).toHaveFocus();
      fireEvent.keyDown(file, { key: "ArrowRight" });
      expect(screen.getByRole("menu", { name: "Edit menu" })).toBeVisible();
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus();
      fireEvent.pointerDown(screen.getByRole("menuitem", { name: "Cut" }));
      expect(screen.getByRole("menu", { name: "Edit menu" })).toBeVisible();
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Cut" }), { key: "Tab" });
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Cut" }), { key: "ArrowRight" });
      expect(screen.getByRole("menu", { name: "View menu" })).toBeVisible();
      expect(screen.getByRole("menuitemcheckbox", { name: "Status Bar" })).toHaveFocus();
      fireEvent.keyDown(screen.getByRole("menuitemcheckbox", { name: "Status Bar" }), {
        key: "ArrowLeft",
      });
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus();
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Cut" }), { key: "c" });
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Cut" }), { key: "u" });
      vi.advanceTimersByTime(500);
      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Cut" }), { key: " " });
      expect(screen.queryByRole("menu", { name: "Edit menu" })).not.toBeInTheDocument();

      const view = screen.getByRole("button", { name: "View" });
      fireEvent.keyDown(view, { key: "ArrowUp" });
      expect(screen.getByRole("menuitemcheckbox", { name: "Sidebar" })).toHaveFocus();
      fireEvent.click(screen.getByRole("menuitem", { name: "Rulers" }));
      const horizontal = screen.getByRole("menuitemcheckbox", { name: "Rulers" });
      expect(horizontal).toHaveFocus();
      fireEvent.keyDown(horizontal, { key: "Escape" });
      expect(screen.getByRole("menuitem", { name: "Rulers" })).toHaveFocus();
      fireEvent.click(screen.getByRole("menuitem", { name: "Rulers" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Rulers" }));

      const insert = screen.getByRole("button", { name: "Insert" });
      fireEvent.keyDown(insert, { key: "ArrowDown" });
      expect(screen.getByRole("menu", { name: "Insert menu" })).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });
});
