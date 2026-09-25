/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
/* eslint-disable react-refresh/only-export-components -- Pure presentation helpers are exported for focused behavior verification. */
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TableProperties } from "lucide-react";

import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { WriterAdvancedFormattingControls } from "./WriterAdvancedFormattingControls";
import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";
import { WriterBookmarkDialog } from "./WriterBookmarkDialog";
import { WriterInsertBreakDialog } from "./WriterInsertBreakDialog";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterTableDialog, type WriterTableDialogValue } from "./WriterTableDialog";
import { WriterLineNumberingDialog } from "./WriterLineNumberingDialog";
import { WriterFileDialog } from "./WriterFileDialog";
import type {
  WriterFileDialogController,
  WriterFileDialogKind,
} from "../workflows/writer-file-dialog-controller";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import type { WriterAutosaveController } from "../workflows/writer-autosave";
import { WriterRulers, WriterVerticalRuler } from "./WriterRulers";
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
import {
  WRITER_COMMAND_IDS,
  writerMenuPlacements,
} from "../../uiconfig/swriter/menubar/menubar-commands";
import { selectWriterCommandResource } from "./writer-command-presentation";
import { WriterPlainTextEditor } from "../editor/WriterPlainTextEditor";
import type { SwView } from "../../source/uibase/uiview/view";
import { WriterViewStore, type WriterViewSnapshot } from "./writer-view-projection";
import { installWriterEmbeddedFonts } from "../../../vcl/browser/embedded-font-loader";
import type { SwDoc } from "../../source/core/doc/doc";
import type { SwTable } from "../../source/core/table/swtable";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { createWriterInterface } from "../../sdi/swriter";

/** Properties selecting a persistent Writer view for projection. */
export interface WriterWorkbenchProps {
  readonly isActive: boolean;
  readonly view: SwView;
  readonly viewStore?: WriterViewStore;
  readonly fileDialogs?: WriterFileDialogController;
  readonly services?: WriterSessionServices;
  readonly autosave?: WriterAutosaveController;
}

const subscribeNoDialog =
  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ (): (() => void) =>
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ () =>
      undefined;
const getNoDialog =
  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ (): WriterFileDialogKind | undefined => undefined;

