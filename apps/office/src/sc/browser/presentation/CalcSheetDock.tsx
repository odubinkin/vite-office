/** @fileoverview Calc's sheet surface beside its Sfx Sidebar child and above the status bar. */
import type { ReactNode } from "react";
import { SidebarDeck } from "../../../sfx2/browser/presentation/SidebarDeck";
import {
  type BrowserCommandSource,
  useBrowserCommandState,
} from "../../../framework/browser/presentation/command-surface";
import type { CalcViewController } from "../controller/calc-view-controller";
import { NumberFormatPropertyPanel } from "../sidebar/NumberFormatPropertyPanel";
import { SIDEBAR_COMMAND } from "../workflows/calc-sidebar";

/** Lays out the existing sheet and right-docked, initially collapsed Properties child.
 * @param props - Mounted Calc sheet and frame owners.
 * @param props.children - Grid and sheet tabs.
 * @param props.commandSource - Current Sfx frame.
 * @param props.controller - Actual Calc view.
 * @param props.focusDocument - Returns focus to the document.
 * @returns Sheet, sidebar and status chrome.
 */
export function CalcSheetDock({
  children,
  commandSource,
  controller,
  focusDocument,
}: {
  readonly children: ReactNode;
  readonly commandSource: BrowserCommandSource;
  readonly controller: CalcViewController;
  readonly focusDocument: () => void;
}): React.JSX.Element {
  const sidebar = useBrowserCommandState(commandSource, SIDEBAR_COMMAND);
  const objectShell = controller.shell;
  return (
    <>
      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col">{children}</div>
        <div className={sidebar.checked ? "contents" : undefined} hidden={!sidebar.checked}>
          <SidebarDeck
            ariaLabel="Calc properties sidebar"
            title="Properties"
            initiallyOpen={false}
            focusDocument={focusDocument}
          >
            <NumberFormatPropertyPanel {...{ commandSource, objectShell, focusDocument }} />
          </SidebarDeck>
        </div>
      </div>
      <div
        role="status"
        aria-label="Calc status bar"
        className="flex shrink-0 items-center gap-5 border-t border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300"
      >
        <span>
          Sheet {controller.viewData.GetTabNumber() + 1} of{" "}
          {objectShell.GetDocument().GetTableCount()}
        </span>
        <span>{controller.Address()}</span>
        <span className="ml-auto">{controller.error || "Ready"}</span>
      </div>
    </>
  );
}
