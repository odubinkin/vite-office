/**
 * @fileoverview Implements the persistent Writer editing shell and SwPaM ownership from
 * pinned LibreOffice `sw/source/uibase/wrtsh/wrtsh1.cxx`.
 */

import type { TransactionHistory } from "../../../../sfx2/source/doc/docundomanager";
import {
  createCommandShell,
  type SfxShell,
} from "../../../../framework/source/dispatch/dispatchprovider";
import {
  insertWriterTextWithAttributes,
  mergeWriterParagraphWithPrevious,
  replaceWriterParagraph,
  setWriterParagraphAlignment,
  setWriterParagraphStyle,
  splitWriterParagraph,
  SwPaM,
  SwPosition,
  type WriterCharacterAttributes,
  type WriterCharacterFormat,
  type WriterDocument,
  type WriterParagraph,
  type WriterParagraphAlignment,
  type WriterParagraphStyle,
  type WriterTextRun,
} from "../../core/doc/writer";
import {
  replaceWriterParagraphTextRange,
  type WriterParagraphTextRange,
} from "../../core/doc/DocumentContentOperationsManager";
import {
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  getWriterTextAttributesAtOffset,
} from "../../core/txtnode/ndtxt";
import type { WriterParagraphListKind } from "../../core/doc/list";
import { changeWriterParagraphListLevel, type WriterListLevelCommand } from "../shells/listsh";
import { createWriterTextCommandRegistry } from "../shells/writercommands";
import { toggleWriterCharacterFormat } from "../shells/txtattr";
import { setWriterParagraphListKind } from "../shells/txtnum";
import type { SwDocShell } from "../app/docsh";
import {
  acknowledgeWriterSave,
  getActiveWriterParagraph,
  getNextWriterParagraphId,
  redoWriterTransaction,
  undoWriterTransaction,
} from "../uiview/viewfunc";

/** Post-render caret request derived from one Writer shell operation. */
export interface WriterFocusTarget {
  /** Paragraph receiving browser focus after React projects the new model. */
  readonly paragraphId: string;
  /** UTF-16 caret offset inside the target paragraph. */
  readonly offset: number;
  /** Monotonic request identity allowing repeated focus at the same model position. */
  readonly requestId: number;
}

/** Persistent Writer editing shell over one document shell and one direction-preserving PaM. */
export class SwWrtShell {
  private activeParagraphId: string;
  private readonly commandShell: SfxShell;
  private readonly cursor: SwPaM;
  private focusTarget: WriterFocusTarget | undefined;
  private readonly listeners = new Set<() => void>();
  private nextFocusRequestId = 0;
  private pendingCharacterAttributes: WriterCharacterAttributes = {
    ...DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  };

  /** Creates a shell at the end of the first Writer paragraph. @param docShell - Persistent owning document shell. @returns Nothing. */
  public constructor(private readonly docShell: SwDocShell) {
    const paragraph = docShell.GetDoc().paragraphs[0] as WriterParagraph;
    this.activeParagraphId = paragraph.id;
    this.cursor = new SwPaM(new SwPosition(paragraph, paragraph.text.length));
    this.pendingCharacterAttributes = getWriterTextAttributesAtOffset(
      paragraph.runs,
      paragraph.text.length,
    );
    this.commandShell = createCommandShell(this, createWriterTextCommandRegistry(this));
  }

  /** Returns the persistent owning document shell. @returns SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }

  /** Returns the current canonical Writer document. @returns Shell-owned SwDoc. */
  public GetDoc(): WriterDocument {
    return this.docShell.GetDoc();
  }

  /** Returns the persistent point-and-mark cursor identity. @returns Current SwPaM. */
  public GetCursor(): SwPaM {
    return this.cursor;
  }

  /** Returns the Writer editing command shell for top-priority frame registration. @returns SfxShell adapter. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }

  /** Returns the active paragraph with the Writer first-paragraph fallback. @returns Active text node. */
  public GetActiveParagraph(): WriterParagraph {
    return getActiveWriterParagraph(this.GetDoc(), this.activeParagraphId);
  }

