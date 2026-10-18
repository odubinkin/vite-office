/** @fileoverview Consumed Calc SDI slots from scalc.sdi,sc.hrc,sfxsids.hrc and solar.hrc; no local command IDs are invented. */
import { SfxInterface } from "../../sfx2/source/control/objface";
import { SfxUnoAnyItem } from "../../sfx2/source/view/frame";
/** Command owner contract corresponding to the active Calc input/view shell. */
export interface CalcCommandTarget {
  CanUndo(): boolean;
  CanRedo(): boolean;
  Undo(): boolean;
  Redo(): boolean;
  EnterString(value: string, dontCommit?: boolean): boolean;
  Commit(): boolean;
  SetInputMode(): boolean;
  SelectNextTab(direction: number, extend?: boolean): void;
  SelectAllTables(): void;
  DeselectAllTables(): void;
  HasMultipleSelectedTables(): boolean;
}
/** Resource labels for the initial implemented edit slots; full Calc resource/menu projection follows separately. */
export const calcEditCommands = [
  { id: ".uno:Undo", slotId: 5701, label: "Undo", shortcut: "Control+z" },
  { id: ".uno:Redo", slotId: 5700, label: "Redo", shortcut: "Control+Shift+z" },
] as const;
/** Consumed source file slots and menu resources;primary browser saving replaces native recovery/save policy. */
export const calcFileCommands = [
  {
    id: ".uno:OpenFromCalc",
    slotId: 26204,
    label: "Open",
    shortcuts: ["Control+o"],
    kind: "open",
  },
  {
    id: ".uno:SaveAs",
    slotId: 5502,
    label: "Save As",
    shortcuts: ["Control+Shift+s"],
    kind: "save-as",
  },
  { id: ".uno:ExportTo", slotId: 5829, label: "Export", shortcuts: [], kind: "export" },
] as const;
/** Native adjacent-sheet slots:SID_KEYFUNC_START=26521;sheet grouping slots:TAB_POPUP_START=26358. */
export const calcSheetNavigationCommands = [
  {
    id: ".uno:JumpToNextTable",
    slotId: 26543,
    label: "To Next Sheet",
    direction: 1,
    extend: false,
    shortcuts: ["Control+PageDown"],
  },
  {
    id: ".uno:JumpToPrevTable",
    slotId: 26544,
    label: "To Previous Sheet",
    direction: -1,
    extend: false,
    shortcuts: ["Control+PageUp"],
  },
  {
    id: ".uno:JumpToNextTableSel",
    slotId: 26561,
    label: "Select to Next Sheet",
    direction: 1,
    extend: true,
    shortcuts: [],
  },
  {
    id: ".uno:JumpToPrevTableSel",
    slotId: 26562,
    label: "Select to Previous Sheet",
    direction: -1,
    extend: true,
    shortcuts: [],
  },
] as const;
/** Select-all is a native menubar/context operation;deselect is a native context operation. */
export const calcSheetSelectionCommands = [
  { id: ".uno:TableSelectAll", slotId: 26361, label: "Select All Sheets" },
  { id: ".uno:TableDeselectAll", slotId: 26365, label: "Deselect All Sheets" },
] as const;
/** Native asynchronous Go to Sheet slot and public Nr contract. */
export const calcGoToSheetCommand = {
  id: ".uno:JumpToTable",
  slotId: 26042,
  label: "Go to Sheet",
} as const;
/** Native cell-edit-mode slot,from SID_KEYFUNC_START+31. */
export const calcInputModeCommand = {
  id: ".uno:SetInputMode",
  slotId: 26552,
  label: "Cell Edit Mode",
} as const;
/** User-visible implemented command inventory;hidden input slots remain dispatcher operations. */
export const calcUserCommands = [
  ...calcEditCommands,
  calcInputModeCommand,
  ...calcFileCommands,
  ...calcSheetNavigationCommands,
  ...calcSheetSelectionCommands,
  calcGoToSheetCommand,
].map(
  /** Associates visible history controls with bounded workspace evidence. @param item - SDI edit slot. @returns Inventory entry. */
  (item) => ({
    id: item.id,
    label: item.label,
    capabilityId:
      item.id === ".uno:JumpToTable"
        ? ("CAP-8e01c4d7-b3fb-41da-9f65-0689a89e1256" as const)
        : "direction" in item ||
            item.id === ".uno:TableSelectAll" ||
            item.id === ".uno:TableDeselectAll"
          ? ("CAP-3315316f-31e4-478e-b359-0cd714f0db20" as const)
          : "kind" in item
            ? ("CAP-6d21e904-65a9-4c25-96af-7d47dcce9f50" as const)
            : ("CAP-52bb76b0-ff2d-4a8c-86df-79f033c21d86" as const),
  }),
);
/** Builds actual Sfx slots using original numeric identities and request arguments. @returns Interface. */
export function createCalcInterface(): SfxInterface<CalcCommandTarget> {
  return new SfxInterface<CalcCommandTarget>([
    {
      commandUrl: calcInputModeCommand.id,
      slotId: calcInputModeCommand.slotId,
      label: calcInputModeCommand.label,
      shortcuts: ["F2"],
      execute:
        /** Applies the native mode transition through the active input owner. @param target - Active view binding. @returns Accepted. */ (
          target,
        ) => target.SetInputMode(),
    },
    ...calcEditCommands.map(
      /** Binds original shared history slots to the active shell. @param resource - SDI resource. @returns Slot. */ (
        resource,
      ) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        shortcuts: [resource.shortcut],
        getState:
          /** Reads actual source action availability. @param target - Active owner. @returns State. */ (
            target: CalcCommandTarget,
          ) => ({ enabled: resource.id === ".uno:Undo" ? target.CanUndo() : target.CanRedo() }),
        execute:
          /** Executes through the actual action manager. @param target - Active owner. @returns Changed. */ (
            target: CalcCommandTarget,
          ) => (resource.id === ".uno:Undo" ? target.Undo() : target.Redo()),
      }),
    ),
    ...calcSheetNavigationCommands.map(
      /** Binds the native ExecuteMove direction/extension contract. @param resource - Source slot. @returns Slot. */ (
        resource,
      ) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        shortcuts: resource.shortcuts,
        execute:
          /** Delegates through input commit and the actual source view owner. @param target - Active view. @returns Nothing. */ (
            target: CalcCommandTarget,
          ) => target.SelectNextTab(resource.direction, resource.extend),
      }),
    ),
    ...calcSheetSelectionCommands.map(
      /** Binds source tab-group slots and their original availability rule. @param resource - Source slot. @returns Slot. */ (
        resource,
      ) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        getState:
          /** Deselect is available only for multiple selected sheets. @param target - Active view. @returns State. */ (
            target: CalcCommandTarget,
          ) => ({
            enabled: resource.id === ".uno:TableSelectAll" || target.HasMultipleSelectedTables(),
          }),
        execute:
          /** Changes canonical sheet membership without modifying the document. @param target - Active view. @returns Nothing. */ (
            target: CalcCommandTarget,
          ) =>
            resource.id === ".uno:TableSelectAll"
              ? target.SelectAllTables()
              : target.DeselectAllTables(),
      }),
    ),
    {
      commandUrl: ".uno:EnterString",
      slotId: 26137,
      label: "Input",
      execute:
        /** Consumes the same structured Sfx request boundary as Writer. @param target - Input owner. @param request - Slot request. @returns Accepted. */ (
          target,
          request,
        ) => {
          const item = request
            .GetArgs()
            .find(
              /** Finds the structured UNO argument. @param value - Request item. @returns Is argument. */ (
                value,
              ) => value instanceof SfxUnoAnyItem,
            ) as SfxUnoAnyItem | undefined;
          const value = item?.GetValue();
          if (
            typeof value !== "object" ||
            value === null ||
            !("StringName" in value) ||
            typeof value.StringName !== "string" ||
            ("DontCommit" in value && typeof value.DontCommit !== "boolean")
          )
            throw new TypeError("EnterString requires StringName and optional boolean DontCommit.");
          return target.EnterString(
            value.StringName,
            "DontCommit" in value ? (value.DontCommit as boolean) : false,
          );
        },
    },
    {
      commandUrl: ".uno:InputLineEnter",
      slotId: 26101,
      label: "Accept input",
      execute: /** Commits actual input state. @param target - Input owner. @returns Accepted. */ (
        target,
      ) => target.Commit(),
    },
  ]);
}
