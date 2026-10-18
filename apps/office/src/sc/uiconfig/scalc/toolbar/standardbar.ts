/** @fileoverview Native generated Calc standardbar placement retaining complete source visibility through shared controls. */
import type { CommandToolbarPlacement } from "../../../../framework/browser/presentation/CommandToolbar";
import { normalizeToolbarItems } from "../../../../framework/browser/presentation/toolbar-resource";
import generated from "../calc-ui.generated.json" with { type: "json" };
/** Generated command/separator node used by the standard toolbar. */
interface ToolbarNode {
  readonly kind: string;
  readonly visible?: boolean;
  readonly commandUrl?: string;
}
export const calcStandardBarItems: readonly CommandToolbarPlacement[] = normalizeToolbarItems(
  (generated.surfaces.standardbar as readonly ToolbarNode[]).flatMap(
    /** Projects original visibility flags;bindings own command availability. @param node - Resource. @returns Ordered shared placements. */ function adapt(
      node,
    ): readonly CommandToolbarPlacement[] {
      if (node.kind === "separator") return [{ kind: "separator" }];
      return node.visible === false
        ? []
        : [{ kind: "command", commandId: node.commandUrl as string }];
    },
  ),
);
