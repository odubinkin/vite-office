/** @fileoverview Implemented visible Calc standardbar.xml entries in native order;Save As stays in File under the same browser policy as Writer. */
import type { CommandToolbarPlacement } from "../../../../framework/browser/presentation/CommandToolbar";
/** Existing source slots only;unsupported native entries are not replaced by alternate commands. */
export const calcStandardBarItems: readonly CommandToolbarPlacement[] = [
  { kind: "command", commandId: ".uno:OpenFromCalc" },
  { kind: "separator" },
  { kind: "command", commandId: ".uno:Undo" },
  { kind: "command", commandId: ".uno:Redo" },
];
