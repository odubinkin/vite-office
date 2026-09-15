/** @fileoverview Verifies semantic Writer actions, grouping, cursor restoration, lifecycle, limits, and payload scaling. */

import { describe, expect, it } from "vitest";
import { encodeWriterDocument } from "../../../browser/persistence/writer-document-codec";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import type { SwTextNode, WriterTextRun } from "../txtnode/ndtxt";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh";
import { SwUndoDelete, SwUndoJoinParagraphs, SwUndoReplace } from "./undel";
import { SwUndoFormatColl } from "./unfmco";
import { SwUndoInsert } from "./unins";
import { SwUndoAttr, SwUndoParagraphFormat } from "./unattr";
import { SwUndoInsNum, SwUndoNumLevel } from "./unnum";
import { SwUndoSplitNode } from "./unspnd";
import {
  CopyTextRangeRuns,
  GetUndoTextNode,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Creates a clean document/session fixture with optional plain text. @param text - Initial first-paragraph text. @returns Document, document shell, and Writer shell. */
function createSession(text = "") {
  const document = createWriterDocument("p-1");
  const documentState = createDocument({
    id: "undo-document",
    suiteId: "writer",
    title: "Undo document",
  });
  if (text.length > 0) document.paragraphs[0]?.InsertText(text, 0);
  const docShell = new SwDocShell(document, documentState, {
    indexedDbKey: documentState.id,
    kind: "browser-local",
    name: documentState.title,
  });
  return { docShell, document, shell: new SwWrtShell(docShell) };
}

/** Creates one formatted text fragment. @param text - Visible text. @param bold - Bold state. @param italic - Italic state. @param underline - Underline state. @returns Writer run. */
function run(text: string, bold = false, italic = false, underline = false): WriterTextRun {
  return { attributes: { bold, italic, underline }, text };
}

/** Creates a collapsed action cursor state. @param paragraphId - Stable node identity. @param offset - Content offset. @returns Complete Writer cursor state. */
function cursorState(paragraph: SwTextNode, offset = 0): SwUndoCursorState {
  return {
    activeParagraph: paragraph,
    pendingCharacterAttributes: { bold: false, italic: false, underline: false },
    point: { node: paragraph, offset },
  };
}

describe("Writer action-based undo" /** Groups Stage 3 Writer action acceptance coverage. @returns Nothing. */, function defineWriterUndoTests(): void {
  it("groups compatible typing, separates delimiter and cursor boundaries, and truncates redo" /** Verifies SwUndoInsert::CanGrouping behavior and branch replacement. @returns Nothing. */, function groupsTyping(): void {
    const { docShell, document, shell } = createSession();
    shell.InsertText("p-1", "a", 1, "insertText");
    shell.InsertText("p-1", "ab", 2, "insertText");
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoInsert);
    expect(document.paragraphs[0]?.text).toBe("ab");
    shell.InsertText("p-1", "ab ", 3, "insertText");
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(shell.Undo()).toBe(true);
    expect(document.paragraphs[0]?.text).toBe("ab");
    expect(shell.Undo()).toBe(true);
    expect(document.paragraphs[0]?.text).toBe("");
    expect(shell.Redo()).toBe(true);
    expect(document.paragraphs[0]?.text).toBe("ab");
    shell.SetCursor("p-1", 2);
    shell.InsertText("p-1", "abx", 3, "insertText");
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(docShell.GetUndoManager().GetRedoActionCount()).toBe(0);
    expect(shell.Redo()).toBe(false);
  });

  it("groups backward and forward deletion separately while restoring formatted content" /** Verifies SwUndoDelete grouping direction and retained hints. @returns Nothing. */, function groupsDeletion(): void {
    const backward = createSession();
    backward.shell.ReplaceRange({ paragraphId: "p-1", start: 0, end: 0 }, [
      run("ab", true),
      run("cd", false, true),
    ]);
    backward.docShell.GetUndoManager().Clear();
    backward.shell.SetCursor("p-1", 4);
    backward.shell.InsertText("p-1", "abc", 3, "deleteContentBackward");
    backward.shell.InsertText("p-1", "ab", 2, "deleteContentBackward");
    expect(backward.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(backward.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelete);
    backward.shell.Undo();
    expect(backward.document.paragraphs[0]?.runs).toEqual([
      run("ab", true),
      run("cd", false, true),
    ]);

    const forward = createSession("abcd");
    forward.shell.SetCursor("p-1", 0);
    forward.shell.InsertText("p-1", "bcd", 0, "deleteContentForward");
    forward.shell.InsertText("p-1", "cd", 0, "deleteContentForward");
    expect(forward.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
    forward.shell.Undo();
    expect(forward.document.paragraphs[0]?.text).toBe("abcd");

    const delimiter = createSession("a ");
    delimiter.shell.SetCursor("p-1", 2);
    delimiter.shell.InsertText("p-1", "a", 1, "deleteContentBackward");
    expect(delimiter.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelete);
  });

  it("keeps composition and mixed replacements outside typing groups" /** Verifies explicit input and transaction grouping boundaries. @returns Nothing. */, function separatesInputKinds(): void {
    const { docShell, document, shell } = createSession();
    shell.InsertText("p-1", "あ", 1, "insertCompositionText");
    shell.InsertText("p-1", "あい", 2, "insertCompositionText");
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(2);
    shell.InsertText("p-1", "AX", 2, "insertText");
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoReplace);
    shell.Undo();
    expect(document.paragraphs[0]?.text).toBe("あい");
    expect(shell.InsertText("p-1", "あい", 2, "insertText")).toBe(false);
  });

  it("undoes paste and cut as range actions with exact direct formatting" /** Verifies compound replacement semantics without document snapshots. @returns Nothing. */, function replacesRanges(): void {
    const { docShell, document, shell } = createSession("hello");
    shell.ReplaceRange({ paragraphId: "p-1", start: 1, end: 4 }, [run("EY", true)]);
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoReplace);
    expect(document.paragraphs[0]?.runs).toEqual([run("h"), run("EY", true), run("o")]);
    shell.Undo();
    expect(document.paragraphs[0]?.runs).toEqual([run("hello")]);
    shell.Redo();
    shell.ReplaceRange({ paragraphId: "p-1", start: 1, end: 3 }, []);
    expect(document.paragraphs[0]?.text).toBe("ho");
    shell.Undo();
    expect(document.paragraphs[0]?.runs).toEqual([run("h"), run("EY", true), run("o")]);
    expect(shell.ReplaceRange({ paragraphId: "p-1", start: 1, end: 3 }, [run("EY", true)])).toBe(
      false,
    );
  });

  it("restores split and join structure, node formatting, and caret" /** Verifies SwUndoSplitNode and SwUndoJoinParagraphs structural payloads. @returns Nothing. */, function restoresParagraphStructure(): void {
    const { docShell, document, shell } = createSession("abcd");
    const nextId = shell.SplitParagraph("p-1", 2);
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoSplitNode);
    expect(
      document.paragraphs.map(
        /** Returns visible paragraph text. @param paragraph - Writer paragraph. @returns Its text. */
        (paragraph) => paragraph.text,
      ),
    ).toEqual(["ab", "cd"]);
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(document.paragraphs[1]);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
    shell.Undo();
    expect(
      document.paragraphs.map(
        /** Returns visible paragraph text. @param paragraph - Writer paragraph. @returns Its text. */
        (paragraph) => paragraph.text,
      ),
    ).toEqual(["abcd"]);
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(document.paragraphs[0]);
    shell.Redo();
    shell.SetCursor(nextId, 2);
    shell.SetParagraphStyle("heading-1");
    shell.SetParagraphListKind("numbered");
    shell.ToggleCharacterFormat("italic", { paragraphId: nextId, start: 0, end: 2 });
    const trailingSnapshot = encodeWriterDocument(document).textNodes[1];
    shell.MergeParagraphWithPrevious(nextId);
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoJoinParagraphs);
    expect(document.paragraphs).toHaveLength(1);
    shell.Undo();
    expect(encodeWriterDocument(document).textNodes[1]).toEqual(trailingSnapshot);
    shell.Redo();
    expect(
      document.paragraphs.map(
        /** Returns visible paragraph text. @param paragraph - Writer paragraph. @returns Its text. */
        (paragraph) => paragraph.text,
      ),
    ).toEqual(["abcd"]);
  });

  it("restores character hints, selection direction, pending attributes, paragraph items, styles, and numbering" /** Verifies formatting actions retain semantic item/hint and cursor payloads. @returns Nothing. */, function restoresFormattingAndCursor(): void {
    const { docShell, document, shell } = createSession("abcd");
    const paragraph = document.paragraphs[0] as NonNullable<(typeof document.paragraphs)[number]>;
    shell.GetCursor().Assign(new SwPosition(paragraph, 1), new SwPosition(paragraph, 3));
    shell.ToggleCharacterFormat("bold", { paragraphId: "p-1", start: 1, end: 3 });
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoAttr);
    expect(paragraph.runs).toEqual([run("a"), run("bc", true), run("d")]);
    shell.Undo();
    expect(paragraph.runs).toEqual([run("abcd")]);
    expect(shell.GetCursor().HasMark()).toBe(true);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(3);
    expect(shell.GetPendingCharacterAttributes().bold).toBe(false);
    shell.Redo();
    expect(shell.GetCursor().HasMark()).toBe(true);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(3);
    expect(shell.GetPendingCharacterAttributes().bold).toBe(false);

    shell.SetParagraphAlignment("center");
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoParagraphFormat);
    shell.SetParagraphStyle("heading-1");
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoFormatColl);
    shell.SetParagraphListKind("numbered");
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoInsNum);
    shell.ChangeParagraphListLevel("demote");
    expect(docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoNumLevel);
    expect(paragraph).toMatchObject({ alignment: "center", style: "heading-1" });
    expect(paragraph.list).toMatchObject({ kind: "numbered", level: 1 });
    shell.Undo();
    expect(paragraph.list.level).toBe(0);
    shell.Undo();
    expect(paragraph.list.kind).toBe("none");
    shell.Undo();
    expect(paragraph.style).toBe("default");
    shell.Undo();
    expect(paragraph.alignment).toBe("left");
  });

  it("preserves lifecycle generations and the moved save mark across action navigation" /** Verifies document lifecycle ownership after removing historical snapshots. @returns A fulfilled assertion promise. */, async function preservesSaveMark(): Promise<void> {
    const { docShell, shell } = createSession();
    shell.InsertText("p-1", "a", 1, "insertText");
    await docShell.Save(
      /** Confirms the generation accepted by the test primary medium. @returns Matching storage evidence. */ async () => ({
        generation: docShell.GetDocumentState().contentGeneration,
      }),
    );
    shell.InsertText("p-1", "ab", 2, "insertText");
    expect(docShell.GetDocumentState()).toMatchObject({
      contentGeneration: 2,
      isModified: true,
      savedGeneration: 1,
    });
    shell.Undo();
    expect(docShell.GetDocumentState()).toMatchObject({
      contentGeneration: 3,
      isModified: false,
      savedGeneration: 1,
    });
    shell.Redo();
    expect(docShell.GetDocumentState()).toMatchObject({
      contentGeneration: 4,
      isModified: true,
      savedGeneration: 1,
    });
  });

  it("keeps bounded history state valid after old actions are discarded" /** Verifies the current document is never rolled back merely because history reaches its limit. @returns Nothing. */, function boundsWriterHistory(): void {
    const { docShell, document, shell } = createSession();
    docShell.GetUndoManager().SetMaxUndoActionCount(2);
    shell.InsertText("p-1", "a", 1, "insertText");
    docShell.GetUndoManager().BreakUndoGrouping();
    shell.InsertText("p-1", "ab", 2, "insertText");
    docShell.GetUndoManager().BreakUndoGrouping();
    shell.InsertText("p-1", "abc", 3, "insertText");
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(2);
    shell.Undo();
    shell.Undo();
    expect(document.paragraphs[0]?.text).toBe("a");
    expect(shell.Undo()).toBe(false);
  });

  it("stores constant insert payload and never clones or snapshots the interactive document" /** Verifies representative-size insertion cost depends on the edit, not retained SwDoc size. @returns Nothing. */, function avoidsFullDocumentSnapshots(): void {
    const small = createSession("x");
    const large = createSession("x".repeat(20_000));
    for (let index = 2; index <= 200; index += 1)
      large.document.nodes.MakeTextNode(`p-${index}`, "y".repeat(200));
    const smallStart = performance.now();
    small.shell.InsertText("p-1", "xa", 2, "insertText");
    const smallLatency = performance.now() - smallStart;
    large.shell.SetCursor("p-1", 20_000);
    const largeStart = performance.now();
    large.shell.InsertText("p-1", `${"x".repeat(20_000)}a`, 20_001, "insertText");
    const largeLatency = performance.now() - largeStart;
    const smallUndoStart = performance.now();
    small.shell.Undo();
    const smallUndoLatency = performance.now() - smallUndoStart;
    const largeUndoStart = performance.now();
    large.shell.Undo();
    const largeUndoLatency = performance.now() - largeUndoStart;
    const smallRedoStart = performance.now();
    small.shell.Redo();
    const smallRedoLatency = performance.now() - smallRedoStart;
    const largeRedoStart = performance.now();
    large.shell.Redo();
    const largeRedoLatency = performance.now() - largeRedoStart;
    expect(large.docShell.GetUndoManager().GetHistoryPayloadSize()).toBe(
      small.docShell.GetUndoManager().GetHistoryPayloadSize(),
    );
    expect({
      largeLatency,
      largeRedoLatency,
      largeUndoLatency,
      smallLatency,
      smallRedoLatency,
      smallUndoLatency,
    }).toEqual({
      largeLatency: expect.any(Number),
      largeRedoLatency: expect.any(Number),
      largeUndoLatency: expect.any(Number),
      smallLatency: expect.any(Number),
      smallRedoLatency: expect.any(Number),
      smallUndoLatency: expect.any(Number),
    });
    expect(Math.max(largeLatency, largeRedoLatency, largeUndoLatency)).toBeLessThan(250);
  });

  it("rejects invalid action targets and preserves disabled command no-ops" /** Covers bounded shell validation and command-state branches. @returns Nothing. */, function rejectsInvalidActions(): void {
    const { docShell, shell } = createSession("abc");
    expect(
      /** Replaces content in an absent paragraph. @returns Invalid transition that never returns. */
      () => shell.ReplaceRange({ paragraphId: "missing", start: 0, end: 0 }, []),
    ).toThrow("Unknown paragraph");
    expect(
      /** Replaces content through an invalid range. @returns Invalid transition that never returns. */
      () => shell.ReplaceRange({ paragraphId: "p-1", start: -1, end: 0 }, []),
    ).toThrow("outside the paragraph");
    expect(
      /** Splits an absent paragraph. @returns Invalid transition that never returns. */
      () => shell.SplitParagraph("missing", 0),
    ).toThrow("Unknown paragraph");
    expect(
      /** Splits beyond paragraph content. @returns Invalid transition that never returns. */
      () => shell.SplitParagraph("p-1", 4),
    ).toThrow("outside the paragraph");
    expect(shell.MergeParagraphWithPrevious("p-1")).toBe(false);
    expect(shell.MergeParagraphWithNext("p-1")).toBe(false);
    expect(shell.SetParagraphAlignment("left")).toBe(false);
    expect(shell.SetParagraphStyle("default")).toBe(false);
    expect(shell.SetParagraphListKind("none")).toBe(false);
    expect(shell.ChangeParagraphListLevel("promote")).toBe(false);
    expect(docShell.GetUndoManager().GetUndoActionCount()).toBe(0);
  });

  it("reports bounded action payloads and rejects empty or incompatible grouped actions" /** Covers retained-payload contracts and SwUndo grouping guards directly. @returns Nothing. */, function validatesActionPayloads(): void {
    const document = createWriterDocument("p-1");
    const target = document.paragraphs[0] as SwTextNode;
    const trailing = document.nodes.MakeTextNode("p-2", "b");
    const state = cursorState(target);
    const insert = new SwUndoInsert(target, 0, [run("a")], "word", state, cursorState(target, 1));
    const deletion = new SwUndoDelete(
      target,
      0,
      [run("a")],
      "delete",
      "word",
      cursorState(target, 1),
      state,
    );
    const replacement = new SwUndoReplace(
      target,
      0,
      [run("a")],
      [run("B", true)],
      "Replace",
      state,
      cursorState(target, 1),
    );
    const attr = new SwUndoAttr(target, 0, [run("a")], [run("a", true)], state, state);
    const paragraph = new SwUndoParagraphFormat(target, "left", "center", state, state);
    const style = new SwUndoFormatColl(target, "default", "heading-1", state, state);
    const numbering = new SwUndoInsNum(
      target,
      { kind: "none", level: 0 },
      { kind: "numbered", level: 0 },
      state,
      state,
    );
    const split = new SwUndoSplitNode(target, 1, state, state);
    const undoContext: SwUndoRedoContext = {
      GetDoc: /** Returns the active graph. @returns Test document. */ () => document,
      RestoreCursor: /** Ignores cursor restoration. @returns Nothing. */ () => undefined,
    };
    expect(
      /** Undoes before the first redo. @returns Invalid transition. */ () =>
        split.UndoWithContext(undoContext),
    ).toThrow("has not created");
    const generatedSplit = new SwUndoSplitNode(target, 0, state, state);
    generatedSplit.RedoWithContext(undoContext);
    generatedSplit.UndoWithContext(undoContext);
    const joined = new SwUndoJoinParagraphs(target, 1, trailing, state, state);
    expect(insert.GetComment()).toBe("Insert");
    expect([
      insert.GetPayloadSize(),
      deletion.GetPayloadSize(),
      replacement.GetPayloadSize(),
      attr.GetPayloadSize(),
      paragraph.GetPayloadSize(),
      style.GetPayloadSize(),
      numbering.GetPayloadSize(),
      split.GetPayloadSize(),
      joined.GetPayloadSize(),
    ]).toEqual([4, 4, 8, 8, 2, 2, 6, 1, expect.any(Number)]);
    expect(insert.Merge(deletion)).toBe(false);
    expect(
      deletion.Merge(new SwUndoDelete(target, 2, [run("b")], "delete", "word", state, state)),
    ).toBe(false);
    expect(
      deletion.Merge(
        new SwUndoDelete(target, 0, [run(" ")], "backspace", "delimiter", state, state),
      ),
    ).toBe(false);
    expect(
      /** Constructs an insertion without domain payload. @returns Invalid construction that never returns. */
      () => new SwUndoInsert(target, 0, [], undefined, state, state),
    ).toThrow("non-empty text");
    expect(
      /** Constructs a deletion without domain payload. @returns Invalid construction that never returns. */
      () => new SwUndoDelete(target, 0, [], "delete", undefined, state, state),
    ).toThrow("non-empty text");
  });

  it("validates undo helper targets, shell formatting ranges, list commands, and cursor fallbacks" /** Covers defensive action and Writer-shell command branches. @returns Nothing. */, function validatesUndoBoundaries(): void {
    const { docShell, document, shell } = createSession("abc");
    expect(
      /** Resolves an absent action target. @returns Invalid lookup that never returns. */
      () => GetUndoTextNode(document, createWriterDocument("foreign").paragraphs[0] as never),
    ).toThrow("another document");
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Expected the initial Writer paragraph.");
    expect(
      /** Copies an invalid action range. @returns Invalid range operation that never returns. */
      () => CopyTextRangeRuns(paragraph, -1, 0),
    ).toThrow("outside the paragraph");
    expect(
      /** Formats an absent paragraph. @returns Invalid lookup that never returns. */
      () => shell.ToggleCharacterFormat("bold", { paragraphId: "missing", start: 0, end: 0 }),
    ).toThrow("Unknown paragraph");
    expect(
      /** Formats an invalid paragraph range. @returns Invalid range operation that never returns. */
      () => shell.ToggleCharacterFormat("bold", { paragraphId: "p-1", start: -1, end: 1 }),
    ).toThrow("outside the paragraph");
    expect(shell.ToggleCharacterFormat("bold", { paragraphId: "p-1", start: 1, end: 1 })).toBe(
      false,
    );
    expect(
      /** Passes a runtime-invalid list kind through the public command boundary. @returns Invalid command that never returns. */
      () => shell.SetParagraphListKind("invalid" as never),
    ).toThrow("Unsupported Writer paragraph list kind");
    expect(
      /** Passes a runtime-invalid list level command through the public command boundary. @returns Invalid command that never returns. */
      () => shell.ChangeParagraphListLevel("invalid" as never),
    ).toThrow("Unsupported Writer list-level command");
    shell.SetParagraphListKind("numbered");
    expect(shell.ChangeParagraphListLevel("promote")).toBe(false);
    while (shell.ChangeParagraphListLevel("demote")) continue;
    expect(document.paragraphs[0]?.list.level).toBe(9);

    const context = (shell as unknown as { undoContext: SwUndoRedoContext }).undoContext;
    expect(
      /** Resolves a missing private action endpoint. @returns Invalid state. */ () =>
        (
          shell as unknown as {
            CreateCollapsedCursorState: (paragraphId: string, offset: number) => SwUndoCursorState;
          }
        ).CreateCollapsedCursorState("missing", 0),
    ).toThrow("Unknown paragraph");
    const foreign = createWriterDocument("foreign").paragraphs[0] as SwTextNode;
    docShell.ApplyUndoAction(
      new SwUndoParagraphFormat(
        paragraph,
        "left",
        "right",
        cursorState(paragraph),
        cursorState(foreign, 0),
      ),
      context,
    );
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(document.paragraphs[0]);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
  });
});
