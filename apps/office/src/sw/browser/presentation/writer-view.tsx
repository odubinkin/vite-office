/** @fileoverview Projects a persistent SwView through browser-only command and editor adapters. */
import { WriterNumObjectBar } from "./WriterNumObjectBar";
import { SelectionType } from "../../source/uibase/inc/wrtsh";
import type { BrowserDocumentSummary } from "../../../framework/browser/storage/document-store";
import { useBrowserSaveShortcut } from "../../../framework/browser/presentation/use-command-shortcuts";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { importBoxProperties } from "../../source/filter/xml/xmlimpit";
import { RES_BOX } from "../../inc/hintids";

import { SwInsertTableFlags } from "../../inc/itabenum";
/* eslint-disable react-refresh/only-export-components -- Pure presentation helpers are exported for focused behavior verification. */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { WriterTableObjectBar } from "./WriterTableObjectBar";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { WriterAdvancedFormattingControls } from "./WriterAdvancedFormattingControls";
import { WriterDialogPresenter } from "./WriterDialogPresenter";
import { WriterOptionsDialog } from "./WriterOptionsDialog";
import { ApplyWriterMetricItemSet } from "../../source/uibase/app/appopt";
import { WriterTableDialog, type WriterTableDialogValue } from "./WriterTableDialog";
import { WriterColumnWidthDialog } from "./WriterColumnWidthDialog";
import { SwTableWidthDlg } from "../../source/ui/table/colwd";
import { WriterRowHeightDialog } from "./WriterRowHeightDialog";
import { SwTableHeightDlg } from "../../source/ui/table/rowht";
import { WriterLineNumberingDialog } from "./WriterLineNumberingDialog";
import { WriterFileDialog } from "./WriterFileDialog";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { WriterNameCollisionPanel } from "./WriterNameCollisionPanel";
import type {
  WriterFileDialogController,
  WriterFileDialogKind,
} from "../workflows/writer-file-dialog-controller";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import type { WriterAutosaveController } from "../workflows/writer-autosave";
import { WriterRulers, WriterVerticalRuler, type WriterRulerDocumentDrag } from "./WriterRulers";
import { SwTextNode } from "../../source/core/txtnode/ndtxt";
import {
  resolveSwListTextLeftMargin,
  resolveSwListFirstLineIndent,
} from "../../source/core/txtnode/ndtxt-list-indent";
import { WriterPropertiesPanel } from "./WriterPropertiesPanel";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import { useWriterContextMenu } from "./WriterContextMenu";
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
import { ItemSetToTableParam, TableParamToItemSet } from "../../source/uibase/shells/tabsh";
import { SwTabCols } from "../../source/core/bastyp/tabcol";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { createWriterInterface } from "../../sdi/swriter";
import { getUniqueWriterTitle, overwriteBrowserWriterDocument } from "../workflows/writer-odt-io";

