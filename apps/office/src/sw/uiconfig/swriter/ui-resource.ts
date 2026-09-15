/** @fileoverview Defines presentation-free Writer UI placement records corresponding to LibreOffice resources. */
/** Places one executable command. */
export interface WriterCommandPlacement {
  readonly commandId: string;
  readonly kind: "command";
  readonly showsDialog?: boolean;
}

/** Places a labelled nested menu. */
export interface WriterSubmenuPlacement {
  readonly id: string;
  readonly items: readonly WriterMenuItemPlacement[];
  readonly kind: "submenu";
  readonly label: string;
}

/** Separates adjacent command groups. */
export interface WriterSeparatorPlacement {
  readonly kind: "separator";
}

/** All supported declarative menu item shapes. */
export type WriterMenuItemPlacement =
  WriterCommandPlacement | WriterSeparatorPlacement | WriterSubmenuPlacement;

/** Declares one top-level menu and its ordered items. */
export interface WriterMenuPlacement {
  readonly id: string;
  readonly items: readonly WriterMenuItemPlacement[];
  readonly label: string;
}

/** All supported declarative toolbar item shapes. */
export type WriterToolbarItemPlacement =
  | WriterCommandPlacement
  | WriterSeparatorPlacement
  | Readonly<{ kind: "command-select"; label: string; options: readonly string[] }>
  | Readonly<{ commandId: string; kind: "font-select"; label: string }>;

/** Removes separators orphaned when hidden or unsupported toolbar commands are filtered. @param items - Filtered placements. @returns Normalized placements. */
export function normalizeWriterToolbarItems(
  items: readonly WriterToolbarItemPlacement[],
): readonly WriterToolbarItemPlacement[] {
  const normalized: WriterToolbarItemPlacement[] = [];
  for (const item of items) {
    if (
      item.kind === "separator" &&
      (normalized.length === 0 || normalized.at(-1)?.kind === "separator")
    )
      continue;
    normalized.push(item);
  }
  if (normalized.at(-1)?.kind === "separator") normalized.pop();
  return normalized;
}
