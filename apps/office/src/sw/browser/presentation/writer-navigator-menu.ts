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
  readonly hasContents: boolean;
  readonly label: (key: string, fallback: string) => string;
  readonly toggleOutlineBranch: () => void;
  readonly goTo: () => void;
  readonly selectContent: () => void;
  readonly readOnly: boolean;
  readonly canDeleteTable: boolean;
  readonly runHeadingCommand: (command: SwNavigatorHeadingCommand) => void;
  readonly deleteBookmarks: () => void;
  readonly editContent: () => void;
  readonly renameContent: () => void;
  readonly deleteContent: () => void;
  readonly setOutlineLevel: (level: number) => void;
  readonly collapseCategories: () => void;
}

const headingActions = [
  ["801", "chapterup", "Move Heading Up"],
  ["802", "chapterdown", "Move Heading Down"],
  ["803", "promote", "Promote Outline Level"],
  ["804", "demote", "Demote Outline Level"],
] as const satisfies readonly (readonly [string, SwNavigatorHeadingCommand, string])[];

const trackingLabels = {
  table: ["table-tracking", "Table Tracking"],
  bookmark: ["bookmark-tracking", "Bookmark Tracking"],
  hyperlink: ["hyperlink-tracking", "Hyperlink Tracking"],
  comment: ["comment-tracking", "Comment Tracking"],
} as const;

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
    hasContents,
    label,
    toggleOutlineBranch,
    goTo,
    selectContent,
    readOnly,
    canDeleteTable,
    runHeadingCommand,
    deleteBookmarks,
    editContent,
    renameContent,
    deleteContent,
    setOutlineLevel,
    collapseCategories,
  }: NavigatorMenuOptions,
): readonly PopupMenuItemPlacement[] {
  const items: PopupMenuItemPlacement[] = [];
  const alphabetical = tree.IsAlphabeticSort(type);
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
    if (type === "table" && !readOnly)
      items.push({
        kind: "local",
        id: "805",
        label: label("select", "Select"),
        semantics: "action",
        activate: selectContent,
      });
    if (type === "outline" && !alphabetical)
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
  if (!group && !readOnly && (type === "table" || type === "hyperlink" || type === "comment"))
    items.push({
      kind: "local",
      id: "403",
      label: label("edit-entry", "Edit…"),
      semantics: "action",
      activate: editContent,
    });
  if (type === "table" && canDeleteTable)
    items.push({
      kind: "local",
      id: group ? "deletealltables" : "deletetable",
      label: group
        ? label("delete-all-tables", "Delete All Tables")
        : label("delete-table", "Delete Table"),
      semantics: "action",
      activate: deleteContent,
    });
  if (type === "bookmark" && hasContents)
    items.push({
      kind: "local",
      id: group ? "deleteallbookmarks" : "deletebookmark",
      label: group
        ? label("delete-all-bookmarks", "Delete All Bookmarks")
        : label("delete-bookmark", "Delete Bookmark"),
      semantics: "action",
      activate: deleteBookmarks,
    });

  if (!group && type === "hyperlink")
    items.push({
      kind: "local",
      id: "deletehyperlink",
      label: label("delete-hyperlink", "Delete Hyperlink"),
      semantics: "action",
      activate: deleteContent,
    });
  if (type === "comment" && hasContents)
    items.push({
      kind: "local",
      id: group ? "deleteallcomments" : "deletecomment",
      label: group
        ? label("delete-all-comments", "Delete All Comments")
        : label("delete-comment", "Delete Comment"),
      semantics: "action",
      activate: deleteContent,
    });
  if (!group && !readOnly && type === "table")
    items.push({
      kind: "local",
      id: "502",
      label: label("rename", "Rename"),
      semantics: "action",
      activate: renameContent,
    });
  if (!group || ((type === "bookmark" || type === "comment") && hasContents))
    items.push({ kind: "separator" });
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
    const [key, fallback] = trackingLabels[type];
    items.push({
      kind: "local",
      id: `${type}tracking`,
      label: label(key, fallback),
      semantics: "check",
      checked,
      activate: /** Toggles tracking for the current category. @returns Nothing. */ () =>
        tree.SetContentTypeTracking(type, !checked),
    });
  }
  if (group)
    items.push(
      {
        kind: "local",
        id: "sort",
        label: label("display-alphabetically", "Display Alphabetically"),
        semantics: "check",
        checked: alphabetical,
        activate: /** Changes the native display order for this category. @returns Nothing. */ () =>
          tree.SetAlphabeticSort(type, !alphabetical),
      },
      { kind: "separator" },
    );
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
