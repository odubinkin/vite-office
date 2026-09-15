/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { WriterCommandToolbar } from "../../../browser/presentation/WriterCommandToolbar";
import { WriterFormattingToolbar } from "../../../browser/presentation/WriterFormattingToolbar";
import { WriterMenuBar } from "../../../browser/presentation/WriterMenuBar";
import { WriterHyperlinkDialog } from "../../../browser/presentation/WriterHyperlinkDialog";
import { WriterParagraphProperties } from "../../../browser/presentation/WriterPropertiesPanel";
import { WriterWorkspaceChrome } from "../../../browser/presentation/WriterWorkspaceChrome";
import { presentWriterOperationStatus } from "../../../browser/workflows/writer-workflows";
import { useWriterCommandShortcuts } from "../../../browser/accelerators/writer-shortcuts";
import { getWriterDomSelection } from "../../../browser/editor/writer-selection";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { readWriterClipboardPaste, createWriterClipboardSelection } from "../dochdl/swdtflvr";
import { WriterPlainTextEditor } from "../docvw/edtwin";
import type { WriterCursorSelection } from "../wrtsh/wrtsh";
import type {
  SwView,
  WriterCutCommandArguments,
  WriterPasteCommandArguments,
} from "./view-session";
import type { WriterCommandSource } from "../../../browser/presentation/command-surface";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";

/** Properties selecting a persistent Writer view for projection. */
export interface WriterWorkbenchProps {
  readonly isActive: boolean;
  readonly view: SwView;
}

