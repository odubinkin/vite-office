/**
 * @fileoverview Prepares a bounded Writer transfer document from SwPaM, mirroring
 * LibreOffice `sw/source/uibase/dochdl/swdtflvr.cxx` ownership.
 */
import { getWriterNumFormatBullet } from "../../core/doc/number";

import { SwASCWriter } from "../../filter/ascii/wrtasc";
import { serializeWriterClipboardHtml } from "../../filter/html/htmlnumwriter";
import type { WriterTransferParagraph } from "../../filter/basflt/writer-transfer";
import { SwPosition, type WriterTextRange } from "../../core/crsr/pam";
import type { SwNode } from "../../core/docnode/node";
import type {
  SwTextFragment,
  SwTextNode,
  SwTextNode as WriterParagraph,
} from "../../core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import {
  createWriterTextFragment,
  getWriterTextFromRuns,
  splitWriterTextRuns,
  type WriterTextRun,
} from "../../filter/basflt/writer-transfer";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import { createWriterListItemSet } from "../../core/doc/list";
import { SwUndoInsNum } from "../../core/undo/unnum";

/** Describes the two clipboard representations emitted for a visible Writer selection. */
export interface WriterClipboardSelection {
  readonly html: string;
  readonly plainText: string;
}

/** Writer-owned text and list transfer awaiting insertion in a target document pool. */
export interface WriterTransferDocument {
  readonly source?: "html" | "plain-text";
  readonly isBlock: boolean;
  readonly paragraphs: readonly Readonly<{
    listKind: "bullet" | "none" | "numbered";
    listLevel: number;
    runs: readonly WriterTextRun[];
  }>[];
}

/** Transfer failure reported by command completion without coupling Writer to a browser API. */
export class WriterTransferError extends Error {
  public readonly code = "selection-required";

  /** Creates a selection failure. @returns Nothing. */
  public constructor() {
    super("Select text to copy.");
    this.name = "WriterTransferError";
  }
}

/** Model-owned transferable created from the shell SwPaM, independent of rendered DOM. */
export class SwTransferable {
  /** Creates transfer serialization over the canonical editing shell. @param shell - Writer shell owning the persistent PaM and target. @returns Nothing. */
  public constructor(private readonly shell: SwWrtShell) {}

  /** Chooses the supported rich or plain insertion format after the browser filter has inspected HTML. @param richAvailable - Whether HTML imported as safe visible Writer content. @param plainAvailable - Whether plain text exists. @returns Preferred supported format. */
  public static SelectPasteFormat(
    richAvailable: boolean,
    plainAvailable: boolean,
  ): "html" | "plain-text" | undefined {
    if (richAvailable) return "html";
    return plainAvailable ? "plain-text" : undefined;
  }

  /** Writes the current selection through a caller-owned transfer port. @param write - Platform write operation. @returns Completion after the write. */
  public Copy(
    write: (selection: WriterClipboardSelection) => void | Promise<void>,
  ): void | Promise<void> {
    const selection = this.CreateSelection();
    if (selection === undefined) throw new WriterTransferError();
    return write(selection);
  }

  /** Copies before deleting, matching upstream SwTransferable::Cut. @param write - Platform write operation. @returns Completion after a successful cut. */
  public Cut(
    write: (selection: WriterClipboardSelection) => void | Promise<void>,
  ): void | Promise<void> {
    const pam = this.shell.GetCursor();
    const point = pam.GetPoint();
    const mark = pam.GetMark();
    const expected = {
      markNode: mark.GetNode(),
      markOffset: mark.GetContentIndex(),
      pointNode: point.GetNode(),
      pointOffset: point.GetContentIndex(),
    };
    const result = this.Copy(write);
    if (result === undefined) {
      this.DeleteSelection(expected);
      return;
    }
    return result.then(
      /** Removes the selection only after the platform accepts the transfer. @returns Nothing. */ () => {
        this.DeleteSelection(expected);
      },
    );
  }

  /** Inserts an imported transfer into the current Writer target pool and PaM. @param paste - Sanitized transfer record. @returns Whether the document changed. */
  public Paste(paste: WriterTransferDocument): boolean {
    if (paste.source === "plain-text" && this.shell.HasBoxSelection())
      return this.shell.PastePlainTextAtCursor(
        paste.paragraphs
          .map(
            /** Coordinates native ASCII insertion and retained history. @param item - Native operation input. @returns Operation result. */ (
              item,
            ) => getWriterTextFromRuns(item.runs),
          )
          .join("\n"),
      );
    const paragraph = this.shell.GetActiveParagraph();
    return this.shell.PasteAtCursor({
      isBlock: paste.isBlock,
      paragraphs: paste.paragraphs.map(
        /** Constructs a native paragraph in the target document pool. @param item - Imported paragraph. @returns Native paste paragraph. */ (
          item,
        ) => ({
          fragment: createWriterTextFragment(paragraph, item.runs),
          listKind: item.listKind,
          listLevel: item.listLevel,
        }),
      ),
    });
  }

