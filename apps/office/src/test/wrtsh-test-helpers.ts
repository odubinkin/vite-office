/** @fileoverview Test-only adapters from legacy fixture IDs to canonical Writer positions. */

import { BrowserWriterEditController } from "../sw/browser/editor/writer-edit-controller";
import type { WriterCursorSelection } from "../sw/browser/editor/writer-selection-types";
import { SwPosition } from "../sw/source/core/crsr/pam";
import type { WriterHyperlink } from "../sw/source/core/txtnode/fmtinfmt";
import type { WriterCharacterFormat } from "../sw/source/core/txtnode/ndtxt";
import {
  createWriterTextFragment,
  type WriterTextRun,
} from "../sw/source/core/txtnode/text-run-projection";
import type { SwTextNode } from "../sw/source/core/txtnode/ndtxt";
import type { WriterClipboardPaste } from "../sw/source/filter/html/html-filter-types";
import type { SwWrtShell } from "../sw/source/uibase/wrtsh/wrtsh";

/** Resolves one fixture ID to a document-owned text node. @param shell - Test shell. @param id - Fixture node ID. @returns Text node. */
export function getTestParagraph(shell: SwWrtShell, id: string) {
  const ordinal = Number(/(\d+)$/.exec(id)?.[1]);
  const node = Number.isInteger(ordinal) ? shell.GetDoc().paragraphs[ordinal - 1] : undefined;
  if (node === undefined) throw new Error(`Unknown test paragraph: ${id}`);
  return node;
}

/** Collapses a test shell cursor by fixture ID. @param shell - Test shell. @param id - Fixture ID. @param offset - Content offset. @returns Whether cursor changed. */
export function setTestCursor(shell: SwWrtShell, id: string, offset: number): boolean {
  return shell.SetCursor(new SwPosition(getTestParagraph(shell, id), offset));
}

/** Installs projected fixture coordinates as a canonical SwPaM. @param shell - Test shell. @param selection - Test projection. @returns Whether cursor changed. */
export function setTestSelection(shell: SwWrtShell, selection: WriterCursorSelection): boolean {
  const point = new SwPosition(
    getTestParagraph(shell, selection.point.paragraphId),
    selection.point.offset,
  );
  const mark =
    selection.mark === undefined
      ? undefined
      : new SwPosition(getTestParagraph(shell, selection.mark.paragraphId), selection.mark.offset);
  return shell.SetPaM(point, mark);
}

/** Projects a test shell cursor to fixture coordinates. @param shell - Test shell. @returns Direction-preserving selection. */
export function getTestSelection(shell: SwWrtShell): WriterCursorSelection {
  const cursor = shell.GetCursor();
  const point = cursor.GetPoint();
  const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
  return {
    ...(mark === undefined
      ? {}
      : {
          mark: {
            offset: mark.GetContentIndex(),
            paragraphId: getNodeId(shell, mark.GetNode() as SwTextNode),
          },
        }),
    point: {
      offset: point.GetContentIndex(),
      paragraphId: getNodeId(shell, point.GetNode() as SwTextNode),
    },
  };
}

/** Executes one browser fixture intent through the real browser translation boundary. @param shell - Test shell. @param inputType - Input Events operation. @param data - Optional text. @returns Whether handled. */
export function handleTestInput(
  shell: SwWrtShell,
  inputType: string,
  data: string | null,
): boolean {
  const controller = new BrowserWriterEditController({
    deleteForward: /** Deletes forward through the fixture shell. @returns Whether changed. */ () =>
      shell.DelRight(),
    deleteLeft: /** Deletes backward through the fixture shell. @returns Whether changed. */ () =>
      shell.DelLeft(),
    deleteSelection: /** Deletes the fixture selection. @returns Whether changed. */ () =>
      shell.DeleteSelection(),
    insert: /** Inserts fixture text. @param text - Text. @returns Whether changed. */ (text) =>
      shell.Insert(text),
    redo: /** Redoes a fixture edit. @returns Whether changed. */ () => shell.Redo(),
    replace: /** Replaces the fixture selection. @param text - Text. @returns Whether changed. */ (
      text,
    ) => shell.Replace(text),
    setListKind: /** Sets fixture list kind. @param kind - List kind. @returns Whether changed. */ (
      kind,
    ) => shell.SetParagraphListKind(kind),
    splitNode: /** Splits the fixture node. @returns Whether changed. */ () => shell.SplitNode(),
    synchronizeSelection: /** Accepts the fixture selection. @returns Always true. */ () => true,
    toggleCharacterFormat:
      /** Toggles fixture formatting. @param format - Format. @returns Whether changed. */ (
        format,
      ) => shell.ToggleCharacterFormat(format),
    undo: /** Undoes a fixture edit. @returns Whether changed. */ () => shell.Undo(),
  });
  return controller.HandleIntent({ data, inputType }) === "handled";
}

