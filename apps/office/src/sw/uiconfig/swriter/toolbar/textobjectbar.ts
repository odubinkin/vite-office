/** @fileoverview Adapts the generated pinned Writer text toolbar resource. */

import { WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { getWriterParagraphStyleCommandId } from "../menubar/menubar-commands";
import { normalizeWriterToolbarItems, type WriterToolbarItemPlacement } from "../ui-resource";
import { getWriterCommandResource } from "../writer-command-resources";
import generated from "../writer-ui.generated.json" with { type: "json" };

/** Supported visible text-toolbar entries in exact generated upstream order. */
export const writerTextObjectBarItems: readonly WriterToolbarItemPlacement[] =
  normalizeWriterToolbarItems(
    generated.surfaces.textobjectbar.flatMap(
      /** Adapts one generated toolbar node. @param item - Generated node. @returns Presentation placements. */ (
        item,
      ): readonly WriterToolbarItemPlacement[] => {
        if (item.kind === "separator") return [{ kind: "separator" }];
        if (item.kind !== "command" || !item.visible) return [];
        if (item.commandUrl === generated.commandAliases.fontName)
          return [
            {
              commandId: item.commandUrl,
              kind: "font-select",
              label: getWriterCommandResource(item.commandUrl).controlLabel,
            },
          ];
        if (item.commandUrl === generated.commandAliases.styleApply)
          return [
            {
              kind: "command-select",
              label: getWriterCommandResource(item.commandUrl).controlLabel,
              options: WRITER_PARAGRAPH_STYLE_POOL.map(
                /** Projects one style command. @param style - Pool style. @returns Command URL. */ (
                  style,
                ) => getWriterParagraphStyleCommandId(style.id),
              ),
            },
          ];
        return [{ commandId: item.commandUrl, kind: "command" }];
      },
    ),
  );
