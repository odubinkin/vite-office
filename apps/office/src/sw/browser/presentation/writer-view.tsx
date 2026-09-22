/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";
import { WriterParagraphProperties } from "./WriterPropertiesPanel";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import type { CommandFailure } from "../../../sfx2/source/control/dispatch";
import {
  createBrowserCommandSource,
  type BrowserCommandSource,
} from "../../../framework/browser/presentation/command-surface";
import { useCommandShortcuts } from "../../../framework/browser/presentation/use-command-shortcuts";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { writerBrowserMenuPlacements } from "./writer-command-surfaces";
import type { WriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";
import { readBrowserWriterClipboardPaste } from "../editor/writer-clipboard-events";
import { WriterPlainTextEditor } from "../editor/WriterPlainTextEditor";
import type { BrowserWriterEditPort } from "../editor/writer-edit-controller";
import type { WriterCursorSelection } from "../editor/writer-selection-types";
import type { SwView } from "../../source/uibase/uiview/view";
import type { WriterPasteCommandArguments } from "../workflows/writer-workflows";
import { WriterViewStore, type WriterViewSnapshot } from "./writer-view-projection";
import type { WriterRecoveryNotice } from "./WriterRecoveryPrompt";

/** Properties selecting a persistent Writer view for projection. */
export interface WriterWorkbenchProps {
  readonly isActive: boolean;
  /** Typed recovery result shown through the existing Writer footer status surface. */
  readonly recoveryNotice?: WriterRecoveryNotice;
  readonly view: SwView;
  readonly viewStore?: WriterViewStore;
}

/** Projects one Writer view through browser presenters. @param props - Active view selection. @returns Writer workspace. */
export function WriterWorkbench({
  isActive,
  recoveryNotice,
  view,
  viewStore,
}: WriterWorkbenchProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const [presentationStore] = useState(
    /** Reuses the session store or owns one browser-local store for an injected view. @returns Presentation store. */ () =>
      viewStore ?? new WriterViewStore(view),
  );
  useEffect(
    /** Releases only a store created by this component. @returns Optional cleanup. */ () =>
      viewStore === undefined
        ? /** Closes the component-owned store. @returns Nothing. */ () => presentationStore.Close()
        : undefined,
    [presentationStore, viewStore],
  );
  const snapshot = useSyncExternalStore(
    presentationStore.Subscribe,
    presentationStore.GetSnapshot,
    presentationStore.GetSnapshot,
  );
  const dialogController = view.GetDialogController();
  const dialogRequest = useSyncExternalStore(
    dialogController.Subscribe,
    dialogController.GetSnapshot,
    dialogController.GetSnapshot,
  );
  const wrtShell = view.GetWrtShell();
  const viewProjection = presentationStore.projection;
  const editPort = useMemo<Omit<BrowserWriterEditPort, "synchronizeSelection">>(
    /** Binds browser intent translation to Writer-native shell operations. @returns Stable edit port. */ () => ({
      deleteForward: /** Deletes after the Writer cursor. @returns Whether changed. */ () =>
        wrtShell.DelRight(),
      deleteLeft: /** Deletes before the Writer cursor. @returns Whether changed. */ () =>
        wrtShell.DelLeft(),
      /* v8 ignore next -- Wiring-only path; BrowserWriterEditController and SwWrtShell own coverage. */
      deleteSelection: /** Deletes the Writer selection. @returns Whether changed. */ () =>
        wrtShell.DeleteSelection(),
      insert:
        /** Inserts text at the Writer cursor. @param text - Browser text. @returns Whether changed. */ (
          text,
        ) => wrtShell.Insert(text),
      /* v8 ignore next -- Wiring-only path; BrowserWriterEditController and SwWrtShell own coverage. */
      redo: /** Redoes the last Writer edit. @returns Whether changed. */ () => wrtShell.Redo(),
      replace:
        /** Replaces the Writer selection. @param text - Browser text. @returns Whether changed. */ (
          text,
        ) => wrtShell.Replace(text),
      /* v8 ignore next -- Wiring-only path; BrowserWriterEditController and SwWrtShell own coverage. */
      setListKind:
        /** Sets the active Writer list kind. @param kind - List kind. @returns Whether changed. */ (
          kind,
        ) => wrtShell.SetParagraphListKind(kind),
      splitNode: /** Splits the active Writer node. @returns Whether changed. */ () =>
        wrtShell.SplitNode(),
      toggleCharacterFormat:
        /** Toggles direct Writer character formatting. @param format - Format. @returns Whether changed. */ (
          format,
        ) => wrtShell.ToggleCharacterFormat(format),
      /* v8 ignore next -- Wiring-only path; BrowserWriterEditController and SwWrtShell own coverage. */
      undo: /** Undoes the last Writer edit. @returns Whether changed. */ () => wrtShell.Undo(),
    }),
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
    (paragraphId: string): void =>
      void viewProjection.FocusParagraph(view.GetDocShell().GetDoc(), wrtShell, paragraphId),
    [view, viewProjection, wrtShell],
  );
  const handleSelectionChange = useCallback(
    /** Stores native selection endpoints as the shell PaM. @param selection - Canonical Writer endpoints. @returns Whether the selection changed. */
    (selection: WriterCursorSelection): boolean =>
      viewProjection.SetSelection(view.GetDocShell().GetDoc(), wrtShell, selection),
    [view, viewProjection, wrtShell],
  );
  const handleSelectAll = useCallback(
    /** Dispatches the canonical Select All command. @returns Nothing. */ () => {
      view.Execute(WRITER_COMMAND_IDS.selectAll);
    },
    [view],
  );
  const handleDocumentTitleChange = useCallback(
    /** Persists an inline-edited document title through the owning shell. @param title - Committed title. @returns Nothing. */
    (title: string): void => {
      view.GetDocShell().RenameDocument(title);
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

  const commandSource = useMemo<BrowserCommandSource>(
    /** Exposes the active frame without changing dispatch semantics. @returns Bindings-backed command source. */
    () => createBrowserCommandSource(view.GetViewFrame()),
    [view],
  );
  const getLocalizedCommandResource = useCallback(
    /** Resolves generated command metadata through the application locale service. @param commandUrl - Canonical command URL. @returns Localized resource. */
    (commandUrl: string) => {
      const resource = getWriterCommandResource(commandUrl);
      return {
        ...resource,
        controlLabel: localization.GetText(
          `writer.command.${commandUrl}.control-label`,
          resource.controlLabel,
        ),
        label: localization.GetText(`writer.command.${commandUrl}.label`, resource.label),
      };
    },
    [localization],
  );

  useCommandShortcuts({
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
            paragraphStyleOptions={snapshot.paragraphStyleOptions}
            resolveArguments={resolveCommandArguments}
          />
        }
        isPropertiesSidebarVisible={snapshot.isPropertiesSidebarVisible}
        isStatusBarVisible={snapshot.isStatusBarVisible}
        menuBar={
          <CommandMenuBar
            ariaLabel="Writer menu bar"
            commandSource={commandSource}
            getCommandResource={getLocalizedCommandResource}
            getMenuLabel={
              /** Localizes a generated menu label. @param id - Menu identity. @param fallback - Generated label. @returns Localized label. */ (
                id,
                fallback,
              ) => localization.GetText(`writer.menu.${id}.label`, fallback)
            }
            idPrefix="writer"
            menus={writerBrowserMenuPlacements}
            resolveArguments={resolveCommandArguments}
          />
        }
        onDocumentTitleChange={handleDocumentTitleChange}
        propertiesSidebar={
          <WriterParagraphProperties
            alignment={snapshot.activeParagraph.alignment}
            listKind={snapshot.activeParagraph.list.kind}
            paragraphNumber={snapshot.activeParagraphIndex + 1}
            style={snapshot.activeParagraph.style}
          />
        }
        status={
          (recoveryNotice === undefined
            ? undefined
            : presentWriterRecoveryNotice(
                recoveryNotice,
                localization.GetText.bind(localization),
              )) ?? presentWriterStatus(view, snapshot, localization.GetText.bind(localization))
        }
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
          editPort={editPort}
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
        />
      </WriterWorkspaceChrome>
      {dialogRequest?.request.kind !== "hyperlink" ? null : (
        <WriterHyperlinkDialog
          {...(dialogRequest.request.initialHyperlink === undefined
            ? {}
            : { initialHyperlink: dialogRequest.request.initialHyperlink })}
          onCancel={
            /** Cancels the exact shell-owned dialog request. @returns Nothing. */ () => {
              dialogController.Cancel(dialogRequest.id);
            }
          }
          onSubmit={
            /** Completes the exact shell-owned dialog request. @param hyperlink - Link metadata. @param text - Optional inserted text. @returns Nothing. */
            (hyperlink, text) => {
              dialogController.Complete(dialogRequest.id, {
                hyperlink,
                text,
              });
            }
          }
        />
      )}
    </div>
  );
}

/** Formats command completion and shell/medium state at the browser presentation boundary. @param view - Active Writer view. @param snapshot - Current projection. @param getText - Localization lookup. @returns Status text. */
function presentWriterStatus(
  view: SwView,
  snapshot: WriterViewSnapshot,
  getText: (messageId: string, fallback: string) => string,
): string {
  const commandError = presentWriterCommandError(view, getText);
  if (commandError !== undefined) return commandError;
  const operation = snapshot.mediumOperation;
  if (operation.state === "failed")
    return (
      operation.message ?? getText("writer.status.operation-failed", "Document operation failed.")
    );
  if (operation.state === "pending")
    return getText("writer.status.operation-pending", "Document operation in progress.");
  if (operation.operation === "save" || operation.operation === "save-as")
    return operation.state === "succeeded"
      ? getText("writer.status.saved-local", "Saved locally in this browser.")
      : getText("writer.status.saving", "Saving document.");
  if (operation.operation === "open" && operation.state === "succeeded")
    return getText("writer.status.opened", "Document opened.");
  return snapshot.documentState.isModified
    ? getText("writer.status.modified", "Document has unsaved changes.")
    : getText("writer.status.not-saved", "Not saved in this browser.");
}

/** Resolves explicit Sfx command failures into browser presentation text. @param view - Active Writer view. @param getText - Localization lookup. @returns Status text, if a command failed. */
function presentWriterCommandError(
  view: SwView,
  getText: (messageId: string, fallback: string) => string,
): string | undefined {
  const failure = view.GetViewFrame().GetDispatcher().GetLastCommandError();
  if (failure === undefined) return undefined;
  const errors: readonly Readonly<{
    commandId: string;
    present: (failure: CommandFailure) => string;
  }>[] = [
    {
      commandId: WRITER_COMMAND_IDS.openOdt,
      present:
        /** Presents an ODT-open failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) => `${getText("writer.error.open-odt", "Could not open ODT")}: ${commandFailure.error}`,
    },
    {
      commandId: WRITER_COMMAND_IDS.openLocal,
      present: /** Presents a local-load failure. @returns Status text. */ () =>
        getText("writer.error.open-local", "Could not load local copy."),
    },
    {
      commandId: WRITER_COMMAND_IDS.saveOdt,
      present:
        /** Presents an ODT-save failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) => `${getText("writer.error.save-odt", "Could not save ODT")}: ${commandFailure.error}`,
    },
    {
      commandId: WRITER_COMMAND_IDS.exportText,
      present: /** Presents an export failure. @returns Status text. */ () =>
        getText("writer.error.export-text", "Could not start plain-text download."),
    },
    {
      commandId: WRITER_COMMAND_IDS.saveLocal,
      present:
        /** Presents a local-save failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "storage-unavailable"
            ? getText("writer.error.storage-unavailable", "Browser storage is unavailable.")
            : getText("writer.error.save-local", "Could not save locally."),
    },
    {
      commandId: WRITER_COMMAND_IDS.copy,
      present:
        /** Presents a Copy failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "selection-required"
            ? getText("writer.error.copy-selection-required", "Select text to copy.")
            : getText("writer.error.copy", "Could not copy selection."),
    },
    {
      commandId: WRITER_COMMAND_IDS.cut,
      present:
        /** Presents a Cut failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "selection-required"
            ? getText("writer.error.cut-selection-required", "Select text to cut.")
            : getText("writer.error.cut", "Could not copy selection."),
    },
    {
      commandId: WRITER_COMMAND_IDS.paste,
      present:
        /** Presents a Paste failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "clipboard-empty"
            ? getText("writer.error.clipboard-empty", "Clipboard has no text to paste.")
            : getText("writer.error.paste", "Could not read browser clipboard."),
    },
  ];
  for (const candidate of errors) {
    if (candidate.commandId === failure.commandId) return candidate.present(failure);
  }
  /* v8 ignore next -- an attached SwView dispatcher contains only the exhaustively mapped Writer commands above. */
  return failure.error;
}

/** Localizes a typed recovery outcome at the presentation boundary. @param notice - Recovery result state. @param getText - Localization lookup. @returns Status text. */
function presentWriterRecoveryNotice(
  notice: WriterRecoveryNotice,
  getText: (messageId: string, fallback: string) => string,
): string {
  switch (notice.kind) {
    case "restored":
      return getText(
        "writer.recovery.restored",
        `Recovered document generation ${notice.generation}.`,
      ).replace("{generation}", String(notice.generation));
    case "discarded":
      return getText("writer.recovery.discarded", "Recovery data was discarded.");
    case "inspect-failed":
      return getText(
        "writer.recovery.inspect-failed",
        "Recovery data could not be inspected. A clean document was opened.",
      );
    case "discard-failed":
      return getText(
        "writer.recovery.discard-failed",
        "Recovery data could not be discarded. A clean document was opened.",
      );
    case "restore-damaged":
      return getText(
        "writer.recovery.damaged",
        "Recovery data is damaged. A clean document was opened.",
      );
    case "restore-missing":
      return getText(
        "writer.recovery.missing",
        "Recovery data is no longer available. A clean document was opened.",
      );
    case "restore-failed":
      return getText(
        "writer.recovery.failed",
        "Recovery data could not be restored. A clean document was opened.",
      );
  }
}
