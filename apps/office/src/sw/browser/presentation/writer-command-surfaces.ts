/** @fileoverview Selects honest browser-presentable subsets from generated Writer UI resources. */

import {
  WRITER_COMMAND_IDS,
  writerMenuPlacements,
} from "../../uiconfig/swriter/menubar/menubar-commands";
import type {
  WriterMenuItemPlacement,
  WriterMenuPlacement,
} from "../../uiconfig/swriter/ui-resource";

/** Layout-backed commands omitted until the browser Writer has corresponding measured layout state. */
export const WRITER_HIDDEN_LAYOUT_COMMANDS = new Set<string>([
  WRITER_COMMAND_IDS.toggleHorizontalRuler,
]);

/** Recursively removes commands that would otherwise expose decorative, non-model UI. @param items - Generated menu items. @returns Normalized honest presentation items. */
function filterMenuItems(
  items: readonly WriterMenuItemPlacement[],
): readonly WriterMenuItemPlacement[] {
  const filtered = items.flatMap(
    /** Filters one placement recursively. @param item - Generated placement. @returns Honest placement subset. */ (
      item,
    ): readonly WriterMenuItemPlacement[] => {
      if (item.kind === "command")
        return WRITER_HIDDEN_LAYOUT_COMMANDS.has(item.commandId) ? [] : [item];
      if (item.kind !== "submenu") return [item];
      const children = filterMenuItems(item.items);
      return children.some(
        /** Detects any substantive submenu child. @param child - Filtered child. @returns Whether it is not a separator. */ (
          child,
        ) => child.kind !== "separator",
      )
        ? [{ ...item, items: children }]
        : [];
    },
  );
  return filtered.filter(
    /** Removes orphaned separators. @param item - Filtered placement. @param index - Placement index. @returns Whether placement remains. */ (
      item,
      index,
    ) =>
      item.kind !== "separator" ||
      (index > 0 && index < filtered.length - 1 && filtered[index - 1]?.kind !== "separator"),
  );
}

/** Supported generated menubar after browser capability filtering. */
export const writerBrowserMenuPlacements: readonly WriterMenuPlacement[] = writerMenuPlacements.map(
  /** Filters one top-level menu. @param menu - Generated menu. @returns Honest menu. */ (
    menu,
  ) => ({
    ...menu,
    items: filterMenuItems(menu.items),
  }),
);
