/** @fileoverview Declares the supported Writer menu hierarchy in pinned LibreOffice resource order. */
import type { WriterMenuPlacement } from "../ui-resource";
import { WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { getWriterCommandResource } from "../writer-command-resources";

/** Creates a stable style command ID. @param styleId - Model style ID. @returns Command ID. */
export function getWriterParagraphStyleCommandId(styleId: string): string {
  const style = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Matches a Writer style identity. @param candidate - Supported style. @returns Whether IDs match. */
    (candidate) => candidate.id === styleId,
  );
  if (style === undefined) throw new Error(`Unknown Writer paragraph style: ${styleId}`);
  const programmaticName = style.name === "Standard" ? "Default Paragraph Style" : style.name;
  return `.uno:StyleApply?Style:string=${encodeURIComponent(programmaticName)}&FamilyName:string=ParagraphStyles`;
}

export const WRITER_COMMAND_IDS = {
  alignCenter: ".uno:CenterPara",
  alignJustify: ".uno:JustifyPara",
  alignLeft: ".uno:StartPara",
  alignRight: ".uno:EndPara",
  bold: ".uno:Bold",
  copy: ".uno:Copy",
  cut: ".uno:Cut",
  fontName: ".uno:CharFontName",
  defaultParagraphStyle:
    ".uno:StyleApply?Style:string=Default%20Paragraph%20Style&FamilyName:string=ParagraphStyles",
  demote: ".uno:DecrementLevel",
  exportText: ".uno:ExportTo",
  editHyperlink: ".uno:EditHyperlink",
  headingOne: ".uno:StyleApply?Style:string=Heading%201&FamilyName:string=ParagraphStyles",
  italic: ".uno:Italic",
  hyperlinkDialog: ".uno:HyperlinkDialog",
  newDocument: ".uno:AddDirect",
  openLocal: "vnd.vite-office.browser:OpenLocal",
  openOdt: ".uno:Open",
  orderedList: ".uno:DefaultNumbering",
  paste: ".uno:Paste",
  promote: ".uno:IncrementLevel",
  redo: ".uno:Redo",
  removeHyperlink: ".uno:RemoveHyperlink",
  removeBullets: ".uno:RemoveBullets",
  saveLocal: "vnd.vite-office.browser:SaveLocal",
  saveOdt: ".uno:SaveAs",
  selectAll: ".uno:SelectAll",
  toggleHorizontalRuler: ".uno:Ruler",
  toggleSidebar: ".uno:Sidebar",
  toggleStatusBar: ".uno:StatusBarVisible",
  underline: ".uno:Underline",
  undo: ".uno:Undo",
  unorderedList: ".uno:DefaultBullet",
} as const;

/** Inventory projection retained for parity validation; generated resources own UI metadata. */
export const writerUserCommands: readonly Readonly<{
  capabilityId: `CAP-${string}`;
  id: string;
  label: string;
}>[] = [
  ["CAP-0112", WRITER_COMMAND_IDS.alignCenter],
  ["CAP-0112", WRITER_COMMAND_IDS.alignJustify],
  ["CAP-0112", WRITER_COMMAND_IDS.alignLeft],
  ["CAP-0112", WRITER_COMMAND_IDS.alignRight],
  ["CAP-0109", WRITER_COMMAND_IDS.bold],
  ["CAP-0106", WRITER_COMMAND_IDS.copy],
  ["CAP-0110", WRITER_COMMAND_IDS.cut],
  ["CAP-0112", WRITER_COMMAND_IDS.defaultParagraphStyle],
  ["CAP-0107", WRITER_COMMAND_IDS.demote],
  ["CAP-0101", WRITER_COMMAND_IDS.exportText],
  ["CAP-0135", WRITER_COMMAND_IDS.editHyperlink],
  ["CAP-0112", WRITER_COMMAND_IDS.headingOne],
  ["CAP-0109", WRITER_COMMAND_IDS.italic],
  ["CAP-0135", WRITER_COMMAND_IDS.hyperlinkDialog],
  ["CAP-0114", WRITER_COMMAND_IDS.newDocument],
  ["CAP-0114", WRITER_COMMAND_IDS.openLocal],
  ["CAP-0113", WRITER_COMMAND_IDS.openOdt],
  ["CAP-0105", WRITER_COMMAND_IDS.orderedList],
  ["CAP-0110", WRITER_COMMAND_IDS.paste],
  ["CAP-0107", WRITER_COMMAND_IDS.promote],
  ["CAP-0102", WRITER_COMMAND_IDS.redo],
  ["CAP-0135", WRITER_COMMAND_IDS.removeHyperlink],
  ["CAP-0105", WRITER_COMMAND_IDS.removeBullets],
  ["CAP-0114", WRITER_COMMAND_IDS.saveLocal],
  ["CAP-0113", WRITER_COMMAND_IDS.saveOdt],
  ["CAP-0103", WRITER_COMMAND_IDS.selectAll],
  ["CAP-0104", WRITER_COMMAND_IDS.toggleHorizontalRuler],
  ["CAP-0104", WRITER_COMMAND_IDS.toggleSidebar],
  ["CAP-0104", WRITER_COMMAND_IDS.toggleStatusBar],
  ["CAP-0109", WRITER_COMMAND_IDS.underline],
  ["CAP-0102", WRITER_COMMAND_IDS.undo],
  ["CAP-0105", WRITER_COMMAND_IDS.unorderedList],
].map(
  /** Converts the compact audit tuple to its named inventory record. @param tuple - Capability and command identity. @returns Inventory record. */ ([
    capabilityId,
    id,
  ]) => ({
    capabilityId: capabilityId as `CAP-${string}`,
    id: id as string,
    label: getWriterCommandResource(id as string).label,
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
