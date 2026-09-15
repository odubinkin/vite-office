/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { WriterMenuBar } from "./WriterMenuBar";
import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";
import { WriterParagraphProperties } from "./WriterPropertiesPanel";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import { useWriterCommandShortcuts } from "../accelerators/writer-shortcuts";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";
import { readBrowserWriterClipboardPaste } from "../editor/writer-clipboard-events";
import { WriterPlainTextEditor } from "../../source/uibase/docvw/edtwin";
import type { WriterCursorSelection } from "../../source/uibase/wrtsh/wrtsh";
import type { SwView, WriterPasteCommandArguments } from "../../source/uibase/uiview/view";
import type { WriterCommandSource } from "./command-surface";
import type { WriterHyperlink } from "../../source/core/txtnode/fmtinfmt";

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
  const handleSelectAll = useCallback(
    /** Dispatches the canonical Select All command. @returns Nothing. */ () => {
      view.Execute(WRITER_COMMAND_IDS.selectAll);
    },
    [view],
  );

  const resolveCommandArguments = useCallback(
    /** Resolves command arguments without reading the rendered DOM. @param commandId - Stable command identity. @returns No browser-derived arguments. */
    function resolveWriterCommandArguments(commandId: string): undefined {
      void commandId;
      return undefined;
    },
    [],
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

  const createNativeTransfer = useCallback(
    /** Serializes the shell-owned SwPaM without consulting rendered descendants. @returns Model transfer data, if selected. */
    function createNativeTransfer(): WriterClipboardSelection | undefined {
      return wrtShell.CreateTransferable().CreateSelection();
    },
    [wrtShell],
  );

  const executeNativeCut = useCallback(
    /** Dispatches an already browser-handled native Cut against the shell-owned SwPaM. @returns Nothing. */
    function dispatchNativeCut(): void {
      view.Execute(WRITER_COMMAND_IDS.cut, { clipboardHandled: true });
    },
    [view],
  );

  const executeNativePaste = useCallback(
    /** Dispatches an already browser-handled native Paste. @param selection - Replacement selection. @param clipboardData - Native clipboard data. @returns Nothing. */
    function dispatchNativePaste(clipboardData: DataTransfer): void {
      const paste = readBrowserWriterClipboardPaste(clipboardData, globalThis.document);
      view.Execute(WRITER_COMMAND_IDS.paste, {
        clipboardHandled: true,
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
        status={presentWriterStatus(view, snapshot)}
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
          onCreateTransfer={createNativeTransfer}
          onParagraphFocus={handleParagraphFocus}
          onSelectAll={handleSelectAll}
          onSelectionChange={handleSelectionChange}
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

/** Formats command completion and shell/medium state at the browser presentation boundary. @param view - Active Writer view. @param snapshot - Current projection. @returns Status text. */
function presentWriterStatus(view: SwView, snapshot: ReturnType<SwView["GetSnapshot"]>): string {
  const commandError = presentWriterCommandError(view);
  if (commandError !== undefined) return commandError;
  const operation = snapshot.mediumOperation;
  if (operation.state === "failed") return operation.message ?? "Document operation failed.";
  if (operation.state === "pending") return "Document operation in progress.";
  if (operation.operation === "save" || operation.operation === "save-as")
    return operation.state === "succeeded" ? "Saved locally in this browser." : "Saving document.";
  if (operation.operation === "open" && operation.state === "succeeded") return "Document opened.";
  return snapshot.documentState.isModified
    ? "Document has unsaved changes."
    : "Not saved in this browser.";
}

/** Resolves explicit Sfx command failures into browser presentation text. @param view - Active Writer view. @returns Status text, if a command failed. */
function presentWriterCommandError(view: SwView): string | undefined {
  const failure = view.GetViewFrame().GetDispatcher().GetLastCommandError();
  if (failure === undefined) return undefined;
  const errors: readonly Readonly<{
    commandId: string;
    present: (error: string) => string;
  }>[] = [
    {
      commandId: WRITER_COMMAND_IDS.openOdt,
      present:
        /** Presents an ODT-open failure. @param error - Failure text. @returns Status text. */ (
          error,
        ) => `Could not open ODT: ${error}`,
    },
    {
      commandId: WRITER_COMMAND_IDS.openLocal,
      present: /** Presents a local-load failure. @returns Status text. */ () =>
        "Could not load local copy.",
    },
    {
      commandId: WRITER_COMMAND_IDS.saveOdt,
      present:
        /** Presents an ODT-save failure. @param error - Failure text. @returns Status text. */ (
          error,
        ) => `Could not save ODT: ${error}`,
    },
    {
      commandId: WRITER_COMMAND_IDS.exportText,
      present: /** Presents an export failure. @returns Status text. */ () =>
        "Could not start plain-text download.",
    },
    {
      commandId: WRITER_COMMAND_IDS.saveLocal,
      present:
        /** Presents a local-save failure. @param error - Failure text. @returns Status text. */ (
          error,
        ) => (error === "Browser storage is unavailable." ? error : "Could not save locally."),
    },
    {
      commandId: WRITER_COMMAND_IDS.copy,
      present: /** Presents a Copy failure. @param error - Failure text. @returns Status text. */ (
        error,
      ) => (error === "Select text to copy." ? error : "Could not copy selection."),
    },
    {
      commandId: WRITER_COMMAND_IDS.cut,
      present: /** Presents a Cut failure. @param error - Failure text. @returns Status text. */ (
        error,
      ) => (error === "Select text to cut." ? error : "Could not copy selection."),
    },
    {
      commandId: WRITER_COMMAND_IDS.paste,
      present: /** Presents a Paste failure. @param error - Failure text. @returns Status text. */ (
        error,
      ) =>
        error === "Clipboard has no text to paste." ? error : "Could not read browser clipboard.",
    },
  ];
  for (const candidate of errors) {
    if (candidate.commandId === failure.commandId) return candidate.present(failure.error);
  }
  /* v8 ignore next -- an attached SwView dispatcher contains only the exhaustively mapped Writer commands above. */
  return failure.error;
}