  /** Returns pending direct attributes for a collapsed caret. @returns Copied attribute state. */
  public GetPendingCharacterAttributes(): WriterCharacterAttributes {
    return { ...this.pendingCharacterAttributes };
  }

  /** Returns the current post-render focus target. @returns Focus target or undefined. */
  public GetFocusTarget(): WriterFocusTarget | undefined {
    return this.focusTarget === undefined ? undefined : { ...this.focusTarget };
  }

  /** Returns whether the shell-owned history can move backward. @returns True when Undo is enabled. */
  public CanUndo(): boolean {
    return this.docShell.GetUndoManager().index > 0;
  }

  /** Returns whether the shell-owned history can move forward. @returns True when Redo is enabled. */
  public CanRedo(): boolean {
    const history = this.docShell.GetUndoManager();
    return history.index < history.entries.length - 1;
  }

  /** Subscribes to cursor and pending-attribute changes. @param listener - View invalidation callback. @returns Cleanup removing it. */
  public Subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return /** Removes one editing-shell listener. @returns Whether the listener was present. */ () =>
      this.listeners.delete(listener);
  }

  /** Rebinds the persistent PaM after explicit document replacement. @returns Nothing. */
  public DocumentReplaced(): void {
    const paragraph = this.GetDoc().paragraphs[0] as WriterParagraph;
    this.activeParagraphId = paragraph.id;
    this.focusTarget = undefined;
    this.pendingCharacterAttributes = getWriterTextAttributesAtOffset(
      paragraph.runs,
      paragraph.text.length,
    );
    this.AssignCursor(paragraph, paragraph.text.length);
    this.Notify();
  }

  /** Selects one paragraph as the command target. @param paragraphId - Existing paragraph identity. @param offset - Optional logical caret offset, defaulting to paragraph end. @returns Nothing. */
  public SetCursor(paragraphId: string, offset?: number): void {
    const paragraph = getActiveWriterParagraph(this.GetDoc(), paragraphId);
    const nextOffset = offset ?? paragraph.text.length;
    this.activeParagraphId = paragraph.id;
    this.pendingCharacterAttributes = getWriterTextAttributesAtOffset(paragraph.runs, nextOffset);
    this.AssignCursor(paragraph, nextOffset);
    this.Notify();
  }

  /** Applies one browser text replacement using Writer-compatible grouping rules. @param paragraphId - Edited paragraph. @param text - Complete next visible text. @param caretOffset - Collapsed caret after input. @param inputType - Native input operation. @returns Whether document content changed. */
  public InsertText(
    paragraphId: string,
    text: string,
    caretOffset: number | undefined,
    inputType: string,
  ): boolean {
    const document = this.GetDoc();
    const paragraph = getActiveWriterParagraph(document, paragraphId);
    const change = getWriterTextChange(paragraph.text, text);
    const nextDocument =
      change?.kind === "insert"
        ? insertWriterTextWithAttributes(
            document,
            paragraph.id,
            change.offset,
            change.text,
            this.pendingCharacterAttributes,
          )
        : change?.kind === "delete"
          ? replaceWriterParagraphTextRange(
              document,
              { end: change.end, paragraphId: paragraph.id, start: change.start },
              [],
            )
          : replaceWriterParagraph(document, paragraph.id, text);
    const nextOffset = caretOffset ?? text.length;
    const grouping = getWriterTypingGroup(
      paragraph.id,
      change,
      inputType,
      this.docShell.GetUndoManager().selection.position,
      caretOffset,
    );
    this.activeParagraphId = paragraph.id;
    this.AssignCursor(
      nextDocument.paragraphs.find(
        /** Matches the edited paragraph identity. @param node - Candidate paragraph. @returns Whether IDs match. */
        (node) => node.id === paragraph.id,
      ) as WriterParagraph,
      nextOffset,
    );
    return this.docShell.ApplyDocument(nextDocument, { position: nextOffset }, grouping);
  }

  /** Replaces one same-paragraph range with Writer text runs. @param range - Target range. @param runs - Inserted safe runs. @returns Whether document content changed. */
  public ReplaceRange(range: WriterParagraphTextRange, runs: readonly WriterTextRun[]): boolean {
    const insertionLength = runs.reduce(
      /** Accumulates visible inserted text length. @param total - Prior length. @param run - Inserted run. @returns Updated length. */
      (total, run) => total + run.text.length,
      0,
    );
    const nextOffset = range.start + insertionLength;
    const nextDocument = replaceWriterParagraphTextRange(this.GetDoc(), range, runs);
    const paragraph = nextDocument.paragraphs.find(
      /** Matches the replacement paragraph identity. @param node - Candidate paragraph. @returns Whether IDs match. */
      (node) => node.id === range.paragraphId,
    ) as WriterParagraph;
    this.activeParagraphId = paragraph.id;
    this.SetFocusTarget(paragraph.id, nextOffset);
    this.AssignCursor(paragraph, nextOffset);
    if (nextDocument === this.GetDoc()) {
      this.Notify();
      return false;
    }
    return this.docShell.ApplyDocument(nextDocument, { position: nextOffset });
  }

  /** Splits one paragraph at the logical caret. @param paragraphId - Source paragraph. @param offset - Split offset. @returns New paragraph identity. */
  public SplitParagraph(paragraphId: string, offset: number): string {
    const nextParagraphId = getNextWriterParagraphId(this.GetDoc());
    const nextDocument = splitWriterParagraph(this.GetDoc(), paragraphId, offset, nextParagraphId);
    const paragraph = nextDocument.paragraphs.find(
      /** Matches the new paragraph identity. @param node - Candidate paragraph. @returns Whether IDs match. */
      (node) => node.id === nextParagraphId,
    ) as WriterParagraph;
    this.activeParagraphId = nextParagraphId;
    this.SetFocusTarget(nextParagraphId, 0);
    this.AssignCursor(paragraph, 0);
    this.docShell.ApplyDocument(nextDocument, { position: 0 });
    return nextParagraphId;
  }

  /** Joins a non-first paragraph into its preceding node. @param paragraphId - Paragraph whose preceding break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithPrevious(paragraphId: string): boolean {
    const document = this.GetDoc();
    const index = document.paragraphs.findIndex(
      /** Matches the paragraph selected for joining. @param paragraph - Candidate paragraph. @returns Whether IDs match. */
      (paragraph) => paragraph.id === paragraphId,
    );
    if (index <= 0) return false;
    const preceding = document.paragraphs[index - 1] as WriterParagraph;
    const offset = preceding.text.length;
    const nextDocument = mergeWriterParagraphWithPrevious(document, paragraphId);
    const nextParagraph = nextDocument.paragraphs[index - 1] as WriterParagraph;
    this.activeParagraphId = nextParagraph.id;
    this.SetFocusTarget(nextParagraph.id, offset);
    this.AssignCursor(nextParagraph, offset);
    return this.docShell.ApplyDocument(nextDocument, { position: offset });
  }

  /** Joins the following paragraph into the selected node. @param paragraphId - Paragraph whose following break is removed. @returns Whether a merge occurred. */
  public MergeParagraphWithNext(paragraphId: string): boolean {
    const document = this.GetDoc();
    const index = document.paragraphs.findIndex(
      /** Matches the paragraph selected before the following break. @param paragraph - Candidate paragraph. @returns Whether IDs match. */
      (paragraph) => paragraph.id === paragraphId,
    );
    if (index < 0 || index === document.paragraphs.length - 1) return false;
    return this.MergeParagraphWithPrevious((document.paragraphs[index + 1] as WriterParagraph).id);
  }

  /** Toggles direct character formatting over a range or pending caret state. @param format - Writer character format. @param range - Optional same-paragraph selection. @returns Whether document content changed. */
  public ToggleCharacterFormat(
    format: WriterCharacterFormat,
    range?: WriterParagraphTextRange,
  ): boolean {
    this.pendingCharacterAttributes = {
      ...this.pendingCharacterAttributes,
      [format]: !this.pendingCharacterAttributes[format],
    };
    if (range === undefined) {
      this.Notify();
      return false;
    }
    const nextDocument = toggleWriterCharacterFormat(this.GetDoc(), range, format);
    const paragraph = nextDocument.paragraphs.find(
      /** Matches the formatted paragraph identity. @param node - Candidate paragraph. @returns Whether IDs match. */
      (node) => node.id === range.paragraphId,
    ) as WriterParagraph;
    this.activeParagraphId = paragraph.id;
    this.AssignCursor(paragraph, range.end);
    return this.docShell.ApplyDocument(nextDocument, { position: range.end });
  }

  /** Applies paragraph alignment through one shell-owned history transition. @param alignment - Next alignment. @returns Whether content changed. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): boolean {
    return this.ApplyParagraphDocument(
      setWriterParagraphAlignment(this.GetDoc(), this.GetActiveParagraph().id, alignment),
    );
  }

  /** Applies a paragraph style through one shell-owned history transition. @param style - Next style. @returns Whether content changed. */
  public SetParagraphStyle(style: WriterParagraphStyle): boolean {
    return this.ApplyParagraphDocument(
      setWriterParagraphStyle(this.GetDoc(), this.GetActiveParagraph().id, style),
    );
  }

  /** Applies or removes the active paragraph's default list. @param kind - Next list kind. @returns Whether content changed. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    return this.ApplyParagraphDocument(
      setWriterParagraphListKind(this.GetDoc(), this.GetActiveParagraph().id, kind),
    );
  }

  /** Promotes or demotes the active list paragraph. @param command - Level transition. @returns Whether content changed. */
  public ChangeParagraphListLevel(command: WriterListLevelCommand): boolean {
    return this.ApplyParagraphDocument(
      changeWriterParagraphListLevel(this.GetDoc(), this.GetActiveParagraph().id, command),
    );
  }

  /** Restores the preceding Writer history state. @returns Whether navigation occurred. */
  public Undo(): boolean {
    const changed = this.docShell.SetUndoManager(
      undoWriterTransaction(this.docShell.GetUndoManager()),
    );
    if (changed) this.RebindAfterHistoryNavigation();
    return changed;
  }

  /** Restores the following Writer history state. @returns Whether navigation occurred. */
  public Redo(): boolean {
    const changed = this.docShell.SetUndoManager(
      redoWriterTransaction(this.docShell.GetUndoManager()),
    );
    if (changed) this.RebindAfterHistoryNavigation();
    return changed;
  }

  /** Moves the save mark without recording an undo action. @param savedGeneration - Persisted content generation. @returns Whether history state changed. */
  public AcknowledgeSave(savedGeneration: number): boolean {
    return this.docShell.SetUndoManager(
      acknowledgeWriterSave(this.docShell.GetUndoManager(), savedGeneration),
    );
  }

  /** Applies a paragraph-format document while preserving the current caret. @param nextDocument - Candidate document. @returns Whether it changed. */
  private ApplyParagraphDocument(nextDocument: WriterDocument): boolean {
    const active = getActiveWriterParagraph(nextDocument, this.activeParagraphId);
    const offset = Math.min(this.cursor.GetPoint().GetContentIndex(), active.text.length);
    this.activeParagraphId = active.id;
    this.AssignCursor(active, offset);
    return this.docShell.ApplyDocument(nextDocument, { position: offset });
  }

  /** Rebinds the PaM to the restored history document and selection. @returns Nothing. */
  private RebindAfterHistoryNavigation(): void {
    const paragraph = getActiveWriterParagraph(this.GetDoc(), this.activeParagraphId);
    const offset = Math.min(
      this.docShell.GetUndoManager().selection.position,
      paragraph.text.length,
    );
    this.activeParagraphId = paragraph.id;
    this.SetFocusTarget(paragraph.id, offset);
    this.AssignCursor(paragraph, offset);
    this.Notify();
  }

  /** Mutates the existing PaM identity to a collapsed model position. @param paragraph - Target node. @param offset - UTF-16 content offset. @returns Nothing. */
  private AssignCursor(paragraph: WriterParagraph, offset: number): void {
    this.cursor.Assign(new SwPosition(paragraph, offset));
  }

  /** Records a distinct browser focus request even when its model position repeats. @param paragraphId - Target paragraph identity. @param offset - Target content offset. @returns Nothing. */
  private SetFocusTarget(paragraphId: string, offset: number): void {
    this.focusTarget = { offset, paragraphId, requestId: this.nextFocusRequestId };
    this.nextFocusRequestId += 1;
  }

  /** Publishes shell-local selection state invalidation. @returns Nothing. */
  private Notify(): void {
    for (const listener of this.listeners) listener();
  }
}