/** Projects one Writer view through browser presenters. @param props - Active view selection. @returns Writer workspace. */
export function WriterWorkbench({
  isActive,
  view,
  viewStore,
  fileDialogs,
  services,
  autosave,
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
  const activeDocument = view.GetDocShell().GetDoc();
  const [selectedTable, setSelectedTable] = useState<SwTable>();
  const [selectedTableRow, setSelectedTableRow] = useState<number>();
  const [tableDialog, setTableDialog] = useState<"insert" | "properties">();
  const [lineNumberingDialog, setLineNumberingDialog] = useState(false);
  const currentTable =
    selectedTable !== undefined && activeDocument.GetTables().includes(selectedTable)
      ? selectedTable
      : undefined;
  const availableTableWidth =
    snapshot.pageDescriptor.width -
    snapshot.pageDescriptor.leftMargin -
    snapshot.pageDescriptor.rightMargin;
  useEffect(
    /** Registers browser-owned table and line-numbering slots. @returns Shell cleanup. */ () => {
      const browserDialogShell = createSfxShell(
        null,
        createWriterInterface([
          {
            id: WRITER_COMMAND_IDS.insertTable,
            capabilityId: "CAP-0137",
            execute: /** Opens the insert dialog. @returns Nothing. */ () =>
              setTableDialog("insert"),
          },
          {
            id: WRITER_COMMAND_IDS.tableDialog,
            capabilityId: "CAP-0137",
            execute: /** Opens selected table properties. @returns Nothing. */ () =>
              setTableDialog("properties"),
            isEnabled: /** Checks table selection. @returns Availability. */ () =>
              currentTable !== undefined,
          },
          {
            id: WRITER_COMMAND_IDS.lineNumberingDialog,
            capabilityId: "CAP-0125",
            execute: /** Opens line numbering. @returns Nothing. */ () =>
              setLineNumberingDialog(true),
          },
        ]),
      );
      const dispatcher = view.GetViewFrame().GetDispatcher();
      dispatcher.Push(browserDialogShell);
      return /** Releases browser-owned slots. @returns Nothing. */ () =>
        dispatcher.Pop(browserDialogShell);
    },
    [currentTable, view],
  );
  /** Inserts a table from the upstream size grid with Writer's default table geometry. @param columns - Selected columns. @param rows - Selected rows. @returns Nothing. */
  function insertTableFromGrid(columns: number, rows: number): void {
    const table = activeDocument.nodes.MakeTableNode(
      `Table${activeDocument.GetTables().length + 1}`,
      { width: availableTableWidth, align: "left", headerRows: 1, repeatHeaderRows: true },
      view.GetWrtShell().GetActiveParagraph(),
    );
    const columnWidth = Math.floor(availableTableWidth / columns);
    for (let column = 0; column < columns; column += 1)
      table.AddColumnWidth(
        column === columns - 1 ? availableTableWidth - columnWidth * (columns - 1) : columnWidth,
      );
    for (let row = 0; row < rows; row += 1) activeDocument.nodes.AppendTableRow(table, columns);
    setSelectedTable(table);
    setSelectedTableRow(0);
  }
  const submitTable =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      value: WriterTableDialogValue,
    ): void => {
      if (tableDialog === "insert") {
        const table = activeDocument.nodes.MakeTableNode(
          value.name,
          {
            width: value.width,
            align: "left",
            headerRows: value.headerRows,
            repeatHeaderRows: value.repeatHeaderRows,
          },
          view.GetWrtShell().GetActiveParagraph(),
        );
        for (const columnWidth of value.columnWidths) table.AddColumnWidth(columnWidth);
        for (let row = 0; row < value.rows; row += 1)
          activeDocument.nodes.AppendTableRow(
            table,
            value.columns,
            { minHeight: value.minRowHeight, keepTogether: value.dontSplit },
            Array.from(
              { length: value.columns },
              /** Handles the browser table interaction.  @returns Callback result. */ () => ({
                padding: value.padding,
                border: value.border,
                verticalAlign: value.verticalAlign,
              }),
            ),
          );
        setSelectedTable(table);
        setSelectedTableRow(0);
      } else if (currentTable !== undefined) {
        currentTable.SetFormat({
          ...currentTable.GetFormat(),
          width: value.width,
          headerRows: value.headerRows,
          repeatHeaderRows: value.repeatHeaderRows,
        });
        value.columnWidths.forEach(
          /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
            width,
            index,
          ) => currentTable.SetColumnWidth(index, width),
        );
        const rowIndex = selectedTableRow as number;
        const rows = currentTable.GetTabLines().slice(rowIndex, rowIndex + 1);
        for (const row of rows) {
          row.SetFormat({
            ...row.GetFormat(),
            minHeight: value.minRowHeight,
            keepTogether: value.dontSplit,
          });
          for (const cell of row.GetTabBoxes())
            cell.SetFormat({
              ...cell.GetFormat(),
              padding: value.padding,
              border: value.border,
              verticalAlign: value.verticalAlign,
            });
        }
        activeDocument.NotifyModelChange({
          kind: "node-content-changed",
          nodeIndex: currentTable.GetTableNode().GetIndex(),
        });
      }
      setTableDialog(undefined);
    };
  const [fontAvailability, setFontAvailability] = useState<{
    document: SwDoc;
    values: Readonly<Record<string, boolean>>;
  }>();
  useEffect(
    /** Installs only fonts owned by the active document, then revokes them on replacement. @returns Revocation. */
    () =>
      installWriterEmbeddedFonts(
        activeDocument.GetEmbeddedFonts(),
        undefined,
        undefined,
        /** Records browser font availability. @param family - Document family. @param available - Load result. @returns Nothing. */
        (family, available) =>
          setFontAvailability(
            /** Updates only the active document's font state. @param previous - Earlier state. @returns Updated availability. */
            (previous) => ({
              document: activeDocument,
              values: {
                ...(previous?.document === activeDocument ? previous.values : {}),
                [family]: available,
              },
            }),
          ),
      ),
    [activeDocument],
  );
  const dialogController = view.GetDialogController();
  const dialogRequest = useSyncExternalStore(
    dialogController.Subscribe,
    dialogController.GetSnapshot,
    dialogController.GetSnapshot,
  );
  const fileDialogKind = useSyncExternalStore(
    fileDialogs?.Subscribe ?? subscribeNoDialog,
    fileDialogs?.GetSnapshot ?? getNoDialog,
    fileDialogs?.GetSnapshot ?? getNoDialog,
  );
  const handleDocumentTitleChange = useCallback(
    /** Persists an inline-edited document title through the owning shell. @param title - Committed title. @returns Nothing. */
    (title: string): void => {
      const shell = view.GetDocShell();
      const previous = shell.GetTitle();
      if (!shell.RenameDocument(title)) return;
      if (autosave !== undefined)
        void autosave.Flush().catch(
          /**
           * Handles the Writer browser operation.
           * @param error - Input value.
           * @returns Operation result.
           */ (error: unknown) => {
            shell.RenameDocument(previous);
            shell.SetMediumOperation(
              "save",
              "failed",
              shell.GetDocumentState().contentGeneration,
              error instanceof Error ? error.message : String(error),
            );
          },
        );
    },
    [view, autosave],
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
      return selectWriterCommandResource(localization, commandUrl);
    },
    [localization],
  );

  useCommandShortcuts({
    dispatcher: view.GetViewFrame().GetDispatcher(),
    executeCommand: commandSource.Execute,
    isActive,
    resolveArguments: resolveCommandArguments,
  });
  useEffect(
    /** Registers browser Save while this Writer view is mounted. @returns Listener cleanup. */
    () => {
      /** Saves the active document immediately through the same local store as autosave. @param event - Browser key event. @returns Nothing. */
      function saveLocally(event: KeyboardEvent): void {
        if (
          !isActive ||
          event.key.toLowerCase() !== "s" ||
          !(event.ctrlKey || event.metaKey) ||
          event.altKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (autosave === undefined) return;
        void autosave.Flush().catch(
          /** Reports immediate save failures in the document medium. @param error - Storage failure. @returns Nothing. */
          (error: unknown) => {
            const shell = view.GetDocShell();
            shell.SetMediumOperation(
              "save",
              "failed",
              shell.GetDocumentState().contentGeneration,
              error instanceof Error ? error.message : String(error),
            );
          },
        );
      }
      window.addEventListener("keydown", saveLocally, true);
      return /** Removes the shortcut listener. @returns Nothing. */ () =>
        window.removeEventListener("keydown", saveLocally, true);
    },
    [autosave, isActive, view],
  );

  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={snapshot.documentState.title}
        formattingToolbar={
          <WriterFormattingToolbar
            embeddedFontFamilies={activeDocument
              .GetEmbeddedFonts()
              .map(
                /** Projects one resource family. @param font - Embedded face. @returns Family. */ (
                  font,
                ) => font.familyName,
              )}
            fontAvailability={
              fontAvailability?.document === activeDocument ? fontAvailability.values : {}
            }
            advancedControls={
              <WriterAdvancedFormattingControls
                key={dialogRequest?.request.kind === "paragraph" ? dialogRequest.id : "closed"}
                commandSource={commandSource}
                getCommandResource={getLocalizedCommandResource}
                paragraph={snapshot.activeParagraph.computedStyle}
                {...(dialogRequest?.request.kind === "paragraph"
                  ? { dialogRequest: { id: dialogRequest.id, request: dialogRequest.request } }
                  : {})}
                onDialogCancel={
                  /** Cancels the exact paragraph request. @param id - Request identity. @returns Nothing. */ (
                    id,
                  ) => dialogController.Cancel(id)
                }
                onDialogSubmit={
                  /** Completes the exact paragraph request. @param id - Request identity. @param value - Accepted draft. @returns Nothing. */ (
                    id,
                    value,
                  ) => dialogController.Complete(id, value)
                }
              />
            }
            commandSource={commandSource}
            paragraphStyleOptions={snapshot.paragraphStyleOptions}
            resolveArguments={resolveCommandArguments}
          />
        }
        isPropertiesSidebarVisible={snapshot.isPropertiesSidebarVisible}
        isVerticalRulerVisible={snapshot.isVerticalRulerVisible}
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
            menus={writerMenuPlacements}
            resolveArguments={resolveCommandArguments}
          />
        }
        onDocumentTitleChange={handleDocumentTitleChange}
        propertiesSidebar={
          <>
            <WriterParagraphProperties
              alignment={snapshot.activeParagraph.alignment}
              commandSource={commandSource}
              listKind={snapshot.activeParagraph.list.kind}
              paragraphNumber={snapshot.activeParagraphIndex + 1}
              resolveArguments={resolveCommandArguments}
              styleDisplayName={snapshot.activeParagraph.styleDisplayName}
            />
            {currentTable === undefined ? null : (
              <button
                aria-label="Table Properties"
                className="grid size-9 place-items-center rounded-lg hover:bg-indigo-50"
                onClick={
                  /** Opens the selected table's properties. @returns Nothing. */
                  () => setTableDialog("properties")
                }
                title="Table Properties"
                type="button"
              >
                <TableProperties aria-hidden={true} size={18} />
              </button>
            )}
          </>
        }
        rulers={
          <WriterRulers
            horizontalVisible={snapshot.isHorizontalRulerVisible}
            onPageChange={
              /** Applies a page ruler gesture. @param edge - Dragged margin. @param delta - Twip delta. @returns Nothing. */ (
                edge,
                delta,
              ) => {
                view.GetWrtShell().AdjustPageMargin(edge, delta);
              }
            }
            onParagraphIndentChange={
              /** Applies a paragraph ruler gesture. @param edge - Dragged indent. @param delta - Twip delta. @returns Nothing. */ (
                edge,
                delta,
              ) => {
                view.GetWrtShell().AdjustParagraphRulerIndent(edge, delta);
              }
            }
            onTabStopAdd={
              /** Adds a ruler tab through the shell. @param position - Twip position. @returns Nothing. */ (
                position,
              ) => {
                view.GetWrtShell().AddRulerTabStop(position);
              }
            }
            onTabStopMove={
              /** Moves a ruler tab through the shell. @param index - Stop index. @param delta - Twip delta. @returns Nothing. */ (
                index,
                delta,
              ) => {
                view.GetWrtShell().MoveRulerTabStop(index, delta);
              }
            }
            page={snapshot.pageDescriptor}
            paragraph={snapshot.activeParagraph}
          />
        }
        status={presentWriterStatus(view, snapshot, localization.GetText.bind(localization))}
        toolbar={
          <>
            <WriterCommandToolbar
              commandSource={commandSource}
              onInsertTable={insertTableFromGrid}
              onTableMoreOptions={
                /** Opens full table settings. @returns Nothing. */ () => setTableDialog("insert")
              }
              resolveArguments={resolveCommandArguments}
            />
          </>
        }
      >
        <WriterPlainTextEditor
          activeParagraphId={snapshot.activeParagraph.id}
          cursorSelection={snapshot.cursorSelection}
          editWindow={view.GetEditWin()}
          layout={view.GetLayout()}
          pageDescriptor={snapshot.pageDescriptor}
          pageDescriptors={snapshot.pageDescriptors}
          paragraphSpacingSettings={snapshot.paragraphSpacingSettings}
          paragraphs={snapshot.paragraphs}
          {...(currentTable === undefined ? {} : { selectedTable: currentTable })}
          {...(selectedTableRow === undefined ? {} : { selectedTableRow })}
          onSelectTableRow={
            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
              table,
              row,
            ) => {
              setSelectedTable(table);
              setSelectedTableRow(row);
            }
          }
          showLineNumbers={snapshot.lineNumberInfo.paintLineNumbers}
          lineNumberInfo={snapshot.lineNumberInfo}
          verticalRuler={
            snapshot.isVerticalRulerVisible ? (
              <WriterVerticalRuler
                onPageChange={
                  /** Commits a vertical-ruler margin gesture. @param edge - Dragged edge. @param delta - Twip delta. @returns Nothing. */
                  (edge, delta) => {
                    view.GetWrtShell().AdjustPageMargin(edge, delta);
                  }
                }
                page={snapshot.pageDescriptor}
              />
            ) : null
          }
        />
      </WriterWorkspaceChrome>
      {tableDialog === undefined ? null : (
        <WriterTableDialog
          suggestedName={`Table${activeDocument.GetTables().length + 1}`}
          {...(tableDialog === "properties" && currentTable !== undefined
            ? { table: currentTable }
            : {})}
          availableWidth={availableTableWidth}
          onCancel={
            /** Handles the browser table interaction.  @returns Callback result. */ () =>
              setTableDialog(undefined)
          }
          onSubmit={submitTable}
        />
      )}
      {lineNumberingDialog ? (
        <WriterLineNumberingDialog
          value={snapshot.lineNumberInfo}
          onCancel={
            /** Discards line-numbering draft. @returns Nothing. */ () =>
              setLineNumberingDialog(false)
          }
          onSubmit={
            /** Commits line-number settings. @param value - Accepted settings. @returns Nothing. */ (
              value,
            ) => {
              activeDocument.SetLineNumberInfo(SwLineNumberInfo.FromValue(value));
              setLineNumberingDialog(false);
            }
          }
        />
      ) : null}
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
      {dialogRequest?.request.kind !== "bookmark" ? null : (
        <WriterBookmarkDialog
          names={dialogRequest.request.names}
          {...(dialogRequest.request.selectedName === undefined
            ? {}
            : { selectedName: dialogRequest.request.selectedName })}
          onCancel={
            /** Cancels the bookmark request. @returns Nothing. */
            () => {
              dialogController.Cancel(dialogRequest.id);
            }
          }
          onSubmit={
            /** Applies one bookmark choice. @param result - Accepted operation. @returns Nothing. */
            (result) => {
              dialogController.Complete(dialogRequest.id, result);
            }
          }
        />
      )}
      {dialogRequest?.request.kind !== "insert-break" ? null : (
        <WriterInsertBreakDialog
          onCancel={
            /** Cancels Insert Break. @returns Nothing. */
            () => {
              dialogController.Cancel(dialogRequest.id);
            }
          }
          onSubmit={
            /** Inserts a hard page break. @returns Nothing. */
            () => {
              dialogController.Complete(dialogRequest.id, { breakKind: "page" });
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
      {fileDialogKind === undefined ||
      services === undefined ||
      fileDialogs === undefined ? null : (
        <WriterFileDialog
          {...(autosave === undefined ? {} : { autosave })}
          docShell={view.GetDocShell()}
          kind={fileDialogKind}
          onClose={
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => fileDialogs.Close()
          }
          services={services}
        />
      )}
    </div>
  );
}

/** Formats command completion and shell/medium state at the browser presentation boundary. @param view - Active Writer view. @param snapshot - Current projection. @param getText - Localization lookup. @returns Status text. */
export function presentWriterStatus(
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
export function presentWriterCommandError(
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
