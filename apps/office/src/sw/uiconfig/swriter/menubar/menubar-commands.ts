/** @fileoverview Declares the supported Writer menu hierarchy in pinned LibreOffice resource order. */
import type { WriterMenuPlacement } from "../ui-resource";
import { WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";

/** Creates a stable style command ID. @param styleId - Model style ID. @returns Command ID. */
export function getWriterParagraphStyleCommandId(styleId: string): string {
  return styleId === "default"
    ? "writer.style.default-paragraph"
    : styleId === "heading-1"
      ? "writer.style.heading-one"
      : `writer.style.${styleId}`;
}

export const WRITER_COMMAND_IDS = {
  alignCenter: "writer.format.align-center",
  alignJustify: "writer.format.justify",
  alignLeft: "writer.format.align-left",
  alignRight: "writer.format.align-right",
  bold: "writer.format.bold",
  copy: "writer.edit.copy",
  cut: "writer.edit.cut",
  fontName: "writer.format.font-name",
  defaultParagraphStyle: "writer.style.default-paragraph",
  demote: "writer.list.demote",
  exportText: "writer.file.export-text",
  editHyperlink: "writer.edit.hyperlink",
  headingOne: "writer.style.heading-one",
  italic: "writer.format.italic",
  hyperlinkDialog: "writer.insert.hyperlink",
  newDocument: "writer.file.new",
  openLocal: "writer.file.open-local",
  openOdt: "writer.file.open-odt",
  orderedList: "writer.list.default-numbering",
  paste: "writer.edit.paste",
  promote: "writer.list.promote",
  redo: "writer.redo",
  removeHyperlink: "writer.edit.remove-hyperlink",
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

/** Inventory projection retained for parity validation; executable descriptors own UI metadata. */
export const writerUserCommands: readonly Readonly<{
  capabilityId: `CAP-${string}`;
  id: string;
  label: string;
}>[] = [
  ["CAP-0112", WRITER_COMMAND_IDS.alignCenter, "Align center"],
  ["CAP-0112", WRITER_COMMAND_IDS.alignJustify, "Justify paragraph"],
  ["CAP-0112", WRITER_COMMAND_IDS.alignLeft, "Align left"],
  ["CAP-0112", WRITER_COMMAND_IDS.alignRight, "Align right"],
  ["CAP-0109", WRITER_COMMAND_IDS.bold, "Bold"],
  ["CAP-0106", WRITER_COMMAND_IDS.copy, "Copy"],
  ["CAP-0110", WRITER_COMMAND_IDS.cut, "Cut"],
  ["CAP-0112", WRITER_COMMAND_IDS.defaultParagraphStyle, "Default Paragraph Style"],
  ["CAP-0107", WRITER_COMMAND_IDS.demote, "Demote"],
  ["CAP-0101", WRITER_COMMAND_IDS.exportText, "Save as text"],
  ["CAP-0135", WRITER_COMMAND_IDS.editHyperlink, "Edit Hyperlink"],
  ["CAP-0112", WRITER_COMMAND_IDS.headingOne, "Heading 1"],
  ["CAP-0109", WRITER_COMMAND_IDS.italic, "Italic"],
  ["CAP-0135", WRITER_COMMAND_IDS.hyperlinkDialog, "Hyperlink"],
  ["CAP-0114", WRITER_COMMAND_IDS.newDocument, "New"],
  ["CAP-0114", WRITER_COMMAND_IDS.openLocal, "Open local copy"],
  ["CAP-0113", WRITER_COMMAND_IDS.openOdt, "Open ODT"],
  ["CAP-0105", WRITER_COMMAND_IDS.orderedList, "Ordered List"],
  ["CAP-0110", WRITER_COMMAND_IDS.paste, "Paste"],
  ["CAP-0107", WRITER_COMMAND_IDS.promote, "Promote"],
  ["CAP-0102", WRITER_COMMAND_IDS.redo, "Redo"],
  ["CAP-0135", WRITER_COMMAND_IDS.removeHyperlink, "Remove Hyperlink"],
  ["CAP-0105", WRITER_COMMAND_IDS.removeBullets, "Remove Bullets"],
  ["CAP-0114", WRITER_COMMAND_IDS.saveLocal, "Save local copy"],
  ["CAP-0113", WRITER_COMMAND_IDS.saveOdt, "Save as ODT"],
  ["CAP-0103", WRITER_COMMAND_IDS.selectAll, "Select All"],
  ["CAP-0104", WRITER_COMMAND_IDS.toggleHorizontalRuler, "Horizontal ruler"],
  ["CAP-0104", WRITER_COMMAND_IDS.toggleSidebar, "Sidebar"],
  ["CAP-0104", WRITER_COMMAND_IDS.toggleStatusBar, "Status Bar"],
  ["CAP-0109", WRITER_COMMAND_IDS.underline, "Underline"],
  ["CAP-0102", WRITER_COMMAND_IDS.undo, "Undo"],
  ["CAP-0105", WRITER_COMMAND_IDS.unorderedList, "Unordered List"],
].map(
  /** Converts the compact audit tuple to its named inventory record. @param tuple - Capability, command identity, and label. @returns Inventory record. */ ([
    capabilityId,
    id,
    label,
  ]) => ({
    capabilityId: capabilityId as `CAP-${string}`,
    id: id as string,
    label: label as string,
  }),
);

const unavailable = [
  { kind: "unavailable", label: "No browser command is implemented here yet." },
] as const;

export const writerMenuPlacements: readonly WriterMenuPlacement[] = [
  {
    id: "file",
    label: "File",
    items: [
      { commandId: WRITER_COMMAND_IDS.newDocument, kind: "command" },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.openOdt, kind: "command", showsDialog: true },
      { commandId: WRITER_COMMAND_IDS.openLocal, kind: "command", showsDialog: true },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.saveOdt, kind: "command", showsDialog: true },
      { commandId: WRITER_COMMAND_IDS.saveLocal, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.exportText, kind: "command", showsDialog: true },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { commandId: WRITER_COMMAND_IDS.undo, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.redo, kind: "command" },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.cut, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.copy, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.paste, kind: "command" },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.editHyperlink, kind: "command", showsDialog: true },
      { commandId: WRITER_COMMAND_IDS.removeHyperlink, kind: "command" },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.selectAll, kind: "command" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { commandId: WRITER_COMMAND_IDS.toggleStatusBar, kind: "command" },
      {
        id: "rulers",
        items: [{ commandId: WRITER_COMMAND_IDS.toggleHorizontalRuler, kind: "command" }],
        kind: "submenu",
        label: "Rulers",
      },
      { commandId: WRITER_COMMAND_IDS.toggleSidebar, kind: "command" },
    ],
  },
  {
    id: "insert",
    items: [{ commandId: WRITER_COMMAND_IDS.hyperlinkDialog, kind: "command", showsDialog: true }],
    label: "Insert",
  },
  {
    id: "format",
    label: "Format",
    items: [
      {
        id: "text",
        items: [
          { commandId: WRITER_COMMAND_IDS.bold, kind: "command" },
          { commandId: WRITER_COMMAND_IDS.italic, kind: "command" },
          { commandId: WRITER_COMMAND_IDS.underline, kind: "command" },
        ],
        kind: "submenu",
        label: "Text",
      },
      { kind: "separator" },
      { commandId: WRITER_COMMAND_IDS.alignLeft, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.alignCenter, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.alignRight, kind: "command" },
      { commandId: WRITER_COMMAND_IDS.alignJustify, kind: "command" },
      { kind: "separator" },
      {
        id: "bullets-and-numbering",
        items: [
          { commandId: WRITER_COMMAND_IDS.unorderedList, kind: "command" },
          { commandId: WRITER_COMMAND_IDS.orderedList, kind: "command" },
          { commandId: WRITER_COMMAND_IDS.removeBullets, kind: "command" },
          { kind: "separator" },
          { commandId: WRITER_COMMAND_IDS.demote, kind: "command" },
          { commandId: WRITER_COMMAND_IDS.promote, kind: "command" },
        ],
        kind: "submenu",
        label: "Bullets and Numbering",
      },
    ],
  },
  {
    id: "styles",
    label: "Styles",
    items: [
      ...WRITER_PARAGRAPH_STYLE_POOL.map(
        /** Places one style command. @param style - Pool style. @returns Placement. */ (
          style,
        ) => ({
          commandId: getWriterParagraphStyleCommandId(style.id),
          kind: "command" as const,
        }),
      ),
    ],
  },
  { id: "table", items: unavailable, label: "Table" },
  { id: "tools", items: unavailable, label: "Tools" },
  { id: "window", items: unavailable, label: "Window" },
  { id: "help", items: unavailable, label: "Help" },
];

/** Collects nested command IDs in resource order. @param items - Menu items to traverse. @returns Ordered command IDs. */
function collectCommandIds(items: WriterMenuPlacement["items"]): string[] {
  return items.flatMap(
    /** Collects one nested resource item. @param item - Resource item. @returns Referenced command IDs. */ (
      item,
    ): string[] =>
      item.kind === "command"
        ? [item.commandId]
        : item.kind === "submenu"
          ? collectCommandIds(item.items)
          : [],
  );
}

export const writerMenuCommandIds = writerMenuPlacements.flatMap(
  /** Collects command identities from one top-level menu. @param menu - Menu resource. @returns Ordered command IDs. */ (
    menu,
  ) => collectCommandIds(menu.items),
);