/** Detects one contiguous insertion, deletion, or fallback replacement. @param previousText - Canonical text. @param nextText - Browser text. @returns Exact change when representable. */
function getWriterTextChange(
  previousText: string,
  nextText: string,
):
  | Readonly<{ kind: "delete"; end: number; start: number; text: string }>
  | Readonly<{ kind: "insert"; offset: number; text: string }>
  | undefined {
  if (nextText === previousText) return undefined;
  let prefixLength = 0;
  while (
    prefixLength < previousText.length &&
    previousText.charAt(prefixLength) === nextText.charAt(prefixLength)
  )
    prefixLength += 1;
  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength &&
    previousText.charAt(previousText.length - suffixLength - 1) ===
      nextText.charAt(nextText.length - suffixLength - 1)
  )
    suffixLength += 1;
  const previousEnd = previousText.length - suffixLength;
  const removedText = previousText.slice(prefixLength, previousEnd);
  const insertedText = nextText.slice(prefixLength, nextText.length - suffixLength);
  if (removedText.length === 0 && insertedText.length > 0)
    return { kind: "insert", offset: prefixLength, text: insertedText };
  if (insertedText.length === 0 && removedText.length > 0)
    return { kind: "delete", end: previousEnd, start: prefixLength, text: removedText };
  return undefined;
}

