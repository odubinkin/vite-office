/** @fileoverview Production Calc workbench over canonical model/view/input owners,shared Sfx controls and Writer visual resources. */
import { useBrowserSaveShortcut } from "../../../framework/browser/presentation/use-command-shortcuts";
import { getBrowserShortcut } from "../../../framework/browser/accelerators/keymapping";
import type { ScTable } from "../../inc/table";
import { columnAtPixel, columnPixels } from "./column-geometry";
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
  type SyntheticEvent,
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
import { CALC_SPLIT_HANDLE_SIZE, calcGridInsets } from "./calc-grid-axis";
import type { ScSplitPos } from "../../source/ui/inc/viewdata";
import { ScInputWindow, type CalcInputAction } from "./ScInputWindow";
import { ScTabControl } from "./ScTabControl";
import type { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { CommandToolbarItems } from "../../../framework/browser/presentation/CommandToolbar";
import { OfficeWorkspaceHeader } from "../../../framework/browser/presentation/OfficeWorkspaceHeader";
import { calcStandardBarItems } from "../../uiconfig/scalc/toolbar/standardbar";
import type { CalcFileWorkflows } from "../workflows/calc-file-workflows";
import { CalcSheetDialogs } from "./CalcSheetDialogs";
import { useCalcDialog } from "./use-calc-dialog";
import { ScPrintAreasDlg, type ScPrintReferenceInput } from "./ScPrintAreasDlg";
import type { CalcSheetWorkflows } from "../workflows/calc-sheet-workflows";
import { CalcFileDialog } from "./CalcFileDialog";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import { selectAvailableMenuItems } from "../../../framework/browser/presentation/available-menu-items";
import { calcMenus, getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { ScAddress, MAXTAB, type ScRange } from "../../inc/address";
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
  const dialog = useCalcDialog(fileWorkflows.dialogs);
  const sheetDialog = useCalcDialog(sheetWorkflows.dialogs);
  const tabDialog = useCalcDialog(sheetWorkflows.tabDialogs);
  const widthDialog = useCalcDialog(sheetWorkflows.metricDialogs);
  const headerFooterDialog = useCalcDialog(sheetWorkflows.headerFooterDialogs);
  const pageStyleDialog = useCalcDialog(sheetWorkflows.pageStyleDialogs);
  const printDialog = useCalcDialog(sheetWorkflows.printDialogs);
  const condEditor = useCalcDialog(sheetWorkflows.conditionals.editors);
  const condManager = useCalcDialog(sheetWorkflows.conditionals.managers);
  const referenceDialog = printDialog ?? condEditor;
  const printInput = useRef<ScPrintReferenceInput>(null);
  const [referenceSelection, setReferenceSelection] = useState<{
    owner: object;
    range: ScRange | undefined;
  }>();
  const referenceOpen = referenceDialog !== undefined;
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

  const [sheetPopup, setSheetPopup] = useState<CommandPopupMenuProps["position"]>();
  const closeSheetPopup = useCallback(
    /** Releases the shared popup owner. @returns Nothing. */ () => setSheetPopup(undefined),
    [],
  );
  const modal =
    dialog !== undefined ||
    sheetDialog !== undefined ||
    widthDialog !== undefined ||
    tabDialog !== undefined ||
    pageStyleDialog !== undefined ||
    headerFooterDialog !== undefined ||
    condManager !== undefined;
  const root = useRef<HTMLElement>(null),
    tabs = useRef<HTMLDivElement>(null),
    previousModal = useRef(modal || referenceOpen),
    browserTopFocus = useRef(false),
    restoredViewport = useRef(false);
  const view = controller.viewData,
    doc = controller.shell.GetDocument();
  const showSheetTabs = view.GetOptions().GetOption(ViewOption.TABCONTROLS);
  if ((modal || referenceOpen || !showSheetTabs) && sheetPopup !== undefined)
    setSheetPopup(undefined);
  const paneLayoutRevision = view.GetPaneLayoutRevision();
  const cursorColumn = view.GetCurX(),
    cursorRow = view.GetCurY(),
    activeTab = view.GetTabNumber(),
    inputMode = controller.mode;
  const [selectionStart, selectionEnd] = controller.inputSelection;
  const cursorRowHeight = (doc.FetchTable(activeTab) as ScTable).GetRowHeight(cursorRow);
  const source = useMemo(
    /** Binds presenters to the active frame. @returns Command source. */ () =>
      createBrowserCommandSource(frame),
    [frame],
  );
  const menus = useMemo(
    /** Resolves the connected Calc menus once per frame. @returns Nonempty menu roots. */
    () =>
      calcMenus.flatMap(
        /** Removes menu roots with no registered actions. @param menu - Original menu. @returns Visible root or empty array. */
        (menu) => {
          const items = selectAvailableMenuItems(menu.items, source);
          return items.length === 0 ? [] : [{ ...menu, items }];
        },
      ),
    [source],
  );
  const sheetMenuItems = useMemo(
    /** Resolves the connected sheet actions once per frame. @returns Sheet context menu items. */
    () => selectAvailableMenuItems(calcSheetTabItems, source),
    [source],
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
      const restore = previousModal.current && !modal && !referenceOpen;
      previousModal.current = modal || referenceOpen;
      if (restore) grid().focus();
    },
    [modal, referenceOpen],
  );
  useLayoutEffect(
    /** Projects native selection requests after controlled text renders. Actual browser focus owns its initial caret/selection,as ScTextWnd GetFocus delegates to the edit view without moving it. @returns Nothing. */ () => {
      const preserveBrowserSelection = browserTopFocus.current;
      browserTopFocus.current = false;
      if (controller.mode !== ScInputMode.SC_INPUT_NONE && !preserveBrowserSelection) {
        const input = (root.current as HTMLElement).querySelector(
          controller.mode === ScInputMode.SC_INPUT_TOP
            ? '[aria-label="Input line"]'
            : '[aria-label^="Edit cell "]',
        ) as HTMLInputElement | null;
        input?.focus({ preventScroll: true });
        input?.setSelectionRange(controller.inputSelection[0], controller.inputSelection[1]);
      }
    },
    [controller, selectionStart, selectionEnd, controller.inputText, inputMode],
  );
  useLayoutEffect(
    /** Restores the first visible cells when a sheet or document is attached. @returns Nothing. */ () => {
      const client = grid();
      const saved = controller.RestoreScrollPosition(client.clientWidth, client.clientHeight);
      restoredViewport.current = saved.stored;
      client.scrollLeft = saved.left;
      client.scrollTop = saved.top;
      if (client.clientHeight > 0)
        controller.MeasureViewport(
          client.scrollLeft,
          client.scrollTop,
          client.clientWidth,
          client.clientHeight,
        );
    },
    [controller, doc, activeTab, paneLayoutRevision],
  );
  useEffect(
    /** Tracks concrete browser viewport changes separately from logical sheet rows. @returns Cleanup. */ () => {
      /** Measures the actual grid client before projecting visible cells. @returns Nothing. */
      function measure(): void {
        const client = grid();
        if (client.clientHeight > 0)
          controller.MeasureViewport(
            client.scrollLeft,
            client.scrollTop,
            client.clientWidth,
            client.clientHeight,
          );
      }
      measure();
      const client = grid(),
        wheelTarget = client.parentElement ?? client;
      /** Routes wheel deltas according to the pointer's left/right and top/bottom pair. @param event - Browser wheel event. @returns Nothing. */
      function wheel(event: WheelEvent): void {
        const viewport = controller.viewport;
        const outline = (event.target as Element).closest("[data-calc-outline]");
        if ((!viewport.splitColumns && !viewport.splitRows && !outline) || event.ctrlKey) return;
        const bounds = client.getBoundingClientRect();
        const inset = calcGridInsets(controller.viewData, viewport.rowHeight);
        const x = event.clientX - bounds.left - inset.left;
        const y = event.clientY - bounds.top - inset.top;
        const leadingX = !!viewport.splitColumns && x < viewport.splitColumns.pixels;
        const leadingY = !!viewport.splitRows && y < viewport.splitRows.pixels;
        const modeX = event.deltaMode === 2 ? client.clientWidth : event.deltaMode === 1 ? 16 : 1;
        const modeY = event.deltaMode === 2 ? client.clientHeight : event.deltaMode === 1 ? 16 : 1;
        const dx = (event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX) * modeX;
        const dy = event.shiftKey ? 0 : event.deltaY * modeY;
        const offsets = controller.ScrollPaneWheel(
          client.scrollLeft,
          client.scrollTop,
          client.clientWidth,
          client.clientHeight,
          dx,
          dy,
          leadingX,
          leadingY,
        );
        client.scrollLeft = offsets.left;
        client.scrollTop = offsets.top;
        event.preventDefault();
      }
      wheelTarget.addEventListener("wheel", wheel, { passive: false });
      window.addEventListener("resize", measure);
      return /** Removes the browser viewport listeners. @returns Nothing. */ () => {
        wheelTarget.removeEventListener("wheel", wheel);
        window.removeEventListener("resize", measure);
      };
    },
    [controller],
  );
  const revealCell = useCallback(
    /** Scrolls only the movable axes needed to reveal a cursor or selection endpoint. @param column - Native column. @param row - Native row. @param kind - Hit surface. @returns Nothing. */
    (column: number, row: number, kind: "cell" | "column" | "row"): void => {
      const client = (root.current as HTMLElement).querySelector<HTMLDivElement>('[role="grid"]'),
        viewport = controller.viewport;
      if (!client?.clientWidth || !client.clientHeight) return;
      const table = doc.FetchTable(activeTab) as ScTable;
      const { left: insetLeft, top: insetTop } = calcGridInsets(view, viewport.rowHeight);
      const pane = view.GetActivePart();
      const splitX = pane & 1 ? undefined : viewport.splitColumns;
      const splitY = pane & 2 ? undefined : viewport.splitRows;
      const left =
        columnPixels(table, 0, (splitX?.first ?? viewport.firstColumn) - 1) +
        (splitX?.displacement ?? viewport.columnOffset);
      const top =
        rowPixels(table, 0, (splitY?.first ?? viewport.firstRow) - 1) +
        (splitY?.displacement ?? viewport.rowOffset);
      const bodyWidth =
        splitX?.pixels ??
        client.clientWidth -
          insetLeft -
          (viewport.frozenColumns?.pixels ??
            (viewport.splitColumns ? viewport.splitColumns.pixels + CALC_SPLIT_HANDLE_SIZE : 0));
      const bodyHeight =
        splitY?.pixels ??
        client.clientHeight -
          insetTop -
          (viewport.frozenRows?.pixels ??
            (viewport.splitRows ? viewport.splitRows.pixels + CALC_SPLIT_HANDLE_SIZE : 0));
      const x = columnPixels(table, 0, column - 1),
        right = columnPixels(table, 0, column);
      const y = rowPixels(table, 0, row - 1),
        bottom = rowPixels(table, 0, row);
      const scrollX =
        kind !== "row" &&
        column > (viewport.frozenColumns?.last ?? -1) &&
        (x < left || right > left + bodyWidth);
      const scrollY =
        kind !== "column" &&
        row > (viewport.frozenRows?.last ?? -1) &&
        (y < top || bottom > top + bodyHeight);
      controller.ScrollLeading(
        splitX && scrollX ? (x < left ? x : right - bodyWidth) - left : 0,
        splitY && scrollY ? (y < top ? y : bottom - bodyHeight) - top : 0,
      );
      if (scrollX && !splitX)
        client.scrollLeft = controller.ScrollLeftForColumn(
          x < left
            ? column
            : Math.min(
                column,
                columnAtPixel(table, Math.max(0, right - bodyWidth), doc.MaxCol()) + 1,
              ),
          client.clientWidth,
        );
      if (scrollY && !splitY)
        client.scrollTop = controller.ScrollTopForRow(
          y < top
            ? row
            : Math.min(row, rowAtPixel(table, Math.max(0, bottom - bodyHeight), doc.MaxRow()) + 1),
          client.clientHeight,
        );
      if ((scrollX && !splitX) || (scrollY && !splitY))
        controller.Scroll(
          client.scrollLeft,
          client.scrollTop,
          client.clientWidth,
          client.clientHeight,
        );
    },
    [activeTab, controller, doc, view],
  );
  useLayoutEffect(
    /** Reveals source cursor movement in the owning grid part. @returns Nothing. */ () => {
      if (restoredViewport.current) {
        restoredViewport.current = false;
        return;
      }
      const viewport = controller.viewport,
        active = view.GetActivePart();
      const right = viewport.frozenColumns
        ? Number(cursorColumn > viewport.frozenColumns.last)
        : active & 1;
      const bottom = viewport.frozenRows
        ? cursorRow > viewport.frozenRows.last
          ? 2
          : 0
        : active & 2;
      view.SetActivePart((right | bottom) as ScSplitPos);
      revealCell(cursorColumn, cursorRow, "cell");
    },
    [
      controller,
      view,
      revealCell,
      cursorColumn,
      cursorRow,
      inputMode,
      cursorRowHeight,
      paneLayoutRevision,
    ],
  );
  /** Projects original input-handler Command selected-reference collapse before DOM paste or IME starts. @param event - Actual editor command. @returns Nothing. */
  function inputCommand(event: SyntheticEvent<HTMLInputElement>): void {
    if (controller.inputHandler.IsReferenceSelection()) {
      controller.inputHandler.PrepareReferenceInput();
      event.currentTarget.setSelectionRange(
        controller.inputSelection[0],
        controller.inputSelection[1],
      );
    }
  }
  /** Routes one input key while retaining IME ownership until composition completes. @param event - Input key. @returns Nothing. */
  function inputKey(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.nativeEvent.isComposing) return;
    if (
      controller.mode === ScInputMode.SC_INPUT_TYPE &&
      controller.inputHandler.IsFormulaMode() &&
      event.key.startsWith("Arrow") &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      controller.NavigateReference(
        event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0,
        event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0,
        event.shiftKey,
      );
      return;
    }
    if (
      controller.inputHandler.IsReferenceSelection() &&
      event.key !== "Escape" &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      controller.inputHandler.PrepareReferenceInput();
      event.currentTarget.setSelectionRange(
        controller.inputSelection[0],
        controller.inputSelection[1],
      );
    }
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
    if (referenceOpen) return;
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
    if (event.key === "Home") {
      const d = frame.GetDispatcher();
      const command = d.FindCommandByShortcut(getBrowserShortcut(event) as string);
      if (command) {
        event.preventDefault();
        d.Execute(command.command.id);
        return;
      }
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
      if (selection) controller.SetInputSelection(selection[0], selection[1]);
      else focusGrid();
    }
    if (action === "equals") {
      const selection = controller.StartFormula();
      controller.SetInputSelection(selection[0], selection[1]);
    }
  }
  return (
    <section
      onKeyDown={
        /** Routes file and sheet accelerators through active Sfx slots from any source input. @param event - Platform key. @returns Nothing. */ (
          event,
        ) => {
          if (event.defaultPrevented || event.nativeEvent.isComposing || modal || referenceOpen)
            return;
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
        <div className="contents" inert={referenceOpen}>
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
                menus={menus}
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
                hideUnregistered
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
              /** Changes the input owner's sole draft. @param value - Draft. @param selection - Actual DOM UTF16 selection. @returns Nothing. */ (
                value,
                selection,
              ) => {
                controller.ChangeInput(value);
                controller.SetInputSelection(selection[0], selection[1]);
              }
            }
            onInputFocus={
              /** Enters TOP without overriding the browser-owned focus selection. Programmatic native input has already selected TOP before its focus is projected. @param event - Actual edit view focus. @returns Nothing. */ (
                event,
              ) => {
                if (controller.mode !== ScInputMode.SC_INPUT_TOP) {
                  browserTopFocus.current =
                    event.currentTarget === event.currentTarget.ownerDocument.activeElement;
                  controller.StartInput(ScInputMode.SC_INPUT_TOP);
                }
              }
            }
            onInputCommand={inputCommand}
            onInputSelection={
              /** Borrows actual native edit selection after its controlled text has rendered. @param start - UTF16 start. @param end - UTF16 end. @param value - DOM text associated with these endpoints. @returns Nothing. */ (
                start,
                end,
                value,
              ) => {
                if (value === controller.Input()) controller.SetInputSelection(start, end);
              }
            }
            onInputKeyDown={inputKey}
            onAction={inputAction}
          />
        </div>
        <ScGridWindow
          onOutline={
            /** Routes native outline window controls. @param control - Selected group or level. @returns Nothing. */
            (control) => {
              if (!referenceOpen) sheetWorkflows.OutlineControl(control);
            }
          }
          onActivatePane={
            /** Updates the active native pane before selecting its cell. @param part - Pointer pane. @returns Nothing. */
            (part) => view.SetActivePart(part)
          }
          referenceMode={referenceOpen || controller.inputHandler.IsFormulaMode()}
          referenceRange={
            referenceDialog
              ? referenceSelection?.owner === referenceDialog
                ? (referenceSelection.range ?? null)
                : null
              : controller.ReferenceRange()
          }
          onReveal={
            /** Reveals native selection endpoints without moving the active cursor. @param position - Endpoint. @param kind - Pointer surface. @returns Nothing. */
            (position, kind) => revealCell(position.Col(), position.Row(), kind)
          }
          onPointerEnd={
            /** Ends actual native pointer selection. @returns Nothing. */ () =>
              referenceOpen ? printInput.current?.End() : controller.EndPointer()
          }
          onDrag={
            /** Updates the real reference endpoint during native window tracking. @param position - Endpoint. @returns Nothing. */ (
              position,
            ) =>
              referenceOpen ? printInput.current?.Move(position) : controller.MovePointer(position)
          }
          {...(referenceOpen
            ? {}
            : {
                headerSizing: {
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
                },
              })}
          idPrefix="calc"
          viewData={view}
          viewport={controller.viewport}
          inputMode={controller.mode}
          inputText={controller.inputText}
          getCell={
            /** Reads actual formatted scalar/formula results. @param pos - Cell. @returns Presentation. */ (
              pos,
            ) =>
              cellPresentation(
                doc,
                pos,
                view.GetOptions().GetOption(ViewOption.FORMULAS),
                view.GetOptions().GetOption(ViewOption.NULLVALS),
              )
          }
          onSelect={
            /** Routes pointer selection with shift extension. @param pos - Cell. @param event - Pointer. @returns Nothing. */ (
              pos,
              event,
            ) => {
              const append = event.ctrlKey || event.metaKey;
              if (referenceOpen) printInput.current?.Start(pos, "cell", append);
              else controller.StartPointer(pos, event.shiftKey, append);
            }
          }
          onHeader={
            /** Selects actual source row/column/all marks. @param kind - Header. @param index - Coordinate. @param event - Actual input modifiers. @returns Nothing. */ (
              kind,
              index,
              event,
            ) => {
              if (referenceOpen) {
                printInput.current?.Start(
                  new ScAddress(
                    kind === "column" ? index : 0,
                    kind === "row" ? index : 0,
                    activeTab,
                  ),
                  kind,
                  event.ctrlKey || event.metaKey,
                );
                if (event.type === "click" || kind === "all") printInput.current?.End();
                return;
              }
              if (kind === "all") {
                if (controller.inputHandler.IsFormulaMode()) {
                  controller.PointReference(new ScAddress(0, 0, view.GetTabNumber()));
                  controller.DragReference(
                    new ScAddress(doc.MaxCol(), doc.MaxRow(), view.GetTabNumber()),
                  );
                } else controller.Header("all", 0);
              } else {
                controller.StartPointer(
                  new ScAddress(
                    kind === "column" ? index : 0,
                    kind === "row" ? index : 0,
                    view.GetTabNumber(),
                  ),
                  event.shiftKey,
                  event.ctrlKey || event.metaKey,
                  kind,
                );
                if (event.type === "click") controller.EndPointer();
              }
            }
          }
          onEdit={
            /** Starts inline editing through the input owner. @param pos - Cell. @returns Nothing. */ (
              pos,
            ) => {
              if (referenceOpen || controller.inputHandler.IsFormulaMode()) return;
              if (controller.Select(pos.Col(), pos.Row()))
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
            /** Shares one draft with the formula line. @param value - Draft. @param selection - Actual DOM UTF16 selection. @returns Nothing. */ (
              value,
              selection,
            ) => {
              controller.ChangeInput(value);
              controller.SetInputSelection(selection[0], selection[1]);
            }
          }
          onInputPointerDown={
            /** Native edit-view mouse input ends reference selection and switches TYPE to TABLE before caret/word selection. @returns Nothing. */ () => {
              controller.inputHandler.ReferenceSelectionChanged();
              controller.StartInput(ScInputMode.SC_INPUT_TABLE);
            }
          }
          onInputCommand={inputCommand}
          onInputSelection={
            /** Borrows actual native edit selection after its controlled text has rendered. @param start - UTF16 start. @param end - UTF16 end. @param value - DOM text associated with these endpoints. @returns Nothing. */ (
              start,
              end,
              value,
            ) => {
              if (value === controller.Input()) controller.SetInputSelection(start, end);
            }
          }
          onInputKeyDown={inputKey}
        />
        <div ref={tabs} hidden={!showSheetTabs} inert={referenceOpen}>
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
      {sheetPopup === undefined || modal || !showSheetTabs ? null : (
        <CommandPopupMenu
          ariaLabel="Calc sheet context menu"
          commandSource={source}
          items={sheetMenuItems}
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
      <CalcSheetDialogs
        {...{
          sheetWorkflows,
          widthDialog,
          tabDialog,
          sheetDialog,
          pageStyleDialog,
          headerFooterDialog,
          condEditor,
          condManager,
        }}
        referenceInput={printInput}
        onReference={(owner, range) => setReferenceSelection({ owner, range })}
      />
      {printDialog && (
        <ScPrintAreasDlg
          key={printDialog.id}
          model={printDialog.request}
          referenceInput={printInput}
          onReference={(range) => setReferenceSelection({ owner: printDialog, range })}
          onCancel={() => sheetWorkflows.printDialogs.Cancel(printDialog.id)}
          onSubmit={(request) => sheetWorkflows.printDialogs.Complete(printDialog.id, request)}
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