/** Replaces one fixture-ID range through a canonical node range. @param shell - Test shell. @param range - Fixture range. @param runs - Replacement runs. @returns Whether changed. */
export function fixtureReplaceRange(
  shell: SwWrtShell,
  range: Readonly<{ end: number; paragraphId: string; start: number }>,
  runs: readonly WriterTextRun[],
): boolean {
  const paragraph = getTestParagraph(shell, range.paragraphId);
  return shell.ReplaceRange(
    { end: range.end, node: paragraph, start: range.start },
    createWriterTextFragment(paragraph, runs),
  );
}

/** Toggles formatting over one fixture range. @param shell - Test shell. @param format - Character format. @param range - Fixture range. @returns Whether changed. */
export function toggleTestFormat(
  shell: SwWrtShell,
  format: WriterCharacterFormat,
  range: Readonly<{ end: number; paragraphId: string; start: number }>,
): boolean {
  return shell.ToggleCharacterFormat(format, {
    end: range.end,
    node: getTestParagraph(shell, range.paragraphId),
    start: range.start,
  });
}

/** Applies a hyperlink over one fixture range. @param shell - Test shell. @param hyperlink - Link metadata. @param text - Optional text. @param range - Fixture range. @returns Whether changed. */
export function setTestHyperlink(
  shell: SwWrtShell,
  hyperlink: WriterHyperlink | undefined,
  text: string | undefined,
  range: Readonly<{ end: number; paragraphId: string; start: number }>,
): boolean {
  return shell.SetHyperlink(hyperlink, text, {
    end: range.end,
    node: getTestParagraph(shell, range.paragraphId),
    start: range.start,
  });
}

/** Splits one fixture paragraph. @param shell - Test shell. @param id - Fixture ID. @param offset - Split offset. @returns New fixture ID. */
export function fixtureSplitParagraph(shell: SwWrtShell, id: string, offset: number): string {
  return getNodeId(
    shell,
    shell.SplitParagraph(new SwPosition(getTestParagraph(shell, id), offset)),
  );
}

/** Joins a fixture paragraph into its predecessor. @param shell - Test shell. @param id - Fixture ID. @returns Whether changed. */
export function fixtureMergeParagraphWithPrevious(shell: SwWrtShell, id: string): boolean {
  return shell.MergeParagraphWithPrevious(getTestParagraph(shell, id));
}

/** Joins the successor of a fixture paragraph. @param shell - Test shell. @param id - Fixture ID. @returns Whether changed. */
export function fixtureMergeParagraphWithNext(shell: SwWrtShell, id: string): boolean {
  return shell.MergeParagraphWithNext(getTestParagraph(shell, id));
}

/** Pastes at one fixture selection. @param shell - Test shell. @param selection - Fixture selection. @param paste - Transfer document. @returns Whether changed. */
export function pasteTestSelection(
  shell: SwWrtShell,
  selection: WriterCursorSelection | Readonly<{ end: number; paragraphId: string; start: number }>,
  paste: WriterClipboardPaste,
): boolean {
  setTestSelection(
    shell,
    "start" in selection
      ? {
          ...(selection.start === selection.end
            ? {}
            : { mark: { offset: selection.start, paragraphId: selection.paragraphId } }),
          point: { offset: selection.end, paragraphId: selection.paragraphId },
        }
      : selection,
  );
  const paragraph = shell.GetActiveParagraph();
  return shell.Paste({
    isBlock: paste.isBlock,
    paragraphs: paste.paragraphs.map(
      /** Converts one browser transfer fixture before crossing the Writer shell boundary. @param item - Fixture paragraph. @returns Native paste paragraph. */ (
        item,
      ) => ({
        fragment: createWriterTextFragment(paragraph, item.runs),
        listKind: item.listKind,
        listLevel: item.listLevel,
      }),
    ),
  });
}

/** Reads an ordinal fixture ID from a canonical node without adding identity to Writer core. @param shell - Owning shell. @param node - Writer node. @returns Test ID. */
export function getNodeId(shell: SwWrtShell, node: SwTextNode): string {
  const index = shell.GetDoc().paragraphs.indexOf(node);
  if (index < 0) throw new Error("Expected connected test text node.");
  return `p-${index + 1}`;
}
