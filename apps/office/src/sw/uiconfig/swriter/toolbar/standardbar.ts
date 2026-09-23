/** @fileoverview Adapts the generated pinned Writer standard toolbar resource. */

import { normalizeWriterToolbarItems, type WriterToolbarItemPlacement } from "../ui-resource";
import { WRITER_COMMAND_IDS } from "../menubar/menubar-commands";
import generated from "../writer-ui.generated.json" with { type: "json" };

/** Supported visible standard-toolbar entries in exact generated upstream order. */
export const writerStandardBarItems: readonly WriterToolbarItemPlacement[] =
  normalizeWriterToolbarItems(
    generated.surfaces.standardbar
      .filter(
        /** Keeps Save As solely in the File menu. @param item - Generated toolbar node. @returns Whether shown on the browser toolbar. */
        (item) => item.kind !== "command" || item.commandUrl !== WRITER_COMMAND_IDS.saveOdt,
      )
      .flatMap(
        /** Adapts one generated toolbar node. @param item - Generated node. @returns Presentation placements. */ (
          item,
        ): readonly WriterToolbarItemPlacement[] =>
          item.kind === "separator"
            ? [{ kind: "separator" }]
            : [{ commandId: item.commandUrl as string, kind: "command" }],
      ),
  );
