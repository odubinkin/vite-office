/** @fileoverview Source Calc calculation slots from docsh.sdi and cellsh.sdi. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { SfxInterface } from "../../sfx2/source/control/objface";
import type { SfxRequest } from "../../sfx2/source/control/request";
import { ScAddress, ScRange } from "../inc/address";
import { ScDocument } from "../inc/document";
import type { ScDocShell } from "../source/ui/docshell/docsh";
import { DoHardRecalc, DoRecalc } from "../source/ui/docshell/docsh4";
import type { ScInputHandler } from "../source/ui/inc/inputhdl";
import type { ScViewData } from "../source/ui/inc/viewdata";
import { ConvertFormulaToValueOperation } from "../source/ui/operation/ConvertFormulaToValueOperation";

const FID_AUTO_CALC = 26411;
const FID_RECALC = 26412;
const FID_HARD_RECALC = 26426;
const SID_CONVERT_FORMULA_TO_VALUE = 26305;

/** Active input and view services borrowed by Calc document-shell commands. */
interface CalcCalculationTarget {
  readonly shell: ScDocShell;
  readonly inputHandler: ScInputHandler;
  readonly viewData: ScViewData;
  Position(): ScAddress;
  Commit(): boolean;
  FormulaPreview(): void;
}

/** Creates the original Calculate slots with native accelerators and document state. @returns Calc calculation interface. */
export function createCalcCalculationInterface(): SfxInterface<CalcCalculationTarget> {
  return new SfxInterface<CalcCalculationTarget>([
    {
      commandUrl: ".uno:AutomaticCalculation",
      slotId: FID_AUTO_CALC,
      label: "AutoCalculate",
      getState:
        /** Reads the current document's automatic recalculation command state. @param entry - Slot target exposing the active document shell. @returns Enabled and checked state for the slot. */ ({
          shell,
        }) => {
          const doc = shell.GetDocument();
          return {
            enabled: doc.GetHardRecalcState() === ScDocument.HardRecalcState.OFF,
            checked: doc.GetAutoCalc(),
          };
        },
      execute:
        /** Toggles automatic calculation through the native document shell. @param entry - Slot target exposing the active document shell. @param request - Original Sfx slot request. @returns Slot execution result. */ (
          { shell },
          request,
        ) => ToggleAutomaticCalculation(shell, request),
    },
    {
      commandUrl: ".uno:Calculate",
      slotId: FID_RECALC,
      label: "Recalculate",
      shortcuts: ["F9"],
      execute:
        /** Previews a formula in edit mode or commits input before normal recalculation. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Whether the dispatcher handled the request. */ (
          target,
          request,
        ) => {
          if (
            target.inputHandler.IsInputMode() &&
            target.inputHandler.IsFormulaMode() &&
            !request.IsAPI()
          )
            target.FormulaPreview();
          else if (target.Commit()) DoRecalc(target.shell, target.Position());
          else return false;
          request.Done();
          return true;
        },
    },
    {
      commandUrl: ".uno:CalculateHard",
      slotId: FID_HARD_RECALC,
      label: "Recalculate Hard",
      shortcuts: ["Ctrl+Shift+F9", "Meta+Shift+F9"],
      execute:
        /** Commits current input before triggering a hard formula recalculation. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Whether the dispatcher handled the request. */ (
          target,
          request,
        ) => {
          if (!target.Commit()) return false;
          DoHardRecalc(target.shell);
          request.Done();
          return true;
        },
    },
    {
      commandUrl: ".uno:ConvertFormulaToValue",
      slotId: SID_CONVERT_FORMULA_TO_VALUE,
      label: "Formula to Value",
      execute:
        /** Commits current input before converting the oriented selection from formulas to values. @param target - Active Calc slot target. @param request - Original Sfx slot request. @returns Whether the dispatcher handled the request. */ (
          target,
          request,
        ) => {
          if (!target.Commit()) return false;
          const range = new ScRange();
          target.viewData.GetSimpleArea(range);
          range.PutInOrder();
          return new ConvertFormulaToValueOperation(target.shell, range, request.IsAPI()).run();
        },
    },
  ]);
}

/** Applies the requested native boolean or toggles it, recording the resolved option. @param shell - Active document shell. @param request - Native Sfx request. @returns Whether handled. */
function ToggleAutomaticCalculation(shell: ScDocShell, request: SfxRequest): boolean {
  const document = shell.GetDocument();
  const option = request
    .GetArgs()
    .find(
      /** Finds the original automatic calculation argument in the request. @param item - Request argument. @returns Whether the native item identifier matches. */ (
        item,
      ) => item.Which() === FID_AUTO_CALC,
    );
  const enabled = option instanceof SfxBoolItem ? option.GetValue() : !document.GetAutoCalc();
  document.SetAutoCalc(enabled);
  shell.SetDocumentModified();
  request.AppendItem(new SfxBoolItem(FID_AUTO_CALC, enabled));
  request.Done();
  return true;
}
