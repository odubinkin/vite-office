/** @fileoverview Verifies the canonical SwWrtShell cursor and browser-input intent boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwTransferable } from "../dochdl/swdtflvr";
import { SwWrtShell } from "./wrtsh";
import { applyWriterTextRangeFont } from "../../core/txtnode/ndtxt";
import { createWriterHyperlinkAction, getWriterHyperlinkAtCursor } from "./wrtsh-hyperlink";

/** Creates a Writer shell with one stable paragraph. @param text - Optional initial paragraph text. @returns Shell fixture. */
function createShell(text = ""): SwWrtShell {
  const document = createWriterDocument("p-1");
  const documentState = createDocument({
    id: "input-document",
    suiteId: "writer",
    title: "Input document",
  });
  if (text.length > 0) document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(new SwDocShell(document, documentState));
}

describe("Writer canonical input shell", /** Registers canonical cursor and input tests. @returns Nothing. */ function defineWriterInputShellTests(): void {
  it("edits complete hyperlink ranges across differently formatted runs", /** Verifies caret lookup, uniform-selection state, replacement, removal, insertion, and undo. @returns Nothing. */ function editsHyperlinks(): void {
    const shell = createShell("abcd");
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    expect(shell.SetHyperlink({ url: "https://example.test/first" })).toBe(true);
    expect(shell.SetHyperlink({ url: "https://example.test/first" })).toBe(false);
    shell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    expect(shell.ToggleCharacterFormat("bold")).toBe(true);
    shell.SetCursor("p-1", 2);
    expect(shell.GetHyperlinkAtCursor()).toEqual({ url: "https://example.test/first" });
    expect(shell.SetHyperlink({ url: "https://example.test/second" })).toBe(true);
    expect(
      shell.GetActiveParagraph().runs.every(
        /** Checks that formatting splits retain the edited hyperlink. @param run - Projected text run. @returns Whether the URL matches. */
        (run) => run.hyperlink?.url === "https://example.test/second",
      ),
    ).toBe(true);
    expect(shell.SetHyperlink(undefined)).toBe(true);
    expect(shell.GetHyperlinkAtCursor()).toBeUndefined();
    expect(shell.SetHyperlink(undefined)).toBe(false);
    expect(shell.Undo()).toBe(true);
    expect(shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/second");

    shell.SetCursor("p-1", 4);
    expect(shell.SetHyperlink({ url: "relative/path" }, "Shown")).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("abcdShown");
    const emptyShell = createShell();
    expect(emptyShell.SetHyperlink({ url: "fallback-url" })).toBe(true);
    expect(emptyShell.GetActiveParagraph().text).toBe("fallback-url");
    expect(
      shell.SetHyperlink({ url: "ignored" }, undefined, {
        end: 1,
        paragraphId: "missing",
        start: 0,
      }),
    ).toBe(false);
  });

  it("returns no uniform hyperlink for mixed or cross-node selections", /** Covers non-uniform selection and missing-node hyperlink lookup. @returns Nothing. */ function rejectsMixedHyperlinkSelections(): void {
    const shell = createShell("abcd");
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 2, paragraphId: "p-1" },
    });
    shell.SetHyperlink({ url: "first" });
    shell.SetSelection({
      mark: { offset: 2, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    shell.SetHyperlink({ url: "second" });
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    expect(shell.GetHyperlinkAtCursor()).toBeUndefined();
    const document = shell.GetDoc();
    expect(
      getWriterHyperlinkAtCursor(document, {
        mark: { offset: 0, paragraphId: "missing" },
        point: { offset: 1, paragraphId: "missing" },
      }),
    ).toBeUndefined();
    expect(
      getWriterHyperlinkAtCursor(document, {
        point: { offset: 0, paragraphId: "missing" },
      }),
    ).toBeUndefined();
    const paragraph = document.paragraphs[0] as NonNullable<(typeof document.paragraphs)[number]>;
    const before = {
      activeParagraph: paragraph,
      pendingCharacterAttributes: { bold: false, italic: false, underline: false },
      point: { node: paragraph, offset: 0 },
    };
    expect(
      /** Creates a range action for a stale paragraph. @returns Invalid action. */ () =>
        createWriterHyperlinkAction(
          document,
          {
            mark: { offset: 0, paragraphId: "missing" },
            point: { offset: 1, paragraphId: "missing" },
          },
          before.pendingCharacterAttributes,
          before,
          { url: "link" },
        ),
    ).toThrow("Unknown paragraph");
    expect(
      /** Creates an insert action for a stale paragraph. @returns Invalid action. */ () =>
        createWriterHyperlinkAction(
          document,
          { point: { offset: 0, paragraphId: "missing" } },
          before.pendingCharacterAttributes,
          before,
          { url: "link" },
          "text",
        ),
    ).toThrow("Unknown paragraph");
  });

  it("publishes each edit and history navigation as one typed transaction" /** Verifies model, lifecycle, and cursor invalidations remain bounded. @returns Nothing. */, function aggregatesNotifications(): void {
    const shell = createShell();
    const notifications: Parameters<Parameters<SwWrtShell["Subscribe"]>[0]>[0][] = [];
    const unsubscribe = shell.Subscribe(
      /** Captures one editing-shell notification. @param hint - Typed hint. @returns New array length. */ (
        hint,
      ) => notifications.push(hint),
    );

    shell.Insert("A");
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ kind: "model-transaction" });
    if (notifications[0]?.kind === "model-transaction")
      expect(
        notifications[0].hints.map(
          /** Projects one hint discriminator. @param hint - Atomic hint. @returns Hint kind. */ (
            hint,
          ) => hint.kind,
        ),
      ).toEqual(
        expect.arrayContaining([
          "cursor-selection-changed",
          "document-modified",
          "document-state-changed",
          "node-content-changed",
        ]),
      );

    notifications.length = 0;
    expect(shell.Undo()).toBe(true);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ kind: "model-transaction" });
    unsubscribe();
  });

  it("validates stable point-and-mark coordinates without replacing the persistent PaM" /** Verifies unknown, invalid, unchanged, focus, and Select All cursor transitions. @returns Nothing. */, function validatesCursorCoordinates(): void {
    const shell = createShell("ab");
    const cursor = shell.GetCursor();
    expect(shell.SetSelection(shell.GetCursorSelection())).toBe(false);
    expect(shell.DeleteSelection()).toBe(false);
    expect(shell.SetSelection({ point: { offset: 0, paragraphId: "missing" } })).toBe(false);
    expect(shell.SetSelection({ point: { offset: -1, paragraphId: "p-1" } })).toBe(false);
    expect(
      shell.SetSelection({
        mark: { offset: 0, paragraphId: "missing" },
        point: { offset: 0, paragraphId: "p-1" },
      }),
    ).toBe(false);
    expect(
      shell.SetSelection({
        mark: { offset: 3, paragraphId: "p-1" },
        point: { offset: 0, paragraphId: "p-1" },
      }),
    ).toBe(false);
    shell.FocusParagraph("p-1");
    shell.SelectAll();
    expect(shell.GetCursor()).toBe(cursor);
    expect(shell.GetCursorSelection()).toEqual({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 2, paragraphId: "p-1" },
    });
  });

  it("executes the complete supported beforeinput intent set" /** Verifies insertion, forward deletion, paragraph breaks, history, replacement, and unsupported intent handling. @returns Nothing. */, function executesInputIntents(): void {
    const shell = createShell();
    expect(shell.HandleInput("insertText", null)).toBe(true);
    expect(shell.HandleInput("insertReplacementText", "")).toBe(true);
    expect(shell.HandleInput("formatBold", null)).toBe(true);
    expect(shell.GetPendingCharacterAttributes().bold).toBe(true);
    expect(shell.HandleInput("formatBold", null)).toBe(true);
    expect(shell.HandleInput("insertText", "a b")).toBe(true);
    shell.SetCursor("p-1", 1);
    expect(shell.HandleInput("deleteContentForward", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("ab");
    expect(shell.HandleInput("historyUndo", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("a b");
    expect(shell.HandleInput("historyRedo", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("ab");
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    expect(shell.HandleInput("insertReplacementText", "A")).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("Ab");
    shell.SetCursor("p-1", 1);
    expect(shell.HandleInput("insertLineBreak", null)).toBe(true);
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Reads one paragraph's visible text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["A", "b"]);
  });

  it("routes formatting, list, transfer echoes, and selection deletion intents", /** Verifies the extended beforeinput subset. @returns Nothing. */ function routesExtendedBrowserIntents(): void {
    const shell = createShell("selected");
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 8, paragraphId: "p-1" },
    });
    expect(shell.HandleInput("formatItalic", null)).toBe(true);
    expect(shell.HandleInput("formatUnderline", null)).toBe(true);
    expect(shell.GetActiveParagraph().runs).toMatchObject([
      { attributes: { italic: true, underline: true }, text: "selected" },
    ]);
    expect(shell.HandleInput("insertOrderedList", null)).toBe(true);
    expect(shell.GetActiveParagraph().list.kind).toBe("numbered");
    expect(shell.HandleInput("insertUnorderedList", null)).toBe(true);
    expect(shell.GetActiveParagraph().list.kind).toBe("bullet");
    expect(shell.HandleInput("insertFromPaste", null)).toBe(true);
    expect(shell.HandleInput("insertFromDrop", null)).toBe(true);
    expect(shell.HandleInput("insertFromComposition", null)).toBe(true);
    expect(shell.HandleInput("deleteByCut", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("");
    shell.Insert("again");
    expect(
      shell.DeleteSelection({
        mark: { offset: 0, paragraphId: "p-1" },
        point: { offset: 5, paragraphId: "p-1" },
      }),
    ).toBe(true);
    shell.Insert("dragged");
    shell.SelectAll();
    expect(shell.HandleInput("deleteByDrag", null)).toBe(true);
  });

  it("applies selection replacement, deletion, and splitting across text nodes" /** Verifies the registered SwPaM remains authoritative for same-node and cross-node editing. @returns Nothing. */, function appliesBoundedSelectionInput(): void {
    const shell = createShell("abcd");
    shell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    shell.HandleInput("deleteContentBackward", null);
    expect(shell.GetActiveParagraph().text).toBe("ad");
    shell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    shell.HandleInput("deleteContentForward", null);
    expect(shell.GetActiveParagraph().text).toBe("ad");
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    shell.HandleInput("insertParagraph", null);
    const secondId = shell.GetActiveParagraph().id;
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Reads one paragraph's visible text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["", "d"]);
    expect(secondId).toBe(shell.GetActiveParagraph().id);

    const crossShell = createShell("ab");
    crossShell.SetCursor("p-1", 2);
    crossShell.HandleInput("insertParagraph", null);
    crossShell.HandleInput("insertText", "cd");
    crossShell.HandleInput("insertParagraph", null);
    const crossThirdId = crossShell.GetActiveParagraph().id;
    crossShell.HandleInput("insertText", "ef");
    crossShell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: crossThirdId },
    });
    expect(crossShell.HandleInput("insertText", "X")).toBe(true);
    expect(
      crossShell
        .GetDoc()
        .paragraphs.map(
          /** Reads visible paragraph text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["aXf"]);
    expect(crossShell.Undo()).toBe(true);
    expect(
      crossShell
        .GetDoc()
        .paragraphs.map(
          /** Reads visible paragraph text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["ab", "cd", "ef"]);
    crossShell.SetSelection({
      mark: { offset: 1, paragraphId: crossThirdId },
      point: { offset: 1, paragraphId: "p-1" },
    });
    expect(crossShell.HandleInput("deleteContentBackward", null)).toBe(true);
    expect(
      crossShell
        .GetDoc()
        .paragraphs.map(
          /** Reads visible paragraph text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["af"]);
    expect(crossShell.Undo()).toBe(true);
    crossShell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: crossThirdId },
    });
    expect(crossShell.HandleInput("insertParagraph", null)).toBe(true);
    expect(
      crossShell
        .GetDoc()
        .paragraphs.map(
          /** Reads one paragraph's visible text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["a", "f"]);
  });

  it("retains extended text outside SwDoc until one composition commit" /** Verifies implicit start, duplicate start, cancellation, no-session end, and cross-node replacement. @returns Nothing. */, function commitsExtendedTextInput(): void {
    const shell = createShell("ab");
    expect(shell.EndComposition()).toBe(false);
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    shell.UpdateComposition("X");
    shell.StartComposition();
    expect(shell.GetActiveParagraph().text).toBe("ab");
    expect(shell.EndComposition()).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("Xb");
    shell.StartComposition();
    expect(shell.EndComposition()).toBe(false);
    shell.SetCursor("p-1", 1);
    shell.HandleInput("insertParagraph", null);
    const secondId = shell.GetActiveParagraph().id;
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: secondId },
    });
    shell.StartComposition();
    shell.UpdateComposition("joined");
    expect(shell.EndComposition()).toBe(true);
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Reads visible paragraph text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["joinedb"]);
  });

  it("uses code-point boundaries when Intl.Segmenter is unavailable" /** Verifies the older-engine fallback still deletes whole surrogate pairs in both directions. @returns Nothing. */, function usesCodePointFallback(): void {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter");
    Object.defineProperty(Intl, "Segmenter", { configurable: true, value: undefined });
    try {
      const shell = createShell("😀x");
      shell.SetCursor("p-1", 0);
      shell.HandleInput("deleteContentForward", null);
      expect(shell.GetActiveParagraph().text).toBe("x");
      shell.SetCursor("p-1", 1);
      shell.HandleInput("deleteContentBackward", null);
      expect(shell.GetActiveParagraph().text).toBe("");
    } finally {
      if (descriptor !== undefined) Object.defineProperty(Intl, "Segmenter", descriptor);
    }
  });

  it("pastes structured list paragraphs as one reversible Writer action" /** Verifies semantic clipboard blocks split canonical text nodes, retain list levels, preserve the trailing range text, and undo atomically. @returns Nothing. */, function pastesStructuredParagraphs(): void {
    const shell = createShell("prefix  suffix");
    expect(
      shell.Paste(
        { end: 7, paragraphId: "p-1", start: 7 },
        {
          isBlock: true,
          paragraphs: [
            {
              listKind: "numbered",
              listLevel: 0,
              runs: [
                {
                  attributes: { bold: true, italic: false, underline: false },
                  text: "Parent",
                },
              ],
            },
            {
              listKind: "bullet",
              listLevel: 1,
              runs: [
                {
                  attributes: { bold: false, italic: true, underline: false },
                  text: "Child",
                },
              ],
            },
            {
              listKind: "numbered",
              listLevel: 0,
              runs: [
                {
                  attributes: { bold: false, italic: false, underline: false },
                  text: "Sibling",
                },
              ],
            },
          ],
          source: "html",
        },
      ),
    ).toBe(true);
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Projects pasted text and list metadata. @param paragraph - Canonical Writer paragraph. @returns Observable paragraph state. */ (
            paragraph,
          ) => ({ list: paragraph.list, text: paragraph.text, runs: paragraph.runs }),
        ),
    ).toEqual([
      {
        list: { kind: "numbered", level: 0 },
        runs: [
          { attributes: { bold: false, italic: false, underline: false }, text: "prefix " },
          { attributes: { bold: true, italic: false, underline: false }, text: "Parent" },
        ],
        text: "prefix Parent",
      },
      {
        list: { kind: "bullet", level: 1 },
        runs: [{ attributes: { bold: false, italic: true, underline: false }, text: "Child" }],
        text: "Child",
      },
      {
        list: { kind: "numbered", level: 0 },
        runs: [
          { attributes: { bold: false, italic: false, underline: false }, text: "Sibling suffix" },
        ],
        text: "Sibling suffix",
      },
    ]);
    expect(shell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Projects canonical text after Undo. @param paragraph - Restored Writer paragraph. @returns Visible paragraph text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["prefix  suffix"]);
    expect(shell.Redo()).toBe(true);
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Projects canonical text after Redo. @param paragraph - Reapplied Writer paragraph. @returns Visible paragraph text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["prefix Parent", "Child", "Sibling suffix"]);
    expect(
      shell.Paste(
        { end: 0, paragraphId: "p-1", start: 0 },
        { isBlock: true, paragraphs: [], source: "html" },
      ),
    ).toBe(false);

    const emptyBlockShell = createShell();
    expect(
      emptyBlockShell.Paste(
        { end: 0, paragraphId: "p-1", start: 0 },
        {
          isBlock: false,
          paragraphs: [{ listKind: "none", listLevel: 0, runs: [] }],
          source: "html",
        },
      ),
    ).toBe(false);
    expect(
      emptyBlockShell.Paste(
        { end: 0, paragraphId: "p-1", start: 0 },
        {
          isBlock: true,
          paragraphs: [
            { listKind: "none", listLevel: 0, runs: [] },
            { listKind: "none", listLevel: 0, runs: [] },
          ],
          source: "html",
        },
      ),
    ).toBe(true);
    expect(emptyBlockShell.GetDoc().paragraphs).toHaveLength(2);
    expect(emptyBlockShell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(1);

    const replacementShell = createShell("old");
    expect(
      replacementShell.Paste(
        { end: 2, paragraphId: "p-1", start: 1 },
        {
          isBlock: false,
          paragraphs: [
            {
              listKind: "none",
              listLevel: 0,
              runs: [{ attributes: { bold: true, italic: false, underline: false }, text: "X" }],
            },
          ],
          source: "html",
        },
      ),
    ).toBe(true);
    expect(replacementShell.GetActiveParagraph().text).toBe("oXd");
  });

  it("routes formatting and list commands through one mutable undo history" /** Verifies the retired clone facades have one identity-preserving shell replacement with reversible action objects. @returns Nothing. */, function routesFormattingCommands(): void {
    const shell = createShell("Body");
    const document = shell.GetDoc();
    shell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });

    expect(shell.ToggleCharacterFormat("bold")).toBe(true);
    expect(shell.SetParagraphAlignment("center")).toBe(true);
    expect(shell.SetParagraphStyle("heading-1")).toBe(true);
    expect(shell.SetParagraphListKind("numbered")).toBe(true);
    expect(shell.ChangeParagraphListLevel("demote")).toBe(true);
    expect(shell.GetDoc()).toBe(document);
    expect(document.paragraphs[0]).toMatchObject({
      alignment: "center",
      list: { kind: "numbered", level: 1 },
      style: "heading-1",
    });
    expect(document.paragraphs[0]?.runs[0]).toMatchObject({
      attributes: { bold: true },
      text: "Body",
    });
    expect(shell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(5);
    expect(shell.Undo()).toBe(true);
    expect(document.paragraphs[0]?.list).toMatchObject({ kind: "numbered", level: 0 });
    expect(shell.ChangeParagraphListLevel("promote")).toBe(false);
    expect(
      /** Rejects an unsupported list-level command at the shell boundary. @returns Invalid command. */ () =>
        shell.ChangeParagraphListLevel("restart" as "demote"),
    ).toThrow("Unsupported Writer list-level command");
    expect(
      /** Rejects an unsupported list kind at the shell boundary. @returns Invalid command. */ () =>
        shell.SetParagraphListKind("outline" as "bullet"),
    ).toThrow("Unsupported Writer paragraph list kind");
  });

  it("applies a font family through range hints and restores it through history", /** Verifies font formatting history. @returns Nothing. */ () => {
    const shell = createShell("abcd");
    expect(shell.SetFontFamily("Noto Sans")).toBe(false);
    expect(shell.GetPendingCharacterAttributes().fontFamily).toBe("Noto Sans");
    expect(
      /** Rejects a blank font. @returns Invalid mutation. */ () => shell.SetFontFamily(" "),
    ).toThrow("blank");
    shell.SetSelection({
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    expect(shell.SetFontFamily("Noto Serif")).toBe(true);
    expect(shell.GetActiveParagraph().runs).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      {
        attributes: { bold: false, fontFamily: "Noto Serif", italic: false, underline: false },
        text: "bc",
      },
      { attributes: { bold: false, italic: false, underline: false }, text: "d" },
    ]);
    expect(shell.Undo()).toBe(true);
    expect(shell.GetActiveParagraph().runs).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "abcd" },
    ]);
    expect(shell.Redo()).toBe(true);
    expect(shell.GetActiveParagraph().runs[1]?.attributes.fontFamily).toBe("Noto Serif");
    expect(shell.SetFontFamily("Noto Serif")).toBe(false);
    expect(
      /** Rejects a range outside the source runs. @returns Invalid formatting. */ () =>
        applyWriterTextRangeFont(shell.GetActiveParagraph().runs, 0, 99, "Noto Serif"),
    ).toThrow("outside");
    const plainRuns = [
      { attributes: { bold: false, italic: false, underline: false }, text: "abcd" },
    ] as const;
    expect(applyWriterTextRangeFont(plainRuns, 1, 3, "Noto Sans")).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      {
        attributes: { bold: false, fontFamily: "Noto Sans", italic: false, underline: false },
        text: "bc",
      },
      { attributes: { bold: false, italic: false, underline: false }, text: "d" },
    ]);
    expect(applyWriterTextRangeFont(plainRuns, 1, 1, "Noto Sans")).toEqual(plainRuns);
    expect(
      applyWriterTextRangeFont(
        [
          { attributes: { bold: true, italic: false, underline: false }, text: "a" },
          { attributes: { bold: false, italic: false, underline: false }, text: "bc" },
          { attributes: { bold: false, italic: true, underline: false }, text: "d" },
        ],
        1,
        3,
        "Noto Sans",
      ),
    ).toHaveLength(3);
    expect(
      /** Rejects an empty family at the range helper boundary. @returns Invalid formatting. */ () =>
        applyWriterTextRangeFont(plainRuns, 0, 1, " "),
    ).toThrow("blank");
  });

  it("creates clipboard transfer data from the shell SwPaM without rendered DOM", /** Verifies model-owned transfer serialization. @returns Nothing. */ function createsModelTransfer(): void {
    const shell = createShell("alpha beta");
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 5, paragraphId: "p-1" },
    });
    shell.ToggleCharacterFormat("bold");
    shell.ToggleCharacterFormat("italic");
    shell.ToggleCharacterFormat("underline");
    shell.SetFontFamily("Noto Serif");
    const transfer = shell.CreateTransferable().CreateSelection();
    expect(transfer).toEqual({
      html: expect.stringContaining(
        '<span style="text-decoration: underline; font-family: Noto Serif"><em><strong>alpha</strong></em></span>',
      ),
      plainText: "alpha",
    });
    shell.SetSelection({
      mark: { offset: 5, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(shell.CreateTransferable().CreateSelection()?.plainText).toBe("alpha");
    shell.SetCursor("p-1", 5);
    expect(shell.CreateTransferable().CreateSelection()).toBeUndefined();

    const multiParagraph = createShell("firstsecond");
    const secondId = multiParagraph.SplitParagraph("p-1", 5);
    multiParagraph.SetCursor("p-1", 0);
    multiParagraph.SetParagraphListKind("bullet");
    multiParagraph.SetCursor(secondId, 0);
    multiParagraph.SetParagraphListKind("numbered");
    multiParagraph.SetSelection({
      mark: { offset: 6, paragraphId: secondId },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(multiParagraph.CreateTransferable().CreateSelection()).toMatchObject({
      plainText: expect.stringContaining("first"),
    });

    const emptyParagraphs = createShell();
    const emptySecondId = emptyParagraphs.SplitParagraph("p-1", 0);
    emptyParagraphs.SetSelection({
      mark: { offset: 0, paragraphId: emptySecondId },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(emptyParagraphs.CreateTransferable().CreateSelection()).toBeUndefined();

    const foreign = createShell("foreign");
    foreign.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 7, paragraphId: "p-1" },
    });
    expect(
      new SwTransferable(shell.GetDoc(), foreign.GetCursor()).CreateSelection(),
    ).toBeUndefined();
  });
});
