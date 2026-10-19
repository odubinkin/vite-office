/** @fileoverview Enumerates real default-session dispatch availability without editing the workbook or assuming generated labels imply implemented commands. */
import { createCalcSession } from "../../../../apps/office/src/sc/browser/composition/calc-module";
import generated from "../../../../apps/office/src/sc/uiconfig/scalc/calc-ui.generated.json";
const session = createCalcSession();
try {
  const dispatcher = session.frame.GetDispatcher();
  const commands = Object.entries(generated.commands).map(([id, resource]) => {
    const dispatch = dispatcher.QueryDispatch(id);
    return { id, label: resource.label, registered: dispatch !== undefined, enabled: dispatcher.QueryState(id).enabled, slotId: dispatch?.slot.slotId };
  });
  console.log(JSON.stringify({ scope: "Actual fresh default Calc frame with no browser IndexedDB injected;default-disabled history and unavailable browser storage are state-dependent,not missing implementations.", commands, registered: commands.filter((item) => item.registered).length, enabled: commands.filter((item) => item.enabled).length }, null, 2));
} finally { session.Close(); }
