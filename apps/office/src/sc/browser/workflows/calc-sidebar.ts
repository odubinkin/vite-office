/** @fileoverview Calc's Sfx Sidebar child registration and native View menu command. */
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";

/** Registered Sfx Sidebar child window command. */
export const SIDEBAR_COMMAND = ".uno:Sidebar";

/** Creates the Calc frame's original Sidebar child control. @param invalidate - Active Sfx invalidation callback. @param shortcuts - Configured Calc shortcuts. @returns Bound Sfx shell. */
export function createCalcSidebarShell(
  invalidate: () => void,
  shortcuts: readonly string[],
): SfxShell {
  const child = { visible: true };
  return createSfxShell(
    child,
    new SfxInterface<typeof child>([
      {
        slotId: 10336,
        commandUrl: SIDEBAR_COMMAND,
        shortcuts,
        label: "Sidebar",
        /** Reports the native child-window visibility. @param target - Sidebar child. @returns Checked state. */
        getState: (target) => ({ enabled: true, checked: target.visible }),
        /** Toggles the native sidebar child's visibility. @param target - Sidebar child. @param request - Native request. @returns Nothing. */
        execute: (target, request) => {
          target.visible = !target.visible;
          request.Done();
          invalidate();
        },
      },
    ]),
  );
}
