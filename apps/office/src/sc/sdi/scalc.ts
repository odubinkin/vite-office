/** @fileoverview Consumed Calc SDI slots from scalc.sdi,sc.hrc,sfxsids.hrc and solar.hrc; no local command IDs are invented. */
import {
  createCalcTextEffectSlots,
  calcTextEffectCommands,
  type CalcTextEffectCommandTarget,
} from "./formatsh";
import {
  createCalcWrapTextSlot,
  calcWrapTextCommand,
  type CalcWrapTextCommandTarget,
} from "./formatsh";

import {
  createCalcBorderSlots,
  calcBorderCommands,
  type CalcBorderCommandTarget,
} from "./formatsh";
import { SvxContourItem } from "../../editeng/inc/contouritem";
import { SvxCrossedOutItem } from "../../editeng/inc/crossedoutitem";
import { SvxCellHorJustify as H, SvxCellVerJustify as V } from "../../editeng/inc/svxenum";
import type { CalcAlignmentAxis } from "../source/ui/view/formatsh";
import { SvxOverlineItem } from "../../editeng/source/items/textitem";
import { FontLineStyle } from "../../tools/inc/fontenum";
import { SvxFontItem } from "../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../editeng/inc/fhgtitem";
import { SvxColorItem } from "../../editeng/inc/colritem";
import { type CalcColorKind, calcColorSlots } from "../source/ui/view/formatsh";
import type { CalcCharacterFormat } from "../source/ui/view/formatsh";
import type { SfxSlotDefinition } from "../../sfx2/source/control/msg";
import { SfxInterface } from "../../sfx2/source/control/objface";
import { SfxUnoAnyItem } from "../../sfx2/source/view/frame";
/** Command owner contract corresponding to the active Calc input/view shell. */
export interface CalcCommandTarget
  extends CalcBorderCommandTarget, CalcTextEffectCommandTarget, CalcWrapTextCommandTarget {
  ResetAttributes(): boolean;
  ChangeIndent(increment: boolean): boolean;
  GetOutlineState(): boolean | undefined;
  SetOutlineFont(item?: SvxContourItem): boolean;
  GetStrikeoutState(): boolean | undefined;
  SetStrikeout(item?: SvxCrossedOutItem): boolean;
  GetOverlineState(): boolean | undefined;
  SetOverline(item?: SvxOverlineItem): boolean;
  GetAlignment(axis: CalcAlignmentAxis): H | V | undefined;
  SetAlignment(axis: CalcAlignmentAxis, value: H | V, toggle: boolean): boolean;
  GetColor(kind: CalcColorKind): SvxColorItem | undefined;
  SetColor(kind: CalcColorKind, color?: SvxColorItem): boolean;
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
  SetFontHeight(height: SvxFontHeightItem): boolean;
  ChangeFontSize(grow: boolean): boolean;
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
/** Native configurable toolbar/accelerator font-step slots;normal cell-toolbar visibility remains source-controlled. */
export const calcFontSizeStepCommands = [
  { id: ".uno:Grow", slotId: 11042, label: "Increase", grow: true },
  { id: ".uno:Shrink", slotId: 11043, label: "Decrease", grow: false },
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
/** Native toolbar toggle slots and shared explicit Format-menu pseudo slots. */
export const calcAlignmentCommands = [
  {
    id: ".uno:AlignLeft",
    slotId: 26384,
    label: "Align Left",
    axis: "horizontal",
    value: H.Left,
    toggle: true,
  },
  {
    id: ".uno:AlignRight",
    slotId: 26385,
    label: "Align Right",
    axis: "horizontal",
    value: H.Right,
    toggle: true,
  },
  {
    id: ".uno:AlignHorizontalCenter",
    slotId: 26386,
    label: "Align Center",
    axis: "horizontal",
    value: H.Center,
    toggle: true,
  },
  {
    id: ".uno:AlignBlock",
    slotId: 26387,
    label: "Justified",
    axis: "horizontal",
    value: H.Block,
    toggle: true,
  },
  {
    id: ".uno:AlignTop",
    slotId: 26388,
    label: "Align Top",
    axis: "vertical",
    value: V.Top,
    toggle: true,
  },
  {
    id: ".uno:AlignBottom",
    slotId: 26389,
    label: "Align Bottom",
    axis: "vertical",
    value: V.Bottom,
    toggle: true,
  },
  {
    id: ".uno:AlignVCenter",
    slotId: 26390,
    label: "Center Vertically",
    axis: "vertical",
    value: V.Center,
    toggle: true,
  },
  {
    id: ".uno:CommonAlignLeft",
    slotId: 11002,
    label: "Left",
    axis: "horizontal",
    value: H.Left,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignHorizontalCenter",
    slotId: 11003,
    label: "Centered",
    axis: "horizontal",
    value: H.Center,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignRight",
    slotId: 11004,
    label: "Right",
    axis: "horizontal",
    value: H.Right,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignJustified",
    slotId: 11005,
    label: "Justified",
    axis: "horizontal",
    value: H.Block,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignTop",
    slotId: 11006,
    label: "Top",
    axis: "vertical",
    value: V.Top,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignVerticalCenter",
    slotId: 11007,
    label: "Center",
    axis: "vertical",
    value: V.Center,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignBottom",
    slotId: 11008,
    label: "Bottom",
    axis: "vertical",
    value: V.Bottom,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignHorizontalDefault",
    slotId: 11009,
    label: "Default",
    axis: "horizontal",
    value: H.Standard,
    toggle: false,
  },
  {
    id: ".uno:CommonAlignVerticalDefault",
    slotId: 11010,
    label: "Default",
    axis: "vertical",
    value: V.Standard,
    toggle: false,
  },
] as const;
/** User-visible implemented command inventory;hidden input slots remain dispatcher operations. */
export const calcColorCommands = [
  { id: ".uno:Color", slotId: calcColorSlots.font, label: "Font Color", colorKind: "font" },
  {
    id: ".uno:BackgroundColor",
    slotId: calcColorSlots.background,
    label: "Background Color",
    colorKind: "background",
  },
] as const;
/** User-visible implemented command inventory;hidden input slots remain dispatcher operations. */
export const calcUserCommands = [
  { id: ".uno:ResetAttributes", slotId: 26067, label: "Clear" },
  { id: ".uno:OutlineFont", slotId: 10012, label: "Outline Font Effect" },
  { id: ".uno:Strikeout", slotId: 10013, label: "Strikethrough" },
  { id: ".uno:Overline", slotId: 11568, label: "Overline" },
  ...calcBorderCommands,
  ...calcAlignmentCommands,
  ...calcColorCommands,
  { id: ".uno:CharFontName", slotId: 10007, label: "Font Name" },
  { id: ".uno:FontHeight", slotId: 10015, label: "Font Size" },
  ...calcFontSizeStepCommands,
  ...calcCharacterCommands,
  ...calcUnderlineCommands,
  ...calcEditCommands,
  calcInputModeCommand,
  ...calcTextEffectCommands,
  calcWrapTextCommand,
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
      item.id === ".uno:WrapText"
        ? ("CAP-e6381cc3-df2e-476c-b5b2-ddac14310d35" as const)
        : item.id === ".uno:Shadowed"
          ? ("CAP-1e53ab36-5de3-4eae-9a9a-ec1202144448" as const)
          : calcBorderCommands.some(
                /** Identifies native border commands. @param command - Original border resource. @returns Match. */ (
                  command,
                ) => command.id === item.id,
              )
            ? ("CAP-211b5dc6-a580-4baf-a71e-d3af2e1c746f" as const)
            : item.id === ".uno:ResetAttributes"
              ? ("CAP-d7aef795-0709-4ea9-9f92-079142960ada" as const)
              : item.id === ".uno:OutlineFont"
                ? ("CAP-96c5bd1b-d2c3-4c5b-b842-f12bb3bed875" as const)
                : item.id === ".uno:Strikeout"
                  ? ("CAP-8bbfa850-4c4a-4935-8322-773d074dd3be" as const)
                  : item.id === ".uno:Overline"
                    ? ("CAP-2be21078-2d50-4abe-a26d-73c695894d95" as const)
                    : "grow" in item
                      ? ("CAP-8596b1f1-c99f-43bc-8d26-44ec9d84c05e" as const)
                      : "axis" in item
                        ? ("CAP-0bb796a3-9483-445d-aef3-1deeb40f990a" as const)
                        : "colorKind" in item
                          ? ("CAP-7206d1b8-82a8-4f0a-91c5-ae26cb0251d4" as const)
                          : "format" in item || "line" in item
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
    ...createCalcBorderSlots(),
    ...createCalcTextEffectSlots(),
    createCalcWrapTextSlot(),
    ...calcFontSizeStepCommands.map(
      /** Native no-argument slots retain source no-op behavior when a request contains arguments. @param resource - Source slot. @returns Dispatcher definition. */
      (resource): SfxSlotDefinition<CalcCommandTarget> => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        execute:
          /** Executes actual selected-script size arithmetic. @param target - Active view. @param request - Native request. @returns Changed. */
          (target, request) =>
            request.GetArgs().length === 0 && target.ChangeFontSize(resource.grow),
      }),
    ),
    {
      commandUrl: ".uno:Overline",
      slotId: 11568,
      label: "Overline",
      getState:
        /** Reads the native bool/mixed projection. @param target - Actual controller. @returns Slot state. */ (
          target: CalcCommandTarget,
        ) => {
          const checked = target.GetOverlineState();
          return { enabled: true, ...(checked === undefined ? { mixed: true } : { checked }) };
        },
      execute:
        /** Routes a bound toggle or complete typed attribute request. @param target - Actual controller. @param request - Native request. @returns Whether changed. */ (
          target: CalcCommandTarget,
          request: import("../../sfx2/source/control/request").SfxRequest,
        ) => {
          if (!request.GetArgs().length) return target.SetOverline();
          const item = request.GetArgs()[0];
          if (!(item instanceof SvxOverlineItem))
            throw new TypeError("Overline requires a complete SvxOverlineItem");
          return target.SetOverline(item);
        },
    },
    {
      commandUrl: ".uno:Strikeout",
      slotId: 10013,
      label: "Strikethrough",
      getState:
        /** Publishes native enum boolean state. @param target - Actual view. @returns Slot state. */ (
          target: CalcCommandTarget,
        ) => {
          const checked = target.GetStrikeoutState();
          return { enabled: true, ...(checked === undefined ? { mixed: true } : { checked }) };
        },
      execute:
        /** Routes native complete-item requests separately from bound toggles. @param target - Actual view. @param request - Native request. @returns Whether changed. */ (
          target: CalcCommandTarget,
          request: import("../../sfx2/source/control/request").SfxRequest,
        ) => {
          if (!request.GetArgs().length) return target.SetStrikeout();
          const item = request.GetArgs()[0];
          if (!(item instanceof SvxCrossedOutItem))
            throw new TypeError("Strikeout requires a complete SvxCrossedOutItem");
          return target.SetStrikeout(item);
        },
    },
    ...(
      [
        [".uno:IncrementIndent", 10462, true],
        [".uno:DecrementIndent", 10461, false],
      ] as const
    ).map(
      /** Binds original indent slots. @param entry - Native identity. @returns Slot. */ ([
        commandUrl,
        slotId,
        increment,
      ]) => ({
        commandUrl,
        slotId,
        label: increment ? "Increase Indent" : "Decrease Indent",
        execute: /** Delegates native change. @param target - Controller. @returns Result. */ (
          target: CalcCommandTarget,
        ) => target.ChangeIndent(increment),
      }),
    ),
    {
      commandUrl: ".uno:ResetAttributes",
      slotId: 26067,
      label: "Clear",
      execute:
        /** Delegates original Clear command to actual cell-shell operation. @param target - Active controller. @returns Admission result. */ (
          target,
        ) => target.ResetAttributes(),
    },
    {
      commandUrl: ".uno:OutlineFont",
      slotId: 10012,
      label: "Outline Font Effect",
      getState:
        /** Reads the actual source bool/default/mixed state. @param target - Native view. @returns Slot state. */ (
          target: CalcCommandTarget,
        ) => {
          const checked = target.GetOutlineState();
          return { enabled: true, ...(checked === undefined ? { mixed: true } : { checked }) };
        },
      execute:
        /** Routes typed requests separately from bound toggle gestures. @param target - Actual controller. @param request - Native request. @returns Whether changed. */ (
          target: CalcCommandTarget,
          request: import("../../sfx2/source/control/request").SfxRequest,
        ) => {
          if (!request.GetArgs().length) return target.SetOutlineFont();
          const item = request.GetArgs()[0];
          if (!(item instanceof SvxContourItem))
            throw new TypeError("OutlineFont requires a complete SvxContourItem");
          return target.SetOutlineFont(item);
        },
    },
    ...calcAlignmentCommands.map(
      /** Binds actual native alignment operations to shared command widgets. @param resource - Original slot and radio behavior. @returns Slot. */
      (resource) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        getState:
          /** Publishes native radio or mixed selection state. @param target - Actual view. @returns State. */ (
            target: CalcCommandTarget,
          ) => {
            const value = target.GetAlignment(resource.axis);
            return {
              enabled: true,
              checked: value === resource.value,
              mixed: resource.toggle && value === undefined,
            };
          },
        execute:
          /** Executes original toolbar toggle or explicit menu operation. @param target - Actual view. @returns Changed. */ (
            target: CalcCommandTarget,
          ) => target.SetAlignment(resource.axis, resource.value, resource.toggle),
      }),
    ),
    ...calcColorCommands.map(
      /** Binds original typed color slots to actual model state. @param resource - Source slot. @returns Slot definition. */ (
        resource,
      ) => ({
        commandUrl: resource.id,
        slotId: resource.slotId,
        label: resource.label,
        getState:
          /** Reads source uniform/mixed item state. @param target - View owner. @returns Slot state. */ (
            target: CalcCommandTarget,
          ) => {
            const value = target.GetColor(resource.colorKind);
            return { enabled: true, value, mixed: value === undefined };
          },
        execute:
          /** Preserves original argument/no-argument paths. @param target - View owner. @param request - Actual Sfx request. @returns Changed. */ (
            target: CalcCommandTarget,
            request: import("../../sfx2/source/control/request").SfxRequest,
          ) => {
            const args = (
              request
                .GetArgs()
                .find(
                  /** Locates real structured request data. @param item - Request item. @returns Match. */ (
                    item,
                  ) => item instanceof SfxUnoAnyItem,
                ) as SfxUnoAnyItem | undefined
            )?.GetValue();
            if (args === undefined) return target.SetColor(resource.colorKind);
            if (
              typeof args !== "object" ||
              args === null ||
              !("color" in args) ||
              !(args.color instanceof SvxColorItem)
            )
              throw new TypeError("Color requires a complete SvxColorItem");
            return target.SetColor(resource.colorKind, args.color);
          },
      }),
    ),
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
          const height = request.GetArgs().find(
            /** Borrows the native typed height item before the legacy browser scalar argument. @param item - Request value. @returns Whether font height. */
            (item) => item instanceof SvxFontHeightItem,
          );
          if (height instanceof SvxFontHeightItem) return target.SetFontHeight(height);
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
