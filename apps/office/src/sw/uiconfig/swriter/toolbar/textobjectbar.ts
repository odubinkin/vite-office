/** @fileoverview Declares the supported subset of pinned Writer `textobjectbar.xml` placement data. */
import { WRITER_COMMAND_IDS } from "../menubar/menubar-commands";
import type { WriterToolbarItemPlacement } from "../ui-resource";

export const writerTextObjectBarItems: readonly WriterToolbarItemPlacement[] = [
  {
    kind: "command-select",
    label: "Paragraph style",
    options: [WRITER_COMMAND_IDS.defaultParagraphStyle, WRITER_COMMAND_IDS.headingOne],
  },
  { kind: "unavailable-control", label: "Font name", value: "System font" },
  { commandId: WRITER_COMMAND_IDS.bold, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.italic, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.underline, kind: "command" },
  { kind: "separator" },
  { commandId: WRITER_COMMAND_IDS.alignLeft, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.alignCenter, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.alignRight, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.alignJustify, kind: "command" },
  { kind: "separator" },
  { commandId: WRITER_COMMAND_IDS.unorderedList, kind: "command" },
  { commandId: WRITER_COMMAND_IDS.orderedList, kind: "command" },
];