/** Derives the bounded snapshot grouping equivalent of SwUndoInsert/SwUndoDelete CanGrouping. @param paragraphId - Text-node identity. @param change - Exact input change. @param inputType - Browser input kind. @param previousCaretOffset - Prior history caret. @param nextCaretOffset - Next collapsed caret. @returns Open group metadata or undefined. */
function getWriterTypingGroup(
  paragraphId: string,
  change:
    | Readonly<{ kind: "delete"; end: number; start: number; text: string }>
    | Readonly<{ kind: "insert"; offset: number; text: string }>
    | undefined,
  inputType: string,
  previousCaretOffset: number,
  nextCaretOffset: number | undefined,
): Readonly<{ extendCurrent: boolean; id: string }> | undefined {
  if (change === undefined || nextCaretOffset === undefined) return undefined;
  const characterClass = getWriterTypingCharacterClass(change.text);
  if (characterClass === undefined) return undefined;
  if (change.kind === "insert") {
    if (inputType !== "insertText") return undefined;
    return {
      extendCurrent: change.offset === previousCaretOffset,
      id: `writer-typing:${paragraphId}:insert:${characterClass}`,
    };
  }
  if (change.text.length !== 1) return undefined;
  if (inputType === "deleteContentBackward")
    return {
      extendCurrent: change.end === previousCaretOffset,
      id: `writer-typing:${paragraphId}:backspace:${characterClass}`,
    };
  if (inputType === "deleteContentForward")
    return {
      extendCurrent: change.start === previousCaretOffset,
      id: `writer-typing:${paragraphId}:delete:${characterClass}`,
    };
  return undefined;
}

/** Classifies one grouped edit as alphanumeric word or delimiter input. @param text - Non-empty changed text. @returns Shared class or undefined for mixed input. */
function getWriterTypingCharacterClass(text: string): "delimiter" | "word" | undefined {
  const characters = [...text];
  const firstCharacter = characters[0];
  /* c8 ignore next -- detected insertions and deletions always contain text. */
  if (firstCharacter === undefined) return undefined;
  const firstIsWord = /[\p{L}\p{N}]/u.test(firstCharacter);
  return characters.every(
    /** Compares one character class with the first changed character. @param character - Changed character. @returns Whether its class matches. */
    (character) => /[\p{L}\p{N}]/u.test(character) === firstIsWord,
  )
    ? firstIsWord
      ? "word"
      : "delimiter"
    : undefined;
}

/** Exposes the current shell history type for command-state tests without duplicating ownership. */
export type SwWrtShellHistory = TransactionHistory<WriterDocument>;
