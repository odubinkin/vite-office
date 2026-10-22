/** @fileoverview Consumed SwTextShell ExecCharAttr/GetAttrState superscript/subscript branches from txtattr.cxx; native case-map and paragraph branches remain in their own owners. */
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { FN_SET_SUPER_SCRIPT, FN_SET_SUB_SCRIPT } from "../../../inc/cmdid";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";
import type { WriterSlotHandler } from "../../../sdi/swriter";
import type { SwTextShell } from "./textsh1";

/** Registers original sign-based commands over the existing native character attribute boundary. @param target - Actual text shell. @returns Original command pair. */
export function createWriterEscapementCommands(
  target: SwTextShell,
): readonly WriterSlotHandler<SwTextShell>[] {
  /** Queries the complete native item; differing offset or height remains INVALID. @returns Actual aggregate. */
  function state(): SfxItemSet {
    const items = new SfxItemSet(target.GetActiveParagraph().GetDoc().GetAttrPool(), [
      [RES_CHRATR_ESCAPEMENT, RES_CHRATR_ESCAPEMENT],
    ]);
    target.GetTextCtrlState(items);
    return items;
  }
  return (
    [
      [".uno:SuperScript", FN_SET_SUPER_SCRIPT, SvxEscapement.Superscript],
      [".uno:SubScript", FN_SET_SUB_SCRIPT, SvxEscapement.Subscript],
    ] as const
  ).map(
    /** Retains original distinct slot IDs and shared native item. @param entry - Source command tuple. @returns Native descriptor. */
    ([id, slot, mode]) => {
      /** Native GetAttrState emits false for INVALID and checks only the sign for DEFAULT/SET. @returns Source bool. */
      function checked(): boolean {
        const items = state();
        if (items.GetItemState(RES_CHRATR_ESCAPEMENT, false) < SfxItemState.DEFAULT) return false;
        const esc = (items.Get(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).GetEsc();
        return mode === SvxEscapement.Superscript ? esc > 0 : esc < 0;
      }
      return {
        id,
        capabilityId: "CAP-0109",
        /** Native explicit bool uses ON/OFF; absent request toggles the sign of the complete aggregate item. @param context - Original shell. @param args - Native request items. @returns Whether selected content changed. */
        execute(context, args) {
          const requested = args.find(
            /** Resolves original SfxBoolItem slot argument. @param item - Request. @returns Match. */
            (item) => item.Which() === slot,
          );
          if (requested !== undefined && !(requested instanceof SfxBoolItem)) return false;
          const aggregate = state(),
            esc = (aggregate.Get(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).GetEsc();
          const on =
            requested instanceof SfxBoolItem
              ? requested.GetValue()
              : !(mode === SvxEscapement.Superscript ? esc > 0 : esc < 0);
          const items = new SfxItemSet(aggregate.GetPool(), [
            [RES_CHRATR_ESCAPEMENT, RES_CHRATR_ESCAPEMENT],
          ]);
          items.Put(new SvxEscapementItem(on ? mode : SvxEscapement.Off, RES_CHRATR_ESCAPEMENT));
          return context.ExecTextCtrl(items);
        },
        isChecked: checked,
        /** Publishes the source bool item rather than exposing the native offset as a check value. @returns Bool slot state. */
        getStateValue: () => new SfxBoolItem(slot, checked()),
      } satisfies WriterSlotHandler<SwTextShell>;
    },
  );
}