  /** Deletes only the range whose content was transferred, including after an asynchronous browser write. @param expected - Point and mark at transfer time. @returns Nothing. */
  private DeleteSelection(
    expected: Readonly<{
      markNode: SwNode;
      markOffset: number;
      pointNode: SwNode;
      pointOffset: number;
    }>,
  ): void {
    const pam = this.shell.GetCursor();
    if (
      !pam.HasMark() ||
      pam.GetPoint().GetNode() !== expected.pointNode ||
      pam.GetPoint().GetContentIndex() !== expected.pointOffset ||
      pam.GetMark().GetNode() !== expected.markNode ||
      pam.GetMark().GetContentIndex() !== expected.markOffset ||
      !this.shell.DeleteSelection()
    )
      throw new WriterTransferError();
  }

  /** Serializes the canonical Writer selection through the bounded HTML/ASCII writers. @returns Paired MIME payload or undefined for an empty selection. */
  public CreateSelection(): WriterClipboardSelection | undefined {
    const document = this.shell.GetDoc();
    const pam = this.shell.GetCursor();
    if (!pam.HasMark()) return undefined;
    if (pam.GetPoint().GetNode().GetNodes() !== document.GetNodes()) return undefined;
    const first = pam.Start(),
      last = pam.End();
    if (first.compare(last) === 0) return undefined;
    const paragraphs = document
      .GetNodes()
      .entries()
      .slice(first.GetNodeIndex(), last.GetNodeIndex() + 1)
      .filter(
        /** Retains text owners from the actual native range, including cells and empty paragraphs. @param node - Connected native node. @returns Whether the node owns text. */
        (node): node is SwTextNode => node.IsTextNode(),
      )
      .map(
        /** Prepares one selected model paragraph. @param paragraph - Selected text node. @returns Format-writer paragraph input. */ (
          paragraph,
        ): WriterTransferParagraph => {
          const start = paragraph === first.GetNode() ? first.GetContentIndex() : 0;
          const end = paragraph === last.GetNode() ? last.GetContentIndex() : paragraph.Len();
          const runs = getSelectedRuns(paragraph, start, end);
          const complete = start === 0 && end === paragraph.Len();
          const listKind = complete ? paragraph.GetListKind() : "none";
          const number = listKind === "numbered" ? paragraph.GetListItemNumber() : undefined;
          const marker =
            listKind === "bullet"
              ? getWriterNumFormatBullet(paragraph.GetNumRule()?.Get(paragraph.GetAttrListLevel()))
              : number === undefined
                ? undefined
                : `${number}.`;
          return {
            html: serializeRuns(runs),
            listKind,
            listLevel: complete ? paragraph.GetAttrListLevel() : 0,
            marker,
            style: getModelParagraphStyle(paragraph),
            text: runs
              .map(
                /** Reads one selected run's text. @param run - Selected run. @returns Visible text. */ (
                  run,
                ) => run.text,
              )
              .join(""),
          };
        },
      );
    const asciiWriter = new SwASCWriter();
    asciiWriter.m_bWriteClipboardDoc = true;
    return {
      html: serializeWriterClipboardHtml(paragraphs),
      plainText: asciiWriter.Write(pam),
    };
  }
}

/** Copies a normalized run slice without mutating the source node. @param paragraph - Source text node. @param start - Inclusive UTF-16 offset. @param end - Exclusive UTF-16 offset. @returns Selected normalized runs. */
function getSelectedRuns(
  paragraph: SwTextNode,
  start: number,
  end: number,
): readonly WriterTextRun[] {
  const fromStart = splitWriterTextRuns(projectWriterTextRuns(paragraph), start).suffix;
  return splitWriterTextRuns(fromStart, end - start).prefix;
}

/** Serializes modeled inline attributes without consulting DOM descendants. @param runs - Canonical selected runs. @returns Escaped bounded HTML fragment. */
function serializeRuns(runs: readonly WriterTextRun[]): string {
  return runs
    .map(
      /** Serializes one canonical run. @param run - Selected text run. @returns Escaped semantic HTML. */ (
        run,
      ) => {
        let html = escapeWriterClipboardHtml(run.text);
        if (run.attributes.bold) html = `<strong>${html}</strong>`;
        if (run.attributes.italic) html = `<em>${html}</em>`;
        if (run.hyperlink !== undefined)
          html = `<a href="${escapeWriterClipboardHtml(run.hyperlink.url)}">${html}</a>`;
        const styles = [
          run.attributes.color === undefined || run.attributes.color === "auto"
            ? ""
            : `color: ${run.attributes.color}`,
          getClipboardHighlightStyle(run.attributes.highlight),
          run.attributes.underline ? "text-decoration: underline" : "",
          run.attributes.fontFamily === undefined
            ? ""
            : `font-family: ${escapeWriterClipboardHtml(run.attributes.fontFamily)}`,
        ].filter(Boolean);
        return styles.length === 0 ? html : `<span style="${styles.join("; ")}">${html}</span>`;
      },
    )
    .join("");
}