/** Manual title edit paused on an occupied browser title. */
interface WriterRenameCollision {
  readonly conflicting: BrowserDocumentSummary;
}

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
  const editingHostRef = useRef<HTMLElement | null>(null);
  const documentRuler = useRef<WriterRulerDocumentDrag | null>(null);
  const presentationStore = useMemo(
    /** Borrows the current session store or owns a store for this exact native view. @returns Current presentation store. */ () =>
      viewStore ?? new WriterViewStore(view),
    [view, viewStore],
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
  const occupiedTableNames = activeDocument.GetTables().map(
    /** Reads native table names for insertion. @param table - Existing table. @returns Name. */
    (table) => table.GetName(),
  );
  const suggestedTableName = activeDocument.GetUniqueTableName();
  const [optionsDialog, setOptionsDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState<"insert" | "properties">();
  const [tableBorderItems, setTableBorderItems] =
    useState<ReturnType<typeof TableParamToItemSet>>();
  const [tableColumns, setTableColumns] = useState<SwTabCols>();
  const [lineNumberingDialog, setLineNumberingDialog] = useState(false);
  const [tableSizeRequest, setTableSizeRequest] = useState<
    Readonly<{
      document: SwDoc;
      draft: SwTableHeightDlg | SwTableWidthDlg;
    }>
  >();
  const tableSizeDialog =
    tableSizeRequest?.document === activeDocument ? tableSizeRequest.draft : undefined;
  const [renameCollision, setRenameCollision] = useState<WriterRenameCollision>();
  const [renameTitle, setRenameTitle] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState<string>();
  const currentTable = view.GetWrtShell().IsCursorInTable()?.GetTable();
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
            id: WRITER_COMMAND_IDS.optionsDialog,
            execute: /** Opens real Writer module options. @returns Nothing. */ () =>
              setOptionsDialog(true),
          },
          {
            id: WRITER_COMMAND_IDS.insertTable,
            capabilityId: "CAP-0137",
            execute: /** Opens the insert dialog. @returns Nothing. */ () =>
              setTableDialog("insert"),
            isEnabled:
              /** Restricts insertion to the represented body context. @returns Availability. */ () =>
                currentTable === undefined,
          },
          {
            id: WRITER_COMMAND_IDS.tableDialog,
            capabilityId: "CAP-0137",
            execute:
              /** Opens selected table properties with native input items. @returns Nothing. */ () => {
                setTableBorderItems(TableParamToItemSet(view.GetWrtShell()));
                const columns = new SwTabCols();
                view.GetWrtShell().GetTabCols(columns);
                setTableColumns(columns);
                setTableDialog("properties");
              },
            isEnabled: /** Checks table selection. @returns Availability. */ () =>
              currentTable !== undefined,
          },
          ...(
            [
              [WRITER_COMMAND_IDS.setRowHeight, SwTableHeightDlg],
              [WRITER_COMMAND_IDS.setColumnWidth, SwTableWidthDlg],
            ] as const
          ).map(
            /** Binds source sizing dialogs to the actual document owner. @param entry - Slot and native draft type. @returns Handler. */
            ([id, Draft]) => ({
              id,
              capabilityId: "CAP-0137" as const,
              /** Captures native draft and document identity without model mutation. @returns Nothing. */
              execute: () =>
                setTableSizeRequest({
                  document: view.GetDocShell().GetDoc(),
                  draft: new Draft(view.GetWrtShell()),
                }),
              /** Admits sizing only in the current table. @returns Whether available. */
              isEnabled: () => currentTable !== undefined,
            }),
          ),
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
    view
      .GetWrtShell()
      .InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, rows, columns);
  }
  const submitTable =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      value: WriterTableDialogValue,
    ): void => {
      if (tableDialog === "insert") {
        view.GetWrtShell().InsertTable(
          {
            mnInsMode:
              (value.headerRows > 0 ? SwInsertTableFlags.Headline : 0) |
              (value.dontSplit ? 0 : SwInsertTableFlags.SplitLayout),
            mnRowsToRepeat: value.repeatHeaderRows ? value.headerRows : 0,
          },
          value.rows,
          value.columns,
          value.name,
          {
            box: importBoxProperties({ padding: value.padding, border: value.border }, RES_BOX),
            vertOrient: new SwFormatVertOrient(0, value.verticalAlign),
          },
        );
      } else if (currentTable !== undefined) {
        ItemSetToTableParam(
          view.GetWrtShell(),
          value.items as NonNullable<WriterTableDialogValue["items"]>,
        );
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
  const commitDocumentTitle = useCallback(
    /** Persists one collision-free inline title through the owning shell. @param title - Committed title. @returns Completion. */ async (
      title: string,
    ): Promise<void> => {
      const shell = view.GetDocShell();
      const previous = shell.GetTitle();
      if (!shell.RenameDocument(title)) return;
      if (autosave === undefined) return;
      try {
        await autosave.Flush();
      } catch (error) {
        shell.RenameDocument(previous);
        shell.SetMediumOperation(
          "save",
          "failed",
          shell.GetDocumentState().contentGeneration,
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      }
    },
    [autosave, view],
  );
  const handleDocumentTitleChange = useCallback(
    /** Checks one inline-edited title before persisting it. @param title - Committed title. @returns Nothing. */
    (title: string): void => {
      void (
        /** Resolves storage collisions before applying the title. @returns Completion. */ async function resolveDocumentTitle(): Promise<void> {
          const store = services?.odtStore;
          const shell = view.GetDocShell();
          if (store !== undefined) {
            const documents = await store.list();
            const conflicting = documents.find(
              /** Finds another browser record with the requested title. @param document - Stored record. @returns Whether it conflicts. */ (
                document,
              ) => document.title === title && document.id !== shell.GetDocumentId(),
            );
            if (conflicting !== undefined) {
              setRenameCollision({ conflicting });
              setRenameTitle(getUniqueWriterTitle(title, documents));
              setRenameError(undefined);
              return;
            }
          }
          await commitDocumentTitle(title);
        }
      )().catch(
        /** Reports title lookup or persistence failure through the document medium. @param error - Failure value. @returns Nothing. */ (
          error: unknown,
        ) => {
          const shell = view.GetDocShell();
          shell.SetMediumOperation(
            "save",
            "failed",
            shell.GetDocumentState().contentGeneration,
            error instanceof Error ? error.message : String(error),
          );
        },
      );
    },
    [commitDocumentTitle, services?.odtStore, view],
  );

  /** Resolves the rename collision with the editable alternative, repeating the prompt for another occupied name. @param requestedTitle - User-entered alternative. @returns Completion. */
  async function saveRenamedDocumentAs(requestedTitle: string): Promise<void> {
    const store = services?.odtStore;
    if (store === undefined) throw new Error("Browser storage is unavailable.");
    const normalized = requestedTitle.trim();
    if (normalized.length === 0) throw new Error("Document name is required.");
    setRenameBusy(true);
    setRenameError(undefined);
    try {
      const documents = await store.list();
      const currentId = view.GetDocShell().GetDocumentId();
      const conflicting = documents.find(
        /** Finds another record with the edited alternative title. @param document - Stored record. @returns Whether it conflicts. */ (
          document,
        ) => document.title === normalized && document.id !== currentId,
      );
      if (conflicting !== undefined) {
        setRenameCollision({ conflicting });
        setRenameTitle(getUniqueWriterTitle(normalized, documents));
        return;
      }
      await commitDocumentTitle(normalized);
      setRenameCollision(undefined);
    } catch (error) {
      setRenameError(error instanceof Error ? error.message : String(error));
    } finally {
      setRenameBusy(false);
    }
  }

  /** Overwrites the selected conflicting record with the active Writer model. @returns Completion. */
  async function overwriteRenamedDocument(): Promise<void> {
    const store = services?.odtStore;
    if (store === undefined || renameCollision === undefined) return;
    setRenameBusy(true);
    setRenameError(undefined);
    try {
      await overwriteBrowserWriterDocument(view.GetDocShell(), store, renameCollision.conflicting);
      setRenameCollision(undefined);
    } catch (error) {
      setRenameError(error instanceof Error ? error.message : String(error));
    } finally {
      setRenameBusy(false);
    }
  }

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

  const getLocalizedMenuLabel = useCallback(
    /** Localizes an original generated menu for both presentation surfaces. @param id - Native menu identity. @param fallback - Resource label. @returns Localized label. */ (
      id: string,
      fallback: string,
    ) => localization.GetText(`writer.menu.${id}.label`, fallback),
    [localization],
  );

  useCommandShortcuts({
    dispatcher: view.GetViewFrame().GetDispatcher(),
    executeCommand: commandSource.Execute,
    isActive,
    resolveArguments: resolveCommandArguments,
  });
  const isInputEnabled =
    isActive &&
    dialogRequest === undefined &&
    fileDialogKind === undefined &&
    tableDialog === undefined &&
    tableSizeDialog === undefined &&
    !lineNumberingDialog;
  const [onContextPopup, contextMenu] = useWriterContextMenu(
    isInputEnabled,
    commandSource,
    resolveCommandArguments,
  );
  useEffect(
    /** Routes the active frame's direct document focus key. @returns Listener cleanup. */
    function installDocumentFocusKey(): () => void {
      /** Focuses this Writer client without executing a command or restoring menu focus. @param event - Browser key. @returns Nothing. */
      function focusDocumentFromKey(event: KeyboardEvent): void {
        if (
          !isInputEnabled ||
          event.defaultPrevented ||
          event.key !== "F6" ||
          !event.ctrlKey ||
          event.shiftKey
        )
          return;
        event.preventDefault();
        (editingHostRef.current as HTMLElement).focus();
      }
      window.addEventListener("keydown", focusDocumentFromKey);
      return /** Removes the frame's document focus route. @returns Nothing. */ () =>
        window.removeEventListener("keydown", focusDocumentFromKey);
    },
    [isInputEnabled],
  );
  useBrowserSaveShortcut({
    isActive,
    autosave,
    onError:
      /** Reports primary storage failure through the active shell. @param error - Storage failure. @returns Nothing. */ (
        error,
      ) => {
        const shell = view.GetDocShell();
        shell.SetMediumOperation(
          "save",
          "failed",
          shell.GetDocumentState().contentGeneration,
          error instanceof Error ? error.message : String(error),
        );
      },
  });

  const sizingDialogProps = {
    unit: snapshot.metricUnit,
    /** Discards either unaccepted native size draft. @returns Nothing. */
    onCancel: () => setTableSizeRequest(undefined),
    /** Applies only to the document that owns the captured draft. @returns Nothing. */
    onSubmit: () => {
      if (tableSizeRequest?.document === view.GetDocShell().GetDoc())
        tableSizeRequest.draft.Apply();
      setTableSizeRequest(undefined);
    },
  };
  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={snapshot.documentState.title}
        numberingToolbar={
          (view.GetWrtShell().GetSelectionType() & SelectionType.NumberList) !== 0 ? (
            <WriterNumObjectBar
              commandSource={commandSource}
              resolveArguments={resolveCommandArguments}
            />
          ) : undefined
        }
        tableToolbar={
          currentTable === undefined ? undefined : (
            <WriterTableObjectBar
              commandSource={commandSource}
              resolveArguments={resolveCommandArguments}
            />
          )
        }
        formattingToolbar={
          <WriterFormattingToolbar
            objectShell={view.GetDocShell()}
            unit={snapshot.metricUnit}
            isInputEnabled={isInputEnabled}
            focusDocument={
              /** Releases accepted style-box focus to this mounted Writer frame. @returns Nothing. */ () =>
                (editingHostRef.current as HTMLElement).focus()
            }
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
                unit={snapshot.metricUnit}
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
            paragraphStyleNames={snapshot.paragraphStyleNames}
            resolveArguments={resolveCommandArguments}
          />
        }
        isPropertiesSidebarVisible={snapshot.isPropertiesSidebarVisible}
        focusDocument={
          /** Returns sidebar focus to this Writer frame's mounted client. @returns Nothing. */ () =>
            (editingHostRef.current as HTMLElement).focus()
        }
        isVerticalRulerVisible={snapshot.isVerticalRulerVisible}
        isStatusBarVisible={snapshot.isStatusBarVisible}
        menuBar={
          <CommandMenuBar
            ariaLabel="Writer menu bar"
            commandSource={commandSource}
            getCommandResource={getLocalizedCommandResource}
            getMenuLabel={getLocalizedMenuLabel}
            focusDocument={
              /** Focuses this Writer frame's mounted client. @returns Nothing. */ () =>
                (editingHostRef.current as HTMLElement).focus()
            }
            idPrefix="writer"
            isInputEnabled={isInputEnabled}
            menus={writerMenuPlacements}
            resolveArguments={resolveCommandArguments}
          />
        }
        onDocumentTitleChange={handleDocumentTitleChange}
        propertiesSidebar={
          <>
            <WriterPropertiesPanel
              objectShell={view.GetDocShell()}
              isTable={currentTable !== undefined}
              unit={snapshot.metricUnit}
              paragraphStyleOptions={snapshot.paragraphStyleOptions}
              paragraphStyleNames={snapshot.paragraphStyleNames}
              embeddedFontFamilies={activeDocument.GetEmbeddedFonts().map(
                /** Projects actual embedded family names. @param font - Package font. @returns Family name. */
                (font) => font.familyName,
              )}
              fontAvailability={
                fontAvailability?.document === activeDocument ? fontAvailability.values : {}
              }
              commandSource={commandSource}
              focusDocument={
                /** Returns panel header focus to this Writer frame's mounted client. @returns Nothing. */ () =>
                  (editingHostRef.current as HTMLElement).focus()
              }
              resolveArguments={resolveCommandArguments}
            />
          </>
        }
        rulers={
          <WriterRulers
            unitData={snapshot.horizontalRulerUnitData}
            documentDragRef={documentRuler}
            documentOwner={activeDocument}
            horizontalVisible={snapshot.isHorizontalRulerVisible && isActive}
            onDocumentIndentChange={
              /** Applies copied native ruler items after immediate label-node reset. @param value - Accepted indent geometry. @returns Nothing. */ (
                value,
              ) => {
                view.GetWrtShell().SetParagraphRulerIndents(value);
              }
            }
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
          {...(onContextPopup === undefined ? {} : { onContextPopup })}
          onNumLabelMouseDown={
            /** Uses an actual label node only while updating ruler state and admitting the native document gesture. @param event - Actual document mouse input. @returns Whether ordinary pointer selection is bypassed. */ (
              event,
            ) => {
              const marker = (event.target as HTMLElement).closest<HTMLElement>(
                "[data-writer-list-marker]",
              );
              if (marker === null || event.button !== 0 || event.detail !== 1) return false;
              const projected = snapshot.textNodes.find(
                /** Resolves a mounted label's existing node coordinate. @param candidate - Immutable node identity. @returns Whether it owns the hit label. */
                (candidate) => candidate.id === marker.dataset.writerListMarker,
              );
              if (projected === undefined) return false;
              const node = activeDocument.GetNodes().at(projected.nodeIndex) as SwTextNode;
              if (node.GetNum() === undefined) return false;
              const currentLeft = view
                .GetWrtShell()
                .GetActiveParagraph()
                .GetParagraphTextLeftMargin();
              const offset =
                ((currentLeft +
                  (resolveSwListTextLeftMargin(node) as number) -
                  node.GetParagraphTextLeftMargin()) <<
                  16) >>
                16;
              const firstLine = snapshot.activeParagraph.computedStyle.firstLineIndentPt * 20;
              const textLeft = offset + resolveSwListFirstLineIndent(node) - Math.min(0, firstLine);
              return (documentRuler.current as WriterRulerDocumentDrag).StartDocDrag(
                event,
                textLeft,
              );
            }
          }
          activeParagraphId={snapshot.activeParagraph.id}
          cursorSelection={snapshot.cursorSelection}
          editWindow={view.GetEditWin()}
          editingHostRef={editingHostRef}
          pageDescriptor={snapshot.pageDescriptor}
          pageDescriptors={snapshot.pageDescriptors}
          paragraphSpacingSettings={snapshot.paragraphSpacingSettings}
          paragraphs={snapshot.paragraphs}
          textNodes={snapshot.textNodes}
          selectedTableBoxes={snapshot.selectedTableBoxes}
          showLineNumbers={snapshot.lineNumberInfo.paintLineNumbers}
          lineNumberInfo={snapshot.lineNumberInfo}
          verticalRuler={
            snapshot.isVerticalRulerVisible ? (
              <WriterVerticalRuler
                unitData={snapshot.verticalRulerUnitData}
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
      {contextMenu}
      {optionsDialog ? (
        <WriterOptionsDialog
          view={view}
          onClose={
            /** Discards remaining option drafts. @returns Nothing. */ () => setOptionsDialog(false)
          }
          onApply={
            /** Applies original metric items before platform persistence. @param items - Native changed fields. @returns Nothing. */ (
              items,
            ) => {
              ApplyWriterMetricItemSet(view.GetModule(), items, view);
              services?.layoutPreferences?.Save(view.GetModule().GetUsrPref(false));
            }
          }
        />
      ) : null}
      {tableDialog === undefined ? null : (
        <WriterTableDialog
          unit={snapshot.metricUnit}
          boxAlign={view.GetWrtShell().GetBoxAlign()}
          occupiedNames={occupiedTableNames}
          suggestedName={suggestedTableName}
          {...(tableDialog === "properties" && currentTable !== undefined
            ? { table: currentTable, borderItems: tableBorderItems, tableColumns }
            : {})}
          {...(view.GetWrtShell().IsTableMode()
            ? { selectedBoxes: view.GetWrtShell().GetTableSel() }
            : {})}
          lineSelected={
            view.GetWrtShell().IsTableMode() && !view.GetWrtShell().HasWholeTabSelection()
          }
          availableWidth={availableTableWidth}
          onCancel={
            /** Handles the browser table interaction.  @returns Callback result. */ () =>
              setTableDialog(undefined)
          }
          onSubmit={submitTable}
        />
      )}
      {tableSizeDialog instanceof SwTableHeightDlg ? (
        <WriterRowHeightDialog draft={tableSizeDialog} {...sizingDialogProps} />
      ) : tableSizeDialog instanceof SwTableWidthDlg ? (
        <WriterColumnWidthDialog draft={tableSizeDialog} {...sizingDialogProps} />
      ) : null}
      {lineNumberingDialog ? (
        <WriterLineNumberingDialog
          unit={snapshot.metricUnit}
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
      <WriterDialogPresenter
        focusDocument={
          /** Returns closed hyperlink/bookmark dialog focus to its actual mounted document client. @returns Nothing. */ () =>
            (editingHostRef.current as HTMLElement).focus()
        }
        bookmarkNames={view.GetWrtShell().GetTextShell().GetBookmarkNames()}
        onBookmarkOperation={
          /** Applies immediate native bookmark operations without completing the open request. @param result - Actual operation. @returns Nothing. */ (
            result,
          ) => {
            view.Execute(WRITER_COMMAND_IDS.insertBookmark, { bookmark: result });
          }
        }
        controller={dialogController}
        request={dialogRequest}
        unit={snapshot.metricUnit}
      />
      {renameCollision === undefined ? null : (
        <div
          aria-label="Resolve document name"
          aria-modal="true"
          data-writer-modal="true"
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          role="dialog"
        >
          <div data-writer-modal-panel="true" className="w-full max-w-xl bg-white">
            <WriterDialogHeader
              title="Resolve document name"
              onClose={
                /** Cancels the pending title change from the heading. @returns Nothing. */ () => {
                  setRenameCollision(undefined);
                  setRenameError(undefined);
                }
              }
            />
            <WriterNameCollisionPanel
              busy={renameBusy}
              conflictingTitle={renameCollision.conflicting.title}
              onCancel={
                /** Cancels the pending title change. @returns Nothing. */ () => {
                  setRenameCollision(undefined);
                  setRenameError(undefined);
                }
              }
              onOverwrite={
                /** Replaces the selected conflicting document. @returns Nothing. */ () =>
                  void overwriteRenamedDocument()
              }
              onSaveAs={
                /** Retries the rename with the editable alternative. @param title - Requested alternative. @returns Nothing. */ (
                  title,
                ) => void saveRenamedDocumentAs(title)
              }
              onTitleChange={setRenameTitle}
              title={renameTitle}
            />
            {renameError === undefined ? null : (
              <p className="mx-6 mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                {renameError}
              </p>
            )}
          </div>
        </div>
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
  /* istanbul ignore next -- an attached SwView dispatcher contains only the exhaustively mapped Writer commands above. */
  return failure.error;
}
