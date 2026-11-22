/** @fileoverview Original view-option slots from scalc.sdi/tabvwsh.sdi,sc.hrc and solar.hrc;browser dispatch retains native request/state owners. */
import { createCalcNumberFormatSlots } from "./formatsh.numformat";
import type { SfxSlotState } from "../../sfx2/source/control/bindings";
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
export const SID_STYLE_APPLY = 5552;
/** Cell format and selection slots at SID_NEW_SLOTS + 105 and +106. */
export const SID_SCATTR_CELLPROTECTION = 26676;
export const SID_SELECT_UNPROTECTED_CELLS = 26677;
/** Original sheet protection slot at EXTRA_MENU_START + 6. */
export const FID_PROTECT_TABLE = 26314;
export const SID_DEFINE_PRINTAREA = 26602;

/** Original SID_FORMATPAGE at FORMAT_MENU_START + 17. */
export const calcPageStyleCommand = {
  id: ".uno:PageFormatDialog",
  slotId: 26302,
  label: "Page Style",
} as const;

/** Source view-shell print range slots from SID_NEW_SLOTS. */
export const calcPrintRangeCommands = [
  { id: ".uno:DefinePrintArea", slotId: SID_DEFINE_PRINTAREA, label: "Print Area", kind: "define" },
  { id: ".uno:AddPrintArea", slotId: 26651, label: "Add", kind: "add" },
  { id: ".uno:EditPrintArea", slotId: 26605, label: "Edit", kind: "edit" },
  { id: ".uno:DeletePrintArea", slotId: 26603, label: "Clear", kind: "clear" },
] as const;

/** Original SID_HFEDIT at EDIT_MENU_START + 15. */
export const calcHeaderFooterCommand = {
  id: ".uno:EditHeaderAndFooter",
  slotId: 26235,
  label: "Headers and Footers",
} as const;

/** Native page setup command inventory used by the Calc view shell. */
export const calcPageCommands = [
  ...calcPrintRangeCommands,
  calcPageStyleCommand,
  calcHeaderFooterCommand,
] as const;

/** Native dialog-result slot and its typed Which IDs. */
export const SID_CHANGE_PRINTAREA = 26604;
export const FN_PRINT_REPEAT_ROW = 21161;
export const FN_PRINT_REPEAT_COL = 21162;
export const FN_PRINT_ENTIRE_SHEET = 21163;

/** Active view contract;the core owns all persistent values. */
export interface CalcViewCommandTarget {
  GetCellStyleState(): SfxSlotState;
  GetNumFormatState(slot: number): SfxSlotState;
  ExecuteNumFormat(request: SfxRequest): boolean;
  GetCellProtectionState(): boolean;
  ExecuteCellProtection(request: SfxRequest): boolean;
  SelectUnprotectedCells(): boolean;
  CanRepeat(): boolean;
  Repeat(): boolean;
  ExecuteCellStyle(request: SfxRequest): number | undefined;
  GetViewOptionState(option: CalcViewOption): boolean;
  ExecuteViewOption(option: CalcViewOption, request: SfxRequest): void;
}
/** Binds native checked states and request cases to existing Sfx. @returns Actual slots. */
export function createCalcViewSlots(): SfxSlotDefinition<CalcViewCommandTarget>[] {
  const viewOptions = calcViewCommands.map<SfxSlotDefinition<CalcViewCommandTarget>>(
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
  return [
    ...viewOptions,
    ...createCalcNumberFormatSlots(),
    {
      commandUrl: ".uno:StyleApply",
      slotId: SID_STYLE_APPLY,
      label: "Apply Style",
      /** Reads selection state from the active view. @param target - Active view. @returns Style state. */
      getState: (target) => target.GetCellStyleState(),
      /** Forwards the original request. @param target - Active view. @param request - Native request. @returns Result mask. */
      execute: (target, request) => target.ExecuteCellStyle(request),
    },
    {
      commandUrl: ".uno:CellProtection",
      slotId: SID_SCATTR_CELLPROTECTION,
      label: "Cell Protection",
      /** Reads the native item state. @param target - Active view. @returns Slot state. */
      getState: (target) => ({ enabled: true, checked: target.GetCellProtectionState() }),
      /** Executes the native toggle. @param target - Active view. @param request - Native request. @returns Whether applied. */
      execute: (target, request) => target.ExecuteCellProtection(request),
    },
    {
      commandUrl: ".uno:SelectUnprotectedCells",
      slotId: SID_SELECT_UNPROTECTED_CELLS,
      label: "Select Unprotected Cells",
      /** Applies unlocked marks to the real view. @param target - Active view. @returns Whether admitted. */
      execute: (target) => target.SelectUnprotectedCells(),
    },
    {
      commandUrl: ".uno:Repeat",
      slotId: 5702,
      label: "Repeat",
      /** Reads availability from the actual undo stack. @param target - Active view. @returns State. */
      getState: (target) => ({ enabled: target.CanRepeat() }),
      /** Repeats the native action at the current selection. @param target - Active view. @returns Whether repeated. */
      execute: (target) => target.Repeat(),
    },
  ];
}
