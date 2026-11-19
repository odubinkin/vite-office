/** @fileoverview Projects browser menus onto commands registered by the active suite. */
import type { CommandMenuItemPlacement } from "./CommandMenuBar";
import type { BrowserCommandSource } from "./command-surface";
import { normalizeToolbarItems } from "./toolbar-resource";

/** Keeps connected commands, removing empty submenus and orphaned separators. @param items - Original menu resource. @param source - Command dispatcher adapter. @returns Available menu entries in resource order. */
export function selectAvailableMenuItems(
  items: readonly CommandMenuItemPlacement[],
  source: BrowserCommandSource,
): readonly CommandMenuItemPlacement[] {
  return normalizeToolbarItems(
    items.flatMap(
      /** Resolves registration independently of a command's current enabled state. @param item - Original menu item. @returns Visible entry or empty array. */
      (item): readonly CommandMenuItemPlacement[] => {
        if (item.kind === "separator") return [item];
        if (item.kind === "command")
          return source.QueryCommand(item.commandId) === undefined ? [] : [item];
        const children = selectAvailableMenuItems(item.items, source);
        return children.length === 0 ? [] : [{ ...item, items: children }];
      },
    ),
  );
}
