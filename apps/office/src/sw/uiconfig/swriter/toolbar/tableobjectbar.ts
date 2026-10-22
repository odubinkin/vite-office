/** @fileoverview Adapts supported visible native tableobjectbar.xml placements without reordering groups. */
import { normalizeWriterToolbarItems, type WriterToolbarItemPlacement } from "../ui-resource";
import generated from "../writer-ui.generated.json" with { type: "json" };

/** Supported contextual table-toolbar placements in original resource order. */
export const writerTableObjectBarItems: readonly WriterToolbarItemPlacement[] =
  normalizeWriterToolbarItems(
    generated.surfaces.tableobjectbar.flatMap(
      /** Retains native visibility and separators between consumed groups. @param item - Generated node. @returns Placements. */
      (item): readonly WriterToolbarItemPlacement[] =>
        item.kind === "separator"
          ? [{ kind: "separator" }]
          : item.kind === "command" && item.visible
            ? [{ kind: "command", commandId: item.commandUrl }]
            : [],
    ),
  );
