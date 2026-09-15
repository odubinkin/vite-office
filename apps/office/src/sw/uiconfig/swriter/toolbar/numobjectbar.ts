/** @fileoverview Adapts the generated pinned Writer numbering toolbar resource. */

import { normalizeWriterToolbarItems, type WriterToolbarItemPlacement } from "../ui-resource";
import generated from "../writer-ui.generated.json" with { type: "json" };

/** Supported visible numbering-toolbar entries in exact generated upstream order. */
export const writerNumObjectBarItems: readonly WriterToolbarItemPlacement[] =
  normalizeWriterToolbarItems(
    generated.surfaces.numobjectbar.flatMap(
      /** Adapts one generated toolbar node. @param item - Generated node. @returns Presentation placements. */ (
        item,
      ): readonly WriterToolbarItemPlacement[] =>
        item.kind === "separator"
          ? [{ kind: "separator" }]
          : item.kind === "command" && item.visible
            ? [{ commandId: item.commandUrl, kind: "command" }]
            : [],
    ),
  );
