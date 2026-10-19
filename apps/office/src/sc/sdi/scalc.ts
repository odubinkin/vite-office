/** @fileoverview Consumed Calc SDI slots from scalc.sdi,sc.hrc,sfxsids.hrc and solar.hrc; no local command IDs are invented. */
import { FontLineStyle } from "../../tools/inc/fontenum";
import { SvxFontItem } from "../../editeng/inc/fontitem";
import type { CalcCharacterFormat } from "../source/ui/view/formatsh";
import type { SfxSlotDefinition } from "../../sfx2/source/control/msg";
import { SfxInterface } from "../../sfx2/source/control/objface";
import { SfxUnoAnyItem } from "../../sfx2/source/view/frame";
/** Command owner contract corresponding to the active Calc input/view shell. */
export interface CalcCommandTarget {
  GetFontFamily(): string | undefined;
  SetFontFamily(font: SvxFontItem): boolean;
  GetCharacterState(format: CalcCharacterFormat): boolean | undefined;
  SetCharacterFormat(format: CalcCharacterFormat, enabled?: boolean): boolean;
  GetUnderlineStyle(): FontLineStyle | undefined;
  SetUnderlineStyle(
    style: FontLineStyle.LINESTYLE_SINGLE | FontLineStyle.LINESTYLE_DOUBLE,
  ): boolean;
  GetFontSize(): number | undefined;
  SetFontSize(points: number): boolean;
  CanUndo(): boolean;
  CanRedo(): boolean;
  Undo(): boolean;
  Redo(): boolean;
  EnterString(value: string, dontCommit?: boolean): boolean;
  Commit(): boolean;
  SetInputMode(): boolean;
  MarkRows(): boolean;
  MarkColumns(): boolean;
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
/** Native normal-grid selection slots from SID_KEYFUNC_START+26/+27. */
export const calcCellSelectionCommands = [
  { id: ".uno:SelectColumn", slotId: 26547, label: "Select Column" },
  { id: ".uno:SelectRow", slotId: 26548, label: "Select Row" },
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
/** Native editids.hrc character slots; existing source UI placements consume these operations. */
export const calcCharacterCommands = [
  { id: ".uno:Bold", slotId: 10009, label: "Bold", format: "bold", shortcut: "Control+b" },
  { id: ".uno:Italic", slotId: 10008, label: "Italic", format: "italic", shortcut: "Control+i" },
  {
    id: ".uno:Underline",
    slotId: 10014,
    label: "Underline",
    format: "underline",
    shortcut: "Control+u",
  },
] as const;
/** Native visible Format/Text underline variants from svxids.hrc. */
export const calcUnderlineCommands = [
  {
    id: ".uno:UnderlineSingle",
    slotId: 11196,
    label: "Single Underline",
    line: FontLineStyle.LINESTYLE_SINGLE,
  },
  {
    id: ".uno:UnderlineDouble",
    slotId: 11197,
    label: "Double Underline",
    line: FontLineStyle.LINESTYLE_DOUBLE,
  },
] as const;
/** User-visible implemented command inventory;hidden input slots remain dispatcher operations. */
export const calcUserCommands = [
  { id: ".uno:CharFontName", slotId: 10007, label: "Font Name" },
  { id: ".uno:FontHeight", slotId: 10015, label: "Font Size" },
  ...calcCharacterCommands,
  ...calcUnderlineCommands,
  ...calcEditCommands,
  calcInputModeCommand,
  ...calcFileCommands,
  ...calcSheetNavigationCommands,
  ...calcSheetSelectionCommands,
  ...calcCellSelectionCommands,
  calcGoToSheetCommand,
].map(
  /** Associates visible history controls with bounded workspace evidence. @param item - SDI edit slot. @returns Inventory entry. */
  (item) => ({
    id: item.id,
    label: item.label,
    capabilityId:
      "format" in item || "line" in item
        ? ("CAP-c13ec941-1af7-4a09-810f-df267da27388" as const)
        : item.id === ".uno:CharFontName"
          ? ("CAP-dc45e9eb-2c4d-4d11-8e1d-3fd33dcce681" as const)
          : item.id === ".uno:FontHeight"
            ? ("CAP-1c4b358a-d58f-4cb3-bd8a-a4aac3aa3bf5" as const)
            : item.id === ".uno:SelectRow" || item.id === ".uno:SelectColumn"
              ? ("CAP-2b8ae010-1d2b-4ede-8b94-8643c65d7c9f" as const)
              : item.id === ".uno:JumpToTable"
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
/** Builds actual Sfx slots using original numeric identities and request arguments. @param resolveShortcuts - Optional host configuration projection; native slot handlers remain unchanged. @returns Interface. */
export function createCalcInterface(
  resolveShortcuts?: (command: string) => readonly string[] | undefined,
): SfxInterface<CalcCommandTarget> {
  const definitions: SfxSlotDefinition<CalcCommandTarget>[] = [
    {
      commandUrl: ".uno:CharFontName",
      slotId: 10007,
      label: "Font Name",
      getState:
        /** Reads uniform native font state from the active view. @param target - Original callback input. @returns Current native font state. */ (
          target,
        ) => {
          const value = target.GetFontFamily();
          return { enabled: true, value, mixed: value === undefined };
        },
      execute:
        /** Validates the complete font item before invoking the Calc command. @param target - Original callback input. @param request - Original callback input. @returns Whether formatting changed. */ (
          target,
          request,
        ) => {
          const args = (
            request
              .GetArgs()
              .find(
                /** Finds the real structured Sfx request payload. @param item - Original callback input. @returns Operation result. */ (
                  item,
                ) => item instanceof SfxUnoAnyItem,
              ) as SfxUnoAnyItem | undefined
          )?.GetValue();
          if (args === undefined) return false;
          if (
            typeof args !== "object" ||
            args === null ||
            !("fontFamily" in args) ||
            !(args.fontFamily instanceof SvxFontItem)
          )
            throw new TypeError("CharFontName requires a complete SvxFontItem");
          return target.SetFontFamily(args.fontFamily);
        },
    },
    ...calcUnderlineCommands.map(
      /** Binds source variant commands without importing another module's shortcuts. @param resource - Native slot. @returns Slot. */
      (resource) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        getState:
          /** Reads exact source line state. @param target - View. @returns State. */
          (target: CalcCommandTarget) => {
            const value = target.GetUnderlineStyle();
            return { enabled: true, checked: value === resource.line, mixed: value === undefined };
          },
        execute:
          /** Applies the original fresh-item variant toggle. @param target - View. @returns Changed. */
          (target: CalcCommandTarget) => target.SetUnderlineStyle(resource.line),
      }),
    ),
    ...calcCharacterCommands.map(
      /** Binds real native character slots to original attribute ownership. @param resource - Source command. @returns Slot. */
      (resource) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        shortcuts: [resource.shortcut],
        getState:
          /** Publishes actual selection state to the shared controls. @param target - Active view. @returns State. */
          (target: CalcCommandTarget) => {
            const value = target.GetCharacterState(resource.format);
            return { enabled: true, checked: value ?? false, mixed: value === undefined };
          },
        execute:
          /** Admits explicit boolean host arguments or native no-argument toggle before any mutation. @param target - View. @param request - Native request. @returns Changed. */
          (
            target: CalcCommandTarget,
            request: import("../../sfx2/source/control/request").SfxRequest,
          ) => {
            const item = request.GetArgs().find(
              /** Locates the real structured request item. @param value - Argument. @returns Match. */
              (value) => value instanceof SfxUnoAnyItem,
            ) as SfxUnoAnyItem | undefined;
            const args = item?.GetValue();
            if (args === undefined) return target.SetCharacterFormat(resource.format);
            if (
              typeof args !== "object" ||
              args === null ||
              !("enabled" in args) ||
              typeof args.enabled !== "boolean"
            )
              throw new TypeError("Character formatting requires boolean enabled");
            return target.SetCharacterFormat(resource.format, args.enabled);
          },
      }),
    ),
    {
      commandUrl: ".uno:FontHeight",
      slotId: 10015,
      label: "Font Size",
      getState:
        /** Publishes actual uniform/mixed selected attribute state. @param target - Active view. @returns State. */ (
          target,
        ) => {
          const value = target.GetFontSize();
          return { enabled: true, value, mixed: value === undefined };
        },
      execute:
        /** Consumes the shared Writer widget argument at the Sfx boundary. @param target - Active view. @param request - Structured request. @returns Changed. */ (
          target,
          request,
        ) => {
          const item = request
            .GetArgs()
            .find(
              /** Finds actual structured arguments. @param value - Item. @returns Match. */ (
                value,
              ) => value instanceof SfxUnoAnyItem,
            ) as SfxUnoAnyItem | undefined;
          const args = item?.GetValue();
          // The native no-argument font dialog is not exposed by this slice.
          if (args === undefined) return false;
          if (
            typeof args !== "object" ||
            args === null ||
            !("fontSizePt" in args) ||
            typeof args.fontSizePt !== "number"
          )
            throw new TypeError("FontHeight requires numeric fontSizePt");
          return target.SetFontSize(args.fontSizePt);
        },
    },
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
    ...calcCellSelectionCommands.map(
      /** Binds original cell-shell selection slots to the actual current view and mark owner. @param resource - Native slot. @returns Slot definition. */
      (resource) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        execute:
          /** Applies the original no-argument UI operation without document mutation. @param target - Active input/view owner. @returns Whether admitted. */
          (target: CalcCommandTarget) =>
            resource.id === ".uno:SelectRow" ? target.MarkRows() : target.MarkColumns(),
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
  ];
  return new SfxInterface(
    definitions.map(
      /** Binds configuration metadata independently of core command execution. @param definition - Original slot. @returns Configured slot. */
      (definition) => ({
        ...definition,
        shortcuts: resolveShortcuts?.(definition.commandUrl) ?? definition.shortcuts ?? [],
      }),
    ),
  );
}
