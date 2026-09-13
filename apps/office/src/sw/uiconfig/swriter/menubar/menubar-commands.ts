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

/** Describes one Writer list-level command placed after default list commands in the Bullets and Numbering submenu. */
export interface WriterListLevelMenuCommand {
  /** Semantic level transition applied to the focused Writer list paragraph. */
  readonly command: "demote" | "promote";
  /** Stable accessible command label matching the pinned Writer command. */
  readonly label: string;
  /** LibreOffice UNO command retained for parity evidence and later dispatch expansion. */
  readonly unoCommand: ".uno:DecrementLevel" | ".uno:IncrementLevel";
}

/** Describes one current user-executable command and its owning capability record. */
export interface WriterUserCommandInventoryRecord {
  /** Stable runtime command identity independent of its menu or toolbar placement. */
  readonly id: string;
  /** Current accessible command label. */
  readonly label: string;
  /** Domain-agnostic capability record that classifies this command. */
  readonly capabilityId: `CAP-${string}`;
}

/** Stable command IDs for every current Writer menu, toolbar, and shortcut action. */
export const WRITER_COMMAND_IDS = {
  alignCenter: "writer.format.align-center",
  alignJustify: "writer.format.justify",
  alignLeft: "writer.format.align-left",
  alignRight: "writer.format.align-right",
  bold: "writer.format.bold",
  copy: "writer.edit.copy",
  cut: "writer.edit.cut",
  defaultParagraphStyle: "writer.style.default-paragraph",
  demote: "writer.list.demote",
  exportText: "writer.file.export-text",
  headingOne: "writer.style.heading-one",
  italic: "writer.format.italic",
  newDocument: "writer.file.new",
  openLocal: "writer.file.open-local",
  openOdt: "writer.file.open-odt",
  orderedList: "writer.list.default-numbering",
  paste: "writer.edit.paste",
  promote: "writer.list.promote",
  redo: "writer.redo",
  removeBullets: "writer.list.remove-bullets",
  saveLocal: "writer.file.save-local",
  saveOdt: "writer.file.save-odt",
  selectAll: "writer.edit.select-all",
  toggleHorizontalRuler: "writer.view.horizontal-ruler",
  toggleSidebar: "writer.view.sidebar",
  toggleStatusBar: "writer.view.status-bar",
  underline: "writer.format.underline",
  undo: "writer.undo",
  unorderedList: "writer.list.default-bullet",
} as const;

/** Complete Stage 0 inventory of current Writer runtime command IDs. */
export const writerUserCommands: readonly WriterUserCommandInventoryRecord[] = [
  { capabilityId: "CAP-0112", id: WRITER_COMMAND_IDS.alignCenter, label: "Align center" },
  { capabilityId: "CAP-0112", id: WRITER_COMMAND_IDS.alignJustify, label: "Justify paragraph" },
  { capabilityId: "CAP-0112", id: WRITER_COMMAND_IDS.alignLeft, label: "Align left" },
  { capabilityId: "CAP-0112", id: WRITER_COMMAND_IDS.alignRight, label: "Align right" },
  { capabilityId: "CAP-0109", id: WRITER_COMMAND_IDS.bold, label: "Bold" },
  { capabilityId: "CAP-0106", id: WRITER_COMMAND_IDS.copy, label: "Copy" },
  { capabilityId: "CAP-0110", id: WRITER_COMMAND_IDS.cut, label: "Cut" },
  {
    capabilityId: "CAP-0112",
    id: WRITER_COMMAND_IDS.defaultParagraphStyle,
    label: "Default Paragraph Style",
  },
  { capabilityId: "CAP-0107", id: WRITER_COMMAND_IDS.demote, label: "Demote" },
  { capabilityId: "CAP-0101", id: WRITER_COMMAND_IDS.exportText, label: "Save as text" },
  { capabilityId: "CAP-0112", id: WRITER_COMMAND_IDS.headingOne, label: "Heading 1" },
  { capabilityId: "CAP-0109", id: WRITER_COMMAND_IDS.italic, label: "Italic" },
  { capabilityId: "CAP-0114", id: WRITER_COMMAND_IDS.newDocument, label: "New" },
  { capabilityId: "CAP-0114", id: WRITER_COMMAND_IDS.openLocal, label: "Open local copy" },
  { capabilityId: "CAP-0113", id: WRITER_COMMAND_IDS.openOdt, label: "Open ODT" },
  { capabilityId: "CAP-0105", id: WRITER_COMMAND_IDS.orderedList, label: "Ordered List" },
  { capabilityId: "CAP-0110", id: WRITER_COMMAND_IDS.paste, label: "Paste" },
  { capabilityId: "CAP-0107", id: WRITER_COMMAND_IDS.promote, label: "Promote" },
  { capabilityId: "CAP-0102", id: WRITER_COMMAND_IDS.redo, label: "Redo" },
  { capabilityId: "CAP-0105", id: WRITER_COMMAND_IDS.removeBullets, label: "Remove Bullets" },
  { capabilityId: "CAP-0114", id: WRITER_COMMAND_IDS.saveLocal, label: "Save local copy" },
  { capabilityId: "CAP-0113", id: WRITER_COMMAND_IDS.saveOdt, label: "Save as ODT" },
  { capabilityId: "CAP-0103", id: WRITER_COMMAND_IDS.selectAll, label: "Select All" },
  {
    capabilityId: "CAP-0104",
    id: WRITER_COMMAND_IDS.toggleHorizontalRuler,
    label: "Horizontal ruler",
  },
  { capabilityId: "CAP-0104", id: WRITER_COMMAND_IDS.toggleSidebar, label: "Sidebar" },
  { capabilityId: "CAP-0104", id: WRITER_COMMAND_IDS.toggleStatusBar, label: "Status Bar" },
  { capabilityId: "CAP-0109", id: WRITER_COMMAND_IDS.underline, label: "Underline" },
  { capabilityId: "CAP-0102", id: WRITER_COMMAND_IDS.undo, label: "Undo" },
  { capabilityId: "CAP-0105", id: WRITER_COMMAND_IDS.unorderedList, label: "Unordered List" },
];

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

/** Lists pinned Writer Promote and Demote commands in the Bullets and Numbering submenu. */
export const writerListLevelMenuCommands: readonly WriterListLevelMenuCommand[] = [
  { command: "demote", label: "Demote", unoCommand: ".uno:DecrementLevel" },
  { command: "promote", label: "Promote", unoCommand: ".uno:IncrementLevel" },
];
