/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
import { useCallback, useSyncExternalStore } from "react";

import { WriterCommandToolbar } from "../../../browser/presentation/WriterCommandToolbar";
import { WriterFormattingToolbar } from "../../../browser/presentation/WriterFormattingToolbar";
import { WriterMenuBar } from "../../../browser/presentation/WriterMenuBar";
import { WriterParagraphProperties } from "../../../browser/presentation/WriterPropertiesPanel";
import { WriterWorkspaceChrome } from "../../../browser/presentation/WriterWorkspaceChrome";
import { useWriterCommandShortcuts } from "../../../browser/accelerators/writer-shortcuts";
import {
  getWriterCollapsedParagraphCaret,
  getWriterDomSelection,
  getWriterSameParagraphSelection,
} from "../../../browser/editor/writer-selection";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { readWriterClipboardPaste, createWriterClipboardSelection } from "../dochdl/swdtflvr";
import { WriterPlainTextEditor } from "../docvw/edtwin";
import type { WriterParagraphTextRange } from "../wrtsh/wrtsh";
import type {
  SwView,
  WriterCutCommandArguments,
  WriterPasteCommandArguments,
} from "./view-session";

/** Properties selecting a persistent Writer view for projection. */
export interface WriterWorkbenchProps {
  readonly isActive: boolean;
  readonly view: SwView;
}

/** Projects one Writer view through browser presenters. @param props - Active view selection. @returns Writer workspace. */
export function WriterWorkbench({ isActive, view }: WriterWorkbenchProps): React.JSX.Element {
  const snapshot = useSyncExternalStore(view.Subscribe, view.GetSnapshot, view.GetSnapshot);
  const wrtShell = view.GetWrtShell();

  const resolveCommandArguments = useCallback(
    /** Resolves browser selection-dependent command arguments. @param commandId - Stable command identity. @returns Browser-derived command arguments. */
    function resolveWriterCommandArguments(commandId: string): unknown {
      const selection = globalThis.getSelection();
      const cursor = getWriterDomSelection(selection);
      if (cursor !== undefined) wrtShell.SetSelection(cursor);
      if (commandId === WRITER_COMMAND_IDS.copy)
        return { selection: createWriterClipboardSelection(selection) };
      if (commandId === WRITER_COMMAND_IDS.cut) return createWriterCutCommandArguments(selection);
      if (commandId === WRITER_COMMAND_IDS.paste)
        return { range: getWriterPasteRange(selection, wrtShell.GetActiveParagraph()) };
      return undefined;
    },
    [wrtShell],
  );

  useWriterCommandShortcuts({
    dispatcher: view.GetViewFrame().GetDispatcher(),
    isActive,
    resolveArguments: resolveCommandArguments,
  });

  /** Dispatches an already browser-handled native Cut. @param range - Selected model range. @returns Nothing. */
  function executeNativeCut(range: WriterParagraphTextRange): void {
    view.Execute(WRITER_COMMAND_IDS.cut, { clipboardHandled: true, range });
  }

  /** Dispatches an already browser-handled native Paste. @param range - Replacement range. @param clipboardData - Native clipboard data. @returns Nothing. */
  function executeNativePaste(range: WriterParagraphTextRange, clipboardData: DataTransfer): void {
    const paste = readWriterClipboardPaste(clipboardData);
    view.Execute(WRITER_COMMAND_IDS.paste, {
      clipboardHandled: true,
      range,
      ...(paste === undefined ? {} : { paste }),
    } satisfies WriterPasteCommandArguments);
  }

  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={snapshot.documentState.title}
        formattingToolbar={
          <WriterFormattingToolbar
            commandSource={view}
            resolveArguments={resolveCommandArguments}
          />
        }
        isHorizontalRulerVisible={snapshot.isHorizontalRulerVisible}
        isPropertiesSidebarVisible={snapshot.isPropertiesSidebarVisible}
        isStatusBarVisible={snapshot.isStatusBarVisible}
        menuBar={<WriterMenuBar commandSource={view} resolveArguments={resolveCommandArguments} />}
        propertiesSidebar={
          <WriterParagraphProperties
            alignment={snapshot.activeParagraph.alignment}
            listKind={snapshot.activeParagraph.list.kind}
            paragraphNumber={snapshot.activeParagraphIndex + 1}
            style={snapshot.activeParagraph.style}
          />
        }
        status={snapshot.storageStatus}
        toolbar={
          <WriterCommandToolbar commandSource={view} resolveArguments={resolveCommandArguments} />
        }
      >
        <WriterPlainTextEditor
          activeParagraphId={snapshot.activeParagraph.id}
          cursorSelection={snapshot.cursorSelection}
          onBeforeInput={wrtShell.HandleInput.bind(wrtShell)}
          onCompositionEnd={wrtShell.EndComposition.bind(wrtShell)}
          onCompositionStart={wrtShell.StartComposition.bind(wrtShell)}
          onCompositionUpdate={wrtShell.UpdateComposition.bind(wrtShell)}
          onParagraphFocus={wrtShell.FocusParagraph.bind(wrtShell)}
          onSelectAll={
            /** Dispatches document-wide selection from the editor adapter. @returns Dispatch result discarded by React. */ () =>
              view.Execute(WRITER_COMMAND_IDS.selectAll)
          }
          onSelectionChange={wrtShell.SetSelection.bind(wrtShell)}
          onTextChange={wrtShell.InsertText.bind(wrtShell)}
          onTextCut={executeNativeCut}
          onTextPaste={executeNativePaste}
          paragraphs={snapshot.document.paragraphs}
          projectionVersion={snapshot.viewVersion}
        />
      </WriterWorkspaceChrome>
    </div>
  );
}

/** Resolves a paste target from DOM selection or the active paragraph. @param selection - Current browser selection. @param activeParagraph - Shell fallback paragraph. @returns Model text range. */
function getWriterPasteRange(
  selection: Selection | null,
  activeParagraph: Readonly<{ id: string; text: string }>,
): WriterParagraphTextRange {
  const selectedRange = getWriterSameParagraphSelection(selection);
  if (selectedRange !== undefined) return selectedRange;
  const caret = getWriterCollapsedParagraphCaret(selection);
  return caret === undefined
    ? {
        end: activeParagraph.text.length,
        paragraphId: activeParagraph.id,
        start: activeParagraph.text.length,
      }
    : { end: caret.offset, paragraphId: caret.paragraphId, start: caret.offset };
}

/** Creates exact-optional Cut arguments. @param selection - Current browser selection. @returns Sanitized arguments. */
function createWriterCutCommandArguments(selection: Selection | null): WriterCutCommandArguments {
  const range = getWriterSameParagraphSelection(selection);
  const clipboardSelection = createWriterClipboardSelection(selection);
  return {
    ...(range === undefined ? {} : { range }),
    ...(clipboardSelection === undefined ? {} : { selection: clipboardSelection }),
  };
}
