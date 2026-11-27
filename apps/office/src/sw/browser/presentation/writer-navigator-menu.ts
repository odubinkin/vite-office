/** @fileoverview Projects the represented rows of the native Navigator context menu. */
import type { PopupMenuItemPlacement } from "../../../framework/browser/presentation/CommandPopupMenu";
import type {
  SwContentTree,
  SwNavigatorContentType,
  SwNavigatorHeadingCommand,
} from "../../source/uibase/utlui/content";
import {
  MAX_NAVIGATOR_OUTLINE_LEVEL,
  OutlineTrackingMode,
} from "../../source/uibase/utlui/navicfg";

/** Original outline level choices, shared by the toolbar and context menu. */
export const navigatorOutlineLevels = Array.from(
  { length: MAX_NAVIGATOR_OUTLINE_LEVEL },
  /** Converts a zero-based index to its visible level. @param _ - Unallocated entry. @param index - Level index. @returns Visible outline level. */
  (_, index) => index + 1,
);

/** Represented context menu placement with its native row admission. */
interface NavigatorMenuOptions {
  readonly type: SwNavigatorContentType;
  readonly group: boolean;
  readonly allExpanded: boolean | undefined;
  readonly canCollapseCategories: boolean;
  readonly hasBookmarks: boolean;
  readonly label: (key: string, fallback: string) => string;
  readonly toggleOutlineBranch: () => void;
  readonly goTo: () => void;
  readonly runHeadingCommand: (command: SwNavigatorHeadingCommand) => void;
  readonly deleteBookmarks: () => void;
  readonly setOutlineLevel: (level: number) => void;
  readonly collapseCategories: () => void;
}

const headingActions = [
  ["801", "chapterup", "Move Heading Up"],
  ["802", "chapterdown", "Move Heading Down"],
  ["803", "promote", "Promote Outline Level"],
  ["804", "demote", "Demote Outline Level"],
] as const satisfies readonly (readonly [string, SwNavigatorHeadingCommand, string])[];

const trackingModes = [
  [OutlineTrackingMode.Default, "default", "Default"],
  [OutlineTrackingMode.Focus, "focus", "Focus"],
  [OutlineTrackingMode.Off, "off", "Off"],
] as const;

/** Builds the applicable entries in navigatorcontextmenu.ui order. @param tree - Native Navigator and its current configuration. @param options - Current row, labels and connected browser actions. @returns Popup placements. */
export function getWriterNavigatorMenuItems(
  tree: SwContentTree,
  {
    type,
    group,
    allExpanded,
    canCollapseCategories,
    hasBookmarks,
    label,
    toggleOutlineBranch,
    goTo,
    runHeadingCommand,
    deleteBookmarks,
    setOutlineLevel,
    collapseCategories,
  }: NavigatorMenuOptions,
): readonly PopupMenuItemPlacement[] {
  const items: PopupMenuItemPlacement[] = [];
  if (allExpanded !== undefined) {
    items.push(
      {
        kind: "local",
        id: "800",
        label: allExpanded
          ? label("collapse-all", "Collapse All")
          : label("expand-all", "Expand All"),
        semantics: "action",
        activate: toggleOutlineBranch,
      },
      { kind: "separator" },
    );
  }

  if (!group) {
    items.push({
      kind: "local",
      id: "900",
      label: label("go-to", "Go to"),
      semantics: "action",
      activate: goTo,
    });
    if (type === "outline")
      for (const [id, name, fallback] of headingActions)
        items.push({
          kind: "local",
          id,
          label: label(name, fallback),
          semantics: "action",
          activate:
            /** Moves or relevels the selected native headings with descendants. @returns Nothing. */ () =>
              runHeadingCommand(name),
        });
  }
  if (hasBookmarks)
    items.push({
      kind: "local",
      id: group ? "deleteallbookmarks" : "deletebookmark",
      label: group
        ? label("delete-all-bookmarks", "Delete All Bookmarks")
        : label("delete-bookmark", "Delete Bookmark"),
      semantics: "action",
      activate: deleteBookmarks,
    });

  if (!group || hasBookmarks) items.push({ kind: "separator" });
  if (type === "outline") {
    items.push({
      kind: "submenu",
      id: "4",
      label: label("outline-tracking", "Outline Tracking"),
      items: trackingModes.map(
        /** Projects one native tracking mode choice. @param choice - Native value and label. @returns Menu item. */
        ([mode, key, fallback]) => ({
          kind: "local",
          id: String(10 + mode),
          label: label(`outline-tracking-${key}`, fallback),
          semantics: "radio",
          checked: tree.GetOutlineTracking() === mode,
          activate: /** Applies the chosen tracking policy. @returns Nothing. */ () =>
            tree.SetOutlineTracking(mode),
        }),
      ),
    });
  } else {
    const checked = tree.GetContentTypeTracking(type);
    items.push({
      kind: "local",
      id: `${type}tracking`,
      label:
        type === "table"
          ? label("table-tracking", "Table Tracking")
          : label("bookmark-tracking", "Bookmark Tracking"),
      semantics: "check",
      checked,
      activate: /** Toggles tracking for the current category. @returns Nothing. */ () =>
        tree.SetContentTypeTracking(type, !checked),
    });
  }
  if (type === "outline")
    items.push({
      kind: "submenu",
      id: "1",
      label: label("outline-level", "Show Up to Outline Level"),
      items: navigatorOutlineLevels.map(
        /** Projects one native outline level. @param level - Visible outline level. @returns Menu item. */
        (level) => ({
          kind: "local",
          id: String(100 + level),
          label: String(level),
          semantics: "radio",
          checked: tree.GetOutlineLevel() === level,
          activate:
            /** Applies the maximum visible depth through the shared UI path. @returns Nothing. */ () =>
              setOutlineLevel(level),
        }),
      ),
    });
  items.push(
    { kind: "separator" },
    {
      kind: "local",
      id: "collapseallcategories",
      label: label("collapse-all-categories", "Collapse All Categories"),
      semantics: "action",
      disabled: !canCollapseCategories,
      activate: collapseCategories,
    },
  );
  return items;
}
