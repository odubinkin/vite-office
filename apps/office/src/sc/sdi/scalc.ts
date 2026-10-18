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
/** User-visible implemented command inventory;hidden input slots remain dispatcher operations. */
export const calcUserCommands = [...calcEditCommands, ...calcFileCommands].map(
  /** Associates visible history controls with bounded workspace evidence. @param item - SDI edit slot. @returns Inventory entry. */
  (item) => ({
    id: item.id,
    label: item.label,
    capabilityId:
      "kind" in item
        ? ("CAP-6d21e904-65a9-4c25-96af-7d47dcce9f50" as const)
        : ("CAP-52bb76b0-ff2d-4a8c-86df-79f033c21d86" as const),
  }),
);
/** Builds actual Sfx slots using original numeric identities and request arguments. @returns Interface. */
export function createCalcInterface(): SfxInterface<CalcCommandTarget> {
  return new SfxInterface<CalcCommandTarget>([
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