/** Serializes one Writer highlight for bounded HTML transfer. @param highlight - Effective Writer highlight. @returns CSS declaration or empty text. */
function getClipboardHighlightStyle(highlight: string | undefined): string {
  if (highlight === undefined) return "";
  /* v8 ignore next -- Transparent highlight omission is exercised at the ODT and browser-render boundaries; native clipboard selection cannot author this state directly. */
  if (highlight === "transparent") return "";
  return `background-color: ${highlight}`;
}

/** Projects the bounded paragraph attributes used by the clipboard writer. @param paragraph - Canonical text node. @returns Inline paragraph CSS used by the HTML writer. */
function getModelParagraphStyle(paragraph: SwTextNode): string {
  const heading = paragraph.GetParagraphStyle() === "heading-1";
  return `text-align: ${paragraph.GetParagraphAlignment()}; font-size: ${heading ? "1.5rem" : "1rem"}; font-weight: ${heading ? "700" : "400"}; line-height: ${heading ? "2.25rem" : "1.75rem"};`;
}

/** Escapes canonical Writer text before it becomes clipboard HTML. @param text - Untrusted model text. @returns HTML-safe text. */
function escapeWriterClipboardHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** One native Writer paragraph prepared by an outer transfer adapter. */
export interface WriterPasteParagraph {
  readonly fragment: SwTextFragment;
  readonly listKind: "bullet" | "none" | "numbered";
  readonly listLevel: number;
}

/** Native text-plus-hints transfer accepted by the Writer shell. */
export interface WriterPasteDocument {
  readonly isBlock: boolean;
  readonly paragraphs: readonly WriterPasteParagraph[];
}

/** Inserts one sanitized transfer document through its actual native shell owner. @param paste - Parsed clipboard content. @param shell - Actual native cursor, document and history owner. @returns Whether content or list formatting changed. */
export function pasteWriterTransfer(paste: WriterPasteDocument, shell: SwWrtShell): boolean {
  const manager = shell.GetDoc().GetUndoManager(),
    cursor = shell.GetCursor(),
    first = paste.paragraphs[0];
  if (first === undefined) return false;
  let changed = false;
  manager.EnterListAction("Paste");
  try {
    if (cursor.HasMark()) {
      shell.DelRight();
      changed = true;
    }
    const insertionPoint = cursor.GetPoint();
    const range: WriterTextRange = {
      end: insertionPoint.GetContentIndex(),
      node: insertionPoint.GetNode() as WriterParagraph,
      start: insertionPoint.GetContentIndex(),
    };
    const firstFragment = first.fragment;
    changed = shell.ReplaceRange(range, firstFragment) || changed;
    let paragraph = range.node;
    let offset = range.start + firstFragment.text.length;
    shell.SetCursor(new SwPosition(paragraph, offset));
    if (paste.isBlock) changed = applyPastedParagraphList(shell, first) || changed;
    for (const pastedParagraph of paste.paragraphs.slice(1)) {
      paragraph = shell.SplitParagraph(new SwPosition(paragraph, offset));
      changed = true;
      const fragment = pastedParagraph.fragment;
      changed = shell.ReplaceRange({ end: 0, node: paragraph, start: 0 }, fragment) || changed;
      offset = fragment.text.length;
      shell.SetCursor(new SwPosition(paragraph, offset));
      changed = applyPastedParagraphList(shell, pastedParagraph) || changed;
    }
  } finally {
    manager.LeaveListAction();
  }
  return changed;
}

/** Applies imported list metadata through Writer numbering undo. @param paragraph - Parsed clipboard paragraph. @param shell - Actual native list and history owner. @returns Whether changed. */
function applyPastedParagraphList(shell: SwWrtShell, paragraph: WriterPasteParagraph): boolean {
  const target = shell.GetActiveParagraph();
  const nextList = { kind: paragraph.listKind, level: paragraph.listLevel } as const;
  if (target.GetListKind() === nextList.kind && target.GetAttrListLevel() === nextList.level)
    return false;
  const cursor = shell.CaptureCursorState();
  return shell.ApplyAction(
    new SwUndoInsNum(
      target,
      target.CaptureListItems(),
      createWriterListItemSet(target, nextList),
      cursor,
      cursor,
    ),
  );
}
