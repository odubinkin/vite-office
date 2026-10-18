/** @fileoverview Native generated Calc standardbar placement;shared command presenter renders only real registered source slots,as in Writer. */
import type { CommandToolbarPlacement } from "../../../../framework/browser/presentation/CommandToolbar";
import { normalizeToolbarItems } from "../../../../framework/browser/presentation/toolbar-resource";
import { calcUserCommands } from "../../../sdi/scalc";
import generated from "../calc-ui.generated.json" with { type: "json" };
/** Generated command/separator node used by the standard toolbar. */
interface ToolbarNode {
  readonly kind: string;
  readonly visible?: boolean;
  readonly commandUrl?: string;
}
/** Actual registered public operations supported by the current Calc kernel slice. */
const supported = new Set<string>(
  calcUserCommands.map(
    /** Uses registered public operations as the availability boundary. @param command - Actual public command. @returns Identity. */ (
      command,
    ) => command.id,
  ),
);
export const calcStandardBarItems: readonly CommandToolbarPlacement[] = normalizeToolbarItems(
  (generated.surfaces.standardbar as readonly ToolbarNode[]).flatMap(
    /** Projects original visibility flags and registered operations. @param node - Resource. @returns Ordered shared placements. */ function adapt(
      node,
    ): readonly CommandToolbarPlacement[] {
      if (node.kind === "separator") return [{ kind: "separator" }];
      return node.visible === false || !supported.has(node.commandUrl as string)
        ? []
        : [{ kind: "command", commandId: node.commandUrl as string }];
    },
  ),
);
