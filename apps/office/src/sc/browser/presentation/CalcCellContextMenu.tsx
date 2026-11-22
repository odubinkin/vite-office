/** @fileoverview Native Calc cell popup over the active grid position and shared command presenter. */
import { useEffect, useState, type RefObject } from "react";
import type { BrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { CommandPopupMenu } from "../../../framework/browser/presentation/CommandPopupMenu";
import { selectAvailableMenuItems } from "../../../framework/browser/presentation/available-menu-items";
import {
  calcCellPopupItems,
  getCalcPopupCommandResource,
} from "../../uiconfig/scalc/menubar/menubar";
import type { CalcViewController } from "../controller/calc-view-controller";
import { resolveCalcCommandArguments } from "./calc-workbench-keys";

/** Connects the cell popup only within this frame's admitted grid.
 * @param props - Active view ports.
 * @param props.root - Actual Calc workspace.
 * @param props.controller - Native Calc selection owner.
 * @param props.source - Active Sfx command source.
 * @param props.inactive - Another owner currently has the grid.
 * @returns Native cell popup if open.
 */
export function CalcCellContextMenu({
  root,
  controller,
  source,
  inactive,
}: {
  readonly root: RefObject<HTMLElement | null>;
  readonly controller: CalcViewController;
  readonly source: BrowserCommandSource;
  readonly inactive: boolean;
}): React.JSX.Element | null {
  const [position, setPosition] = useState<{ x: number; y: number }>();
  useEffect(
    /** Binds the native context request to this workspace and its actual grid. @returns Listener cleanup. */
    () => {
      const workspace = root.current;
      if (!workspace || inactive) return;
      /** Preserves an existing mark that contains the clicked cell. @param event - Native context request. @returns Nothing. */
      function open(event: MouseEvent): void {
        if (!(event.target instanceof HTMLElement) || event.target.closest("input,textarea"))
          return;
        const grid = event.target.closest<HTMLElement>('[role="grid"]');
        if (!grid) return;
        const cell = event.target.closest<HTMLElement>("[data-calc-column][data-calc-row]");
        if (cell) {
          const col = Number(cell.dataset.calcColumn),
            row = Number(cell.dataset.calcRow);
          if (
            !controller.viewData.GetMarkData().IsCellMarked(col, row) &&
            !controller.Select(col, row)
          )
            return;
        }
        event.preventDefault();
        const corner = cell?.getBoundingClientRect() ?? grid.getBoundingClientRect();
        setPosition({ x: event.clientX || corner.left, y: event.clientY || corner.bottom });
      }
      workspace.addEventListener("contextmenu", open);
      return /** Removes the grid context listener on unmount. @returns Nothing. */ () =>
        workspace.removeEventListener("contextmenu", open);
    },
    [controller, inactive, root],
  );
  if (inactive || !position) return null;
  return (
    <CommandPopupMenu
      ariaLabel="Calc cell context menu"
      commandSource={source}
      position={position}
      resolveArguments={resolveCalcCommandArguments}
      getCommandResource={getCalcPopupCommandResource}
      items={selectAvailableMenuItems(calcCellPopupItems, source)}
      onClose={/** Closes the active cell popup. @returns Nothing. */ () => setPosition(undefined)}
    />
  );
}
