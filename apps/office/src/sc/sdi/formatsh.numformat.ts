/** @fileoverview Calc numeric shortcut slots from scalc.sdi, formatsh.sdi and sc.hrc. */
import type { SfxSlotDefinition } from "../../sfx2/source/control/msg";
import type { CalcViewCommandTarget } from "./tabvwsh";

export const SID_NUMBER_CURRENCY = 26045;
export const SID_NUMBER_PERCENT = 26046;
export const SID_NUMBER_STANDARD = 26052;
export const SID_NUMBER_DATE = 26053;
export const SID_NUMBER_TWODEC = 26054;
export const SID_NUMBER_SCIENTIFIC = 26055;
export const SID_NUMBER_TIME = 26056;
export const SID_NUMBER_INCDEC = 26057;
export const SID_NUMBER_DECDEC = 26058;
export const SID_NUMBER_THOUSANDS = 26059;

const commands = [
  [SID_NUMBER_CURRENCY, ".uno:NumberFormatCurrency", "Currency"],
  [SID_NUMBER_PERCENT, ".uno:NumberFormatPercent", "Percent"],
  [SID_NUMBER_STANDARD, ".uno:NumberFormatStandard", "General"],
  [SID_NUMBER_DATE, ".uno:NumberFormatDate", "Date"],
  [SID_NUMBER_TWODEC, ".uno:NumberFormatDecimal", "Number"],
  [SID_NUMBER_SCIENTIFIC, ".uno:NumberFormatScientific", "Scientific"],
  [SID_NUMBER_TIME, ".uno:NumberFormatTime", "Time"],
  [SID_NUMBER_INCDEC, ".uno:NumberFormatIncDecimals", "Add Decimal Place"],
  [SID_NUMBER_DECDEC, ".uno:NumberFormatDecDecimals", "Delete Decimal Place"],
  [SID_NUMBER_THOUSANDS, ".uno:NumberFormatThousands", "Thousands Separator"],
] as const;

/** Binds native number format states and request items to the active format shell. @returns Sfx slots. */
export function createCalcNumberFormatSlots(): SfxSlotDefinition<CalcViewCommandTarget>[] {
  return commands.map(
    /** Creates one shortcut dispatcher slot. @param command - Native identity and label. @returns Slot definition. */
    ([slotId, commandUrl, label]) => ({
      slotId,
      commandUrl,
      label,
      /** Reads the native state. @param target - Active view. @returns Slot state. */
      getState: (target) => target.GetNumFormatState(slotId),
      /** Executes with the actual request. @param target - Active view. @param request - Slot request. @returns Whether applied. */
      execute: (target, request) => target.ExecuteNumFormat(request),
    }),
  );
}