/** Projects one Writer view through browser presenters. @param props - Active view selection. @returns Writer workspace. */
export function WriterWorkbench({ isActive, view }: WriterWorkbenchProps): React.JSX.Element {
  const [hyperlinkDialog, setHyperlinkDialog] = useState<{
    readonly commandId: string;
    readonly initialHyperlink?: WriterHyperlink;
  }>();
  const snapshot = useSyncExternalStore(view.Subscribe, view.GetSnapshot, view.GetSnapshot);
  const wrtShell = view.GetWrtShell();
  const handleBeforeInput = useCallback(
    /** Dispatches one normalized edit intent. @param inputType - Browser input type. @param data - Optional browser payload. @returns Whether Writer handled the intent. */
    (inputType: string, data: string | null): boolean => wrtShell.HandleInput(inputType, data),
    [wrtShell],
  );
  const handleCompositionEnd = useCallback(
    /** Commits the active IME transaction. @returns Whether Writer changed. */ () =>
      wrtShell.EndComposition(),
    [wrtShell],
  );
  const handleCompositionStart = useCallback(
    /** Starts transient shell IME state. @returns Nothing. */ () => wrtShell.StartComposition(),
    [wrtShell],
  );
  const handleCompositionUpdate = useCallback(
    /** Updates transient IME text. @param text - Current composed text. @returns Nothing. */
    (text: string): void => wrtShell.UpdateComposition(text),
    [wrtShell],
  );
  const handleParagraphFocus = useCallback(
    /** Moves the shell cursor to a focused projection. @param paragraphId - Stable Writer paragraph ID. @returns Nothing. */
    (paragraphId: string): void => wrtShell.FocusParagraph(paragraphId),
    [wrtShell],
  );
  const handleSelectionChange = useCallback(
    /** Stores native selection endpoints as the shell PaM. @param selection - Canonical Writer endpoints. @returns Whether the selection changed. */
    (selection: WriterCursorSelection): boolean => wrtShell.SetSelection(selection),
    [wrtShell],
  );
  const handleTextChange = useCallback(
    /** Reconciles one unsupported native paragraph mutation. @param paragraphId - Stable Writer paragraph ID. @param text - Mutated visible text. @param caretOffset - Optional caret offset. @param inputType - Unsupported browser input type. @returns Nothing. */
    (
      paragraphId: string,
      text: string,
      caretOffset: number | undefined,
      inputType: string,
    ): void => {
      wrtShell.InsertText(paragraphId, text, caretOffset, inputType);
    },
    [wrtShell],
  );
  const handleSelectAll = useCallback(
    /** Dispatches the canonical Select All command. @returns Nothing. */ () => {
      view.Execute(WRITER_COMMAND_IDS.selectAll);
    },
    [view],
  );

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
        return cursor === undefined ? undefined : { cursorSelection: cursor };
      return undefined;
    },
    [wrtShell],
  );

  const commandSource = useMemo<WriterCommandSource>(
    /** Intercepts dialog-opening commands while leaving execution in the shared dispatcher. @returns Presentation command source. */
    () => ({
      /** Executes or presents one command. @param commandId - Command identity. @param arguments_ - Optional payload. @returns Dispatch result. */
      Execute(commandId, arguments_) {
        if (
          commandId === WRITER_COMMAND_IDS.hyperlinkDialog ||
          commandId === WRITER_COMMAND_IDS.editHyperlink
        ) {
          resolveCommandArguments(commandId);
          const initialHyperlink = view.QueryState(commandId).value as WriterHyperlink | undefined;
          setHyperlinkDialog({
            commandId,
            ...(initialHyperlink === undefined ? {} : { initialHyperlink }),
          });
          return { commandId, status: "executed", value: undefined };
        }
        return view.Execute(commandId, arguments_);
      },
      QueryCommand:
        /** Reads a command descriptor. @param commandId - Command identity. @returns Descriptor or undefined. */
        (commandId) => view.QueryCommand(commandId),
      QueryState:
        /** Reads current command state. @param commandId - Command identity. @returns Command state. */
        (commandId) => view.QueryState(commandId),
    }),
    [resolveCommandArguments, view],
  );

  useWriterCommandShortcuts({
    dispatcher: view.GetViewFrame().GetDispatcher(),
    executeCommand: commandSource.Execute,
    isActive,
    resolveArguments: resolveCommandArguments,
  });

  const executeNativeCut = useCallback(
    /** Dispatches an already browser-handled native Cut. @param selection - Selected model range. @returns Nothing. */
    function dispatchNativeCut(selection: WriterCursorSelection): void {
      view.Execute(WRITER_COMMAND_IDS.cut, { clipboardHandled: true, cursorSelection: selection });
    },
    [view],
  );

  const executeNativePaste = useCallback(
    /** Dispatches an already browser-handled native Paste. @param selection - Replacement selection. @param clipboardData - Native clipboard data. @returns Nothing. */
    function dispatchNativePaste(
      selection: WriterCursorSelection,
      clipboardData: DataTransfer,
    ): void {
      const paste = readWriterClipboardPaste(clipboardData);
      view.Execute(WRITER_COMMAND_IDS.paste, {
        clipboardHandled: true,
        cursorSelection: selection,
        ...(paste === undefined ? {} : { paste }),
      } satisfies WriterPasteCommandArguments);
    },
    [view],
  );

  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={snapshot.documentState.title}
        formattingToolbar={
          <WriterFormattingToolbar
            commandSource={commandSource}
            resolveArguments={resolveCommandArguments}
          />
        }
        isHorizontalRulerVisible={snapshot.isHorizontalRulerVisible}
        isPropertiesSidebarVisible={snapshot.isPropertiesSidebarVisible}
        isStatusBarVisible={snapshot.isStatusBarVisible}
        menuBar={
          <WriterMenuBar commandSource={commandSource} resolveArguments={resolveCommandArguments} />
        }
        propertiesSidebar={
          <WriterParagraphProperties
            alignment={snapshot.activeParagraph.alignment}
            listKind={snapshot.activeParagraph.list.kind}
            paragraphNumber={snapshot.activeParagraphIndex + 1}
            style={snapshot.activeParagraph.style}
          />
        }
        status={presentWriterOperationStatus(snapshot.operationStatus)}
        toolbar={
          <WriterCommandToolbar
            commandSource={commandSource}
            resolveArguments={resolveCommandArguments}
          />
        }
      >
        <WriterPlainTextEditor
          activeParagraphId={snapshot.activeParagraph.id}
          cursorSelection={snapshot.cursorSelection}
          onBeforeInput={handleBeforeInput}
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onParagraphFocus={handleParagraphFocus}
          onSelectAll={handleSelectAll}
          onSelectionChange={handleSelectionChange}
          onTextChange={handleTextChange}
          onTextCut={executeNativeCut}
          onTextPaste={executeNativePaste}
          paragraphs={snapshot.paragraphs}
          projectionVersion={snapshot.viewVersion}
        />
      </WriterWorkspaceChrome>
      {hyperlinkDialog === undefined ? null : (
        <WriterHyperlinkDialog
          {...(hyperlinkDialog.initialHyperlink === undefined
            ? {}
            : { initialHyperlink: hyperlinkDialog.initialHyperlink })}
          onCancel={
            /** Closes the hyperlink dialog without changing the model. @returns Nothing. */ () =>
              setHyperlinkDialog(undefined)
          }
          onSubmit={
            /** Applies the hyperlink dialog payload. @param hyperlink - Link metadata. @param text - Optional inserted text. @returns Nothing. */
            (hyperlink, text) => {
              view.Execute(hyperlinkDialog.commandId, { hyperlink, text });
              setHyperlinkDialog(undefined);
            }
          }
        />
      )}
    </div>
  );
}

/** Creates exact-optional Cut arguments. @param selection - Current browser selection. @returns Sanitized arguments. */
function createWriterCutCommandArguments(selection: Selection | null): WriterCutCommandArguments {
  const clipboardSelection = createWriterClipboardSelection(selection);
  const cursorSelection = getWriterDomSelection(selection);
  return {
    ...(cursorSelection === undefined ? {} : { cursorSelection }),
    ...(clipboardSelection === undefined ? {} : { selection: clipboardSelection }),
  };
}
