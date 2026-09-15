/** @fileoverview Adapts the generated pinned Writer standard toolbar resource. */

import { normalizeWriterToolbarItems, type WriterToolbarItemPlacement } from "../ui-resource";
import generated from "../writer-ui.generated.json" with { type: "json" };

/** Supported visible standard-toolbar entries in exact generated upstream order. */
export const writerStandardBarItems: readonly WriterToolbarItemPlacement[] =
  normalizeWriterToolbarItems(
    generated.surfaces.standardbar.flatMap(
      /** Adapts one generated toolbar node. @param item - Generated node. @returns Presentation placements. */ (
        item,
      ): readonly WriterToolbarItemPlacement[] =>
        item.kind === "separator"
          ? [{ kind: "separator" }]
          : [{ commandId: item.commandUrl as string, kind: "command" }],
    ),
  );
