/** @fileoverview Verifies the canonical SwWrtShell cursor and browser-input intent boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/text-run-projection";
import { SwDocShell } from "../app/docsh";
import { SwTransferable } from "../dochdl/swdtflvr";
import { SwWrtShell } from "./wrtsh";
import { createWriterHyperlinkAction, getWriterHyperlinkAtCursor } from "./wrtsh-hyperlink";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { isWriterCursorOffset } from "./wrtsh-selection";
import {
  getTestSelection,
  handleTestInput,
  pasteTestSelection,
  setTestHyperlink,
  setTestCursor,
  setTestSelection,
  fixtureSplitParagraph,
  getNodeId,
} from "../../../../test/wrtsh-test-helpers";

/** Creates a Writer shell with one stable paragraph. @param text - Optional initial paragraph text. @returns Shell fixture. */
function createShell(text = ""): SwWrtShell {
  const document = createWriterDocument();
  const documentState = createDocument({
    id: "input-document",
    suiteId: "writer",
    title: "Input document",
  });
  if (text.length > 0) document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(new SwDocShell(document, documentState));
}

describe("Writer canonical input shell", /** Registers canonical cursor and input tests. @returns Nothing. */ function defineWriterInputShellTests(): void {
  it("matches text-shell indent dispatch for ordinary and list paragraphs", /** Verifies `SID_INC_INDENT` changes margins outside lists and levels inside them. @returns Nothing. */ function routesContextualIndent(): void {
    const shell = createShell("Body");
    const paragraph = shell.GetActiveParagraph();
    expect(shell.CanChangeParagraphIndent(false)).toBe(false);
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    expect(paragraph.textLeftMargin).toBe(1134);
    expect(shell.CanChangeParagraphIndent(false)).toBe(true);
    expect(shell.Undo()).toBe(true);
    expect(paragraph.textLeftMargin).toBe(0);
    expect(shell.Redo()).toBe(true);
    expect(paragraph.textLeftMargin).toBe(1134);
    expect(shell.ChangeParagraphIndent(false)).toBe(true);
    expect(paragraph.textLeftMargin).toBe(0);
    expect(shell.ChangeParagraphIndent(false)).toBe(false);
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    expect(shell.SetParagraphListKind("numbered")).toBe(true);
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    expect(paragraph.list).toMatchObject({ kind: "numbered", level: 1 });
    expect(paragraph.textLeftMargin).toBe(1134);
  });

  it("validates canonical cursor offsets against the owning node", /** Covers integer and node-bound offset validation. @returns Nothing. */ () => {
    const paragraph = createShell("ab").GetActiveParagraph();
    expect(isWriterCursorOffset(paragraph, 0)).toBe(true);
    expect(isWriterCursorOffset(paragraph, 2)).toBe(true);
    expect(isWriterCursorOffset(paragraph, -1)).toBe(false);
    expect(isWriterCursorOffset(paragraph, 3)).toBe(false);
    expect(isWriterCursorOffset(paragraph, 1.5)).toBe(false);
  });

  it("rejects canonical edit positions owned by another document", /** Verifies shell ownership at every public range boundary. @returns Nothing. */ function rejectsForeignEditPositions(): void {
    const shell = createShell("ab");
    const foreignParagraph = createWriterDocument().paragraphs[0] as NonNullable<
      ReturnType<typeof createWriterDocument>["paragraphs"][number]
    >;
    foreignParagraph.SetText("xy");

    expect(
      /** Replaces through a foreign node. @returns Invalid edit. */ () =>
        shell.ReplaceRange(
          { end: 1, node: foreignParagraph, start: 0 },
          foreignParagraph.CaptureTextFragment(0, 0),
        ),
    ).toThrow("foreign");
    expect(
      /** Splits through a foreign position. @returns Invalid edit. */ () =>
        shell.SplitParagraph(new SwPosition(foreignParagraph, 1)),
    ).toThrow("foreign");
    expect(
      /** Formats through a foreign node. @returns Invalid edit. */ () =>
        shell.ToggleCharacterFormat("bold", { end: 1, node: foreignParagraph, start: 0 }),
    ).toThrow("foreign");
  });

  it("edits complete hyperlink ranges across differently formatted runs", /** Verifies caret lookup, uniform-selection state, replacement, removal, insertion, and undo. @returns Nothing. */ function editsHyperlinks(): void {
    const shell = createShell("abcd");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    expect(shell.SetHyperlink({ url: "https://example.test/first" })).toBe(true);
    expect(shell.SetHyperlink({ url: "https://example.test/first" })).toBe(false);
    setTestSelection(shell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    expect(shell.ToggleCharacterFormat("bold")).toBe(true);
    setTestCursor(shell, "p-1", 2);
    expect(shell.GetHyperlinkAtCursor()).toEqual({ url: "https://example.test/first" });
    expect(shell.SetHyperlink({ url: "https://example.test/second" })).toBe(true);
    expect(
      projectWriterTextRuns(shell.GetActiveParagraph()).every(
        /** Checks that formatting splits retain the edited hyperlink. @param run - Projected text run. @returns Whether the URL matches. */
        (run) => run.hyperlink?.url === "https://example.test/second",
      ),
    ).toBe(true);
    expect(shell.SetHyperlink(undefined)).toBe(true);
    expect(shell.GetHyperlinkAtCursor()).toBeUndefined();
    expect(shell.SetHyperlink(undefined)).toBe(false);
    expect(shell.Undo()).toBe(true);
    expect(shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/second");

    expect(
      setTestHyperlink(shell, { url: "https://example.test/range" }, undefined, {
        end: 1,
        paragraphId: "p-1",
        start: 0,
      }),
    ).toBe(true);

    setTestCursor(shell, "p-1", 4);
    expect(shell.SetHyperlink({ url: "relative/path" }, "Shown")).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("abcdShown");
    const emptyShell = createShell();
    expect(emptyShell.SetHyperlink({ url: "fallback-url" })).toBe(true);
    expect(emptyShell.GetActiveParagraph().text).toBe("fallback-url");
    expect(
      /** Resolves a stale fixture ID only at the test boundary. @returns Invalid test operation. */ () =>
        setTestHyperlink(shell, { url: "ignored" }, undefined, {
          end: 1,
          paragraphId: "missing",
          start: 0,
        }),
    ).toThrow("Unknown test paragraph");
  });

  it("returns no uniform hyperlink for mixed or cross-node selections", /** Covers non-uniform selection and missing-node hyperlink lookup. @returns Nothing. */ function rejectsMixedHyperlinkSelections(): void {
    const shell = createShell("abcd");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 2, paragraphId: "p-1" },
    });
    shell.SetHyperlink({ url: "first" });
    setTestSelection(shell, {
      mark: { offset: 2, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    shell.SetHyperlink({ url: "second" });
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    expect(shell.GetHyperlinkAtCursor()).toBeUndefined();
    const document = shell.GetDoc();
    const foreignDocument = createWriterDocument();
    const foreignParagraph = foreignDocument.paragraphs[0] as NonNullable<
      (typeof foreignDocument.paragraphs)[number]
    >;
    foreignParagraph.SetText("x");
    const foreignSelection = new SwPaM(
      new SwPosition(foreignParagraph, 1),
      new SwPosition(foreignParagraph, 0),
    );
    expect(getWriterHyperlinkAtCursor(document, foreignSelection)).toBeUndefined();
    const foreignCaret = new SwPaM(new SwPosition(foreignParagraph, 0));
    expect(getWriterHyperlinkAtCursor(document, foreignCaret)).toBeUndefined();
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
          foreignSelection,
          before.pendingCharacterAttributes,
          before,
          { url: "link" },
        ),
    ).toThrow("foreign");
    expect(
      /** Creates an insert action for a stale paragraph. @returns Invalid action. */ () =>
        createWriterHyperlinkAction(
          document,
          foreignCaret,
          before.pendingCharacterAttributes,
          before,
          { url: "link" },
          "text",
        ),
    ).toThrow("foreign");
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
    expect(setTestSelection(shell, getTestSelection(shell))).toBe(false);
    expect(shell.DeleteSelection()).toBe(false);
    expect(
      /** Resolves a missing fixture node. @returns Invalid test operation. */ () =>
        setTestSelection(shell, { point: { offset: 0, paragraphId: "missing" } }),
    ).toThrow("Unknown test paragraph");
    expect(
      /** Constructs an invalid canonical content position. @returns Invalid test operation. */ () =>
        setTestSelection(shell, { point: { offset: -1, paragraphId: "p-1" } }),
    ).toThrow("outside its node");
    expect(
      /** Resolves a missing fixture mark. @returns Invalid test operation. */ () =>
        setTestSelection(shell, {
          mark: { offset: 0, paragraphId: "missing" },
          point: { offset: 0, paragraphId: "p-1" },
        }),
    ).toThrow("Unknown test paragraph");
    expect(
      /** Constructs an out-of-range canonical mark. @returns Invalid test operation. */ () =>
        setTestSelection(shell, {
          mark: { offset: 3, paragraphId: "p-1" },
          point: { offset: 0, paragraphId: "p-1" },
        }),
    ).toThrow("outside its node");
    const ownNode = shell.GetDoc().paragraphs[0];
    const foreignNode = createShell("foreign").GetDoc().paragraphs[0];
    if (ownNode === undefined || foreignNode === undefined)
      throw new Error("Writer cursor fixture has no paragraph.");
    expect(shell.SetPaM(new SwPosition(foreignNode, 0))).toBe(false);
    expect(shell.SetPaM(new SwPosition(ownNode, 0), new SwPosition(foreignNode, 0))).toBe(false);
    shell.FocusNode(foreignNode);
    expect(shell.GetActiveParagraph()).toBe(ownNode);
    shell.FocusNode(ownNode);
    shell.SelectAll();
    expect(shell.GetCursor()).toBe(cursor);
    expect(getTestSelection(shell)).toEqual({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 2, paragraphId: "p-1" },
    });
    const second = shell.GetDoc().nodes.MakeTextNode();
    shell.FocusNode(second);
    expect(shell.GetActiveParagraph()).toBe(second);
  });

  it("executes the complete supported beforeinput intent set" /** Verifies insertion, forward deletion, paragraph breaks, history, replacement, and unsupported intent handling. @returns Nothing. */, function executesInputIntents(): void {
    const shell = createShell();
    expect(handleTestInput(shell, "insertText", null)).toBe(true);
    expect(handleTestInput(shell, "insertReplacementText", "")).toBe(true);
    expect(handleTestInput(shell, "formatBold", null)).toBe(true);
    expect(shell.GetPendingCharacterAttributes().bold).toBe(true);
    expect(handleTestInput(shell, "formatBold", null)).toBe(true);
    expect(handleTestInput(shell, "insertText", "a b")).toBe(true);
    setTestCursor(shell, "p-1", 1);
    expect(handleTestInput(shell, "deleteContentForward", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("ab");
    expect(handleTestInput(shell, "historyUndo", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("a b");
    expect(handleTestInput(shell, "historyRedo", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("ab");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    expect(handleTestInput(shell, "insertReplacementText", "A")).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("Ab");
    setTestCursor(shell, "p-1", 1);
    expect(handleTestInput(shell, "insertLineBreak", null)).toBe(true);
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

  it("groups consecutive formatted typing without serializing native hints", /** Verifies pooled hint comparison, grouped undo, and redo for pending caret formatting. @returns Nothing. */ function groupsFormattedTyping(): void {
    const shell = createShell();
    expect(shell.ToggleCharacterFormat("bold")).toBe(false);

    expect(shell.Insert("a")).toBe(true);
    expect(shell.Insert("b")).toBe(true);
    expect(shell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toEqual([
      { attributes: { bold: true, italic: false, underline: false }, text: "ab" },
    ]);

    expect(shell.Undo()).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("");
    expect(shell.Redo()).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toEqual([
      { attributes: { bold: true, italic: false, underline: false }, text: "ab" },
    ]);
  });

  it("routes formatting, list, transfer echoes, and selection deletion intents", /** Verifies the extended beforeinput subset. @returns Nothing. */ function routesExtendedBrowserIntents(): void {
    const shell = createShell("selected");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 8, paragraphId: "p-1" },
    });
    expect(handleTestInput(shell, "formatItalic", null)).toBe(true);
    expect(handleTestInput(shell, "formatUnderline", null)).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toMatchObject([
      { attributes: { italic: true, underline: true }, text: "selected" },
    ]);
    expect(handleTestInput(shell, "insertOrderedList", null)).toBe(true);
    expect(shell.GetActiveParagraph().list.kind).toBe("numbered");
    expect(handleTestInput(shell, "insertUnorderedList", null)).toBe(true);
    expect(shell.GetActiveParagraph().list.kind).toBe("bullet");
    expect(handleTestInput(shell, "insertFromPaste", null)).toBe(true);
    expect(handleTestInput(shell, "insertFromDrop", null)).toBe(true);
    expect(handleTestInput(shell, "insertFromComposition", null)).toBe(true);
    expect(handleTestInput(shell, "deleteByCut", null)).toBe(true);
    expect(shell.GetActiveParagraph().text).toBe("");
    shell.Insert("again");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 5, paragraphId: "p-1" },
    });
    expect(shell.DeleteSelection()).toBe(true);
    shell.Insert("dragged");
    shell.SelectAll();
    expect(handleTestInput(shell, "deleteByDrag", null)).toBe(true);
  });

  it("applies selection replacement, deletion, and splitting across text nodes" /** Verifies the registered SwPaM remains authoritative for same-node and cross-node editing. @returns Nothing. */, function appliesBoundedSelectionInput(): void {
    const shell = createShell("abcd");
    setTestSelection(shell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    handleTestInput(shell, "deleteContentBackward", null);
    expect(shell.GetActiveParagraph().text).toBe("ad");
    setTestSelection(shell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    handleTestInput(shell, "deleteContentForward", null);
    expect(shell.GetActiveParagraph().text).toBe("ad");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: "p-1" },
    });
    handleTestInput(shell, "insertParagraph", null);
    const secondId = getNodeId(shell, shell.GetActiveParagraph());
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Reads one paragraph's visible text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(["", "d"]);
    expect(secondId).toBe(getNodeId(shell, shell.GetActiveParagraph()));

    const crossShell = createShell("ab");
    setTestCursor(crossShell, "p-1", 2);
    handleTestInput(crossShell, "insertParagraph", null);
    handleTestInput(crossShell, "insertText", "cd");
    handleTestInput(crossShell, "insertParagraph", null);
    const crossThirdId = getNodeId(crossShell, crossShell.GetActiveParagraph());
    handleTestInput(crossShell, "insertText", "ef");
    setTestSelection(crossShell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: crossThirdId },
    });
    expect(handleTestInput(crossShell, "insertText", "X")).toBe(true);
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
    setTestSelection(crossShell, {
      mark: { offset: 1, paragraphId: crossThirdId },
      point: { offset: 1, paragraphId: "p-1" },
    });
    expect(handleTestInput(crossShell, "deleteContentBackward", null)).toBe(true);
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
    setTestSelection(crossShell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: crossThirdId },
    });
    expect(handleTestInput(crossShell, "insertParagraph", null)).toBe(true);
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
    setTestSelection(shell, {
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
    setTestCursor(shell, "p-1", 1);
    handleTestInput(shell, "insertParagraph", null);
    const secondId = getNodeId(shell, shell.GetActiveParagraph());
    setTestSelection(shell, {
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
      setTestCursor(shell, "p-1", 0);
      handleTestInput(shell, "deleteContentForward", null);
      expect(shell.GetActiveParagraph().text).toBe("x");
      setTestCursor(shell, "p-1", 1);
      handleTestInput(shell, "deleteContentBackward", null);
      expect(shell.GetActiveParagraph().text).toBe("");
    } finally {
      if (descriptor !== undefined) Object.defineProperty(Intl, "Segmenter", descriptor);
    }
  });

  it("pastes structured list paragraphs as one reversible Writer action" /** Verifies semantic clipboard blocks split canonical text nodes, retain list levels, preserve the trailing range text, and undo atomically. @returns Nothing. */, function pastesStructuredParagraphs(): void {
    const shell = createShell("prefix  suffix");
    expect(
      pasteTestSelection(
        shell,
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
      shell.GetDoc().paragraphs.map(
        /** Projects pasted text and list metadata. @param paragraph - Canonical Writer paragraph. @returns Observable paragraph state. */ (
          paragraph,
        ) => ({
          list: paragraph.list,
          runs: projectWriterTextRuns(paragraph),
          text: paragraph.text,
        }),
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
      pasteTestSelection(
        shell,
        { end: 0, paragraphId: "p-1", start: 0 },
        { isBlock: true, paragraphs: [], source: "html" },
      ),
    ).toBe(false);

    const emptyBlockShell = createShell();
    expect(
      pasteTestSelection(
        emptyBlockShell,
        { end: 0, paragraphId: "p-1", start: 0 },
        {
          isBlock: false,
          paragraphs: [{ listKind: "none", listLevel: 0, runs: [] }],
          source: "html",
        },
      ),
    ).toBe(false);
    expect(
      pasteTestSelection(
        emptyBlockShell,
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
      pasteTestSelection(
        replacementShell,
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
    setTestSelection(shell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });

    expect(shell.ToggleCharacterFormat("bold")).toBe(true);
    expect(shell.SetParagraphAlignment("center")).toBe(true);
    expect(shell.SetParagraphStyle("heading-1")).toBe(true);
    expect(
      /** Attempts to apply metadata-only style. @returns Nothing before the expected exception. */ () =>
        shell.SetParagraphStyle("numbering-1"),
    ).toThrow("Unsupported Writer paragraph style");
    expect(shell.SetParagraphListKind("numbered")).toBe(true);
    expect(shell.ChangeParagraphListLevel("demote")).toBe(true);
    expect(shell.GetDoc()).toBe(document);
    expect(document.paragraphs[0]).toMatchObject({
      alignment: "center",
      list: { kind: "numbered", level: 1 },
      style: "heading-1",
    });
    expect(projectWriterTextRuns(document.paragraphs[0]).at(0)).toMatchObject({
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
    setTestSelection(shell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    expect(shell.SetFontFamily("Noto Serif")).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      {
        attributes: { bold: false, fontFamily: "Noto Serif", italic: false, underline: false },
        text: "bc",
      },
      { attributes: { bold: false, italic: false, underline: false }, text: "d" },
    ]);
    expect(shell.Undo()).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "abcd" },
    ]);
    expect(shell.Redo()).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())[1]?.attributes.fontFamily).toBe(
      "Noto Serif",
    );
    expect(shell.SetFontFamily("Noto Serif")).toBe(false);
  });

  it("applies a font height through range hints and restores it through history", /** Verifies font-height state, validation, no-op, and history. @returns Nothing. */ () => {
    const shell = createShell("abcd");
    expect(shell.GetDefaultFontSizePt()).toBe(12);
    expect(shell.SetFontSize(13.5)).toBe(false);
    expect(shell.GetPendingCharacterAttributes().fontSizeTwips).toBe(270);
    for (const invalid of [Number.NaN, 0, 13.03])
      expect(
        /** Rejects one invalid point height. @returns Invalid mutation. */ () =>
          shell.SetFontSize(invalid),
      ).toThrow("positive value representable in twips");
    setTestSelection(shell, {
      mark: { offset: 1, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: "p-1" },
    });
    expect(shell.SetFontSize(14)).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      {
        attributes: { bold: false, fontSizeTwips: 280, italic: false, underline: false },
        text: "bc",
      },
      { attributes: { bold: false, italic: false, underline: false }, text: "d" },
    ]);
    expect(shell.Undo()).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "abcd" },
    ]);
    expect(shell.Redo()).toBe(true);
    expect(projectWriterTextRuns(shell.GetActiveParagraph())[1]?.attributes.fontSizeTwips).toBe(
      280,
    );
    expect(shell.SetFontSize(14)).toBe(false);
  });

  it("creates clipboard transfer data from the shell SwPaM without rendered DOM", /** Verifies model-owned transfer serialization. @returns Nothing. */ function createsModelTransfer(): void {
    const shell = createShell("alpha beta");
    setTestSelection(shell, {
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
    setTestSelection(shell, {
      mark: { offset: 5, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(shell.CreateTransferable().CreateSelection()?.plainText).toBe("alpha");
    setTestCursor(shell, "p-1", 5);
    expect(shell.CreateTransferable().CreateSelection()).toBeUndefined();

    const multiParagraph = createShell("firstsecond");
    const secondId = fixtureSplitParagraph(multiParagraph, "p-1", 5);
    setTestCursor(multiParagraph, "p-1", 0);
    multiParagraph.SetParagraphListKind("bullet");
    setTestCursor(multiParagraph, secondId, 0);
    multiParagraph.SetParagraphListKind("numbered");
    setTestSelection(multiParagraph, {
      mark: { offset: 6, paragraphId: secondId },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(multiParagraph.CreateTransferable().CreateSelection()).toMatchObject({
      plainText: expect.stringContaining("first"),
    });

    const emptyParagraphs = createShell();
    const emptySecondId = fixtureSplitParagraph(emptyParagraphs, "p-1", 0);
    setTestSelection(emptyParagraphs, {
      mark: { offset: 0, paragraphId: emptySecondId },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(emptyParagraphs.CreateTransferable().CreateSelection()).toBeUndefined();

    const foreign = createShell("foreign");
    setTestSelection(foreign, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 7, paragraphId: "p-1" },
    });
    expect(
      new SwTransferable(shell.GetDoc(), foreign.GetCursor()).CreateSelection(),
    ).toBeUndefined();
  });
});
