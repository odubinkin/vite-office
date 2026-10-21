/** @fileoverview Original view-option slots from scalc.sdi/tabvwsh.sdi,sc.hrc and solar.hrc;browser dispatch retains native request/state owners. */
import type { SfxRequest } from "../../sfx2/source/control/request";
import type { SfxSlotDefinition } from "../../sfx2/source/control/msg";
/** Native view command identity used only to route the actual cases. */
export type CalcViewOption = "headers" | "formulas" | "grid";
/** Original numeric slot identities:VIEW_MENU_START26240 and SC_RESOURCE_START25000. */
export const calcViewCommands = [
  { id: ".uno:ViewRowColumnHeaders", slotId: 26242, label: "View Headers", option: "headers" },
  { id: ".uno:ToggleFormula", slotId: 26250, label: "Show Formulas", option: "formulas" },
  { id: ".uno:ToggleSheetGrid", slotId: 25018, label: "View Grid Lines", option: "grid" },
] as const;
/** Active view contract;the core owns all persistent values. */
export interface CalcViewCommandTarget {
  GetViewOptionState(option: CalcViewOption): boolean;
  ExecuteViewOption(option: CalcViewOption, request: SfxRequest): void;
}
/** Binds native checked states and request cases to existing Sfx. @returns Actual slots. */
export function createCalcViewSlots(): SfxSlotDefinition<CalcViewCommandTarget>[] {
  return calcViewCommands.map(
    /** Creates one original slot binding. @param resource - Native command. @returns Slot. */ (
      resource,
    ) => ({
      commandUrl: resource.id,
      slotId: resource.slotId,
      label: resource.label,
      getState: /** Reads the actual view option. @param target - Active view. @returns State. */ (
        target,
      ) => ({ enabled: true, checked: target.GetViewOptionState(resource.option) }),
      execute:
        /** Routes original bool items through the existing native request. @param target - Active view. @param request - Native request. @returns Nothing. */ (
          target,
          request,
        ) => target.ExecuteViewOption(resource.option, request),
    }),
  );
}
