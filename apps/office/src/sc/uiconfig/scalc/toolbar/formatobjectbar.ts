/** @fileoverview Native cell-context formatting resource projected to actual shared Writer controls. */
import type { CommandToolbarPlacement } from "../../../../framework/browser/presentation/CommandToolbar";
import { normalizeToolbarItems } from "../../../../framework/browser/presentation/toolbar-resource";
import { getCalcCommandResource } from "../menubar/menubar";
import generated from "../calc-ui.generated.json" with { type: "json" };
/** Native source placement plus exact font-control payload consumed by shared controls. */
export type CalcFormattingPlacement =
  | Extract<CommandToolbarPlacement, { kind: "command" | "separator" }>
  | Readonly<{ kind: "font-select" | "font-size-select"; commandId: string; label: string }>;
/** Projects native visibility and order;Sfx bindings alone decide availability. */
export const calcFormatObjectBarItems: readonly CalcFormattingPlacement[] = normalizeToolbarItems(
  generated.surfaces.formatobjectbar.flatMap(
    /** Adapts one original resource placement. @param node - Source node. @returns Shared controls. */ (
      node,
    ): readonly CalcFormattingPlacement[] => {
      if (node.kind === "separator") return [{ kind: "separator" }];
      if (node.visible === false) return [];
      const commandId = node.commandUrl as string;
      if (commandId === ".uno:CharFontName" || commandId === ".uno:FontHeight")
        return [
          {
            kind: commandId === ".uno:CharFontName" ? "font-select" : "font-size-select",
            commandId,
            label: getCalcCommandResource(commandId).label,
          },
        ];
      return [{ kind: "command", commandId }];
    },
  ),
);
