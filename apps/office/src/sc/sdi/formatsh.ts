/** @fileoverview Native Calc border slot adapter;typed browser arguments are converted into actual mapped native items before ScFormatShell dispatch. */
import type { SfxSlotDefinition } from "../../sfx2/source/control/msg";
import { SfxUnoAnyItem } from "../../sfx2/source/view/frame";
import { SvxBoxItem, SvxBoxInfoItem } from "../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../editeng/inc/lineitem";
import { SvxColorItem } from "../../editeng/inc/colritem";
import type { SfxRequest } from "../../sfx2/source/control/request";
import type { SfxSlotState as SlotState } from "../../sfx2/source/control/bindings";
/** Source border command surface consumed by the real active view controller. */
export interface CalcBorderCommandTarget {
  ExecuteBorder(request: SfxRequest): boolean;
  GetFrameLineState(color: boolean): SlotState;
  GetDiagonalState(which: 141 | 142): SlotState;
}
/** Source SDI numeric slots and public argument names. */
export const calcBorderCommands = [
  { id: ".uno:SetBorderStyle", slotId: 10188, label: "Borders" },
  { id: ".uno:LineStyle", slotId: 10201, label: "Border Style" },
  { id: ".uno:FrameLineColor", slotId: 10202, label: "Border Color" },
  { id: ".uno:BorderTLBR", slotId: 11013, label: "Diagonal Down Border" },
  { id: ".uno:BorderBLTR", slotId: 11014, label: "Diagonal Up Border" },
] as const;
/** Binds actual typed requests with original frame/style/color state. @returns Native slot definitions. */
export function createCalcBorderSlots(): SfxSlotDefinition<CalcBorderCommandTarget>[] {
  return calcBorderCommands.map(
    /** Creates one source border slot. @param resource - Native identity. @returns Slot definition. */ (
      resource,
    ) => ({
      commandUrl: resource.id,
      slotId: resource.slotId,
      label: resource.label,
      getState:
        /** Queries actual native line state for its two stateful toolbox commands. @param target - Active view. @returns Slot state. */ (
          target,
        ) =>
          resource.slotId === 10201 || resource.slotId === 10202
            ? target.GetFrameLineState(resource.slotId === 10202)
            : resource.slotId === 11013 || resource.slotId === 11014
              ? target.GetDiagonalState(resource.slotId === 11013 ? 141 : 142)
              : { enabled: true },
      execute:
        /** Admits actual source item payloads before committing or mutating the document. @param target - Active view. @param request - Native request. @returns Result. */ (
          target,
          request,
        ) => {
          const payload = request
            .GetArgs()
            .find(
              /** Finds the existing browser argument transport. @param item - Request item. @returns Match. */ (
                item,
              ) => item instanceof SfxUnoAnyItem,
            ) as SfxUnoAnyItem | undefined;
          if (payload) {
            const value = payload.GetValue();
            if (typeof value !== "object" || value === null)
              throw new TypeError("Border command requires actual native items");
            const fields =
              resource.slotId === 10188
                ? ([
                    ["OuterBorder", SvxBoxItem, 150],
                    ["InnerBorder", SvxBoxInfoItem, 151],
                  ] as const)
                : resource.slotId === 10201
                  ? ([["LineStyle", SvxLineItem, 10201]] as const)
                  : resource.slotId === 10202
                    ? ([["color", SvxColorItem, 10202]] as const)
                    : resource.slotId === 11013
                      ? ([["BorderTLBR", SvxLineItem, 141]] as const)
                      : ([["BorderBLTR", SvxLineItem, 142]] as const);
            for (const [name, Item, which] of fields) {
              if (!(name in value)) throw new TypeError(`Border command requires ${name}`);
              const input = (value as Record<string, unknown>)[name];
              if (!(input instanceof Item))
                throw new TypeError(`Border command requires native ${name}`);
              const item = input.Clone();
              item.SetWhich(which);
              request.AppendItem(item);
            }
          }
          for (const item of request.GetArgs()) {
            if (item instanceof SfxUnoAnyItem) continue;
            const which = item.Which(),
              mapped =
                which === 10024
                  ? 150
                  : which === 10023
                    ? 151
                    : which === 11013
                      ? 141
                      : which === 11014
                        ? 142
                        : which;
            if (mapped !== which) {
              const copy = item.Clone();
              if (copy) {
                copy.SetWhich(mapped);
                request.RemoveItem(which);
                request.AppendItem(copy);
              }
            }
          }
          if (request.GetArgs().length === 0) return false;
          return target.ExecuteBorder(request);
        },
    }),
  );
}
