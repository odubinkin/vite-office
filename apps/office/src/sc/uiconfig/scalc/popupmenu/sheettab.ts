/** @fileoverview Complete native sheettab.xml context resource consumed by the shared Writer popup presenter. */
import type { CommandMenuItemPlacement } from "../../../../framework/browser/presentation/CommandMenuBar";
import generated from "../calc-ui.generated.json" with { type: "json" };
/** Native popup command sequence and separators,without filtering unavailable slots. */
export const calcSheetTabItems: readonly CommandMenuItemPlacement[] = (
  generated.surfaces.sheettab as readonly (
    Readonly<{ kind: "separator" }> | Readonly<{ kind: "command"; commandUrl: string }>
  )[]
).map(
  /** Projects one native placement with its exact popup dialog suffix. @param node - Source node. @returns Shared placement. */ (
    node,
  ) => {
    if (node.kind === "separator") return { kind: "separator" };
    const resource = (
      generated.commands as Readonly<
        Record<string, Readonly<{ showsDialog: boolean; popupShowsDialog?: boolean }>>
      >
    )[node.commandUrl] as Readonly<{ showsDialog: boolean; popupShowsDialog?: boolean }>;
    return {
      kind: "command",
      commandId: node.commandUrl,
      showsDialog: resource.popupShowsDialog ?? resource.showsDialog,
    };
  },
);
