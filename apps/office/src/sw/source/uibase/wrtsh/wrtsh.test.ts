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
});
