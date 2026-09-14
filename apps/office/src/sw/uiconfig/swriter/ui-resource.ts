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

/** Preserves a resource position whose feature is unavailable. */
export interface WriterUnavailablePlacement {
  readonly kind: "unavailable";
  readonly label: string;
}

/** Separates adjacent command groups. */
export interface WriterSeparatorPlacement {
  readonly kind: "separator";
}

/** All supported declarative menu item shapes. */
export type WriterMenuItemPlacement =
  | WriterCommandPlacement
  | WriterSeparatorPlacement
  | WriterSubmenuPlacement
  | WriterUnavailablePlacement;

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
  | Readonly<{ kind: "unavailable-control"; label: string; value: string }>;
