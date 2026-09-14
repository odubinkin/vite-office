/** @fileoverview Verifies the canonical SwWrtShell cursor and browser-input intent boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { createWriterDocument } from "../../core/doc/writer";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh";

/** Creates a Writer shell with one stable paragraph. @param text - Optional initial paragraph text. @returns Shell fixture. */
function createShell(text = ""): SwWrtShell {
  const document = createWriterDocument(
    createDocument({ id: "input-document", suiteId: "writer", title: "Input document" }),
    "p-1",
  );
  if (text.length > 0) document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(new SwDocShell(document));
}

describe("Writer canonical input shell", /** Registers canonical cursor and input tests. @returns Nothing. */ function defineWriterInputShellTests(): void {
  it("validates stable point-and-mark coordinates without replacing the persistent PaM" /** Verifies unknown, invalid, unchanged, focus, and Select All cursor transitions. @returns Nothing. */, function validatesCursorCoordinates(): void {
    const shell = createShell("ab");
    const cursor = shell.GetCursor();
    expect(shell.SetSelection(shell.GetCursorSelection())).toBe(false);
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
    expect(shell.HandleInput("formatBold", null)).toBe(false);
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

  it("applies selection deletion and paragraph splitting only within one text node" /** Verifies same-node selection actions, zero-width guards, and cross-node rejection inherited from SwWrtShell. @returns Nothing. */, function appliesBoundedSelectionInput(): void {
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
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 1, paragraphId: secondId },
    });
    const before = shell
      .GetDoc()
      .paragraphs.map(
        /** Reads one paragraph's visible text. @param paragraph - Writer paragraph. @returns Visible text. */ (
          paragraph,
        ) => paragraph.text,
      );
    shell.HandleInput("insertText", "x");
    shell.HandleInput("deleteContentBackward", null);
    shell.HandleInput("insertParagraph", null);
    expect(
      shell
        .GetDoc()
        .paragraphs.map(
          /** Reads one paragraph's visible text. @param paragraph - Writer paragraph. @returns Visible text. */ (
            paragraph,
          ) => paragraph.text,
        ),
    ).toEqual(before);
  });

  it("retains extended text outside SwDoc until one composition commit" /** Verifies implicit start, duplicate start, cancellation, no-session end, and rejected cross-node commit paths. @returns Nothing. */, function commitsExtendedTextInput(): void {
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
    shell.UpdateComposition("ignored");
    expect(shell.EndComposition()).toBe(false);
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
    expect(document.paragraphs[0]?.runs[1]).toMatchObject({
      attributes: { bold: true },
      text: "od",
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
});
