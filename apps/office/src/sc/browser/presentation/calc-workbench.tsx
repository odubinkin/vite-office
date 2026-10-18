/** @fileoverview Production Calc workbench over canonical model/view/input owners,shared Sfx controls and Writer visual resources. */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { Undo2, Redo2, FolderOpen } from "lucide-react";
import { CalcViewController } from "../controller/calc-view-controller";
import { cellPresentation } from "../editor/cell-input";
import { ScGridWindow } from "./ScGridWindow";
import { ScInputWindow, type CalcInputAction } from "./ScInputWindow";
import { ScTabControl } from "./ScTabControl";
import type { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { CommandToolbarItems } from "../../../framework/browser/presentation/CommandToolbar";
import { OfficeWorkspaceHeader } from "../../../framework/browser/presentation/OfficeWorkspaceHeader";
import { calcStandardBarItems } from "../../uiconfig/scalc/toolbar/standardbar";
import type { CalcFileWorkflows } from "../workflows/calc-file-workflows";
import { CalcFileDialog } from "./CalcFileDialog";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import { calcMenus, getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { MAXTAB } from "../../inc/address";
/** Production document/view and its shared Sfx frame. */
export interface CalcWorkbenchProps {
  readonly fileWorkflows: CalcFileWorkflows;
  readonly controller: CalcViewController;
  readonly frame: SfxViewFrame<CalcViewController>;
}
/** Renders one mounted Calc editing session. @param props - Canonical owners. @returns Workspace. */
export function CalcWorkbench({
  controller,
  frame,
  fileWorkflows,
}: CalcWorkbenchProps): React.JSX.Element {
  useSyncExternalStore(controller.Subscribe, controller.GetSnapshot, controller.GetSnapshot);
  const dialog = useSyncExternalStore(
    fileWorkflows.dialogs.Subscribe,
    fileWorkflows.dialogs.GetSnapshot,
    fileWorkflows.dialogs.GetSnapshot,
  );
  const root = useRef<HTMLElement>(null),
    tabs = useRef<HTMLDivElement>(null);
  const view = controller.viewData,
    doc = controller.shell.GetDocument();
  const cursorColumn = view.GetCurX(),
    cursorRow = view.GetCurY(),
    activeTab = view.GetTabNumber(),
    inputMode = controller.mode;
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
      const visibleRows = Math.max(
          1,
          Math.floor((client.clientHeight - viewport.rowHeight) / viewport.rowHeight),
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
        client.scrollTop =
          (first / Math.max(1, doc.MaxRow() + 1 - visibleRows)) *
          (viewport.scrollHeight - client.clientHeight);
        client.scrollLeft = Math.max(0, col - viewport.columns + 2) * viewport.columnWidth;
        controller.Scroll(
          client.scrollLeft,
          client.scrollTop,
          client.clientWidth,
          client.clientHeight,
        );
      }
    },
    [controller, doc, cursorColumn, cursorRow, activeTab, inputMode],
  );
  /** Routes one input key while retaining IME ownership until composition completes. @param event - Input key. @returns Nothing. */
  function inputKey(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      controller.Cancel();
      focusGrid();
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      if (controller.Commit()) {
        const delta = event.shiftKey ? -1 : 1;
        controller.Select(
          view.GetCurX() + (event.key === "Tab" ? delta : 0),
          view.GetCurY() + (event.key === "Enter" ? delta : 0),
        );
        focusGrid();
      }
    }
  }
  /** Routes document keys to native-shaped input/view operations or the shared dispatcher. @param event - Grid key. @returns Nothing. */
  function key(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.nativeEvent.isComposing) return;
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
    if (event.key === "F2") {
      event.preventDefault();
      controller.StartInput("table");
      return;
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
      controller.Select(
        view.GetCurX() + move[0],
        view.GetCurY() + move[1],
        event.shiftKey && event.key.startsWith("Arrow"),
      );
      return;
    }
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
      event.preventDefault();
      controller.StartInput("table", event.key);
    }
  }
  /** Handles the native input-line action composition. @param action - Available action. @returns Nothing. */
  function inputAction(action: CalcInputAction): void {
    if (action === "cancel") {
      controller.Cancel();
      focusGrid();
    }
    if (action === "accept" && controller.Commit()) focusGrid();
    if (action === "equals") {
      controller.StartInput("top", "=");
      (
        (root.current as HTMLElement).querySelector('[aria-label="Input line"]') as HTMLInputElement
      ).focus();
    }
  }
  return (
    <section
      onKeyDown={
        /** Routes file and sheet accelerators through active Sfx slots from any source input. @param event - Platform key. @returns Nothing. */ (
          event,
        ) => {
          if (
            event.nativeEvent.isComposing ||
            dialog !== undefined ||
            !(event.ctrlKey || event.metaKey)
          )
            return;
          const key = event.key.toLowerCase(),
            url =
              !event.altKey && !event.shiftKey && key === "pagedown"
                ? ".uno:JumpToNextTable"
                : !event.altKey && !event.shiftKey && key === "pageup"
                  ? ".uno:JumpToPrevTable"
                  : key === "o"
                    ? ".uno:OpenFromCalc"
                    : key === "s" && event.shiftKey
                      ? ".uno:SaveAs"
                      : undefined;
          if (url) {
            event.preventDefault();
            frame.GetDispatcher().Execute(url);
          }
        }
      }
      ref={root}
      aria-label="Calc workspace"
      className="flex h-dvh w-full min-h-0 min-w-0 flex-col overflow-hidden bg-slate-100"
    >
      <div className="contents" inert={dialog !== undefined}>
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
              isInputEnabled={dialog === undefined}
              menus={calcMenus}
              resolveArguments={
                /** File/history slots need no arguments. @returns Nothing. */ () => undefined
              }
            />
          }
          toolbar={
            <CommandToolbarItems
              commandSource={source}
              items={calcStandardBarItems}
              icons={
                new Map([
                  [".uno:OpenFromCalc", FolderOpen],
                  [".uno:Undo", Undo2],
                  [".uno:Redo", Redo2],
                ])
              }
              getCommandResource={getCalcCommandResource}
              resolveArguments={
                /** Current standard slots need no arguments. @returns Nothing. */ () => undefined
              }
            />
          }
        />

        <ScInputWindow
          addressText={controller.addressText}
          inputText={controller.Input()}
          editing={controller.mode !== "none"}
          enabledActions={
            new Set<CalcInputAction>(controller.mode === "none" ? ["equals"] : ["cancel", "accept"])
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
            /** Enters formula-line mode. @returns Nothing. */ () => controller.StartInput("top")
          }
          onInputKeyDown={inputKey}
          onAction={inputAction}
        />
        <ScGridWindow
          idPrefix="calc"
          viewData={view}
          viewport={controller.viewport}
          editing={controller.mode === "table"}
          inputText={controller.inputText}
          getCell={
            /** Reads actual formatted scalar/formula results. @param pos - Cell. @returns Presentation. */ (
              pos,
            ) => cellPresentation(doc, pos)
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
              controller.StartInput("table");
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
        <footer
          role="status"
          aria-label="Calc status bar"
          className="flex shrink-0 items-center gap-5 border-t border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300"
        >
          <span>
            Sheet {view.GetTabNumber() + 1} of {doc.GetTableCount()}
          </span>
          <span>{controller.Address()}</span>
          <span className="ml-auto">{controller.error || "Ready"}</span>
        </footer>
      </div>
      {dialog === undefined ? null : (
        <CalcFileDialog
          workflows={fileWorkflows}
          kind={dialog}
          onClose={
            /** Closes the dialog and restores the actual grid focus. @returns Nothing. */ () => {
              fileWorkflows.dialogs.Close();
              focusGrid();
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
