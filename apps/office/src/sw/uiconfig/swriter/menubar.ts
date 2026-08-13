/**
 * @fileoverview Declares the browser Writer top-level menu order from the LibreOffice Writer `sw/uiconfig/swriter/menubar` ownership boundary without reproducing native XML resources.
 */

/** Identifies one visible top-level Writer menu in the pinned Writer menu-bar order. */
export type WriterTopLevelMenu =
  "edit" | "file" | "format" | "help" | "insert" | "styles" | "table" | "tools" | "view" | "window";

/** Describes one browser-visible Writer menu placement derived from its pinned LibreOffice configuration region. */
export interface WriterMenuPlacement {
  /** Stable literal used to identify the Writer menu and its popup. */
  readonly id: WriterTopLevelMenu;
  /** Reader-facing top-level Writer menu title. */
  readonly label: string;
}

/** Describes one current default-list command positioned in Writer's Format → Bullets and Numbering menu. */
export interface WriterBulletsAndNumberingMenuCommand {
  /** Supported list presentation requested by the command. */
  readonly listKind: "bullet" | "none" | "numbered";
  /** Stable accessible label derived from the matching Writer command. */
  readonly label: string;
  /** LibreOffice UNO command retained for parity evidence and later dispatch expansion. */
  readonly unoCommand: ".uno:DefaultBullet" | ".uno:DefaultNumbering" | ".uno:RemoveBullets";
}

/** Lists the pinned Writer top-level menu order shared by browser menu rendering and parity documentation. */
export const writerMenuPlacements: readonly WriterMenuPlacement[] = [
  { id: "file", label: "File" },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { id: "insert", label: "Insert" },
  { id: "format", label: "Format" },
  { id: "styles", label: "Styles" },
  { id: "table", label: "Table" },
  { id: "tools", label: "Tools" },
  { id: "window", label: "Window" },
  { id: "help", label: "Help" },
];

/** Lists the first browser-executable commands from the pinned Writer Bullets and Numbering menu. */
export const writerBulletsAndNumberingMenuCommands: readonly WriterBulletsAndNumberingMenuCommand[] =
  [
    { label: "Unordered List", listKind: "bullet", unoCommand: ".uno:DefaultBullet" },
    { label: "Ordered List", listKind: "numbered", unoCommand: ".uno:DefaultNumbering" },
    { label: "Remove Bullets", listKind: "none", unoCommand: ".uno:RemoveBullets" },
  ];
