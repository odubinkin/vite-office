/** @fileoverview Production Calc workbench over canonical model/view/input owners,shared Sfx controls and Writer visual resources. */
import { useBrowserSaveShortcut } from "../../../framework/browser/presentation/use-command-shortcuts";
import { getBrowserShortcut } from "../../../framework/browser/accelerators/keymapping";
import type { ScTable } from "../../inc/table";
import { rowAtPixel, rowPixels } from "./row-geometry";
import { ScInputMode } from "../../inc/global";
import {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { officeCommandIcons } from "../../../framework/browser/presentation/office-command-icons";
import { CalcViewController } from "../controller/calc-view-controller";
import { ViewOption } from "../../inc/viewopti";
import { cellPresentation } from "../editor/cell-input";
import {
  CommandPopupMenu,
  type CommandPopupMenuProps,
} from "../../../framework/browser/presentation/CommandPopupMenu";
import { calcSheetTabItems } from "../../uiconfig/scalc/popupmenu/sheettab";
import { getCalcPopupCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { CalcFormattingToolbar } from "./CalcFormattingToolbar";
import { ScGridWindow } from "./ScGridWindow";
import { ScInputWindow, type CalcInputAction } from "./ScInputWindow";
import { ScTabControl } from "./ScTabControl";
import type { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { CommandToolbarItems } from "../../../framework/browser/presentation/CommandToolbar";
import { OfficeWorkspaceHeader } from "../../../framework/browser/presentation/OfficeWorkspaceHeader";
import { calcStandardBarItems } from "../../uiconfig/scalc/toolbar/standardbar";
import type { CalcFileWorkflows } from "../workflows/calc-file-workflows";
import { ScMetricInputDlg } from "./ScMetricInputDlg";
import { ScGoToTabDlg } from "./ScGoToTabDlg";
import type { CalcSheetWorkflows } from "../workflows/calc-sheet-workflows";
import { CalcFileDialog } from "./CalcFileDialog";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import { calcMenus, getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { MAXTAB } from "../../inc/address";
/** Production document/view and its shared Sfx frame. */
export interface CalcWorkbenchProps {
  readonly sheetWorkflows: CalcSheetWorkflows;
  readonly fileWorkflows: CalcFileWorkflows;
  readonly controller: CalcViewController;
  readonly frame: SfxViewFrame<CalcViewController>;
}
/** Existing void-slot browser arguments shared by all current Calc command surfaces;typed widgets augment their own payload through the generic controller. @returns Undefined. */
function resolveCalcCommandArguments(): undefined {
  return undefined;
}
/** Renders one mounted Calc editing session. @param props - Canonical owners. @returns Workspace. */
export function CalcWorkbench({
  controller,
  frame,
  fileWorkflows,
  sheetWorkflows,
}: CalcWorkbenchProps): React.JSX.Element {
  useSyncExternalStore(controller.Subscribe, controller.GetSnapshot, controller.GetSnapshot);
  const dialog = useSyncExternalStore(
    fileWorkflows.dialogs.Subscribe,
    fileWorkflows.dialogs.GetSnapshot,
    fileWorkflows.dialogs.GetSnapshot,
  );
  const sheetDialog = useSyncExternalStore(
    sheetWorkflows.dialogs.Subscribe,
    sheetWorkflows.dialogs.GetSnapshot,
    sheetWorkflows.dialogs.GetSnapshot,
  );
  const widthDialog = useSyncExternalStore(
    sheetWorkflows.metricDialogs.Subscribe,
    sheetWorkflows.metricDialogs.GetSnapshot,
    sheetWorkflows.metricDialogs.GetSnapshot,
  );
  useBrowserSaveShortcut({
    isActive: true,
    autosave: fileWorkflows,
    onError:
      /** Records failed immediate primary saves on the actual medium. @param error - Storage or input failure. @returns Nothing. */ (
        error,
      ) =>
        controller.shell.SetMediumOperation(
          "save",
          "failed",
          controller.shell.GetContentGeneration(),
          error instanceof Error ? error.message : String(error),
        ),
  });
  const [inputSelection, setInputSelection] = useState<readonly [number, number]>();
  const [sheetPopup, setSheetPopup] = useState<CommandPopupMenuProps["position"]>();
  const closeSheetPopup = useCallback(
    /** Releases the shared popup owner. @returns Nothing. */ () => setSheetPopup(undefined),
    [],
  );
  const modal = dialog !== undefined || sheetDialog !== undefined || widthDialog !== undefined;
  if (modal && sheetPopup !== undefined) setSheetPopup(undefined);
  const root = useRef<HTMLElement>(null),
    tabs = useRef<HTMLDivElement>(null),
    previousModal = useRef(modal);
  const view = controller.viewData,
    doc = controller.shell.GetDocument();
  const cursorColumn = view.GetCurX(),
    cursorRow = view.GetCurY(),
    activeTab = view.GetTabNumber(),
    inputMode = controller.mode;
  const cursorRowHeight = (doc.FetchTable(activeTab) as ScTable).GetRowHeight(cursorRow);
  const source = useMemo(
    /** Binds presenters to the active frame. @returns Command source. */ () =>
      createBrowserCommandSource(frame),
    [frame],
  );
  /** Borrows the component's own grid DOM client. @returns Grid. */
  function grid(): HTMLDivElement {
    return (root.current as HTMLElement).querySelector('[role="grid"]') as HTMLDivElement;
  }
  /** Returns focus to the owning document client. @returns Nothing. */
  function focusGrid(): void {
    grid().focus();
  }
  useLayoutEffect(
    /** Restores the document client only after React removes the modal and its background inert attribute. @returns Nothing. */ () => {
      const restore = previousModal.current && !modal;
      previousModal.current = modal;
      if (restore) grid().focus();
    },
    [modal],
  );
  useLayoutEffect(
    /** Applies original input-window text selection only after controlled text has rendered. @returns Nothing. */ () => {
      if (inputSelection) {
        const input = (root.current as HTMLElement).querySelector(
          '[aria-label="Input line"]',
        ) as HTMLInputElement;
        input.focus();
        input.setSelectionRange(inputSelection[0], inputSelection[1]);
      }
    },
    [inputSelection],
  );
  useEffect(
    /** Tracks concrete browser viewport changes separately from logical sheet rows. @returns Cleanup. */ () => {
      /** Measures the actual grid client before projecting visible cells. @returns Nothing. */
      function measure(): void {
        const client = grid();
        if (client.clientHeight > 0)
          controller.Scroll(
            client.scrollLeft,
            client.scrollTop,
            client.clientWidth,
            client.clientHeight,
          );
      }
      measure();
      window.addEventListener("resize", measure);
      return /** Removes the viewport listener. @returns Nothing. */ () =>
        window.removeEventListener("resize", measure);
    },
    [controller],
  );
  useLayoutEffect(
    /** Reveals source cursor movement without a second selection model or enormous CSS coordinate domain. @returns Nothing. */ () => {
      const client = grid(),
        viewport = controller.viewport;
      if (!client.clientHeight) return;
      const table = doc.FetchTable(activeTab) as ScTable;
      const firstPixel = rowPixels(table, 0, viewport.firstRow - 1);
      const visibleRows = Math.max(
          1,
          rowAtPixel(
            table,
            firstPixel + Math.max(1, client.clientHeight - viewport.rowHeight),
            doc.MaxRow(),
          ) - viewport.firstRow,
        ),
        col = cursorColumn,
        row = cursorRow;
      if (
        row < viewport.firstRow ||
        row >= viewport.firstRow + visibleRows ||
        col < viewport.firstColumn ||
        col >= viewport.firstColumn + viewport.columns - 1
      ) {
        const first = Math.max(0, row - visibleRows + 1);
        client.scrollTop = controller.ScrollTopForRow(first, client.clientHeight);
        client.scrollLeft = controller.ScrollLeftForColumn(
          Math.max(0, col - viewport.columns + 2),
          client.clientWidth,
        );
        controller.Scroll(
          client.scrollLeft,
          client.scrollTop,
          client.clientWidth,
          client.clientHeight,
        );
      }
    },
    [controller, doc, cursorColumn, cursorRow, activeTab, inputMode, cursorRowHeight],
  );
  /** Routes one input key while retaining IME ownership until composition completes. @param event - Input key. @returns Nothing. */
  function inputKey(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.nativeEvent.isComposing) return;
    if (
      controller.mode === ScInputMode.SC_INPUT_TYPE &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key.startsWith("Arrow")
    ) {
      event.preventDefault();
      const dx = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      const dy = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (controller.Commit()) {
        controller.Navigate(dx, dy, event.shiftKey);
        focusGrid();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      controller.Cancel();
      focusGrid();
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      if (controller.Commit()) {
        const delta = event.shiftKey ? -1 : 1;
        controller.Navigate(event.key === "Tab" ? delta : 0, event.key === "Enter" ? delta : 0);
        focusGrid();
      }
    }
  }
  /** Routes document keys to native-shaped input/view operations or the shared dispatcher. @param event - Grid key. @returns Nothing. */
  function key(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key.toLowerCase() === "z" || event.key.toLowerCase() === "y")
    ) {
      event.preventDefault();
      frame
        .GetDispatcher()
        .Execute(event.key.toLowerCase() === "y" || event.shiftKey ? ".uno:Redo" : ".uno:Undo");
      return;
    }
    if (
      event.key === "Backspace" &&
      event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Backspace is a non-modifier key,so the shared adapter result is defined.
      const command = frame
        .GetDispatcher()
        .FindCommandByShortcut(getBrowserShortcut(event) as string);
      if (command) {
        event.preventDefault();
        frame.GetDispatcher().Execute(command.command.id);
      }
      return;
    }
    if ((event.key === " " || event.code === "Space") && !event.metaKey) {
      const rowSelection = event.shiftKey && !event.ctrlKey && !event.altKey;
      const columnSelection =
        !event.shiftKey &&
        (/Mac/.test(navigator.platform)
          ? event.altKey && !event.ctrlKey
          : event.ctrlKey && !event.altKey);
      const allSelection =
        event.shiftKey &&
        (/Mac/.test(navigator.platform)
          ? event.altKey && !event.ctrlKey
          : event.ctrlKey && !event.altKey);
      if (rowSelection || columnSelection || allSelection) {
        event.preventDefault();
        frame
          .GetDispatcher()
          .Execute(
            allSelection ? ".uno:SelectAll" : rowSelection ? ".uno:SelectRow" : ".uno:SelectColumn",
          );
        return;
      }
    }
    const moves: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      Tab: [event.shiftKey ? -1 : 1, 0],
      Enter: [0, event.shiftKey ? -1 : 1],
    };
    const move = moves[event.key];
    if (move && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      controller.Navigate(move[0], move[1], event.shiftKey && event.key.startsWith("Arrow"));
      return;
    }
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
      event.preventDefault();
      controller.StartInput(ScInputMode.SC_INPUT_TYPE, event.key);
    }
  }
  /** Handles the native input-line action composition. @param action - Available action. @returns Nothing. */
  function inputAction(action: CalcInputAction): void {
    if (action === "cancel") {
      controller.Cancel();
      focusGrid();
    }
    if (action === "accept" && controller.Commit()) focusGrid();
    if (action === "sum") {
      const selection = controller.AutoSum();
      if (selection) setInputSelection(selection);
      else focusGrid();
    }
    if (action === "equals") {
      setInputSelection(controller.StartFormula());
    }
  }
  return (
    <section
      onKeyDown={
        /** Routes file and sheet accelerators through active Sfx slots from any source input. @param event - Platform key. @returns Nothing. */ (
          event,
        ) => {
          if (event.defaultPrevented || event.nativeEvent.isComposing || modal) return;
          if (
            event.key === "F2" &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !event.shiftKey
          ) {
            event.preventDefault();
            frame.GetDispatcher().Execute(".uno:SetInputMode");
            return;
          }
          // The native grid handler owns platform-specific row/column Space selection.
          if (!(event.ctrlKey || event.metaKey) || event.code === "Space" || event.key === " ")
            return;
          const shortcut = getBrowserShortcut(event);
          const command =
            shortcut === undefined
              ? undefined
              : frame.GetDispatcher().FindCommandByShortcut(shortcut);
          if (command) {
            if (
              command.command.id === ".uno:SelectAll" &&
              (event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
            )
              return;
            event.preventDefault();
            source.Execute(command.command.id);
          }
        }
      }
      ref={root}
      aria-label="Calc workspace"
      className="flex h-dvh w-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-100"
    >
      <div className="contents" inert={modal}>
        <OfficeWorkspaceHeader
          documentTitle={controller.shell.GetTitle()}
          onDocumentTitleChange={
            /** Renames the actual shell through Writer-compatible title editing. @param title - Accepted name. @returns Nothing. */ (
              title,
            ) => {
              controller.shell.Rename(title);
            }
          }
          titleLabel="Document title"
          editTitleLabel="Edit document title"
          subtitle="Calc · browser workbench"
          standardToolbarLabel="Calc standard toolbar"
          formattingToolbarLabel="Calc formatting toolbar"
          menuBar={
            <CommandMenuBar
              ariaLabel="Calc menu"
              commandSource={source}
              focusDocument={focusGrid}
              getCommandResource={getCalcCommandResource}
              idPrefix="calc-menu"
              isInputEnabled={!modal}
              menus={calcMenus}
              resolveArguments={resolveCalcCommandArguments}
            />
          }
          formattingToolbar={
            <CalcFormattingToolbar
              focusDocument={focusGrid}
              objectShell={controller.shell}
              commandSource={source}
              resolveArguments={resolveCalcCommandArguments}
            />
          }
          toolbar={
            <CommandToolbarItems
              commandSource={source}
              items={calcStandardBarItems}
              icons={officeCommandIcons}
              getCommandResource={getCalcCommandResource}
              resolveArguments={resolveCalcCommandArguments}
            />
          }
        />

        <ScInputWindow
          addressText={controller.addressText}
          inputText={controller.Input()}
          editing={controller.mode !== ScInputMode.SC_INPUT_NONE}
          enabledActions={
            new Set<CalcInputAction>(
              controller.mode === ScInputMode.SC_INPUT_NONE
                ? [...(controller.CanAutoSum() ? ["sum" as const] : []), "equals"]
                : ["cancel", "accept"],
            )
          }
          onAddressChange={
            /** Updates transient position text. @param value - Draft. @returns Nothing. */ (
              value,
            ) => controller.ChangeAddress(value)
          }
          onAddressKeyDown={
            /** Accepts/cancels the name box through actual A1 parsing. @param event - Key. @returns Nothing. */ (
              event,
            ) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (controller.GoToAddress()) focusGrid();
              }
              if (event.key === "Escape") {
                controller.ChangeAddress(controller.Address());
                focusGrid();
              }
            }
          }
          onInput={
            /** Changes the input owner's sole draft. @param value - Draft. @returns Nothing. */ (
              value,
            ) => controller.ChangeInput(value)
          }
          onInputFocus={
            /** Enters formula-line mode. @returns Nothing. */ () =>
              controller.StartInput(ScInputMode.SC_INPUT_TOP)
          }
          onInputKeyDown={inputKey}
          onAction={inputAction}
        />
        <ScGridWindow
          headerSizing={{
            GetEntrySize:
              /** Reads native header dimensions. @param width - Axis. @param index - Entry. @returns Pixels. */ (
                width,
                index,
              ) => controller.GetHeaderEntrySize(width, index),
            SetEntrySize:
              /** Commits native header dimensions. @param width - Axis. @param index - Entry. @param pixels - Size. @returns Nothing. */ (
                width,
                index,
                pixels,
              ) => controller.SetHeaderEntrySize(width, index, pixels),
            HideEntries:
              /** Hides the native dragged range. @param width - Axis. @param first - First entry. @param last - Last entry. @returns Nothing. */ (
                width,
                first,
                last,
              ) => controller.HideHeaderEntries(width, first, last),
          }}
          idPrefix="calc"
          viewData={view}
          viewport={controller.viewport}
          inputMode={controller.mode}
          inputText={controller.inputText}
          getCell={
            /** Reads actual formatted scalar/formula results. @param pos - Cell. @returns Presentation. */ (
              pos,
            ) => cellPresentation(doc, pos, view.GetOptions().GetOption(ViewOption.FORMULAS))
          }
          onSelect={
            /** Routes pointer selection with shift extension. @param pos - Cell. @param event - Pointer. @returns Nothing. */ (
              pos,
              event,
            ) => {
              if (event.button === 0) controller.Select(pos.Col(), pos.Row(), event.shiftKey);
            }
          }
          onHeader={
            /** Selects actual source row/column/all marks. @param kind - Header. @param index - Coordinate. @returns Nothing. */ (
              kind,
              index,
            ) => controller.Header(kind, index)
          }
          onEdit={
            /** Starts inline editing through the input owner. @param pos - Cell. @returns Nothing. */ (
              pos,
            ) => {
              controller.Select(pos.Col(), pos.Row());
              controller.StartInput(ScInputMode.SC_INPUT_TABLE);
            }
          }
          onKeyDown={key}
          onScroll={
            /** Projects actual physical scroll geometry into logical rows. @param event - Scroll. @returns Nothing. */ (
              event,
            ) => {
              const client = event.currentTarget;
              controller.Scroll(
                client.scrollLeft,
                client.scrollTop,
                client.clientWidth,
                client.clientHeight,
              );
            }
          }
          onInput={
            /** Shares one draft with the formula line. @param value - Draft. @returns Nothing. */ (
              value,
            ) => controller.ChangeInput(value)
          }
          onInputKeyDown={inputKey}
        />
        <div ref={tabs}>
          <ScTabControl
            viewData={view}
            canInsert={doc.GetTableCount() <= MAXTAB}
            onContextPopup={
              /** Admits native selection/formula policy before mounting the shared Writer popup. @param tab - Original target. @param point - Device anchor. @param owner - Actual sheet-tab button. @returns Nothing. */ (
                tab,
                point,
                owner,
              ) => {
                if (modal || !controller.PrepareSheetContextMenu(tab)) return;
                owner.focus({ preventScroll: true });
                setSheetPopup(point);
              }
            }
            onSelect={
              /** Selects source sheets and marks. @param tab - Sheet. @param event - Click. @returns Nothing. */ (
                tab,
                event,
              ) => {
                controller.SelectTab(tab, event.ctrlKey || event.metaKey);
                focusGrid();
              }
            }
            onInsert={
              /** Inserts a real undoable sheet. @returns Nothing. */ () => controller.InsertSheet()
            }
            onScroll={
              /** Scrolls only the tab strip,not the active sheet. @param direction - Native scroll intent. @returns Nothing. */ (
                direction,
              ) => {
                const list = (tabs.current as HTMLDivElement).querySelector(
                  '[role="tablist"]',
                ) as HTMLDivElement;
                list.scrollLeft =
                  direction === "first"
                    ? 0
                    : direction === "last"
                      ? list.scrollWidth
                      : list.scrollLeft + (direction === "next" ? 120 : -120);
              }
            }
            onKeyDown={
              /** Moves between actual adjacent tabs. @param event - Tab key. @returns Nothing. */ (
                event,
              ) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  frame
                    .GetDispatcher()
                    .Execute(
                      event.key === "ArrowRight" ? ".uno:JumpToNextTable" : ".uno:JumpToPrevTable",
                    );
                  focusGrid();
                }
              }
            }
          />
        </div>
        <div
          role="status"
          aria-label="Calc status bar"
          className="flex shrink-0 items-center gap-5 border-t border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300"
        >
          <span>
            Sheet {view.GetTabNumber() + 1} of {doc.GetTableCount()}
          </span>
          <span>{controller.Address()}</span>
          <span className="ml-auto">{controller.error || "Ready"}</span>
        </div>
      </div>
      {sheetPopup === undefined || modal ? null : (
        <CommandPopupMenu
          ariaLabel="Calc sheet context menu"
          commandSource={source}
          items={calcSheetTabItems}
          position={sheetPopup}
          getCommandResource={getCalcPopupCommandResource}
          resolveArguments={resolveCalcCommandArguments}
          onClose={closeSheetPopup}
        />
      )}
      {dialog === undefined ? null : (
        <CalcFileDialog
          workflows={fileWorkflows}
          kind={dialog}
          onClose={
            /** Closes the dialog and restores the actual grid focus. @returns Nothing. */ () => {
              fileWorkflows.dialogs.Close();
            }
          }
        />
      )}
      {widthDialog === undefined ? null : (
        <ScMetricInputDlg
          key={widthDialog.id}
          model={widthDialog.request}
          onCancel={
            /** Cancels native width request and restores actual grid focus. @returns Nothing. */ () => {
              sheetWorkflows.metricDialogs.Cancel(widthDialog.id);
            }
          }
          onSubmit={
            /** Returns integral native twips to the originating command. @param twips - Native result. @returns Nothing. */ (
              twips,
            ) => {
              sheetWorkflows.metricDialogs.Complete(widthDialog.id, twips);
            }
          }
        />
      )}
      {sheetDialog === undefined ? null : (
        <ScGoToTabDlg
          key={sheetDialog.id}
          {...sheetDialog.request}
          onCancel={
            /** Cancels only this native dialog and restores document focus. @returns Nothing. */ () => {
              sheetWorkflows.dialogs.Cancel(sheetDialog.id);
            }
          }
          onSubmit={
            /** Returns native selected name to the originating async slot. @param name - Dialog result. @returns Nothing. */ (
              name,
            ) => {
              sheetWorkflows.dialogs.Complete(sheetDialog.id, name);
            }
          }
        />
      )}
      {controller.error ? (
        <p
          role="alert"
          className="absolute bottom-12 left-4 z-40 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {controller.error}
        </p>
      ) : null}
    </section>
  );
}
