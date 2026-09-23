/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterRulers } from "./WriterRulers";
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
import { WriterPlainTextEditor } from "../editor/WriterPlainTextEditor";
import type { SwView } from "../../source/uibase/uiview/view";
import { WriterViewStore, type WriterViewSnapshot } from "./writer-view-projection";

/** Properties selecting a persistent Writer view for projection. */
export interface WriterWorkbenchProps {
  readonly isActive: boolean;
  readonly view: SwView;
  readonly viewStore?: WriterViewStore;
}

/** Projects one Writer view through browser presenters. @param props - Active view selection. @returns Writer workspace. */
export function WriterWorkbench({
  isActive,
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
            commandSource={commandSource}
            listKind={snapshot.activeParagraph.list.kind}
            paragraphNumber={snapshot.activeParagraphIndex + 1}
            resolveArguments={resolveCommandArguments}
            styleDisplayName={snapshot.activeParagraph.styleDisplayName}
          />
        }
        rulers={
          <WriterRulers
            horizontalVisible={snapshot.isHorizontalRulerVisible}
            onPageChange={
              /** Applies ruler-owned page geometry. @param pageDescriptor - Replacement descriptor. @returns Nothing. */ (
                pageDescriptor,
              ) => {
                view.GetWrtShell().SetPageDescriptor(pageDescriptor);
              }
            }
            onParagraphIndentChange={
              /** Applies ruler-owned direct paragraph indents. @param value - Replacement indents. @returns Nothing. */ (
                value,
              ) => {
                view.GetWrtShell().SetParagraphRulerIndents(value);
              }
            }
            page={snapshot.pageDescriptor}
            paragraph={snapshot.activeParagraph}
            verticalVisible={snapshot.isVerticalRulerVisible}
          />
        }
        status={presentWriterStatus(view, snapshot, localization.GetText.bind(localization))}
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
          editWindow={view.GetEditWin()}
          pageDescriptor={snapshot.pageDescriptor}
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
      {dialogRequest?.request.kind !== "page-style" ? null : (
        <WriterPageStyleDialog
          initialValue={dialogRequest.request.initialValue}
          onCancel={
            /** Cancels the exact Page Style request. @returns Nothing. */ () =>
              dialogController.Cancel(dialogRequest.id)
          }
          onSubmit={
            /** Completes the exact Page Style request. @param pageDescriptor - Accepted geometry. @returns Nothing. */ (
              pageDescriptor,
            ) => {
              dialogController.Complete(dialogRequest.id, { pageDescriptor });
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
